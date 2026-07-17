// Miękki rate-limit na KV (binding CACHE) dla publicznego kalkulatora (kontrakt §6).
// Per IP, okno TTL. MIĘKKI świadomie: KV jest eventually consistent, więc dwa równoległe
// żądania mogą przejść ten sam próg — twardą bramą botów jest Turnstile; ten limiter ogranicza
// nadużycie i koszt (Resend/D1). Fail-open: awaria KV nie może zablokować użytkownika.

/** Podzbiór KVNamespace używany przez limiter (get/put) — ułatwia testy i luźne wiązanie. */
export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
}

/**
 * Zlicza żądania per IP w oknie `windowSec`. Po osiągnięciu `limit` zwraca `allowed:false`
 * i NIE zapisuje (nie przedłuża TTL → klucz wygasa `windowSec` po ostatnim dozwolonym żądaniu).
 * Błąd KV → fail-open (`allowed:true`).
 */
export async function checkRateLimit(
  kv: RateLimitStore,
  ip: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const key = `pubcalc:rl:${ip}`;
  try {
    const raw = await kv.get(key);
    const count = raw ? parseInt(raw, 10) || 0 : 0;
    if (count >= limit) return { allowed: false, count };
    const next = count + 1;
    await kv.put(key, String(next), { expirationTtl: windowSec });
    return { allowed: true, count: next };
  } catch {
    return { allowed: true, count: 0 };
  }
}
