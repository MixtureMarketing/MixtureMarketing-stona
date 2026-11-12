import { describe, it, expect, vi } from 'vitest';
import { checkRateLimit, RateLimitError, type RateLimitStore } from './_rateLimit';

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

describe('checkRateLimit — tryb failClosed (MIX-1476, podgląd ceny)', () => {
  const fc = { failClosed: true };

  it('błąd get/put albo brak wiązania → RateLimitError (nigdy „przepuść”)', async () => {
    const getFails: RateLimitStore = {
      get: vi.fn().mockRejectedValue(new Error('KV down')),
      put: vi.fn(),
    };
    await expect(checkRateLimit(getFails, 'j', 60, 900, 'pv:jti:', fc)).rejects.toBeInstanceOf(
      RateLimitError,
    );
    const putFails: RateLimitStore = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockRejectedValue(new Error('429 write rate')),
    };
    await expect(checkRateLimit(putFails, 'j', 60, 900, 'pv:jti:', fc)).rejects.toBeInstanceOf(
      RateLimitError,
    );
    await expect(
      checkRateLimit(undefined as unknown as RateLimitStore, 'j', 60, 900, 'pv:jti:', fc),
    ).rejects.toBeInstanceOf(RateLimitError);
  });

  it('nieczytelna zapisana wartość → RateLimitError; liczba → zwykłe liczenie', async () => {
    for (const v of ['NaN', '-1', '1e3', ' 5', ''])
      await expect(
        checkRateLimit(mockKV({ 'pv:jti:j': v }), 'j', 60, 900, 'pv:jti:', fc),
      ).rejects.toBeInstanceOf(RateLimitError);
    const kv = mockKV({ 'pv:jti:j': '59' });
    expect(await checkRateLimit(kv, 'j', 60, 900, 'pv:jti:', fc)).toEqual({
      allowed: true,
      count: 60,
    });
    expect(await checkRateLimit(kv, 'j', 60, 900, 'pv:jti:', fc)).toEqual({
      allowed: false,
      count: 60,
    });
    expect(kv.puts).toEqual([['pv:jti:j', '60']]);
  });
});
