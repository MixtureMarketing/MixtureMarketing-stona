import { describe, it, expect } from 'vitest';
import { onRequestPost } from './quote-finalize';

// Mock D1: rozdziela .first() (wycena po id) i .all() (odpowiedzi + biblioteka) po dopasowaniu SQL.
// Rejestruje batch (atomowy snapshot) + UPDATE statusu. Wzorzec jak quotes.test.ts.
interface MockOpts {
  quoteRow?: Record<string, unknown> | null;
  answers?: { question_code: string; answer_json: string }[];
  lib?: Partial<Record<string, unknown[]>>;
}
function mockEnv(opts: MockOpts = {}) {
  const calls = { binds: [] as { sql: string; args: unknown[] }[], batched: [] as unknown[][] };
  const rowsFor = (sql: string): unknown[] => {
    if (sql.includes('est_quote_answers')) return opts.answers ?? [];
    const L = opts.lib ?? {};
    if (sql.includes('est_aspects') && sql.includes('est_levels')) return L.levels ?? [];
    if (sql.includes('FROM est_aspects')) return L.aspects ?? [];
    if (sql.includes('est_archetype_defaults')) return L.archetypeDefaults ?? [];
    if (sql.includes('FROM est_archetypes')) return L.archetypes ?? [];
    if (sql.includes('est_questions')) return L.questions ?? [];
    if (sql.includes('est_rules')) return L.rules ?? [];
    if (sql.includes('est_modules')) return L.modules ?? [];
    if (sql.includes('est_integrations')) return L.integrations ?? [];
    if (sql.includes('est_multipliers')) return L.multipliers ?? [];
    if (sql.includes('est_params')) return L.params ?? [];
    return [];
  };
  const makeStmt = (sql: string) => ({
    bind: (...args: unknown[]) => {
      calls.binds.push({ sql, args });
      return {
        first: async () =>
          sql.includes('FROM est_quotes') && sql.includes('WHERE id')
            ? (opts.quoteRow ?? null)
            : null,
        all: async () => ({ results: rowsFor(sql) }),
        run: async () => ({ meta: { last_row_id: 1 } }),
      };
    },
    first: async () => null,
    all: async () => ({ results: rowsFor(sql) }),
    run: async () => ({ meta: { last_row_id: 1 } }),
  });
  const DB = {
    prepare: (sql: string) => makeStmt(sql),
    batch: async (stmts: unknown[]) => {
      calls.batched.push(stmts);
      return [];
    },
  };
  return { DB, calls };
}

type Ctx<T> = Parameters<T>[0];
const ctx = (env: unknown, body?: unknown): unknown => ({
  env,
  request: { json: async () => body },
});

// Minimalna biblioteka: 1 obszar (frontend, kat. A) poz. 2 = 40–100 h, archetyp woocommerce default 2.
const LIB = {
  aspects: [{ code: 'frontend', name: 'Frontend', category: 'A', description: null }],
  levels: [
    {
      aspect_code: 'frontend',
      level: 2,
      hours_min: 40,
      hours_max: 100,
      name: 'Standard',
      description: 'Wlasny layout, komponenty, responsywnosc.',
    },
  ],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
  ],
  archetypeDefaults: [
    { archetype_code: 'woocommerce', aspect_code: 'frontend', default_level: 2, is_locked: 0 },
  ],
  questions: [],
  rules: [
    {
      id: 99,
      name: 'warn',
      condition_json: '{"q":"archetype","op":"eq","val":"woocommerce"}',
      actions_json: '[{"type":"archetype_warning","message":"Uwaga testowa"}]',
      reason_template: 'x',
      priority: 0,
    },
  ],
  modules: [],
  integrations: [],
  multipliers: [],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'buffer', value: '0.10' },
    { key: 'confidence_completeness', value: '0.60' },
  ],
};
const draftQuote = (over: Record<string, unknown> = {}) => ({
  id: 5,
  name: 'Q',
  archetype_code: 'woocommerce',
  status: 'draft',
  hourly_rate: 50,
  params_json: '{}',
  ...over,
});

