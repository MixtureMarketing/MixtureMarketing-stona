import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wyslijDoCrm, CRM_INGEST_URL_DOMYSLNY } from './_crm';
import { onRequestPost as contactSubmit } from './contact-submit';
import { d1Sqlite } from '../../tests/helpers/d1Sqlite';

// Kontrakt z CRM (mixture-crm, functions/_lib/podpis.ts): podpis = HMAC-SHA256(sekret,
// "<timestamp>.<surowa treść>") jako `sha256=<64 hex>`, okno 300 s, powtórzony podpis → 409.
// Weryfikacja poniżej jest napisana niezależnie od _crm.ts — tak, jak robi to CRM.

const SEKRET = 'a'.repeat(64);

async function podpisPoprawny(sekret: string, czas: string, tresc: string, podpis: string) {
  if (!/^sha256=[0-9a-f]{64}$/.test(podpis)) return false;
  const klucz = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(sekret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const bajty = Uint8Array.from(
    podpis
      .slice(7)
      .match(/../g)!
      .map((b) => parseInt(b, 16)),
  );
  return crypto.subtle.verify('HMAC', klucz, bajty, new TextEncoder().encode(`${czas}.${tresc}`));
}

interface Wywolanie {
  url: string;
  czas: string;
  podpis: string;
  tresc: string;
}
let wywolania: Wywolanie[] = [];
let odpowiedzi: number[] = [];

beforeEach(() => {
  wywolania = [];
  odpowiedzi = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const u = String(url);
      if (u.includes('turnstile')) return new Response('{"success":true}');
      if (u.includes('resend')) return new Response('{}');
      const h = new Headers(init?.headers);
      wywolania.push({
        url: u,
        czas: h.get('X-Mixture-Timestamp') ?? '',
        podpis: h.get('X-Mixture-Signature') ?? '',
        tresc: String(init?.body ?? ''),
      });
      return new Response('{}', { status: odpowiedzi.shift() ?? 201 });
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const LEAD = { external_id: 'L1', source: 'website' as const, name: 'Jan', email: 'jan@firma.pl' };

describe('_crm — wysyłka leada do CRM', () => {
  it('bez sekretu nic nie wysyła', async () => {
    expect(await wyslijDoCrm({}, LEAD)).toBe('wylaczone');
    expect(wywolania).toHaveLength(0);
  });

  it('podpisuje treść tak, jak sprawdza ją CRM, i domyślnie trafia na produkcję CRM', async () => {
    expect(await wyslijDoCrm({ CRM_INGEST_SECRET: SEKRET }, LEAD)).toBe('wyslany');
    const [w] = wywolania;
    expect(w.url).toBe(CRM_INGEST_URL_DOMYSLNY);
    expect(Math.abs(Date.now() / 1000 - Number(w.czas))).toBeLessThan(5);
    expect(await podpisPoprawny(SEKRET, w.czas, w.tresc, w.podpis)).toBe(true);
    expect(await podpisPoprawny('inny'.repeat(16), w.czas, w.tresc, w.podpis)).toBe(false);
  });

  it('pomija puste pola (kontrakt: „pola bez wartości można pominąć”)', async () => {
    await wyslijDoCrm({ CRM_INGEST_SECRET: SEKRET }, { ...LEAD, phone: null, company: '' });
    expect(JSON.parse(wywolania[0].tresc)).toEqual(LEAD);
  });

  it.each([409, 503])('HTTP %i → jedno ponowienie z nowym podpisem', async (status) => {
    odpowiedzi = [status, 201];
    expect(await wyslijDoCrm({ CRM_INGEST_SECRET: SEKRET }, LEAD, { przerwaMs: 1100 })).toBe(
      'wyslany',
    );
    expect(wywolania).toHaveLength(2);
    expect(wywolania[1].czas).not.toBe(wywolania[0].czas);
    expect(wywolania[1].podpis).not.toBe(wywolania[0].podpis);
  });

  it.each([400, 401, 413])('HTTP %i → bez ponawiania', async (status) => {
    odpowiedzi = [status];
    expect(await wyslijDoCrm({ CRM_INGEST_SECRET: SEKRET }, LEAD, { przerwaMs: 0 })).toBe(
      'odrzucony',
    );
    expect(wywolania).toHaveLength(1);
  });

  it('CRM nie odpowiada → po dwóch próbach poddaje się bez wyjątku', async () => {
    odpowiedzi = [500, 500];
    expect(await wyslijDoCrm({ CRM_INGEST_SECRET: SEKRET }, LEAD, { przerwaMs: 0 })).toBe(
      'niedostepny',
    );
  });
});

describe('contact-submit → CRM', () => {
  const srodowisko = () => {
    const { DB } = d1Sqlite(['0001_init.sql', '0002_leads_add_source_company.sql']);
    return {
      DB,
      TURNSTILE_SECRET: 'ts',
      RESEND_API_KEY: 'r',
      NOTIFY_EMAIL: 'a@b.pl',
      CRM_INGEST_SECRET: SEKRET,
    };
  };
  const wywolaj = async (env: unknown, body: unknown, czekaj: Promise<unknown>[]) => {
    const res = (await contactSubmit({
      env,
      waitUntil: (p: Promise<unknown>) => czekaj.push(p),
      request: new Request('https://mixturemarketing.pl/api/contact-submit', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    } as never)) as Response;
    await Promise.all(czekaj);
    return (await res.json()) as Record<string, unknown>;
  };

  it('create i kolejny krok trafiają do CRM jako jeden lead (ten sam external_id)', async () => {
    const env = srodowisko();
    const czekaj: Promise<unknown>[] = [];
    const utworzony = await wywolaj(
      env,
      {
        action: 'create',
        source_url: 'https://mixturemarketing.pl/contact/',
        lead: { name: 'Jan', email: 'jan@firma.pl', captcha_token: 't', service_interest: 'web' },
      },
      czekaj,
    );
    await wywolaj(
      env,
      {
        action: 'update',
        id: utworzony.id,
        edit_token: utworzony.edit_token,
        step: 3,
        details: { budget: '10–30 tys. zł', message: 'Sklep', projectType: 'ecommerce' },
      },
      czekaj,
    );

    const [krok1, krok3] = wywolania.map((w) => JSON.parse(w.tresc));
    expect(krok1).toMatchObject({
      external_id: utworzony.id,
      source: 'website',
      email: 'jan@firma.pl',
      service: 'web',
      form_step: 1,
      form_steps: 3,
    });
    expect(krok3).toMatchObject({
      external_id: utworzony.id,
      budget_text: '10–30 tys. zł',
      message: 'Sklep',
      details: { projectType: 'ecommerce' },
      form_step: 3,
      form_steps: 3,
    });
  });

  it('nieudany zapis do D1 → nic nie idzie do CRM', async () => {
    const env = {
      ...srodowisko(),
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => {
              throw new Error('D1 padło');
            },
            first: async () => null,
          }),
        }),
      },
    };
    await wywolaj(
      env,
      { action: 'create', lead: { name: 'Jan', email: 'jan@firma.pl', captcha_token: 't' } },
      [],
    );
    expect(wywolania).toHaveLength(0);
  });
});
