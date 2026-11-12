// MIX-1476: POST /api/estimation/public-preview — formy ataku (każda odmowa: kod HTTP i linia
// powodu) z dozwolonym bliźniakiem. Biblioteka wyceny z atrapy (jak public-quote.test),
// limiter `_rateLimit` na atrapie KV (Map), czas przez jawne `nowMs`.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handlePreview, onRequestPost, PREVIEW_MAX_BODY_BYTES } from './public-preview';
import { PREVIEW_TOKEN_TTL_SEC } from './_previewToken';

type Ctx = Parameters<typeof onRequestPost>[0];

const FIX: Record<string, unknown[]> = {
  levels: [
    { aspect_code: 'frontend', level: 0, hours_min: 0, hours_max: 0 },
    { aspect_code: 'frontend', level: 1, hours_min: 10, hours_max: 20 },
  ],
  defaults: [{ archetype_code: 'x', aspect_code: 'frontend', default_level: 1, is_locked: 0 }],
  archetypes: [{ code: 'x', name: 'X', integration_mode: 'platform' }],
  defs: [{ code: 'project_goal', answer_type: 'select', options_json: '[{"value":"x"}]' }],
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
  ],
};

function route(sql: string): unknown[] {
  if (sql.includes('FROM est_levels')) return FIX.levels;
  if (sql.includes('FROM est_archetype_defaults')) return FIX.defaults;
  if (sql.includes('FROM est_archetypes')) return FIX.archetypes;
  if (sql.includes("visibility = 'public'")) return FIX.defs;
  if (sql.includes('FROM est_questions')) return FIX.questions;
  if (sql.includes('FROM est_rules')) return FIX.rules;
  if (sql.includes('FROM est_params')) return FIX.params;
  if (sql.includes('FROM est_aspects')) return FIX.aspects;
  return [];
}

const SECRET = 's'.repeat(48);
const T0 = 1_800_000_000_000;
const IP4 = '203.0.113.7';

function makeEnv(over: Record<string, unknown> = {}) {
  const writes: string[] = [];
  const store = new Map<string, string>();
  const DB = {
    prepare: (sql: string) => {
      if (/INSERT|UPDATE|DELETE/i.test(sql)) writes.push(sql);
      return { all: async () => ({ results: route(sql) }) };
    },
  };
  const CACHE = {
    store,
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    put: vi.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
  };
  const env = {
    DB,
    CACHE,
    TURNSTILE_SECRET: 'ts-secret',
    PREVIEW_TOKEN_SECRET: SECRET,
    ...over,
  };
  return { env, writes, store, CACHE };
}

