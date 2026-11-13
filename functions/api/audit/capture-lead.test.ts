import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './capture-lead';
import {
  ileOp,
  srodowiskoWejsc,
  stubSieci,
  wierszeLinear,
  zbieracz,
  type Siec,
} from '../../../tests/helpers/wejsciaLinear';
import { HOST_CRM, URL_CRM_INGEST, jestCrm } from '../../../tests/helpers/hostCrm';

type Ctx = Parameters<typeof onRequestPost>[0];

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"

function makeKV() {
  const store = new Map<string, string>();
  return {
    store,
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => {
      store.set(k, v);
    },
  };
}

function makeEnv() {
  const inserts: unknown[][] = [];
  return {
    inserts,
    env: {
      DB: {
        prepare: () => ({
          bind: (...args: unknown[]) => ({
            run: async () => {
              inserts.push(args);
              return { meta: { changes: 1 } };
            },
          }),
        }),
      },
      CACHE: makeKV(),
      RESEND_API_KEY: 're_test',
      NOTIFY_EMAIL: 'agencja@example.com',
      TURNSTILE_SECRET: 'secret',
    },
  };
}

function form(fields: Record<string, string | Blob>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v instanceof Blob) fd.append(k, v, 'raport.pdf');
    else fd.append(k, v);
  }
  return fd;
}

function call(env: unknown, fd: FormData, ip = '1.2.3.4') {
  const request = new Request('https://x/api/audit/capture-lead', {
    method: 'POST',
    body: fd,
    headers: { 'cf-connecting-ip': ip },
  });
  return onRequestPost({ request, env } as unknown as Ctx) as Promise<Response>;
}

let fetchMock: ReturnType<typeof vi.fn>;
let emails: Array<{ to: string[]; html: string; attachments?: unknown }>;
let crm: string[];

