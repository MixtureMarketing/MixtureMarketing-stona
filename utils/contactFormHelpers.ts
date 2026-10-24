import { SITE_CONFIG } from '../config/site';

// Pomocnicze formularza kontaktowego.
//
// Wykonanie Turnstile (reset+execute+poll tokenu) przeniesione do reużywalnego `utils/turnstile.ts`
// (getTurnstileToken po widgetId) — po incydencie 2026-07-16, gdzie inicjalizacja przez
// `@marsidev/react-turnstile` (onload-callback) przegrywała wyścig w SPA/Zaraz i blokowała leady.

export const isLocalhost = () => window.location.hostname === 'localhost';

/** Brak tokenu Turnstile po stronie przeglądarki (widget nie gotowy / wyzwanie nieudane). */
export const CAPTCHA_CLIENT_ERROR_MESSAGE =
  'Weryfikacja bezpieczeństwa (Turnstile) nie powiodła się. Odśwież stronę i spróbuj ponownie.';

/**
 * Komunikat dla użytkownika na podstawie błędu wysyłki formularza. Rozróżnia
 * captchę (403), limit (429), awarię serwera (5xx), brak sieci i złe dane (400).
 * Przyjmuje dowolny błąd z polem `status` (LeadSubmitError z leadService).
 */
export function describeLeadError(err: unknown): string {
  const status =
    err && typeof err === 'object' && 'status' in err && typeof err.status === 'number'
      ? err.status
      : undefined;
  if (status === 0) {
    return 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.';
  }
  if (status === 403) {
    return 'Weryfikacja captcha nie powiodła się. Spróbuj ponownie.';
  }
  if (status === 429) {
    return 'Zbyt wiele prób w krótkim czasie. Odczekaj chwilę i spróbuj ponownie.';
  }
  if (status === 400) {
    return 'Sprawdź poprawność danych w formularzu i spróbuj ponownie.';
  }
  if (status !== undefined && status >= 500) {
    return `Chwilowa awaria serwera — zgłoszenie NIE zostało zapisane. Spróbuj ponownie za chwilę lub zadzwoń: ${SITE_CONFIG.contact.phone}.`;
  }
  return `Nie udało się wysłać formularza. Spróbuj ponownie lub zadzwoń: ${SITE_CONFIG.contact.phone}.`;
}