function req(body: unknown, headers: Record<string, string | null> = {}): Request {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const all = { 'cf-connecting-ip': IP4, ...headers };
  for (const [k, v] of Object.entries(all)) if (v !== null) h[k] = v;
  return new Request('https://x/api/estimation/public-preview', {
    method: 'POST',
    headers: h,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const run = (env: unknown, body: unknown, headers?: Record<string, string | null>, now = T0) =>
  handlePreview(req(body, headers), env as never, now);

async function out(res: Response) {
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

let siteverify: () => Promise<Response>;
const TS_OK = { success: true, hostname: 'mixturemarketing.pl', action: 'public_quote' };
let logs: string[];
beforeEach(() => {
  siteverify = async () => new Response(JSON.stringify(TS_OK));
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).includes('siteverify')) return siteverify();
      throw new Error('nieoczekiwany fetch');
    }),
  );
  logs = [];
  const cap = (...a: unknown[]) => logs.push(a.map(String).join(' '));
  vi.spyOn(console, 'error').mockImplementation(cap);
  vi.spyOn(console, 'log').mockImplementation(cap);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const ANSWERS = { project_goal: 'x' };
const FIRST = { answers: ANSWERS, captcha_token: 'cf-turnstile-token' };

async function getToken(env: unknown, headers?: Record<string, string | null>, now = T0) {
  const r = await out(await run(env, FIRST, headers, now));
  expect(r.status).toBe(200);
  return r.body.preview_token as string;
}

describe('POST /api/estimation/public-preview: ścieżka szczęśliwa', () => {
  it('Turnstile → 200 z widełkami {min,max,currency} i tokenem; bez zapisu do D1', async () => {
    const { env, writes } = makeEnv();
    const r = await out(await run(env, FIRST));
    expect(r.status).toBe(200);
    expect(Object.keys(r.body).sort()).toEqual(['preview_token', 'priceRange']);
    const pr = r.body.priceRange as Record<string, unknown>;
    expect(Object.keys(pr).sort()).toEqual(['currency', 'max', 'min']);
    expect(pr.currency).toBe('PLN');
    expect(Number.isFinite(pr.min) && Number.isFinite(pr.max)).toBe(true);
    expect(writes).toEqual([]);
  });

  it('z tokenem → 200 tylko priceRange (bez nowego tokenu i bez Turnstile)', async () => {
    const { env } = makeEnv();
    const token = await getToken(env);
    const calls = vi.mocked(fetch).mock.calls.length;
    const r = await out(await run(env, { answers: ANSWERS, preview_token: token }));
    expect(r.status).toBe(200);
    expect(Object.keys(r.body)).toEqual(['priceRange']);
    expect(vi.mocked(fetch).mock.calls.length).toBe(calls);
  });

  it('onRequestPost: błąd D1 = 500 bez szczegółów', async () => {
    const { env } = makeEnv({
      DB: {
        prepare: () => {
          throw new Error('SQLITE tajne szczegóły');
        },
      },
    });
    const res = await onRequestPost({ request: req(FIRST), env } as unknown as Ctx);
    const r = await out(res);
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toContain('SQLITE');
  });
});

describe('formy ataku (odmowa + dozwolony bliźniak)', () => {
  it('F1 rotacja IPv6 w jednym /64: 6. token z ::6 = 429; z innego /64 = 200', async () => {
    const { env } = makeEnv();
    for (let i = 1; i <= 5; i++)
      expect((await run(env, FIRST, { 'cf-connecting-ip': `2001:db8:1:2::${i}` })).status).toBe(
        200,
      );
    const r = await out(await run(env, FIRST, { 'cf-connecting-ip': '2001:db8:1:2::6' }));
    expect(r).toMatchObject({ status: 429, body: { reason: 'limit tokenów n=5/5' } });
    expect((await run(env, FIRST, { 'cf-connecting-ip': '2001:db8:1:3::1' })).status).toBe(200);
  });

  it('F2 brak cf-connecting-ip = 400 ip: brak; z nagłówkiem = 200', async () => {
    const { env } = makeEnv();
    const r = await out(await run(env, FIRST, { 'cf-connecting-ip': null }));
    expect(r).toMatchObject({ status: 400, body: { reason: 'ip: brak' } });
    expect((await run(env, FIRST)).status).toBe(200);
  });

  it('F3 tylko X-Forwarded-For = 400 ip: brak; XFF nie zmienia klucza limitu', async () => {
    const { env } = makeEnv();
    const r = await out(
      await run(env, FIRST, { 'cf-connecting-ip': null, 'x-forwarded-for': '198.51.100.1' }),
    );
    expect(r).toMatchObject({ status: 400, body: { reason: 'ip: brak' } });
    for (let i = 1; i <= 5; i++)
      expect((await run(env, FIRST, { 'x-forwarded-for': `198.51.100.${i}` })).status).toBe(200);
    const sixth = await out(await run(env, FIRST, { 'x-forwarded-for': '198.51.100.99' }));
    expect(sixth).toMatchObject({ status: 429, body: { reason: 'limit tokenów n=5/5' } });
  });

  it('F4 seria tokenów z jednego IPv4: 5 = 200, 6. = 429 z Retry-After', async () => {
    const { env } = makeEnv();
    for (let i = 0; i < 5; i++) expect((await run(env, FIRST)).status).toBe(200);
    const res = await run(env, FIRST);
    expect(res.headers.get('Retry-After')).toBe('900');
    expect(await out(res)).toMatchObject({ status: 429, body: { reason: 'limit tokenów n=5/5' } });
    expect((await run(env, FIRST, { 'cf-connecting-ip': '203.0.113.8' })).status).toBe(200);
  });

  it('F5 token po 60 podglądach = 401 token: wyczerpany; 60. = 200', async () => {
    const { env } = makeEnv();
    const token = await getToken(env);
    const body = { answers: ANSWERS, preview_token: token };
    for (let i = 1; i <= 60; i++) expect((await run(env, body)).status).toBe(200);
    expect(await out(await run(env, body))).toMatchObject({
      status: 401,
      body: { reason: 'token: wyczerpany n=60/60' },
    });
  });

  it('F6 token z innego IP = 401 token: ip; ten sam IP = 200', async () => {
    const { env } = makeEnv();
    const token = await getToken(env);
    const body = { answers: ANSWERS, preview_token: token };
    expect(await out(await run(env, body, { 'cf-connecting-ip': '203.0.113.9' }))).toMatchObject({
      status: 401,
      body: { reason: 'token: ip' },
    });
    expect((await run(env, body)).status).toBe(200);
  });

  it('F7 token po exp = 401 token: wygasł; ms przed exp = 200', async () => {
    const { env } = makeEnv();
    const token = await getToken(env);
    const body = { answers: ANSWERS, preview_token: token };
    const end = T0 + PREVIEW_TOKEN_TTL_SEC * 1000;
    expect((await run(env, body, {}, end - 1)).status).toBe(200);
    expect(await out(await run(env, body, {}, end))).toMatchObject({
      status: 401,
      body: { reason: 'token: wygasł' },
    });
  });

  it('F8 podpis albo payload zmieniony o 1 znak = 401 token: podpis', async () => {
    const { env } = makeEnv();
    const token = await getToken(env);
    const [pay, sig] = token.split('.');
    const flip = (c: string) => (c === 'A' ? 'B' : 'A');
    const variants = [
      `${pay}.${flip(sig[0])}${sig.slice(1)}`,
      `${pay}.${sig.slice(0, -1)}${flip(sig.slice(-1))}`,
      `${pay.slice(0, -2)}${flip(pay.slice(-2, -1))}${pay.slice(-1)}.${sig}`,
    ];
    for (const t of variants) {
      const r = await out(await run(env, { answers: ANSWERS, preview_token: t }));
      expect(r.status).toBe(401);
      expect(['token: podpis', 'token: format']).toContain(r.body.reason);
    }
    const r0 = await out(await run(env, { answers: ANSWERS, preview_token: variants[0] }));
    expect(r0.body.reason).toBe('token: podpis');
    expect((await run(env, { answers: ANSWERS, preview_token: token })).status).toBe(200);
  });

  it('F9 kid nieznany = 401 token: kid; kid k2 z PREVIEW_TOKEN_SECRET_K2 = 200', async () => {
    const { env } = makeEnv({ PREVIEW_TOKEN_KID: 'k2', PREVIEW_TOKEN_SECRET_K2: 'k'.repeat(40) });
    const token = await getToken(env);
    const p = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
    expect(p.kid).toBe('k2');
    expect((await run(env, { answers: ANSWERS, preview_token: token })).status).toBe(200);
    const { env: noK2 } = makeEnv();
    expect(await out(await run(noK2, { answers: ANSWERS, preview_token: token }))).toMatchObject({
      status: 401,
      body: { reason: 'token: kid' },
    });
  });

  it('F10 pomylenie formatu (3 segmenty, alg none, pusty podpis) = 401 token: format', async () => {
    const { env } = makeEnv();
    const token = await getToken(env);
    const [pay, sig] = token.split('.');
    const hdr = btoa('{"alg":"none"}').replace(/=+$/, '');
    for (const t of [`${hdr}.${pay}.${sig}`, `${pay}.`, `${pay}.${sig}.x`, 'none'])
      expect(await out(await run(env, { answers: ANSWERS, preview_token: t }))).toMatchObject({
        status: 401,
        body: { reason: 'token: format' },
      });
  });

  it('F11 ciało 9 kB = 413 body: za duży; 8 kB = 200', async () => {
    const { env } = makeEnv();
    const base = JSON.stringify(FIRST);
    const nine = base + ' '.repeat(9 * 1024 - base.length);
    expect(await out(await run(env, nine))).toMatchObject({
      status: 413,
      body: { reason: 'body: za duży' },
    });
    const eight = base + ' '.repeat(PREVIEW_MAX_BODY_BYTES - base.length);
    expect((await run(env, eight)).status).toBe(200);
  });

  it('F12 nieznane pytanie = 400 kod: spoza listy; znane = 200', async () => {
    const { env } = makeEnv();
    expect(
      await out(await run(env, { ...FIRST, answers: { ...ANSWERS, budget_secret: 1 } })),
    ).toMatchObject({ status: 400, body: { reason: 'kod: spoza listy' } });
    expect((await run(env, FIRST)).status).toBe(200);
  });

  it('F13 odpowiedź spoza allowlisty = 400 opcja: spoza listy; dozwolona = 200', async () => {
    const { env } = makeEnv();
    expect(
      await out(await run(env, { ...FIRST, answers: { project_goal: '<img onerror=1>' } })),
    ).toMatchObject({ status: 400, body: { reason: 'opcja: spoza listy project_goal' } });
    expect((await run(env, FIRST)).status).toBe(200);
  });

  it('F14 Turnstile odrzucony = 403; zły host/akcja = 403; siteverify padł albo 500 = 503', async () => {
    const { env } = makeEnv();
    const cases: [() => Promise<Response>, number, string][] = [
      [
        async () => new Response(JSON.stringify({ ...TS_OK, success: false })),
        403,
        'captcha: odrzucony',
      ],
      [
        async () => new Response(JSON.stringify({ ...TS_OK, hostname: 'evil.example' })),
        403,
        'captcha: hostname',
      ],
      [
        async () => new Response(JSON.stringify({ ...TS_OK, action: 'contact' })),
        403,
        'captcha: action',
      ],
      [
        async () => {
          throw new Error('down');
        },
        503,
        'captcha: siteverify niedostępny',
      ],
      [async () => new Response('x', { status: 500 }), 503, 'captcha: siteverify http'],
    ];
    for (const [sv, status, reason] of cases) {
      siteverify = sv;
      expect(await out(await run(env, FIRST))).toMatchObject({ status, body: { reason } });
    }
    expect(await out(await run(env, { answers: ANSWERS }))).toMatchObject({
      status: 403,
      body: { reason: 'captcha: token' },
    });
    const { env: noTs } = makeEnv({ TURNSTILE_SECRET: undefined });
    siteverify = async () => new Response(JSON.stringify(TS_OK));
    expect(await out(await run(noTs, FIRST))).toMatchObject({
      status: 503,
      body: { reason: 'captcha: brak sekretu' },
    });
    expect((await run(env, FIRST)).status).toBe(200);
  });

  it('F15 brak albo krótki PREVIEW_TOKEN_SECRET = 503 (obie ścieżki); 32 znaki = 200', async () => {
    const { env } = makeEnv();
    const token = await getToken(env);
    for (const s of [undefined, '', 'x'.repeat(31)]) {
      const { env: bad } = makeEnv({ PREVIEW_TOKEN_SECRET: s });
      expect(await out(await run(bad, FIRST))).toMatchObject({
        status: 503,
        body: { reason: 'konfiguracja: PREVIEW_TOKEN_SECRET' },
      });
      expect(await out(await run(bad, { answers: ANSWERS, preview_token: token }))).toMatchObject({
        status: 503,
        body: { reason: 'konfiguracja: PREVIEW_TOKEN_SECRET' },
      });
    }
    const { env: ok } = makeEnv({ PREVIEW_TOKEN_SECRET: 'x'.repeat(32) });
    expect((await run(ok, FIRST)).status).toBe(200);
  });

  it('F16 błąd limitera (KV rzuca, brak wiązania, śmieci w KV) = 503; sprawny KV = 200', async () => {
    const { env, CACHE } = makeEnv();
    const token = await getToken(env);
    CACHE.get.mockRejectedValueOnce(new Error('kv down'));
    expect(await out(await run(env, FIRST))).toMatchObject({
      status: 503,
      body: { reason: 'limiter: błąd' },
    });
    CACHE.put.mockRejectedValueOnce(new Error('kv 429'));
    expect(await out(await run(env, { answers: ANSWERS, preview_token: token }))).toMatchObject({
      status: 503,
      body: { reason: 'limiter: błąd' },
    });
    // licznik jti musi istnieć, zanim zepsujemy jego wartość
    expect((await run(env, { answers: ANSWERS, preview_token: token })).status).toBe(200);
    for (const k of CACHE.store.keys()) CACHE.store.set(k, 'NaN');
    expect(await out(await run(env, { answers: ANSWERS, preview_token: token }))).toMatchObject({
      status: 503,
      body: { reason: 'limiter: błąd' },
    });
    const { env: noKv } = makeEnv({ CACHE: undefined });
    expect(await out(await run(noKv, FIRST))).toMatchObject({
      status: 503,
      body: { reason: 'limiter: brak wiązania' },
    });
    const { env: fresh } = makeEnv();
    expect((await run(fresh, FIRST)).status).toBe(200);
  });

  it('F17 nieznane pole w ciele (email, website_verify) = 400; dwa tokeny = 400', async () => {
    const { env } = makeEnv();
    for (const extra of [{ email: 'a@b.pl' }, { website_verify: '' }, { __proto__x: 1 }])
      expect(await out(await run(env, { ...FIRST, ...extra }))).toMatchObject({
        status: 400,
        body: { reason: 'body: nieznane pole' },
      });
    expect(await out(await run(env, { ...FIRST, preview_token: 'a.b' }))).toMatchObject({
      status: 400,
      body: { reason: 'body: dwa tokeny' },
    });
    for (const b of ['[]', 'null', '{', '"x"'])
      expect(await out(await run(env, b))).toMatchObject({
        status: 400,
        body: { reason: 'body: nieczytelny' },
      });
  });

  it('F18 Pseudo IPv4 i nieczytelny cf-connecting-ip = 400; zwykły IPv4 = 200', async () => {
    const { env } = makeEnv();
    expect(await out(await run(env, FIRST, { 'cf-connecting-ip': '240.0.0.1' }))).toMatchObject({
      status: 400,
      body: { reason: 'ip: pseudo-ipv4' },
    });
    expect(
      await out(await run(env, FIRST, { 'cf-connecting-ip': '1.2.3.4, 5.6.7.8' })),
    ).toMatchObject({ status: 400, body: { reason: 'ip: nieczytelny' } });
    expect((await run(env, FIRST, { 'cf-connecting-ip': '1.2.3.4' })).status).toBe(200);
  });

  it('F19 logi i klucze KV bez IP i tokenu', async () => {
    const { env, store } = makeEnv();
    const token = await getToken(env, { 'cf-connecting-ip': '2001:db8:aa:bb::1' });
    await run(
      env,
      { answers: ANSWERS, preview_token: token },
      { 'cf-connecting-ip': '198.51.100.7' },
    );
    await run(env, FIRST, { 'cf-connecting-ip': null, 'x-forwarded-for': '192.0.2.55' });
    const all = [...logs, ...store.keys()].join('\n');
    expect(logs.length).toBeGreaterThan(0);
    for (const secret of ['2001:db8', '198.51.100.7', '192.0.2.55', token, token.split('.')[1]])
      expect(all).not.toContain(secret);
  });
});
