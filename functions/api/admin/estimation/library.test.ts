import { describe, it, expect } from 'vitest';
import { onRequestGet, onRequestPatch, onRequestPost } from './library';

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
const ctx = (env: unknown, url = 'http://x/api/admin/estimation/library'): Ctx =>
  ({ env, request: { url } }) as unknown as Ctx;

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

// ── f2c-2a: PATCH reguły (semantyka) + POST create + GET scope=editor ────────

function mockLibEnv(opts: {
  currentRule?: Record<string, unknown> | null;
  existingCode?: boolean;
  ctxData?: {
    aspects?: string[];
    levels?: { aspect_code: string; level: number }[];
    modules?: string[];
    integrations?: string[];
    multipliers?: string[];
    costItemTypes?: string[];
    questions?: string[];
    archetypes?: string[];
  };
}) {
  const writes: { sql: string; binds: unknown[] }[] = [];
  const c = opts.ctxData ?? {};
  const codes = (arr?: string[]) => (arr ?? []).map((x) => ({ code: x }));
  // loadRuleContext woła prepare(sql).all() BEZ bind — wspólna logika all dla obu ścieżek.
  const allFor = async (sql: string) => {
    if (/FROM est_levels/.test(sql)) return { results: c.levels ?? [] };
    if (/FROM est_aspects/.test(sql)) return { results: codes(c.aspects) };
    if (/FROM est_modules/.test(sql)) return { results: codes(c.modules) };
    if (/FROM est_integrations/.test(sql)) return { results: codes(c.integrations) };
    if (/FROM est_multipliers/.test(sql)) return { results: codes(c.multipliers) };
    if (/FROM est_cost_item_types/.test(sql)) return { results: codes(c.costItemTypes) };
    if (/FROM est_questions/.test(sql)) return { results: codes(c.questions) };
    if (/FROM est_archetypes/.test(sql)) return { results: codes(c.archetypes) };
    return { results: [] };
  };
  const DB = {
    prepare: (sql: string) => ({
      all: () => allFor(sql),
      bind: (...binds: unknown[]) => ({
        first: async () => {
          if (/FROM est_rules WHERE id/.test(sql)) return opts.currentRule ?? null;
          if (/SELECT 1 FROM est_(modules|integrations) WHERE code/.test(sql))
            return opts.existingCode ? { 1: 1 } : null;
          return null;
        },
        all: () => allFor(sql),
        run: async () => {
          writes.push({ sql, binds });
          return { success: true };
        },
      }),
    }),
  };
  return { env: { DB }, writes };
}

const CTX_OK = {
  aspects: ['high_availability'],
  levels: [
    { aspect_code: 'high_availability', level: 0 },
    { aspect_code: 'high_availability', level: 1 },
    { aspect_code: 'high_availability', level: 2 },
  ],
  modules: ['wishlist'],
  multipliers: ['hard_deadline'],
  questions: ['downtime_tolerance'],
};

const RULE_ROW = {
  id: 1,
  condition_json: JSON.stringify({ q: 'downtime_tolerance', op: 'answered' }),
  actions_json: JSON.stringify([{ type: 'multiplier', code: 'hard_deadline' }]),
};

describe('PATCH reguły — semantyka spójności', () => {
  it('zmiana progu + akcja na istniejący kod → 200, UPDATE', async () => {
    const m = mockLibEnv({ currentRule: RULE_ROW, ctxData: CTX_OK });
    const res = await onRequestPatch(
      pctx(m.env, {
        entity: 'rule',
        key: { id: 1 },
        patch: {
          priority: 5,
          condition_json: JSON.stringify({
            q: 'downtime_tolerance',
            op: 'eq',
            val: 'critical_247',
          }),
          actions_json: JSON.stringify([
            { type: 'min_level', aspect: 'high_availability', level: 2 },
          ]),
        },
      }),
    );
    expect(res.status).toBe(200);
    expect(m.writes).toHaveLength(1);
    expect(m.writes[0].sql).toMatch(/UPDATE est_rules SET/);
  });

  it('sierota AKCJI (moduł nie istnieje) → 400, brak UPDATE', async () => {
    const m = mockLibEnv({ currentRule: RULE_ROW, ctxData: CTX_OK });
    const res = await onRequestPatch(
      pctx(m.env, {
        entity: 'rule',
        key: { id: 1 },
        patch: { actions_json: JSON.stringify([{ type: 'suggest_module', code: 'ghost' }]) },
      }),
    );
    expect(res.status).toBe(400);
    expect(m.writes).toHaveLength(0);
  });

  it('sierota WARUNKU (pytanie nie istnieje) → 400', async () => {
    const m = mockLibEnv({ currentRule: RULE_ROW, ctxData: CTX_OK });
    const res = await onRequestPatch(
      pctx(m.env, {
        entity: 'rule',
        key: { id: 1 },
        patch: { condition_json: JSON.stringify({ q: 'widmo', op: 'eq', val: 'x' }) },
      }),
    );
    expect(res.status).toBe(400);
    expect(m.writes).toHaveLength(0);
  });
});

describe('POST /library — CREATE modułu/integracji', () => {
  it('nowy moduł poprawny → 201 + INSERT', async () => {
    const m = mockLibEnv({ existingCode: false });
    const res = await onRequestPost(
      pctx(m.env, {
        entity: 'module',
        code: 'nowy_modul',
        row: { name: 'Nowy moduł', hours_min: 8, hours_max: 16, risk: 'low' },
      }),
    );
    expect(res.status).toBe(201);
    expect(m.writes[0].sql).toMatch(/INSERT INTO est_modules/);
  });

  it('duplikat code → 409, brak INSERT', async () => {
    const m = mockLibEnv({ existingCode: true });
    const res = await onRequestPost(
      pctx(m.env, {
        entity: 'module',
        code: 'wishlist',
        row: { name: 'X', hours_min: 8, hours_max: 16 },
      }),
    );
    expect(res.status).toBe(409);
    expect(m.writes).toHaveLength(0);
  });

  it('kod nie-snake_case → 400 (przed sprawdzeniem unikalności)', async () => {
    const m = mockLibEnv({ existingCode: false });
    const res = await onRequestPost(
      pctx(m.env, {
        entity: 'module',
        code: 'Zły-Kod',
        row: { name: 'X', hours_min: 1, hours_max: 2 },
      }),
    );
    expect(res.status).toBe(400);
    expect(m.writes).toHaveLength(0);
  });

  it('integracja bez kategorii → 400', async () => {
    const m = mockLibEnv({ existingCode: false });
    const res = await onRequestPost(
      pctx(m.env, {
        entity: 'integration',
        code: 'nowa_int',
        row: { name: 'X', hours_custom_min: 10, hours_custom_max: 20 },
      }),
    );
    expect(res.status).toBe(400);
  });

  it('encja spoza {module,integration} → 400', async () => {
    const m = mockLibEnv({});
    const res = await onRequestPost(pctx(m.env, { entity: 'aspect', code: 'x', row: {} }));
    expect(res.status).toBe(400);
  });
});

describe('GET /library?scope=editor', () => {
  it('zwraca 200 (pełny odczyt dla edytora)', async () => {
    const res = await onRequestGet(
      ctx(mockEnv(), 'http://x/api/admin/estimation/library?scope=editor'),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown[]>;
    expect(Array.isArray(body.rules)).toBe(true);
  });
});
