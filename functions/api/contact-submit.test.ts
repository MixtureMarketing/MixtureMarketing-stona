import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './contact-submit';
import { podpiszLead } from './_leadToken';
import {
  ileOp,
  srodowiskoWejsc,
  stubSieci,
  wierszeLinear,
  zbieracz,
  type Siec,
} from '../../tests/helpers/wejsciaLinear';

type Ctx = Parameters<typeof onRequestPost>[0];

const EXISTING = 'lead-istnieje';

function makeEnv() {
  const store = new Map<string, string>();
  return {
    DB: {
      prepare: (sql: string) => ({
        bind: (...args: unknown[]) => ({
          first: async () => (sql.includes('SELECT 1') && args[0] === EXISTING ? { ok: 1 } : null),
          run: async () => ({
            meta: { changes: sql.startsWith('UPDATE') && args.at(-1) === EXISTING ? 1 : 0 },
          }),
        }),
      }),
    },
    CACHE: {
      get: async (k: string) => store.get(k) ?? null,
      put: async (k: string, v: string) => {
        store.set(k, v);
      },
    },
    TURNSTILE_SECRET: 's',
    RESEND_API_KEY: 're',
    NOTIFY_EMAIL: 'agencja@example.com',
  };
}

function call(env: unknown, body: unknown) {
  const request = new Request('https://x/api/contact-submit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '1.1.1.1' },
  });
  return onRequestPost({ request, env } as unknown as Ctx) as Promise<Response>;
}

// Ważny token edycji (klucz awaryjny = TURNSTILE_SECRET z makeEnv). Testy poniżej sprawdzają
// logikę za bramką tokenu, więc wołają akcje tak, jak robi to prawdziwy formularz.
const tok = (id: string) => podpiszLead({ TURNSTILE_SECRET: 's' }, id);

let emails: number;
beforeEach(() => {
  emails = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).includes('resend')) emails++;
      return new Response('{"success":false}');
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('contact-submit — akcje bez captchy', () => {
  it('send_notification dla nieistniejącego leada nie wysyła maila', async () => {
    const res = await call(makeEnv(), {
      action: 'send_notification',
      id: 'zmyslone',
      edit_token: await tok('zmyslone'),
      type: 'success',
    });
    expect(res.status).toBe(200);
    expect(emails).toBe(0);
  });

  it('send_notification dla istniejącego leada wysyła maila tylko raz na typ', async () => {
    const env = makeEnv();
    const edit_token = await tok(EXISTING);
    await call(env, { action: 'send_notification', id: EXISTING, edit_token, type: 'success' });
    await call(env, { action: 'send_notification', id: EXISTING, edit_token, type: 'success' });
    expect(emails).toBe(1);
  });

  it('update step=3 dla nieistniejącego leada nie wysyła maila', async () => {
    const res = await call(makeEnv(), {
      action: 'update',
      id: 'zmyslone',
      edit_token: await tok('zmyslone'),
      step: 3,
      details: { message: 'pilne: zadzwoń' },
    });
    expect(res.status).toBe(200);
    expect(emails).toBe(0);
  });

  it('update step=3 dla istniejącego leada wysyła maila', async () => {
    await call(makeEnv(), {
      action: 'update',
      id: EXISTING,
      edit_token: await tok(EXISTING),
      step: 3,
      details: { message: 'ok' },
    });
    expect(emails).toBe(1);
  });

  it('create bez poprawnej captchy → 403', async () => {
    const res = await call(makeEnv(), {
      action: 'create',
      lead: { id: 'n', name: 'A', email: 'a@example.com', captcha_token: 'zly' },
    });
    expect(res.status).toBe(403);
    expect(emails).toBe(0);
  });

  it('limit per IP dla akcji bez captchy → 429', async () => {
    const env = makeEnv();
    let last = 200;
    for (let i = 0; i < 31; i++) {
      last = (await call(env, { action: 'get_lead', id: 'x' })).status;
    }
    expect(last).toBe(429);
  });
});

