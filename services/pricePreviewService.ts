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
    const data = (await res.json()) as {
      priceRange?: PriceRange;
      preview_token?: string;
    };
    const pr = data.priceRange;
    if (!pr || !Number.isFinite(pr.min) || !Number.isFinite(pr.max)) {
      return { ok: false, status: 500 };
    }
    return { ok: true, priceRange: { min: pr.min, max: pr.max }, previewToken: data.preview_token };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
