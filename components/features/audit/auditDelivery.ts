// Czysta logika kreatora Audytu 360: deep-link `?url=` i stan wysyłki raportu PDF.

/**
 * Adres z deep-linka `?url=`. `URLSearchParams.get()` JUŻ dekoduje wartość — drugi
 * `decodeURIComponent` wywracał stronę (URIError) dla adresów z `%`
 * (`?url=https://sklep.pl/promocja-50%25` → „promocja-50%" → URIError → ErrorBoundary)
 * i psuł `%2F` w ścieżkach. Dekodujemy więc raz; wyjątek: link zakodowany podwójnie
 * (`https%3A%2F%2F…` po pierwszym dekodowaniu) — wtedy jeszcze jedna, bezpieczna próba.
 */
export function readDeepLinkUrl(search: string): string {
  let value: string | null;
  try {
    value = new URLSearchParams(search).get('url');
  } catch {
    return '';
  }
  if (!value) return '';
  value = value.trim();
  if (/^https?%3A/i.test(value)) {
    try {
      value = decodeURIComponent(value);
    } catch {
      /* zostaje wartość po pierwszym dekodowaniu */
    }
  }
  return value;
}

/** Stan wysyłki raportu PDF mailem (capture-lead). `status` -1 = PDF się nie wygenerował. */
export type PdfDelivery =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent'; afterRetry?: boolean }
  | { state: 'failed'; status: number; retrying?: boolean };

export const PDF_NOT_GENERATED = -1;

/** Powód porażki po ludzku (403 captcha, 429 limit, 0 sieć, -1 PDF, reszta = serwer). */
export function deliveryFailureReason(status: number): string {
  switch (status) {
    case 403:
      return 'Weryfikacja antybotowa nie przeszła.';
    case 429:
      return 'Za dużo zgłoszeń w krótkim czasie — odczekaj chwilę.';
    case 0:
      return 'Brak połączenia z serwerem.';
    case PDF_NOT_GENERATED:
      return 'Nie udało się wygenerować pliku PDF.';
    default:
      return 'Wystąpił błąd po naszej stronie.';
  }
}
