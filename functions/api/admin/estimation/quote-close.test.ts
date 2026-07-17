import { describe, it, expect } from 'vitest';
import { onRequestPost } from './quote-close';

// Godziny rzeczywiste (f3a) → est_actual_hours (0003), NIE est_quote_aspects (rozstrzygnięcie B).
// Endpoint NIE rusza statusu (rozdział close/status). Edytowalny dla won I closed (po zamknięciu).
// Puste godziny = brak wiersza (kasowanie). hours < 0 → 400. est_quote_aspects/items nietknięte.

const ctx = (env: unknown, body: unknown): never =>
  ({ env, request: { json: async () => body } }) as never;

// batch dostaje statementy zbudowane z prepare().bind() — łapiemy sql+args
function mockEnvCapture(quoteRow: Record<string, unknown> | null) {
  const captured: { sql: string; args: unknown[] }[] = [];
  const batched: unknown[][] = [];
  const DB = {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => {
        const s = { sql, args };
        return {
          first: async () => (sql.includes('FROM est_quotes') ? quoteRow : null),
          run: async () => ({ meta: { changes: 1 } }),
          _captured: (captured.push(s), s),
        };
      },
    }),
    batch: async (stmts: unknown[]) => {
      batched.push(stmts);
      return stmts.map(() => ({ success: true }));
    },
  };
  return { env: { DB }, captured, batched };
}

const WON = { id: 5, status: 'won' };

describe('quote-close — godziny rzeczywiste', () => {
  it('won + actuale → 200, upsert do est_actual_hours (nie est_quote_aspects)', async () => {
    const m = mockEnvCapture(WON);
    const res = (await onRequestPost(
      ctx(m.env, {
        id: 5,
        actuals: [
          { code: 'frontend', hours: 45 },
          { code: 'apis', hours: 20, note: 'więcej niż zakładano' },
        ],
      }),
    )) as Response;
    expect(res.status).toBe(200);
    const sqls = m.captured.map((c) => c.sql).join(' ');
    expect(sqls).toMatch(/est_actual_hours/);
    expect(sqls).not.toMatch(/est_quote_aspects|est_quote_items/);
    expect(sqls).toMatch(/updated_at/); // stempel na wycenie
  });

  it('puste godziny → wiersz KASOWANY (nie mierzyliśmy)', async () => {
    const m = mockEnvCapture(WON);
    await onRequestPost(ctx(m.env, { id: 5, actuals: [{ code: 'frontend', hours: null }] }));
    const sqls = m.captured.map((c) => c.sql).join(' ');
    expect(sqls).toMatch(/DELETE FROM est_actual_hours/);
    expect(sqls).not.toMatch(/INSERT INTO est_actual_hours/);
  });

  it('hours < 0 → 400, ZERO zapisów', async () => {
    const m = mockEnvCapture(WON);
    const res = (await onRequestPost(
      ctx(m.env, { id: 5, actuals: [{ code: 'frontend', hours: -3 }] }),
    )) as Response;
    expect(res.status).toBe(400);
    expect(m.batched).toHaveLength(0);
  });

  it('edycja po closed — status closed dozwolony (200)', async () => {
    const m = mockEnvCapture({ id: 5, status: 'closed' });
    const res = (await onRequestPost(
      ctx(m.env, { id: 5, actuals: [{ code: 'frontend', hours: 50 }] }),
    )) as Response;
    expect(res.status).toBe(200);
  });

  it('status inny niż won/closed (np. draft) → 409', async () => {
    const m = mockEnvCapture({ id: 5, status: 'draft' });
    const res = (await onRequestPost(
      ctx(m.env, { id: 5, actuals: [{ code: 'frontend', hours: 50 }] }),
    )) as Response;
    expect(res.status).toBe(409);
  });

  it('wycena nie istnieje → 404', async () => {
    const m = mockEnvCapture(null);
    const res = (await onRequestPost(
      ctx(m.env, { id: 99, actuals: [{ code: 'frontend', hours: 50 }] }),
    )) as Response;
    expect(res.status).toBe(404);
  });

  it('kody itemów (module:/integration:) też dozwolone', async () => {
    const m = mockEnvCapture(WON);
    const res = (await onRequestPost(
      ctx(m.env, { id: 5, actuals: [{ code: 'module:wishlist', hours: 12 }] }),
    )) as Response;
    expect(res.status).toBe(200);
    expect(m.captured.some((c) => c.args.includes('module:wishlist'))).toBe(true);
  });
});
