// Miękki rate-limit na KV (binding CACHE) dla publicznego kalkulatora (kontrakt §6).
// Per IP, okno TTL. MIĘKKI świadomie: KV jest eventually consistent, więc dwa równoległe
// żądania mogą przejść ten sam próg — twardą bramą botów jest Turnstile; ten limiter ogranicza
// nadużycie i koszt (Resend/D1). Fail-open: awaria KV nie może zablokować użytkownika.
// Wyjątek: tryb `failClosed` (MIX-1476, podgląd ceny) — błąd = RateLimitError, wołający 503.

/** Podzbiór KVNamespace używany przez limiter (get/put) — ułatwia testy i luźne wiązanie. */
export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
}

/** Błąd limitera w trybie `failClosed` (wołający odpowiada 503, nigdy „przepuść”). */
export class RateLimitError extends Error {
  constructor() {
    super('limiter');
    this.name = 'RateLimitError';
  }
}

const STORED_COUNT_RE = /^[0-9]{1,9}$/;

/**
 * Zlicza żądania per IP w oknie `windowSec`. Po osiągnięciu `limit` zwraca `allowed:false`
 * i NIE zapisuje (nie przedłuża TTL → klucz wygasa `windowSec` po ostatnim dozwolonym żądaniu).
 * Błąd KV → fail-open (`allowed:true`), chyba że `opts.failClosed`: wtedy brak wiązania, błąd
 * KV i nieczytelna zapisana wartość rzucają RateLimitError.
 */
export async function checkRateLimit(
  kv: RateLimitStore,
  ip: string,
  limit: number,
  windowSec: number,
  keyPrefix = 'pubcalc:rl:',
  opts: { failClosed?: boolean } = {},
): Promise<RateLimitResult> {
  // keyPrefix rozdziela liczniki endpointów (domyślny = publiczny kalkulator, bez zmian).
  const key = `${keyPrefix}${ip}`;
  try {
    const raw = await kv.get(key);
    if (opts.failClosed && raw !== null && !STORED_COUNT_RE.test(raw)) throw new RateLimitError();
    const count = raw ? parseInt(raw, 10) || 0 : 0;
    if (count >= limit) return { allowed: false, count };
    const next = count + 1;
    await kv.put(key, String(next), { expirationTtl: windowSec });
    return { allowed: true, count: next };
  } catch {
    if (opts.failClosed) throw new RateLimitError();
    return { allowed: true, count: 0 };
  }
}
