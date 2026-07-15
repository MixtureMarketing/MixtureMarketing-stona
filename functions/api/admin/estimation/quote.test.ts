import { describe, it, expect } from 'vitest';
import { onRequestGet } from './quote';

type Ctx = Parameters<typeof onRequestGet>[0];
function mockEnv(opts: {
  quote?: unknown;
  answers?: { question_code: string; answer_json: string }[];
  throwErr?: string;
}) {
  const DB = {
    prepare: (_sql: string) => ({
      bind: () => ({
        first: async () => {
          if (opts.throwErr) throw new Error(opts.throwErr);
          return opts.quote ?? null;
        },
        all: async () => ({ results: opts.answers ?? [] }),
      }),
    }),
  };
  return { DB };
}
const ctx = (env: unknown, url: string): Ctx => ({ env, request: { url } }) as unknown as Ctx;

const URL_BASE = 'http://x/api/admin/estimation/quote';

describe('GET /api/admin/estimation/quote', () => {
  it('zwraca wycenę + odpowiedzi (parsowane z JSON)', async () => {
    const res = await onRequestGet(
      ctx(
        mockEnv({
          quote: { id: 5, name: 'A', status: 'draft' },
          answers: [
            { question_code: 'project_goal', answer_json: '"sklep"' },
            { question_code: 'products_count', answer_json: '500' },
            { question_code: 'sensitive_data', answer_json: '{"unknown":true}' },
          ],
        }),
        `${URL_BASE}?id=5`,
      ),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { quote: { id: number }; answers: Record<string, unknown> };
    expect(body.quote.id).toBe(5);
    expect(body.answers).toEqual({
      project_goal: 'sklep',
      products_count: 500,
      sensitive_data: { unknown: true },
    });
  });

  it('brak id → 400', async () => {
    const res = await onRequestGet(ctx(mockEnv({}), URL_BASE));
    expect(res.status).toBe(400);
  });

  it('nieistniejąca wycena → 404', async () => {
    const res = await onRequestGet(ctx(mockEnv({ quote: null }), `${URL_BASE}?id=99`));
    expect(res.status).toBe(404);
  });

  it('read-back po finalize: zwraca snapshot (obszary/itemy/mnożniki + sparsowane totals) — f1c #6', async () => {
    // Mock routujący .all() po tabeli; quote z totals_json (string) → snapshot.totals sparsowane.
    const routeDB = {
      prepare: (sql: string) => ({
        bind: () => ({
          first: async () => ({
            id: 7,
            status: 'review',
            totals_json: '{"offer":{"min":5000,"max":9000}}',
            confidence_breakdown_json: '[{"reason":"Ryzyko wysokie: X","delta":-6}]',
          }),
          all: async () => {
            if (sql.includes('est_quote_aspects'))
              return { results: [{ aspect_code: 'frontend', chosen_level: 2 }] };
            if (sql.includes('est_quote_items'))
              return { results: [{ item_type: 'module', name: 'Wishlist' }] };
            if (sql.includes('est_quote_multipliers'))
              return { results: [{ code: 'new_tech', value: 0.15 }] };
            return { results: [] }; // answers
          },
        }),
      }),
    };
    const res = await onRequestGet(ctx({ DB: routeDB }, `${URL_BASE}?id=7`));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      snapshot: {
        aspects: unknown[];
        items: unknown[];
        multipliers: unknown[];
        totals: { offer: { min: number; max: number } };
        confidenceBreakdown: unknown[];
      };
    };
    expect(body.snapshot.aspects).toHaveLength(1);
    expect(body.snapshot.items).toHaveLength(1);
    expect(body.snapshot.multipliers).toHaveLength(1);
    expect(body.snapshot.totals.offer).toEqual({ min: 5000, max: 9000 });
    expect(body.snapshot.confidenceBreakdown).toHaveLength(1);
  });
});
