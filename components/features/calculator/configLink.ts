// MIX-1791 (Z7 z MIX-1377, SPEC-MIX-1320 U5 i A13): link do konfiguracji `/wycena/?k=...`.
// Odpowiedzi są zapisane w adresie (JSON -> UTF-8 -> base64url), bez e-maila i bez zapisu na
// serwerze. Odczyt jest ALLOWLISTĄ, fail-closed:
//  - całość odrzucona (pusty formularz, linia powodu): parametr dłuższy niż CONFIG_LINK_MAX (bez
//    dekodowania), więcej niż jeden parametr `k`, znaki spoza base64url, zły UTF-8 albo JSON, JSON
//    nie będący obiektem, klucz `__proto__` / `constructor` / `prototype`;
//  - pojedyncza odpowiedź pominięta: kod spoza pytań publicznych, opcja spoza listy pytania, zły
//    typ, liczba poza zakresem A10, tekst poza allowlistą A9, nieznany typ pytania.
// Te same reguły stosuje zapis, więc zapis -> odczyt oddaje dokładnie te same odpowiedzi.
// Wartości trafiają do formularza jako dane (React wstawia tekst, nie HTML).
import type { Answers, AnswerValue } from '../../../lib/estimation/types';
import type { PublicQuestion } from '../../../services/calculatorService';
import {
  PUBLIC_NUMBER_RANGES,
  PUBLIC_TEXT_ALLOWED,
  PUBLIC_TEXT_MAX,
} from '../../../lib/estimation/publicLimits';

/** Nazwa parametru w adresie. */
export const CONFIG_LINK_PARAM = 'k';

/**
 * Najdłuższa wartość `k` (znaki). Dłuższa jest odrzucana BEZ dekodowania (A13, forma „za długi
 * parametr"). 1500 znaków base64url = ok. 1100 bajtów JSON: obecny zestaw publiczny (8 pytań)
 * zajmuje poniżej 300 znaków, a cały adres mieści się w bezpiecznych 2000 znakach.
 */
export const CONFIG_LINK_MAX = 1500;

/** Powody odrzucenia całego linku (stałe teksty, bez wartości z adresu). */
export const LINK_REFUSAL = {
  missing: 'link: brak parametru k',
  tooLong: `link: parametr k dłuższy niż ${CONFIG_LINK_MAX} znaków`,
  duplicated: 'link: więcej niż jeden parametr k',
  charset: 'link: znaki spoza base64url',
  encoding: 'link: zły zapis (base64url albo UTF-8)',
  json: 'link: zły JSON',
  notObject: 'link: JSON nie jest obiektem',
  forbiddenKey: 'link: klucz zabroniony (__proto__, constructor, prototype)',
  empty: 'link: brak znanych odpowiedzi',
} as const;

export type ConfigLinkResult =
  { ok: true; answers: Answers; skipped: number } | { ok: false; reason: string };

const B64URL = /^[A-Za-z0-9_-]+$/;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Jedna odpowiedź według allowlisty pytania; `undefined` = odpowiedź pominięta.
 * Te same reguły co serwer (sanitizePublicAnswers), ale pomijamy zamiast odmawiać całości.
 */
