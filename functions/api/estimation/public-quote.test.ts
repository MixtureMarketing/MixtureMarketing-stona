import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './public-quote';

type Ctx = Parameters<typeof onRequestPost>[0];

// ── Minimalna biblioteka (jak publicQuote.test): frontend + archetyp x + reguła recommend. ──
const FIX: Record<string, unknown[]> = {
  levels: [
    { aspect_code: 'frontend', level: 0, hours_min: 0, hours_max: 0 },
    { aspect_code: 'frontend', level: 1, hours_min: 10, hours_max: 20 },
  ],
  defaults: [{ archetype_code: 'x', aspect_code: 'frontend', default_level: 1, is_locked: 0 }],
  archetypes: [{ code: 'x', name: 'X', integration_mode: 'platform' }],
  defs: [{ code: 'project_goal', answer_type: 'select' }],
  questions: [{ code: 'project_goal', text: 'Cel?', unknown_weight: 1, visible_if_json: null }],
  rules: [
    {
      id: 1,
      name: 'rec X',
      condition_json: '{"q":"project_goal","op":"eq","val":"x"}',
      actions_json: '[{"type":"recommend_archetype","code":"x","reason":"bo x"}]',
      reason_template: '',
      priority: 0,
    },
  ],
  aspects: [{ code: 'frontend', name: 'Frontend', category: 'A' }],
  modules: [],
  integrations: [],
  multipliers: [],
  cost: [],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'buffer', value: '0' },
    { key: 'multiplier_cap', value: '0.4' },
    { key: 'offer_low_k', value: '0.2' },
    { key: 'offer_high_k', value: '0.3' },
    { key: 'rounding_pln', value: '100' },
    { key: 'confidence_completeness', value: '0.6' },
    { key: 'public_widen_k', value: '0.15' },
    { key: 'public_round_pln', value: '500' },
    { key: 'public_rate_per_hour', value: '5' },
    { key: 'public_archetype_fallback', value: '{"sklep":"woocommerce"}' },
  ],
};

function route(sql: string): unknown[] {
  if (sql.includes('FROM est_levels')) return FIX.levels;
  if (sql.includes('FROM est_archetype_defaults')) return FIX.defaults;
  if (sql.includes('FROM est_archetypes')) return FIX.archetypes;
  if (sql.includes("visibility = 'public'")) return FIX.defs;
  if (sql.includes('FROM est_questions')) return FIX.questions;
  if (sql.includes('FROM est_rules')) return FIX.rules;
  if (sql.includes('FROM est_modules')) return FIX.modules;
  if (sql.includes('FROM est_integrations')) return FIX.integrations;
  if (sql.includes('FROM est_multipliers')) return FIX.multipliers;
  if (sql.includes('FROM est_cost_item_types')) return FIX.cost;
  if (sql.includes('FROM est_params')) return FIX.params;
  if (sql.includes('FROM est_aspects')) return FIX.aspects;
  return [];
}

function makeDB() {
  const inserts: string[] = [];
  const stmt = (sql: string) => ({
    all: async () => ({ results: route(sql) }),
    first: async () => route(sql)[0] ?? null,
    bind: () => {
      if (/INSERT|UPDATE|DELETE/i.test(sql)) inserts.push(sql);
      return {
        run: async () => ({ meta: { last_row_id: 42 } }),
        all: async () => ({ results: route(sql) }),
        first: async () => route(sql)[0] ?? null,
      };
    },
  });
  return {
    inserts,
    DB: {
      prepare: (sql: string) => stmt(sql),
      batch: async () => [],
    },
  };
}

function makeEnv(opts: { count?: string | null } = {}) {
  const db = makeDB();
  const kv = {
    get: async () => opts.count ?? null,
    put: async () => undefined,
  };
  return {
    inserts: db.inserts,
    env: { DB: db.DB, CACHE: kv, TURNSTILE_SECRET: 'sekret' /* RESEND brak → maile pominięte */ },
  };
}

const post = (env: unknown, body: unknown): Ctx =>
  ({
    env,
    request: new Request('http://x/api/estimation/public-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '9.9.9.9' },
      body: JSON.stringify(body),
    }),
  }) as unknown as Ctx;

let captchaOk = true;
beforeEach(() => {
  captchaOk = true;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).includes('siteverify'))
        return new Response(JSON.stringify({ success: captchaOk }));
      return new Response('ok'); // resend (nie wywoływane — brak RESEND_API_KEY)
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

const VALID = { answers: { project_goal: 'x' }, email: 'jan@x.pl', captcha_token: 'tok' };

describe('POST /api/estimation/public-quote', () => {
  it('honeypot → 403', async () => {
    const { env } = makeEnv();
    const res = await onRequestPost(post(env, { ...VALID, website_verify: 'bot' }));
    expect(res.status).toBe(403);
  });

  it('brak/niepoprawny email → 400', async () => {
    const { env } = makeEnv();
    expect((await onRequestPost(post(env, { ...VALID, email: 'nie-email' }))).status).toBe(400);
    expect((await onRequestPost(post(env, { ...VALID, email: '' }))).status).toBe(400);
  });

  it('captcha nieudana → 403', async () => {
    captchaOk = false;
    const { env } = makeEnv();
    expect((await onRequestPost(post(env, VALID))).status).toBe(403);
  });

  it('rate-limit (licznik na progu) → 429', async () => {
    const { env } = makeEnv({ count: '5' });
    expect((await onRequestPost(post(env, VALID))).status).toBe(429);
  });

  it('brak project_goal → 400', async () => {
    const { env } = makeEnv();
    const res = await onRequestPost(post(env, { ...VALID, answers: { languages: 2 } }));
    expect(res.status).toBe(400);
  });

  it('happy path → 200, zwrot WYŁĄCZNIE priceRange; tworzy lead + draft', async () => {
    const { env, inserts } = makeEnv();
    const res = await onRequestPost(post(env, VALID));
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    // frontend L1 (10–20h)×50 → offer {700,900} → public {500,1500}
    expect(body.priceRange).toEqual({ min: 500, max: 1500 });
    expect(body.currency).toBe('PLN');
    expect(body.status).toBe('ok');
    // ZERO pól wewnętrznych
    expect(body).not.toHaveProperty('hours');
    expect(body).not.toHaveProperty('confidence');
    expect(body).not.toHaveProperty('quoteId');
    // persystencja: lead + draft
    expect(inserts.some((s) => s.includes('INSERT INTO leads'))).toBe(true);
    expect(inserts.some((s) => s.includes('INSERT INTO est_quotes'))).toBe(true);
    expect(inserts.some((s) => s.includes('INSERT INTO est_quote_answers'))).toBe(true);
  });
});