beforeEach(() => {
  emails = [];
  crm = [];
  fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (String(url).includes('turnstile')) {
      const token = new URLSearchParams(String(init?.body)).get('response');
      return new Response(JSON.stringify({ success: token === 'good' }));
    }
    if (String(url).includes('resend')) {
      emails.push(JSON.parse(String(init?.body)));
      return new Response('{}');
    }
    if (jestCrm(String(url))) {
      crm.push(String(url));
      return new Response('{}', { status: 201 });
    }
    return new Response('{}', { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('audit/capture-lead', () => {
  it('bez tokenu Turnstile → 403 i zero maili', async () => {
    const { env, inserts } = makeEnv();
    const res = await call(
      env,
      form({ email: 'ofiara@example.com', url: 'https://firma.pl', pdf: new Blob([PDF]) }),
    );
    expect(res.status).toBe(403);
    expect(emails).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it('plik, który nie jest PDF-em → 400 i zero maili', async () => {
    const { env } = makeEnv();
    const res = await call(
      env,
      form({
        email: 'a@example.com',
        url: 'https://firma.pl',
        captcha_token: 'good',
        pdf: new Blob(['MZ-not-a-pdf']),
      }),
    );
    expect(res.status).toBe(400);
    expect(emails).toHaveLength(0);
  });

  it('url z innym schematem niż http(s) → 400', async () => {
    const { env } = makeEnv();
    const res = await call(
      env,
      form({ email: 'a@example.com', url: 'javascript:alert(1)', captcha_token: 'good' }),
    );
    expect(res.status).toBe(400);
  });

  it('honeypot → 403', async () => {
    const { env } = makeEnv();
    const res = await call(
      env,
      form({
        email: 'a@example.com',
        url: 'https://firma.pl',
        captcha_token: 'good',
        website_verify: 'bot',
      }),
    );
    expect(res.status).toBe(403);
  });

  it('poprawne zgłoszenie: zapis, mail do użytkownika i agencji, URL escapowany', async () => {
    const { env, inserts } = makeEnv();
    const res = await call(
      env,
      form({
        email: 'klient@example.com',
        url: 'https://firma.pl/"><b>x</b>',
        captcha_token: 'good',
        score: '87',
        pdf: new Blob([PDF]),
      }),
    );
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
    expect(emails.map((e) => e.to[0])).toEqual(['klient@example.com', 'agencja@example.com']);
    for (const e of emails) {
      expect(e.html).not.toContain('<b>x</b>');
      expect(e.html).not.toMatch(/href="[^"]*"[^>]*"/);
    }
  });

  it('limit per adres odbiorcy: 4. zgłoszenie na ten sam adres w ciągu doby → 429', async () => {
    const { env } = makeEnv();
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) {
      const res = await call(
        env,
        form({ email: 'Cel@Example.com', url: 'https://firma.pl', captcha_token: 'good' }),
        `10.0.0.${i}`,
      );
      statuses.push(res.status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
  });

  it('limit per IP: 6. zgłoszenie z tego samego IP w ciągu godziny → 429', async () => {
    const { env, inserts } = makeEnv();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await call(
        env,
        form({ email: `u${i}@example.com`, url: 'https://firma.pl', captcha_token: 'good' }),
      );
      statuses.push(res.status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    // Limit IP działa PRZED zapisem D1 (MIX-1556, mutant X1): odrzucone zgłoszenie = 0 INSERT.
    expect(inserts).toHaveLength(5);
  });

  it('przy ustawionych CRM_INGEST_URL/SECRET lead zapisany, maile wychodzą, a do CRM nie idzie żaden fetch', async () => {
    const { env, inserts } = makeEnv();
    const czekaj: Promise<unknown>[] = [];
    const request = new Request('https://x/api/audit/capture-lead', {
      method: 'POST',
      body: form({
        email: 'klient@example.com',
        url: 'https://firma.pl',
        companyName: 'Firma',
        captcha_token: 'good',
        score: '87',
        pdf: new Blob([PDF]),
      }),
      headers: { 'cf-connecting-ip': '7.7.7.7' },
    });
    const res = (await onRequestPost({
      request,
      env: {
        ...env,
        CRM_INGEST_URL: URL_CRM_INGEST,
        CRM_INGEST_SECRET: 'x'.repeat(64),
      },
      waitUntil: (p: Promise<unknown>) => czekaj.push(p),
    } as unknown as Ctx)) as Response;
    await Promise.all(czekaj);
    expect(res.status).toBe(200);
    expect(crm).toEqual([]);
    expect(inserts).toHaveLength(1);
    expect(emails.map((e) => e.to[0])).toEqual(['klient@example.com', 'agencja@example.com']);
  });
});

// ---------------------------------------------------------------------------------------------
// Wejście → Linear: prawdziwy SQLite z migracją 0010, atrapa sieci.
// ---------------------------------------------------------------------------------------------

describe('audit/capture-lead — zgłoszenie do Lineara', () => {
  let siec: Siec;
  let zb: ReturnType<typeof zbieracz>;

  beforeEach(() => {
    siec = stubSieci({ captchaOk: (t) => t === 'good' });
    zb = zbieracz();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const pola = {
    email: 'klient@firma.pl',
    url: 'https://firma.pl',
    companyName: 'Firma',
    captcha_token: 'good',
    score: '87',
  };

  const srodowisko = (dodatkowe: Record<string, unknown> = {}) =>
    srodowiskoWejsc(siec, {
      RESEND_API_KEY: 're_test',
      NOTIFY_EMAIL: 'agencja@example.com',
      TURNSTILE_SECRET: 'secret',
      ...dodatkowe,
    });

  const wywolaj = async (srv: unknown, fd: FormData, ip = '1.2.3.4') => {
    const request = new Request('https://x/api/audit/capture-lead', {
      method: 'POST',
      body: fd,
      headers: { 'cf-connecting-ip': ip },
    });
    const res = (await onRequestPost({
      request,
      env: srv,
      waitUntil: zb.waitUntil,
    } as unknown as Ctx)) as Response;
    await zb.czekaj();
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  };

  it('udany zapis → jedno zgłoszenie w tle po INSERT leads, zadanie z etykietą „audyt”, odpowiedź bez zmian', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, form(pola));
    const id = r.body.id as string;
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: 'success', id });
    expect(zb.liczba()).toBe(1); // tylko zgłoszenie do Lineara (kopii do CRM już nie ma)
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
    expect(siec.linear.find((w) => w.op === 'ZadanieUtworz')?.vars).toMatchObject({
      input: { id, teamId: 'team-1', labelIds: ['lab-audyt'] },
    });
    expect(siec.os.indexOf('fetch:api.linear.app')).toBeGreaterThan(
      siec.os.indexOf('sql:INSERT leads'),
    );
    expect(db.prepare('SELECT stan FROM linear_leady WHERE lead_id = ?').get(id)).toEqual({
      stan: 'wyslany',
    });
  });

  it('bez LINEAR_API_KEY: 200 jak dotąd, lead zapisany, zero wywołań Lineara (MIX-626)', async () => {
    const { env: srv, db } = srodowisko({ LINEAR_API_KEY: undefined });
    const r = await wywolaj(srv, form(pola));
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: 'success', id: r.body.id });
    expect(siec.linear).toHaveLength(0);
    expect(siec.hosty).not.toContain('api.linear.app');
    expect(db.prepare('SELECT COUNT(*) AS n FROM leads').get()).toEqual({ n: 1 });
  });

  it('maile (5A) wychodzą jak dotąd: do klienta z PDF-em i do agencji', async () => {
    const { env: srv } = srodowisko();
    await wywolaj(srv, form({ ...pola, pdf: new Blob([PDF]) }));
    expect(siec.resend).toBe(2);
  });

  it('(−) honeypot → 403, zero wywołań Lineara, zero wierszy', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, form({ ...pola, website_verify: 'bot' }));
    expect(r.status).toBe(403);
    expect(r.body).toEqual({ status: 'error', message: 'Spam detected' });
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) zła captcha → 403 z komunikatem, zero wywołań Lineara, zero wierszy', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, form({ ...pola, captcha_token: 'zly' }));
    expect(r.status).toBe(403);
    expect(r.body.message).toBe('Weryfikacja captcha nieudana');
    expect(siec.linear).toHaveLength(0);
    expect(wierszeLinear(db)).toHaveLength(0);
    expect(zb.liczba()).toBe(0);
  });

  it('(−) przekroczony limit IP → 429, zero nowych zadań i wierszy ponad dozwolone', async () => {
    const { env: srv, db } = srodowisko();
    const kody: number[] = [];
    for (let i = 0; i < 6; i++) {
      kody.push((await wywolaj(srv, form({ ...pola, email: `u${i}@firma${i}.pl` }))).status);
    }
    expect(kody).toEqual([200, 200, 200, 200, 200, 429]);
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(5);
    expect(wierszeLinear(db)).toHaveLength(5);
    expect(zb.liczba()).toBe(5); // 5 zapisów × zgłoszenie do Lineara
  });

  it('(−) limit IP przed zapisem D1 (MIX-1556, X1): po 6. zgłoszeniu w `leads` zostaje 5 wierszy, 0 zapisów odmowy', async () => {
    const { env: srv, db } = srodowisko();
    const leady = () => db.prepare('SELECT id FROM leads').all();
    const zapisyLeads = () => siec.os.filter((w) => w === 'sql:INSERT leads').length;
    for (let i = 0; i < 5; i++) {
      expect((await wywolaj(srv, form({ ...pola, email: `x${i}@firma${i}.pl` }))).status).toBe(200);
    }
    expect(leady()).toHaveLength(5);
    expect(zapisyLeads()).toBe(5);
    const odmowa = await wywolaj(srv, form({ ...pola, email: 'x5@firma5.pl' }));
    expect(odmowa.status).toBe(429);
    expect(leady()).toHaveLength(5);
    expect(zapisyLeads()).toBe(5);
    // Bliźniak: inne IP w tym samym oknie zapisuje (licznik jest per IP, nie globalny).
    expect((await wywolaj(srv, form({ ...pola, email: 'x6@firma6.pl' }), '5.6.7.8')).status).toBe(
      200,
    );
    expect(leady()).toHaveLength(6);
  });

  it('(−) limit na adres odbiorcy → 429 i brak zadania dla odrzuconego zgłoszenia', async () => {
    const { env: srv } = srodowisko();
    for (let i = 0; i < 3; i++) {
      await wywolaj(srv, form({ ...pola, email: 'Cel@Firma.pl' }), `10.0.0.${i}`);
    }
    const przed = ileOp(siec, 'ZadanieUtworz');
    const r = await wywolaj(srv, form({ ...pola, email: 'cel@firma.pl' }), '10.0.0.9');
    expect(r.status).toBe(429);
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(przed);
  });

  it('(−) błąd D1 przy zapisie → 500 „DB error”, zero wywołań Lineara', async () => {
    const zepsuta = {
      prepare: () => ({
        bind: () => ({
          run: async () => {
            throw new Error('D1_ERROR: overloaded');
          },
        }),
      }),
    };
    const { env: srv } = srodowisko();
    const r = await wywolaj({ ...srv, DB: zepsuta }, form(pola));
    expect(r.status).toBe(500);
    expect(r.body).toEqual({ status: 'error', message: 'DB error' });
    expect(siec.linear).toHaveLength(0);
    expect(siec.hosty).not.toContain('api.linear.app');
    expect(zb.liczba()).toBe(0);
  });

  it('(−) ścieżka z modułem Lineara nie dotyka CRM: zero fetch do hosta CRM', async () => {
    const { env: srv } = srodowisko();
    await wywolaj(srv, form(pola));
    expect(siec.crm).toBe(0);
    expect(siec.hosty.some((h) => h.includes(HOST_CRM))).toBe(false);
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
  });

  it('(−) wyjątek w module Lineara (brak tabeli) nie zmienia kodu ani treści odpowiedzi', async () => {
    const { env: srv, DB } = srodowisko();
    const bezTabeli = {
      prepare: (sql: string) => {
        if (/linear_leady/.test(sql)) throw new Error('D1_ERROR: no such table: linear_leady');
        return DB.prepare(sql);
      },
    };
    const r = await wywolaj({ ...srv, DB: bezTabeli }, form(pola));
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: 'success', id: expect.any(String) });
  });

  // ── Limity długości pól (400 po polsku, po stronie serwera) ────────────────────────────────

  const tekst = (n: number) => 'a'.repeat(n);

  it.each([
    ['companyName', 'Nazwa firmy', 200],
    ['email', 'E-mail', 254],
    ['url', 'Adres strony', 2048],
    ['score', 'Wynik', 20],
    ['captcha_token', 'Token captcha', 2048],
  ])(
    '(−) pole „%s” ponad %i znaków → 400 z komunikatem, nic nie zapisane ani wysłane',
    async (pole, etykieta, max) => {
      const { env: srv, db } = srodowisko();
      const r = await wywolaj(srv, form({ ...pola, [pole]: tekst(Number(max) + 1) }));
      expect(r.status).toBe(400);
      expect(r.body).toEqual({
        status: 'error',
        message: `Pole „${etykieta}” może mieć maks. ${max} znaków.`,
      });
      expect(siec.linear).toHaveLength(0);
      expect(siec.resend).toBe(0);
      expect(siec.hosty).not.toContain('challenges.cloudflare.com');
      expect(wierszeLinear(db)).toHaveLength(0);
      expect(db.prepare('SELECT COUNT(*) AS n FROM leads').get()).toEqual({ n: 0 });
      expect(zb.liczba()).toBe(0);
    },
  );

  it('(−) nazwa firmy 20 000 znaków → 400 (wcześniej cichy skrót, a imię rzucało w module Lineara)', async () => {
    const { env: srv, db } = srodowisko();
    const r = await wywolaj(srv, form({ ...pola, companyName: tekst(20_000) }));
    expect(r.status).toBe(400);
    expect(db.prepare('SELECT COUNT(*) AS n FROM leads').get()).toEqual({ n: 0 });
  });

  it('pola dokładnie na limicie przechodzą: 200 i zadanie w Linearze powstaje', async () => {
    const { env: srv } = srodowisko();
    const r = await wywolaj(
      srv,
      form({
        ...pola,
        companyName: tekst(200),
        email: `${tekst(254 - '@firma.pl'.length)}@firma.pl`,
        score: '1'.repeat(20),
      }),
    );
    expect(r.status).toBe(200);
    expect(ileOp(siec, 'ZadanieUtworz')).toBe(1);
  });
});

