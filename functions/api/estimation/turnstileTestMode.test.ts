// MIX-1934: tryb testowy Turnstile (Preview) po stronie serwera. Każda forma ataku ma dozwolonego
// bliźniaka. Kryterium 1: lead z trybu testowego NIE trafia do CRM (D1 leads/est_quotes, Linear, maile).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { onRequestPost as quotePost } from './public-quote';
import { handlePreview } from './public-preview';
import { onRequestPost as contactPost } from '../contact-submit';
import { onRequestPost as auditLeadPost } from '../audit/capture-lead';
import { podpiszLead, sprawdzLead } from '../_leadToken';
import { verifyTurnstileStrict } from '../_shared/security';
import {
  TURNSTILE_TEST_HEADER,
  TURNSTILE_TEST_HOST,
  TURNSTILE_TEST_SECRET,
  TEST_SECRET_REFUSAL,
  isTestLikeSecret,
  turnstileMode,
} from '../_shared/turnstileMode';

const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
const MIG = readFileSync('migrations/0010_rate_counters.sql', 'utf8');

const PREVIEW = `https://${TURNSTILE_TEST_HOST}`;
const PROD = 'https://mixturemarketing.pl';
const REAL_SECRET = '0x4AAAAAAAprawdziwySekretXYZ';

// ---------- atrapy sieci ----------
type Call = { url: string; body: string };
let calls: Call[];
let siteverify: Record<string, unknown>;
beforeEach(() => {
  calls = [];
  siteverify = { success: true, hostname: 'example.com', 'error-codes': [] };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), body: String(init?.body ?? '') });
      if (String(url).includes('siteverify')) return new Response(JSON.stringify(siteverify));
      return new Response('{"id":"x"}');
    }),
  );
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const outbound = () => calls.filter((c) => !c.url.includes('siteverify'));

// ---------- 1. klasyfikacja ----------
describe('turnstileMode: sekret testowy tylko na aliasie Preview dev', () => {
  it('sekret prawdziwy = real na każdym hoście (produkcja bez zmian)', () => {
    for (const u of [PROD, PREVIEW, 'https://x.mixturemarketing-stona.pages.dev'])
      expect(turnstileMode(REAL_SECRET, `${u}/api/x`)).toEqual({ kind: 'real' });
    expect(turnstileMode(undefined, `${PROD}/api/x`)).toEqual({ kind: 'real' });
  });
  it('A: sekret testowy na produkcji (mixturemarketing.pl, www, *.pages.dev) = odmowa; bliźniak: alias dev = test', () => {
    for (const h of [
      'mixturemarketing.pl',
      'www.mixturemarketing.pl',
      'mixturemarketing-stona.pages.dev',
      'abc123.mixturemarketing-stona.pages.dev',
      'dev.mixturemarketing-stona.pages.dev.evil.pl',
      'localhost',
    ])
      expect(turnstileMode(TURNSTILE_TEST_SECRET, `https://${h}/api/x`)).toEqual({
        kind: 'refuse',
        reason: TEST_SECRET_REFUSAL.host,
      });
    expect(turnstileMode(TURNSTILE_TEST_SECRET, `${PREVIEW}/api/x`)).toEqual({ kind: 'test' });
  });
  it('A: inny sekret testowy (zawsze odrzuca, wielkie litery, spacja, nowa linia) = odmowa nawet na Preview', () => {
    for (const s of [
      '2x0000000000000000000000000000000AA',
      '3x0000000000000000000000000000000AA',
      TURNSTILE_TEST_SECRET.toUpperCase(),
      ` ${TURNSTILE_TEST_SECRET}`,
      `${TURNSTILE_TEST_SECRET}\n`,
    ]) {
      expect(isTestLikeSecret(s)).toBe(true);
      expect(turnstileMode(s, `${PREVIEW}/api/x`)).toEqual({
        kind: 'refuse',
        reason: TEST_SECRET_REFUSAL.unknown,
      });
    }
  });
  it('nieczytelny adres żądania z sekretem testowym = odmowa', () => {
    expect(turnstileMode(TURNSTILE_TEST_SECRET, 'nie-url').kind).toBe('refuse');
  });
});

