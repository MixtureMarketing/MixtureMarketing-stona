// Klient podglądu widełek na żywo (MIX-1385, Z5 z MIX-1377; spec MIX-1320 §3, zadanie Z4).
// Jedyne miejsce, które zna kontrakt endpointu `POST /api/estimation/public-preview`:
//   1. pierwsze żądanie niesie token Turnstile (`captcha_token`) → serwer zwraca `preview_token`
//      (podpisany, ważny 15 min: PREVIEW_TOKEN_TTL_SEC w functions/api/estimation/_previewToken.ts)
//      razem z `priceRange`;
//   2. kolejne żądania niosą `preview_token` i zwracają tylko `priceRange`.
// Endpoint (Z4) jeszcze nie istnieje; w testach ten moduł jest atrapą, a Z4 podłącza się tu.
// TODO(MIX-1384): po scaleniu GA4 wywołać trackCalculatorPreview przy udanym podglądzie.
import type { PriceRange } from './calculatorService';
import {
  cleanClientText,
  SCOPE_DESCRIPTION_MAX,
  SCOPE_MAX_ITEMS,
  SCOPE_NAME_MAX,
} from '../lib/estimation/publicScope';

export const PREVIEW_URL = '/api/estimation/public-preview';

export interface PreviewPayload {
  answers: Record<string, unknown>;
  captcha_token?: string;
  preview_token?: string;
}

/** Pozycja listy „Twój zakres" (kontrakt v2, MIX-1790): nazwa i opis obszaru dla klienta. */
export interface ScopeItem {
  client_name: string;
  client_description: string | null;
}

/**
 * Sukces: widełki (+ nowy token podglądu, gdy serwer go wydał; + `scope`, gdy serwer v2 zwrócił
 * zakres); błąd: status HTTP (0 = sieć).
 */
export type PreviewResult =
  | { ok: true; priceRange: PriceRange; previewToken?: string; scope?: ScopeItem[] }
  | { ok: false; status: number };

/**
 * MIX-1790, lista dozwolona (fail-closed): z odpowiedzi bierzemy tylko tablicę obiektów i z każdego
 * tylko `client_name` (tekst, niepusty, ≤ 120 znaków; inaczej pozycja pominięta) i
 * `client_description` (tekst ≤ 500 znaków albo null). Każde inne pole (godziny, ceny) jest
 * odrzucane; nie-tablica = pusta lista; najwyżej 30 pozycji.
 */
export function parseScope(raw: unknown): ScopeItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ScopeItem[] = [];
  for (const it of raw) {
    if (out.length >= SCOPE_MAX_ITEMS) break;
    if (!it || typeof it !== 'object' || Array.isArray(it)) continue;
    const rec = it as Record<string, unknown>;
    const name = cleanClientText(rec.client_name, SCOPE_NAME_MAX);
    if (name === null) continue;
    out.push({
      client_name: name,
      client_description: cleanClientText(rec.client_description, SCOPE_DESCRIPTION_MAX),
    });
  }
  return out;
}

/** Górna granica widełek, które pokażemy (zł). Więcej = odpowiedź uznana za błędną. */
export const MAX_PREVIEW_PLN = 10_000_000;

const isPln = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= MAX_PREVIEW_PLN;

/**
 * Lista dozwolona (fail-closed): widełki tylko gdy `min` i `max` to liczby z zakresu
 * 0…MAX_PREVIEW_PLN i `min <= max`. Brak pola, tekst, NaN, liczba ujemna albo za duża,
 * odwrócone widełki = `null` (pasek pokaże komunikat błędu, nie liczbę z serwera).
 */
export function parsePriceRange(raw: unknown): PriceRange | null {
  if (!raw || typeof raw !== 'object') return null;
  const { min, max } = raw as Record<string, unknown>;
  if (!isPln(min) || !isPln(max) || min > max) return null;
  return { min, max };
}

/**
 * MIX-1466: górny limit czasu jednego zapytania (ms). Po nim zapytanie jest przerywane i wraca
 * jak błąd sieci (status 0), żeby pasek nie wisiał w „Liczę…” bez końca.
 */
export const PREVIEW_TIMEOUT_MS = 4000;

/**
 * Endpoint nie istnieje na tym wdrożeniu (Pages zwraca 404/405 dla ścieżki bez funkcji,
 * 501 = nie obsługujemy). Po takiej odpowiedzi kolejne zapytania nie mają sensu.
 */
export function isPreviewUnavailable(status: number): boolean {
  return status === 404 || status === 405 || status === 501;
}

export async function requestPricePreview(
  payload: PreviewPayload,
  signal?: AbortSignal,
): Promise<PreviewResult> {
  const own = new AbortController();
  const timer = setTimeout(() => own.abort(), PREVIEW_TIMEOUT_MS);
  const onAbort = () => own.abort();
  if (signal?.aborted) own.abort();
  else signal?.addEventListener('abort', onAbort, { once: true });
  try {
    const res = await fetch(PREVIEW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: own.signal,
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data: unknown = await res.json();
    const priceRange = parsePriceRange(
      data && typeof data === 'object' ? (data as Record<string, unknown>).priceRange : undefined,
    );
    if (!priceRange) return { ok: false, status: 500 };
    const rec = data as Record<string, unknown>;
    const token = rec.preview_token;
    return {
      ok: true,
      priceRange,
      previewToken: typeof token === 'string' && token !== '' ? token : undefined,
      // v1 (bez pola) = undefined; v2 = lista po allowliście (może być pusta).
      scope: 'scope' in rec ? parseScope(rec.scope) : undefined,
    };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
