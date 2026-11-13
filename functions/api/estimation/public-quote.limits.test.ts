// MIX-1382: limity publicznej wyceny (QUOTE_LIMITS_D1='1'), formy ataku PROJEKT-MIX-1382 §4.
// Liczniki na prawdziwym SQLite (node:sqlite, migracja 0010, ten sam SQL co w D1); biblioteka
// wyceny z atrapy (jak public-quote.test). Każda odmowa sprawdza kod HTTP i linię powodu.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { onRequestPost } from './public-quote';
import { hmacHex } from '../_shared/gateCounter';
import { sha256Hex } from '../_shared/security';

type Ctx = Parameters<typeof onRequestPost>[0];
const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
const MIG = readFileSync('migrations/0010_rate_counters.sql', 'utf8');
const SECRET = 'k'.repeat(40);

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
  ['public_rate_per_hour', '5'],
  ['public_archetype_fallback', '{"sklep":"woocommerce"}'],
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
  if (sql.includes("visibility = 'public'"))
    return [{ code: 'project_goal', answer_type: 'select', options_json: '[{"value":"x"}]' }];
  if (sql.includes('FROM est_questions'))
    return [{ code: 'project_goal', text: 'Cel?', unknown_weight: 1, visible_if_json: null }];
  if (sql.includes('FROM est_rules'))
    return [
      {
        id: 1,
        name: 'rec X',
        condition_json: '{"q":"project_goal","op":"eq","val":"x"}',
        actions_json: '[{"type":"recommend_archetype","code":"x","reason":"bo x"}]',
        reason_template: '',
        priority: 0,
      },
    ];
  if (sql.includes('FROM est_params')) return PARAMS;
  if (sql.includes('FROM est_aspects'))
    return [{ code: 'frontend', name: 'Frontend', category: 'A' }];
  return [];
}

// { delayMs }: odpowiedź D1 opóźniona PRZED wykonaniem (test timeoutu);
// { latencyMs }: jak prawdziwe D1, instrukcja wykonuje się od razu i atomowo, a wynik wraca po
// czasie sieci. W tym oknie inne żądania wykonują swoje instrukcje, więc licznik „odczyt, potem
// zapis” (dwie instrukcje) czyta stary stan i przepuszcza za dużo (Z1-A4).
type CounterMode = 'sqlite' | 'throw' | 'hang' | { delayMs: number } | { latencyMs: number };

function makeDb(mode: CounterMode = 'sqlite') {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(MIG);
  const stats = { counterCalls: 0, libReads: 0, leadInserts: 0, inserts: 0 };
  /** Tekst każdej instrukcji first() na rate_counters (kształt: jedna instrukcja na licznik). */
  const counterSql: string[] = [];
  const DB = {
    prepare(sql: string) {
      if (sql.includes('rate_counters')) {
        const st = sqlite.prepare(sql);
        const isUpsert = sql.startsWith('INSERT');
        return {
          bind: (...v: unknown[]) => ({
            first: async () => {
              stats.counterCalls += isUpsert ? 1 : 0;
              counterSql.push(sql);
              if (mode === 'throw') throw new Error('D1_ERROR: tabela');
              if (mode === 'hang') return new Promise(() => undefined);
              if (typeof mode === 'object' && 'latencyMs' in mode) {
                const out = st.get(...(v as never[])) ?? null;
                await new Promise((r) => setTimeout(r, mode.latencyMs));
                return out;
              }
              if (typeof mode === 'object') await new Promise((r) => setTimeout(r, mode.delayMs));
              return st.get(...(v as never[])) ?? null;
            },
            run: async () => st.run(...(v as never[])),
          }),
        };
      }
      const res = () => {
        if (sql.includes('FROM est_')) stats.libReads++;
        return { results: route(sql) };
      };
      return {
        all: async () => res(),
        bind: () => {
          if (/INSERT/i.test(sql)) stats.inserts++;
          if (sql.includes('INSERT INTO leads')) stats.leadInserts++;
          return { run: async () => ({ meta: { last_row_id: 42 } }), all: async () => res() };
        },
      };
    },
    batch: async () => [],
  };
  return { DB, sqlite, stats, counterSql };
}

