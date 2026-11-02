import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { d1Sqlite } from '../../../tests/helpers/d1Sqlite';
import { podpiszZapytanie, bladPodpisu } from '../crm/_podpis';
import { onRequest, PREFIKS_PONOW } from './ponow';

// POST /api/leady/ponow: timer na serwerze ponawia kolejkę leadów → Linear. Podpis jak w CRM, ale osobny sekret
// i prefiks. Prawdziwy SQLite z migracjami strony; Linear to atrapa `fetch` (zawsze sukces, zapisuje wywołania).
const SEKRET = 'p'.repeat(64);
const SEKRET_CRM = 'b'.repeat(64);
const KLUCZ_API = ['lin_api', 'TAJNY', 'KLUCZ', 'TESTOWY'].join('_');
const SCIEZKA = '/api/leady/ponow';
const MIGRACJE = [
  '0001_init.sql',
  '0002_leads_add_source_company.sql',
  '0009_leads_updated_at.sql',
  '0010_linear_leady.sql',
];

// Stały wektor zgodny z testem Pythona (`leady/test_ponow.py`): ten sam sekret, czas i nonce → ten sam hex.
const WEKTOR = {
  sekret: SEKRET,
  czas: '1761900000',
  nonce: '123e4567-e89b-42d3-a456-426614174000',
  hex: '0be2cf7ab81ff9ddb05f6b9a20361ab188f1d76ed1eda1bfbe7a7e03a40d99fe',
};

let wywolania: string[] = [];
let logi: string[] = [];

