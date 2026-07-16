import { describe, it, expect } from 'vitest';
import { onRequestGet, onRequestPatch } from './library';

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

// ── PATCH: edycja wiersza biblioteki (f2c-1) ────────────────────────────────
type PatchCtx = Parameters<typeof onRequestPatch>[0];

function mockPatchEnv(opts: {
  current?: Record<string, unknown> | null;
  currentLevel?: Record<string, unknown> | null;
  siblings?: { level: number; hours_min: number; hours_max: number }[];
}) {
  const updates: { sql: string; binds: unknown[] }[] = [];
  const DB = {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => ({
        first: async () => {
          if (/SELECT id FROM est_aspects/.test(sql)) return { id: 1 };
          if (/FROM est_levels WHERE aspect_id = \? AND level/.test(sql))
            return opts.currentLevel ?? null;
          return opts.current ?? null;
        },
        all: async () => {
          if (/FROM est_levels WHERE aspect_id = \?/.test(sql))
            return { results: opts.siblings ?? [] };
          return { results: [] };
        },
        run: async () => {
          updates.push({ sql, binds });
          return { success: true };
        },
      }),
    }),
  };
  return { env: { DB }, updates };
}
const pctx = (env: unknown, body: unknown): PatchCtx =>
  ({ env, request: { json: async () => body } }) as unknown as PatchCtx;

const FRONTEND_LEVELS = [
  { level: 0, hours_min: 0, hours_max: 0 },
  { level: 1, hours_min: 10, hours_max: 25 },
  { level: 2, hours_min: 40, hours_max: 100 },
  { level: 3, hours_min: 100, hours_max: 250 },
  { level: 4, hours_min: 250, hours_max: 375 },
];

describe('PATCH /api/admin/estimation/library', () => {
  it('edycja name + client_name obszaru → 200, UPDATE z tymi polami', async () => {
    const m = mockPatchEnv({ current: { code: 'frontend', name: 'Frontend' } });
    const res = await onRequestPatch(
      pctx(m.env, {
        entity: 'aspect',
        key: { code: 'frontend' },
        patch: { name: 'Frontend', client_name: 'Strona i wygląd' },
      }),
    );
    expect(res.status).toBe(200);
    expect(m.updates).toHaveLength(1);
    expect(m.updates[0].sql).toMatch(/UPDATE est_aspects SET/);
    expect(m.updates[0].sql).toMatch(/client_name = \?/);
  });

  it('próba zmiany code → 400, ŻADEN UPDATE nie idzie', async () => {
    const m = mockPatchEnv({ current: { code: 'frontend', name: 'Frontend' } });
    const res = await onRequestPatch(
      pctx(m.env, { entity: 'aspect', key: { code: 'frontend' }, patch: { code: 'nowy' } }),
    );
    expect(res.status).toBe(400);
    expect(m.updates).toHaveLength(0);
  });

  it('nieznana encja → 400', async () => {
    const m = mockPatchEnv({});
    const res = await onRequestPatch(
      pctx(m.env, { entity: 'archetyp', key: {}, patch: { name: 'x' } }),
    );
    expect(res.status).toBe(400);
  });

  it('wiersz nie istnieje → 404', async () => {
    const m = mockPatchEnv({ current: null });
    const res = await onRequestPatch(
      pctx(m.env, { entity: 'module', key: { code: 'brak' }, patch: { name: 'x' } }),
    );
    expect(res.status).toBe(404);
  });

  it('poziom: min>max → 400, brak UPDATE', async () => {
    const m = mockPatchEnv({
      currentLevel: { level: 2, hours_min: 40, hours_max: 100 },
      siblings: FRONTEND_LEVELS,
    });
    const res = await onRequestPatch(
      pctx(m.env, {
        entity: 'level',
        key: { aspect_code: 'frontend', level: 2 },
        patch: { hours_min: 120, hours_max: 100 },
      }),
    );
    expect(res.status).toBe(400);
    expect(m.updates).toHaveLength(0);
  });

  it('poziom: edycja widełek w granicach (nakładanie legalne) → 200', async () => {
    const m = mockPatchEnv({
      currentLevel: { level: 2, hours_min: 40, hours_max: 100 },
      siblings: FRONTEND_LEVELS,
    });
    const res = await onRequestPatch(
      pctx(m.env, {
        entity: 'level',
        key: { aspect_code: 'frontend', level: 2 },
        patch: { hours_min: 50, hours_max: 110 },
      }),
    );
    expect(res.status).toBe(200);
    expect(m.updates).toHaveLength(1);
    expect(m.updates[0].sql).toMatch(/UPDATE est_levels SET/);
    expect(m.updates[0].sql).toMatch(/aspect_id = \? AND level = \?/);
  });

  it('pytanie: zmiana value opcji → 400', async () => {
    const m = mockPatchEnv({
      current: {
        code: 'sales_model',
        options_json: JSON.stringify([
          { value: 'b2c', label: 'B2C' },
          { value: 'b2b', label: 'B2B' },
        ]),
      },
    });
    const res = await onRequestPatch(
      pctx(m.env, {
        entity: 'question',
        key: { code: 'sales_model' },
        patch: {
          options_json: JSON.stringify([
            { value: 'consumer', label: 'B2C' },
            { value: 'b2b', label: 'B2B' },
          ]),
        },
      }),
    );
    expect(res.status).toBe(400);
    expect(m.updates).toHaveLength(0);
  });

  it('parametr liczbowy: wartość nieliczbowa → 400', async () => {
    const m = mockPatchEnv({ current: { key: 'hourly_rate', value: '50' } });
    const res = await onRequestPatch(
      pctx(m.env, { entity: 'param', key: { key: 'hourly_rate' }, patch: { value: 'abc' } }),
    );
    expect(res.status).toBe(400);
  });
});
