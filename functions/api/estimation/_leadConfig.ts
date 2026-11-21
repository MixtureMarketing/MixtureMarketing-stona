// MIX-1813 (Z10 z MIX-1377, SPEC-MIX-1320 U3 i A14): lead z kalkulatora niesie do CRM gotową
// konfigurację. BEZ onRequest* → NIE jest trasą Pages.
//
// Przełącznik serwera `LEAD_CONFIG_CRM` (allowlista, fail-closed): tylko '1' włącza; brak, '' i
// '0' to dzisiejsze zachowanie bajt w bajt; każda inna wartość też wyłącza i daje linię powodu w
// logu (nieznana wartość nigdy nie włącza nowej ścieżki).
//
// Gdy włączony, `details` leada dostaje (oprócz dzisiejszych `answers` i `priceRange`):
//  - `labels`: pytanie i odpowiedź SŁOWAMI, wyłącznie z danych serwera (tekst pytania z biblioteki,
//    etykieta opcji z `options_json`); etykiet od klienta nie czytamy nigdy;
//  - `config_link`: adres `/wycena/?k=` zakodowany NA SERWERZE z odpowiedzi po allowliście
//    (sanitizePublicAnswers); `k` ani link od klienta nie są czytane ani odbijane;
//  - `plan`: pola planu, gdy serwer je policzył (Z8; dziś brak = pole pominięte);
//  - `phone`: opcjonalny telefon po walidacji i normalizacji (+48…), także w kolumnie `phone`.
import type { Answer, Answers } from '../../../lib/estimation/types';
import type { PublicQuestionDef } from '../../../lib/estimation/publicQuote';
import type { PublicPriceRange } from '../../../lib/estimation/publicOffer';
import type { PublicQuestion } from '../../../services/calculatorService';
import { encodeConfigLink } from '../../../components/features/calculator/configLink';

/** Nazwa zmiennej środowiska serwera (Cloudflare Pages, zmienna Functions). */
export const LEAD_CONFIG_ENV = 'LEAD_CONFIG_CRM';

/** Stały adres kalkulatora w linku (bez nagłówka Host od klienta). */
export const CONFIG_LINK_BASE = 'https://mixturemarketing.pl/wycena/';

export type LeadConfigMode = { on: boolean; reason: string | null };

/** Przełącznik: '1' = on; brak/''/'0' = off; inna wartość = off z linią powodu (fail-closed). */
export function leadConfigSwitch(raw: unknown): LeadConfigMode {
  if (raw === '1') return { on: true, reason: null };
  if (raw === undefined || raw === null || raw === '' || raw === '0')
    return { on: false, reason: null };
  return { on: false, reason: `konfiguracja: ${LEAD_CONFIG_ENV}` };
}

// ---------- telefon ----------

/** Najdłuższy telefon przed normalizacją (znaki); dłuższy = odmowa bez dalszej pracy. */
export const PHONE_RAW_MAX = 32;

/** Powody odmowy (stałe teksty, bez wartości od klienta). */
export const PHONE_REFUSAL = {
  type: 'telefon: zły typ',
  tooLong: `telefon: dłuższy niż ${PHONE_RAW_MAX} znaków`,
  charset: 'telefon: niedozwolone znaki',
  length: 'telefon: zła liczba cyfr',
  plZero: 'telefon: numer polski zaczyna się od 0',
} as const;

export const PHONE_MESSAGE =
  'Podaj poprawny numer telefonu (np. +48 600 700 800) albo zostaw puste.';

/** Dozwolone: opcjonalny „+” na początku, potem cyfry ASCII, spacje, myślniki, kropki, nawiasy. */
const PHONE_ALLOWED = /^\+?[0-9 ().-]+$/;

export type PhoneResult = { ok: true; phone: string | null } | { ok: false; reason: string };

/**
 * Telefon opcjonalny: brak, null albo pusty tekst = `null`. Allowlista znaków, potem normalizacja
 * do E.164: `+` albo `00` + 8–15 cyfr; 9 cyfr bez prefiksu = numer polski (+48); 11 cyfr od 48 = +48.
 * MIX-1877: polski numer krajowy nigdy nie zaczyna się od 0, więc część po 48 od 0 (np. 060070080,
 * +48 060 070 080) to odmowa, a nie zapis `+48060070080`.
 */
