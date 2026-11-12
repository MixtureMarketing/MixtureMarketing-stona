// Czysta logika paska widełek na żywo (MIX-1385): przełącznik, klucz pamięci, komunikaty.
// Przełącznik działa jak w `components/pages/abonament/PreonboardModal.tsx:54` (zmienna
// `VITE_MM_*` wstrzykiwana przy budowie; Vite ją inline'uje): domyślnie WYŁĄCZONY, włącza
// go dopiero `VITE_MM_LIVE_PRICE_BAR=1` w środowisku budowy (Cloudflare Pages albo lokalny plik env).

/** Zwłoka (ms) po ostatniej zmianie odpowiedzi, zanim pójdzie zapytanie. */
export const LIVE_PRICE_DEBOUNCE_MS = 400;

/**
 * MIX-1495: najmniejszy odstęp (ms) między dwoma zapytaniami o podgląd. Serwer liczy zapytania
 * w KV, które przyjmuje 1 zapis na sekundę na klucz; szybsze kliknięcia dawałyby błąd 503.
 */
export const LIVE_PRICE_MIN_GAP_MS = 1000;

/** Włączony tylko dla wartości `1` albo `true`; brak, puste i cokolwiek innego = wyłączony. */
export function isLivePriceBarEnabled(
  raw: unknown = import.meta.env.VITE_MM_LIVE_PRICE_BAR,
): boolean {
  return raw === '1' || raw === 'true';
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
