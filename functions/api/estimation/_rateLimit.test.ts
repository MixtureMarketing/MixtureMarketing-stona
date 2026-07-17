import { describe, it, expect, vi } from 'vitest';
import { checkRateLimit, type RateLimitStore } from './_rateLimit';

// Atrapa KV: Map + liczniki wywołań put.
function mockKV(
  initial: Record<string, string> = {},
): RateLimitStore & { puts: [string, string][] } {
  const store = new Map(Object.entries(initial));
  const puts: [string, string][] = [];
  return {
    puts,
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => {
      puts.push([k, v]);
      store.set(k, v);
    },
  };
}

describe('checkRateLimit — miękki limiter na KV (per IP)', () => {
  it('pierwsze żądanie (brak klucza) → dozwolone, licznik = 1, zapis z TTL', async () => {
    const kv = mockKV();
    const r = await checkRateLimit(kv, '1.2.3.4', 5, 3600);
    expect(r).toEqual({ allowed: true, count: 1 });
    expect(kv.puts).toHaveLength(1);
    expect(kv.puts[0][0]).toBe('pubcalc:rl:1.2.3.4');
    expect(kv.puts[0][1]).toBe('1');
  });

  it('poniżej progu → dozwolone, inkrement', async () => {
    const kv = mockKV({ 'pubcalc:rl:1.2.3.4': '4' });
    const r = await checkRateLimit(kv, '1.2.3.4', 5, 3600);
    expect(r).toEqual({ allowed: true, count: 5 });
  });

  it('na progu → ODMOWA, bez zapisu (TTL nie przedłużany)', async () => {
    const kv = mockKV({ 'pubcalc:rl:1.2.3.4': '5' });
    const r = await checkRateLimit(kv, '1.2.3.4', 5, 3600);
    expect(r).toEqual({ allowed: false, count: 5 });
    expect(kv.puts).toHaveLength(0);
  });

  it('różne IP mają osobne kubełki', async () => {
    const kv = mockKV({ 'pubcalc:rl:1.1.1.1': '5' });
    const r = await checkRateLimit(kv, '2.2.2.2', 5, 3600);
    expect(r.allowed).toBe(true);
    expect(r.count).toBe(1);
  });

  it('błąd KV → fail-open (nie blokujemy użytkownika przez awarię cache; twardą bramą jest Turnstile)', async () => {
    const kv: RateLimitStore = {
      get: vi.fn().mockRejectedValue(new Error('KV down')),
      put: vi.fn(),
    };
    const r = await checkRateLimit(kv, '1.2.3.4', 5, 3600);
    expect(r.allowed).toBe(true);
  });
});
