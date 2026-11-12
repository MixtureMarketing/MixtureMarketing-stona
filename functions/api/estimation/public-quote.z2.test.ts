// MIX-1383 (SPEC-MIX-1320 §6 A8, A9, A10, A12, A16; §7 Z2): formy ataku na POST public-quote.
// Każda forma idzie przez obie ścieżki przełącznika QUOTE_LIMITS_D1 ('0' = stara, '1' = bramka
// MIX-1382 z licznikami na prawdziwym SQLite, migracja 0010). Każda odmowa sprawdza kod HTTP
// i stały kod powodu; każda ma dozwolonego bliźniaka (200). Żądania są niezależne (unikalne IP
// i e-mail na wywołanie), więc kolejność testów nie wpływa na wynik.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { onRequestPost, MAX_BODY_BYTES } from './public-quote';
import { QUOTE_TURNSTILE, quoteTurnstileExpect } from './_quoteGate';
import { parseTurnstileExtraHosts, verifyTurnstileStrict } from '../_shared/security';
import { PUBLIC_QUOTE_TURNSTILE_ACTION } from '../../../lib/estimation/turnstileAction';

type Ctx = Parameters<typeof onRequestPost>[0];
const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
const MIG = readFileSync('migrations/0010_rate_counters.sql', 'utf8');

const DEFS = [
  {
    code: 'project_goal',
    answer_type: 'select',
    options_json: '[{"value":"x","label":"X"},{"value":"sklep","label":"Sklep"}]',
  },
  { code: 'views_count', answer_type: 'number', options_json: null },
  { code: 'languages', answer_type: 'number', options_json: null },
  {
    code: 'users_type',
    answer_type: 'multiselect',
    options_json: '[{"value":"nikt","label":"Nikt"},{"value":"klienci","label":"Klienci"}]',
  },
  { code: 'notes', answer_type: 'text', options_json: null },
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

const LEAK = 'D1_ERROR: no such table: est_levels SQLITE_ERROR';

/** D1: liczniki na SQLite (ten sam SQL co w D1), biblioteka z atrapy; `throwLib` = błąd D1. */
function makeDb(throwLib = false) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(MIG);
  const stats = { libReads: 0, leadInserts: 0 };
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
      const res = async () => {
        stats.libReads++;
        if (throwLib) throw new Error(LEAK);
        return { results: route(sql) };
      };
      return {
        all: res,
        bind: () => {
          if (sql.includes('INSERT INTO leads')) stats.leadInserts++;
          return { run: async () => ({ meta: { last_row_id: 42 } }), all: res };
        },
      };
    },
    batch: async () => [],
  };
  return { DB, stats };
}

type Mode = '0' | '1';
function makeEnv(mode: Mode, opts: { throwLib?: boolean; extra?: Record<string, unknown> } = {}) {
  const db = makeDb(opts.throwLib);
  const env: Record<string, unknown> = {
    DB: db.DB,
    CACHE: { get: async () => null, put: async () => undefined },
    TURNSTILE_SECRET: 'sekret',
    QUOTE_LIMITS_D1: mode,
    QUOTE_KEY_HMAC_SECRET: 'k'.repeat(40),
    ...opts.extra,
  };
  return { env, stats: db.stats };
}

let seq = 0;
/** Unikalne IP i e-mail na wywołanie: limity Z1 nie mieszają się między przypadkami. */
function uniq() {
  seq++;
  return { ip: `10.${(seq >> 16) & 255}.${(seq >> 8) & 255}.${seq & 255}`, email: `u${seq}@x.pl` };
}

const ANS = { project_goal: 'x' };
function request(o: {
  answers?: unknown;
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
}) {
  const u = uniq();
  const body = o.body ?? { answers: o.answers ?? ANS, email: u.email, captcha_token: 'tok' };
  return new Request('https://mixturemarketing.pl/api/estimation/public-quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': u.ip, ...o.headers },
    body: o.raw ?? JSON.stringify(body),
  });
}

async function call(env: Record<string, unknown>, r: Request) {
  const res = await onRequestPost({ env, request: r } as unknown as Ctx);
  const text = await res.text();
  const body = JSON.parse(text) as Record<string, unknown>;
  return { status: res.status, reason: body.reason, body, text, res };
}
const post = (env: Record<string, unknown>, o: Parameters<typeof request>[0] = {}) =>
  call(env, request(o));
const OK = { status: 200, reason: undefined };

