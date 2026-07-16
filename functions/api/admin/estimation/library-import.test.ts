import { describe, it, expect } from 'vitest';
import { onRequestPost } from './library-import';

type ImportResp = {
  dryRun?: boolean;
  report?: Record<string, unknown>;
  warnings?: string[];
  errors?: string[];
  applied?: boolean;
};

type Ctx = Parameters<typeof onRequestPost>[0];

// Mock D1: reads (prepare().all()) → puste current; buildUpsertBatch (prepare().bind()) → statementy
// z zapisanym SQL; batch() rejestruje wsad. Pozwala sprawdzić: dry-run bez zapisu, apply atomowy,
// żaden statement nie dotyka est_quote*.
function mockEnv() {
  const batched: { sql: string }[][] = [];
  const DB = {
    prepare: (sql: string) => ({
      all: async () => ({ results: [] }),
      bind: (..._binds: unknown[]) => ({ sql }),
    }),
    batch: async (stmts: { sql: string }[]) => {
      batched.push(stmts);
      return stmts.map(() => ({ success: true }));
    },
  };
  return { env: { DB }, batched };
}
const ctx = (env: unknown, body: unknown): Ctx =>
  ({ env, request: { json: async () => body } }) as unknown as Ctx;

const PACK = {
  schema_version: 1,
  exported_at: '2026-07-16',
  counts: {},
  aspects: [{ code: 'frontend', name: 'F', category: 'A', is_active: 1 }],
  levels: [],
  archetypes: [],
  archetype_defaults: [],
  questions: [{ code: 'project_goal', text: '?', is_active: 1 }],
  rules: [
    {
      id: 1,
      name: 'R',
      condition_json: '{"q":"project_goal","op":"eq","val":"sklep"}',
      actions_json: '[{"type":"suggest_module","code":"wishlist"}]',
      reason_template: 'x',
      priority: 0,
      is_active: 1,
    },
  ],
  modules: [
    { code: 'wishlist', name: 'W', hours_min: 8, hours_max: 16, risk: 'low', is_active: 1 },
  ],
  integrations: [],
  multipliers: [],
  cost_item_types: [],
  params: [],
  category_rates: [],
};

describe('POST /library-import', () => {
  it('dry-run: raport + warnings + errors, ZERO zapisów', async () => {
    const m = mockEnv();
    const res = await onRequestPost(ctx(m.env, { data: PACK, apply: false }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ImportResp;
    expect(body.dryRun).toBe(true);
    expect(body.report).toBeTruthy();
    expect(body.errors).toEqual([]);
    expect(m.batched).toHaveLength(0); // brak zapisu
  });

  it('apply czysty → batch atomowy, żaden statement nie dotyka est_quote*', async () => {
    const m = mockEnv();
    const res = await onRequestPost(ctx(m.env, { data: PACK, apply: true }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ImportResp;
    expect(body.applied).toBe(true);
    expect(m.batched).toHaveLength(1); // jeden atomowy batch
    const allSql = m.batched[0].map((s) => s.sql).join(' ');
    expect(allSql).not.toMatch(/est_quote/);
    expect(allSql).toMatch(/est_modules|est_rules|est_aspects/);
  });

  it('apply z błędem (reguła-sierota) → 400, ZERO zapisów', async () => {
    const m = mockEnv();
    const bad = {
      ...PACK,
      rules: [{ ...PACK.rules[0], actions_json: '[{"type":"suggest_module","code":"ghost"}]' }],
    };
    const res = await onRequestPost(ctx(m.env, { data: bad, apply: true }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as ImportResp;
    expect(body.applied).toBe(false);
    expect(body.errors.length).toBeGreaterThan(0);
    expect(m.batched).toHaveLength(0);
  });

  it('dry-run z ostrzeżeniem (gaszony moduł) → errors puste, warnings niepuste, brak zapisu', async () => {
    const m = mockEnv();
    const gasi = {
      ...PACK,
      modules: [{ ...PACK.modules[0], is_active: 0 }],
    };
    const res = await onRequestPost(ctx(m.env, { data: gasi, apply: false }));
    const body = (await res.json()) as ImportResp;
    expect(body.errors).toEqual([]);
    expect(body.warnings.length).toBeGreaterThan(0);
    expect(m.batched).toHaveLength(0);
  });

  it('niezgodna schema_version → 400', async () => {
    const m = mockEnv();
    const res = await onRequestPost(
      ctx(m.env, { data: { ...PACK, schema_version: 99 }, apply: true }),
    );
    expect(res.status).toBe(400);
    expect(m.batched).toHaveLength(0);
  });

  it('brak danych → 400', async () => {
    const m = mockEnv();
    const res = await onRequestPost(ctx(m.env, { apply: true }));
    expect(res.status).toBe(400);
  });
});
