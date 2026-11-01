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
import { HOST_CRM, URL_CRM_INGEST, jestCrm } from '../../tests/helpers/hostCrm';

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
// Wejście → Linear: atrapy sieci, prawdziwy SQLite z migracją 0010.
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
    expect(zb.liczba()).toBe(1); // tylko zgłoszenie do Lineara (kopii do CRM już nie ma)
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
    expect(zb.liczba() - przed).toBe(1); // tylko komentarz do Lineara
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

  it('(−) ścieżka z modułem Lineara nie dotyka CRM: zero fetch do hosta CRM, Linear działa bez CRM_INGEST_SECRET', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    await wywolaj(srv, { action: 'update', id, edit_token, step: 2, details: { message: 'a' } });
    await wywolaj(srv, { action: 'send_notification', id, edit_token, type: 'abandoned_step_2' });
    expect(siec.crm).toBe(0);
    expect(siec.hosty.some((h) => h.includes(HOST_CRM))).toBe(false);
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

  // ── Pola techniczne nie trafiają do komentarza w Linearze ──────────────────────────────────

  it.each(['captcha_token', 'website_verify', 'privacy', 'id'])(
    'update step=2: pole techniczne „%s” nie trafia do komentarza, zwykłe pole tak',
    async (techniczne) => {
      const { env: srv } = srodowisko();
      const { id, edit_token } = await utworz(srv);
      const r = await wywolaj(srv, {
        action: 'update',
        id,
        edit_token,
        step: 2,
        details: { company: 'Firma Testowa', [techniczne]: 'wartosc-techniczna-777' },
      });
      expect(r.status).toBe(200);
      const kom = siec.linear.filter((w) => w.op === 'Komentarz').map((w) => w.vars.input);
      expect(kom).toHaveLength(1);
      const tresc = String((kom[0] as { body: string }).body);
      expect(tresc).toContain('Firma Testowa');
      expect(tresc).not.toContain('wartosc-techniczna-777');
    },
  );

  // ── Limity długości pól (400 po polsku, po stronie serwera) ────────────────────────────────

  /** Odmowa za długie pole: 400, komunikat, zero zapisu, zero Lineara, zero maili, zero Turnstile. */
  const oczekujOdmowy = async (
    srv: ReturnType<typeof srodowisko>['env'],
    db: ReturnType<typeof srodowisko>['db'],
    body: unknown,
    komunikat: string,
  ) => {
    const r = await wywolaj(srv, body);
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ message: komunikat });
    expect(siec.linear).toHaveLength(0);
    expect(siec.resend).toBe(0);
    expect(siec.hosty).not.toContain('challenges.cloudflare.com');
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(db.prepare('SELECT COUNT(*) AS n FROM leads').get()).toEqual({ n: 0 });
    expect(zb.liczba()).toBe(0);
  };

  const tekst = (n: number) => 'a'.repeat(n);

  it('(−) create: imię 20 000 znaków → 400 z komunikatem po polsku, nic nie jest zapisane ani wysłane', async () => {
    const { env: srv, db } = srodowisko();
    await oczekujOdmowy(
      srv,
      db,
      { action: 'create', lead: { ...lead, name: tekst(20_000) } },
      'Pole „Imię i nazwisko” może mieć maks. 200 znaków.',
    );
  });

  it.each([
    ['name', 'Imię i nazwisko', 200],
    ['email', 'E-mail', 254],
    ['phone', 'Telefon', 40],
    ['service_interest', 'Usługa', 100],
    ['captcha_token', 'Token captcha', 2048],
    ['pole_dodatkowe', 'pole_dodatkowe', 1000],
  ])(
    'create: pole „%s” – limit %i znaków: powyżej 400, dokładnie na limicie przechodzi dalej',
    async (pole, etykieta, max) => {
      const { env: srv, db } = srodowisko();
      await oczekujOdmowy(
        srv,
        db,
        { action: 'create', lead: { ...lead, [pole]: tekst(Number(max) + 1) } },
        `Pole „${etykieta}” może mieć maks. ${max} znaków.`,
      );
      const ok = await wywolaj(srv, {
        action: 'create',
        lead: { ...lead, [pole]: tekst(Number(max)) },
      });
      // captcha_token na limicie jest już „zły” dla atrapy Turnstile (403), pozostałe przechodzą.
      expect(ok.status).toBe(pole === 'captcha_token' ? 403 : 200);
    },
  );

  it('(−) create: adres źródłowy powyżej 2048 znaków → 400', async () => {
    const { env: srv, db } = srodowisko();
    await oczekujOdmowy(
      srv,
      db,
      { action: 'create', lead, source_url: `https://x.pl/${tekst(2048)}` },
      'Pole „Adres źródłowy” może mieć maks. 2048 znaków.',
    );
  });

  it('(−) create: pole o złym typie (obiekt w imieniu) → 400, liczba pól ponad 40 → 400', async () => {
    const { env: srv, db } = srodowisko();
    await oczekujOdmowy(
      srv,
      db,
      { action: 'create', lead: { ...lead, name: { a: 1 } } },
      'Pole „Imię i nazwisko” ma nieprawidłowy format.',
    );
    const wiele = Object.fromEntries(Array.from({ length: 41 }, (_, i) => [`p${i}`, 'x']));
    await oczekujOdmowy(
      srv,
      db,
      { action: 'create', lead: { ...lead, ...wiele } },
      'Za dużo pól w zgłoszeniu (maks. 40).',
    );
  });

  it('create na granicach limitów → 200, zadanie w Linearze powstaje (imię 200 znaków)', async () => {
    const { env: srv } = srodowisko();
    const r = await wywolaj(srv, {
      action: 'create',
      lead: { ...lead, name: tekst(200), phone: tekst(40), service_interest: tekst(100) },
    });
    expect(r.status).toBe(200);
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
  });

  it('(−) update: wiadomość 5001 znaków → 400, zero komentarzy; 5000 znaków → 200 i komentarz', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    const krok = (message: string) =>
      wywolaj(srv, { action: 'update', id, edit_token, step: 2, details: { message } });
    const za = await krok(tekst(5001));
    expect(za.status).toBe(400);
    expect(za.body).toEqual({ message: 'Pole „Wiadomość” może mieć maks. 5000 znaków.' });
    expect(ileOp(siec, 'Komentarz')).toBe(0);
    const ok = await krok(tekst(5000));
    expect(ok.status).toBe(200);
    expect(ileOp(siec, 'Komentarz')).toBe(1);
  });

  it('(−) update: details za duże (łącznie), nie-obiekt, id, token i typ ponad limit → 400', async () => {
    const { env: srv } = srodowisko();
    const { id, edit_token } = await utworz(srv);
    const duze = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`p${i}`, tekst(900)]));
    const r1 = await wywolaj(srv, { action: 'update', id, edit_token, step: 2, details: duze });
    expect([r1.status, r1.body]).toEqual([
      400,
      { message: 'Zgłoszenie jest za duże (maks. 20000 znaków).' },
    ]);
    const r2 = await wywolaj(srv, { action: 'update', id, edit_token, step: 2, details: 'tekst' });
    expect([r2.status, r2.body]).toEqual([
      400,
      { message: 'Pole „details” ma nieprawidłowy format.' },
    ]);
    const r3 = await wywolaj(srv, { action: 'update', id: tekst(101), edit_token, step: 1 });
    expect([r3.status, r3.body]).toEqual([
      400,
      { message: 'Pole „Identyfikator” może mieć maks. 100 znaków.' },
    ]);
    const r4 = await wywolaj(srv, { action: 'get_lead', id, edit_token: tekst(501) });
    expect([r4.status, r4.body]).toEqual([
      400,
      { message: 'Pole „Token leada” może mieć maks. 500 znaków.' },
    ]);
    const r5 = await wywolaj(srv, { action: 'send_notification', id, edit_token, type: tekst(41) });
    expect([r5.status, r5.body]).toEqual([
      400,
      { message: 'Pole „Typ” może mieć maks. 40 znaków.' },
    ]);
    expect(ileOp(siec, 'Komentarz')).toBe(0);
  });

  it('(−) update ze złym tokenem i za długim polem: nadal 403 dla złego tokenu (limit nie ujawnia więcej)', async () => {
    const { env: srv } = srodowisko();
    const { id } = await utworz(srv);
    const r = await wywolaj(srv, {
      action: 'update',
      id,
      edit_token: 'zly',
      step: 2,
      details: { message: tekst(9000) },
    });
    expect(r.status).toBe(403);
    expect(r.body).toEqual({ message: 'Brak lub niepoprawny token leada' });
  });
});

