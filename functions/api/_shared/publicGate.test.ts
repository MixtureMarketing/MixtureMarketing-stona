// MIX-1395: uwaga 1 werdyktu MIX-1324 (mutant wD: brak kontroli uszkodzonego licznika
// przeżywał zestaw wykonawcy) i uwaga 3 (IPv4 zmapowany dzielił jeden klucz limitu).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gateLimits, strictBump, type GateStore } from './publicGate';

/** Kształt jak KVNamespace: get → string | null (brak klucza = null), put(key, value, opts). */
function memKv(init: Record<string, string> = {}) {
  const store = new Map(Object.entries(init));
  const kv: GateStore = {
    get: async (k) => store.get(k) ?? null,
    put: async (k, v) => {
      store.set(k, v);
    },
  };
  return { kv, store };
}

const req = (ip: string | null) =>
  new Request('https://mixturemarketing.pl/api/audit/run', {
    method: 'POST',
    headers: ip === null ? {} : { 'cf-connecting-ip': ip },
  });

const LIMITS = { name: 't', ipLimit: 1, ipWindowSec: 3600, dailyBudget: 100 };
const NOW = new Date('2026-11-12T08:00:00Z');

let errors: string[];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => {
    errors.push(a.map(String).join(' '));
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('strictBump: allowlista wartości licznika (wD)', () => {
  it.each(['abc', '-3', '-0', '5abc', '', ' 5', '5 ', '1e3', '0x10', '007', '3.5', 'NaN', '５'])(
    'F14 uszkodzony licznik %j → wyjątek „uszkodzony licznik”, bez zapisu',
    async (bad) => {
      const { kv, store } = memKv({ k: bad });
      await expect(strictBump(kv, 'k', 10, 60)).rejects.toThrow(/^uszkodzony licznik$/);
      expect(store.get('k')).toBe(bad);
    },
  );
  it.each([
    [null, '1'],
    ['0', '1'],
    ['3', '4'],
    ['9', '10'],
  ])('bliźniak: licznik %j → przepuszcza i zapisuje %j', async (start, next) => {
    const { kv, store } = memKv(start === null ? {} : { k: start });
    await expect(strictBump(kv, 'k', 10, 60)).resolves.toBe(true);
    expect(store.get('k')).toBe(next);
  });
  it('licznik na progu → false bez zapisu; o jeden niżej → true', async () => {
    const { kv, store } = memKv({ k: '10' });
    await expect(strictBump(kv, 'k', 10, 60)).resolves.toBe(false);
    expect(store.get('k')).toBe('10');
    store.set('k', '9');
    await expect(strictBump(kv, 'k', 10, 60)).resolves.toBe(true);
  });
});

describe('gateLimits: uszkodzony licznik → 503 z linią powodu (wD)', () => {
  it.each(['abc', '-3', '5abc'])('F14 licznik IP %j → 503', async (bad) => {
    const { kv } = memKv({ 'gate:t:ip:1.2.3.4': bad });
    const r = await gateLimits(kv, req('1.2.3.4'), LIMITS, NOW);
    expect(r).toEqual({
      ok: false,
      status: 503,
      reason: 'licznik: uszkodzony licznik',
      message: 'Usługa chwilowo niedostępna. Spróbuj później.',
    });
    expect(errors).toEqual(['[gate:t] odmowa 503: licznik: uszkodzony licznik']);
  });
  it('F14 licznik dzienny "abc" → 503; bliźniak: liczba → ok', async () => {
    const { kv, store } = memKv({ 'gate:t:day:2026-11-12': 'abc' });
    const r = await gateLimits(kv, req('1.2.3.4'), LIMITS, NOW);
    expect(r.ok ? 0 : r.status).toBe(503);
    store.set('gate:t:day:2026-11-12', '5');
    store.delete('gate:t:ip:1.2.3.4');
    await expect(gateLimits(kv, req('1.2.3.4'), LIMITS, NOW)).resolves.toEqual({ ok: true });
    expect(store.get('gate:t:day:2026-11-12')).toBe('6');
  });
});

describe('gateLimits: IPv4 zmapowany liczony jak IPv4 (b)', () => {
  it('F9: 1.2.3.4 i ::ffff:1.2.3.4 dzielą licznik → drugi 429', async () => {
    const { kv, store } = memKv();
    await expect(gateLimits(kv, req('1.2.3.4'), LIMITS, NOW)).resolves.toEqual({ ok: true });
    const r = await gateLimits(kv, req('::ffff:1.2.3.4'), LIMITS, NOW);
    expect(r.ok ? 0 : r.status).toBe(429);
    expect(errors).toEqual(['[gate:t] odmowa 429: limit IP']);
    expect([...store.keys()].filter((k) => k.startsWith('gate:t:ip:'))).toEqual([
      'gate:t:ip:1.2.3.4',
    ]);
  });
  it('F10: dwa różne zmapowane IPv4 mają osobne liczniki → oba ok', async () => {
    const { kv, store } = memKv();
    await expect(gateLimits(kv, req('::ffff:1.2.3.4'), LIMITS, NOW)).resolves.toEqual({
      ok: true,
    });
    await expect(gateLimits(kv, req('::ffff:5.6.7.8'), LIMITS, NOW)).resolves.toEqual({
      ok: true,
    });
    expect([...store.keys()].filter((k) => k.startsWith('gate:t:ip:')).sort()).toEqual([
      'gate:t:ip:1.2.3.4',
      'gate:t:ip:5.6.7.8',
    ]);
  });
  it('F11: brak nagłówka i nie-IP dzielą jeden licznik brak-ip → drugi 429', async () => {
    const { kv, store } = memKv();
    await expect(gateLimits(kv, req(null), LIMITS, NOW)).resolves.toEqual({ ok: true });
    const r = await gateLimits(kv, req('nie-ip'), LIMITS, NOW);
    expect(r.ok ? 0 : r.status).toBe(429);
    expect([...store.keys()].filter((k) => k.startsWith('gate:t:ip:'))).toEqual([
      'gate:t:ip:brak-ip',
    ]);
  });
});