const kvSpy = { get: vi.fn(async () => null), put: vi.fn(async () => undefined) };

function makeEnv(extra: Record<string, unknown> = {}, mode?: CounterMode) {
  const db = makeDb(mode);
  return {
    ...db,
    env: {
      DB: db.DB,
      CACHE: kvSpy,
      TURNSTILE_SECRET: 'sekret',
      QUOTE_LIMITS_D1: '1',
      QUOTE_KEY_HMAC_SECRET: SECRET,
      RESEND_API_KEY: 're_test',
      NOTIFY_EMAIL: 'biuro@mixturemarketing.pl',
      ...extra,
    } as Record<string, unknown>,
  };
}

/** Żądanie bez normalizacji nagłówków (forma ` 1.2.3.4` dochodzi do bramki bez zmian). */
function req(o: {
  ip?: string | null;
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
  query?: string;
}) {
  const h: Record<string, string> = { 'content-type': 'application/json', ...(o.headers ?? {}) };
  if (o.ip !== null) h['cf-connecting-ip'] = o.ip ?? '9.9.9.9';
  const text = o.raw ?? JSON.stringify(o.body ?? VALID);
  return {
    url: `https://mixturemarketing.pl/api/estimation/public-quote${o.query ? `?${o.query}` : ''}`,
    headers: { get: (n: string) => h[n.toLowerCase()] ?? null },
    text: async () => text,
    json: async () => JSON.parse(text),
  } as unknown as Request;
}

const VALID = { answers: { project_goal: 'x' }, email: 'jan@x.pl', captcha_token: 'tok' };
/** Pola siteverify sprawdzane od MIX-1383 (A12): host produkcji i akcja kalkulatora. */
const TS_OK = { hostname: 'mixturemarketing.pl', action: 'public_quote' };
let mails: Array<{ to: string[]; subject: string; html: string }> = [];
let usedTokens = new Set<string>();
let singleUse = false;

async function call(
  env: Record<string, unknown>,
  r: Request,
  waitUntil?: (p: Promise<unknown>) => void,
) {
  const res = await onRequestPost({ env, request: r, waitUntil } as unknown as Ctx);
  const body = (await res.json()) as Record<string, unknown>;
  return {
    status: res.status,
    reason: body.reason,
    body,
    retryAfter: res.headers.get('Retry-After'),
  };
}
const post = (env: Record<string, unknown>, o: Parameters<typeof req>[0] = {}) => call(env, req(o));
const ok200 = { status: 200, reason: undefined };

beforeEach(() => {
  mails = [];
  usedTokens = new Set();
  singleUse = false;
  kvSpy.get.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).includes('siteverify')) {
        const tok = new URLSearchParams(String(init?.body)).get('response') ?? '';
        const reused = singleUse && usedTokens.has(tok);
        usedTokens.add(tok);
        return new Response(
          JSON.stringify({ ...TS_OK, success: tok.startsWith('tok') && !reused }),
        );
      }
      if (String(url).includes('resend')) mails.push(JSON.parse(String(init?.body)));
      return new Response('{}');
    }),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const counterRows = (s: InstanceType<typeof DatabaseSync>) =>
  s.prepare('SELECT k, n, win, exp FROM rate_counters').all() as Array<{
    k: string;
    n: number;
    win: number;
    exp: number;
  }>;
const notifyMails = () => mails.filter((m) => m.subject.includes('budżet 80%'));

