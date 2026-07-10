import type { TurnstileInstance } from '@marsidev/react-turnstile';

// Cloudflare Turnstile token executor z timeoutem.
//
// UWAGA: NIE uzywamy `executeAsync()` — w tej konfiguracji (invisible + execution
// 'execute', react-turnstile 1.5.x) executeAsync() zawiesza sie i nigdy nie zwraca
// tokenu (potwierdzone w przegladarce 2026-07-10: 8s timeout, zero requestow).
// Imperatywne execute() + polling getResponse() dziala niezawodnie na tym samym
// widgecie. W razie braku widgetu lub timeoutu rzucamy oznaczonym bledem, ktory
// hook formularza zlapie i (na localhost) zastapi tokenem testowym.
export const executeTurnstileWithTimeout = async (
  turnstile: TurnstileInstance | null,
  timeoutMs = 15000,
): Promise<string> => {
  if (!turnstile) throw new Error('TURNSTILE_NOT_READY');

  // Wyczysc ewentualny zuzyty/wygasly token i odpal swiezy invisible challenge.
  try {
    turnstile.reset();
  } catch {
    /* reset moze rzucic jesli widget nie w pelni gotowy — ignorujemy */
  }
  turnstile.execute();

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const token = turnstile.getResponse();
    if (token) return token;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('TURNSTILE_TIMEOUT');
};

export const isLocalhost = () => window.location.hostname === 'localhost';
