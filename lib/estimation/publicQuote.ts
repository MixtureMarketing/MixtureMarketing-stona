// Publiczna wycena — CZYSTY TS (bez D1/React). Łączy pre-pass rekomendacji archetypu,
// pełny computeQuote i transform publiczny (kontrakt-kalkulator-publiczny.md §3–§5).
// Wiedza wyłącznie z przekazanej biblioteki i parametrów (inwariant 2). Warstwę D1 (loadRawLibrary)
// trzyma functions/api/estimation/_engineDb.ts — tu wszystko jest testowalne bez bazy.
import { evaluateRules } from './engine';
import { computeQuote } from './quote';
import { buildLibraryData, toEngineRules, type RawLibrary } from './toLibraryData';
import { toPublicOffer, pickPublicArchetype, type PublicPriceRange } from './publicOffer';
import type { Answers } from './types';

/** Ostateczny fallback archetypu (kontrakt §5) — najbardziej ogólny; hit tylko przy braku
 *  rekomendacji reguł ORAZ celu spoza mapy. Część specyfikacji publicznego endpointu. */
const GLOBAL_FALLBACK_ARCHETYPE = 'laravel';

export interface PublicConfig {
  widenK: number;
  roundPln: number;
  ratePerHour: number;
  fallbackMap: Record<string, string>;
}

/** Parametry publiczne z est_params (kontrakt §8). Braki → domyślne z kontraktu. */
export function parsePublicConfig(params: { key: string; value: string }[]): PublicConfig {
  const p: Record<string, string> = {};
  for (const r of params) p[r.key] = r.value;
  const num = (k: string, d: number) => {
    const v = Number(p[k]);
    return Number.isFinite(v) ? v : d;
  };
  let fallbackMap: Record<string, string> = {};
  try {
    const j = JSON.parse(p['public_archetype_fallback'] ?? '{}');
    if (j && typeof j === 'object' && !Array.isArray(j)) fallbackMap = j as Record<string, string>;
  } catch {
    /* zły JSON → pusta mapa (global fallback zadziała) */
  }
  return {
    widenK: num('public_widen_k', 0.15),
    roundPln: num('public_round_pln', 500),
    ratePerHour: num('public_rate_per_hour', 5),
    fallbackMap,
  };
}

export interface PublicQuestionDef {
  code: string;
  answer_type: string;
  /** JSON listy opcji `[{value,label}]` (select/multiselect); bez niej odpowiedź = odmowa. */
  options_json?: string | null;
}

/** Limit długości odpowiedzi tekstowej (SPEC-MIX-1320 §6 A9). */
export const PUBLIC_TEXT_MAX = 200;

/** Zakresy pól liczbowych (SPEC-MIX-1320 §6 A10): tylko liczby całkowite w przedziale [min, max].
 *  Pole liczbowe spoza tej listy = odmowa (fail-closed), nie domyślny zakres. */
export const PUBLIC_NUMBER_RANGES: Readonly<Record<string, readonly [number, number]>> = {
  views_count: [1, 500],
  languages: [1, 20],
};

/** Allowlista znaków tekstu: litery, cyfry, spacja i zwykła interpunkcja; bez `<`, `>`, `\`,
 *  znaków sterujących i nowych linii (A9: zero HTML w leadzie, panelu i mailach). */
const TEXT_ALLOWED = /^[\p{L}\p{N} .,;:!?()'"%&+\-/@#*_]*$/u;

/** Wartości opcji z JSON kolumny; zły JSON, brak listy albo wartość nie-string = null. */
function optionValues(raw: string | null | undefined): Set<string> | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const out = new Set<string>();
  for (const o of parsed) {
    const v = (o as { value?: unknown } | null)?.value;
    if (typeof v !== 'string') return null;
    out.add(v);
  }
  return out;
}

export interface SanitizedAnswers {
  answers: Answers;
  /** Komunikaty dla człowieka (kontrakt §3: `errors`). */
  errors: string[];
  /** Stałe kody powodów, równoległe do `errors` (bez wartości od klienta). */
  reasons: string[];
}

/**
 * Waliduje odpowiedzi publiczne (kontrakt §3, SPEC-MIX-1320 §6 A9/A10) jako ALLOWLISTĘ:
 * kod tylko ze zbioru publicznego (obcy kod = odmowa, nie ciche pominięcie), `select` i
 * `multiselect` tylko z listy opcji pytania, `number` tylko całkowita liczba JSON w zakresie z
 * PUBLIC_NUMBER_RANGES, `bool` tylko true/false, `text` ≤ PUBLIC_TEXT_MAX znaków z allowlisty.
 * Nieznany typ pytania, brak listy opcji albo brak zakresu = odmowa (fail-closed).
 * `null` jako wartość = brak odpowiedzi. Wymagane `project_goal`.
 */