describe('contact-submit — bez wysyłki do Mixture CRM', () => {
  const CRM_ENV = {
    CRM_INGEST_URL: URL_CRM_INGEST,
    CRM_INGEST_SECRET: 'x'.repeat(64),
  };
  let wywolane: string[];
  let czekaj: Promise<unknown>[];

  beforeEach(() => {
    wywolane = [];
    czekaj = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        wywolane.push(String(url));
        if (String(url).includes('turnstile')) return new Response('{"success":true}');
        return new Response('{}', { status: 200 });
      }),
    );
  });

  function zWaitUntil(env: unknown, body: unknown) {
    const request = new Request('https://x/api/contact-submit', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '2.2.2.2' },
    });
    return onRequestPost({
      request,
      env,
      waitUntil: (p: Promise<unknown>) => czekaj.push(p),
    } as unknown as Ctx) as Promise<Response>;
  }

  it('create przy ustawionych CRM_INGEST_URL/SECRET: 0 fetch do CRM, mail do agencji wychodzi', async () => {
    const res = await zWaitUntil(
      { ...makeEnv(), ...CRM_ENV },
      {
        action: 'create',
        lead: { id: 'nowy', name: 'A', email: 'a@example.com', captcha_token: 'ok' },
      },
    );
    await Promise.all(czekaj);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, degraded: false });
    expect(wywolane.filter(jestCrm)).toEqual([]);
    expect(wywolane.filter((u) => u.includes('resend'))).toHaveLength(1);
  });

  it('update (krok 1 i 3) przy ustawionych CRM_INGEST_*: 0 fetch do CRM, mail dopiero w kroku 3', async () => {
    const env = { ...makeEnv(), ...CRM_ENV };
    const edit_token = await tok(EXISTING);
    for (const step of [1, 3]) {
      const res = await zWaitUntil(env, {
        action: 'update',
        id: EXISTING,
        edit_token,
        step,
        details: { name: 'A', email: 'a@example.com', message: 'ok' },
      });
      expect(res.status).toBe(200);
    }
    await Promise.all(czekaj);
    expect(wywolane.filter(jestCrm)).toEqual([]);
    expect(wywolane.filter((u) => u.includes('resend'))).toHaveLength(1);
  });
});