export function normalizePhone(raw: unknown): PhoneResult {
  if (raw === undefined || raw === null) return { ok: true, phone: null };
  if (typeof raw !== 'string') return { ok: false, reason: PHONE_REFUSAL.type };
  if (raw.length > PHONE_RAW_MAX) return { ok: false, reason: PHONE_REFUSAL.tooLong };
  const s = raw.trim();
  if (s === '') return { ok: true, phone: null };
  if (!PHONE_ALLOWED.test(s)) return { ok: false, reason: PHONE_REFUSAL.charset };
  const digits = s.replace(/[^0-9]/g, '');
  let e164: string | null = null;
  if (s.startsWith('+')) e164 = digits;
  else if (digits.startsWith('00')) e164 = digits.slice(2);
  else if (digits.length === 9) e164 = `48${digits}`;
  else if (digits.length === 11 && digits.startsWith('48')) e164 = digits;
  if (e164 === null || e164.length < 8 || e164.length > 15 || e164.startsWith('0'))
    return { ok: false, reason: PHONE_REFUSAL.length };
  if (e164.startsWith('480')) return { ok: false, reason: PHONE_REFUSAL.plZero };
  return { ok: true, phone: `+${e164}` };
}

// ---------- etykiety i link ----------

interface OptionLabel {
  value: string;
  label: string;
}

/** Opcje z JSON kolumny (serwer); etykieta pusta albo nie-tekst = wartość opcji. */
function parseOptions(raw: string | null | undefined): OptionLabel[] {
  if (typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: OptionLabel[] = [];
    for (const o of parsed) {
      const rec = (o ?? {}) as { value?: unknown; label?: unknown };
      if (typeof rec.value !== 'string') continue;
      const label =
        typeof rec.label === 'string' && rec.label.trim() !== '' ? rec.label : rec.value;
      out.push({ value: rec.value, label });
    }
    return out;
  } catch {
    return [];
  }
}

export interface LeadLabel {
  code: string;
  question: string;
  answer: string;
}

function answerWords(type: string, value: Answer, options: OptionLabel[]): string | null {
  const byValue = new Map(options.map((o) => [o.value, o.label]));
  if (type === 'select') return typeof value === 'string' ? (byValue.get(value) ?? null) : null;
  if (type === 'multiselect') {
    if (!Array.isArray(value)) return null;
    const words = value.map((v) => byValue.get(v));
    return words.every((w) => typeof w === 'string') ? words.join(', ') : null;
  }
  if (type === 'bool') return typeof value === 'boolean' ? (value ? 'Tak' : 'Nie') : null;
  if (type === 'number') return typeof value === 'number' ? String(value) : null;
  if (type === 'text') return typeof value === 'string' ? value : null;
  return null;
}

/**
 * Odpowiedzi słowami, w kolejności pytań z bazy. `answers` MUSZĄ być już po
 * sanitizePublicAnswers; pytanie bez tekstu w bibliotece dostaje swój kod.
 */
export function buildLabels(
  answers: Answers,
  defs: PublicQuestionDef[],
  questionTexts: { code: string; text?: string | null }[],
): LeadLabel[] {
  const texts = new Map(questionTexts.map((q) => [q.code, q.text]));
  const out: LeadLabel[] = [];
  for (const d of defs) {
    if (!Object.prototype.hasOwnProperty.call(answers, d.code)) continue;
    const words = answerWords(d.answer_type, answers[d.code], parseOptions(d.options_json));
    if (words === null) continue;
    const t = texts.get(d.code);
    out.push({
      code: d.code,
      question: typeof t === 'string' && t !== '' ? t : d.code,
      answer: words,
    });
  }
  return out;
}

/** Link `?k=` zakodowany na serwerze (ten sam koder co przycisk „Skopiuj link”, Z7). */
export function buildConfigLink(answers: Answers, defs: PublicQuestionDef[]): string | null {
  const questions: PublicQuestion[] = defs.map((d) => ({
    code: d.code,
    text: '',
    help_text: null,
    answer_type: d.answer_type,
    options: parseOptions(d.options_json),
    visible_if: null,
    group: null,
    sort_order: 0,
  }));
  const k = encodeConfigLink(questions, answers);
  return k === null ? null : `${CONFIG_LINK_BASE}?k=${k}`;
}

export type LeadPlan = Record<string, string | number>;

/** `details` leada przy włączonym przełączniku (kolejność kluczy stała). */
export function buildLeadDetails(input: {
  answers: Answers;
  priceRange: PublicPriceRange;
  defs: PublicQuestionDef[];
  questionTexts: { code: string; text?: string | null }[];
  plan?: LeadPlan | null;
  phone: string | null;
}): Record<string, unknown> {
  const details: Record<string, unknown> = {
    answers: input.answers,
    priceRange: input.priceRange,
    labels: buildLabels(input.answers, input.defs, input.questionTexts),
  };
  const link = buildConfigLink(input.answers, input.defs);
  if (link !== null) details.config_link = link;
  if (input.plan && Object.keys(input.plan).length > 0) details.plan = { ...input.plan };
  if (input.phone !== null) details.phone = input.phone;
  return details;
}
