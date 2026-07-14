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
});