describe('Z1 limity wyceny (QUOTE_LIMITS_D1=1)', () => {
  it('Z1-A1 honeypot: 403 honeypot, 0 zapytań D1; bliźniak: puste pole → 200', async () => {
    const { env, stats } = makeEnv();
    expect(await post(env, { body: { ...VALID, website_verify: 'bot' } })).toMatchObject({
      status: 403,
      reason: 'honeypot',
    });
    expect(await post(env, { body: { ...VALID, website_verify: 0 } })).toMatchObject({
      status: 403,
      reason: 'honeypot',
    });
    expect(stats).toMatchObject({ counterCalls: 0, libReads: 0, inserts: 0 });
    expect(await post(env, { body: { ...VALID, website_verify: '' } })).toMatchObject(ok200);
  });

  it('Z1-A2 email 3/doba: 3. → 200, 4. → 429 limit e-mail, 0 wysyłek i 0 INSERT', async () => {
    const { env, stats } = makeEnv();
    for (let i = 1; i <= 3; i++) expect(await post(env, { ip: `1.1.1.${i}` })).toMatchObject(ok200);
    const sent = mails.length;
    const ins = stats.inserts;
    const r = await post(env, { ip: '1.1.1.4' });
    expect(r).toMatchObject({ status: 429, reason: 'limit e-mail n=4/3' });
    expect(Number(r.retryAfter)).toBeGreaterThan(0);
    expect(mails.length - sent).toBe(0);
    expect(stats.inserts - ins).toBe(0);
  });

  it('Z1-A3 budżet: 200. → 200, 201. → 429; przy 160. dokładnie 1 powiadomienie, przy 161. zero', async () => {
    const { env } = makeEnv();
    for (let i = 1; i <= 200; i++) {
      const r = await post(env, {
        ip: `10.0.${i >> 8}.${i & 255}`,
        body: { ...VALID, email: `k${i}@x.pl` },
      });
      expect(r.status).toBe(200);
      if (i === 159) expect(notifyMails()).toHaveLength(0);
      if (i === 160 || i === 161) expect(notifyMails()).toHaveLength(1);
    }
    expect(notifyMails()).toHaveLength(1);
    const alert = notifyMails()[0];
    expect(alert.to).toEqual(['biuro@mixturemarketing.pl']);
    expect(`${alert.subject} ${alert.html}`).not.toContain('@');
    expect(alert.subject).toContain('budżet 80% n=160/200');
    expect(
      await post(env, { ip: '10.9.9.9', body: { ...VALID, email: 'k201@x.pl' } }),
    ).toMatchObject({ status: 429, reason: 'budżet dzienny n=201/200' });
  });

  it('Z1-A4 ścisło: 20 równoległych z jednego IP i e-maila → dokładnie 3 × 200; ten sam token 2× → captcha', async () => {
    // Opóźnienie odpowiedzi D1 (5 ms) przeplata żądania: licznik nieatomowy (SELECT, potem
    // INSERT OR REPLACE) przepuszcza tu więcej niż 3 (mutant M1, raport rundy 3).
    const { env, stats, counterSql } = makeEnv({}, { latencyMs: 5 });
    const res = await Promise.all(Array.from({ length: 20 }, () => post(env, { ip: '2.2.2.2' })));
    expect(res.filter((r) => r.status === 200)).toHaveLength(3);
    expect(
      res.filter((r) => r.reason === 'limit e-mail n=4/3' || r.reason === 'limit e-mail n=5/3'),
    ).toHaveLength(2);
    expect(res.filter((r) => String(r.reason).startsWith('limit IP'))).toHaveLength(15);
    expect(stats.leadInserts).toBe(3);
    // Kształt: każda instrukcja licznika to jedno INSERT … ON CONFLICT … DO UPDATE … RETURNING.
    const UPSERT =
      /^INSERT INTO rate_counters[\s\S]*ON CONFLICT\(k\) DO UPDATE[\s\S]*RETURNING n, win$/;
    expect(counterSql.filter((q) => !UPSERT.test(q))).toEqual([]);
    singleUse = true;
    const one = { ...VALID, email: 'raz@x.pl', captcha_token: 'tok-raz' };
    expect(await post(env, { ip: '3.3.3.3', body: one })).toMatchObject(ok200);
    expect(await post(env, { ip: '3.3.3.3', body: one })).toMatchObject({
      status: 403,
      reason: 'captcha: odrzucony',
    });
  });

  it('Z1-A4 bliźniak: 3 kolejno → 200', async () => {
    const { env } = makeEnv();
    for (let i = 0; i < 3; i++) expect(await post(env, { ip: '2.2.2.3' })).toMatchObject(ok200);
  });

  it('Z1-A5 fail-closed: wyjątek D1, brak DB, wiersz n=-1 → 503; D1 sprawne → 200', async () => {
    const t = makeEnv({}, 'throw');
    expect(await post(t.env)).toMatchObject({ status: 503, reason: 'licznik: błąd' });
    expect(t.stats.leadInserts).toBe(0);
    const n = makeEnv({ DB: undefined });
    expect(await post(n.env)).toMatchObject({ status: 503, reason: 'licznik: brak D1' });
    const c = makeEnv();
    const key = `q:ip:${await hmacHex(SECRET, 'ip', 'v4:9.9.9.9')}`;
    const win = Math.floor(Date.now() / 3600000) * 3600;
    c.sqlite.prepare('INSERT INTO rate_counters VALUES (?,?,?,?)').run(key, -1, win, win + 172800);
    expect(await post(c.env)).toMatchObject({ status: 503, reason: 'licznik: uszkodzony' });
    expect(c.stats.leadInserts + c.stats.libReads).toBe(0);
    expect(await post(makeEnv().env)).toMatchObject(ok200);
  });

  it('Z1-A6 limit przed D1: na progu 1 wywołanie licznika, 0 biblioteki, 0 INSERT; poniżej progu biblioteka wczytana', async () => {
    const { env, stats } = makeEnv();
    for (let i = 0; i < 5; i++)
      await post(env, { ip: '4.4.4.4', body: { ...VALID, email: `a${i}@x.pl` } });
    expect(stats.libReads).toBeGreaterThan(0); // bliźniak: poniżej progu
    const before = { ...stats };
    expect(await post(env, { ip: '4.4.4.4', body: { ...VALID, email: 'a9@x.pl' } })).toMatchObject({
      status: 429,
      reason: 'limit IP n=6/5',
    });
    expect(stats.counterCalls - before.counterCalls).toBe(1);
    expect(stats.libReads - before.libReads).toBe(0);
    expect(stats.inserts - before.inserts).toBe(0);
  });

  it('Z1-V1 ipv6 /64: ::1…::5 → 200, ::6 → 429; inny /64 → 200', async () => {
    const { env } = makeEnv();
    for (let i = 1; i <= 5; i++)
      expect(
        await post(env, { ip: `2001:db8:1:2::${i}`, body: { ...VALID, email: `v${i}@x.pl` } }),
      ).toMatchObject(ok200);
    expect(
      await post(env, { ip: '2001:db8:1:2::6', body: { ...VALID, email: 'v6@x.pl' } }),
    ).toMatchObject({ status: 429, reason: 'limit IP n=6/5' });
    expect(
      await post(env, { ip: '2001:db8:1:3::1', body: { ...VALID, email: 'v7@x.pl' } }),
    ).toMatchObject(ok200);
  });

  it('Z1-V2 ip krawędzi: brak cf-connecting-ip → 503; X-Forwarded-For i inne pominięte', async () => {
    const { env, stats } = makeEnv();
    const fwd = (i: number) => ({
      'x-forwarded-for': `7.7.7.${i}`,
      'x-real-ip': `8.8.8.${i}`,
      'true-client-ip': `6.6.6.${i}`,
    });
    expect(await post(env, { ip: null, headers: fwd(1) })).toMatchObject({
      status: 503,
      reason: 'ip: brak',
    });
    expect(stats.counterCalls).toBe(0);
    for (let i = 1; i <= 5; i++)
      expect(
        await post(env, {
          ip: '5.5.5.5',
          headers: fwd(i),
          body: { ...VALID, email: `f${i}@x.pl` },
        }),
      ).toMatchObject(ok200);
    expect(
      await post(env, { ip: '5.5.5.5', headers: fwd(6), body: { ...VALID, email: 'f6@x.pl' } }),
    ).toMatchObject({ status: 429, reason: 'limit IP n=6/5' });
    expect(await post(env, { ip: '5.5.5.6', body: { ...VALID, email: 'f7@x.pl' } })).toMatchObject(
      ok200,
    );
  });

  it.each([
    ['1.2.3.4, 5.6.7.8', 'ip: nieczytelny'],
    [' 1.2.3.4', 'ip: nieczytelny'],
    ['01.2.3.4', 'ip: nieczytelny'],
    ['1.2.3', 'ip: nieczytelny'],
    ['240.1.2.3', 'ip: pseudo-ipv4'],
  ])('Z1-V2b ip allowlista: %j → 503 %s', async (ip, reason) => {
    const { env, stats } = makeEnv();
    expect(await post(env, { ip })).toMatchObject({ status: 503, reason });
    expect(stats.counterCalls).toBe(0);
  });

  it('Z1-V2b bliźniak: 1.2.3.4 i ::ffff:1.2.3.4 to ten sam klucz', async () => {
    const { env } = makeEnv();
    for (let i = 1; i <= 5; i++)
      expect(
        await post(env, {
          ip: i % 2 ? '1.2.3.4' : '::ffff:1.2.3.4',
          body: { ...VALID, email: `m${i}@x.pl` },
        }),
      ).toMatchObject(ok200);
    expect(
      await post(env, { ip: '::ffff:1.2.3.4', body: { ...VALID, email: 'm6@x.pl' } }),
    ).toMatchObject({ status: 429, reason: 'limit IP n=6/5' });
  });

  it('Z1-V3 e-mail norm.: warianty jednego adresu liczą się razem, 4. → 429; inny adres → 200', async () => {
    const { env } = makeEnv();
    // Kolejno, nie równolegle: oczekiwana kolejność statusów [200, 200, 200, 429] jest wtedy
    // deterministyczna (równoległość i ścisłość sprawdza Z1-A4 z opóźnieniem D1).
    const group = async (emails: string[], prefix: string) => {
      const out: Awaited<ReturnType<typeof post>>[] = [];
      for (const [i, email] of emails.entries())
        out.push(await post(env, { ip: `${prefix}.${i}`, body: { ...VALID, email } }));
      return out;
    };
    const a = await group(
      ['Ofiara+1@Example.PL', 'OFIARA@EXAMPLE.PL', 'ofiara+x@example.pl', ' ofiara@example.pl'],
      '20.0.0',
    );
    expect(a.map((r) => r.status)).toEqual([200, 200, 200, 429]);
    expect(a[3].reason).toBe('limit e-mail n=4/3');
    const g = await group(
      ['o.f.i.a.r.a@googlemail.com', 'Ofiara+z@gmail.com', 'of.iara@GMAIL.com', 'ofiara@gmail.com'],
      '20.0.1',
    );
    expect(g.map((r) => r.status)).toEqual([200, 200, 200, 429]);
    expect(
      await post(env, { ip: '20.0.2.1', body: { ...VALID, email: 'inna@example.pl' } }),
    ).toMatchObject(ok200);
  });

  it('Z1-V3 warunek 3: o.f.i.a.r.a@example.pl liczy się osobno od ofiara@example.pl', async () => {
    const { env } = makeEnv();
    for (let i = 0; i < 3; i++)
      expect(
        await post(env, { ip: `21.0.0.${i}`, body: { ...VALID, email: 'ofiara@example.pl' } }),
      ).toMatchObject(ok200);
    expect(
      await post(env, { ip: '21.0.1.1', body: { ...VALID, email: 'o.f.i.a.r.a@example.pl' } }),
    ).toMatchObject(ok200);
    expect(
      await post(env, { ip: '21.0.1.2', body: { ...VALID, email: 'ofiara@example.pl' } }),
    ).toMatchObject({ status: 429, reason: 'limit e-mail n=4/3' });
  });

  it.each([
    'оfiara@example.pl', // cyrylickie о (homoglif)
    'ofiara＠example.pl',
    'ofi ara@example.pl',
    '"a"@x.pl',
    'a@x.pl\nBcc: b@y.pl',
    `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(60)}.pl`,
    '+x@x.pl',
  ])('Z1-V3b allowlista: %j → 400 e-mail: format, licznik bez zmian', async (email) => {
    const { env, sqlite } = makeEnv();
    expect(await post(env, { body: { ...VALID, email } })).toMatchObject({
      status: 400,
      reason: 'e-mail: format',
    });
    expect(counterRows(sqlite)).toHaveLength(0);
  });

  it('Z1-V3b bliźniak: ten sam adres w ASCII → 200', async () => {
    expect(
      await post(makeEnv().env, { body: { ...VALID, email: 'ofiara@example.pl' } }),
    ).toMatchObject(ok200);
  });

  it('Z1-V6 url: query > 256 → 400 url: za długi; 256 → 200', async () => {
    const { env, stats } = makeEnv();
    expect(await post(env, { query: `k=${'a'.repeat(255)}` })).toMatchObject({
      status: 400,
      reason: 'url: za długi',
    });
    expect(stats.counterCalls).toBe(0);
    expect(await post(env, { query: `k=${'a'.repeat(254)}` })).toMatchObject(ok200);
  });

  it('Z1-T1 timeout: licznik milczy 1 500 ms → 503 licznik: timeout, 0 leadów; 50 ms → 200', async () => {
    const h = makeEnv({}, 'hang');
    const t0 = Date.now();
    const p = post(h.env);
    expect(await p).toMatchObject({ status: 503, reason: 'licznik: timeout' });
    expect(Date.now() - t0).toBeGreaterThanOrEqual(1400); // prawdziwy zegar, limit 1 500 ms
    expect(h.stats.leadInserts).toBe(0);
    const s = makeEnv({}, { delayMs: 50 });
    const q = post(s.env);
    expect(await q).toMatchObject(ok200);
  });

  it.each(['0', '00', 'abc', '٣', '99999', ''])(
    'Z1-C1 env: QUOTE_EMAIL_PER_DAY=%j → 503',
    async (v) => {
      const { env, stats } = makeEnv({ QUOTE_EMAIL_PER_DAY: v });
      expect(await post(env)).toMatchObject({
        status: 503,
        reason: 'konfiguracja: QUOTE_EMAIL_PER_DAY',
      });
      expect(stats.counterCalls).toBe(0);
    },
  );

  it('Z1-C1 bliźniaki: brak zmiennej → 3; "5" → 5; zła QUOTE_IP_PER_HOUR i QUOTE_DAILY_BUDGET → 503', async () => {
    const d = makeEnv();
    for (let i = 0; i < 3; i++) await post(d.env, { ip: `30.0.0.${i}` });
    expect(await post(d.env, { ip: '30.0.0.9' })).toMatchObject({
      status: 429,
      reason: 'limit e-mail n=4/3',
    });
    const f = makeEnv({ QUOTE_EMAIL_PER_DAY: '5' });
    for (let i = 0; i < 5; i++)
      expect(await post(f.env, { ip: `31.0.0.${i}` })).toMatchObject(ok200);
    expect(await post(f.env, { ip: '31.0.0.9' })).toMatchObject({
      status: 429,
      reason: 'limit e-mail n=6/5',
    });
    expect(await post(makeEnv({ QUOTE_IP_PER_HOUR: '0' }).env)).toMatchObject({
      status: 503,
      reason: 'konfiguracja: QUOTE_IP_PER_HOUR',
    });
    expect(await post(makeEnv({ QUOTE_DAILY_BUDGET: 'x' }).env)).toMatchObject({
      status: 503,
      reason: 'konfiguracja: QUOTE_DAILY_BUDGET',
    });
  });

  it.each([
    ['brak', undefined],
    ['pusty napis', ''],
    ['31 znaków', 'x'.repeat(31)],
  ])(
    'warunek 2: sekret HMAC %s → 503 konfiguracja: QUOTE_KEY_HMAC_SECRET, 0 liczników',
    async (_n, v) => {
      const { env, stats } = makeEnv({ QUOTE_KEY_HMAC_SECRET: v });
      expect(await post(env)).toMatchObject({
        status: 503,
        reason: 'konfiguracja: QUOTE_KEY_HMAC_SECRET',
      });
      expect(stats.counterCalls + stats.libReads).toBe(0);
    },
  );

  it('warunek 2: w rate_counters tylko HMAC (bez IP, e-maila i zwykłego SHA-256); sekret 32 znaki → 200', async () => {
    const { env, sqlite } = makeEnv({ QUOTE_KEY_HMAC_SECRET: SECRET });
    expect(
      await post(env, { ip: '1.2.3.4', body: { ...VALID, email: 'Ofiara+a@Example.pl' } }),
    ).toMatchObject(ok200);
    const keys = counterRows(sqlite)
      .map((r) => r.k)
      .sort();
    expect(keys).toEqual(
      [
        `q:em:${await hmacHex(SECRET, 'em', 'ofiara@example.pl')}`,
        `q:ip:${await hmacHex(SECRET, 'ip', 'v4:1.2.3.4')}`,
        'q:day',
      ].sort(),
    );
    const all = keys.join(' ');
    for (const plain of ['1.2.3.4', 'ofiara', 'example', await sha256Hex('v1|ip|v4:1.2.3.4')])
      expect(all).not.toContain(plain);
    const other = makeEnv({ QUOTE_KEY_HMAC_SECRET: 'z'.repeat(32) });
    expect(await post(other.env, { ip: '1.2.3.4' })).toMatchObject(ok200);
    expect(counterRows(other.sqlite).map((r) => r.k)).not.toContain(
      `q:ip:${await hmacHex(SECRET, 'ip', 'v4:1.2.3.4')}`,
    );
  });

  it.each([
    ['puste ciało', '', 'body: nieczytelny'],
    ['tablica', '[]', 'body: nieczytelny'],
    ['null', 'null', 'body: nieczytelny'],
    ['nie JSON', '{email:', 'body: nieczytelny'],
    ['liczba', '7', 'body: nieczytelny'],
    ['e-mail null', '{"email":null,"captcha_token":"tok"}', 'e-mail: format'],
  ])('Z1-E1 puste: %s → 400 %s, 0 liczników', async (_n, raw, reason) => {
    const { env, stats } = makeEnv();
    expect(await post(env, { raw })).toMatchObject({ status: 400, reason });
    expect(stats.counterCalls).toBe(0);
  });

  it('Z1-D1 licznik po captchy: 100 POST z e-mailem ofiary i złym tokenem → 403, licznik 0; ofiara potem → 200', async () => {
    const { env, sqlite } = makeEnv();
    for (let i = 0; i < 100; i++)
      expect(
        await post(env, {
          ip: `40.0.0.${i}`,
          body: { ...VALID, email: 'ofiara@example.pl', captcha_token: 'zly' },
        }),
      ).toMatchObject({ status: 403, reason: 'captcha: odrzucony' });
    expect(counterRows(sqlite)).toHaveLength(0);
    expect(
      await post(env, { ip: '40.0.1.1', body: { ...VALID, email: 'ofiara@example.pl' } }),
    ).toMatchObject(ok200);
  });

  it('Z1-W1 okno: 6. o 10:59:59 → 429; cofnięty zegar nie zeruje; 1. o 11:00:00 → 200', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { env } = makeEnv();
    const at = (hms: string) => vi.setSystemTime(new Date(`2026-11-12T${hms}Z`));
    let i = 0;
    const one = () => post(env, { ip: '50.0.0.1', body: { ...VALID, email: `w${i++}@x.pl` } });
    at('10:00:00');
    for (let k = 0; k < 5; k++) expect(await one()).toMatchObject(ok200);
    at('10:59:59');
    const late = await one();
    expect(late).toMatchObject({ status: 429, reason: 'limit IP n=6/5' });
    expect(late.retryAfter).toBe('1');
    at('11:00:00');
    expect(await one()).toMatchObject(ok200);
    for (let k = 0; k < 4; k++) expect(await one()).toMatchObject(ok200);
    at('10:30:00'); // izolat z zegarem cofniętym o godzinę
    expect(await one()).toMatchObject({ status: 429, reason: 'limit IP n=6/5' });
  });

  it('Z1-L1 log: bez @, bez adresów IP; kod powodu, n/l i cf-ray obecne', async () => {
    const lines: string[] = [];
    const grab = (...a: unknown[]) => void lines.push(a.map(String).join(' '));
    vi.spyOn(console, 'error').mockImplementation(grab);
    vi.spyOn(console, 'log').mockImplementation(grab);
    vi.spyOn(console, 'warn').mockImplementation(grab);
    const { env } = makeEnv();
    const ray = { 'cf-ray': '8f1a2b3c4d5e6f70-WAW' };
    for (let i = 0; i < 6; i++)
      await post(env, {
        ip: '61.62.63.64',
        headers: ray,
        body: { ...VALID, email: `Jan.Kowalski+${i}@firma.pl` },
      });
    await post(env, { ip: '2001:db8:aa:bb::1', headers: { 'cf-ray': 'jan@firma.pl' } });
    await post(env, { ip: null, body: { ...VALID, email: 'jan@firma.pl' } });
    await post(env, { ip: '61.62.63.65', body: { ...VALID, email: 'zly@@firma.pl' } });
    await post(makeEnv({}, 'throw').env, { ip: '61.62.63.66' });
    const log = lines.join('\n');
    expect(log).not.toMatch(/@/);
    expect(log).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
    expect(log).not.toMatch(/2001:|db8|kowalski|firma|D1_ERROR/i);
    expect(log).toContain('odmowa 429: limit e-mail n=4/3 ray=8f1a2b3c4d5e6f70-WAW');
    expect(log).toContain('przepuść ray=8f1a2b3c4d5e6f70-WAW');
    expect(log).toContain('odmowa 503: ip: brak ray=-');
    expect(log).toContain('odmowa 503: licznik: błąd');
  });
});