describe('POST quote-finalize — walidacja + snapshot', () => {
  it('happy path: status→review, snapshot obszarów/itemów, engine_version=1.7', async () => {
    const { DB, calls } = mockEnv({ quoteRow: draftQuote(), lib: LIB, answers: [] });
    const res = await onRequestPost(ctx({ DB }, { id: 5 }) as Ctx<typeof onRequestPost>);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; engine_version: string };
    expect(body.status).toBe('review');
    expect(body.engine_version).toBe('1.7');
    // UPDATE statusu na review
    const upd = calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'));
    expect(upd!.sql).toContain("status = 'review'");
    expect(upd!.args).toContain('1.7');
    // snapshot obszaru frontend zapisany (batch) — INSERT, nie DELETE
    const aspectIns = calls.binds.find((b) => b.sql.includes('INSERT INTO est_quote_aspects'));
    expect(aspectIns).toBeTruthy();
    expect(aspectIns!.args).toContain('frontend');
    expect(calls.batched.length).toBeGreaterThan(0);
  });

  it('f2a: snapshot niesie NAZWĘ/OPIS poziomu + alerty (żródło dokumentów, migracja 0005)', async () => {
    const { DB, calls } = mockEnv({ quoteRow: draftQuote(), lib: LIB, answers: [] });
    await onRequestPost(ctx({ DB }, { id: 5 }) as Ctx<typeof onRequestPost>);
    // treść poziomu zamrożona w est_quote_aspects (inaczej edycja biblioteki zmienia wysłaną ofertę)
    const ins = calls.binds.find((b) => b.sql.includes('INSERT INTO est_quote_aspects'))!;
    expect(ins.sql).toContain('level_name');
    expect(ins.args).toContain('Standard');
    expect(ins.args).toContain('Wlasny layout, komponenty, responsywnosc.');
    // alerty (archetype_warning) zapisane — Karta decyzji nie liczy ich na żywo
    const upd = calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'))!;
    expect(upd.sql).toContain('warnings_json');
    expect(upd.args.some((a) => typeof a === 'string' && a.includes('Uwaga testowa'))).toBe(true);
  });

  it('GUARD cyklu: finalize na status=sent → 409, brak zapisu snapshotu', async () => {
    const { DB, calls } = mockEnv({ quoteRow: draftQuote({ status: 'sent' }), lib: LIB });
    const res = await onRequestPost(ctx({ DB }, { id: 5 }) as Ctx<typeof onRequestPost>);
    expect(res.status).toBe(409);
    expect(calls.batched).toHaveLength(0);
    expect(calls.binds.some((b) => b.sql.includes('UPDATE est_quotes'))).toBe(false);
  });

  it('re-finalize z review dozwolony (nadpisanie snapshotu)', async () => {
    const { DB } = mockEnv({ quoteRow: draftQuote({ status: 'review' }), lib: LIB });
    const res = await onRequestPost(ctx({ DB }, { id: 5 }) as Ctx<typeof onRequestPost>);
    expect(res.status).toBe(200);
  });

  it('walidacja: zmiana poziomu bez powodu → 400', async () => {
    const { DB, calls } = mockEnv({ quoteRow: draftQuote(), lib: LIB });
    const res = await onRequestPost(
      // chosenLevels frontend=4 (≠ suggested 2) bez levelReasons → validateForFinalize błąd
      ctx({ DB }, { id: 5, overrides: { chosenLevels: { frontend: 4 } } }) as Ctx<
        typeof onRequestPost
      >,
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { errors: string[] };
    expect(body.errors.length).toBeGreaterThan(0);
    expect(calls.batched).toHaveLength(0);
  });

  it('pusta wycena (brak obszaru z godzinami) → 400', async () => {
    const emptyLib = { ...LIB, archetypeDefaults: [], levels: [] };
    const { DB } = mockEnv({ quoteRow: draftQuote(), lib: emptyLib });
    const res = await onRequestPost(ctx({ DB }, { id: 5 }) as Ctx<typeof onRequestPost>);
    expect(res.status).toBe(400);
  });

  it('wycena nie istnieje → 404', async () => {
    const { DB } = mockEnv({ quoteRow: null, lib: LIB });
    const res = await onRequestPost(ctx({ DB }, { id: 999 }) as Ctx<typeof onRequestPost>);
    expect(res.status).toBe(404);
  });

  it('brak id → 400', async () => {
    const { DB } = mockEnv({ lib: LIB });
    const res = await onRequestPost(ctx({ DB }, {}) as Ctx<typeof onRequestPost>);
    expect(res.status).toBe(400);
  });
});