beforeEach(() => {
  wywolania = [];
  logi = [];
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T10:00:00Z'));
  for (const k of ['log', 'warn', 'error', 'info'] as const) {
    vi.spyOn(console, k).mockImplementation((...a: unknown[]) => {
      logi.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
    });
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        operationName: string;
        variables: { input?: Record<string, unknown> };
      };
      wywolania.push(body.operationName);
      const input = body.variables.input ?? {};
      const dane: Record<string, unknown> = {
        Etykiety: {
          team: {
            id: 'team-1',
            key: 'LEA',
            labels: { nodes: [{ id: 'lab-formularz', name: 'formularz' }] },
          },
        },
        KlientUpsert: { customerUpsert: { success: true, customer: { id: 'c-1', name: 'x' } } },
        ZadanieUtworz: {
          issueCreate: {
            success: true,
            issue: { id: input.id, identifier: 'LEA-1', url: 'https://linear.app/x/issue/LEA-1' },
          },
        },
        ProsbaKlienta: { customerNeedCreate: { success: true, need: { id: 'n-1' } } },
      };
      return new Response(JSON.stringify({ data: dane[body.operationName] ?? { issue: null } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

type Env = Record<string, unknown>;

function srodowisko(over: Env = {}) {
  const { DB, db } = d1Sqlite(MIGRACJE);
  const env: Env = {
    DB,
    LINEAR_PONOW_SECRET: SEKRET,
    LINEAR_API_KEY: KLUCZ_API,
    LINEAR_TEAM_LEADY_ID: 'team-1',
    LINEAR_PROWADZACY_ID: 'user-jakub',
    CRM_STRONA_SECRET: SEKRET_CRM,
    ...over,
  };
  return { env, db };
}
type Db = ReturnType<typeof srodowisko>['db'];

let licznik = 0;
/** Lead z wierszem `linear_leady` w danym stanie (proby i `nastepna_proba` w przeszłości, więc drenaż go bierze). */
function wiersz(db: Db, stan: string, proby = 0) {
  licznik += 1;
  const id = `00000000-0000-4000-8000-${String(licznik).padStart(12, '0')}`;
  db.prepare(
    `INSERT INTO leads (id, email, name, source, source_url, current_step) VALUES (?, ?, ?, 'website', ?, 1)`,
  ).run(id, `osoba${licznik}@firma${licznik}.pl`, 'Jan', 'https://mixturemarketing.pl/kontakt');
  db.prepare(
    `INSERT INTO linear_leady (lead_id, stan, proby, nastepna_proba, created_at, updated_at)
     VALUES (?, ?, ?, '2026-11-02 09:00:00', '2026-11-02 08:00:00', '2026-11-02 08:00:00')`,
  ).run(id, stan, proby);
  return id;
}
const stany = (db: Db) =>
  db.prepare('SELECT lead_id, stan, proby FROM linear_leady ORDER BY lead_id').all() as {
    lead_id: string;
    stan: string;
    proby: number;
  }[];

interface Opcje {
  metoda?: string;
  sekret?: string;
  prefiks?: string;
  czas?: number;
  nonce?: string;
  podpis?: string;
  body?: string;
  sciezka?: string;
  /** Parametry zapytania doklejone do adresu żądania (np. `?x=1`); podpis liczy `sciezka`. */
  zapytanie?: string;
  naglowki?: boolean;
}
async function zadanie(o: Opcje = {}) {
  const metoda = o.metoda ?? 'POST';
  const czas = String(o.czas ?? Math.floor(Date.now() / 1000));
  const nonce = o.nonce ?? crypto.randomUUID();
  const podpis =
    o.podpis ??
    (await podpiszZapytanie(
      o.sekret ?? SEKRET,
      czas,
      nonce,
      'POST',
      o.sciezka ?? SCIEZKA,
      o.prefiks ?? PREFIKS_PONOW,
    ));
  return new Request(`https://mixturemarketing.pl${SCIEZKA}${o.zapytanie ?? ''}`, {
    method: metoda,
    headers:
      o.naglowki === false
        ? {}
        : {
            'X-Mixture-Timestamp': czas,
            'X-Mixture-Nonce': nonce,
            'X-Mixture-Signature': podpis,
          },
    body: ['GET', 'HEAD'].includes(metoda) ? undefined : (o.body ?? ''),
  });
}
const wywolaj = (request: Request, env: Env) =>
  (onRequest as unknown as (c: unknown) => Promise<Response>)({ request, env });

const KLUCZE_ODP = ['ponowione', 'w_kolejce', 'zablokowane', 'bez_customer_request', 'czas'];

describe('POST /api/leady/ponow: przyjęcie', () => {
  it('(+) poprawny podpis: 200 i JSON z 5 polami; kolejka zostaje ponowiona', async () => {
    const { env, db } = srodowisko();
    const id = wiersz(db, 'kolejka');
    const odp = await wywolaj(await zadanie(), env);
    expect(odp.status).toBe(200);
    expect(odp.headers.get('Cache-Control')).toBe('no-store');
    const dane = (await odp.json()) as Record<string, unknown>;
    expect(Object.keys(dane).sort()).toEqual([...KLUCZE_ODP].sort());
    expect(dane).toMatchObject({
      ponowione: 1,
      w_kolejce: 0,
      zablokowane: 0,
      bez_customer_request: 0,
    });
    expect(dane.czas).toBe('2026-11-02T10:00:00.000Z');
    expect(stany(db).find((w) => w.lead_id === id)?.stan).toBe('wyslany');
    expect(wywolania).toContain('ZadanieUtworz');
  });

  it('(+) pusta kolejka: 200 i same zera, bez wywołań Lineara', async () => {
    const { env } = srodowisko();
    const odp = await wywolaj(await zadanie(), env);
    expect(odp.status).toBe(200);
    expect(await odp.json()).toMatchObject({ ponowione: 0, w_kolejce: 0, zablokowane: 0 });
    expect(wywolania).toEqual([]);
  });

  it('(+) odblokuj:true zmienia zablokowany → kolejka z proby=0 (limit 1: jeden idzie dalej, drugi czeka)', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'zablokowany', 8);
    wiersz(db, 'zablokowany', 8);
    const odp = await wywolaj(await zadanie({ body: '{"limit":1,"odblokuj":true}' }), env);
    expect(odp.status).toBe(200);
    expect(await odp.json()).toMatchObject({ ponowione: 1, w_kolejce: 1, zablokowane: 0 });
    const w = stany(db);
    expect(w.map((x) => x.stan).sort()).toEqual(['kolejka', 'wyslany']);
    expect(w.find((x) => x.stan === 'kolejka')?.proby).toBe(0);
  });

  it('(−) bez odblokuj zablokowane zostają zablokowane i są liczone; Linear nie jest wołany', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'zablokowany', 8);
    wiersz(db, 'zablokowany', 8);
    const odp = await wywolaj(await zadanie({ body: '{"odblokuj":false}' }), env);
    expect(await odp.json()).toMatchObject({ ponowione: 0, w_kolejce: 0, zablokowane: 2 });
    expect(stany(db).every((x) => x.stan === 'zablokowany' && x.proby === 8)).toBe(true);
    expect(wywolania).toEqual([]);
  });

  it('(+) limit z body ogranicza liczbę ponowień', async () => {
    const { env, db } = srodowisko();
    for (let i = 0; i < 3; i++) wiersz(db, 'kolejka');
    const odp = await wywolaj(await zadanie({ body: '{"limit":2}' }), env);
    expect(await odp.json()).toMatchObject({ ponowione: 2, w_kolejce: 1 });
  });

  // Puste body i adres z parametrami zapytania.
  it('(+) puste body i samo białe znaki: 200, domyślny limit 20 (nie 50), kolejka drenowana', async () => {
    for (const body of ['', '   \n\t ']) {
      const { env, db } = srodowisko();
      for (let i = 0; i < 22; i++) wiersz(db, 'kolejka');
      const odp = await wywolaj(await zadanie({ body }), env);
      expect(odp.status, JSON.stringify(body)).toBe(200);
      expect(await odp.json()).toMatchObject({ ponowione: 20, w_kolejce: 2, zablokowane: 0 });
    }
  });

  it('(−) puste body nie odblokowuje: zablokowane zostają zablokowane (domyślne odblokuj = brak)', async () => {
    for (const body of ['', '  ', '{}']) {
      const { env, db } = srodowisko();
      wiersz(db, 'zablokowany', 8);
      wiersz(db, 'kolejka');
      const odp = await wywolaj(await zadanie({ body }), env);
      expect(odp.status, JSON.stringify(body)).toBe(200);
      expect(await odp.json()).toMatchObject({ ponowione: 1, w_kolejce: 0, zablokowane: 1 });
      const w = stany(db);
      expect(w.filter((x) => x.stan === 'zablokowany')).toHaveLength(1);
      expect(w.find((x) => x.stan === 'zablokowany')?.proby).toBe(8);
    }
  });

  it('(+) adres z parametrami zapytania: podpis liczony z ścieżki razem z zapytaniem przechodzi', async () => {
    const { env } = srodowisko();
    const q = '?x=1&y=a%20b';
    const odp = await wywolaj(await zadanie({ zapytanie: q, sciezka: SCIEZKA + q }), env);
    expect(odp.status).toBe(200);
    expect(Object.keys((await odp.json()) as object).sort()).toEqual([...KLUCZE_ODP].sort());
  });

  it('(−) parametry zapytania nie sterują ponowieniem: podpisane ?odblokuj=true&limit=1 nie odblokowuje i nie zmienia limitu', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'zablokowany', 8);
    wiersz(db, 'kolejka');
    wiersz(db, 'kolejka');
    const q = '?odblokuj=true&limit=1';
    const odp = await wywolaj(await zadanie({ zapytanie: q, sciezka: SCIEZKA + q }), env);
    expect(odp.status).toBe(200);
    expect(await odp.json()).toMatchObject({ ponowione: 2, w_kolejce: 0, zablokowane: 1 });
    expect(stany(db).filter((x) => x.stan === 'zablokowany')).toHaveLength(1);
  });

  it('(+) czas na granicy okna (299 s w tył i w przód) przechodzi', async () => {
    const { env } = srodowisko();
    const teraz = Math.floor(Date.now() / 1000);
    expect((await wywolaj(await zadanie({ czas: teraz - 299 }), env)).status).toBe(200);
    expect((await wywolaj(await zadanie({ czas: teraz + 299 }), env)).status).toBe(200);
  });
});