// MIX-1324: wspólna bramka — fail-closed, IPv6 /64, dzienny budżet.
describe('audit/capture-lead — bramka (MIX-1324)', () => {
  const ok = (i: number) =>
    form({ email: `p${i}@example.com`, url: 'https://firma.pl', captcha_token: 'good' });

  it('brak magazynu KV → 503 i zero maili (wcześniej limity były pomijane)', async () => {
    const { env, inserts } = makeEnv();
    const res = await call({ ...env, CACHE: undefined }, ok(1));
    expect(res.status).toBe(503);
    expect(emails).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it('awaria licznika KV → 503 (wcześniej fail-open); bliźniak: działający KV → 200', async () => {
    const { env } = makeEnv();
    const broken = {
      get: async () => {
        throw new Error('KV GET failed');
      },
      put: async () => {},
    };
    expect((await call({ ...env, CACHE: broken }, ok(1))).status).toBe(503);
    expect(emails).toHaveLength(0);
    expect((await call(env, ok(2))).status).toBe(200);
  });

  it('rotacja IPv6 w jednej /64 → 6. zgłoszenie 429; inna /64 → 200', async () => {
    const { env } = makeEnv();
    const s: number[] = [];
    for (let i = 0; i < 6; i++) s.push((await call(env, ok(i), `2a01:db9:7:7::${i + 1}`)).status);
    expect(s).toEqual([200, 200, 200, 200, 200, 429]);
    expect((await call(env, ok(9), '2a01:db9:7:8::1')).status).toBe(200);
  });

  it('dzienny budżet globalny (AUDIT_LEAD_DAILY_BUDGET) → 429 z nowych IP', async () => {
    const { env } = makeEnv();
    const e = { ...env, AUDIT_LEAD_DAILY_BUDGET: '2' };
    const s: number[] = [];
    for (let i = 0; i < 3; i++) s.push((await call(e, ok(i), `6.6.6.${i}`)).status);
    expect(s).toEqual([200, 200, 429]);
  });
});
