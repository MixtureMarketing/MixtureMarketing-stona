import type { TurnstileInstance } from '@marsidev/react-turnstile';

// Globalny obiekt Cloudflare Turnstile (ladowany przez react-turnstile przez api.js).
interface TurnstileGlobal {
  reset: (container?: string) => void;
  execute: (container?: string, options?: unknown) => void;
  getResponse: (container?: string) => string | undefined;
}

// Domyslny kontener react-turnstile (komponent nie przekazuje propa `id`).
// Na danej stronie montuje sie tylko JEDEN widget (inline form LUB modal, nigdy
// oba naraz), wiec ten selektor jest jednoznaczny.
const TURNSTILE_CONTAINER = '#cf-turnstile';

// Cloudflare Turnstile token executor z timeoutem.
//
// UWAGA (zdiagnozowane w przegladarce na produkcji 2026-07-10/11):
// metody REF-a react-turnstile — `executeAsync()`, `execute()`, `getResponse()` —
// w tej konfiguracji (invisible + execution 'execute', react-turnstile 1.5.x) NIE
// dzialaja: executeAsync wisi, ref.execute() nie triggeruje challenge -> brak tokenu
// -> timeout -> 'Weryfikacja Turnstile nieudana', zero requestow do serwera.
// GLOBALNE `window.turnstile.reset/execute/getResponse('#cf-turnstile')` dziala
// niezawodnie (zweryfikowane: zwraca token w kilka sekund). Dlatego uzywamy
// globalnego API zamiast ref-a. Ref sluzy tylko jako sygnal "widget zamontowany".
export const executeTurnstileWithTimeout = async (
  turnstile: TurnstileInstance | null,
  timeoutMs = 20000,
): Promise<string> => {
  if (!turnstile) throw new Error('TURNSTILE_NOT_READY'); // widget jeszcze nie zamontowany
  const ts = (window as unknown as { turnstile?: TurnstileGlobal }).turnstile;
  if (!ts) throw new Error('TURNSTILE_NOT_READY');

  // Wyczysc ewentualny zuzyty/wygasly token i odpal swiezy invisible challenge.
  try {
    ts.reset(TURNSTILE_CONTAINER);
  } catch {
    /* reset moze rzucic jesli widget nie w pelni gotowy — ignorujemy */
  }
  ts.execute(TURNSTILE_CONTAINER);

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const token = ts.getResponse(TURNSTILE_CONTAINER);
    if (token) return token;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('TURNSTILE_TIMEOUT');
};

export const isLocalhost = () => window.location.hostname === 'localhost';