describe('contact-submit — create nie gubi leada po cichu', () => {
  const lead = { id: 'nowy', name: 'A', email: 'a@example.com', captcha_token: 'dobry' };

  function stubNetwork(resendStatus: number) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('turnstile')) return new Response('{"success":true}');
        emails++;
        return new Response('{}', { status: resendStatus });
      }),
    );
  }

  function envWithBrokenDb() {
    return {
      ...makeEnv(),
      DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => null,
            run: async () => {
              throw new Error('D1_ERROR: overloaded');
            },
          }),
        }),
      },
    };
  }

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('D1 i Resend padły → 500 LEAD_NOT_SAVED (użytkownik widzi błąd i może ponowić)', async () => {
    stubNetwork(500);
    const res = await call(envWithBrokenDb(), { action: 'create', lead });
    expect(res.status).toBe(500);
    expect(((await res.json()) as { code: string }).code).toBe('LEAD_NOT_SAVED');
  });

  it('D1 padło, ale mail wyszedł → sukces (degraded)', async () => {
    stubNetwork(200);
    const res = await call(envWithBrokenDb(), { action: 'create', lead });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, degraded: true });
    expect(emails).toBe(1);
  });

  it('D1 zapisało, mail padł → sukces (lead jest w bazie)', async () => {
    stubNetwork(500);
    const res = await call(makeEnv(), { action: 'create', lead });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, degraded: true });
  });

  it('wszystko OK → sukces bez degraded', async () => {
    stubNetwork(200);
    const res = await call(makeEnv(), { action: 'create', lead });
    expect(await res.json()).toMatchObject({ success: true, degraded: false });
  });
});

// ---------------------------------------------------------------------------------------------
// Wejście → Linear (MIX-490, zadanie 3): atrapy sieci, prawdziwy SQLite z migracją 0010.
// ---------------------------------------------------------------------------------------------

