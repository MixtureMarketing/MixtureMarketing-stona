import { describe, it, expect } from 'vitest';
import { onRequestGet } from './public-questions';

type Ctx = Parameters<typeof onRequestGet>[0];
function mockEnv(rows: Record<string, unknown>[]) {
  return {
    DB: {
      prepare: (sql: string) => ({
        all: async () => {
          // endpoint MUSI filtrować po visibility='public' w SQL — sprawdzamy w teście
          expect(sql).toContain("visibility = 'public'");
          expect(sql).toContain('is_active = 1');
          return { results: rows };
        },
      }),
    },
  };
}
const ctx = (env: unknown): Ctx => ({ env, request: new Request('http://x') }) as unknown as Ctx;

describe('GET /api/estimation/public-questions', () => {
  it('zwraca tylko pola bezpieczne; opcje/visible_if sparsowane; zero pól wewnętrznych', async () => {
    const res = await onRequestGet(
      ctx(
        mockEnv([
          {
            code: 'project_goal',
            text: 'Co ma robić projekt?',
            help_text: null,
            answer_type: 'select',
            options_json: '[{"value":"sklep","label":"Sklep internetowy"}]',
            visible_if_json: null,
            question_group: 'projekt',
            sort_order: 10,
            // pola, które NIE MOGĄ wyjść (endpoint ich nie SELECT-uje, ale gdyby doszły — nie wychodzą):
            unknown_weight: 1.5,
            visibility: 'public',
          },
          {
            code: 'languages',
            text: 'Ile wersji językowych?',
            help_text: 'podpowiedź',
            answer_type: 'number',
            options_json: null,
            visible_if_json: '{"q":"project_goal","op":"eq","val":"sklep"}',
            question_group: 'projekt',
            sort_order: 20,
          },
        ]),
      ),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      contractVersion: number;
      questions: Record<string, unknown>[];
    };
    expect(body.contractVersion).toBe(1);
    expect(body.questions).toHaveLength(2);

    const q0 = body.questions[0];
    expect(q0.code).toBe('project_goal');
    expect(q0.options).toEqual([{ value: 'sklep', label: 'Sklep internetowy' }]);
    expect(q0.visible_if).toBeNull();
    // pola wewnętrzne NIE wychodzą
    expect(q0).not.toHaveProperty('unknown_weight');
    expect(q0).not.toHaveProperty('visibility');
    expect(q0).not.toHaveProperty('options_json');

    const q1 = body.questions[1];
    expect(q1.options).toBeNull();
    expect(q1.visible_if).toEqual({ q: 'project_goal', op: 'eq', val: 'sklep' });
    expect(q1.help_text).toBe('podpowiedź');
  });
});
