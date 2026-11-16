// Czysta logika paska widełek na żywo (MIX-1385): przełącznik, klucz pamięci, komunikaty.
// Przełącznik działa jak inne przełączniki budowy (zmienna
// `VITE_MM_*` wstrzykiwana przy budowie; Vite ją inline'uje): domyślnie WYŁĄCZONY, włącza
// go dopiero `VITE_MM_LIVE_PRICE_BAR=1` w środowisku budowy (Cloudflare Pages albo lokalny plik env).

/** Zwłoka (ms) po ostatniej zmianie odpowiedzi, zanim pójdzie zapytanie. */
export const LIVE_PRICE_DEBOUNCE_MS = 400;

/**
 * MIX-1495: najmniejszy odstęp (ms) między dwoma zapytaniami o podgląd. Serwer liczy zapytania
 * w KV, które przyjmuje 1 zapis na sekundę na klucz; szybsze kliknięcia dawałyby błąd 503.
 */
export const LIVE_PRICE_MIN_GAP_MS = 1000;

/**
 * Włączony tylko dla wartości dokładnie `1` (MIX-1846: `true` już nie włącza, tak jak strażnik
 * ci.yml i przełączniki w config/flags.ts); brak, puste i cokolwiek innego = wyłączony.
 */
export function isLivePriceBarEnabled(
  raw: unknown = import.meta.env.VITE_MM_LIVE_PRICE_BAR,
): boolean {
  return raw === '1';
}

/**
 * MIX-1790: podgląd konfiguracji (szkic typu strony + „Twój zakres") za osobnym przełącznikiem
 * `VITE_MM_CONFIG_PREVIEW`, ten sam parser: tylko `1` włącza, reszta wyłącza.
 */
export function isConfigPreviewEnabled(
  raw: unknown = import.meta.env.VITE_MM_CONFIG_PREVIEW,
): boolean {
  return isLivePriceBarEnabled(raw);
}

/**
 * MIX-1791: link do konfiguracji (`/wycena/?k=...`, przyciski „Skopiuj link" i „Udostępnij") za
 * przełącznikiem `VITE_MM_CONFIG_LINK`, ten sam parser: tylko `1` włącza.
 * Wyłączony = brak przycisków i parametr `k` w adresie nie jest czytany.
 */
export function isConfigLinkEnabled(raw: unknown = import.meta.env.VITE_MM_CONFIG_LINK): boolean {
  return isLivePriceBarEnabled(raw);
}

/**
 * MIX-1813 (Z10): „Wyślij i umów rozmowę” z opcjonalnym telefonem za przełącznikiem budowy
 * `VITE_MM_LEAD_CONFIG`, ten sam parser: tylko `1` albo `true` włącza. Konfigurację w leadzie
 * zapisuje serwer dopiero przy `LEAD_CONFIG_CRM=1` (functions/api/estimation/_leadConfig.ts).
 */
export function isLeadConfigEnabled(raw: unknown = import.meta.env.VITE_MM_LEAD_CONFIG): boolean {
  // Bez isLivePriceBarEnabled(raw): brak zmiennej (undefined) włączyłby tam domyślny parametr,
  // czyli wartość VITE_MM_LIVE_PRICE_BAR.
  return raw === '1' || raw === 'true';
}

/**
 * MIX-1814 (Z9, wariant A): harmonogram rozmów z I14 (`CALENDAR_IFRAME_SRC`) pod wynikiem, ładowany
 * dopiero po kliknięciu „Wyślij i umów rozmowę” i zapisie leada. Przełącznik budowy
 * `VITE_MM_BOOKING_EMBED` (tylko `1` włącza) działa wyłącznie razem z `VITE_MM_LEAD_CONFIG`,
 * bo bez niego nie ma przycisku „Wyślij i umów rozmowę”.
 */
export function isBookingEmbedEnabled(
  raw: unknown = import.meta.env.VITE_MM_BOOKING_EMBED,
  leadConfig: unknown = import.meta.env.VITE_MM_LEAD_CONFIG,
): boolean {
  return raw === '1' && isLeadConfigEnabled(leadConfig);
}

/**
 * Klucz pamięci wyników: te same odpowiedzi (niezależnie od kolejności kluczy) = ten sam klucz.
 * Wartości puste i `undefined` nie wchodzą do klucza (tak samo ich nie wysyłamy).
 */
export function answersHash(answers: Record<string, unknown>): string {
  const keys = Object.keys(answers)
    .filter((k) => answers[k] !== undefined && answers[k] !== '')
    .sort();
  return JSON.stringify(keys.map((k) => [k, answers[k]]));
}

/** Komunikat dla klienta po polsku, bez słów technicznych. 429 ma osobny tekst. */
export function previewMessage(status: number): string {
  if (status === 429) {
    return 'Liczymy za często. Odczekaj chwilę, a potem zmień dowolną odpowiedź, to policzymy cenę jeszcze raz.';
  }
  return 'Nie udało się teraz policzyć ceny. Odpowiadaj dalej, widełki pokażemy też na końcu.';
}