describe('contact-submit — zgłoszenie do Lineara', () => {
  let siec: Siec;
  let zb: ReturnType<typeof zbieracz>;

  beforeEach(() => {
    siec = stubSieci({ captchaOk: (t) => t === 'dobry' });
    zb = zbieracz();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const lead = { name: 'Jan', email: 'jan@firma.pl', captcha_token: 'dobry' };

  const srodowisko = (dodatkowe: Record<string, unknown> = {}) =>
    srodowiskoWejsc(siec, {
      TURNSTILE_SECRET: 's',
      RESEND_API_KEY: 're',
      NOTIFY_EMAIL: 'agencja@example.com',
      ...dodatkowe,
    });

  const wywolaj = async (srv: unknown, body: unknown, ip = '1.1.1.1') => {
    const request = new Request('https://x/api/contact-submit', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': ip },
    });
    const res = (await onRequestPost({
      request,
      env: srv,
      waitUntil: zb.waitUntil,
    } as unknown as Ctx)) as Response;
    await zb.czekaj();
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  };

  /** create: po nim lead ma wiersz `linear_leady` w stanie `wyslany` (zadanie powstało). */
  const utworz = async (srv: ReturnType<typeof srodowisko>['env']) => {
    const odp = await wywolaj(srv, { action: 'create', lead });
    return { id: odp.body.id as string, edit_token: odp.body.edit_token as string, odp };
  };

  it('create: jedno zgłoszenie w tle, zadanie powstaje PO zapisie w leads, odpowiedź bez zmian', async () => {
    const { env: srv, db } = srodowisko();
    const { id, odp } = await utworz(srv);
    expect(odp.status).toBe(200);
    expect(odp.body).toEqual({
      success: true,
      id,
      edit_token: expect.any(String),
      degraded: false,
    });
    expect(zb.liczba()).toBe(2); // kopia do CRM (zawsze w tle) + zgłoszenie do Lineara
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
    expect(siec.linear.find((w) => w.op === 'ZadanieUtworz')?.vars).toMatchObject({
      input: { id, teamId: 'team-1' },
    });
    const poLeads = siec.os.indexOf('sql:INSERT leads');
    const poLinear = siec.os.indexOf('fetch:api.linear.app');
    expect(poLeads).toBeGreaterThanOrEqual(0);
    expect(poLinear).toBeGreaterThan(poLeads);
    expect(db.prepare('SELECT stan, issue_id FROM linear_leady WHERE lead_id = ?').get(id)).toEqual(
      {
        stan: 'wyslany',
        issue_id: id,
      },
    );
  });

  it('update step=2 i step=3 → po jednym komentarzu; powtórka kroku → 0 (blokada KV)', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    const krok = (step: number) =>
      wywolaj(srv, {
        action: 'update',
        id,
        edit_token,
        step,
        details: { message: `krok ${step}`, privacy: true },
      });
    const przed = zb.liczba();
    expect((await krok(2)).status).toBe(200);
    expect(zb.liczba() - przed).toBe(2); // kopia do CRM + komentarz do Lineara
    expect(ileOp(siec, 'Komentarz')).toBe(1);
    expect((await krok(3)).status).toBe(200);
    expect(ileOp(siec, 'Komentarz')).toBe(2);
    await krok(2);
    await krok(3);
    expect(ileOp(siec, 'Komentarz')).toBe(2);
    const kom = siec.linear.filter((w) => w.op === 'Komentarz').map((w) => w.vars.input);
    expect(kom[0]).toMatchObject({ issueId: id, body: expect.stringContaining('krok2') });
    expect(kom[1]).toMatchObject({ issueId: id, body: expect.stringContaining('krok3') });
    expect(JSON.stringify(kom)).not.toContain('privacy'); // pola techniczne nie trafiają do komentarza
  });

  it('update step=1 (wznowienie formularza) → żadnego komentarza', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    const r = await wywolaj(srv, { action: 'update', id, edit_token, step: 1, details: {} });
    expect(r.status).toBe(200);
    expect(ileOp(siec, 'Komentarz')).toBe(0);
  });

  it('abandoned_step_2 → komentarz „porzucony po kroku 2”, mail do agencji wychodzi jak dziś (5A)', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    const maileDoTej = siec.resend;
    const r = await wywolaj(srv, {
      action: 'send_notification',
      id,
      edit_token,
      type: 'abandoned_step_2',
    });
    expect(r.status).toBe(200);
    expect(siec.resend).toBe(maileDoTej + 1);
    expect(ileOp(siec, 'Komentarz')).toBe(1);
    expect(siec.linear.at(-1)?.vars.input).toMatchObject({
      issueId: id,
      body: expect.stringContaining('porzucony po kroku 2'),
    });
  });

  it('abandoned_step_1 → komentarz „porzucony po kroku 1”; success → bez komentarza', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    await wywolaj(srv, { action: 'send_notification', id, edit_token, type: 'success' });
    expect(ileOp(siec, 'Komentarz')).toBe(0);
    await wywolaj(srv, { action: 'send_notification', id, edit_token, type: 'abandoned_step_1' });
    expect(ileOp(siec, 'Komentarz')).toBe(1);
    expect(siec.linear.at(-1)?.vars.input).toMatchObject({
      body: expect.stringContaining('porzucony po kroku 1'),
    });
  });

  it('update step=2 przy stanie innym niż „wyslany” (zadanie jeszcze nie powstało) → 0 komentarzy', async () => {
    const { env: srv, db } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    db.prepare("UPDATE linear_leady SET stan = 'kolejka' WHERE lead_id = ?").run(id);
    await wywolaj(srv, { action: 'update', id, edit_token, step: 2, details: { message: 'a' } });
    expect(ileOp(siec, 'Komentarz')).toBe(0);
  });

  it('(−) honeypot w lead albo na wierzchu → 403, zero wywołań Lineara, zero wierszy linear_leady', async () => {
    const { env: srv, db } = srodowisko();
    const a = await wywolaj(srv, { action: 'create', lead: { ...lead, website_verify: 'bot' } });
    const b = await wywolaj(srv, { action: 'create', lead, website_verify: 'bot' });
    expect([a.status, b.status]).toEqual([403, 403]);
    expect(a.body).toEqual({ message: 'Spam detected' });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) zła captcha → 403 z komunikatem, zero wywołań Lineara, zero wierszy', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, { action: 'create', lead: { ...lead, captcha_token: 'zly' } });
    expect(r.status).toBe(403);
    expect(r.body).toEqual({ message: 'Weryfikacja captcha nieudana' });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) przekroczony limit IP (akcje bez captchy) → 429 i zero nowych komentarzy w Linearze', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    for (let i = 0; i < 30; i++) await wywolaj(srv, { action: 'get_lead', id: 'x' });
    const komentarzePrzed = ileOp(siec, 'Komentarz');
    const r = await wywolaj(srv, {
      action: 'update',
      id,
      edit_token,
      step: 2,
      details: { message: 'za późno' },
    });
    expect(r.status).toBe(429);
    expect(r.body).toEqual({ message: 'Zbyt wiele żądań' });
    expect(ileOp(siec, 'Komentarz')).toBe(komentarzePrzed);
  });

  it('(−) błąd D1 przy zapisie (stored=false): 500 LEAD_NOT_SAVED albo degradacja, nigdy wywołanie Lineara', async () => {
    const zepsuta = {
      prepare: () => ({
        bind: () => ({
          first: async () => null,
          run: async () => {
            throw new Error('D1_ERROR: overloaded');
          },
        }),
      }),
    };
    const { env: baza } = srodowisko();
    // Resend odpada, więc nie ma ani rekordu, ani maila → 500.
    const odpadaMail = stubSieci({ captchaOk: true });
    vi.mocked(fetch).mockImplementation(async (url) => {
      const host = new URL(String(url)).host;
      odpadaMail.hosty.push(host);
      if (host === 'challenges.cloudflare.com') return new Response('{"success":true}');
      if (host === 'api.linear.app') odpadaMail.linear.push({ op: 'x', vars: {} });
      return new Response('{}', { status: 500 });
    });
    const bez = await wywolaj({ ...baza, DB: zepsuta }, { action: 'create', lead });
    expect(bez.status).toBe(500);
    expect(bez.body.code).toBe('LEAD_NOT_SAVED');
    expect(odpadaMail.linear).toHaveLength(0);
    // Mail wychodzi → 200 degraded, lead nadal nie jest zgłaszany.
    const zMailem = stubSieci({ captchaOk: true });
    const deg = await wywolaj({ ...baza, DB: zepsuta }, { action: 'create', lead });
    expect(deg.status).toBe(200);
    expect(deg.body).toMatchObject({ success: true, degraded: true });
    expect(zMailem.hosty).not.toContain('api.linear.app');
    expect(zMailem.linear).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) ścieżka z modułem Lineara nie dotyka CRM: zero fetch do mixture-crm, Linear działa bez CRM_INGEST_SECRET', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    await wywolaj(srv, { action: 'update', id, edit_token, step: 2, details: { message: 'a' } });
    await wywolaj(srv, { action: 'send_notification', id, edit_token, type: 'abandoned_step_2' });
    expect(siec.crm).toBe(0);
    expect(siec.hosty.some((h) => h.includes('mixture-crm'))).toBe(false);
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
    expect(ileOp(siec, 'Komentarz')).toBe(2);
  });

  it('(−) wyjątek w module Lineara (D1 bez tabeli linear_leady) nie zmienia kodu ani treści odpowiedzi', async () => {
    const wzorzec = srodowisko();
    const zwykla = await utworz(wzorzec.env);
    const { env: srv, DB } = srodowisko();
    const bezTabeli = {
      prepare: (sql: string) => {
        if (/linear_leady/.test(sql)) throw new Error('D1_ERROR: no such table: linear_leady');
        return DB.prepare(sql);
      },
    };
    const r = await wywolaj({ ...srv, DB: bezTabeli }, { action: 'create', lead });
    expect(r.status).toBe(zwykla.odp.status);
    expect(Object.keys(r.body).sort()).toEqual(Object.keys(zwykla.odp.body).sort());
    expect(r.body).toMatchObject({ success: true, degraded: false });
  });

  it('(−) wyjątek w sieci Lineara przy kroku formularza nie zmienia odpowiedzi update', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    siec.linearPada = true;
    const r = await wywolaj(srv, {
      action: 'update',
      id,
      edit_token,
      step: 3,
      details: { message: 'a' },
    });
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ success: true });
  });
});