// ---------- 2. ścisła weryfikacja ----------
describe('verifyTurnstileStrict: tryb test', () => {
  const expectQ = { hostnames: ['mixturemarketing.pl'], action: 'public_quote' };
  it('test: hostname example.com bez action = ok; real z tą samą odpowiedzią = odmowa hostname', async () => {
    expect(
      await verifyTurnstileStrict(
        'XXXX.DUMMY.TOKEN.XXXX',
        TURNSTILE_TEST_SECRET,
        '',
        expectQ,
        'test',
      ),
    ).toEqual({ ok: true });
    expect(await verifyTurnstileStrict('XXXX.DUMMY.TOKEN.XXXX', REAL_SECRET, '', expectQ)).toEqual({
      ok: false,
      reason: 'captcha: hostname',
    });
  });
  it('test: success=false albo inny hostname = odmowa', async () => {
    siteverify = { success: false };
    expect((await verifyTurnstileStrict('t', TURNSTILE_TEST_SECRET, '', expectQ, 'test')).ok).toBe(
      false,
    );
    siteverify = { success: true, hostname: 'mixturemarketing.pl', action: 'public_quote' };
    expect(await verifyTurnstileStrict('t', TURNSTILE_TEST_SECRET, '', expectQ, 'test')).toEqual({
      ok: false,
      reason: 'captcha: hostname',
    });
  });
  // MIX-1991 (mutant N5): w trybie testowym (host dev) success=false odrzuca nawet z poprawnym
  // hostname example.com; liczy się tylko boolean true.
  it('N5 test: success=false / "true" / brak pola przy hostname example.com = odmowa „odrzucony”; bliźniak success=true = ok', async () => {
    for (const success of [false, 'true', 1, undefined, null]) {
      siteverify = { success, hostname: 'example.com' };
      expect(await verifyTurnstileStrict('t', TURNSTILE_TEST_SECRET, '', expectQ, 'test')).toEqual({
        ok: false,
        reason: 'captcha: odrzucony',
      });
    }
    siteverify = { success: true, hostname: 'example.com' };
    expect(await verifyTurnstileStrict('t', TURNSTILE_TEST_SECRET, '', expectQ, 'test')).toEqual({
      ok: true,
    });
  });
});

// ---------- 3. publiczna wycena ----------
const DEFS = [
  { code: 'project_goal', answer_type: 'select', options_json: '[{"value":"x","label":"X"}]' },
];
const PARAMS = [
  ['hourly_rate', '50'],
  ['buffer', '0'],
  ['multiplier_cap', '0.4'],
  ['offer_low_k', '0.2'],
  ['offer_high_k', '0.3'],
  ['rounding_pln', '100'],
  ['confidence_completeness', '0.6'],
  ['public_widen_k', '0.15'],
  ['public_round_pln', '500'],
  ['public_rate_per_hour', '1000'],
].map(([key, value]) => ({ key, value }));
function route(sql: string): unknown[] {
  if (sql.includes('FROM est_levels'))
    return [
      { aspect_code: 'frontend', level: 0, hours_min: 0, hours_max: 0 },
      { aspect_code: 'frontend', level: 1, hours_min: 10, hours_max: 20 },
    ];
  if (sql.includes('FROM est_archetype_defaults'))
    return [{ archetype_code: 'x', aspect_code: 'frontend', default_level: 1, is_locked: 0 }];
  if (sql.includes('FROM est_archetypes'))
    return [{ code: 'x', name: 'X', integration_mode: 'platform' }];
  if (sql.includes("visibility = 'public'")) return DEFS;
  if (sql.includes('FROM est_questions'))
    return [{ code: 'project_goal', text: 'Cel?', unknown_weight: 1, visible_if_json: null }];
  if (sql.includes('FROM est_params')) return PARAMS;
  if (sql.includes('FROM est_aspects'))
    return [{ code: 'frontend', name: 'Frontend', category: 'A' }];
  return [];
}
function quoteEnv(mode: '0' | '1', secret: string) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(MIG);
  const writes: string[] = [];
  const DB = {
    prepare(sql: string) {
      if (sql.includes('rate_counters')) {
        const st = sqlite.prepare(sql);
        return {
          bind: (...v: unknown[]) => ({
            first: async () => st.get(...(v as never[])) ?? null,
            run: async () => st.run(...(v as never[])),
          }),
        };
      }
      const res = async () => ({ results: route(sql) });
      if (/INSERT INTO (leads|est_quotes|est_quote_answers)/.test(sql))
        writes.push(sql.trim().slice(0, 30));
      return {
        all: res,
        first: async () => null,
        bind: () => ({
          run: async () => ({ meta: { last_row_id: 1 } }),
          all: res,
          first: async () => null,
        }),
      };
    },
    batch: async (s: unknown[]) => {
      writes.push(`batch:${s.length}`);
      return [];
    },
  };
  return {
    env: {
      DB,
      CACHE: { get: async () => null, put: async () => undefined },
      TURNSTILE_SECRET: secret,
      QUOTE_LIMITS_D1: mode,
      QUOTE_KEY_HMAC_SECRET: 'k'.repeat(40),
      RESEND_API_KEY: 're',
      NOTIFY_EMAIL: 'agencja@example.com',
      LEAD_CONFIG_CRM: '1',
      LINEAR_API_KEY: 'lin',
    } as Record<string, unknown>,
    writes,
  };
}
let seq = 0;
function quoteReq(base: string) {
  seq++;
  return new Request(`${base}/api/estimation/public-quote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.0.0.${seq}` },
    body: JSON.stringify({
      answers: { project_goal: 'x' },
      email: `u${seq}@x.pl`,
      captcha_token: 'XXXX.DUMMY.TOKEN.XXXX',
    }),
  });
}
type QCtx = Parameters<typeof quotePost>[0];
const runQuote = (env: Record<string, unknown>, r: Request) =>
  quotePost({
    env,
    request: r,
    waitUntil: () => undefined,
  } as unknown as QCtx) as Promise<Response>;

