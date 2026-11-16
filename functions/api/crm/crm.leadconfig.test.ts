// MIX-1813 (Z10): lead z kalkulatora niesie do CRM gotową konfigurację. Cała droga na prawdziwym
// SQLite z migracjami strony: POST /api/estimation/public-quote zapisuje lead, a podpisany
// GET /api/crm/leady (ten sam, który dociąga CRM) oddaje go w formacie CRM. Biblioteka wyceny z
// atrapy (jak public-quote.test). Testy podpisu w crm.test.ts zostają bez zmian (A14).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DatabaseSync as DatabaseSyncT } from 'node:sqlite';
import { onRequestPost as quote, MAX_BODY_BYTES } from '../estimation/public-quote';
import { onRequestGet as leady } from './leady';
import { podpiszZapytanie } from './_podpis';
import {
  CONFIG_LINK_BASE,
  PHONE_MESSAGE,
  PHONE_REFUSAL,
  LEAD_CONFIG_ENV,
} from '../estimation/_leadConfig';
import {
  decodeConfigLink,
  encodeConfigLink,
} from '../../../components/features/calculator/configLink';
import type { PublicQuestion } from '../../../services/calculatorService';

const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as {
  DatabaseSync: typeof DatabaseSyncT;
};
const SEKRET = 'b'.repeat(64);
const MIGRACJE = [
  '0001_init.sql',
  '0002_leads_add_source_company.sql',
  '0003_estimation_core.sql',
  '0004_est_modules_goals.sql',
  '0005_est_snapshot_offer_fields.sql',
  '0006_est_quote_lifecycle.sql',
  '0007_est_client_content.sql',
  '0008_est_quote_closed.sql',
  '0009_leads_updated_at.sql',
  '0010_rate_counters.sql',
];

// ── Zestaw pytań publicznych (serwer) i biblioteka (atrapa) ──
const OPT_GOAL = [
  { value: 'x', label: 'Strona firmowa' },
  { value: 'y', label: 'Strona wizytówka' },
];
const OPT_FEAT = [
  { value: 'blog', label: 'Blog' },
  { value: 'newsletter', label: 'Newsletter' },
];
const DEFS = [
  { code: 'project_goal', answer_type: 'select', options_json: JSON.stringify(OPT_GOAL) },
  { code: 'features', answer_type: 'multiselect', options_json: JSON.stringify(OPT_FEAT) },
  { code: 'has_cms', answer_type: 'bool', options_json: null },
  { code: 'views_count', answer_type: 'number', options_json: null },
  { code: 'notes', answer_type: 'text', options_json: null },
];
const QTEXT = [
  { code: 'project_goal', text: 'Jaki jest cel projektu?' },
  { code: 'features', text: 'Co ma mieć strona?' },
  { code: 'has_cms', text: 'Czy potrzebny panel?' },
  { code: 'views_count', text: 'Ile podstron?' },
  { code: 'notes', text: 'Uwagi' },
].map((q) => ({ ...q, unknown_weight: 1, visible_if_json: null }));
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
  ['public_rate_per_hour', '50'],
].map(([key, value]) => ({ key, value }));

function lib(sql: string): unknown[] {
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
  if (sql.includes('FROM est_questions')) return QTEXT;
  if (sql.includes('FROM est_rules'))
    return ['x', 'y'].map((v, i) => ({
      id: i + 1,
      name: `rec ${v}`,
      condition_json: `{"q":"project_goal","op":"eq","val":"${v}"}`,
      actions_json: '[{"type":"recommend_archetype","code":"x","reason":"bo x"}]',
      reason_template: '',
      priority: 0,
    }));
  if (sql.includes('FROM est_params')) return PARAMS;
  if (sql.includes('FROM est_aspects'))
    return [{ code: 'frontend', name: 'Frontend', category: 'A' }];
  return [];
}