describe('POST /api/leady/ponow: odmowy', () => {
  it('(−) zły podpis: 401 z komunikatem, kolejka nietknięta', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'kolejka');
    const zly = `sha256=${'0'.repeat(64)}`;
    const odp = await wywolaj(await zadanie({ podpis: zly }), env);
    expect(odp.status).toBe(401);
    expect(((await odp.json()) as { blad: string }).blad).toBe('Podpis się nie zgadza.');
    expect(stany(db)[0].stan).toBe('kolejka');
    expect(wywolania).toEqual([]);
  });

  it('(−) czas starszy niż 300 s albo odległy w przód: 401 „za stare”', async () => {
    const { env } = srodowisko();
    const teraz = Math.floor(Date.now() / 1000);
    for (const czas of [teraz - 301, teraz + 301, teraz - 86400]) {
      const odp = await wywolaj(await zadanie({ czas }), env);
      expect(odp.status).toBe(401);
      expect(((await odp.json()) as { blad: string }).blad).toBe('Zapytanie jest za stare.');
    }
  });

  it('(−) powtórzony nonce w oknie: 409; nonce z nieudanego podpisu nie jest „spalony”', async () => {
    const { env } = srodowisko();
    const nonce = crypto.randomUUID();
    const zly = await wywolaj(await zadanie({ nonce, podpis: `sha256=${'1'.repeat(64)}` }), env);
    expect(zly.status).toBe(401);
    expect((await wywolaj(await zadanie({ nonce }), env)).status).toBe(200);
    const powtorka = await wywolaj(await zadanie({ nonce }), env);
    expect(powtorka.status).toBe(409);
    expect(((await powtorka.json()) as { blad: string }).blad).toContain('powtórzony nonce');
  });

  it('(−) brak albo zły nagłówek podpisu, czasu, nonce: 401', async () => {
    const { env } = srodowisko();
    const brak = await wywolaj(await zadanie({ naglowki: false }), env);
    expect(brak.status).toBe(401);
    expect(((await brak.json()) as { blad: string }).blad).toBe('Brak albo zły podpis.');
    expect((await wywolaj(await zadanie({ nonce: 'nie-uuid' }), env)).status).toBe(401);
    expect((await wywolaj(await zadanie({ podpis: 'sha256=abc' }), env)).status).toBe(401);
    expect((await wywolaj(await zadanie({ podpis: 'md5=' + 'a'.repeat(64) }), env)).status).toBe(
      401,
    );
  });

  it('(−) brak LINEAR_PONOW_SECRET, sekret krótszy niż 32, brak klucza API albo zespołu: 503 i zero wywołań', async () => {
    const warianty: Env[] = [
      { LINEAR_PONOW_SECRET: undefined },
      { LINEAR_PONOW_SECRET: '' },
      { LINEAR_PONOW_SECRET: 'p'.repeat(31) },
      { LINEAR_API_KEY: undefined },
      { LINEAR_API_KEY: '' },
      { LINEAR_TEAM_LEADY_ID: undefined },
    ];
    for (const w of warianty) {
      const { env, db } = srodowisko(w);
      wiersz(db, 'kolejka');
      const odp = await wywolaj(await zadanie(), env);
      expect(odp.status).toBe(503);
      expect(((await odp.json()) as { blad: string }).blad).toBe(
        'Ponawianie leadów jest wyłączone.',
      );
      expect(stany(db)[0].stan).toBe('kolejka');
    }
    expect(wywolania).toEqual([]);
  });

  it('(−) sekret CRM nie zastępuje sekretu ponow: brak LINEAR_PONOW_SECRET przy ustawionym CRM_STRONA_SECRET: 503', async () => {
    const { env } = srodowisko({ LINEAR_PONOW_SECRET: undefined });
    const odp = await wywolaj(await zadanie({ sekret: SEKRET_CRM }), env);
    expect(odp.status).toBe(503);
  });

  it('(−) GET i inne metody: 405 z Allow: POST, przed podpisem i bez dotykania kolejki', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'kolejka');
    for (const metoda of ['GET', 'PUT', 'DELETE', 'PATCH']) {
      const odp = await wywolaj(await zadanie({ metoda }), env);
      expect(odp.status).toBe(405);
      expect(odp.headers.get('Allow')).toBe('POST');
    }
    // 405 także bez nagłówków podpisu i bez sekretu (metoda jest sprawdzana pierwsza)
    expect(
      (
        await wywolaj(
          await zadanie({ metoda: 'GET', naglowki: false }),
          srodowisko({ LINEAR_PONOW_SECRET: undefined }).env,
        )
      ).status,
    ).toBe(405);
    expect(stany(db)[0].stan).toBe('kolejka');
  });

  it('(−) podpis kierunku CRM nie przechodzi: sekret CRM z prefiksem CRM, sekret CRM z prefiksem ponow, sekret ponow z prefiksem CRM', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'kolejka');
    const crm = 'crm-zapytanie:v1:';
    const warianty: Opcje[] = [
      { sekret: SEKRET_CRM, prefiks: crm },
      { sekret: SEKRET_CRM, prefiks: PREFIKS_PONOW },
      { sekret: SEKRET, prefiks: crm },
    ];
    for (const w of warianty) {
      const odp = await wywolaj(await zadanie(w), env);
      expect(odp.status).toBe(401);
      expect(((await odp.json()) as { blad: string }).blad).toBe('Podpis się nie zgadza.');
    }
    expect(stany(db)[0].stan).toBe('kolejka');
    expect(wywolania).toEqual([]);
  });

  it('(−) zapytanie doklejone do podpisanej ścieżki, albo zdjęte z niej: 401 „Podpis się nie zgadza.”, kolejka nietknięta', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'zablokowany', 8);
    const warianty: Opcje[] = [
      { zapytanie: '?odblokuj=true' }, // podpis bez zapytania, żądanie z zapytaniem
      { sciezka: `${SCIEZKA}?x=1` }, // podpis z zapytaniem, żądanie bez zapytania
      { zapytanie: '?x=2', sciezka: `${SCIEZKA}?x=1` }, // inna wartość parametru
      { zapytanie: '?x=1&y=2', sciezka: `${SCIEZKA}?y=2&x=1` }, // inna kolejność parametrów
    ];
    for (const w of warianty) {
      const odp = await wywolaj(await zadanie(w), env);
      expect(odp.status, JSON.stringify(w)).toBe(401);
      expect(((await odp.json()) as { blad: string }).blad).toBe('Podpis się nie zgadza.');
    }
    expect(stany(db)[0].stan).toBe('zablokowany');
    expect(wywolania).toEqual([]);
  });

  it('(+) zapytanie puste („?” bez parametrów) to ta sama ścieżka co bez zapytania: podpis bez zapytania przechodzi', async () => {
    const { env } = srodowisko();
    const odp = await wywolaj(await zadanie({ zapytanie: '?' }), env);
    expect(odp.status).toBe(200);
  });

  it('(−) podpis innej ścieżki (replay podpisu z innego endpointu) nie przechodzi', async () => {
    const { env } = srodowisko();
    const odp = await wywolaj(await zadanie({ sciezka: '/api/crm/leady' }), env);
    expect(odp.status).toBe(401);
  });

  it('(−) zły body: 400 z komunikatem, kolejka nietknięta', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'zablokowany', 8);
    const zle: [string, string][] = [
      ['nie json', 'Body musi być obiektem JSON.'],
      ['[1]', 'Body musi być obiektem JSON.'],
      ['"x"', 'Body musi być obiektem JSON.'],
      ['null', 'Body musi być obiektem JSON.'],
      ['{"limit":0,"odblokuj":true}', 'Pole limit: liczba całkowita 1–50.'],
      ['{"limit":51}', 'Pole limit: liczba całkowita 1–50.'],
      ['{"limit":1.5}', 'Pole limit: liczba całkowita 1–50.'],
      ['{"limit":"5"}', 'Pole limit: liczba całkowita 1–50.'],
      ['{"odblokuj":"tak"}', 'Pole odblokuj: true albo false.'],
      ['{"odblokuj":1}', 'Pole odblokuj: true albo false.'],
      [`{"limit":5,"x":"${'a'.repeat(1100)}"}`, 'Body jest za duże.'],
    ];
    for (const [body, komunikat] of zle) {
      const odp = await wywolaj(await zadanie({ body }), env);
      expect(odp.status, body.slice(0, 40)).toBe(400);
      expect(((await odp.json()) as { blad: string }).blad).toBe(komunikat);
    }
    expect(stany(db)[0].stan).toBe('zablokowany');
    expect(wywolania).toEqual([]);
  });

  it('(−) odpowiedzi i logi nie zawierają sekretów ani klucza API', async () => {
    const { env, db } = srodowisko();
    wiersz(db, 'kolejka');
    const odpowiedzi = [
      await wywolaj(await zadanie(), env),
      await wywolaj(await zadanie({ podpis: `sha256=${'2'.repeat(64)}` }), env),
      await wywolaj(await zadanie({ metoda: 'GET' }), env),
      await wywolaj(await zadanie(), srodowisko({ LINEAR_PONOW_SECRET: undefined }).env),
    ];
    const tekst = [
      ...(await Promise.all(odpowiedzi.map((o) => o.text()))),
      ...odpowiedzi.map((o) => {
        const pary: string[][] = [];
        o.headers.forEach((v, k) => pary.push([k, v]));
        return JSON.stringify(pary);
      }),
      ...logi,
    ].join('\n');
    for (const tajne of [SEKRET, SEKRET_CRM, KLUCZ_API]) expect(tekst).not.toContain(tajne);
  });
});

