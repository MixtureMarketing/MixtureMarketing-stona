import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestGet, QUESTIONS_CACHE_CONTROL, questionsCacheKey } from './public-questions';

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

// ── MIX-1383 (SPEC-MIX-1320 §6): A7 cache w kodzie, A8 ogólny błąd ──
const ROW = {
  code: 'project_goal',
  text: 'Cel?',
  help_text: null,
  answer_type: 'select',
  options_json: '[{"value":"sklep","label":"Sklep"}]',
  visible_if_json: null,
  question_group: 'projekt',
  sort_order: 10,
};

/** D1 liczące zapytania; `fail` = rzuca błąd z nazwą tabeli (jak D1_ERROR). */
function countingDb(fail = false) {
  const stats = { d1: 0 };
  const DB = {
    prepare: () => ({
      all: async () => {
        stats.d1++;
        if (fail) throw new Error('D1_ERROR: no such table: est_questions SQLITE_ERROR');
        return { results: [ROW] };
      },
    }),
  };
  return { DB, stats };
}

/** Atrapa `caches.default` (Workers Cache API): klucz = pełny URL żądania-klucza. */
function stubCache() {
  const store = new Map<string, Response>();
  const keys: string[] = [];
  const cache = {
    match: async (k: Request) => store.get(k.url)?.clone(),
    put: async (k: Request, r: Response) => {
      keys.push(k.url);
      store.set(k.url, r.clone());
    },
  };
  vi.stubGlobal('caches', { default: cache });
  return { store, keys };
}

const get = (env: unknown, url: string, waitUntil?: (p: Promise<unknown>) => void) =>
  onRequestGet({ env, request: new Request(url), waitUntil } as unknown as Ctx);
const BASE = 'https://mixturemarketing.pl/api/estimation/public-questions';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('A7: cache pytań w kodzie (nagłówek + klucz bez parametrów)', () => {
  it('200 ma Cache-Control public, max-age=300 także bez Cache API (nie zależy od panelu)', async () => {
    const { DB } = countingDb();
    const res = await get({ DB }, BASE);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300');
    expect(QUESTIONS_CACHE_CONTROL).toBe('public, max-age=300');
  });

  it('1000 × ?x=<losowe> → 1 zapytanie D1, ta sama treść; klucz bez query i fragmentu', async () => {
    const { keys } = stubCache();
    const { DB, stats } = countingDb();
    const first = await (await get({ DB }, BASE)).text();
    for (let i = 0; i < 1000; i++) {
      const res = await get({ DB }, `${BASE}?x=${Math.random()}&i=${i}#f`);
      expect(res.status).toBe(200);
      if (i % 250 === 0) expect(await res.text()).toBe(first);
    }
    expect(stats.d1).toBe(1);
    expect(keys).toEqual([BASE]);
    expect(questionsCacheKey(`${BASE}?x=1#a`)?.url).toBe(BASE);
  });

  it('bliźniak: pierwszy zwykły GET (pusty cache) → 200 z D1 i zapis do cache przez waitUntil', async () => {
    const { store } = stubCache();
    const { DB, stats } = countingDb();
    const later: Promise<unknown>[] = [];
    const res = await get({ DB }, BASE, (p) => later.push(p));
    expect(res.status).toBe(200);
    await Promise.all(later);
    expect(later).toHaveLength(1);
    expect(stats.d1).toBe(1);
    expect(store.has(BASE)).toBe(true);
  });

  it('błąd 500 nie trafia do cache i ma no-store; następny GET znów pyta D1', async () => {
    const { store } = stubCache();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const bad = countingDb(true);
    const res = await get({ DB: bad.DB }, `${BASE}?x=1`);
    expect(res.status).toBe(500);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(store.size).toBe(0);
    const good = countingDb();
    expect((await get({ DB: good.DB }, `${BASE}?x=2`)).status).toBe(200);
    expect(good.stats.d1).toBe(1);
  });

  it('awaria Cache API (match rzuca) → odpowiedź z D1, nie 500', async () => {
    vi.stubGlobal('caches', {
      default: {
        match: async () => {
          throw new Error('cache down');
        },
        put: async () => {
          throw new Error('cache down');
        },
      },
    });
    const { DB, stats } = countingDb();
    expect((await get({ DB }, `${BASE}?x=3`)).status).toBe(200);
    expect(stats.d1).toBe(1);
  });
});

describe('A8: błąd D1 w pytaniach → ogólne 500 bez szczegółów', () => {
  it('treść bez err.message, nazwy tabeli i stosu; stały kod; log bez message; bliźniak: zwykły GET 200', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await get({ DB: countingDb(true).DB }, BASE);
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({
      error: 'Błąd serwera. Spróbuj później.',
      reason: 'wewnętrzny',
    });
    for (const leak of ['D1_ERROR', 'est_questions', 'SQLITE', 'stack', 'at '])
      expect(text).not.toContain(leak);
    expect(log.mock.calls.flat().join(' ')).not.toContain('est_questions');
    expect((await get({ DB: countingDb().DB }, BASE)).status).toBe(200);
  });
});