/** D1: odczyty biblioteki z atrapy, wszystko inne (leads, est_quotes, liczniki, CRM) na SQLite. */
function baza() {
  const db = new DatabaseSync(':memory:');
  for (const m of MIGRACJE)
    db.exec(readFileSync(resolve(__dirname, '../../../migrations', m), 'utf8'));
  const sqls: string[] = [];
  type Arg = string | number | null;
  const real = (sql: string, args: Arg[]) => ({
    bind: (...a: Arg[]) => real(sql, a),
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => {
      const r = db.prepare(sql).run(...args);
      return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    },
  });
  const DB = {
    prepare(sql: string) {
      sqls.push(sql);
      const isLib =
        /^\s*SELECT/.test(sql) && sql.includes('FROM est_') && !sql.includes('FROM leads');
      if (isLib) {
        const res = { results: lib(sql) };
        return { all: async () => res, bind: () => ({ all: async () => res }) };
      }
      return real(sql, []);
    },
    batch: async (st: { run: () => Promise<unknown> }[]) => {
      for (const s of st) await s.run();
      return [];
    },
  };
  const leads = () =>
    db.prepare('SELECT id, email, phone, details FROM leads ORDER BY rowid').all() as {
      id: string;
      email: string;
      phone: string | null;
      details: string;
    }[];
  return { DB, db, sqls, leads };
}

const kv = { get: async () => null, put: async () => undefined };
function srodowisko(extra: Record<string, unknown> = {}) {
  const b = baza();
  return {
    ...b,
    env: {
      DB: b.DB,
      CACHE: kv,
      TURNSTILE_SECRET: 'sekret',
      CRM_STRONA_SECRET: SEKRET,
      [LEAD_CONFIG_ENV]: '1',
      ...extra,
    } as Record<string, unknown>,
  };
}

let tokenNr = 0;
const ANSWERS = {
  project_goal: 'x',
  features: ['newsletter', 'blog'],
  has_cms: true,
  views_count: 12,
  notes: 'Mamy logo',
};
const body = (o: Record<string, unknown> = {}) => ({
  answers: ANSWERS,
  email: 'jan@firma.pl',
  captcha_token: `tok-${++tokenNr}`,
  phone: '+48 600 700 800',
  ...o,
});

async function wyslij(
  env: Record<string, unknown>,
  b: unknown,
  o: { raw?: string; ip?: string } = {},
) {
  const text = o.raw ?? JSON.stringify(b);
  const request = new Request('https://mixturemarketing.pl/api/estimation/public-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': o.ip ?? '9.9.9.9' },
    body: text,
  });
  const res = await (quote as unknown as (c: unknown) => Promise<Response>)({ env, request });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

/** Lead tak, jak widzi go CRM: podpisany GET /api/crm/leady. */
async function crm(env: Record<string, unknown>): Promise<Record<string, unknown>[]> {
  const sciezka = '/api/crm/leady?od=1970-01-01';
  const czas = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomUUID();
  const podpis = await podpiszZapytanie(SEKRET, czas, nonce, 'GET', sciezka);
  const request = new Request(`https://mixturemarketing.pl${sciezka}`, {
    headers: {
      'X-Mixture-Timestamp': czas,
      'X-Mixture-Nonce': nonce,
      'X-Mixture-Signature': podpis,
    },
  });
  const res = await (leady as unknown as (c: unknown) => Promise<Response>)({ env, request });
  expect(res.status).toBe(200);
  return ((await res.json()) as { leady: Record<string, unknown>[] }).leady;
}

const QUESTIONS: PublicQuestion[] = DEFS.map((d) => ({
  code: d.code,
  text: '',
  help_text: null,
  answer_type: d.answer_type,
  options: d.options_json ? (JSON.parse(d.options_json) as PublicQuestion['options']) : null,
  visible_if: null,
  group: null,
  sort_order: 0,
}));