describe('public-quote: lead z trybu testowego nie trafia do CRM (obie ścieżki QUOTE_LIMITS_D1)', () => {
  for (const mode of ['0', '1'] as const) {
    it(`QUOTE_LIMITS_D1=${mode}: Preview + sekret testowy = 200 z ceną, nagłówek testowy, ZERO zapisów leada i maili`, async () => {
      const { env, writes } = quoteEnv(mode, TURNSTILE_TEST_SECRET);
      const res = await runQuote(env, quoteReq(PREVIEW));
      const body = (await res.json()) as Record<string, unknown>;
      expect(res.status).toBe(200);
      expect(body.status).toBe('ok');
      expect(res.headers.get(TURNSTILE_TEST_HEADER)).toBe('1');
      expect(writes).toEqual([]);
      expect(outbound()).toEqual([]);
    });
    it(`QUOTE_LIMITS_D1=${mode}: bliźniak — sekret prawdziwy na produkcji zapisuje leada i wysyła mail (bez nagłówka)`, async () => {
      siteverify = { success: true, hostname: 'mixturemarketing.pl', action: 'public_quote' };
      const { env, writes } = quoteEnv(mode, REAL_SECRET);
      const res = await runQuote(env, quoteReq(PROD));
      expect(res.status).toBe(200);
      expect(res.headers.get(TURNSTILE_TEST_HEADER)).toBeNull();
      expect(writes.length).toBeGreaterThan(0);
      expect(outbound().some((c) => c.url.includes('resend'))).toBe(true);
    });
    it(`QUOTE_LIMITS_D1=${mode}: A sekret testowy w środowisku Production = 503, zero zapisów, siteverify nie wołany`, async () => {
      const { env, writes } = quoteEnv(mode, TURNSTILE_TEST_SECRET);
      const res = await runQuote(env, quoteReq(PROD));
      const body = (await res.json()) as Record<string, unknown>;
      expect(res.status).toBe(503);
      expect(body.reason).toBe(TEST_SECRET_REFUSAL.host);
      expect(writes).toEqual([]);
      expect(calls).toEqual([]);
    });
    it(`QUOTE_LIMITS_D1=${mode}: A token z Preview na produkcji (hostname spoza listy) = 403; bliźniak hostname produkcji = 200`, async () => {
      siteverify = { success: true, hostname: TURNSTILE_TEST_HOST, action: 'public_quote' };
      const { env } = quoteEnv(mode, REAL_SECRET);
      const res = await runQuote(env, quoteReq(PROD));
      expect(res.status).toBe(403);
      expect(((await res.json()) as Record<string, unknown>).reason).toBe('captcha: hostname');
      siteverify = { success: true, hostname: 'mixturemarketing.pl', action: 'public_quote' };
      expect((await runQuote(quoteEnv(mode, REAL_SECRET).env, quoteReq(PROD))).status).toBe(200);
    });
    // MIX-1991 (N5 przez trasę): host dev + sekret testowy + siteverify success=false = 403.
    it(`QUOTE_LIMITS_D1=${mode}: N5 Preview + sekret testowy + success=false (hostname example.com) = 403, zero zapisów`, async () => {
      siteverify = { success: false, hostname: 'example.com', 'error-codes': ['invalid-input-response'] };
      const { env, writes } = quoteEnv(mode, TURNSTILE_TEST_SECRET);
      const res = await runQuote(env, quoteReq(PREVIEW));
      expect(res.status).toBe(403);
      expect(((await res.json()) as Record<string, unknown>).reason).toBe('captcha: odrzucony');
      expect(writes).toEqual([]);
      expect(outbound()).toEqual([]);
    });
  }
});