describe('Z1 retencja 48 h (warunek 1) przez endpoint', () => {
  it('żądanie usuwa wiersz starszy niż 48 h i wiersz z przyszłości, świeży zostaje', async () => {
    const { env, sqlite } = makeEnv();
    const now = Math.floor(Date.now() / 1000);
    const ins = sqlite.prepare('INSERT INTO rate_counters VALUES (?,?,?,?)');
    ins.run('q:ip:stary', 3, now - 49 * 3600, now - 3600);
    ins.run('q:ip:swiezy', 2, now - 47 * 3600, now + 3600);
    ins.run('q:ip:przyszly', 1, now + 30 * 86400, now + 32 * 86400);
    const later: Promise<unknown>[] = [];
    expect(await call(env, req({}), (p) => later.push(p))).toMatchObject(ok200);
    await Promise.all(later);
    const keys = counterRows(sqlite).map((r) => r.k);
    expect(keys).toContain('q:ip:swiezy');
    expect(keys).not.toContain('q:ip:stary');
    expect(keys).not.toContain('q:ip:przyszly');
  });

  it('retencja działa też po odmowie 429', async () => {
    const { env, sqlite } = makeEnv({ QUOTE_IP_PER_HOUR: '1' });
    await post(env, { ip: '70.0.0.1' });
    const now = Math.floor(Date.now() / 1000);
    sqlite
      .prepare('INSERT INTO rate_counters VALUES (?,?,?,?)')
      .run('q:ip:stary', 3, now - 49 * 3600, now - 3600);
    expect(await post(env, { ip: '70.0.0.1', body: { ...VALID, email: 'b@x.pl' } })).toMatchObject({
      status: 429,
    });
    expect(counterRows(sqlite).map((r) => r.k)).not.toContain('q:ip:stary');
  });
});

describe('przełącznik QUOTE_LIMITS_D1 (funkcja ukryta)', () => {
  it.each(['true', '1 ', '', 'on', '2'])('%j → 503 konfiguracja: QUOTE_LIMITS_D1', async (v) => {
    const { env, stats } = makeEnv({ QUOTE_LIMITS_D1: v });
    expect(await post(env)).toMatchObject({ status: 503, reason: 'konfiguracja: QUOTE_LIMITS_D1' });
    expect(stats.libReads + stats.counterCalls).toBe(0);
  });

  it.each([
    ['brak', undefined],
    ['"0"', '0'],
  ])('%s → dotychczasowa ścieżka (limiter KV), bez liczników D1', async (_n, v) => {
    const { env, stats } = makeEnv({ QUOTE_LIMITS_D1: v, QUOTE_KEY_HMAC_SECRET: undefined });
    const r = await call(
      env,
      new Request('http://x/api/estimation/public-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '9.9.9.9' },
        body: JSON.stringify(VALID),
      }),
    );
    expect(r.status).toBe(200);
    expect(kvSpy.get).toHaveBeenCalled();
    expect(stats.counterCalls).toBe(0);
  });
});