let singleUse = false;
let used = new Set<string>();
let logs: string[] = [];
beforeEach(() => {
  singleUse = false;
  used = new Set();
  logs = [];
  for (const m of ['error', 'log', 'warn', 'info'] as const)
    vi.spyOn(console, m).mockImplementation((...a: unknown[]) => {
      logs.push(a.map(String).join(' '));
    });
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).includes('siteverify')) {
        const tok = new URLSearchParams(String(init?.body)).get('response') ?? '';
        const reused = singleUse && used.has(tok);
        used.add(tok);
        return new Response(
          JSON.stringify({
            success: tok.startsWith('tok') && !reused,
            hostname: 'mixturemarketing.pl',
            action: 'public_quote',
          }),
        );
      }
      return new Response('{}');
    }),
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('K1: lead w CRM niesie konfigurację (LEAD_CONFIG_CRM=1)', () => {
  it('details: etykiety z serwera, link ?k= z serwera, telefon; pole phone w CRM', async () => {
    const s = srodowisko();
    const r = await wyslij(s.env, body());
    expect(r.status).toBe(200);
    const [lead] = await crm(s.env);
    expect(lead.source).toBe('calculator');
    expect(lead.phone).toBe('+48600700800');
    const d = lead.details as Record<string, unknown>;
    expect(d.labels).toEqual([
      { code: 'project_goal', question: 'Jaki jest cel projektu?', answer: 'Strona firmowa' },
      { code: 'features', question: 'Co ma mieć strona?', answer: 'Newsletter, Blog' },
      { code: 'has_cms', question: 'Czy potrzebny panel?', answer: 'Tak' },
      { code: 'views_count', question: 'Ile podstron?', answer: '12' },
      { code: 'notes', question: 'Uwagi', answer: 'Mamy logo' },
    ]);
    const k = encodeConfigLink(QUESTIONS, ANSWERS);
    expect(d.config_link).toBe(`${CONFIG_LINK_BASE}?k=${k}`);
    const back = decodeConfigLink(String(d.config_link).split('?k=')[1], QUESTIONS);
    expect(back).toEqual({ ok: true, answers: ANSWERS, skipped: 0 });
    expect(d.phone).toBe('+48600700800');
    expect(d.answers).toEqual(ANSWERS);
    expect(d.priceRange).toEqual(r.body.priceRange);
    // Planu serwer dziś nie liczy (Z8): klucza nie ma, zamiast pustego obiektu.
    expect('plan' in d).toBe(false);
    expect(Object.keys(d)).toEqual(['answers', 'priceRange', 'labels', 'config_link', 'phone']);
  });

  it('telefon jest opcjonalny: brak, null i pusty tekst = lead bez telefonu', async () => {
    for (const phone of [undefined, null, '', '   ']) {
      const s = srodowisko();
      expect((await wyslij(s.env, body({ phone }))).status).toBe(200);
      const [lead] = await crm(s.env);
      expect(lead.phone ?? null).toBeNull();
      expect('phone' in (lead.details as object)).toBe(false);
      expect((lead.details as Record<string, unknown>).labels).toHaveLength(5);
    }
  });
});

describe('K2: rozmiar i dane osobowe', () => {
  it('details pełnej konfiguracji ≤ 2 kB, treść żądania z telefonem mieści się w limicie', async () => {
    const s = srodowisko();
    const b = body({ answers: { ...ANSWERS, notes: 'a'.repeat(200) } });
    expect(new TextEncoder().encode(JSON.stringify(b)).byteLength).toBeLessThan(MAX_BODY_BYTES);
    expect((await wyslij(s.env, b)).status).toBe(200);
    expect(new TextEncoder().encode(s.leads()[0].details).byteLength).toBeLessThanOrEqual(2048);
  });

  it('logi bez e-maila i telefonu, także przy odmowie telefonu', async () => {
    const s = srodowisko({ [LEAD_CONFIG_ENV]: 'tak' });
    await wyslij(s.env, body({ email: 'ala.tajna@firma.pl' }));
    const s2 = srodowisko();
    await wyslij(s2.env, body({ email: 'ala.tajna@firma.pl', phone: '600 ABC 999' }));
    await wyslij(s2.env, body({ email: 'ala.tajna@firma.pl', phone: '+48 601 702 803' }));
    const all = logs.join('\n');
    expect(all).toContain(`odmowa 400: ${PHONE_REFUSAL.charset}`);
    for (const pii of ['ala.tajna', 'firma.pl', '601702803', '601 702', 'ABC'])
      expect(all).not.toContain(pii);
  });
});

