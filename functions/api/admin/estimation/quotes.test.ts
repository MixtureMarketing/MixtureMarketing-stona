import { describe, it, expect } from 'vitest';
import { onRequestGet, onRequestPost, onRequestPut } from './quotes';

// Rejestrujący mock D1: zapamiętuje przygotowane SQL + bindy + wywołania batch,
// rozdziela wyniki .all() po dopasowaniu SQL, .run() zwraca last_row_id.
interface MockOpts {
  lastRowId?: number;
  resultsFor?: (sql: string) => unknown[] | undefined;
  throwErr?: string;
}
function mockEnv(opts: MockOpts = {}) {
  const calls = {
    prepared: [] as string[],
    binds: [] as { sql: string; args: unknown[] }[],
    batched: [] as unknown[][],
  };
  const makeStmt = (sql: string) => {
    const run = async () => {
      if (opts.throwErr) throw new Error(opts.throwErr);
      return { meta: { last_row_id: opts.lastRowId ?? 1 } };
    };
    const all = async () => {
      if (opts.throwErr) throw new Error(opts.throwErr);
      return { results: opts.resultsFor?.(sql) };
    };
    return {
      bind: (...args: unknown[]) => {
        calls.binds.push({ sql, args });
        return { run, all, first: async () => null };
      },
      run,
      all,
      first: async () => null,
    };
  };
  const DB = {
    prepare: (sql: string) => {
      calls.prepared.push(sql);
      return makeStmt(sql);
    },
    batch: async (stmts: unknown[]) => {
      calls.batched.push(stmts);
      return [];
    },
  };
  return { DB, calls };
}

type Ctx<T> = Parameters<T>[0];
function ctx(env: unknown, body?: unknown): unknown {
  return { env, request: { json: async () => body } };
}

describe('GET /api/admin/estimation/quotes', () => {
  it('zwraca listę { quotes: [...] }', async () => {
    const { DB } = mockEnv({ resultsFor: () => [{ id: 1, name: 'A', status: 'draft' }] });
    const res = await onRequestGet(ctx({ DB }) as Ctx<typeof onRequestGet>);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ quotes: [{ id: 1, name: 'A', status: 'draft' }] });
  });

  it('pusta baza → { quotes: [] }', async () => {
    const { DB } = mockEnv({ resultsFor: () => undefined });
    const res = await onRequestGet(ctx({ DB }) as Ctx<typeof onRequestGet>);
    expect(await res.json()).toEqual({ quotes: [] });
  });

  it('błąd → 500', async () => {
    const { DB } = mockEnv({ throwErr: 'DB down' });
    const res = await onRequestGet(ctx({ DB }) as Ctx<typeof onRequestGet>);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/admin/estimation/quotes — draft + komplet odpowiedzi atomowo', () => {
  const paramsRows = [
    { key: 'hourly_rate', value: '50' },
    { key: 'buffer', value: '0.10' },
  ];
  const withParams = (sql: string) => (sql.includes('est_params') ? paramsRows : undefined);

  it('tworzy draft, snapshotuje stawkę/params/engine_version, zwraca 201 z id', async () => {
    const { DB, calls } = mockEnv({ lastRowId: 42, resultsFor: withParams });
    const res = await onRequestPost(
      ctx({ DB }, { name: 'Sklep X', archetype_code: 'woocommerce', answers: {} }) as Ctx<
        typeof onRequestPost
      >,
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: 42, status: 'draft', engine_version: '1.0' });
    const insert = calls.binds.find((b) => b.sql.includes('INSERT INTO est_quotes'));
    expect(insert).toBeTruthy();
    // snapshot: hourly_rate=50, params_json zawiera buffer, engine_version=1.0
    expect(insert!.args).toContain(50);
    expect(insert!.args.some((a) => typeof a === 'string' && a.includes('"buffer":"0.10"'))).toBe(
      true,
    );
    expect(insert!.args).toContain('1.0');
  });

  it('zapisuje KOMPLET odpowiedzi neutralnych w batchu (atomowo z draftem)', async () => {
    const { DB, calls } = mockEnv({ lastRowId: 7, resultsFor: withParams });
    await onRequestPost(
      ctx(
        { DB },
        {
          name: 'Sklep Y',
          archetype_code: 'sylius',
          answers: { project_goal: 'sklep', products_count: 12000, product_variants: 'masowe' },
        },
      ) as Ctx<typeof onRequestPost>,
    );
    expect(calls.batched).toHaveLength(1);
    expect(calls.batched[0]).toHaveLength(3); // 3 odpowiedzi
    // każda odpowiedź związana z quote_id=7
    const answerBinds = calls.binds.filter((b) => b.sql.includes('est_quote_answers'));
    expect(answerBinds).toHaveLength(3);
    expect(answerBinds.every((b) => b.args[0] === 7)).toBe(true);
    // wartości serializowane jako JSON
    expect(answerBinds.find((b) => b.args[1] === 'products_count')!.args[2]).toBe('12000');
  });

  it('bez answers → brak batcha (draft bez odpowiedzi jest dozwolony)', async () => {
    const { DB, calls } = mockEnv({ lastRowId: 1, resultsFor: withParams });
    await onRequestPost(
      ctx({ DB }, { name: 'Z', archetype_code: 'wordpress' }) as Ctx<typeof onRequestPost>,
    );
    expect(calls.batched).toHaveLength(0);
  });

  it('walidacja: brak name → 400', async () => {
    const { DB } = mockEnv({ resultsFor: withParams });
    const res = await onRequestPost(
      ctx({ DB }, { archetype_code: 'wordpress' }) as Ctx<typeof onRequestPost>,
    );
    expect(res.status).toBe(400);
  });

  it('walidacja: brak archetype_code → 400 (draft wymaga archetypu)', async () => {
    const { DB } = mockEnv({ resultsFor: withParams });
    const res = await onRequestPost(ctx({ DB }, { name: 'X' }) as Ctx<typeof onRequestPost>);
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/estimation/quotes — autosave', () => {
  it('aktualizuje pola archetypu tylko na draftcie i upsertuje odpowiedzi', async () => {
    const { DB, calls } = mockEnv({ lastRowId: 1 });
    const res = await onRequestPut(
      ctx(
        { DB },
        { id: 5, archetype_reason: 'klient woli WP', answers: { project_goal: 'wizytowka' } },
      ) as Ctx<typeof onRequestPut>,
    );
    expect(res.status).toBe(200);
    const upd = calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'));
    expect(upd!.sql).toContain("status = 'draft'");
    expect(calls.batched[0]).toHaveLength(1);
    const ans = calls.binds.find((b) => b.sql.includes('est_quote_answers'));
    expect(ans!.sql).toContain('ON CONFLICT'); // upsert
  });

  it('walidacja: brak id → 400', async () => {
    const { DB } = mockEnv();
    const res = await onRequestPut(ctx({ DB }, { answers: {} }) as Ctx<typeof onRequestPut>);
    expect(res.status).toBe(400);
  });
});