export function sanitizePublicAnswers(raw: unknown, defs: PublicQuestionDef[]): SanitizedAnswers {
  const answers: Answers = {};
  const errors: string[] = [];
  const reasons: string[] = [];
  const fail = (reason: string, message: string) => {
    reasons.push(reason);
    errors.push(message);
  };
  if (raw !== undefined && raw !== null && (typeof raw !== 'object' || Array.isArray(raw))) {
    fail('odpowiedzi: nie obiekt', 'Pole „answers" musi być obiektem.');
    return { answers, errors, reasons };
  }
  const byCode = new Map(defs.map((d) => [d.code, d]));
  for (const [code, val] of Object.entries((raw ?? {}) as Record<string, unknown>)) {
    const def = byCode.get(code);
    if (!def) {
      // Kodu od klienta nie wpisujemy do powodu ani komunikatu (może być HTML albo 1 MB).
      fail('kod: spoza listy', 'Odpowiedź na nieznane pytanie.');
      continue;
    }
    if (val === null) continue; // brak odpowiedzi
    switch (def.answer_type) {
      case 'number': {
        const range = PUBLIC_NUMBER_RANGES[code];
        if (!range) fail(`liczba: brak zakresu ${code}`, `Pole „${code}" jest niedostępne.`);
        else if (typeof val !== 'number' || !Number.isInteger(val))
          fail(`liczba: typ ${code}`, `Pole „${code}" musi być liczbą całkowitą.`);
        else if (val < range[0] || val > range[1])
          fail(
            `liczba: zakres ${code}`,
            `Pole „${code}" musi być liczbą od ${range[0]} do ${range[1]}.`,
          );
        else answers[code] = val;
        break;
      }
      case 'bool': {
        if (typeof val !== 'boolean')
          fail(`bool: typ ${code}`, `Pole „${code}" musi być logiczne (tak/nie).`);
        else answers[code] = val;
        break;
      }
      case 'select': {
        const opts = optionValues(def.options_json);
        if (!opts) fail(`opcje: brak listy ${code}`, `Pole „${code}" jest niedostępne.`);
        else if (typeof val !== 'string' || !opts.has(val))
          fail(`opcja: spoza listy ${code}`, `Pole „${code}" ma niedozwoloną wartość.`);
        else answers[code] = val;
        break;
      }
      case 'multiselect': {
        const opts = optionValues(def.options_json);
        if (!opts) fail(`opcje: brak listy ${code}`, `Pole „${code}" jest niedostępne.`);
        else if (!Array.isArray(val)) fail(`opcja: typ ${code}`, `Pole „${code}" musi być listą.`);
        else if (
          val.length > opts.size ||
          new Set(val).size !== val.length ||
          !val.every((x) => typeof x === 'string' && opts.has(x))
        )
          fail(`opcja: spoza listy ${code}`, `Pole „${code}" ma niedozwoloną wartość.`);
        else answers[code] = val as string[];
        break;
      }
      case 'text': {
        if (typeof val !== 'string') fail(`tekst: typ ${code}`, `Pole „${code}" musi być tekstem.`);
        else if (val.length > PUBLIC_TEXT_MAX)
          fail(
            `tekst: za długi ${code}`,
            `Pole „${code}" ma więcej niż ${PUBLIC_TEXT_MAX} znaków.`,
          );
        else if (!TEXT_ALLOWED.test(val))
          fail(`tekst: znaki ${code}`, `Pole „${code}" zawiera niedozwolone znaki.`);
        else answers[code] = val;
        break;
      }
      default:
        fail(`typ: nieznany ${code}`, `Pole „${code}" jest niedostępne.`);
    }
  }
  if (typeof answers.project_goal !== 'string' || answers.project_goal === '')
    fail('wymagane: project_goal', 'Pole „project_goal" jest wymagane.');
  return { answers, errors, reasons };
}

export interface PublicQuoteResult {
  priceRange: PublicPriceRange;
  archetype: { code: string; reason: string };
}

/**
 * Publiczna wycena: rekomendacja archetypu (top-pick reguł, fallback mapa/global) →
 * pełny computeQuote na wybranym archetypie → poszerzone/zaokrąglone widełki publiczne.
 */
export function computePublicQuote(
  rawLib: RawLibrary,
  answers: Answers,
  config: PublicConfig,
): PublicQuoteResult {
  const goal = typeof answers.project_goal === 'string' ? answers.project_goal : undefined;

  // Pre-pass: rekomendacje archetypu (recommend_archetype). Niezależne od domyślnych poziomów,
  // więc archetypeDefaults puste; czytamy WYŁĄCZNIE recommendedArchetypes (kolejność deterministyczna).
  const ruleEval = evaluateRules({
    answers,
    archetypeDefaults: [],
    rules: toEngineRules(rawLib.rules),
    knownAspectCodes: rawLib.aspects.map((a) => a.code),
  });
  const archetype = pickPublicArchetype(
    ruleEval.recommendedArchetypes,
    goal,
    config.fallbackMap,
    GLOBAL_FALLBACK_ARCHETYPE,
  );

  // Pełny compute na wybranym archetypie. answers.archetype ustawione jak w UI/finalize —
  // reguły kluczujące na archetypie (np. #29/#39) widzą tę samą wartość ⇒ parytet.
  const library = buildLibraryData(rawLib, archetype.code, goal);
  const c = computeQuote({ answers: { ...answers, archetype: archetype.code }, library });
  const priceRange = toPublicOffer(c.totals, {
    widenK: config.widenK,
    roundPln: config.roundPln,
  });

  return { priceRange, archetype };
}
