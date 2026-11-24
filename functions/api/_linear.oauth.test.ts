/**
 * MIX-2078: token aplikacji OAuth „Leady” (client_credentials) zamiast klucza osobistego.
 * Formy ataku z karty (1–11), każda odmowa z dozwolonym bliźniakiem.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { zglosLead, komentarzKroku, wlaczony, type LeadRow, type LinearEnv } from './_linear';
import {
  _resetPamieciTokenu,
  trybAutoryzacji,
  tokenAplikacji,
  OAUTH_TOKEN_URL,
} from './_linearToken';
import { d1Sqlite } from '../../tests/helpers/d1Sqlite';
import { createFakeKV } from '../../tests/helpers/fakeD1';

type Json = Record<string, unknown>;
type Spec = { status?: number; json?: unknown } | 'timeout' | 'siec' | (() => Promise<Spec>);

const KLUCZ_API = ['lin_api', 'OSOBISTY', 'TESTOWY'].join('_');
const ID_PROD = 'app-leady-prod';
const ID_PREV = 'app-leady-preview';
const SEKRET = ['sekret', 'aplikacji', 'NIE', 'LOGOWAC'].join('_');
const DZIEN = 24 * 3600 * 1000;

let gqlWyw: { op: string; auth: string }[] = [];
let tokWyw: { body: URLSearchParams; signal: boolean }[] = [];
let gqlKolejka: Spec[] = [];
let tokKolejka: Spec[] = [];
let licznikTokenow = 0;
let logi: string[] = [];

const tokenNr = (n: number) => `tok_aplikacji_${n}_x9`;

function odpowiedz(s: { status?: number; json?: unknown }) {
  return new Response(JSON.stringify(s.json ?? {}), {
    status: s.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function rozwin(s: Spec): Promise<Exclude<Spec, () => unknown>> {
  return typeof s === 'function' ? rozwin(await s()) : s;
}

function domyslnaGql(op: string, vars: Json): unknown {
  const input = (vars.input ?? {}) as Json;
  switch (op) {
    case 'Etykiety':
      return {
        team: {
          id: 'team-1',
          key: 'LEA',
          labels: { nodes: [{ id: 'lab-formularz', name: 'formularz' }] },
        },
      };
    case 'KlientUpsert':
      return { customerUpsert: { success: true, customer: { id: 'cust-1', name: 'x' } } };
    case 'ZadanieUtworz':
      return {
        issueCreate: {
          success: true,
          issue: { id: input.id, identifier: 'LEA-1', url: 'https://linear.app/x/issue/LEA-1' },
        },
      };
    case 'ProsbaKlienta':
      return { customerNeedCreate: { success: true, need: { id: 'need-1' } } };
    case 'Komentarz':
      return { commentCreate: { success: true, comment: { id: 'kom-1' } } };
    default:
      return { issue: null };
  }
}

beforeEach(() => {
  _resetPamieciTokenu();
  gqlWyw = [];
  tokWyw = [];
  gqlKolejka = [];
  tokKolejka = [];
  licznikTokenow = 0;
  logi = [];
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-24T10:00:00Z'));
  for (const k of ['log', 'warn', 'error', 'info'] as const) {
    vi.spyOn(console, k).mockImplementation((...a: unknown[]) => {
      logi.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
    });
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url) === OAUTH_TOKEN_URL) {
        expect(new Headers(init?.headers).get('Content-Type')).toBe(
          'application/x-www-form-urlencoded',
        );
        tokWyw.push({
          body: new URLSearchParams(String(init?.body)),
          signal: Boolean(init?.signal),
        });
        const spec = tokKolejka.shift();
        if (spec === undefined) {
          licznikTokenow += 1;
          return odpowiedz({
            json: {
              access_token: tokenNr(licznikTokenow),
              token_type: 'Bearer',
              expires_in: 2591999,
              scope: 'read write',
            },
          });
        }
        const s = await rozwin(spec);
        if (s === 'timeout') throw new DOMException('The operation timed out', 'TimeoutError');
        if (s === 'siec') throw new TypeError('fetch failed');
        return odpowiedz(s);
      }
      expect(String(url)).toBe('https://api.linear.app/graphql');
      const body = JSON.parse(String(init?.body)) as { operationName: string; variables: Json };
      gqlWyw.push({
        op: body.operationName,
        auth: new Headers(init?.headers).get('Authorization') ?? '',
      });
      const spec = gqlKolejka.shift();
      if (spec === undefined)
        return odpowiedz({ json: { data: domyslnaGql(body.operationName, body.variables) } });
      const s = await rozwin(spec);
      if (s === 'timeout' || s === 'siec') throw new TypeError('fetch failed');
      return odpowiedz(s);
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const MIGRACJE = [
  '0001_init.sql',
  '0002_leads_add_source_company.sql',
  '0009_leads_updated_at.sql',
  '0010_linear_leady.sql',
];

function srodowisko(env: Partial<LinearEnv> = {}, kv = createFakeKV()) {
  const { DB, db } = d1Sqlite(MIGRACJE);
  const e = {
    DB,
    CACHE: kv,
    LINEAR_CLIENT_ID: ID_PROD,
    LINEAR_CLIENT_SECRET: SEKRET,
    LINEAR_TEAM_LEADY_ID: 'team-1',
    ...env,
  } as unknown as LinearEnv;
  return { env: e, db, kv };
}
type Db = ReturnType<typeof srodowisko>['db'];

let licznik = 0;
function dodajLead(db: Db): LeadRow {
  licznik += 1;
  const id = `00000000-0000-4000-9000-${String(licznik).padStart(12, '0')}`;
  db.prepare(
    `INSERT INTO leads (id, email, name, service_type, source, current_step) VALUES (?,?,?,?,?,?)`,
  ).run(id, 'jan@firma.pl', 'Jan', 'web', 'website', 1);
  return { id, email: 'jan@firma.pl' };
}
const wiersz = (db: Db, id: string) =>
  db.prepare('SELECT * FROM linear_leady WHERE lead_id = ?').get(id) as
    | { stan: string; proby: number; ostatni_blad: string | null; issue_id: string | null }
    | undefined;
const maLead = (db: Db, id: string) =>
  Boolean(db.prepare('SELECT id FROM leads WHERE id = ?').get(id));
const kluczeTokenu = (kv: ReturnType<typeof createFakeKV>) =>
  [...kv.store.keys()].filter(
    (k) => k.startsWith('linear:oauth:token:') && !k.endsWith(':blokada'),
  );

// ---------------------------------------------------------------------------------------------

describe('tryb autoryzacji (K4, forma 8, forma 10)', () => {
  it('(+) oba dane aplikacji → oauth; tylko klucz → klucz z logiem; brak → wyłączony', () => {
    expect(trybAutoryzacji({ LINEAR_CLIENT_ID: 'a', LINEAR_CLIENT_SECRET: 'b' })).toBe('oauth');
    expect(
      trybAutoryzacji({ LINEAR_CLIENT_ID: 'a', LINEAR_CLIENT_SECRET: 'b', LINEAR_API_KEY: 'k' }),
    ).toBe('oauth');
    expect(trybAutoryzacji({ LINEAR_API_KEY: 'k' }, true)).toBe('klucz');
    expect(logi).toContain('linear:klucz-osobisty');
    expect(trybAutoryzacji({})).toBeNull();
    expect(
      wlaczony({
        LINEAR_CLIENT_ID: 'a',
        LINEAR_CLIENT_SECRET: 'b',
        LINEAR_TEAM_LEADY_ID: 't',
      } as LinearEnv),
    ).toBe(true);
    expect(wlaczony({ LINEAR_CLIENT_ID: 'a', LINEAR_CLIENT_SECRET: 'b' } as LinearEnv)).toBe(false);
  });

  it('(−) forma 8: sam CLIENT_ID (albo sam SECRET) → bez pół-danych: klucz osobisty albo wyłączenie', async () => {
    expect(trybAutoryzacji({ LINEAR_CLIENT_ID: 'a', LINEAR_API_KEY: 'k' }, true)).toBe('klucz');
    expect(logi).toContain('linear:oauth-niepelne');
    expect(trybAutoryzacji({ LINEAR_CLIENT_SECRET: 'b' })).toBeNull();

    const { env, db } = srodowisko({ LINEAR_CLIENT_SECRET: undefined, LINEAR_API_KEY: KLUCZ_API });
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw.length).toBeGreaterThan(0);
    expect(gqlWyw.every((w) => w.auth === KLUCZ_API)).toBe(true);
    expect(wiersz(db, lead.id)?.stan).toBe('wyslany');

    const b = srodowisko({ LINEAR_CLIENT_ID: undefined, LINEAR_API_KEY: undefined });
    gqlWyw = [];
    await zglosLead(b.env, dodajLead(b.db).id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw).toHaveLength(0);
    expect(logi).toContain('linear:wylaczone');
  });

  it('(+) K4: brak danych aplikacji + klucz → jak dziś: surowy klucz bez „Bearer ”, log linear:klucz-osobisty', async () => {
    const { env, db } = srodowisko({
      LINEAR_CLIENT_ID: undefined,
      LINEAR_CLIENT_SECRET: undefined,
      LINEAR_API_KEY: KLUCZ_API,
    });
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw.map((w) => w.auth)).toEqual(Array(4).fill(KLUCZ_API));
    expect(logi).toContain('linear:klucz-osobisty');
    expect(wiersz(db, lead.id)?.stan).toBe('wyslany');
  });

  it('(−) K4: klucz osobisty + 401 → bez pobierania tokenu i bez ponowienia', async () => {
    const { env, db } = srodowisko({
      LINEAR_CLIENT_ID: undefined,
      LINEAR_CLIENT_SECRET: undefined,
      LINEAR_API_KEY: KLUCZ_API,
    });
    const lead = dodajLead(db);
    gqlKolejka = [{ status: 401, json: {} }];
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw).toHaveLength(1);
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'kolejka', ostatni_blad: 'HTTP 401' });
  });

  it('(−) K4: brak obu → moduł wyłączony, zero żądań', async () => {
    const { env, db } = srodowisko({
      LINEAR_CLIENT_ID: undefined,
      LINEAR_CLIENT_SECRET: undefined,
    });
    await zglosLead(env, dodajLead(db).id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw).toHaveLength(0);
    expect(logi).toContain('linear:wylaczone');
  });
});

describe('token aplikacji: K1, K2', () => {
  it('(+) K1/forma 1 bliźniak/forma 10: Bearer z tokenem, parametry /oauth/token, token z pamięci i KV', async () => {
    const { env, db, kv } = srodowisko({ LINEAR_API_KEY: KLUCZ_API });
    const a = dodajLead(db);
    await zglosLead(env, a.id);
    expect(tokWyw).toHaveLength(1);
    const p = tokWyw[0].body;
    expect(p.get('grant_type')).toBe('client_credentials');
    expect(p.get('client_id')).toBe(ID_PROD);
    expect(p.get('client_secret')).toBe(SEKRET);
    expect(p.get('scope')).toBe('read,write');
    expect(tokWyw[0].signal).toBe(true);
    expect(gqlWyw.length).toBe(4);
    expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(1)}`)).toBe(true);
    expect(gqlWyw.some((w) => w.auth.includes(KLUCZ_API))).toBe(false);
    expect(wiersz(db, a.id)?.stan).toBe('wyslany');
    expect(kluczeTokenu(kv)).toHaveLength(1);
    expect(kluczeTokenu(kv)[0]).not.toContain(ID_PROD);

    // Drugi lead w tym samym izolacie: bez pobierania.
    await zglosLead(env, dodajLead(db).id);
    expect(tokWyw).toHaveLength(1);
    // Nowy izolat (pusta pamięć): token z KV, bez pobierania.
    _resetPamieciTokenu();
    gqlWyw = [];
    await zglosLead(env, dodajLead(db).id);
    expect(tokWyw).toHaveLength(1);
    expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(1)}`)).toBe(true);
  });

  it('(+) odnowienie: przed progiem bez pobierania, po progu (24 h przed końcem) nowy token', async () => {
    const { env, db } = srodowisko();
    await zglosLead(env, dodajLead(db).id);
    expect(tokWyw).toHaveLength(1);
    vi.setSystemTime(Date.now() + 28 * DZIEN);
    await zglosLead(env, dodajLead(db).id);
    expect(tokWyw).toHaveLength(1);
    vi.setSystemTime(Date.now() + 1.5 * DZIEN);
    gqlWyw = [];
    await zglosLead(env, dodajLead(db).id);
    expect(tokWyw).toHaveLength(2);
    expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(2)}`)).toBe(true);
  });

  it('(+) po wygaśnięciu (31 dni) nowy token także z KV w nowym izolacie', async () => {
    const { env, db } = srodowisko();
    await zglosLead(env, dodajLead(db).id);
    vi.setSystemTime(Date.now() + 31 * DZIEN);
    _resetPamieciTokenu();
    gqlWyw = [];
    await zglosLead(env, dodajLead(db).id);
    expect(tokWyw).toHaveLength(2);
    expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(2)}`)).toBe(true);
  });
});

describe('formy ataku 1–3, 9: zła odpowiedź /oauth/token nie blokuje leada', () => {
  const zle: [string, Spec, string][] = [
    ['brak access_token', { json: { token_type: 'Bearer', expires_in: 100 } }, 'oauth:brak-tokenu'],
    ['pusty access_token', { json: { access_token: '  ', expires_in: 100 } }, 'oauth:brak-tokenu'],
    [
      'access_token nie-tekst',
      { json: { access_token: 123, expires_in: 100 } },
      'oauth:brak-tokenu',
    ],
    [
      'expires_in ujemne',
      { json: { access_token: 'tok_zly_1', expires_in: -5 } },
      'oauth:expires_in',
    ],
    ['expires_in zero', { json: { access_token: 'tok_zly_2', expires_in: 0 } }, 'oauth:expires_in'],
    ['expires_in brak', { json: { access_token: 'tok_zly_3' } }, 'oauth:expires_in'],
    [
      'expires_in tekst',
      { json: { access_token: 'tok_zly_4', expires_in: '3600' } },
      'oauth:expires_in',
    ],
    [
      'token_type inny',
      { json: { access_token: 'tok_zly_5', token_type: 'mac', expires_in: 100 } },
      'oauth:typ-tokenu',
    ],
    ['HTTP 500', { status: 500, json: { error: SEKRET } }, 'oauth:HTTP 500'],
    ['HTTP 401 (zły sekret)', { status: 401, json: { error: 'invalid_client' } }, 'oauth:HTTP 401'],
    ['timeout', 'timeout', 'oauth:timeout'],
    ['sieć', 'siec', 'oauth:siec'],
  ];
  for (const [nazwa, spec, blad] of zle) {
    it(`(−) ${nazwa} → brak żądania GraphQL, błąd ${blad}, lead w bazie i w kolejce`, async () => {
      const { env, db, kv } = srodowisko();
      const lead = dodajLead(db);
      tokKolejka = [spec];
      await zglosLead(env, lead.id);
      expect(tokWyw).toHaveLength(1);
      expect(gqlWyw).toHaveLength(0);
      expect(maLead(db, lead.id)).toBe(true);
      expect(wiersz(db, lead.id)).toMatchObject({ stan: 'kolejka', proby: 1, ostatni_blad: blad });
      expect(logi.join('\n')).toContain(blad);
      expect(kluczeTokenu(kv)).toHaveLength(0);
      for (const t of ['tok_zly_', SEKRET]) expect(logi.join('\n')).not.toContain(t);
    });
  }

  it('(+) bliźniak formy 9: po awarii następne wywołanie pobiera token i wysyła', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    tokKolejka = [{ status: 503, json: {} }];
    await zglosLead(env, lead.id);
    expect(wiersz(db, lead.id)?.stan).toBe('kolejka');
    const b = dodajLead(db);
    await zglosLead(env, b.id);
    expect(wiersz(db, b.id)?.stan).toBe('wyslany');
    expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(1)}`)).toBe(true);
  });

  const uszkodzone: [string, string][] = [
    ['zły JSON', '{nie-json'],
    ['brak pól', JSON.stringify({ t: 'tok_stary_kv' })],
    [
      'pusty token',
      JSON.stringify({
        t: '',
        wygasa: Date.parse('2027-01-01'),
        odnowPo: Date.parse('2026-12-31'),
      }),
    ],
    ['wygasa tekstem', JSON.stringify({ t: 'tok_stary_kv', wygasa: '2027', odnowPo: 1 })],
    ['odnowPo po wygasa', JSON.stringify({ t: 'tok_stary_kv', wygasa: 1, odnowPo: 2 })],
    ['null', 'null'],
  ];
  for (const [nazwa, wartosc] of uszkodzone) {
    it(`(−) forma 3: token w KV uszkodzony (${nazwa}) → ignorowany, jedno pobranie nowego`, async () => {
      const { env, db, kv } = srodowisko();
      await tokenAplikacji(env, Date.now() + 10_000); // ustala nazwę klucza
      const [klucz] = kluczeTokenu(kv);
      _resetPamieciTokenu();
      tokWyw = [];
      kv.store.set(klucz, wartosc);
      const lead = dodajLead(db);
      await zglosLead(env, lead.id);
      expect(tokWyw).toHaveLength(1);
      expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(2)}`)).toBe(true);
      expect(gqlWyw.some((w) => w.auth.includes('tok_stary_kv'))).toBe(false);
      expect(wiersz(db, lead.id)?.stan).toBe('wyslany');
    });
  }
});

describe('forma 4: 401 → jedno ponowienie z nowym tokenem, bez pętli', () => {
  it('(+) bliźniak: 401 raz → nowy token, ponowienie, lead wysłany', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    gqlKolejka = [
      { status: 401, json: { errors: [{ extensions: { code: 'AUTHENTICATION_ERROR' } }] } },
    ];
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(2);
    expect(gqlWyw[0].auth).toBe(`Bearer ${tokenNr(1)}`);
    expect(gqlWyw.slice(1).every((w) => w.auth === `Bearer ${tokenNr(2)}`)).toBe(true);
    expect(wiersz(db, lead.id)?.stan).toBe('wyslany');
  });

  it('(+) AUTHENTICATION_ERROR przy statusie 400 też odnawia raz', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    gqlKolejka = [
      { status: 400, json: { errors: [{ extensions: { code: 'AUTHENTICATION_ERROR' } }] } },
    ];
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(2);
    expect(wiersz(db, lead.id)?.stan).toBe('wyslany');
  });

  it('(−) 401 w pętli → dokładnie dwa pobrania tokenu i dwa żądania, potem błąd HTTP 401', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    gqlKolejka = Array(20).fill({ status: 401, json: {} });
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(2);
    // Etykiety 401 → ponowienie 401 → koniec przetwarzania tego leada (drenaż innych wierszy nie ma).
    expect(gqlWyw).toHaveLength(2);
    expect(wiersz(db, lead.id)).toMatchObject({
      stan: 'kolejka',
      ostatni_blad: 'HTTP 401',
      proby: 1,
    });
  });

  it('(−) 401 w pętli przy komentarzu kroku: jedno ponowienie, brak trzeciego pobrania', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    tokWyw = [];
    gqlWyw = [];
    gqlKolejka = Array(5).fill({ status: 401, json: {} });
    await komentarzKroku(env, lead.id, 'krok2', {});
    expect(tokWyw).toHaveLength(1);
    expect(gqlWyw).toHaveLength(2);
  });

  it('(+) 401, a inny izolat już odnowił token w KV → bierze nowy z KV bez pobierania', async () => {
    const { env, db, kv } = srodowisko();
    await tokenAplikacji(env, Date.now() + 10_000);
    const [klucz] = kluczeTokenu(kv);
    const nowy = {
      t: 'tok_z_innego_izolatu',
      wygasa: Date.now() + 10 * DZIEN,
      odnowPo: Date.now() + 9 * DZIEN,
    };
    gqlKolejka = [
      async () => {
        kv.store.set(klucz, JSON.stringify(nowy));
        return { status: 401, json: {} };
      },
    ];
    tokWyw = [];
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw.slice(1).every((w) => w.auth === 'Bearer tok_z_innego_izolatu')).toBe(true);
    expect(wiersz(db, lead.id)?.stan).toBe('wyslany');
  });
});

describe('forma 5: równoległe odnowienie → najwyżej jedno pobranie', () => {
  it('(+) dwa równoległe żądania w izolacie przy braku tokenu → jedno pobranie', async () => {
    const { env } = srodowisko();
    let pusc: () => void = () => {};
    const brama = new Promise<void>((r) => (pusc = r));
    tokKolejka = [
      async () => {
        await brama;
        return { json: { access_token: 'tok_wspolny', expires_in: 3600 } };
      },
    ];
    const a = tokenAplikacji(env, Date.now() + 10_000);
    const b = tokenAplikacji(env, Date.now() + 10_000);
    await new Promise((r) => setTimeout(r, 10));
    pusc();
    expect(await a).toEqual({ ok: true, token: 'tok_wspolny' });
    expect(await b).toEqual({ ok: true, token: 'tok_wspolny' });
    expect(tokWyw).toHaveLength(1);
  });

  it('(+) bez bindingu KV: dwa równoległe żądania w izolacie → jedno pobranie (pamięć izolatu)', async () => {
    const { env } = srodowisko({ CACHE: undefined });
    let pusc: () => void = () => {};
    const brama = new Promise<void>((r) => (pusc = r));
    tokKolejka = [
      async () => {
        await brama;
        return { json: { access_token: 'tok_bez_kv', expires_in: 3600 } };
      },
    ];
    const a = tokenAplikacji(env, Date.now() + 10_000);
    const b = tokenAplikacji(env, Date.now() + 10_000);
    await new Promise((r) => setTimeout(r, 10));
    pusc();
    expect(await a).toEqual({ ok: true, token: 'tok_bez_kv' });
    expect(await b).toEqual({ ok: true, token: 'tok_bez_kv' });
    expect(tokWyw).toHaveLength(1);
  });

  it('(−) 401 przy cudzej blokadzie: odrzucony token z KV nie wraca jako „nowy”, oauth:blokada bez kary', async () => {
    const { env, db, kv } = srodowisko();
    await tokenAplikacji(env, Date.now() + 10_000);
    const [klucz] = kluczeTokenu(kv);
    _resetPamieciTokenu();
    tokWyw = [];
    kv.store.set(`${klucz}:blokada`, JSON.stringify({ kto: 'inny', do: Date.now() + 30_000 }));
    gqlKolejka = [{ status: 401, json: {} }];
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw).toHaveLength(1);
    expect(wiersz(db, lead.id)).toMatchObject({
      stan: 'kolejka',
      proby: 0,
      ostatni_blad: 'oauth:blokada',
    });
  }, 10_000);

  it('(+) dwa izolaty, wspólny KV, wygasły token: drugi czeka na blokadzie i bierze token pierwszego', async () => {
    const kv = createFakeKV();
    const { env } = srodowisko({}, kv);
    let pusc: () => void = () => {};
    const brama = new Promise<void>((r) => (pusc = r));
    tokKolejka = [
      async () => {
        await brama;
        return { json: { access_token: 'tok_izolat_a', expires_in: 3600 } };
      },
    ];
    const a = tokenAplikacji(env, Date.now() + 10_000);
    await new Promise((r) => setTimeout(r, 10));
    _resetPamieciTokenu(); // izolat B: inna pamięć, ten sam KV
    const b = tokenAplikacji(env, Date.now() + 10_000);
    await new Promise((r) => setTimeout(r, 50));
    pusc();
    expect(await a).toEqual({ ok: true, token: 'tok_izolat_a' });
    expect(await b).toEqual({ ok: true, token: 'tok_izolat_a' });
    expect(tokWyw).toHaveLength(1);
  });

  it('(−) cudza blokada i brak nowego tokenu → oauth:blokada bez kary, zero pobrań', async () => {
    const { env, db, kv } = srodowisko();
    await tokenAplikacji(env, Date.now() + 10_000);
    const [klucz] = kluczeTokenu(kv);
    kv.store.delete(klucz);
    _resetPamieciTokenu();
    tokWyw = [];
    kv.store.set(`${klucz}:blokada`, JSON.stringify({ kto: 'inny', do: Date.now() + 30_000 }));
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw).toHaveLength(0);
    expect(wiersz(db, lead.id)).toMatchObject({
      stan: 'kolejka',
      proby: 0,
      ostatni_blad: 'oauth:blokada',
    });
  }, 10_000);

  it('(+) cudza blokada, token dojrzały do odnowienia ale ważny → używa starego, zero pobrań', async () => {
    const { env, db, kv } = srodowisko();
    await tokenAplikacji(env, Date.now() + 10_000);
    const [klucz] = kluczeTokenu(kv);
    vi.setSystemTime(Date.now() + 29.5 * DZIEN);
    _resetPamieciTokenu();
    tokWyw = [];
    kv.store.set(`${klucz}:blokada`, JSON.stringify({ kto: 'inny', do: Date.now() + 30_000 }));
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(0);
    expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(1)}`)).toBe(true);
    expect(wiersz(db, lead.id)?.stan).toBe('wyslany');
  }, 10_000);

  it('(+) przeterminowana blokada (do < teraz) nie blokuje pobrania', async () => {
    const { env, kv } = srodowisko();
    await tokenAplikacji(env, Date.now() + 10_000);
    const [klucz] = kluczeTokenu(kv);
    kv.store.delete(klucz);
    _resetPamieciTokenu();
    kv.store.set(`${klucz}:blokada`, JSON.stringify({ kto: 'inny', do: Date.now() - 1 }));
    expect(await tokenAplikacji(env, Date.now() + 10_000)).toEqual({ ok: true, token: tokenNr(2) });
    expect(kv.store.has(`${klucz}:blokada`)).toBe(false);
  });
});

describe('forma 6, K3: Preview i Production nie unieważniają sobie tokenów', () => {
  it('(+) wspólny KV, osobne aplikacje: Preview pobiera swój, Production dalej na swoim bez pobierania', async () => {
    const kv = createFakeKV();
    const prod = srodowisko({ LINEAR_CLIENT_ID: ID_PROD }, kv);
    const prev = srodowisko({ LINEAR_CLIENT_ID: ID_PREV, SRODOWISKO: 'preview' }, kv);
    await zglosLead(prod.env, dodajLead(prod.db).id);
    const [kluczProd] = kluczeTokenu(kv);
    const wartoscProd = kv.store.get(kluczProd);
    await zglosLead(prev.env, dodajLead(prev.db).id);
    expect(tokWyw.map((t) => t.body.get('client_id'))).toEqual([ID_PROD, ID_PREV]);
    expect(kluczeTokenu(kv)).toHaveLength(2);
    expect(kv.store.get(kluczProd)).toBe(wartoscProd);
    _resetPamieciTokenu();
    gqlWyw = [];
    await zglosLead(prod.env, dodajLead(prod.db).id);
    expect(tokWyw).toHaveLength(2);
    expect(gqlWyw.every((w) => w.auth === `Bearer ${tokenNr(1)}`)).toBe(true);
  });

  it('(+) ta sama aplikacja przy wspólnym KV → jeden wspólny token, bez drugiego pobrania', async () => {
    const kv = createFakeKV();
    const prod = srodowisko({}, kv);
    const prev = srodowisko({ SRODOWISKO: 'preview' }, kv);
    await zglosLead(prod.env, dodajLead(prod.db).id);
    _resetPamieciTokenu();
    await zglosLead(prev.env, dodajLead(prev.db).id);
    expect(tokWyw).toHaveLength(1);
  });
});

describe('forma 7: sekret i token poza logami, D1 i odpowiedziami', () => {
  it('(−) pełna ścieżka z 401, błędem i komentarzem: ani sekret, ani token w logach i D1', async () => {
    const { env, db } = srodowisko({ LINEAR_API_KEY: KLUCZ_API });
    const a = dodajLead(db);
    gqlKolejka = [{ status: 401, json: {} }];
    await zglosLead(env, a.id);
    const b = dodajLead(db);
    gqlKolejka = [{ status: 500, json: { errors: [{ message: tokenNr(2) }] } }];
    await zglosLead(env, b.id);
    await komentarzKroku(env, a.id, 'krok2', {});
    tokKolejka = [{ status: 400, json: { error: 'invalid', echo: SEKRET } }];
    _resetPamieciTokenu();
    vi.setSystemTime(Date.now() + 31 * DZIEN);
    await zglosLead(env, dodajLead(db).id);

    const wszystko = [
      logi.join('\n'),
      JSON.stringify(db.prepare('SELECT * FROM linear_leady').all()),
    ].join('\n');
    for (const t of [SEKRET, ID_PROD, tokenNr(1), tokenNr(2), 'tok_aplikacji', KLUCZ_API]) {
      expect(wszystko).not.toContain(t);
    }
    expect(logi.join('\n')).toContain('oauth:HTTP 400');
  });
});

describe('forma 11: token bez write → błąd zapisu w logu, lead w bazie', () => {
  it('(−) FORBIDDEN przy tworzeniu zadania → errors:FORBIDDEN, kolejka, lead w leads; bez odnawiania tokenu', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    gqlKolejka = [
      { json: { data: domyslnaGql('Etykiety', {}) } },
      { json: { data: domyslnaGql('KlientUpsert', {}) } },
      { status: 400, json: { errors: [{ extensions: { code: 'FORBIDDEN' } }] } },
    ];
    await zglosLead(env, lead.id);
    expect(tokWyw).toHaveLength(1);
    expect(maLead(db, lead.id)).toBe(true);
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'kolejka', ostatni_blad: 'HTTP 400' });
    expect(logi.join('\n')).toContain('HTTP 400');
  });

  it('(−) FORBIDDEN w odpowiedzi 200 → errors:FORBIDDEN w logu', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    gqlKolejka = [{ json: { errors: [{ extensions: { code: 'FORBIDDEN' } }] } }];
    await zglosLead(env, lead.id);
    expect(wiersz(db, lead.id)).toMatchObject({
      stan: 'kolejka',
      ostatni_blad: 'errors:FORBIDDEN',
    });
    expect(logi.join('\n')).toContain('errors:FORBIDDEN');
    expect(tokWyw).toHaveLength(1);
  });
});
