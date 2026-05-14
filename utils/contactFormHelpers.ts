import type { TurnstileInstance } from '@marsidev/react-turnstile';

// Cloudflare Turnstile token executor z timeoutem.
// `executeAsync()` wywoluje invisible challenge i zwraca token.
// W razie braku widgetu lub timeoutu rzucamy oznaczonym bledem, ktory
// hook formularza zlapie i (na localhost) zastapi tokenem testowym.
export const executeTurnstileWithTimeout = async (
  turnstile: TurnstileInstance | null,
  timeoutMs = 8000,
): Promise<string> => {
  if (!turnstile) throw new Error('TURNSTILE_NOT_READY');
  return Promise.race([
    turnstile.executeAsync(),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('TURNSTILE_TIMEOUT')), timeoutMs),
    ),
  ]);
};

export const isLocalhost = () => window.location.hostname === 'localhost';