// siteverify: domyślnie poprawna odpowiedź; przypadek może podmienić `sv`.
const TS_OK = { success: true, hostname: 'mixturemarketing.pl', action: 'public_quote' };
let sv: () => Promise<Response>;
let siteverifyCalls = 0;
beforeEach(() => {
  siteverifyCalls = 0;
  sv = async () => new Response(JSON.stringify(TS_OK));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).includes('siteverify')) {
        siteverifyCalls++;
        return sv();
      }
      return new Response('{}');
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe.each<[string, Mode]>([
  ['stara ścieżka (QUOTE_LIMITS_D1=0)', '0'],
  ['bramka MIX-1382 (QUOTE_LIMITS_D1=1)', '1'],
])('Z2 %s', (_name, mode) => {
  it('A8 forma 3: D1 rzuca w wycenie → 500 bez szczegółów, stały kod; log bez message; bliźniak 200', async () => {
    const log = vi.mocked(console.error);
    const { env } = makeEnv(mode, { throwLib: true });
    const r = await post(env);
    expect(r.status).toBe(500);
    expect(r.body).toEqual({ error: 'Błąd serwera. Spróbuj później.', reason: 'wewnętrzny' });
    for (const leak of ['D1_ERROR', 'est_levels', 'SQLITE', 'stack', 'at '])
      expect(r.text).not.toContain(leak);
    expect(log.mock.calls.flat().join(' ')).not.toContain('est_levels');
    expect(await post(makeEnv(mode).env)).toMatchObject(OK);
  });

  it('A9 forma 4: select spoza opcji → 400 „opcja: spoza listy”, 0 leadów; bliźniak: opcja z listy 200', async () => {
    const { env, stats } = makeEnv(mode);
    for (const v of ['blog', '<img src=x onerror=alert(1)>'])
      expect(await post(env, { answers: { project_goal: v } })).toMatchObject({
        status: 400,
        reason: 'opcja: spoza listy project_goal',
      });
    expect(stats.leadInserts).toBe(0);
    expect(await post(env, { answers: { project_goal: 'sklep' } })).toMatchObject(OK);
    expect(stats.leadInserts).toBe(1);
  });

  it('A9 forma 5: multiselect z jedną obcą wartością → 400; bliźniak: wszystkie z listy 200', async () => {
    const { env } = makeEnv(mode);
    expect(await post(env, { answers: { ...ANS, users_type: ['klienci', 'obcy'] } })).toMatchObject(
      { status: 400, reason: 'opcja: spoza listy users_type' },
    );
    expect(await post(env, { answers: { ...ANS, users_type: ['nikt', 'klienci'] } })).toMatchObject(
      OK,
    );
  });

  it('A9 forma 6: tekst 201 znaków i <img onerror> → 400; bliźniak: 200 zwykłych znaków 200', async () => {
    const { env } = makeEnv(mode);
    expect(await post(env, { answers: { ...ANS, notes: 'a'.repeat(201) } })).toMatchObject({
      status: 400,
      reason: 'tekst: za długi notes',
    });
    expect(
      await post(env, { answers: { ...ANS, notes: '<img src=x onerror=alert(1)>' } }),
    ).toMatchObject({ status: 400, reason: 'tekst: znaki notes' });
    expect(await post(env, { answers: { ...ANS, notes: 'a'.repeat(200) } })).toMatchObject(OK);
  });

  it('A9 forma 7: treść 1 MB i 17 kB → 413 przed Turnstile i D1; bliźniak: 16 kB i zwykła 200', async () => {
    const { env, stats } = makeEnv(mode);
    for (const size of [1024 * 1024, 17 * 1024]) {
      const pad = 'a'.repeat(size);
      const r = await post(env, { answers: { ...ANS, notes: pad } });
      expect(r).toMatchObject({ status: 413, reason: 'body: za duży' });
      expect(r.text).not.toContain('aaaa');
    }
    // Nagłówek Content-Length większy niż limit = odmowa bez czytania treści.
    expect(
      await post(env, { headers: { 'content-length': String(MAX_BODY_BYTES + 1) } }),
    ).toMatchObject({ status: 413, reason: 'body: za duży' });
    expect(await post(env, { headers: { 'content-length': '12abc' } })).toMatchObject({
      status: 400,
      reason: 'body: content-length',
    });
    // Wielobajtowe znaki liczą się w bajtach: 8200 × „ż” = 16 400 B (> 16 384) przy 8 200 znakach.
    expect(await post(env, { answers: { ...ANS, notes: 'ż'.repeat(8200) } })).toMatchObject({
      status: 413,
      reason: 'body: za duży',
    });
    expect(siteverifyCalls).toBe(0);
    expect(stats.libReads).toBe(0);
    // Bliźniak: treść dokładnie 16 384 B przechodzi limit rozmiaru (odmowa dopiero za długi tekst).
    const u = uniq();
    const base = JSON.stringify({
      answers: { ...ANS, notes: '' },
      email: u.email,
      captcha_token: 'tok',
    });
    const exact = JSON.stringify({
      answers: { ...ANS, notes: 'a'.repeat(MAX_BODY_BYTES - base.length) },
      email: u.email,
      captcha_token: 'tok',
    });
    expect(exact.length).toBe(MAX_BODY_BYTES);
    expect(await post(env, { raw: exact })).toMatchObject({
      status: 400,
      reason: 'tekst: za długi notes',
    });
    expect(await post(env)).toMatchObject(OK);
  });

  it('A10 forma 8: −5, 0, 1e9, "5", 1.5 → 400 z kodem; NaN (nie-JSON) → 400; bliźniaki: 1/500, 1/20 → 200', async () => {
    const { env } = makeEnv(mode);
    for (const v of [-5, 0, 1e9, 501])
      expect(await post(env, { answers: { ...ANS, views_count: v } })).toMatchObject({
        status: 400,
        reason: 'liczba: zakres views_count',
      });
    for (const v of [-5, 0, 1e9, 21])
      expect(await post(env, { answers: { ...ANS, languages: v } })).toMatchObject({
        status: 400,
        reason: 'liczba: zakres languages',
      });
    for (const v of ['5', 1.5, 'NaN'])
      expect(await post(env, { answers: { ...ANS, languages: v } })).toMatchObject({
        status: 400,
        reason: 'liczba: typ languages',
      });
    const nan = `{"answers":{"project_goal":"x","languages":NaN},"email":"${uniq().email}","captcha_token":"tok"}`;
    expect((await post(env, { raw: nan })).status).toBe(400);
    for (const views_count of [1, 500])
      expect(await post(env, { answers: { ...ANS, views_count } })).toMatchObject(OK);
    for (const languages of [1, 20])
      expect(await post(env, { answers: { ...ANS, languages } })).toMatchObject(OK);
  });

  it('forma 14: obcy kod pytania w odpowiedziach → 400 „kod: spoza listy”; bliźniak: same kody publiczne 200', async () => {
    const { env } = makeEnv(mode);
    expect(await post(env, { answers: { ...ANS, sla_value: 99.9 } })).toMatchObject({
      status: 400,
      reason: 'kod: spoza listy',
    });
    expect(await post(env, { answers: { ...ANS, languages: 2 } })).toMatchObject(OK);
  });

  it('A12 formy 9-10: obcy hostname, sztuczka sufiksu, www, brak, wielkie litery → 403 „captcha: hostname”; bliźniak 200', async () => {
    const { env, stats } = makeEnv(mode);
    for (const hostname of [
      'evil.example',
      'mixturemarketing.pl.evil.example',
      'evilmixturemarketing.pl',
      'www.mixturemarketing.pl',
      'MIXTUREMARKETING.PL',
      '',
      undefined,
      ['mixturemarketing.pl'],
    ]) {
      sv = async () => new Response(JSON.stringify({ ...TS_OK, hostname }));
      expect(await post(env)).toMatchObject({ status: 403, reason: 'captcha: hostname' });
    }
    expect(stats.leadInserts).toBe(0);
    sv = async () => new Response(JSON.stringify(TS_OK));
    expect(await post(env)).toMatchObject(OK);
  });

  it('B2: host Preview z QUOTE_TURNSTILE_EXTRA_HOSTS → 200; bez zmiennej, spoza listy, sufiks, gwiazdka, schemat, ścieżka → 403 „captcha: hostname”', async () => {
    const PREVIEW = 'f4b-preview.mixturemarketing-stona.pages.dev';
    const withHost = (hostname: string) => {
      sv = async () => new Response(JSON.stringify({ ...TS_OK, hostname }));
    };
    const extra = (v: string) => makeEnv(mode, { extra: { QUOTE_TURNSTILE_EXTRA_HOSTS: v } });
    const denied = { status: 403, reason: 'captcha: hostname' };

    // Bliźniak dozwolony: host wpisany w zmienną (także z odstępami i wielkimi literami).
    withHost(PREVIEW);
    expect(await post(extra(PREVIEW).env)).toMatchObject(OK);
    expect(
      await post(extra(`  F4B-Preview.MixtureMarketing-Stona.pages.dev , `).env),
    ).toMatchObject(OK);
    expect(await post(extra(`other.example.com,${PREVIEW}`).env)).toMatchObject(OK);
    // Produkcja dalej przechodzi przy ustawionej zmiennej.
    withHost('mixturemarketing.pl');
    expect(await post(extra(PREVIEW).env)).toMatchObject(OK);

    // Ten sam host bez zmiennej albo z pustą zmienną → 403.
    withHost(PREVIEW);
    const noVar = makeEnv(mode);
    expect(await post(noVar.env)).toMatchObject(denied);
    expect(noVar.stats.leadInserts).toBe(0);
    expect(await post(extra('').env)).toMatchObject(denied);
    expect(await post(extra('  ,  ').env)).toMatchObject(denied);

    // Host spoza listy (obcy alias tego samego projektu Pages) → 403.
    withHost('evil.mixturemarketing-stona.pages.dev');
    expect(await post(extra(PREVIEW).env)).toMatchObject(denied);
    // Sufiks nie wystarcza: wpis domeny nadrzędnej nie wpuszcza aliasu.
    withHost(PREVIEW);
    expect(await post(extra('mixturemarketing-stona.pages.dev').env)).toMatchObject(denied);
    withHost(`x.${PREVIEW}`);
    expect(await post(extra(PREVIEW).env)).toMatchObject(denied);

    // Wpisy z gwiazdką, schematem, ścieżką, portem albo spacją w środku są pomijane → 403.
    withHost(PREVIEW);
    for (const bad of [
      '*.mixturemarketing-stona.pages.dev',
      `*${PREVIEW}`,
      `https://${PREVIEW}`,
      `${PREVIEW}/`,
      `${PREVIEW}/api`,
      `${PREVIEW}:443`,
      `f4b preview.mixturemarketing-stona.pages.dev`,
    ]) {
      expect(await post(extra(bad).env)).toMatchObject(denied);
    }
    // Siteverify zwraca dosłownie gwiazdkę, a zmienna ma gwiazdkę → 403.
    withHost('*.mixturemarketing-stona.pages.dev');
    expect(await post(extra('*.mixturemarketing-stona.pages.dev').env)).toMatchObject(denied);
  });

  it('A12 forma 11: action obca, pusta albo brak → 403 „captcha: action”; bliźniak: public_quote 200', async () => {
    const { env } = makeEnv(mode);
    for (const action of ['contact', '', 'public_quote ', undefined, null]) {
      sv = async () => new Response(JSON.stringify({ ...TS_OK, action }));
      expect(await post(env)).toMatchObject({ status: 403, reason: 'captcha: action' });
    }
    sv = async () => new Response(JSON.stringify(TS_OK));
    expect(await post(env)).toMatchObject(OK);
  });

  it('A12 forma 12: siteverify błąd sieci, nie-JSON, HTTP 500, null, success≠true → 403 fail-closed; bliźniak 200', async () => {
    const { env, stats } = makeEnv(mode);
    const cases: Array<[() => Promise<Response>, string]> = [
      [
        async () => Promise.reject(new TypeError('fetch failed')),
        'captcha: siteverify niedostępny',
      ],
      [async () => new Response('<html>502</html>'), 'captcha: siteverify niedostępny'],
      [
        async () => new Response(JSON.stringify(TS_OK), { status: 500 }),
        'captcha: siteverify http',
      ],
      [async () => new Response('null'), 'captcha: siteverify odpowiedź'],
      [
        async () => new Response(JSON.stringify({ ...TS_OK, success: 'true' })),
        'captcha: odrzucony',
      ],
      [
        async () => new Response(JSON.stringify({ ...TS_OK, success: false })),
        'captcha: odrzucony',
      ],
    ];
    for (const [fn, reason] of cases) {
      sv = fn;
      expect(await post(env)).toMatchObject({ status: 403, reason });
    }
    expect(stats.leadInserts).toBe(0);
    sv = async () => new Response(JSON.stringify(TS_OK));
    expect(await post(env)).toMatchObject(OK);
  });

  it('A12: brak tokenu, token nie-string, token > 2048 znaków, brak sekretu → 403 bez wołania siteverify', async () => {
    const { env } = makeEnv(mode);
    for (const captcha_token of [undefined, '', 123, 't'.repeat(2049)]) {
      const u = uniq();
      expect(
        await post(env, { body: { answers: ANS, email: u.email, captcha_token } }),
      ).toMatchObject({ status: 403, reason: 'captcha: token' });
    }
    const noSecret = makeEnv(mode, { extra: { TURNSTILE_SECRET: '' } }).env;
    expect(await post(noSecret)).toMatchObject({ status: 403, reason: 'captcha: brak sekretu' });
    expect(siteverifyCalls).toBe(0);
    const u = uniq();
    expect(
      await post(env, { body: { answers: ANS, email: u.email, captcha_token: 't'.repeat(2048) } }),
    ).toMatchObject(OK);
  });

  it('A16 forma 13: bez Origin i z obcym Origin te same bramki: bez tokenu 403, z tokenem 200', async () => {
    const { env } = makeEnv(mode);
    const variants: Array<Record<string, string>> = [
      {},
      { origin: 'https://mixturemarketing.pl' },
      { origin: 'https://evil.example' },
      { origin: 'null' },
    ];
    for (const headers of variants) {
      const u = uniq();
      const noTok = await post(env, { headers, body: { answers: ANS, email: u.email } });
      expect(noTok).toMatchObject({ status: 403, reason: 'captcha: token' });
      const ok = await post(env, { headers });
      expect(ok).toMatchObject(OK);
      expect(ok.res.headers.get('Access-Control-Allow-Origin')).toBe('https://mixturemarketing.pl');
    }
    // Ten sam limit treści i walidacja bez Origin.
    expect(await post(env, { answers: { ...ANS, languages: 0 } })).toMatchObject({
      status: 400,
      reason: 'liczba: zakres languages',
    });
  });
});

