import { describe, it, expect } from 'vitest';
import { onRequestGet } from './quotes';

// Minimalny mock kontekstu Pages Function z bindingiem D1 (env.DB.prepare().all()).
type Ctx = Parameters<typeof onRequestGet>[0];

function makeCtx(opts: { results?: unknown[]; throwErr?: string }): Ctx {
  const prepare = () => ({
    all: async () => {
      if (opts.throwErr) throw new Error(opts.throwErr);
      return { results: opts.results };
    },
  });
  return { env: { DB: { prepare } } } as unknown as Ctx;
}

describe('GET /api/admin/estimation/quotes', () => {
  it('zwraca listę wycen jako { quotes: [...] }', async () => {
    const rows = [{ id: 1, name: 'Wycena A', status: 'draft' }];
    const res = await onRequestGet(makeCtx({ results: rows }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(await res.json()).toEqual({ quotes: rows });
  });

  it('pusta baza → { quotes: [] } (nie null)', async () => {
    const res = await onRequestGet(makeCtx({ results: undefined }));
    expect(await res.json()).toEqual({ quotes: [] });
  });

  it('błąd zapytania → 500 z komunikatem', async () => {
    const res = await onRequestGet(makeCtx({ throwErr: 'DB down' }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'DB down' });
  });
});