describe('podpis: wektor i zgodność z CRM', () => {
  it("(−) bladPodpisu z opcją sekret '' to 503, a nie powrót do sekretu CRM; bez opcji działa sekret CRM", async () => {
    const { env } = srodowisko();
    const poCrm = await zadanie({ sekret: SEKRET_CRM, prefiks: 'crm-zapytanie:v1:' });
    expect(
      (await bladPodpisu(poCrm.clone() as never, env as never, Date.now(), { sekret: '' }))?.status,
    ).toBe(503);
    expect(await bladPodpisu(poCrm, env as never)).toBeNull();
  });

  it('(+) stały wektor: ten sam sekret, czas i nonce dają ten sam hex co w teście Pythona', async () => {
    const p = await podpiszZapytanie(
      WEKTOR.sekret,
      WEKTOR.czas,
      WEKTOR.nonce,
      'POST',
      SCIEZKA,
      PREFIKS_PONOW,
    );
    expect(p).toBe(`sha256=${WEKTOR.hex}`);
  });

  it('(+) domyślny prefiks to prefiks CRM; inny prefiks daje inny podpis', async () => {
    const a = await podpiszZapytanie(SEKRET, '1', 'n', 'GET', '/api/crm/leady');
    const b = await podpiszZapytanie(
      SEKRET,
      '1',
      'n',
      'GET',
      '/api/crm/leady',
      'crm-zapytanie:v1:',
    );
    const c = await podpiszZapytanie(SEKRET, '1', 'n', 'GET', '/api/crm/leady', PREFIKS_PONOW);
    expect(a).toBe(b);
    expect(c).not.toBe(a);
  });
});
