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
}

/**
 * Filtruje i waliduje odpowiedzi publiczne (kontrakt §3): przepuszcza WYŁĄCZNIE kody ze zbioru
 * publicznego (ochrona przed wstrzyknięciem pytań internal, np. `sla_value`), kontroluje typy
 * i wymaga `project_goal`. Zwraca oczyszczone odpowiedzi + listę błędów walidacji.
 */
export function sanitizePublicAnswers(
  raw: Record<string, unknown> | null | undefined,
  defs: PublicQuestionDef[],
): { answers: Answers; errors: string[] } {
  const byCode = new Map(defs.map((d) => [d.code, d]));
  const answers: Answers = {};
  const errors: string[] = [];
  for (const [code, val] of Object.entries(raw ?? {})) {
    const def = byCode.get(code);
    if (!def || val === null || val === undefined) continue; // spoza public / puste → pomiń
    switch (def.answer_type) {
      case 'number': {
        const n = Number(val);
        if (!Number.isFinite(n)) errors.push(`Pole „${code}" musi być liczbą.`);
        else answers[code] = n;
        break;
      }
      case 'bool': {
        if (typeof val !== 'boolean') errors.push(`Pole „${code}" musi być logiczne (tak/nie).`);
        else answers[code] = val;
        break;
      }
      case 'multiselect': {
        if (!Array.isArray(val)) errors.push(`Pole „${code}" musi być listą.`);
        else answers[code] = val.filter((x): x is string => typeof x === 'string');
        break;
      }
      default: // select / text
        answers[code] = typeof val === 'string' ? val : String(val);
    }
  }
  if (typeof answers.project_goal !== 'string' || answers.project_goal === '')
    errors.push('Pole „project_goal" jest wymagane.');
  return { answers, errors };
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