export function cleanLinkAnswer(q: PublicQuestion, val: unknown): AnswerValue | undefined {
  const options = new Set((q.options ?? []).map((o) => o.value));
  switch (q.answer_type) {
    case 'bool':
      return typeof val === 'boolean' ? val : undefined;
    case 'select':
      return typeof val === 'string' && options.has(val) ? val : undefined;
    case 'multiselect': {
      if (!Array.isArray(val) || val.length === 0 || val.length > options.size) return undefined;
      if (new Set(val).size !== val.length) return undefined;
      return val.every((x) => typeof x === 'string' && options.has(x))
        ? (val as string[]).slice()
        : undefined;
    }
    case 'number': {
      const range = Object.prototype.hasOwnProperty.call(PUBLIC_NUMBER_RANGES, q.code)
        ? PUBLIC_NUMBER_RANGES[q.code]
        : undefined;
      if (!range || typeof val !== 'number' || !Number.isInteger(val)) return undefined;
      return val >= range[0] && val <= range[1] ? val : undefined;
    }
    case 'text':
      return typeof val === 'string' &&
        val !== '' &&
        val.length <= PUBLIC_TEXT_MAX &&
        PUBLIC_TEXT_ALLOWED.test(val)
        ? val
        : undefined;
    default:
      return undefined;
  }
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(raw: string): string {
  const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/**
 * Wartość `k` dla odpowiedzi: tylko pytania publiczne i odpowiedzi z allowlisty, w kolejności
 * pytań. `null`, gdy nie ma czego zapisać albo zapis byłby dłuższy niż CONFIG_LINK_MAX.
 */
export function encodeConfigLink(questions: PublicQuestion[], answers: Answers): string | null {
  const out: Record<string, AnswerValue> = {};
  for (const q of questions) {
    if (FORBIDDEN_KEYS.has(q.code) || !Object.prototype.hasOwnProperty.call(answers, q.code))
      continue;
    const v = cleanLinkAnswer(q, answers[q.code]);
    if (v !== undefined) out[q.code] = v;
  }
  if (Object.keys(out).length === 0) return null;
  const k = toBase64Url(JSON.stringify(out));
  return k.length > CONFIG_LINK_MAX ? null : k;
}

/** Odczyt wartości `k` (allowlista, fail-closed; patrz komentarz na górze pliku). */
export function decodeConfigLink(
  raw: string | null | undefined,
  questions: PublicQuestion[],
): ConfigLinkResult {
  if (typeof raw !== 'string' || raw === '') return { ok: false, reason: LINK_REFUSAL.missing };
  // Długość PRZED jakimkolwiek dekodowaniem (A13: za długi parametr nie kosztuje CPU).
  if (raw.length > CONFIG_LINK_MAX) return { ok: false, reason: LINK_REFUSAL.tooLong };
  if (!B64URL.test(raw)) return { ok: false, reason: LINK_REFUSAL.charset };
  let text: string;
  try {
    text = fromBase64Url(raw);
  } catch {
    return { ok: false, reason: LINK_REFUSAL.encoding };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: LINK_REFUSAL.json };
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
    return { ok: false, reason: LINK_REFUSAL.notObject };
  const entries = Object.entries(parsed as Record<string, unknown>);
  if (entries.some(([key]) => FORBIDDEN_KEYS.has(key)))
    return { ok: false, reason: LINK_REFUSAL.forbiddenKey };

  const byCode = new Map(questions.map((q) => [q.code, q]));
  const answers: Answers = {};
  let skipped = 0;
  for (const [code, val] of entries) {
    const q = byCode.get(code);
    const v = q ? cleanLinkAnswer(q, val) : undefined;
    if (v === undefined) skipped += 1;
    else answers[code] = v;
  }
  if (Object.keys(answers).length === 0) return { ok: false, reason: LINK_REFUSAL.empty };
  return { ok: true, answers, skipped };
}

/** Odczyt z części `?...` adresu; więcej niż jeden parametr `k` = odrzucenie całości. */
export function readConfigLink(search: string, questions: PublicQuestion[]): ConfigLinkResult {
  const all = new URLSearchParams(search).getAll(CONFIG_LINK_PARAM);
  if (all.length > 1) return { ok: false, reason: LINK_REFUSAL.duplicated };
  return decodeConfigLink(all[0], questions);
}

/** Pełny adres do skopiowania: strona kalkulatora + `?k=`, bez innych parametrów i kotwicy. */
export function buildConfigLinkUrl(pageUrl: string, k: string): string {
  const u = new URL(pageUrl);
  return `${u.origin}${u.pathname}?${CONFIG_LINK_PARAM}=${k}`;
}