describe('K3: przełącznik wyłączony = dzisiejsze zachowanie bajt w bajt', () => {
  const OLD_SQL = `INSERT INTO leads (id, email, name, service_type, budget, details, source, status)
         VALUES (?, ?, ?, ?, ?, ?, 'calculator', 'new')`;
  for (const flag of [undefined, '', '0', 'true', 'yes', ' 1', 1]) {
    it(`LEAD_CONFIG_CRM=${JSON.stringify(flag)}: stary zapis, telefon z treści nie jest czytany`, async () => {
      const s = srodowisko({ [LEAD_CONFIG_ENV]: flag });
      if (flag === undefined) delete s.env[LEAD_CONFIG_ENV];
      const r = await wyslij(s.env, body({ phone: 'to nie telefon <b>' }));
      expect(r.status).toBe(200);
      expect(Object.keys(r.body)).toEqual(['priceRange', 'currency', 'status']);
      const [row] = s.leads();
      expect(row.phone).toBeNull();
      expect(row.details).toBe(JSON.stringify({ answers: ANSWERS, priceRange: r.body.priceRange }));
      expect(s.sqls.filter((q) => q.startsWith('INSERT INTO leads'))).toEqual([OLD_SQL]);
      const bad = flag !== undefined && flag !== '' && flag !== '0';
      expect(
        logs.some((l) => l.includes('przełącznik wyłączony: konfiguracja: LEAD_CONFIG_CRM')),
      ).toBe(bad);
    });
  }
});