// MIX-1991 (mutant N11): alert budżetu 80% (mail do agencji) nie wychodzi w trybie testowym.
// QUOTE_DAILY_BUDGET=1 => pierwsze żądanie doby = 80% (ceil(0.8*1) = 1), alert się należy.
describe('public-quote: alert budżetu 80% a tryb testowy (QUOTE_LIMITS_D1=1)', () => {
  async function quoteZAlertem(secret: string, base: string) {
    const { env } = quoteEnv('1', secret);
    env.QUOTE_DAILY_BUDGET = '1';
    const pending: Promise<unknown>[] = [];
    const res = (await quotePost({
      env,
      request: quoteReq(base),
      waitUntil: (p: Promise<unknown>) => pending.push(p),
    } as unknown as QCtx)) as Response;
    await Promise.all(pending);
    const alerty = outbound().filter((c) => c.url.includes('resend') && c.body.includes('80%'));
    return { res, alerty };
  }
  it('N11 Preview + sekret testowy przy 80% budżetu = 200, ZERO maili alertu', async () => {
    const { res, alerty } = await quoteZAlertem(TURNSTILE_TEST_SECRET, PREVIEW);
    expect(res.status).toBe(200);
    expect(res.headers.get(TURNSTILE_TEST_HEADER)).toBe('1');
    expect(alerty).toEqual([]);
    expect(outbound()).toEqual([]);
  });
  it('bliźniak: sekret prawdziwy na produkcji przy 80% budżetu = dokładnie 1 mail alertu', async () => {
    siteverify = { success: true, hostname: 'mixturemarketing.pl', action: 'public_quote' };
    const { res, alerty } = await quoteZAlertem(REAL_SECRET, PROD);
    expect(res.status).toBe(200);
    expect(alerty).toHaveLength(1);
    expect(alerty[0].body).toContain('budżet 80% n=1/1');
  });
});

