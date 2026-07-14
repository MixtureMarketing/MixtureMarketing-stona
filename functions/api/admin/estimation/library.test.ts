import { describe, it, expect } from 'vitest';
import { onRequestGet } from './library';

type Ctx = Parameters<typeof onRequestGet>[0];
function mockEnv(opts: { throwErr?: string } = {}) {
  const DB = {
    prepare: (sql: string) => ({
      all: async () => {
        if (opts.throwErr) throw new Error(opts.throwErr);
        // marker zależny od tabeli, by potwierdzić mapowanie kluczy
        return { results: [{ _from: sql.match(/FROM est_(\w+)/)?.[1] ?? 'x' }] };
      },
    }),
  };
  return { DB };
}
const ctx = (env: unknown): Ctx => ({ env }) as unknown as Ctx;

describe('GET /api/admin/estimation/library', () => {
  it('zwraca komplet biblioteki (11 kolekcji)', async () => {
    const res = await onRequestGet(ctx(mockEnv()));
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown[]>;
    for (const key of [
      'aspects',
      'levels',
      'archetypes',
      'archetypeDefaults',
      'questions',
      'rules',
      'modules',
      'integrations',
      'multipliers',
      'costItemTypes',
      'params',
    ]) {
      expect(body).toHaveProperty(key);
      expect(Array.isArray(body[key])).toBe(true);
    }
  });

  it('błąd → 500', async () => {
    const res = await onRequestGet(ctx(mockEnv({ throwErr: 'boom' })));
    expect(res.status).toBe(500);
  });
});