describe('K4: formy ataku (każda z dozwolonym bliźniakiem)', () => {
  it('F1 podrobione etykiety w treści są ignorowane; bliźniak bez nich daje te same etykiety', async () => {
    const s = srodowisko();
    const forged = body({
      labels: [{ code: 'project_goal', question: 'Q', answer: 'PODROBIONE' }],
      options: { project_goal: [{ value: 'x', label: 'PODROBIONE' }] },
      details: { labels: 'PODROBIONE' },
    });
    expect((await wyslij(s.env, forged)).status).toBe(200);
    expect((await wyslij(s.env, body())).status).toBe(200);
    const [a, b] = s.leads();
    expect(a.details).not.toContain('PODROBIONE');
    expect(JSON.parse(a.details).labels).toEqual(JSON.parse(b.details).labels);
    expect(JSON.parse(a.details).labels[0].answer).toBe('Strona firmowa');
  });

  it('F2 nieznany identyfikator opcji: 400 z linią powodu, zero leadów; bliźniak znany: 200', async () => {
    const s = srodowisko();
    const r = await wyslij(s.env, body({ answers: { ...ANSWERS, project_goal: 'zzz' } }));
    expect(r).toMatchObject({ status: 400, body: { reason: 'opcja: spoza listy project_goal' } });
    const m = await wyslij(s.env, body({ answers: { ...ANSWERS, features: ['blog', 'obce'] } }));
    expect(m).toMatchObject({ status: 400, body: { reason: 'opcja: spoza listy features' } });
    expect(s.leads()).toHaveLength(0);
    expect((await wyslij(s.env, body({ answers: { ...ANSWERS, project_goal: 'y' } }))).status).toBe(
      200,
    );
    expect(JSON.parse(s.leads()[0].details).labels[0].answer).toBe('Strona wizytówka');
  });

  it('F3 za długi ?k= od klienta nie trafia do leada; link zawsze z serwera', async () => {
    const s = srodowisko();
    const longK = 'A'.repeat(5000);
    expect(
      (await wyslij(s.env, body({ k: longK, config_link: `${CONFIG_LINK_BASE}?k=${longK}` })))
        .status,
    ).toBe(200);
    expect((await wyslij(s.env, body())).status).toBe(200);
    const [a, b] = s.leads();
    expect(a.details).not.toContain('AAAAAAAAAA');
    expect(JSON.parse(a.details).config_link).toBe(JSON.parse(b.details).config_link);
    expect(String(JSON.parse(a.details).config_link).length).toBeLessThan(
      CONFIG_LINK_BASE.length + 1504,
    );
  });

  it('F4 ?k= z HTML i javascript: nie są odbijane; tekst z HTML w odpowiedzi = 400', async () => {
    const s = srodowisko();
    const r = await wyslij(
      s.env,
      body({ k: '<script>alert(1)</script>', config_link: 'javascript:alert(1)' }),
    );
    expect(r.status).toBe(200);
    const d = s.leads()[0].details;
    expect(d).not.toContain('<script');
    expect(d).not.toContain('javascript:');
    expect(JSON.parse(d).config_link.startsWith(`${CONFIG_LINK_BASE}?k=`)).toBe(true);
    const h = await wyslij(s.env, body({ answers: { ...ANSWERS, notes: '<img src=x>' } }));
    expect(h.status).toBe(400);
    expect(s.leads()).toHaveLength(1);
  });

  it('F5 telefon z literami: 400 i komunikat; bliźniak +48 z odstępami: znormalizowany', async () => {
    const s = srodowisko();
    for (const phone of [
      '600 ABC 800',
      '+48 600 700 8OO',
      '６００７００８００',
      '+48 600700800',
      '600+700800',
    ]) {
      const r = await wyslij(s.env, body({ phone }));
      expect(r).toEqual({
        status: 400,
        body: { error: PHONE_MESSAGE, reason: PHONE_REFUSAL.charset },
      });
    }
    expect(s.leads()).toHaveLength(0);
    for (const phone of [
      '+48 600 700 800',
      '600-700-800',
      '0048 600 700 800',
      '+48 (600) 700.800',
    ]) {
      expect((await wyslij(s.env, body({ phone }))).status).toBe(200);
    }
    expect(s.leads().map((l) => l.phone)).toEqual(Array(4).fill('+48600700800'));
  });

  it('F6 telefon za długi albo zła liczba cyfr: 400 z linią powodu; bliźniak 15 cyfr: 200', async () => {
    const s = srodowisko();
    const tooLong = await wyslij(s.env, body({ phone: '1'.repeat(33) }));
    expect(tooLong.body.reason).toBe(PHONE_REFUSAL.tooLong);
    for (const phone of ['+1234567890123456', '12345', '+1234567', '0600700800']) {
      const r = await wyslij(s.env, body({ phone }));
      expect(r).toMatchObject({ status: 400, body: { reason: PHONE_REFUSAL.length } });
    }
    const typ = await wyslij(s.env, body({ phone: 600700800 }));
    expect(typ).toMatchObject({ status: 400, body: { reason: PHONE_REFUSAL.type } });
    expect(s.leads()).toHaveLength(0);
    expect((await wyslij(s.env, body({ phone: '+123456789012345' }))).status).toBe(200);
    expect(s.leads().map((l) => l.phone)).toEqual(['+123456789012345']);
  });

  it('F7 e-mail z +tag i inną wielkością liter: ten sam licznik (4. wycena = 429); obcy adres: 200', async () => {
    const s = srodowisko({ QUOTE_LIMITS_D1: '1', QUOTE_KEY_HMAC_SECRET: 'k'.repeat(40) });
    const emails = ['jan@firma.pl', 'Jan@FIRMA.pl', 'jan+crm@firma.pl'];
    for (const [i, email] of emails.entries())
      expect((await wyslij(s.env, body({ email }), { ip: `1.1.1.${i + 1}` })).status).toBe(200);
    const fourth = await wyslij(s.env, body({ email: 'JAN+b@firma.pl' }), { ip: '1.1.1.9' });
    expect(fourth).toMatchObject({ status: 429 });
    expect(logs.join('\n')).toContain('limit e-mail n=4/3');
    expect(s.leads()).toHaveLength(3);
    expect((await wyslij(s.env, body({ email: 'ola@firma.pl' }), { ip: '1.1.1.8' })).status).toBe(
      200,
    );
    expect(s.leads()).toHaveLength(4);
    expect(s.leads().every((l) => JSON.parse(l.details).config_link)).toBe(true);
  });

  it('F8 podwójne wysłanie tym samym tokenem: drugie 403 bez leada; bliźniak z nowym tokenem: 200', async () => {
    singleUse = true;
    const s = srodowisko();
    const b = body();
    expect((await wyslij(s.env, b)).status).toBe(200);
    expect(await wyslij(s.env, b)).toMatchObject({
      status: 403,
      body: { reason: 'captcha: odrzucony' },
    });
    expect(s.leads()).toHaveLength(1);
    expect((await wyslij(s.env, { ...b, captcha_token: 'tok-nowy' })).status).toBe(200);
    expect(s.leads()).toHaveLength(2);
  });

  it('F9 brak tokenu Turnstile: 403 bez leada; bliźniak z tokenem: 200', async () => {
    const s = srodowisko();
    const { captcha_token: _drop, ...bez } = body();
    void _drop;
    expect(await wyslij(s.env, bez)).toMatchObject({
      status: 403,
      body: { reason: 'captcha: token' },
    });
    expect(s.leads()).toHaveLength(0);
    expect((await wyslij(s.env, body())).status).toBe(200);
  });

  it('F10 za duża treść: 413 bez leada; bliźniak tuż pod limitem: 200', async () => {
    const s = srodowisko();
    const big = JSON.stringify(body({ pad: 'x'.repeat(MAX_BODY_BYTES) }));
    expect(await wyslij(s.env, null, { raw: big })).toMatchObject({
      status: 413,
      body: { reason: 'body: za duży' },
    });
    expect(s.leads()).toHaveLength(0);
    const base = JSON.stringify(body({ pad: '' }));
    const near = JSON.stringify(body({ pad: 'x'.repeat(MAX_BODY_BYTES - base.length - 10) }));
    expect(near.length).toBeLessThanOrEqual(MAX_BODY_BYTES);
    expect((await wyslij(s.env, null, { raw: near })).status).toBe(200);
    expect(s.leads()).toHaveLength(1);
  });

  it('F11 klucze prototypu: w odpowiedziach 400; w treści nie dają telefonu; bliźniak: 200', async () => {
    const s = srodowisko();
    const proto = `{"answers":{"project_goal":"x","__proto__":{"x":1}},"email":"jan@firma.pl","captcha_token":"tok-p1"}`;
    expect(await wyslij(s.env, null, { raw: proto })).toMatchObject({
      status: 400,
      body: { reason: 'kod: spoza listy' },
    });
    const ctor = await wyslij(s.env, body({ answers: { project_goal: 'x', constructor: 'x' } }));
    expect(ctor).toMatchObject({ status: 400, body: { reason: 'kod: spoza listy' } });
    expect(s.leads()).toHaveLength(0);
    const top = `{"__proto__":{"phone":"+48600700800","labels":"PODROBIONE"},"answers":{"project_goal":"x"},"email":"jan@firma.pl","captcha_token":"tok-p2"}`;
    expect((await wyslij(s.env, null, { raw: top })).status).toBe(200);
    expect(s.leads()[0].phone).toBeNull();
    expect(s.leads()[0].details).not.toContain('PODROBIONE');
    expect((await wyslij(s.env, body({ answers: { project_goal: 'x' } }))).status).toBe(200);
    expect(s.leads()[1].phone).toBe('+48600700800');
  });
});