describe('public-preview: tryb testowy', () => {
  function previewEnv(secret: string) {
    const { env } = quoteEnv('1', secret);
    return { ...env, PREVIEW_TOKEN_SECRET: 'p'.repeat(48) };
  }
  const req = (base: string) =>
    new Request(`${base}/api/estimation/public-preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7' },
      body: JSON.stringify({
        answers: { project_goal: 'x' },
        captcha_token: 'XXXX.DUMMY.TOKEN.XXXX',
      }),
    });
  it('Preview + sekret testowy = 200 (cena); A produkcja + sekret testowy = 503', async () => {
    const ok = await handlePreview(
      req(PREVIEW),
      previewEnv(TURNSTILE_TEST_SECRET) as never,
      Date.now(),
    );
    expect(ok.status).toBe(200);
    const bad = await handlePreview(
      req(PROD),
      previewEnv(TURNSTILE_TEST_SECRET) as never,
      Date.now(),
    );
    expect(bad.status).toBe(503);
  });
});

// ---------- 4. formularz kontaktowy ----------
function contactEnv(secret: string, leadTokenSecret?: string) {
  const sql: string[] = [];
  return {
    env: {
      DB: {
        prepare: (s: string) => {
          sql.push(s.trim().slice(0, 20));
          return {
            bind: () => ({ first: async () => null, run: async () => ({ meta: { changes: 0 } }) }),
          };
        },
      },
      CACHE: { get: async () => null, put: async () => undefined },
      TURNSTILE_SECRET: secret,
      ...(leadTokenSecret ? { LEAD_TOKEN_SECRET: leadTokenSecret } : {}),
      RESEND_API_KEY: 're',
      NOTIFY_EMAIL: 'agencja@example.com',
      LINEAR_API_KEY: 'lin',
    },
    sql,
  };
}
type CCtx = Parameters<typeof contactPost>[0];
const contact = (env: unknown, base: string, body: unknown) =>
  contactPost({
    request: new Request(`${base}/api/contact-submit`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '1.1.1.1' },
    }),
    env,
    waitUntil: () => undefined,
  } as unknown as CCtx) as Promise<Response>;
const LEAD = {
  action: 'create',
  lead: { name: 'Test', email: 't@example.com', captcha_token: 'XXXX.DUMMY.TOKEN.XXXX' },
};

describe('contact-submit: tryb testowy', () => {
  it('Preview + sekret testowy: 200 z id i tokenem, nagłówek, ZERO INSERT, maili i Lineara', async () => {
    const { env, sql } = contactEnv(TURNSTILE_TEST_SECRET, 'L'.repeat(40));
    const res = await contact(env, PREVIEW, LEAD);
    const body = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(typeof body.edit_token).toBe('string');
    expect(res.headers.get(TURNSTILE_TEST_HEADER)).toBe('1');
    expect(sql.filter((s) => s.startsWith('INSERT'))).toEqual([]);
    expect(outbound()).toEqual([]);
  });
  it('bliźniak: sekret prawdziwy na produkcji robi INSERT i mail', async () => {
    const { env, sql } = contactEnv(REAL_SECRET, 'L'.repeat(40));
    siteverify = { success: true };
    const res = await contact(env, PROD, LEAD);
    expect(res.status).toBe(200);
    expect(res.headers.get(TURNSTILE_TEST_HEADER)).toBeNull();
    expect(sql.some((s) => s.startsWith('INSERT'))).toBe(true);
    expect(outbound().some((c) => c.url.includes('resend'))).toBe(true);
  });
  it('A: sekret testowy w Production = 503 dla każdej akcji, bez siteverify', async () => {
    const { env } = contactEnv(TURNSTILE_TEST_SECRET, 'L'.repeat(40));
    for (const body of [LEAD, { action: 'get_lead', id: 'x', edit_token: 'y' }]) {
      const res = await contact(env, PROD, body);
      expect(res.status).toBe(503);
    }
    expect(calls).toEqual([]);
  });
  it('A: publiczny sekret testowy nie jest kluczem podpisu tokenu leada; bliźniak: sekret prawdziwy jest', async () => {
    expect(await podpiszLead({ TURNSTILE_SECRET: TURNSTILE_TEST_SECRET }, 'lead-1')).toBeNull();
    expect(
      await sprawdzLead({ TURNSTILE_SECRET: TURNSTILE_TEST_SECRET }, 'lead-1', 'cokolwiek'),
    ).toBe(false);
    const t = await podpiszLead({ TURNSTILE_SECRET: REAL_SECRET }, 'lead-1');
    expect(typeof t).toBe('string');
    expect(await sprawdzLead({ TURNSTILE_SECRET: REAL_SECRET }, 'lead-1', t)).toBe(true);
  });
  // MIX-1991 (mutant N12): KAŻDY sekret wyglądający na testowy (nie tylko dokładny 1x…AA) nie podpisuje.
  it('N12 odmiany publicznego sekretu testowego nie są kluczem HMAC; bliźniak: LEAD_TOKEN_SECRET podpisuje mimo nich', async () => {
    const odmiany = [
      '2x0000000000000000000000000000000AA',
      '3x0000000000000000000000000000000AA',
      '1x0000000000000000000000000000000BB',
      '1X0000000000000000000000000000000AA',
      ' 1x0000000000000000000000000000000AA',
      `${TURNSTILE_TEST_SECRET}\n`,
      '1x00000000000',
    ];
    const realny = await podpiszLead({ TURNSTILE_SECRET: REAL_SECRET }, 'lead-1');
    for (const s of odmiany) {
      expect(s).not.toBe(TURNSTILE_TEST_SECRET);
      expect(await podpiszLead({ TURNSTILE_SECRET: s }, 'lead-1')).toBeNull();
      expect(await sprawdzLead({ TURNSTILE_SECRET: s }, 'lead-1', realny)).toBe(false);
      const zSekretem = { TURNSTILE_SECRET: s, LEAD_TOKEN_SECRET: 'L'.repeat(40) };
      const t = await podpiszLead(zSekretem, 'lead-1');
      expect(typeof t).toBe('string');
      expect(await sprawdzLead(zSekretem, 'lead-1', t)).toBe(true);
    }
  });
  it('Preview z sekretem testowym i bez LEAD_TOKEN_SECRET = 503 (bez zapisu)', async () => {
    const { env, sql } = contactEnv(TURNSTILE_TEST_SECRET);
    const res = await contact(env, PREVIEW, LEAD);
    expect(res.status).toBe(503);
    expect(sql.filter((s) => s.startsWith('INSERT'))).toEqual([]);
  });
});

// ---------- 5. lead z audytu ----------
describe('audit/capture-lead: tryb testowy', () => {
  function auditEnv(secret: string) {
    const sql: string[] = [];
    const store = new Map<string, string>();
    return {
      env: {
        DB: {
          prepare: (s: string) => (
            sql.push(s.trim().slice(0, 20)),
            { bind: () => ({ run: async () => ({}) }) }
          ),
        },
        CACHE: {
          get: async (k: string) => store.get(k) ?? null,
          put: async (k: string, v: string) => void store.set(k, v),
        },
        FILES: { put: async () => sql.push('R2') },
        TURNSTILE_SECRET: secret,
        RESEND_API_KEY: 're',
        NOTIFY_EMAIL: 'agencja@example.com',
        LINEAR_API_KEY: 'lin',
      },
      sql,
    };
  }
  // Prawdziwy (minimalny) PDF: nagłówek %PDF- przechodzi isPdf, więc bez trybu testowego trafia do R2.
  const PDF_BYTES = new TextEncoder().encode('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
  const req = (base: string, withPdf = false) => {
    const fd = new FormData();
    if (withPdf)
      fd.set('pdf', new Blob([PDF_BYTES], { type: 'application/pdf' }), 'audyt_mixture.pdf');
    fd.set('email', 't@example.com');
    fd.set('url', 'https://example.com');
    fd.set('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');
    fd.set('captcha_token', 'XXXX.DUMMY.TOKEN.XXXX');
    return new Request(`${base}/api/audit/capture-lead`, {
      method: 'POST',
      body: fd,
      headers: { 'cf-connecting-ip': '2.2.2.2' },
    });
  };
  type ACtx = Parameters<typeof auditLeadPost>[0];
  const run = (env: unknown, r: Request) =>
    auditLeadPost({
      request: r,
      env,
      waitUntil: () => undefined,
    } as unknown as ACtx) as Promise<Response>;
  it('Preview + sekret testowy: success, nagłówek, ZERO zapisów (D1, R2), maili i Lineara', async () => {
    const { env, sql } = auditEnv(TURNSTILE_TEST_SECRET);
    const res = await run(env, req(PREVIEW));
    expect(res.status).toBe(200);
    expect(res.headers.get(TURNSTILE_TEST_HEADER)).toBe('1');
    expect(sql).toEqual([]);
    expect(outbound()).toEqual([]);
  });
  it('Preview + sekret testowy + PDF: ZERO R2, D1, maili i Lineara (r2, mutant N10)', async () => {
    const { env, sql } = auditEnv(TURNSTILE_TEST_SECRET);
    const res = await run(env, req(PREVIEW, true));
    expect(res.status).toBe(200);
    expect(res.headers.get(TURNSTILE_TEST_HEADER)).toBe('1');
    expect(sql).toEqual([]);
    expect(outbound()).toEqual([]);
  });
  it('bliźniak z PDF: sekret prawdziwy na produkcji = zapis R2 i D1 (asercja R2 może się zaczerwienić)', async () => {
    siteverify = { success: true };
    const real = auditEnv(REAL_SECRET);
    const ok = await run(real.env, req(PROD, true));
    expect(ok.status).toBe(200);
    expect(real.sql).toContain('R2');
    expect(real.sql.some((s) => s.startsWith('INSERT'))).toBe(true);
  });
  it('bliźniak: sekret prawdziwy na produkcji zapisuje leada; A: sekret testowy na produkcji = 503', async () => {
    siteverify = { success: true };
    const real = auditEnv(REAL_SECRET);
    const ok = await run(real.env, req(PROD));
    expect(ok.status).toBe(200);
    expect(real.sql.some((s) => s.startsWith('INSERT'))).toBe(true);
    const t = auditEnv(TURNSTILE_TEST_SECRET);
    const bad = await run(t.env, req(PROD));
    expect(bad.status).toBe(503);
    expect(t.sql).toEqual([]);
  });
});
