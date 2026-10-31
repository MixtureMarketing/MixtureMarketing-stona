import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { onRequestPost } from './public-quote';
import {
  ileOp,
  srodowiskoWejsc,
  stubSieci,
  wierszeLinear,
  zbieracz,
  type Siec,
} from '../../../tests/helpers/wejsciaLinear';

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

  it('przy ustawionych CRM_INGEST_URL/SECRET lead i wycena zapisane, a do CRM nie idzie żaden fetch (MIX-625)', async () => {
    const wywolane: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        wywolane.push(String(url));
        if (String(url).includes('siteverify')) return new Response('{"success":true}');
        return new Response('{}', { status: 201 });
      }),
    );
    const { env, inserts } = makeEnv();
    const czekaj: Promise<unknown>[] = [];
    const ctx = post(
      {
        ...env,
        CRM_INGEST_URL: 'https://mixture-crm.pages.dev/api/ingest/lead',
        CRM_INGEST_SECRET: 'x'.repeat(64),
      },
      VALID,
    ) as unknown as Record<string, unknown>;
    ctx.waitUntil = (p: Promise<unknown>) => czekaj.push(p);
    expect((await onRequestPost(ctx as unknown as Ctx)).status).toBe(200);
    await Promise.all(czekaj);
    expect(czekaj).toHaveLength(0);
    expect(wywolane.filter((u) => /mixture-crm|ingest\/lead/.test(u))).toEqual([]);
    expect(inserts.some((s) => s.includes('INSERT INTO leads'))).toBe(true);
    expect(inserts.some((s) => s.includes('INSERT INTO est_quotes'))).toBe(true);
  });

  it('z kluczem Resend maile do klienta i agencji nadal wychodzą, bez fetchu do CRM (MIX-625)', async () => {
    const wywolane: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        wywolane.push(String(url));
        if (String(url).includes('siteverify')) return new Response('{"success":true}');
        return new Response('{}', { status: 200 });
      }),
    );
    const { env } = makeEnv();
    const res = await onRequestPost(
      post(
        {
          ...env,
          RESEND_API_KEY: 're_test',
          NOTIFY_EMAIL: 'agencja@example.com',
          CRM_INGEST_SECRET: 'x'.repeat(64),
        },
        VALID,
      ),
    );
    expect(res.status).toBe(200);
    expect(wywolane.filter((u) => u.includes('resend'))).toHaveLength(2);
    expect(wywolane.filter((u) => /mixture-crm|ingest\/lead/.test(u))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------
// Wejście → Linear: biblioteka wyceny z atrap, lead/linear_leady w prawdziwym SQLite.
// ---------------------------------------------------------------------------------------------

describe('POST /api/estimation/public-quote — zgłoszenie do Lineara', () => {
  let siec: Siec;
  let zb: ReturnType<typeof zbieracz>;

  beforeEach(() => {
    siec = stubSieci({ captchaOk: (t) => t === 'tok' });
    zb = zbieracz();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  /** Tabele est_* z atrap biblioteki, `leads` i `linear_leady` w SQLite z migracjami. */
  function srodowisko(
    wlasne: {
      psujLeads?: boolean;
      psujLinear?: boolean;
      psujWycene?: boolean;
      psujOdpowiedzi?: boolean;
    } = {},
  ) {
    const wejscia = srodowiskoWejsc(siec, { TURNSTILE_SECRET: 'sekret' });
    const biblioteka = makeDB();
    const DB = {
      prepare: (sql: string) => {
        if (/linear_leady/.test(sql) && wlasne.psujLinear) {
          throw new Error('D1_ERROR: no such table: linear_leady');
        }
        if (/INSERT INTO est_quotes/.test(sql) && wlasne.psujWycene) {
          return {
            bind: () => ({
              run: async () => {
                throw new Error('D1_ERROR: est_quotes overloaded');
              },
            }),
          };
        }
        if (/INSERT INTO leads/.test(sql) && wlasne.psujLeads) {
          return {
            bind: () => ({
              run: async () => {
                throw new Error('D1_ERROR: overloaded');
              },
            }),
          };
        }
        return /linear_leady|\bleads\b/.test(sql)
          ? wejscia.DB.prepare(sql)
          : biblioteka.DB.prepare(sql);
      },
      batch: wlasne.psujOdpowiedzi
        ? async () => {
            throw new Error('D1_ERROR: batch overloaded');
          }
        : biblioteka.DB.batch,
    };
    return { env: { ...wejscia.env, DB }, db: wejscia.db, CACHE: wejscia.CACHE };
  }

  const wywolaj = async (srv: unknown, body: unknown = VALID) => {
    const ctx = post(srv, body) as unknown as Record<string, unknown>;
    ctx.waitUntil = zb.waitUntil;
    const res = await onRequestPost(ctx as unknown as Ctx);
    await zb.czekaj();
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  };

  it('udany zapis leada → jedno zgłoszenie w tle, zadanie z etykietą „kalkulator” PO INSERT leads, odpowiedź bez zmian', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv);
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ priceRange: { min: 500, max: 1500 }, currency: 'PLN', status: 'ok' });
    expect(zb.liczba()).toBe(2); // kopia do CRM + zgłoszenie do Lineara
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
    const lead = db.prepare('SELECT id FROM leads').get() as { id: string };
    expect(siec.linear.find((w) => w.op === 'ZadanieUtworz')?.vars).toMatchObject({
      input: { id: lead.id, teamId: 'team-1', labelIds: ['lab-kalkulator'] },
    });
    expect(siec.os.indexOf('fetch:api.linear.app')).toBeGreaterThan(
      siec.os.indexOf('sql:INSERT leads'),
    );
    expect(db.prepare('SELECT stan FROM linear_leady WHERE lead_id = ?').get(lead.id)).toEqual({
      stan: 'wyslany',
    });
  });

  it('weryfikacja Turnstile idzie wspólnym helperem: ten sam adres, metoda, nagłówek i parametry', async () => {
    const { env: srv } = srodowisko();
    await wywolaj(srv);
    const wywolania = vi.mocked(fetch).mock.calls.filter(([u]) => String(u).includes('siteverify'));
    expect(wywolania).toHaveLength(1);
    const [url, init] = wywolania[0];
    expect(String(url)).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Content-Type')).toBe(
      'application/x-www-form-urlencoded',
    );
    expect(Object.fromEntries(new URLSearchParams(String(init?.body)))).toEqual({
      secret: 'sekret',
      response: 'tok',
      remoteip: '9.9.9.9',
    });
  });

  it('kalkulator nie ma własnej kopii verifyTurnstile: import z _shared/security', () => {
    const zrodlo = readFileSync(resolve(__dirname, 'public-quote.ts'), 'utf8');
    expect(zrodlo).toMatch(
      /import \{[^}]*\bverifyTurnstile\b[^}]*\} from '\.\.\/_shared\/security'/,
    );
    expect(zrodlo).not.toMatch(/function verifyTurnstile/);
  });

  it('(−) błąd sieci Turnstile → 403 (jak dotąd), zero wywołań Lineara', async () => {
    const { env: srv, db } = srodowisko();
    vi.mocked(fetch).mockImplementation(async () => {
      throw new TypeError('fetch failed');
    });
    const r = await wywolaj(srv);
    expect(r.status).toBe(403);
    expect(r.body).toEqual({ error: 'Weryfikacja antybotowa nieudana.' });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
  });

  it('(−) honeypot → 403, zero wywołań Lineara, zero wierszy', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, { ...VALID, website_verify: 'bot' });
    expect(r.status).toBe(403);
    expect(r.body).toEqual({ error: 'Spam detected' });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) zła captcha → 403 z komunikatem, zero wywołań Lineara, zero wierszy', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, { ...VALID, captcha_token: 'zly' });
    expect(r.status).toBe(403);
    expect(r.body).toEqual({ error: 'Weryfikacja antybotowa nieudana.' });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) przekroczony limit IP → 429, zero wywołań Lineara, zero wierszy', async () => {
    const { env: srv, db, CACHE } = srodowisko();
    CACHE.store.set('pubcalc:rl:9.9.9.9', '5');
    const r = await wywolaj(srv);
    expect(r.status).toBe(429);
    expect(r.body).toEqual({ error: 'Zbyt wiele zapytań. Spróbuj za chwilę.' });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) błąd D1 przy zapisie leada → odpowiedź jak dotąd (cena), zero wywołań Lineara', async () => {
    const { env: srv, db } = srodowisko({ psujLeads: true });
    const r = await wywolaj(srv);
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ priceRange: { min: 500, max: 1500 }, currency: 'PLN', status: 'ok' });
    expect(siec.linear).toHaveLength(0);
    expect(siec.hosty).not.toContain('api.linear.app');
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) ścieżka z modułem Lineara nie dotyka CRM: zero fetch do mixture-crm', async () => {
    const { env: srv } = srodowisko();
    await wywolaj(srv);
    expect(siec.crm).toBe(0);
    expect(siec.hosty.some((h) => h.includes('mixture-crm'))).toBe(false);
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
  });

  it('(−) wyjątek w module Lineara (brak tabeli) nie zmienia kodu ani treści odpowiedzi', async () => {
    const { env: srv } = srodowisko({ psujLinear: true });
    const r = await wywolaj(srv);
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ priceRange: { min: 500, max: 1500 }, currency: 'PLN', status: 'ok' });
    expect(siec.linear).toHaveLength(0);
  });

  // ── Kolejność zapisu: lead jest zgłaszany do Lineara, zanim zapis wyceny może się nie udać ──

  it.each(['psujWycene', 'psujOdpowiedzi'] as const)(
    'zapis wyceny pada (%s) po zapisie leada → zadanie w Linearze i tak powstaje, odpowiedź bez zmian',
    async (psuje) => {
      const { env: srv, db } = srodowisko({ [psuje]: true });
      const r = await wywolaj(srv);
      expect(r.status).toBe(200);
      expect(r.body).toEqual({
        priceRange: { min: 500, max: 1500 },
        currency: 'PLN',
        status: 'ok',
      });
      const lead = db.prepare('SELECT id FROM leads').get() as { id: string };
      expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
      expect(siec.linear.find((w) => w.op === 'ZadanieUtworz')?.vars).toMatchObject({
        input: { id: lead.id, labelIds: ['lab-kalkulator'] },
      });
      expect(db.prepare('SELECT stan FROM linear_leady WHERE lead_id = ?').get(lead.id)).toEqual({
        stan: 'wyslany',
      });
      // Kopia do CRM idzie dopiero po pełnym zapisie, więc przy awarii wyceny jej nie ma.
      expect(zb.liczba()).toBe(1);
    },
  );

  // ── Limity długości (400 po polsku, po stronie serwera) ────────────────────────────────────

  const bezSiteverify = () =>
    expect(
      vi.mocked(fetch).mock.calls.filter(([u]) => String(u).includes('siteverify')),
    ).toHaveLength(0);

  it('(−) e-mail 255 znaków → 400 z komunikatem, bez Turnstile, bez zapisu i Lineara', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, { ...VALID, email: `${'a'.repeat(255 - 5)}@x.pl` });
    expect([r.status, r.body]).toEqual([
      400,
      { error: 'Pole „E-mail” może mieć maks. 254 znaków.' },
    ]);
    bezSiteverify();
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(db.prepare('SELECT COUNT(*) AS n FROM leads').get()).toEqual({ n: 0 });
    expect(zb.liczba()).toBe(0);
  });

  it('e-mail dokładnie 254 znaki przechodzi (200)', async () => {
    const { env: srv } = srodowisko();
    const r = await wywolaj(srv, { ...VALID, email: `${'a'.repeat(254 - 5)}@x.pl` });
    expect(r.status).toBe(200);
  });

  it('(−) token captcha 2049 znaków → 400, bez zapytania do Turnstile', async () => {
    const { env: srv } = srodowisko();
    const r = await wywolaj(srv, { ...VALID, captcha_token: 't'.repeat(2049) });
    expect([r.status, r.body]).toEqual([
      400,
      { error: 'Pole „Token captcha” może mieć maks. 2048 znaków.' },
    ]);
    bezSiteverify();
  });

  it('(−) e-mail i token o złym typie (liczba, obiekt) → 400, nie 500', async () => {
    const { env: srv } = srodowisko();
    const a = await wywolaj(srv, { ...VALID, email: 12345 });
    expect([a.status, a.body]).toEqual([400, { error: 'Pole „E-mail” ma nieprawidłowy format.' }]);
    const b = await wywolaj(srv, { ...VALID, captcha_token: { x: 1 } });
    expect([b.status, b.body]).toEqual([
      400,
      { error: 'Pole „Token captcha” ma nieprawidłowy format.' },
    ]);
  });

  it('(−) odpowiedź 2001 znaków → 400 z błędem po polsku, zero zapisu i Lineara; 2000 znaków → 200', async () => {
    const { env: srv, db } = srodowisko();
    const za = await wywolaj(srv, { ...VALID, answers: { project_goal: 'x'.repeat(2001) } });
    expect(za.status).toBe(400);
    expect(za.body).toEqual({
      errors: [
        'Pole „project_goal" może mieć maks. 2000 znaków.',
        'Pole „project_goal" jest wymagane.',
      ],
    });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    const ok = await wywolaj(srv, { ...VALID, answers: { project_goal: 'x'.repeat(2000) } });
    expect(ok.status).toBe(200);
  });

  it('(−) ponad 100 odpowiedzi → 400 z komunikatem po polsku', async () => {
    const { env: srv, db } = srodowisko();
    const wiele = Object.fromEntries(Array.from({ length: 101 }, (_, i) => [`k${i}`, 'x']));
    const r = await wywolaj(srv, { ...VALID, answers: { project_goal: 'x', ...wiele } });
    expect([r.status, r.body]).toEqual([400, { errors: ['Za dużo odpowiedzi (maks. 100).'] }]);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(siec.linear).toHaveLength(0);
  });
});
