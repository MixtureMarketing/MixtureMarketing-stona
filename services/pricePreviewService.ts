// Klient podglądu widełek na żywo (MIX-1385, Z5 z MIX-1377; spec MIX-1320 §3, zadanie Z4).
// Jedyne miejsce, które zna kontrakt endpointu `POST /api/estimation/public-preview`:
//   1. pierwsze żądanie niesie token Turnstile (`captcha_token`) → serwer zwraca `preview_token`
//      (podpisany, ważny 15 min: PREVIEW_TOKEN_TTL_SEC w functions/api/estimation/_previewToken.ts)
//      razem z `priceRange`;
//   2. kolejne żądania niosą `preview_token` i zwracają tylko `priceRange`.
// Endpoint (Z4) jeszcze nie istnieje; w testach ten moduł jest atrapą, a Z4 podłącza się tu.
// TODO(MIX-1384): po scaleniu GA4 wywołać trackCalculatorPreview przy udanym podglądzie.
import type { PriceRange } from './calculatorService';

export const PREVIEW_URL = '/api/estimation/public-preview';

export interface PreviewPayload {
  answers: Record<string, unknown>;
  captcha_token?: string;
  preview_token?: string;
}

/** Sukces: widełki (+ nowy token podglądu, gdy serwer go wydał); błąd: status HTTP (0 = sieć). */
export type PreviewResult =
  { ok: true; priceRange: PriceRange; previewToken?: string } | { ok: false; status: number };

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
    const token = (data as Record<string, unknown>).preview_token;
    return {
      ok: true,
      priceRange,
      previewToken: typeof token === 'string' && token !== '' ? token : undefined,
    };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
