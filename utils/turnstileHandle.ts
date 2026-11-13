/** Kontrakt imperatywny wrappera React (TurnstileWidget) — używany przez useContactForm i f4b.
 *  Re-eksportowany z `utils/turnstile` (importy bez zmian). */
export interface TurnstileWidgetHandle {
  /** reset + execute + token (rzuca TURNSTILE_NOT_READY/TIMEOUT). Czeka na skrypt, jeśli
   *  widget jeszcze się ładuje (tryb `defer`). */
  getToken: () => Promise<string>;
  reset: () => void;
  /** Zacznij ładować skrypt i renderować widget (tryb `defer`, pierwsza interakcja). */
  prepare?: () => void;
}