describe('verifyTurnstileStrict: oczekiwania puste = odmowa (fail-closed)', () => {
  it('pusta allowlista hostów albo pusta akcja → „captcha: brak oczekiwań”, bez siteverify; bliźniak QUOTE_TURNSTILE → ok', async () => {
    expect(
      await verifyTurnstileStrict('tok', 's', '', { hostnames: [], action: 'public_quote' }),
    ).toEqual({ ok: false, reason: 'captcha: brak oczekiwań' });
    expect(
      await verifyTurnstileStrict('tok', 's', '', {
        hostnames: ['mixturemarketing.pl'],
        action: '',
      }),
    ).toEqual({ ok: false, reason: 'captcha: brak oczekiwań' });
    expect(siteverifyCalls).toBe(0);
    expect(QUOTE_TURNSTILE).toEqual({ hostnames: ['mixturemarketing.pl'], action: 'public_quote' });
    expect(await verifyTurnstileStrict('tok', 's', '', QUOTE_TURNSTILE)).toEqual({ ok: true });
  });
});

describe('MIX-1383 B1/B2: wspólna akcja i lista hostów Preview z env', () => {
  it('akcja serwera = stała frontu public_quote', () => {
    expect(PUBLIC_QUOTE_TURNSTILE_ACTION).toBe('public_quote');
    expect(QUOTE_TURNSTILE.action).toBe(PUBLIC_QUOTE_TURNSTILE_ACTION);
    expect(quoteTurnstileExpect({}).action).toBe(PUBLIC_QUOTE_TURNSTILE_ACTION);
  });

  it('parseTurnstileExtraHosts: allowlista nazw hostów, reszta pomijana; brak/nie-tekst = []', () => {
    expect(parseTurnstileExtraHosts(undefined)).toEqual([]);
    expect(parseTurnstileExtraHosts(null)).toEqual([]);
    expect(parseTurnstileExtraHosts(42)).toEqual([]);
    expect(parseTurnstileExtraHosts(['a.pages.dev'])).toEqual([]);
    expect(parseTurnstileExtraHosts('')).toEqual([]);
    expect(parseTurnstileExtraHosts('   ')).toEqual([]);
    expect(
      parseTurnstileExtraHosts(
        [
          '*.x.pages.dev',
          'https://a.pages.dev',
          'a.pages.dev/x',
          'a.pages.dev:8788',
          'a b.pages.dev',
          'localhost',
          '-a.pages.dev',
          'a-.pages.dev',
          'a..pages.dev',
          '.a.pages.dev',
          'a.pages.dev.',
          'a_b.pages.dev',
          `${'a'.repeat(64)}.pages.dev`,
          `${'a.'.repeat(126)}dev`,
        ].join(','),
      ),
    ).toEqual([]);
    expect(parseTurnstileExtraHosts(' A.Pages.Dev ,b-1.x.pages.dev,a.pages.dev')).toEqual([
      'a.pages.dev',
      'b-1.x.pages.dev',
    ]);
    expect(quoteTurnstileExpect({ QUOTE_TURNSTILE_EXTRA_HOSTS: 'a.pages.dev,*.b' })).toEqual({
      hostnames: ['mixturemarketing.pl', 'a.pages.dev'],
      action: 'public_quote',
    });
    expect(quoteTurnstileExpect({})).toEqual(QUOTE_TURNSTILE);
  });
});
