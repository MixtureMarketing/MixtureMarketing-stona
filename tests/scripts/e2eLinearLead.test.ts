// Testy czystych części skryptu e2e leady → Linear oraz przebiegu na atrapach (bez sieci, bez `lin`).
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  idDozwolone,
  komentarzeZadania,
  przypadekE,
  adresE2E,
  czekaj,
  czyUruchomicB,
  czytajArgumenty,
  decyzjaDostepu,
  decyzjaOchrony,
  etykietyPrzypadku,
  fazaF1,
  fazaF2,
  komunikatBledu,
  maskuj,
  pobierzZadania,
  podpisPonow,
  podsumuj,
  POWOD_POMINIECIA_C,
  decyzjaPominieciaC,
  powodOdrzuceniaIdStanuF,
  przebieg,
  sprawdzAdresPreview,
  sprawdzOchrone,
  sprzatanie,
  sprawdzWiazanieStanu,
  tytulPasuje,
  wczytajPlikStanu,
  wynikF,
  zmienLin,
  zbudujKontekst,
  zbudujRaport,
} from '../../scripts/test-e2e-linear-lead.mjs';

const ID = 'id-dostepu-TESTOWE';
const SEKRET = 'sekret-dostepu-TESTOWY-123';
const PONOW = 'sekret-ponow-TESTOWY-0123456789abcdef';
const BAZA = 'https://dev.mixturemarketing-stona.pages.dev';
const HASH = 'https://a1b2c3d4.mixturemarketing-stona.pages.dev';
const CHRONIONY = {
  status: 302,
  location: 'https://mixture.cloudflareaccess.com/cdn-cgi/access/login/x',
};

// ---------------------------------------------------------------------------------------------
// Atrapy: serwer Preview (fetch) i Linear (`lin`)
// ---------------------------------------------------------------------------------------------

interface Issue {
  id: string;
  stan: string;
  kto: string;
  delegat: null;
  tytul: string;
  etykiety: string[];
}

interface Opcje {
  bezOchrony?: 'alias' | 'hash' | 'oba';
  bezAccessOdp?: { status: number; location?: string };
  zAccessStatus?: number;
  drugiLeadTworzyZadanie?: boolean | 'oba';
  nigdyZadania?: boolean;
  ponow?: Array<Record<string, number>>;
  dlaKazdegoPostuZadan?: number;
  zepsutaLista?: boolean;
  kto?: string;
  /** Własna odpowiedź na POST danej ścieżki (MIX-1556: odmowy kalkulatora i formularza). */
  nadpiszPost?: Record<
    string,
    (dodaj: (d: string | null, t: string, e: string[]) => string[]) => Response | Promise<Response>
  >;
}

function atrapa(opcje: Opcje = {}) {
  let czas = 1_760_000_000_000;
  let n = 10;
  const zadania: Issue[] = [];
  const komentarze: Record<string, Array<{ tresc: string }>> = {};
  const posty: string[] = [];
  const zadaniaFetch: string[] = [];
  const widziane = new Map<string, string>();
  const ponowOdp = [...(opcje.ponow ?? [])];
  let ponowWywolania = 0;
  const kto = opcje.kto ?? 'jakub';

  const dodaj = (domena: string | null, temat: string, etykiety: string[], ile = 1): string[] => {
    const ids: string[] = [];
    for (let i = 0; i < ile; i++) {
      n += 1;
      ids.push(`LEA-${n}`);
      zadania.push({
        id: `LEA-${n}`,
        stan: 'Backlog',
        kto,
        delegat: null,
        tytul: `[Preview] Lead: ${domena ?? 'osoba prywatna'} — ${temat}`,
        etykiety,
      });
    }
    return ids;
  };
  const ile = opcje.dlaKazdegoPostuZadan ?? 1;

  const jsonOdp = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

  const fetchAtrapa = async (url: string | URL, init: RequestInit = {}): Promise<Response> => {
    const u = new URL(String(url));
    const h = new Headers(init.headers);
    zadaniaFetch.push(`${init.method ?? 'GET'} ${u.host}${u.pathname}`);
    const maAccess =
      h.get('cf-access-client-id') === ID && h.get('cf-access-client-secret') === SEKRET;
    if (!maAccess) {
      const nieChronione =
        (opcje.bezOchrony === 'alias' || opcje.bezOchrony === 'oba') && u.host.startsWith('dev.');
      const nieChroniHash =
        (opcje.bezOchrony === 'hash' || opcje.bezOchrony === 'oba') &&
        u.host.startsWith('a1b2c3d4.');
      if (nieChronione || nieChroniHash) return new Response('<html>app</html>', { status: 200 });
      const o = opcje.bezAccessOdp ?? CHRONIONY;
      return new Response(null, {
        status: o.status,
        headers: o.location ? { Location: o.location } : {},
      });
    }
    if (init.method !== 'POST') {
      if (u.pathname === '/api/estimation/public-questions') {
        if (opcje.zAccessStatus && opcje.zAccessStatus !== 200)
          return new Response('blokada', { status: opcje.zAccessStatus });
        return jsonOdp({
          contractVersion: 1,
          questions: [{ code: 'project_goal', options: [{ value: 'nowa-strona' }] }],
        });
      }
      return new Response('<html>app</html>', { status: 200 });
    }
    posty.push(`${u.pathname}`);
    const nad = opcje.nadpiszPost?.[u.pathname];
    if (nad) return nad((d, t, e) => dodaj(d, t, e));
    if (u.pathname === '/api/contact-submit') {
      const b = JSON.parse(String(init.body));
      const email: string = b.lead.email;
      const domena = email.split('@')[1];
      const firmowa = domena !== 'gmail.com' ? domena : null;
      if (widziane.has(email)) {
        const pierwsze = zadania.find((z) => z.id === widziane.get(email));
        if (opcje.drugiLeadTworzyZadanie) dodaj(firmowa, 'kontakt', ['formularz', 'test']);
        if (opcje.drugiLeadTworzyZadanie !== true && pierwsze) {
          komentarze[pierwsze.id] = [
            ...(komentarze[pierwsze.id] ?? []),
            { tresc: '**Kolejny lead z tego adresu e-mail (w ciągu godziny)**' },
          ];
        }
      } else {
        widziane.set(email, '');
        if (!opcje.nigdyZadania) {
          const ids = dodaj(
            firmowa,
            'kontakt',
            firmowa ? ['formularz', 'test'] : ['formularz', 'bez-firmy', 'test'],
            ile,
          );
          widziane.set(email, ids[0]);
        }
      }
      return jsonOdp({ success: true, id: 'uuid', edit_token: 'tok', degraded: false });
    }
    if (u.pathname === '/api/estimation/public-quote') {
      if (!opcje.nigdyZadania)
        dodaj('example.com', 'kalkulator: 5 000–9 000 zł', ['kalkulator', 'test']);
      return jsonOdp({ priceRange: { min: 5000, max: 9000 }, currency: 'PLN', status: 'ok' });
    }
    if (u.pathname === '/api/audit/capture-lead') {
      const fd = init.body as FormData;
      if (!opcje.nigdyZadania)
        dodaj('example.com', `audyt strony, wynik ${fd.get('score')}/100`, ['audyt', 'test']);
      return jsonOdp({ status: 'success', id: 'uuid' });
    }
    if (u.pathname === '/api/leady/ponow') {
      ponowWywolania += 1;
      return jsonOdp(ponowOdp.shift() ?? { ponowione: 0, w_kolejce: 0, zablokowane: 0 });
    }
    return new Response('nie ma', { status: 404 });
  };

  const lin = async (args: string[]): Promise<string> => {
    if (args[0] === 'lista') {
      if (opcje.zepsutaLista) return 'to nie jest json';
      return JSON.stringify({ zadania: [...zadania].reverse(), limit_osiagniety: false });
    }
    if (args[0] === 'komentarze') return JSON.stringify(komentarze[args[1]] ?? []);
    if (args[0] === 'stan') {
      const z = zadania.find((x) => x.id === args[1]);
      if (!z) throw new Error('brak zadania');
      z.stan = args[2];
      return 'ok';
    }
    if (args[0] === 'etykieta') {
      const z = zadania.find((x) => x.id === args[1]);
      if (!z) throw new Error('brak zadania');
      z.etykiety.push(args[2].replace(/^\+/, ''));
      return 'ok';
    }
    throw new Error(`nieznane polecenie ${args[0]}`);
  };

  const sleep = async (ms: number) => {
    czas += ms;
  };
  return {
    fetch: fetchAtrapa,
    lin,
    sleep,
    now: () => czas,
    zadania,
    komentarze,
    posty,
    zadaniaFetch,
    ponowWywolania: () => ponowWywolania,
    dodaj,
  };
}

function kontekst(
  opcje: Opcje = {},
  env: Record<string, string | undefined> = {},
  stan: unknown = null,
) {
  const a = atrapa(opcje);
  const logi: string[] = [];
  const raporty: string[] = [];
  const stany: unknown[] = [];
  let aktualnyStan = stan;
  // Zadanie z fazy f powstało w osobnym procesie: atrapa ma je już przed biegiem (LEA-11).
  if ((stan as { zadania?: string[] } | null)?.zadania?.length)
    a.dodaj('example.com', 'kontakt', ['formularz']);
  const ctx = zbudujKontekst({
    env: {
      CF_ACCESS_CLIENT_ID: ID,
      CF_ACCESS_CLIENT_SECRET: SEKRET,
      E2E_PONOW_SECRET: PONOW,
      E2E_HASH_URL: HASH,
      E2E_SHA: 'abc1234',
      ...env,
    },
    deps: {
      fetch: a.fetch,
      lin: a.lin,
      sleep: a.sleep,
      now: a.now,
      teraz: () => new Date(Date.UTC(2026, 10, 2, 9, 5, 0)),
      log: (t: string) => logi.push(t),
      zapiszRaport: (t: string) => raporty.push(t),
      wczytajStan: () => aktualnyStan,
      zapiszStan: (s: Record<string, unknown>) => {
        aktualnyStan = { ...(aktualnyStan as object), ...s };
        stany.push(s);
      },
    },
  });
  return { ctx, a, logi, raporty, stany, stanAktualny: () => aktualnyStan };
}

type Wyniki = Record<string, { status: string; powod?: string }>;
const biegnij = async (ctx: unknown, o?: { faza?: string }) =>
  (await przebieg(ctx, o as { faza?: null })) as { kod: number; linia: string; wyniki: Wyniki };

// Zegar atrapy startuje od TS0 (ms); stan sprzed godziny, związany z E2E_SHA z kontekstu testowego.
const TS0 = 1_760_000_000_000;
const GODZ = 3_600_000;
const SHA = 'abc1234';
const STAN_F_OK = {
  f1: 'pass',
  f2: 'pass',
  zadanie: 'LEA-11',
  zadania: ['LEA-11'],
  sha: SHA,
  ts: TS0 - GODZ,
};
const STAN_F1_OK = {
  f1: 'pass',
  przed: [] as string[],
  zadania: [] as string[],
  sha: SHA,
  ts: TS0 - GODZ,
};

// ---------------------------------------------------------------------------------------------
// Czyste części
// ---------------------------------------------------------------------------------------------

describe('adresE2E', () => {
  const t = new Date(Date.UTC(2026, 10, 2, 9, 5, 0));
  it('buduje e2e+<RRRRMMDDGGMM><litera>@example.com', () => {
    expect(adresE2E(t, 'a')).toBe('e2e+202611020905a@example.com');
    expect(adresE2E(t, 'b', 'gmail.com')).toBe('e2e+202611020905b@gmail.com');
  });
  it('odrzuca złą literę, domenę i datę', () => {
    expect(() => adresE2E(t, 'ab')).toThrow(/litera/);
    expect(() => adresE2E(t, 'A')).toThrow(/litera/);
    expect(() => adresE2E(t, 'a', 'x@y')).toThrow(/domena/);
    expect(() => adresE2E(new Date('x'), 'a')).toThrow(/data/);
  });
  it('litery dają różne adresy, a ta sama litera ten sam (e)', () => {
    expect(adresE2E(t, 'a')).not.toBe(adresE2E(t, 'c'));
    expect(adresE2E(t, 'e')).toBe(adresE2E(t, 'e'));
  });
});

describe('dopasowanie tytułu', () => {
  it('a, e, f: kontakt z domeną example.com i przedrostkiem [Preview]', () => {
    for (const p of ['a', 'e', 'f'])
      expect(tytulPasuje(p, '[Preview] Lead: example.com — kontakt')).toBe(true);
    expect(tytulPasuje('a', 'Lead: example.com — kontakt')).toBe(false);
    expect(tytulPasuje('a', '[Preview] Lead: example.com — kontakt 2')).toBe(false);
    expect(tytulPasuje('a', '[Preview] Lead: inna.pl — kontakt')).toBe(false);
  });
  it('b: osoba prywatna, nie domena firmowa', () => {
    expect(tytulPasuje('b', '[Preview] Lead: osoba prywatna — kontakt')).toBe(true);
    expect(tytulPasuje('b', '[Preview] Lead: example.com — kontakt')).toBe(false);
  });
  it('c: widełki z „zł”', () => {
    expect(tytulPasuje('c', '[Preview] Lead: example.com — kalkulator: 5 000–9 000 zł')).toBe(true);
    expect(tytulPasuje('c', '[Preview] Lead: example.com — kalkulator')).toBe(false);
    expect(tytulPasuje('c', '[Preview] Lead: example.com — kontakt')).toBe(false);
  });
  it('d: wynik audytu równy wysłanemu', () => {
    expect(tytulPasuje('d', '[Preview] Lead: example.com — audyt strony, wynik 73/100', 73)).toBe(
      true,
    );
    expect(tytulPasuje('d', '[Preview] Lead: example.com — audyt strony, wynik 74/100', 73)).toBe(
      false,
    );
    expect(tytulPasuje('d', '[Preview] Lead: example.com — audyt strony', 73)).toBe(false);
  });
  it('nieznany przypadek i nie-tekst: brak dopasowania', () => {
    expect(tytulPasuje('z', '[Preview] Lead: example.com — kontakt')).toBe(false);
    expect(tytulPasuje('a', undefined as unknown as string)).toBe(false);
  });
  it('etykiety: b ma bez-firmy, a nie', () => {
    expect(etykietyPrzypadku('b').wymagane).toContain('bez-firmy');
    expect(etykietyPrzypadku('a').zakazane).toContain('bez-firmy');
    expect(etykietyPrzypadku('d').wymagane).toEqual(['audyt', 'test']);
  });
});

describe('kod wyjścia', () => {
  const wszystkie = (s = 'pass') =>
    Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((p) => [p, { status: s }]));
  it('0 tylko przy 7/7', () => {
    expect(podsumuj(wszystkie())).toMatchObject({ kod: 0, ok: 7 });
    expect(podsumuj(wszystkie()).linia).toMatch(/^7\/7/);
  });
  it('porażka jednego przypadku = 1', () => {
    const w = { ...wszystkie(), c: { status: 'fail' } };
    expect(podsumuj(w)).toMatchObject({ kod: 1, ok: 6 });
    expect(podsumuj(w).linia).toMatch(/PORAŻKA: c/);
  });
  it('skip z linią powodu = 0 (MIX-1556); skip bez powodu albo brak (f) = 3, nie 0', () => {
    const skipB = { status: 'skip', powod: 'Preview ma Resend (brak E2E_BEZ_RESEND=1)' };
    const skipC = { status: 'skip', powod: POWOD_POMINIECIA_C };
    expect(podsumuj({ ...wszystkie(), b: skipB })).toMatchObject({ kod: 0, ok: 6 });
    const bc = podsumuj({ ...wszystkie(), b: skipB, c: skipC });
    expect(bc).toMatchObject({ kod: 0, ok: 5 });
    expect(bc.linia).toBe('5/7, pominięte: b,c (a=pass b=skip c=skip d=pass e=pass f=pass g=pass)');
    // Fail-closed: skip bez powodu, z pustym albo białym powodem, z powodem nie-tekstem = niepełny.
    for (const zly of [
      { status: 'skip' },
      { status: 'skip', powod: '' },
      { status: 'skip', powod: '  ' },
      { status: 'skip', powod: 7 },
    ])
      expect(podsumuj({ ...wszystkie(), c: zly })).toMatchObject({ kod: 3, ok: 6 });
    expect(podsumuj({ ...wszystkie(), f: { status: 'brak' } }).kod).toBe(3);
    expect(podsumuj({ ...wszystkie(), f: undefined }).kod).toBe(3);
    expect(podsumuj({ ...wszystkie(), c: skipC, f: { status: 'brak' } }).kod).toBe(3);
    // Porażka obok pominięcia z powodem nadal = 1.
    expect(podsumuj({ ...wszystkie(), c: skipC, d: { status: 'fail', powod: 'x' } }).kod).toBe(1);
  });
  it('nieznany status, puste wejście i porażka obok pominiętego = fail-closed', () => {
    expect(podsumuj({ ...wszystkie(), a: { status: 'ok' } }).kod).toBe(1);
    expect(podsumuj({}).kod).toBe(3);
    expect(podsumuj(undefined).kod).toBe(3);
    expect(podsumuj({ ...wszystkie(), b: { status: 'skip' }, c: { status: 'fail' } }).kod).toBe(1);
  });
  const cx = { sha: SHA, now: () => TS0 };
  const swiezy = { sha: SHA, ts: TS0 - GODZ };
  it('wynikF: pass tylko po f1 i f2 (stan świeży i z tego SHA)', () => {
    expect(wynikF({ ...swiezy, f1: 'pass' }, cx).status).toBe('brak');
    expect(wynikF({ ...swiezy, f1: 'fail' }, cx).status).toBe('fail');
    expect(wynikF({ ...swiezy, f1: 'pass', f2: 'pass', zadanie: 'LEA-3' }, cx).status).toBe('pass');
    expect(wynikF({ ...swiezy, f1: 'pass', f2: 'fail' }, cx).status).toBe('brak');
  });
  const zle: Array<[string, unknown, RegExp]> = [
    ['brak pliku', null, /brak pliku stanu/],
    ['undefined', undefined, /brak pliku stanu/],
    ['nieczytelny JSON', { nieczytelny: true }, /nieczytelny/],
    ['tablica', [], /nieczytelny/],
    ['tekst', 'f1', /nieczytelny/],
    ['{}', {}, /innego SHA/],
    ['inny SHA', { f1: 'pass', f2: 'pass', sha: 'fff9999', ts: TS0 - GODZ }, /innego SHA/],
    [
      'SHA o jeden znak krótszy',
      { f1: 'pass', f2: 'pass', sha: 'abc123', ts: TS0 - GODZ },
      /innego SHA/,
    ],
    ['bez SHA w stanie', { f1: 'pass', f2: 'pass', ts: TS0 - GODZ }, /innego SHA/],
    ['25 h', { f1: 'pass', f2: 'pass', sha: SHA, ts: TS0 - 25 * GODZ }, /starszy niż 24 h/],
    [
      'dokładnie 24 h',
      { f1: 'pass', f2: 'pass', sha: SHA, ts: TS0 - 24 * GODZ },
      /starszy niż 24 h/,
    ],
    ['ts z przyszłości', { f1: 'pass', f2: 'pass', sha: SHA, ts: TS0 + GODZ }, /przyszłości/],
    ['bez ts', { f1: 'pass', f2: 'pass', sha: SHA }, /bez znacznika czasu/],
    ['ts jako tekst', { f1: 'pass', f2: 'pass', sha: SHA, ts: String(TS0) }, /bez znacznika czasu/],
    ['ts NaN', { f1: 'pass', f2: 'pass', sha: SHA, ts: Number.NaN }, /bez znacznika czasu/],
  ];
  for (const [nazwa, stan, powod] of zle) {
    it(`wynikF odmawia (fail, z powodem): ${nazwa}`, () => {
      const w = wynikF(stan as never, cx);
      expect(w.status).toBe('fail');
      expect(w.powod).toMatch(powod);
    });
  }
  it('wynikF: brak E2E_SHA w kontekście = fail nawet gdy stan ma pusty SHA', () => {
    for (const sha of ['', undefined]) {
      const w = wynikF(
        { f1: 'pass', f2: 'pass', sha: sha ?? '', ts: TS0 - GODZ },
        { sha, now: () => TS0 },
      );
      expect(w.status).toBe('fail');
      expect(w.powod).toMatch(/brak E2E_SHA/);
    }
  });
  it('wynikF: 1 h i 23 h 59 min przechodzą (bliźniak odmowy 25 h)', () => {
    for (const wiek of [GODZ, 24 * GODZ - 60_000])
      expect(wynikF({ f1: 'pass', f2: 'pass', sha: SHA, ts: TS0 - wiek }, cx).status).toBe('pass');
    expect(sprawdzWiazanieStanu({ sha: SHA, ts: TS0 }, cx)).toBeNull();
  });
  it('wczytajPlikStanu: brak pliku = null; zły JSON, {…} nie-obiekt, inny błąd = nieczytelny; poprawny = obiekt', () => {
    const blad = (code: string) => () => {
      throw Object.assign(new Error('x'), { code });
    };
    expect(wczytajPlikStanu('x', blad('ENOENT'))).toBeNull();
    expect(wczytajPlikStanu('x', blad('EACCES'))).toEqual({ nieczytelny: true });
    expect(wczytajPlikStanu('x', () => '{nie json')).toEqual({ nieczytelny: true });
    expect(wczytajPlikStanu('x', () => '')).toEqual({ nieczytelny: true });
    expect(wczytajPlikStanu('x', () => '[1]')).toEqual({ nieczytelny: true });
    expect(wczytajPlikStanu('x', () => '5')).toEqual({ nieczytelny: true });
    expect(wczytajPlikStanu('x', () => 'null')).toEqual({ nieczytelny: true });
    expect(wczytajPlikStanu('x', () => '{"f1":"pass"}')).toEqual({ f1: 'pass' });
    expect(wczytajPlikStanu('x', () => '{}')).toEqual({});
  });
});

describe('maskowanie sekretów', () => {
  it('zamienia znane sekrety i ich wersje URL', () => {
    expect(maskuj(`błąd ${SEKRET} i ${ID}`, [SEKRET, ID])).toBe('błąd *** i ***');
    expect(maskuj(`q=${encodeURIComponent('a b&c')}`, ['a b&c'])).toBe('q=***');
  });
  it('maskuje wartości nagłówków Access i podpisu bez znajomości sekretu', () => {
    expect(maskuj('CF-Access-Client-Secret: tajne123')).toBe('CF-Access-Client-Secret: ***');
    expect(maskuj('cf-access-client-id=abc.def')).toBe('cf-access-client-id=***');
    expect(maskuj('X-Mixture-Signature: sha256=abcdef0123')).toBe(
      'X-Mixture-Signature: sha256=***',
    );
  });
  it('ignoruje puste i nie-tekstowe sekrety; tekst bez sekretu bez zmian', () => {
    expect(maskuj('zwykły tekst', ['', undefined as unknown as string])).toBe('zwykły tekst');
    expect(maskuj(undefined as unknown as string)).toBe('');
  });
});

describe('(b) tylko bez Resend', () => {
  it('flaga E2E_BEZ_RESEND=1 włącza, wszystko inne wyłącza', () => {
    expect(czyUruchomicB({ E2E_BEZ_RESEND: '1' })).toBe(true);
    for (const v of [undefined, '', '0', 'true', 'tak', ' 1'])
      expect(czyUruchomicB({ E2E_BEZ_RESEND: v })).toBe(false);
    expect(czyUruchomicB(undefined)).toBe(false);
  });
});

describe('podpis ponow', () => {
  it('ma format sha256=<64 znaki hex> i jest deterministyczny', () => {
    const czas = '1760000000';
    const nonce = '123e4567-e89b-42d3-a456-426614174000';
    expect(podpisPonow(PONOW, czas, nonce)).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(podpisPonow(PONOW, czas, nonce)).toBe(podpisPonow(PONOW, czas, nonce));
  });
  it('inny sekret albo czas daje inny podpis', () => {
    const n = '123e4567-e89b-42d3-a456-426614174000';
    expect(podpisPonow(PONOW, '1', n)).not.toBe(podpisPonow(PONOW + 'x', '1', n));
    expect(podpisPonow(PONOW, '1', n)).not.toBe(podpisPonow(PONOW, '2', n));
  });
});

describe('argumenty i odpytywanie', () => {
  it('--faza tylko f1 albo f2; nieznany argument = błąd', () => {
    expect(czytajArgumenty(['--faza', 'f1']).blad).toBeNull();
    expect(czytajArgumenty(['--faza', 'f2', '--sha', 'x']).sha).toBe('x');
    expect(czytajArgumenty(['--faza', 'f3']).blad).toMatch(/--faza/);
    expect(czytajArgumenty(['--faza']).blad).toMatch(/--faza/);
    expect(czytajArgumenty(['--cos']).blad).toMatch(/nieznany/);
  });
  it('czekaj zwraca wynik z czasem w sekundach albo null po limicie', async () => {
    let t = 0;
    let proby = 0;
    const wspolne = { start: 0, now: () => t, sleep: async (ms: number) => void (t += ms) };
    const r = await czekaj({ ...wspolne, probuj: async () => (++proby === 3 ? 'jest' : null) });
    expect(r).toEqual({ wynik: 'jest', sekundy: 10 });
    t = 0;
    expect(await czekaj({ ...wspolne, probuj: async () => null })).toBeNull();
    expect(t).toBe(60_000);
  });
  it('lista zadań: nieczytelna, bez pola i z osiągniętym limitem to błąd', async () => {
    await expect(pobierzZadania(async () => 'x')).rejects.toThrow(/JSON/);
    await expect(pobierzZadania(async () => '{}')).rejects.toThrow(/zadania/);
    await expect(
      pobierzZadania(async () => '{"zadania":[],"limit_osiagniety":true}'),
    ).rejects.toThrow(/limit/);
    await expect(pobierzZadania(async () => '{"zadania":[{"id":"LEA-1"}]}')).rejects.toThrow(
      /tytułu/,
    );
    expect(
      await pobierzZadania(async () => '{"zadania":[{"id":"LEA-1","tytul":"t"}]}'),
    ).toHaveLength(1);
  });
  it('raport: SHA, czasy, liczby; bez adresów e-mail', () => {
    const wyniki = { a: { status: 'pass', sekundy: 7.5, zadanie: 'LEA-11' } };
    const md = zbudujRaport({
      sha: 'abc1234',
      host: 'dev.x.pages.dev',
      znacznik: '20261102T090500Z',
      wyniki,
      przed: 4,
      po: 4,
      podsumowanie: podsumuj(wyniki),
    });
    expect(md).toContain('SHA wdrożenia: abc1234');
    expect(md).toContain('przed: 4, po: 4');
    expect(md).toContain('| a | pass | 7.5 | LEA-11 |');
    expect(md).not.toMatch(/@/);
  });
});

// ---------------------------------------------------------------------------------------------
// Formy ataku na strażnika ochrony (każda odmowa ma dozwolonego bliźniaka)
// ---------------------------------------------------------------------------------------------

describe('strażnik ochrony: decyzjaOchrony', () => {
  const forma = (
    opis: string,
    wejscie: Record<string, unknown>,
    chroniony: boolean,
    powod: RegExp,
  ) => ({ opis, wejscie, chroniony, powod });
  const tabela = [
    // dozwolone bliźniaki
    forma('B0 302 na host Access', CHRONIONY, true, /cloudflareaccess\.com/),
    forma(
      'B1 303 na host Access',
      { status: 303, location: 'https://t.cloudflareaccess.com/x' },
      true,
      /303/,
    ),
    forma('B2 403', { status: 403 }, true, /403/),
    forma(
      'B3 host wielkimi literami (ten sam host)',
      { status: 302, location: 'https://TEAM.CLOUDFLAREACCESS.COM/x' },
      true,
      /cloudflareaccess/,
    ),
    forma(
      'B4 głębsza subdomena',
      { status: 302, location: 'https://a.b.cloudflareaccess.com/x' },
      true,
      /cloudflareaccess/,
    ),
    // odmowy
    forma(
      'F1 lookalike cloudflareaccess.com.evil.tld',
      { status: 302, location: 'https://cloudflareaccess.com.evil.tld/x' },
      false,
      /obcy host/,
    ),
    forma(
      'F2 xcloudflareaccess.com (bez kropki)',
      { status: 302, location: 'https://xcloudflareaccess.com/x' },
      false,
      /obcy host/,
    ),
    forma(
      'F3 sztuczka z danymi logowania',
      { status: 302, location: 'https://x.cloudflareaccess.com@evil.tld/' },
      false,
      /danymi logowania|obcy host/,
    ),
    forma(
      'F4 względny Location',
      { status: 302, location: '/cdn-cgi/access/login' },
      false,
      /bezwzględnym/,
    ),
    forma('F5 200 ze stroną podobną do Access', { status: 200, location: null }, false, /kod 200/),
    forma(
      'F6 Location bez https',
      { status: 302, location: 'http://t.cloudflareaccess.com/x' },
      false,
      /bez https/,
    ),
    forma(
      'F7 kropka na końcu hosta',
      { status: 302, location: 'https://t.cloudflareaccess.com./x' },
      false,
      /obcy host/,
    ),
    forma(
      'F8 sam apex cloudflareaccess.com (brak etykiety zespołu)',
      { status: 302, location: 'https://cloudflareaccess.com/x' },
      false,
      /obcy host/,
    ),
    forma(
      'F9 port w Location',
      { status: 302, location: 'https://t.cloudflareaccess.com:8443/x' },
      false,
      /portem/,
    ),
    forma('F10 302 bez Location', { status: 302 }, false, /bez nagłówka Location/),
    forma(
      'F11 302 z pustym Location',
      { status: 302, location: '  ' },
      false,
      /bez nagłówka Location/,
    ),
    forma(
      'F12 301 na host Access (inny kod)',
      { status: 301, location: 'https://t.cloudflareaccess.com/x' },
      false,
      /nie jest odmową/,
    ),
    forma(
      'F13 307 na host Access',
      { status: 307, location: 'https://t.cloudflareaccess.com/x' },
      false,
      /nie jest odmową/,
    ),
    forma('F14 401', { status: 401 }, false, /kod 401/),
    forma('F15 500', { status: 500 }, false, /kod 500/),
    forma('F16 błąd sieci', { blad: 'ECONNRESET' }, false, /błąd żądania/),
    forma(
      'F17 limit czasu',
      { blad: 'The operation was aborted due to timeout' },
      false,
      /błąd żądania/,
    ),
    forma('F18 puste wejście', {}, false, /brak kodu/),
    forma(
      'F19 status jako tekst',
      { status: '302', location: 'https://t.cloudflareaccess.com/x' },
      false,
      /brak kodu/,
    ),
    forma(
      'F21 200 z Location na host Access (ciało podobne do Access)',
      { status: 200, location: 'https://t.cloudflareaccess.com/x' },
      false,
      /kod 200/,
    ),
    forma(
      'F22 dane logowania przy prawdziwym hoście Access',
      { status: 302, location: 'https://x@t.cloudflareaccess.com/x' },
      false,
      /danymi logowania/,
    ),
    forma(
      'F23 hasło przy prawdziwym hoście Access',
      { status: 302, location: 'https://:pw@t.cloudflareaccess.com/x' },
      false,
      /danymi logowania/,
    ),
    forma(
      'F20 Location z innej domeny wyglądającej na Access',
      { status: 302, location: 'https://t.cloudflareaccess.net/x' },
      false,
      /obcy host/,
    ),
  ];
  for (const t of tabela) {
    it(`${t.opis}: ${t.chroniony ? 'przepuszcza' : 'odmawia'}`, () => {
      const d = decyzjaOchrony(t.wejscie);
      expect(d.chroniony).toBe(t.chroniony);
      expect(d.powod).toMatch(t.powod);
    });
  }
  it('null i undefined: odmowa', () => {
    expect(decyzjaOchrony(null as never).chroniony).toBe(false);
    expect(decyzjaOchrony(undefined as never).chroniony).toBe(false);
  });
});

describe('strażnik: adres Preview (przypięty)', () => {
  it('przepuszcza alias i link z hashem (każdy tylko w swojej roli)', () => {
    expect(sprawdzAdresPreview(BAZA, 'a', 'alias')).toMatchObject({
      ok: true,
      origin: BAZA,
      host: 'dev.mixturemarketing-stona.pages.dev',
    });
    expect(sprawdzAdresPreview(`${BAZA}/`, 'a', 'alias').ok).toBe(true);
    expect(sprawdzAdresPreview(HASH, 'h', 'hash')).toMatchObject({ ok: true, origin: HASH });
    expect(
      sprawdzAdresPreview('https://abcd1234.mixturemarketing-stona.pages.dev', 'h', 'hash').ok,
    ).toBe(true);
    expect(
      sprawdzAdresPreview('https://00000000.mixturemarketing-stona.pages.dev/', 'h', 'hash').ok,
    ).toBe(true);
  });
  it('rola jest wymagana i rozdzielna: alias nie przejdzie jako hash i odwrotnie; brak roli = odmowa', () => {
    expect(sprawdzAdresPreview(BAZA, 'x', 'hash').ok).toBe(false);
    expect(sprawdzAdresPreview(HASH, 'x', 'alias').ok).toBe(false);
    for (const rola of ['', undefined, 'any', 'ALIAS'])
      expect(sprawdzAdresPreview(BAZA, 'x', rola as never)).toMatchObject({
        ok: false,
        powod: expect.stringMatching(/nieznana rola/),
      });
  });
  const odmowyAlias: Array<[string, unknown, RegExp]> = [
    ['pusty', '', /pusty/],
    ['spacje', '   ', /pusty/],
    ['nie-tekst', undefined, /pusty/],
    ['liczba', 5, /pusty/],
    ['1 obcy projekt pages.dev', 'https://evil-project.pages.dev', /host inny/],
    ['2 main.<projekt>.pages.dev', 'https://main.mixturemarketing-stona.pages.dev', /host inny/],
    ['3 kropka na końcu', 'https://dev.mixturemarketing-stona.pages.dev.', /host inny/],
    ['4 port 444', 'https://dev.mixturemarketing-stona.pages.dev:444', /port/],
    ['4b jawny port 443', 'https://dev.mixturemarketing-stona.pages.dev:443', /czystym originem/],
    ['5 dane logowania', 'https://user@dev.mixturemarketing-stona.pages.dev', /dane logowania/],
    ['5b hasło', 'https://u:p@dev.mixturemarketing-stona.pages.dev', /dane logowania/],
    ['6 http', 'http://dev.mixturemarketing-stona.pages.dev', /https/],
    ['8 lookalike .evil.com', 'https://dev.mixturemarketing-stona.pages.dev.evil.com', /host inny/],
    ['9 produkcja pl', 'https://mixturemarketing.pl', /produkcji/],
    ['9b produkcja www', 'https://www.mixturemarketing.pl', /produkcji/],
    ['9c produkcja pages.dev', 'https://mixturemarketing-stona.pages.dev', /produkcji/],
    ['9d subdomena produkcji', 'https://dev.mixturemarketing.pl', /produkcji/],
    ['9e produkcja z kropką', 'https://mixturemarketing.pl.', /host inny/],
    ['14a %2e w hoście', 'https://dev%2emixturemarketing-stona.pages.dev', /niedozwolone znaki/],
    ['14b %2E w hoście', 'https://dev%2Emixturemarketing-stona.pages.dev', /niedozwolone znaki/],
    [
      '14c odwrotny ukośnik',
      'https://evil.com\\@dev.mixturemarketing-stona.pages.dev',
      /niedozwolone znaki/,
    ],
    ['14d nowa linia', 'https://dev.mixturemarketing-stona.pages.dev\n', /niedozwolone znaki/],
    [
      '14e nowa linia w środku',
      'https://dev.mixturemarketing-stona.pages.dev\nevil.com',
      /niedozwolone znaki/,
    ],
    ['14f tabulator', 'https://dev.mixturemarketing-stona.pages.dev\t', /niedozwolone znaki/],
    [
      '14g spacja na początku',
      ' https://dev.mixturemarketing-stona.pages.dev',
      /niedozwolone znaki/,
    ],
    [
      '14h znak nie-ASCII (cyrylica)',
      'https://dеv.mixturemarketing-stona.pages.dev',
      /niedozwolone znaki/,
    ],
    ['14i bajt zerowy', 'https://dev.mixturemarketing-stona.pages.dev\u0000', /niedozwolone znaki/],
    ['bez schematu', 'dev.mixturemarketing-stona.pages.dev', /niepoprawny/],
    ['protocol-relative', '//dev.mixturemarketing-stona.pages.dev', /niepoprawny/],
    ['ścieżka', 'https://dev.mixturemarketing-stona.pages.dev/x', /czystym originem/],
    ['zapytanie', 'https://dev.mixturemarketing-stona.pages.dev?x=1', /czystym originem/],
    ['fragment', 'https://dev.mixturemarketing-stona.pages.dev/#x', /czystym originem/],
    ['wielkie litery w hoście', 'https://DEV.mixturemarketing-stona.pages.dev', /czystym originem/],
    ['apex pages.dev', 'https://pages.dev', /host inny/],
    ['obcy host', 'https://evil.tld', /host inny/],
    ['pages.dev w ścieżce', 'https://evil.tld/x.pages.dev', /host inny/],
    ['IPv6', 'https://[::1]', /host inny/],
  ];
  for (const [nazwa, wejscie, powod] of odmowyAlias) {
    it(`alias, odmowa: ${nazwa}`, () => {
      const r = sprawdzAdresPreview(wejscie as string, 'adres', 'alias');
      expect(r.ok).toBe(false);
      expect(r.powod).toMatch(powod);
    });
  }
  const odmowyHash: Array<[string, string, RegExp]> = [
    [
      '7a wielkie litery hex',
      'https://ABCD1234.mixturemarketing-stona.pages.dev',
      /<8 hex>|czystym/,
    ],
    ['7a2 mieszane litery', 'https://abcD1234.mixturemarketing-stona.pages.dev', /<8 hex>|czystym/],
    ['7b 7 znaków hex', 'https://abcd123.mixturemarketing-stona.pages.dev', /<8 hex>/],
    ['7c 9 znaków hex', 'https://abcd12345.mixturemarketing-stona.pages.dev', /<8 hex>/],
    ['7d litera g', 'https://abcd123g.mixturemarketing-stona.pages.dev', /<8 hex>/],
    ['7e pusty prefiks', 'https://.mixturemarketing-stona.pages.dev', /<8 hex>|niepoprawny/],
    ['7f dwa prefiksy', 'https://x.abcd1234.mixturemarketing-stona.pages.dev', /<8 hex>/],
    ['1 obcy projekt', 'https://abcd1234.evil-project.pages.dev', /<8 hex>/],
    ['2 branch main', 'https://main.mixturemarketing-stona.pages.dev', /<8 hex>/],
    ['alias jako hash', BAZA, /<8 hex>/],
    ['3 kropka na końcu', 'https://abcd1234.mixturemarketing-stona.pages.dev.', /<8 hex>/],
    ['4 port 444', 'https://abcd1234.mixturemarketing-stona.pages.dev:444', /port/],
    [
      '5 dane logowania',
      'https://user@abcd1234.mixturemarketing-stona.pages.dev',
      /dane logowania/,
    ],
    ['6 http', 'http://abcd1234.mixturemarketing-stona.pages.dev', /https/],
    ['8 lookalike', 'https://abcd1234.mixturemarketing-stona.pages.dev.evil.com', /<8 hex>/],
    ['9 produkcja', 'https://mixturemarketing.pl', /produkcji/],
    ['14 %2e', 'https://abcd1234%2emixturemarketing-stona.pages.dev', /niedozwolone znaki/],
    ['14 nowa linia', 'https://abcd1234.mixturemarketing-stona.pages.dev\n', /niedozwolone znaki/],
    ['ścieżka', 'https://abcd1234.mixturemarketing-stona.pages.dev/a/b', /czystym originem/],
  ];
  for (const [nazwa, wejscie, powod] of odmowyHash) {
    it(`hash, odmowa: ${nazwa}`, () => {
      const r = sprawdzAdresPreview(wejscie, 'adres', 'hash');
      expect(r.ok).toBe(false);
      expect(r.powod).toMatch(powod);
    });
  }
});

describe('strażnik: decyzjaDostepu (z nagłówkami Access)', () => {
  it('przepuszcza tylko 200 z JSON-em aplikacji', () => {
    expect(decyzjaDostepu({ status: 200, json: { contractVersion: 1 } }).dostep).toBe(true);
  });
  it('odmawia: przekierowanie, 403, 200 bez JSON-a, błąd, puste wejście', () => {
    expect(decyzjaDostepu(CHRONIONY).powod).toMatch(/302/);
    expect(decyzjaDostepu({ status: 403 }).dostep).toBe(false);
    expect(decyzjaDostepu({ status: 200, json: null }).powod).toMatch(/Access/);
    expect(decyzjaDostepu({ status: 200, json: { contractVersion: '1' } }).dostep).toBe(false);
    expect(decyzjaDostepu({ blad: 'x' }).dostep).toBe(false);
    expect(decyzjaDostepu(null as never).dostep).toBe(false);
  });
});

describe('strażnik: sprawdzOchrone na atrapie sieci', () => {
  it('dozwolony: oba adresy chronione bez nagłówków i dostęp z nagłówkami', async () => {
    const { ctx } = kontekst();
    expect(await sprawdzOchrone(ctx)).toEqual({ ok: true, powody: [] });
  });
  it('odmowa gdy alias nie jest chroniony (hash chroniony)', async () => {
    const { ctx } = kontekst({ bezOchrony: 'alias' });
    const r = await sprawdzOchrone(ctx);
    expect(r.ok).toBe(false);
    expect(r.powody.join(' ')).toMatch(/alias dev\.[^;]*kod 200/);
  });
  it('odmowa gdy tylko link z hashem nie jest chroniony (403 tylko na jednym adresie)', async () => {
    const { ctx } = kontekst({ bezOchrony: 'hash' });
    const r = await sprawdzOchrone(ctx);
    expect(r.ok).toBe(false);
    expect(r.powody.join(' ')).toMatch(/link z hashem[^;]*kod 200/);
  });
  it('odmowa gdy brak linku z hashem, pusty adres bazowy albo http://', async () => {
    for (const env of [
      { E2E_HASH_URL: '' },
      { E2E_BASE_URL: '' },
      { E2E_BASE_URL: 'http://dev.mixturemarketing-stona.pages.dev' },
    ]) {
      const { ctx, a } = kontekst({}, env);
      const r = await sprawdzOchrone(ctx);
      expect(r.ok).toBe(false);
      expect(a.zadaniaFetch).toHaveLength(0); // zero żądań przy złej konfiguracji
    }
  });
  it('odmowa gdy „hash” to alias, obcy projekt albo branch (przypięte adresy), zero żądań', async () => {
    for (const hash of [
      BAZA,
      'https://main.mixturemarketing-stona.pages.dev',
      'https://a1b2c3d4.evil-project.pages.dev',
      'https://a1b2c3d4.mixturemarketing-stona.pages.dev:444',
    ]) {
      const { ctx, a } = kontekst({}, { E2E_HASH_URL: hash });
      const r = await sprawdzOchrone(ctx);
      expect(r.ok).toBe(false);
      expect(r.powody.join(' ')).toMatch(/link z hashem/);
      expect(a.zadaniaFetch).toHaveLength(0);
    }
  });
  it('odmowa gdy baza to obcy projekt pages.dev albo branch main (zero żądań)', async () => {
    for (const baza of [
      'https://evil-project.pages.dev',
      'https://main.mixturemarketing-stona.pages.dev',
    ]) {
      const { ctx, a } = kontekst({}, { E2E_BASE_URL: baza });
      const r = await sprawdzOchrone(ctx);
      expect(r.ok).toBe(false);
      expect(r.powody.join(' ')).toMatch(/E2E_BASE_URL: host inny/);
      expect(a.zadaniaFetch).toHaveLength(0);
    }
  });
  it('odmowa gdy brak danych Access (bez żądań)', async () => {
    const { ctx, a } = kontekst({}, { CF_ACCESS_CLIENT_SECRET: '' });
    const r = await sprawdzOchrone(ctx);
    expect(r.ok).toBe(false);
    expect(r.powody.join(' ')).toMatch(/CF_ACCESS_CLIENT_ID/);
    expect(a.zadaniaFetch).toHaveLength(0);
  });
  it('odmowa na błąd sieci (fetch rzuca) z zamaskowanym sekretem', async () => {
    const { ctx } = kontekst();
    ctx.fetch = async () => {
      throw new Error(`ECONNRESET ${SEKRET}`);
    };
    const r = await sprawdzOchrone(ctx);
    expect(r.ok).toBe(false);
    expect(r.powody.join(' ')).toMatch(/błąd żądania/);
    expect(r.powody.join(' ')).not.toContain(SEKRET);
  });
  it('odmowa gdy z nagłówkami Access nadal blokada (zły token)', async () => {
    const { ctx } = kontekst({ zAccessStatus: 403 });
    const r = await sprawdzOchrone(ctx);
    expect(r.ok).toBe(false);
    expect(r.powody[0]).toMatch(/z nagłówkami Access: kod 403/);
  });
  it('odmowa gdy alias odpowiada 302 na lookalike host', async () => {
    const { ctx } = kontekst({
      bezAccessOdp: { status: 302, location: 'https://cloudflareaccess.com.evil.tld/' },
    });
    expect((await sprawdzOchrone(ctx)).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------------------------
// Przebieg na atrapach
// ---------------------------------------------------------------------------------------------

describe('przebieg: kolejność i kod wyjścia', () => {
  it('bez ochrony: kod 2, komunikat „Preview bez ochrony”, ZERO żądań POST', async () => {
    const { ctx, a, logi } = kontekst({ bezOchrony: 'oba' }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.kod).toBe(2);
    expect(logi.join('\n')).toMatch(/Preview bez ochrony: .*alias dev\./);
    expect(a.posty).toHaveLength(0);
    expect(a.zadaniaFetch.every((z) => z.startsWith('GET'))).toBe(true);
  });
  it('7/7: a–e, g i fazy f zapisane; zadania Canceled z etykietą test; kod 0', async () => {
    const stanF = STAN_F_OK;
    const { ctx, a, raporty } = kontekst({}, { E2E_BEZ_RESEND: '1' }, stanF);
    const w = await biegnij(ctx);
    expect(w.linia).toMatch(/^7\/7/);
    expect(w.kod).toBe(0);
    expect(a.zadania).toHaveLength(6); // 5 z biegu (a–e) + 1 z fazy f
    for (const z of a.zadania) {
      expect(z.stan).toBe('Canceled');
      expect(z.etykiety).toContain('test');
    }
    expect(raporty).toHaveLength(1);
    expect(raporty[0]).toContain('SHA wdrożenia: abc1234');
    expect(raporty[0]).not.toMatch(/@|e2e\+/);
    expect(a.posty).toEqual([
      '/api/contact-submit',
      '/api/contact-submit',
      '/api/estimation/public-quote',
      '/api/audit/capture-lead',
      '/api/contact-submit',
      '/api/contact-submit',
    ]);
  });
  it('bez E2E_BEZ_RESEND (b) pominięte z powodem: kod 0 (MIX-1556), żaden adres gmail nie wysłany', async () => {
    const { ctx, a, logi } = kontekst({}, {}, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.kod).toBe(0);
    expect(w.linia).toMatch(/^6\/7, pominięte: b \(/);
    expect(a.zadania.some((z) => z.tytul.includes('osoba prywatna'))).toBe(false);
    expect(logi.join('\n')).toMatch(/\(b\) skip/);
  });
  it('brak pliku stanu faz f: (f) fail z powodem, kod 1 (nie 0 i nie 3)', async () => {
    const { ctx } = kontekst({}, { E2E_BEZ_RESEND: '1' }, null);
    const w = await biegnij(ctx);
    expect(w.kod).toBe(1);
    expect(w.wyniki.f.status).toBe('fail');
    expect(w.wyniki.f.powod).toMatch(/brak pliku stanu/);
  });
  it('(f) przy starym stanie (25 h), innym SHA, {} albo zepsutym JSON: kod 1, nigdy 0', async () => {
    const warianty: Array<[string, unknown, RegExp]> = [
      ['25 h', { ...STAN_F_OK, ts: TS0 - 25 * GODZ }, /starszy niż 24 h/],
      ['inny SHA', { ...STAN_F_OK, sha: 'fff9999' }, /innego SHA/],
      ['{}', {}, /innego SHA/],
      ['nieczytelny', { nieczytelny: true }, /nieczytelny/],
    ];
    for (const [, stan, powod] of warianty) {
      const { ctx } = kontekst({}, { E2E_BEZ_RESEND: '1' }, stan);
      const w = await biegnij(ctx);
      expect(w.kod).toBe(1);
      expect(w.wyniki.f.status).toBe('fail');
      expect(w.wyniki.f.powod).toMatch(powod);
    }
  });
  it('(f) bez E2E_SHA: kod 1 z powodem', async () => {
    const { ctx } = kontekst({}, { E2E_BEZ_RESEND: '1', E2E_SHA: '' }, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.kod).toBe(1);
    expect(w.wyniki.f.powod).toMatch(/brak E2E_SHA/);
  });
  it('(g) V1: nowe zadanie LEA BEZ przedrostka [Preview] w trakcie biegu zostaje nietknięte; z przedrostkiem jest Canceled', async () => {
    const { ctx, a } = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const wlasne: Issue[] = [
      {
        id: 'LEA-90',
        stan: 'Backlog',
        kto: 'jakub',
        delegat: null,
        tytul: 'Lead: x',
        etykiety: ['formularz'],
      },
      {
        id: 'LEA-91',
        stan: 'Backlog',
        kto: 'jakub',
        delegat: null,
        tytul: '[Preview] Lead: x',
        etykiety: ['formularz'],
      },
    ];
    const wywolania: string[][] = [];
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      return lin(args);
    };
    const fetchBazowy = ctx.fetch;
    let wstrzyknieto = false;
    ctx.fetch = async (url: string, init: RequestInit) => {
      if (!wstrzyknieto && String(url).endsWith('/api/estimation/public-quote')) {
        wstrzyknieto = true; // w trakcie biegu, po migawce
        a.zadania.push(...wlasne);
      }
      return fetchBazowy(url, init);
    };
    const w = await biegnij(ctx);
    expect(wstrzyknieto).toBe(true);
    expect(w.wyniki.g.status).toBe('pass');
    const bez = a.zadania.find((z) => z.id === 'LEA-90');
    expect(bez).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
    expect(
      wywolania.some((x) => x[1] === 'LEA-90' && (x[0] === 'stan' || x[0] === 'etykieta')),
    ).toBe(false);
    const z = a.zadania.find((x) => x.id === 'LEA-91');
    expect(z?.stan).toBe('Canceled');
    expect(z?.etykiety).toContain('test');
  });
  it('(g) W9: zadanie [Preview] Lead istniejące PRZED biegiem (poza stanem f) zostaje nietknięte; nowe z biegu jest Canceled', async () => {
    const { ctx, a } = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const [staraId] = a.dodaj('stare.example.org', 'sprzed biegu', ['formularz']);
    expect(a.zadania.find((z) => z.id === staraId)?.tytul).toMatch(/^\[Preview\] Lead: /);
    const wywolania: string[][] = [];
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      return lin(args);
    };
    const w = await biegnij(ctx);
    expect(w.wyniki.g.status).toBe('pass');
    expect(a.zadania.find((z) => z.id === staraId)).toMatchObject({
      stan: 'Backlog',
      etykiety: ['formularz'],
    });
    expect(
      wywolania.some((x) => x[1] === staraId && (x[0] === 'stan' || x[0] === 'etykieta')),
    ).toBe(false);
    // bliźniak dozwolony: zadanie powstałe w biegu (a) i zadanie ze stanu f są sprzątnięte
    const nowe = a.zadania.filter((z) => z.id !== staraId && z.id !== 'LEA-11');
    expect(nowe.length).toBeGreaterThan(0);
    for (const z of nowe) expect(z.stan).toBe('Canceled');
    expect(a.zadania.find((z) => z.id === 'LEA-11')?.stan).toBe('Canceled');
  });
  describe('(g) stan f: id z pliku tylko przy ważnym wiązaniu (fail-closed)', () => {
    const sprawdz = async (stan: unknown) => {
      const { ctx, a, logi } = kontekst({}, { E2E_BEZ_RESEND: '1' }, stan);
      // zadanie "ze stanu f" istnieje przed biegiem (LEA-11) niezależnie od kształtu stanu
      if (!a.zadania.some((z) => z.id === 'LEA-11'))
        a.dodaj('example.com', 'kontakt', ['formularz']);
      const wywolania: string[][] = [];
      const lin = ctx.lin;
      ctx.lin = async (args: string[]) => {
        wywolania.push(args);
        return lin(args);
      };
      const w = await biegnij(ctx);
      const dotkniete = (id: string) =>
        wywolania.some((x) => x[1] === id && (x[0] === 'stan' || x[0] === 'etykieta'));
      return { w, a, logi, dotkniete };
    };
    const ZADANIE_ZE_STANU = 'LEA-11'; // atrapa zakłada je przed biegiem (kontekst)
    it('stan z INNYM SHA: id ignorowane z linią powodu; ten sam SHA i świeży: id użyte', async () => {
      const zly = await sprawdz({ ...STAN_F_OK, sha: 'fff9999' });
      expect(zly.dotkniete(ZADANIE_ZE_STANU)).toBe(false);
      expect(zly.a.zadania.find((z) => z.id === ZADANIE_ZE_STANU)?.stan).toBe('Backlog');
      expect(zly.w.wyniki.g.status).toBe('pass');
      expect(zly.logi.join('\n')).toMatch(
        /id zadań z pliku stanu f pominięte: stan faz f pochodzi z innego SHA/,
      );
      const dobry = await sprawdz(STAN_F_OK);
      expect(dobry.dotkniete(ZADANIE_ZE_STANU)).toBe(true);
      expect(dobry.a.zadania.find((z) => z.id === ZADANIE_ZE_STANU)?.stan).toBe('Canceled');
      expect(dobry.logi.join('\n')).not.toMatch(/pominięte/);
    });
    it('stan STARY (24 h i 25 h): id ignorowane; świeży (23 h): id użyte', async () => {
      for (const godz of [24, 25]) {
        const r = await sprawdz({ ...STAN_F_OK, ts: TS0 - godz * GODZ });
        expect(r.dotkniete(ZADANIE_ZE_STANU)).toBe(false);
        expect(r.logi.join('\n')).toMatch(/pominięte: stan faz f starszy niż 24 h/);
      }
      const swiezy = await sprawdz({ ...STAN_F_OK, ts: TS0 - 23 * GODZ });
      expect(swiezy.dotkniete(ZADANIE_ZE_STANU)).toBe(true);
    });
    it('stan bez ts, z ts z przyszłości, bez SHA po obu stronach, nieczytelny, brak pliku: id ignorowane', async () => {
      const { ts: _ts, ...bezTs } = STAN_F_OK;
      const warianty: Array<[unknown, RegExp]> = [
        [bezTs, /bez znacznika czasu/],
        [{ ...STAN_F_OK, ts: TS0 + GODZ }, /z przyszłości/],
        [{ ...STAN_F_OK, sha: '' }, /innego SHA/],
        [{ nieczytelny: true }, /nieczytelny/],
      ];
      for (const [stan, powod] of warianty) {
        const r = await sprawdz(stan);
        expect(r.dotkniete(ZADANIE_ZE_STANU)).toBe(false);
        expect(r.logi.join('\n')).toMatch(powod);
        expect(r.w.wyniki.g.status).toBe('pass');
      }
      const brak = await sprawdz(null);
      expect(brak.dotkniete(ZADANIE_ZE_STANU)).toBe(false);
      expect(brak.logi.join('\n')).toMatch(/pominięte: brak pliku stanu/);
    });
    it('id w ważnym stanie o złym kształcie (liczba, null, obiekt, --flaga, inny zespół, spacja) są pomijane, poprawne użyte', async () => {
      const zle = [
        5,
        null,
        { id: 'LEA-11' },
        '--help',
        'ENG-1',
        'LEA-11 ',
        'LEA-',
        'lea-11',
        'LEA-99999999',
        'xLEA-11',
        ['LEA-11'],
        '',
      ];
      const r = await sprawdz({ ...STAN_F_OK, zadania: ['LEA-11', ...zle], zadanie: undefined });
      expect(r.w.wyniki.g.status).toBe('pass');
      expect(r.dotkniete('LEA-11')).toBe(true);
      expect(r.a.zadania.find((z) => z.id === 'LEA-11')?.stan).toBe('Canceled');
      expect(r.logi.filter((l) => /niepoprawne id w pliku stanu f pominięte/.test(l))).toHaveLength(
        zle.length,
      );
    });
    it('zadania nie jest tablicą (napis, obiekt, liczba): ignorowane bez wyjątku', async () => {
      for (const zadania of ['LEA-11', { 0: 'LEA-11' }, 11]) {
        const r = await sprawdz({ ...STAN_F_OK, zadania, zadanie: undefined });
        expect(r.w.wyniki.g.status).toBe('pass');
        expect(r.dotkniete('LEA-11')).toBe(false);
      }
    });
    it('pole zadanie (pojedyncze) w złym stanie ignorowane, w dobrym użyte', async () => {
      const zly = await sprawdz({ ...STAN_F_OK, zadania: [], sha: 'inny' });
      expect(zly.dotkniete('LEA-11')).toBe(false);
      const dobry = await sprawdz({ ...STAN_F_OK, zadania: [] });
      expect(dobry.dotkniete('LEA-11')).toBe(true);
    });
  });
  describe('(g) stan f: id sprzątane tylko gdy BIEŻĄCY tytuł zaczyna się od "[Preview] Lead: " (fail-closed)', () => {
    const ID_F = 'LEA-11'; // atrapa zakłada je przed biegiem (kontekst)
    const sprawdz = async (
      zmien: (z: { tytul?: unknown }) => void,
      opcje: { bladOdczytuPoE?: boolean; usunZListy?: boolean } = {},
    ) => {
      const { ctx, a, logi } = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
      const zad = a.zadania.find((z) => z.id === ID_F)!;
      zmien(zad as { tytul?: unknown });
      if (opcje.usunZListy) a.zadania.splice(a.zadania.indexOf(zad), 1);
      const wywolania: string[][] = [];
      const lin = ctx.lin;
      ctx.lin = async (args: string[]) => {
        wywolania.push(args);
        if (opcje.bladOdczytuPoE && args[0] === 'lista' && logi.some((l) => /^\(e\)/.test(l)))
          throw new Error('lin lista: błąd odczytu');
        return lin(args);
      };
      const w = await biegnij(ctx);
      const dotkniete = wywolania.some(
        (x) => x[1] === ID_F && (x[0] === 'stan' || x[0] === 'etykieta'),
      );
      return { w, zad, logi, dotkniete };
    };
    const POMINIETE = /\(g\) id LEA-11 ze stanu f pominięte: /;

    it('bliźniak dozwolony: tytuł "[Preview] Lead: x" → Canceled z etykietą test, bez linii pominięcia', async () => {
      const r = await sprawdz((z) => {
        z.tytul = '[Preview] Lead: x';
      });
      expect(r.dotkniete).toBe(true);
      expect(r.zad).toMatchObject({ stan: 'Canceled' });
      expect((r.zad as { etykiety: string[] }).etykiety).toContain('test');
      expect(r.logi.join('\n')).not.toMatch(POMINIETE);
      expect(r.w.wyniki.g.status).toBe('pass');
    });
    it('prawdziwy lead bez przedrostka (id w ważnym stanie f) zostaje nietknięty, z linią powodu', async () => {
      const r = await sprawdz((z) => {
        z.tytul = 'Lead: prawdziwy.pl — kontakt';
      });
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      expect(r.logi.join('\n')).toMatch(/pominięte: tytuł nie zaczyna się od "\[Preview\] Lead: "/);
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toContain(
        'LEA-11: id ze stanu f nie sprzątnięte przy pierwszym odczycie (tytuł nie zaczyna się od',
      );
    });
    it.each([
      ['przedrostek wewnątrz tytułu', 'Lead: [Preview] Lead: x'],
      ['spacja na początku', ' [Preview] Lead: x'],
      ['małe litery', '[preview] lead: x'],
      ['bez spacji po dwukropku', '[Preview] Lead:x'],
      ['przedrostek bez końcowej spacji', '[Preview] Lead:'],
      ['inny zespół/przedrostek', '[Preview] Lid: x'],
      ['pusty tytuł', ''],
    ])('tytuł: %s → pominięte, zadanie nietknięte', async (_nazwa, tytul) => {
      const r = await sprawdz((z) => {
        z.tytul = tytul;
      });
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog' });
      expect(r.logi.join('\n')).toMatch(POMINIETE);
    });
    it.each([
      ['brak pola tytul', (z: { tytul?: unknown }) => delete z.tytul],
      ['tytul = null', (z: { tytul?: unknown }) => (z.tytul = null)],
      ['tytul = liczba', (z: { tytul?: unknown }) => (z.tytul = 5)],
      [
        'tytul = tablica z przedrostkiem',
        (z: { tytul?: unknown }) => (z.tytul = ['[Preview] Lead: x']),
      ],
    ])(
      '%s → pominięte (odczyt listy odrzuca zadanie bez tytułu), zadanie nietknięte',
      async (_n, zmien) => {
        const r = await sprawdz(zmien);
        expect(r.dotkniete).toBe(false);
        expect(r.zad).toMatchObject({ stan: 'Backlog' });
        expect(r.logi.join('\n')).toMatch(POMINIETE);
      },
    );
    it('id ze stanu f nie ma na liście → pominięte z linią powodu', async () => {
      const r = await sprawdz(() => undefined, { usunZListy: true });
      expect(r.dotkniete).toBe(false);
      expect(r.logi.join('\n')).toMatch(/pominięte: zadania nie ma na liście/);
    });
    it('błąd odczytu listy w (g) → id ze stanu f pominięte (nietknięte), (g) kończy się porażką', async () => {
      const r = await sprawdz(
        (z) => {
          z.tytul = '[Preview] Lead: x'; // tytuł poprawny: bez błędu zostałoby sprzątnięte
        },
        { bladOdczytuPoE: true },
      );
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog' });
      expect(r.logi.join('\n')).toMatch(/pominięte: nie udało się odczytać bieżącego tytułu/);
      expect(r.w.wyniki.g.status).toBe('fail');
    });
  });
  it('(e): prawdziwy lead bez przedrostka w trakcie drugiego POST nie psuje (e) i zostaje nietknięty', async () => {
    const { ctx, a } = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const fetchBazowy = ctx.fetch;
    let wFormularzu = 0;
    ctx.fetch = async (url: string, init: RequestInit) => {
      if (String(url).endsWith('/api/contact-submit') && init?.method === 'POST') {
        wFormularzu += 1;
        if (wFormularzu === 4)
          // (a), (b), (e) pierwszy, (e) drugi
          a.zadania.push({
            id: 'LEA-95',
            stan: 'Backlog',
            kto: 'jakub',
            delegat: null,
            tytul: 'Lead: prawdziwy.pl — kontakt',
            etykiety: ['formularz'],
          });
      }
      return fetchBazowy(url, init);
    };
    const w = await biegnij(ctx);
    expect(wFormularzu).toBe(4);
    expect(w.wyniki.e.status).toBe('pass');
    expect(w.kod).toBe(0);
    expect(a.zadania.find((z) => z.id === 'LEA-95')).toMatchObject({
      stan: 'Backlog',
      etykiety: ['formularz'],
    });
  });
  it('(e): drugi lead tworzy drugie zadanie → porażka, kod 1, sprzątanie nadal działa', async () => {
    const { ctx, a } = kontekst(
      { drugiLeadTworzyZadanie: true },
      { E2E_BEZ_RESEND: '1' },
      STAN_F_OK,
    );
    const w = await biegnij(ctx);
    expect(w.wyniki.e.status).toBe('fail');
    expect(w.wyniki.e.powod).toMatch(/drugi lead utworzył zadanie|komentarz/);
    expect(w.kod).toBe(1);
    expect(a.zadania.every((z) => z.stan === 'Canceled')).toBe(true);
  });
  it('(e): komentarz jest, ale drugie zadanie też powstało → porażka z powodem o zadaniu', async () => {
    const { ctx, a } = kontekst(
      { drugiLeadTworzyZadanie: 'oba' },
      { E2E_BEZ_RESEND: '1' },
      STAN_F_OK,
    );
    const w = await biegnij(ctx);
    expect(w.wyniki.e.status).toBe('fail');
    expect(w.wyniki.e.powod).toMatch(/drugi lead utworzył zadanie/);
    expect(a.zadania.every((z) => z.stan === 'Canceled')).toBe(true);
  });
  it('zadanie nie pojawia się w limicie czasu: fail, kod 1, bez wyjątku', async () => {
    const { ctx } = kontekst({ nigdyZadania: true }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.wyniki.a).toMatchObject({ status: 'fail' });
    expect(w.wyniki.a.powod).toMatch(/limicie czasu/);
    expect(w.kod).toBe(1);
  });
  it('dwa zadania zamiast jednego w (a): fail', async () => {
    const { ctx } = kontekst({ dlaKazdegoPostuZadan: 2 }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.wyniki.a.status).toBe('fail');
    expect(w.wyniki.a.powod).toMatch(/oczekiwano 1 zadania, jest 2/);
  });
  it('zadanie przypisane do kogoś innego niż Jakub: fail', async () => {
    const { ctx } = kontekst({ kto: 'karol' }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.wyniki.a.powod).toMatch(/nie jest przypisane do jakub/);
  });
  it('lin zwraca śmieci: przypadki padają (fail-closed), kod 1', async () => {
    const { ctx } = kontekst({ zepsutaLista: true }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.wyniki.a.status).toBe('fail');
    expect(w.wyniki.g.status).toBe('fail');
    expect(w.kod).toBe(1);
  });
  it('sekrety nie trafiają do logów ani raportu', async () => {
    const { ctx, logi, raporty } = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    await biegnij(ctx);
    const calosc = [...logi, ...raporty].join('\n');
    for (const s of [ID, SEKRET, PONOW]) expect(calosc).not.toContain(s);
  });
});

describe('powodOdrzuceniaIdStanuF (allowlista bieżącego tytułu, fail-closed)', () => {
  const lista = (tytul: unknown) => [{ id: 'LEA-11', tytul, etykiety: [] }];
  it('dozwolone: dokładny przedrostek → null', () => {
    expect(powodOdrzuceniaIdStanuF('LEA-11', lista('[Preview] Lead: x'), null)).toBeNull();
  });
  it.each([
    [
      'błąd odczytu',
      'LEA-11',
      lista('[Preview] Lead: x'),
      new Error('x'),
      /nie udało się odczytać/,
    ],
    ['lista null', 'LEA-11', null, null, /nie udało się odczytać/],
    ['lista nie-tablica', 'LEA-11', { zadania: [] }, null, /nie udało się odczytać/],
    ['brak id na liście', 'LEA-12', lista('[Preview] Lead: x'), null, /nie ma na liście/],
    ['pusty tytuł', 'LEA-11', lista(''), null, /brak tytułu/],
    ['tytuł undefined', 'LEA-11', lista(undefined), null, /brak tytułu/],
    ['tytuł null', 'LEA-11', lista(null), null, /brak tytułu/],
    ['tytuł liczba', 'LEA-11', lista(5), null, /brak tytułu/],
    ['tytuł tablica', 'LEA-11', lista(['[Preview] Lead: x']), null, /brak tytułu/],
    ['inny przedrostek', 'LEA-11', lista('Lead: x'), null, /nie zaczyna się od/],
    ['wpis listy null', 'LEA-11', [null], null, /nie ma na liście/],
  ])('%s → odmowa z powodem', (_n, id, l, blad, re) => {
    expect(powodOdrzuceniaIdStanuF(id as string, l, blad)).toMatch(re as RegExp);
  });
});

describe('(g): sprzątanie', () => {
  it('dodaje etykietę test i ustawia Canceled, gdy zadanie ich nie ma', async () => {
    const { ctx, a } = kontekst();
    a.dodaj('example.com', 'kontakt', ['formularz']);
    const w = await sprzatanie(ctx, new Set(['LEA-11']));
    expect(w.status).toBe('pass');
    expect(a.zadania[0]).toMatchObject({ stan: 'Canceled' });
    expect(a.zadania[0].etykiety).toContain('test');
  });
  it('porażka polecenia lin (stan) → fail z id zadania', async () => {
    const { ctx, a } = kontekst();
    a.dodaj('example.com', 'kontakt', ['formularz', 'test']);
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      if (args[0] === 'stan') throw new Error('Linear odmówił');
      return lin(args);
    };
    const w = await sprzatanie(ctx, new Set(['LEA-11']));
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/LEA-11/);
  });
  it('zadanie, które zniknęło z listy → fail; pusty zestaw → pass bez wywołań lin', async () => {
    const { ctx } = kontekst();
    expect((await sprzatanie(ctx, new Set(['LEA-99']))).status).toBe('fail');
    expect((await sprzatanie(ctx, new Set())).status).toBe('pass');
  });
});

describe('MIX-626F: (g) ponowny odczyt, duplikaty id, wersje id (fail-closed)', () => {
  const ID_F = 'LEA-11';
  const PRZED = '[Preview] Lead: x';
  type Zad = { id: string; tytul: unknown; stan: string; etykiety: string[] };
  type Atrapa = ReturnType<typeof kontekst>['a'];
  type Haki = {
    // n-ty odczyt listy PO (e): 1 = odczyt (g), 2 = `teraz` w sprzątaniu, 3 = kontrola po sprzątaniu
    przyOdczycie?: Record<number, (a: Atrapa) => void>;
    blad?: number[];
    bezStanuF?: boolean;
    tytulPoczatkowy?: unknown;
    duplikatWOdczycie?: Record<number, { tytul: string; przed?: boolean }>;
  };
  const ustawTytul = (a: Atrapa, tytul: string) => {
    a.zadania.find((z) => z.id === ID_F)!.tytul = tytul;
  };
  const bieg = async (h: Haki = {}) => {
    const k = kontekst({}, { E2E_BEZ_RESEND: '1' }, h.bezStanuF ? null : STAN_F_OK);
    const { ctx, a, logi } = k;
    const zad = a.zadania.find((z) => z.id === ID_F);
    if (zad) zad.tytul = h.tytulPoczatkowy !== undefined ? (h.tytulPoczatkowy as string) : PRZED;
    const wywolania: string[][] = [];
    let n = 0;
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      if (args[0] === 'lista' && logi.some((l) => /^\(e\)/.test(l))) {
        n += 1;
        h.przyOdczycie?.[n]?.(a);
        if (h.blad?.includes(n)) throw new Error('lin lista: błąd odczytu');
        const dup = h.duplikatWOdczycie?.[n];
        if (dup) {
          const obj = JSON.parse(await lin(args));
          const wpis = {
            id: ID_F,
            stan: 'Backlog',
            kto: 'jakub',
            delegat: null,
            tytul: dup.tytul,
            etykiety: [],
          };
          if (dup.przed) obj.zadania.unshift(wpis);
          else obj.zadania.push(wpis);
          return JSON.stringify(obj);
        }
      }
      return lin(args);
    };
    const w = await biegnij(ctx);
    const dotkniete = wywolania.some(
      (x) => x[1] === ID_F && (x[0] === 'stan' || x[0] === 'etykieta'),
    );
    return { w, a, zad: zad as unknown as Zad, logi, dotkniete, wywolania };
  };
  const POM = /\(g\) id LEA-11 (ze stanu f )?pominięte: /;

  describe('formy 1/11/12: tytuł zmieniony / zadanie znika / błąd między odczytem (g) a anulowaniem', () => {
    it('bliźniak: tytuł bez zmian → anulowane z etykietą test, bez linii pominięcia', async () => {
      const r = await bieg();
      expect(r.dotkniete).toBe(true);
      expect(r.zad).toMatchObject({ stan: 'Canceled' });
      expect(r.zad.etykiety).toContain('test');
      expect(r.logi.join('\n')).not.toMatch(POM);
      expect(r.w.wyniki.g.status).toBe('pass');
    });
    it('TOCTOU: zmiana tytułu po odczycie (g), przed drugim odczytem → nie anulowane, linia powodu, brak stan/etykieta', async () => {
      const r = await bieg({
        przyOdczycie: { 2: (a) => ustawTytul(a, 'Lead: prawdziwy.pl — kontakt') },
      });
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      expect(r.logi.join('\n')).toMatch(
        /\(g\) id LEA-11 ze stanu f pominięte: tytuł nie zaczyna się od "\[Preview\] Lead: "/,
      );
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toContain(
        'LEA-11: id ze stanu f nie sprzątnięte przy ponownym odczycie',
      );
      expect(r.w.wyniki.g.powod).toContain('tytuł nie zaczyna się od');
    });
    it('zły tytuł już przy odczycie (g), poprawny przy drugim → pominięte przez pierwszą kontrolę', async () => {
      const r = await bieg({
        tytulPoczatkowy: 'Lead: prawdziwy',
        przyOdczycie: { 2: (a) => ustawTytul(a, PRZED) },
      });
      expect(r.dotkniete).toBe(false);
      expect(r.logi.join('\n')).toMatch(POM);
    });
    it('zadanie znika przy drugim odczycie → pominięte ("nie ma na liście"), nie dotknięte', async () => {
      const r = await bieg({
        przyOdczycie: {
          2: (a) => {
            a.zadania.splice(
              a.zadania.findIndex((z) => z.id === ID_F),
              1,
            );
          },
        },
      });
      expect(r.dotkniete).toBe(false);
      expect(r.logi.join('\n')).toMatch(
        /\(g\) id LEA-11 ze stanu f pominięte: zadania nie ma na liście/,
      );
    });
    it('drugi odczyt rzuca błąd → nic nie dotknięte, (g) = fail z powodem', async () => {
      const r = await bieg({ blad: [2] });
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog' });
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toMatch(/błąd odczytu/);
    });
    it('bliźniak: drugi odczyt ok → anulowane, (g) pass', async () => {
      const r = await bieg({ blad: [] });
      expect(r.dotkniete).toBe(true);
      expect(r.w.wyniki.g.status).toBe('pass');
    });
  });

  describe('formy 2/3: duplikat id na liście (kolejność wpisu dozwolonego bez znaczenia)', () => {
    it.each([
      ['odczyt (g), duplikat na końcu', { 1: { tytul: 'Lead: inny', przed: false } }],
      ['odczyt (g), duplikat na początku', { 1: { tytul: 'Lead: inny', przed: true } }],
      ['drugi odczyt, duplikat na końcu', { 2: { tytul: 'Lead: inny', przed: false } }],
      ['drugi odczyt, duplikat na początku', { 2: { tytul: 'Lead: inny', przed: true } }],
      ['drugi odczyt, duplikat też z przedrostkiem', { 2: { tytul: PRZED, przed: true } }],
    ])('%s → odmowa z linią powodu, brak stan/etykieta', async (_n, dup) => {
      const r = await bieg({ duplikatWOdczycie: dup });
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      expect(r.logi.join('\n')).toMatch(
        /\(g\) id LEA-11 (ze stanu f )?pominięte: id występuje na liście 2 razy \(niejednoznaczne\)/,
      );
    });
    it('duplikat dopiero w trzecim odczycie (po sprzątaniu) → (g) fail z powodem', async () => {
      const r = await bieg({ duplikatWOdczycie: { 3: { tytul: PRZED, przed: false } } });
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toMatch(/LEA-11: 2 wpisów o tym id po sprzątaniu/);
    });
    it('bliźniak: pojedynczy wpis → anulowane', async () => {
      const r = await bieg();
      expect(r.dotkniete).toBe(true);
      expect(r.zad).toMatchObject({ stan: 'Canceled' });
    });
    it('sprzatanie bezpośrednio: duplikat id spoza stanu f → nie sprzątane, (g) fail z powodem, reszta sprzątnięta', async () => {
      const { ctx, a, logi } = kontekst();
      a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-11
      a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-12
      a.zadania.push({ ...a.zadania[0], etykiety: ['formularz'] }); // drugi wpis LEA-11
      const w = await sprzatanie(ctx, new Set(['LEA-11', 'LEA-12']));
      expect(w.status).toBe('fail');
      expect(w.powod).toMatch(/LEA-11: niejednoznaczne id na liście/);
      expect(a.zadania[0]).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      expect(a.zadania[1]).toMatchObject({ stan: 'Canceled' });
      expect(logi.join('\n')).toMatch(/\(g\) id LEA-11 pominięte: id występuje na liście 2 razy/);
    });
  });

  describe('formy 4-8 (E3): tytuły łudząco podobne do przedrostka są odrzucane, zwykły tytuł przechodzi', () => {
    const PODOBNE: Array<[string, string]> = [
      ['pełnoszerokie nawiasy', '［Preview］ Lead: x'],
      ['pełnoszeroki dwukropek', '[Preview] Lead： x'],
      ['ZWSP wewnątrz Preview', '[Pre​view] Lead: x'],
      ['ZWSP na początku', '​[Preview] Lead: x'],
      ['ZWNJ wewnątrz', '[Preview] Le‌ad: x'],
      ['BOM na początku', '﻿[Preview] Lead: x'],
      ['NBSP po dwukropku', '[Preview] Lead: x'],
      ['NBSP między słowami', '[Preview] Lead: x'],
      ['cyrylickie е w Preview', '[Prеview] Lead: x'],
      ['cyrylickie а w Lead', '[Preview] Leаd: x'],
      ['tabulator po dwukropku', '[Preview] Lead:\tx'],
    ];
    it.each(PODOBNE)('odczyt (g): %s → pominięte, zadanie nietknięte', async (_n, tytul) => {
      const r = await bieg({ tytulPoczatkowy: tytul });
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      expect(r.logi.join('\n')).toMatch(POM);
    });
    it.each(PODOBNE)('drugi odczyt: %s → pominięte, zadanie nietknięte', async (_n, tytul) => {
      const r = await bieg({ przyOdczycie: { 2: (a) => ustawTytul(a, tytul) } });
      expect(r.dotkniete).toBe(false);
      expect(r.zad).toMatchObject({ stan: 'Backlog' });
      expect(r.logi.join('\n')).toMatch(
        /\(g\) id LEA-11 ze stanu f pominięte: tytuł nie zaczyna się od/,
      );
    });
    it.each(PODOBNE)('powodOdrzuceniaIdStanuF: %s → odmowa', (_n, tytul) => {
      expect(
        powodOdrzuceniaIdStanuF('LEA-11', [{ id: 'LEA-11', tytul, etykiety: [] }], null),
      ).toMatch(/nie zaczyna się od/);
    });
    it('bliźniak: zwykły przedrostek (spacje ASCII) przechodzi w odczycie (g) i w drugim', async () => {
      const r = await bieg({ tytulPoczatkowy: '[Preview] Lead: example.com — kontakt' });
      expect(r.dotkniete).toBe(true);
      expect(r.zad).toMatchObject({ stan: 'Canceled' });
    });
  });

  describe('forma 9 (E6): id w wariantach nie pasuje do wpisu na liście (dokładne ===)', () => {
    const lista = (id: string) => [{ id, tytul: PRZED, etykiety: [] }];
    it.each([' LEA-11 ', 'lea-11', 'LEA-11 ', ' LEA-11', 'Lea-11'])(
      'powodOdrzuceniaIdStanuF: id "%s" vs lista "LEA-11" → "nie ma na liście"',
      (id) => {
        expect(powodOdrzuceniaIdStanuF(id, lista('LEA-11'), null)).toMatch(/nie ma na liście/);
      },
    );
    it('powodOdrzuceniaIdStanuF: lista z " LEA-11 " vs id "LEA-11" → "nie ma na liście"; bliźniak dokładne id → null', () => {
      expect(powodOdrzuceniaIdStanuF('LEA-11', lista(' LEA-11 '), null)).toMatch(
        /nie ma na liście/,
      );
      expect(powodOdrzuceniaIdStanuF('LEA-11', lista('LEA-11'), null)).toBeNull();
    });
    // MIX-626J2: oczekiwanie zmienione. Było: powód "id ze stanu f nie sprzątnięte przy ponownym odczycie
    // (zadania nie ma na liście)". Jest: id odrzucone wcześniej przez bramkę idDozwolone (przed odczytem listy).
    it.each([
      [' LEA-11 ', '"\\u0020LEA-11\\u0020"'],
      ['lea-11', '"lea-11"'],
    ])(
      'sprzatanie ze stanem f: id "%s" przy liście z "LEA-11" → odrzucone przez bramkę, zadanie nietknięte',
      async (id, opis) => {
        const { ctx, a, logi } = kontekst();
        a.dodaj('example.com', 'kontakt', ['formularz']);
        const w = await sprzatanie(ctx, new Set([id]), new Set([id]));
        expect(w.status).toBe('fail');
        expect(w.powod).toBe(
          `${opis}: id niezgodne z ^LEA-[1-9][0-9]{0,6}$, nie sprzątnięte (0 wywołań lin)`,
        );
        expect(a.zadania[0]).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
        expect(logi.join('\n')).toContain(`(g) id ${opis} odrzucone przez bramkę`);
      },
    );
    it.each([' LEA-11 ', 'lea-11'])(
      'sprzatanie bez stanu f: id "%s" nie dopasowuje LEA-11 (fail, zadanie nietknięte)',
      async (id) => {
        const { ctx, a } = kontekst();
        a.dodaj('example.com', 'kontakt', ['formularz']);
        const w = await sprzatanie(ctx, new Set([id]));
        expect(w.status).toBe('fail');
        expect(a.zadania[0]).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      },
    );
    it.each([' LEA-11 ', 'lea-11'])(
      'przebieg: id "%s" w pliku stanu f → odrzucone kształtem, LEA-11 nietknięte',
      async (id) => {
        const k = kontekst(
          {},
          { E2E_BEZ_RESEND: '1' },
          { ...STAN_F_OK, zadanie: id, zadania: [id] },
        );
        const w = await biegnij(k.ctx);
        const zad = k.a.zadania.find((z) => z.id === ID_F)!;
        expect(zad).toMatchObject({ stan: 'Backlog' });
        expect(k.logi.join('\n')).toMatch(/niepoprawne id w pliku stanu f pominięte/);
        expect(w.wyniki.g.status).toBe('pass');
      },
    );
    it.each([' LEA-11 ', 'lea-11'])(
      'sprzatanie: wpis "%s" obok "LEA-11" to INNE id, nie duplikat: LEA-11 sprzątnięte, wariant nietknięty',
      async (wariant) => {
        const { ctx, a, logi } = kontekst();
        a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-11
        a.zadania.push({ ...a.zadania[0], id: wariant, etykiety: ['formularz'] });
        const w = await sprzatanie(ctx, new Set(['LEA-11']), new Set(['LEA-11']));
        expect(w.status).toBe('pass');
        expect(a.zadania[0]).toMatchObject({ id: 'LEA-11', stan: 'Canceled' });
        expect(a.zadania[1]).toMatchObject({
          id: wariant,
          stan: 'Backlog',
          etykiety: ['formularz'],
        });
        expect(logi.join('\n')).not.toMatch(/niejednoznaczne/);
      },
    );
    it('bliźniak: dokładne "LEA-11" → anulowane', async () => {
      const r = await bieg();
      expect(r.zad).toMatchObject({ stan: 'Canceled' });
    });
  });

  describe('forma 10 (E2): nieczytelna lista bez kandydatów ze stanu f', () => {
    it('brak stanu f, błąd odczytu listy w (g) → (g) = fail z powodem, nic nie anulowane', async () => {
      const r = await bieg({ bezStanuF: true, blad: [1] });
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toMatch(/błąd odczytu/);
      expect(r.wywolania.filter((x) => x[0] === 'stan' || x[0] === 'etykieta')).toEqual([]);
    });
    it('bliźniak: brak stanu f, lista czytelna → (g) pass', async () => {
      const r = await bieg({ bezStanuF: true });
      expect(r.w.wyniki.g.status).toBe('pass');
    });
    it('stan f nieważny (inne SHA), błąd odczytu listy → (g) = fail', async () => {
      const k = kontekst({}, { E2E_BEZ_RESEND: '1' }, { ...STAN_F_OK, sha: 'inny999' });
      const lin = k.ctx.lin;
      k.ctx.lin = async (args: string[]) => {
        if (args[0] === 'lista' && k.logi.some((l) => /^\(e\)/.test(l)))
          throw new Error('lin lista: błąd odczytu');
        return lin(args);
      };
      const w = await biegnij(k.ctx);
      expect(w.wyniki.g.status).toBe('fail');
    });
  });
});

describe('MIX-626G: duplikaty id przy identycznym tytule i przy mieszanych tytułach (M1, M4)', () => {
  const ID_F = 'LEA-11';
  const PRZED = '[Preview] Lead: x';
  type Wpis = { id?: string; tytul: string; stan?: string; przed?: boolean };
  type Obj = { zadania: Array<Record<string, unknown>> };
  type Haki = {
    // n-ty odczyt listy PO (e): 1 = odczyt (g), 2 = `teraz` w sprzątaniu, 3 = kontrola po sprzątaniu
    duplikaty?: Record<number, Wpis[]>;
    przerob?: Record<number, (o: Obj) => void>;
    // dla duplikatów bez id: 'f' = LEA-11 (stan f), 'bieg' = pierwsze zadanie utworzone w biegu
    cel?: 'f' | 'bieg';
  };
  const bieg = async (h: Haki = {}) => {
    const k = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const { ctx, a, logi } = k;
    a.zadania.find((z) => z.id === ID_F)!.tytul = PRZED;
    const wywolania: string[][] = [];
    let n = 0;
    let celId = ID_F;
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      if (args[0] === 'lista' && logi.some((l) => /^\(e\)/.test(l))) {
        n += 1;
        if (h.cel === 'bieg') celId = a.zadania.find((z) => z.id !== ID_F)!.id;
        const obj = JSON.parse(await lin(args)) as Obj;
        h.przerob?.[n]?.(obj);
        for (const d of h.duplikaty?.[n] ?? []) {
          const wpis = {
            id: d.id ?? celId,
            stan: d.stan ?? 'Backlog',
            kto: 'jakub',
            delegat: null,
            tytul: d.tytul,
            etykiety: [],
          };
          if (d.przed) obj.zadania.unshift(wpis);
          else obj.zadania.push(wpis);
        }
        return JSON.stringify(obj);
      }
      return lin(args);
    };
    const w = await biegnij(ctx);
    const wywolaniaId = (id: string) =>
      wywolania.filter((x) => x[1] === id && (x[0] === 'stan' || x[0] === 'etykieta'));
    return { w, a, logi, wywolania, celId, wywolaniaId, tekst: logi.join('\n') };
  };
  const zad = (r: Awaited<ReturnType<typeof bieg>>, id: string) =>
    r.a.zadania.find((z) => z.id === id)!;
  const NIEJ = (id: string) =>
    new RegExp(
      `\\(g\\) id ${id} (ze stanu f )?pominięte: id występuje na liście \\d razy \\(niejednoznaczne\\)`,
    );

  const bliznak = async (nazwa: string) => {
    const r = await bieg();
    expect(r.wywolaniaId(ID_F)).toEqual([
      ['etykieta', ID_F, '+test'],
      ['stan', ID_F, 'Canceled'],
    ]);
    expect(zad(r, ID_F)).toMatchObject({ stan: 'Canceled' });
    expect(zad(r, ID_F).etykiety).toContain('test');
    expect(r.w.wyniki.g.status, nazwa).toBe('pass');
  };

  describe('M1: identyczne duplikaty (to samo id, ten sam tytuł Preview) przy odczycie (g)', () => {
    it('forma 1: dwa identyczne wpisy → odmowa z linią powodu, zero wywołań etykieta/stan dla id', async () => {
      const r = await bieg({ duplikaty: { 1: [{ tytul: PRZED }] } });
      expect(r.wywolaniaId(ID_F)).toEqual([]);
      expect(zad(r, ID_F)).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      expect(r.tekst).toMatch(NIEJ(ID_F));
      expect(r.tekst).toMatch(
        /\(g\) id LEA-11 ze stanu f pominięte: id występuje na liście 2 razy/,
      );
    });
    it('forma 1 (bliźniak): pojedynczy wpis → anulowane', async () => {
      await bliznak('f1');
    });
    it('forma 2: trzy identyczne wpisy → odmowa, w linii liczba 3, zero wywołań', async () => {
      const r = await bieg({ duplikaty: { 1: [{ tytul: PRZED }, { tytul: PRZED, przed: true }] } });
      expect(r.wywolaniaId(ID_F)).toEqual([]);
      expect(r.tekst).toMatch(
        /\(g\) id LEA-11 ze stanu f pominięte: id występuje na liście 3 razy \(niejednoznaczne\)/,
      );
      expect(zad(r, ID_F)).toMatchObject({ stan: 'Backlog' });
    });
    it('forma 5: duplikat z tytułem różniącym się spacją na końcu → odmowa, zero wywołań', async () => {
      const r = await bieg({ duplikaty: { 1: [{ tytul: `${PRZED} ` }] } });
      expect(r.wywolaniaId(ID_F)).toEqual([]);
      expect(r.tekst).toMatch(NIEJ(ID_F));
    });
    it('forma 6: drugi wpis już w stanie Canceled (identyczny tytuł) → i tak odmowa, zero wywołań', async () => {
      const r = await bieg({ duplikaty: { 1: [{ tytul: PRZED, stan: 'Canceled' }] } });
      expect(r.wywolaniaId(ID_F)).toEqual([]);
      expect(r.tekst).toMatch(NIEJ(ID_F));
      expect(zad(r, ID_F)).toMatchObject({ stan: 'Backlog' });
    });
    it('powodOdrzuceniaIdStanuF bezpośrednio: dwa identyczne wpisy → powód z liczbą 2; jeden → null', () => {
      const wpis = { id: ID_F, tytul: PRZED, etykiety: [] };
      expect(powodOdrzuceniaIdStanuF(ID_F, [wpis, { ...wpis }], null)).toBe(
        'id występuje na liście 2 razy (niejednoznaczne)',
      );
      expect(powodOdrzuceniaIdStanuF(ID_F, [wpis], null)).toBeNull();
    });
  });

  describe('M4: zadanie z biegu, drugi odczyt: wpis Preview + wpis z prawdziwym tytułem', () => {
    const PRAWDZIWY = 'Lead: prawdziwy.pl — kontakt';
    const sprawdzOdmowe = (r: Awaited<ReturnType<typeof bieg>>) => {
      const id = r.celId;
      expect(id).not.toBe(ID_F);
      expect(r.wywolaniaId(id)).toEqual([]); // zero wywołań dla tego id, nie tylko status (g)
      expect(r.tekst).toMatch(
        new RegExp(
          `\\(g\\) id ${id} pominięte: id występuje na liście 2 razy \\(niejednoznaczne\\)`,
        ),
      );
      expect(zad(r, id)).toMatchObject({ stan: 'Backlog' });
      expect(zad(r, id).stan).not.toBe('Canceled');
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toContain(`${id}: niejednoznaczne id na liście, nie sprzątnięte`);
    };
    it('forma 3: wpis Preview jest pierwszy, drugi z prawdziwym tytułem → odmowa, zero wywołań dla id, (g) fail', async () => {
      const r = await bieg({ cel: 'bieg', duplikaty: { 2: [{ tytul: PRAWDZIWY }] } });
      sprawdzOdmowe(r);
    });
    it('forma 4: wpis z prawdziwym tytułem jest pierwszy → odmowa, zero wywołań dla id, (g) fail', async () => {
      const r = await bieg({ cel: 'bieg', duplikaty: { 2: [{ tytul: PRAWDZIWY, przed: true }] } });
      sprawdzOdmowe(r);
    });
    it('formy 3/4 (bliźniak): jeden wpis Preview → zadanie z biegu anulowane (stan), (g) pass', async () => {
      const r = await bieg({ cel: 'bieg' });
      const id = r.celId;
      expect(id).not.toBe(ID_F);
      expect(r.wywolaniaId(id)).toEqual([['stan', id, 'Canceled']]);
      expect(zad(r, id)).toMatchObject({ stan: 'Canceled' });
      expect(r.w.wyniki.g.status).toBe('pass');
    });
    it('sprzatanie bezpośrednio: Preview + wpis z prawdziwym tytułem → nie anulowane, zero wywołań dla id, fail z powodem; inne id sprzątnięte', async () => {
      const { ctx, a, logi } = kontekst();
      a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-11
      a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-12
      a.zadania.push({ ...a.zadania[0], tytul: PRAWDZIWY, etykiety: [] }); // drugi wpis LEA-11
      const wywolania: string[][] = [];
      const lin = ctx.lin;
      ctx.lin = async (args: string[]) => {
        wywolania.push(args);
        return lin(args);
      };
      const w = await sprzatanie(ctx, new Set(['LEA-11', 'LEA-12']));
      expect(w.status).toBe('fail');
      expect(w.powod).toBe('LEA-11: niejednoznaczne id na liście, nie sprzątnięte');
      expect(wywolania.filter((x) => x[1] === 'LEA-11')).toEqual([]);
      expect(wywolania.filter((x) => x[1] === 'LEA-12')).toEqual([
        ['etykieta', 'LEA-12', '+test'],
        ['stan', 'LEA-12', 'Canceled'],
      ]);
      expect(a.zadania[0]).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
      expect(logi.join('\n')).toMatch(/\(g\) id LEA-11 pominięte: id występuje na liście 2 razy/);
    });
    it('sprzatanie bezpośrednio (bliźniak): jeden wpis → anulowane, pass', async () => {
      const { ctx, a } = kontekst();
      a.dodaj('example.com', 'kontakt', ['formularz']);
      const w = await sprzatanie(ctx, new Set(['LEA-11']));
      expect(w.status).toBe('pass');
      expect(a.zadania[0]).toMatchObject({ stan: 'Canceled' });
    });
  });

  describe('formy 7-10: wersje id, odczyty 2 i 3, pusta lista', () => {
    it('forma 7: wpis "lea-11" obok "LEA-11" to inne id, nie duplikat → LEA-11 anulowane, wariant nietknięty', async () => {
      const r = await bieg({
        duplikaty: { 2: [{ id: 'lea-11', tytul: PRZED }] },
      });
      expect(r.wywolaniaId(ID_F)).toEqual([
        ['etykieta', ID_F, '+test'],
        ['stan', ID_F, 'Canceled'],
      ]);
      expect(r.wywolaniaId('lea-11')).toEqual([]);
      expect(r.tekst).not.toMatch(/niejednoznaczne/);
      expect(zad(r, ID_F)).toMatchObject({ stan: 'Canceled' });
    });
    it('forma 8: duplikat dopiero w drugim odczycie, id ze stanu f (identyczny tytuł) → odmowa, zero wywołań, (g) fail z powodem', async () => {
      const r = await bieg({ duplikaty: { 2: [{ tytul: PRZED }] } });
      expect(r.wywolaniaId(ID_F)).toEqual([]);
      expect(r.tekst).toMatch(
        /\(g\) id LEA-11 pominięte: id występuje na liście 2 razy \(niejednoznaczne\)/,
      );
      expect(zad(r, ID_F)).toMatchObject({ stan: 'Backlog' });
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toContain(
        'LEA-11: id ze stanu f nie sprzątnięte przy ponownym odczycie (id występuje na liście 2 razy)',
      );
    });
    it('forma 9: duplikat dopiero po sprzątaniu (trzeci odczyt), identyczny tytuł → (g) fail z liczbą wpisów', async () => {
      const r = await bieg({ duplikaty: { 3: [{ tytul: PRZED }] } });
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toContain('LEA-11: 2 wpisów o tym id po sprzątaniu');
    });
    it('forma 10: pusta lista przy drugim odczycie → id ze stanu f nietknięte, (g) fail z powodem', async () => {
      const r = await bieg({ przerob: { 2: (o) => (o.zadania.length = 0) } });
      expect(r.wywolaniaId(ID_F)).toEqual([]);
      expect(r.tekst).toMatch(/\(g\) id LEA-11 ze stanu f pominięte: zadania nie ma na liście/);
      expect(r.w.wyniki.g.status).toBe('fail');
      expect(r.w.wyniki.g.powod).toContain(
        'LEA-11: id ze stanu f nie sprzątnięte przy ponownym odczycie (zadania nie ma na liście)',
      );
    });
  });
});

describe('MIX-626H: id ze stanu f odrzucone przy drugim odczycie → (g) fail, id nietknięte', () => {
  const ID_F = 'LEA-11';
  const ID_F2 = 'LEA-12';
  const PRZED = '[Preview] Lead: x';
  const PRAWDZIWY = 'Lead: prawdziwy.pl — kontakt';
  type Atrapa = ReturnType<typeof kontekst>['a'];
  type Obj = { zadania: Array<Record<string, unknown>> };
  type Haki = {
    // n-ty odczyt listy PO (e): 1 = odczyt (g), 2 = `teraz` w sprzątaniu, 3 = kontrola po sprzątaniu
    przerob?: Record<number, (o: Obj) => void>; // zmiana tylko w odpowiedzi odczytu
    przyOdczycie?: Record<number, (a: Atrapa) => void>; // zmiana stanu atrapy
    blad?: number[];
    surowa?: Record<number, string>;
    dwaF?: boolean;
  };
  const bieg = async (h: Haki = {}) => {
    const stan = h.dwaF ? { ...STAN_F_OK, zadania: [ID_F, ID_F2], zadanie: ID_F } : STAN_F_OK;
    const k = kontekst({}, { E2E_BEZ_RESEND: '1' }, stan);
    const { ctx, a, logi } = k;
    if (h.dwaF) a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-12
    for (const z of a.zadania) if ([ID_F, ID_F2].includes(z.id)) z.tytul = PRZED;
    const wywolania: string[][] = [];
    let n = 0;
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      if (args[0] === 'lista' && logi.some((l) => /^\(e\)/.test(l))) {
        n += 1;
        h.przyOdczycie?.[n]?.(a);
        if (h.blad?.includes(n)) throw new Error('lin lista: błąd odczytu');
        if (h.surowa?.[n] !== undefined) return h.surowa[n];
        const obj = JSON.parse(await lin(args)) as Obj;
        h.przerob?.[n]?.(obj);
        return JSON.stringify(obj);
      }
      return lin(args);
    };
    const w = await biegnij(ctx);
    const dotkniete = (id: string) =>
      wywolania.filter((x) => x[1] === id && (x[0] === 'stan' || x[0] === 'etykieta'));
    const zad = (id: string) => a.zadania.find((z) => z.id === id)!;
    const biegowe = a.zadania.filter((z) => ![ID_F, ID_F2].includes(z.id));
    return { w, a, logi, wywolania, dotkniete, zad, biegowe, g: w.wyniki.g };
  };
  type R = Awaited<ReturnType<typeof bieg>>;
  const usunF = (o: Obj) => {
    o.zadania = o.zadania.filter((z) => z.id !== ID_F);
  };
  const wpisF = (tytul: string) => ({
    id: ID_F,
    stan: 'Backlog',
    kto: 'jakub',
    delegat: null,
    tytul,
    etykiety: [],
  });
  const odmowa = (r: R, powodFrag: string, id = ID_F) => {
    expect(r.dotkniete(id)).toEqual([]);
    expect(r.zad(id)).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
    expect(r.g.status).toBe('fail');
    expect(r.g.powod).toContain(`${id}: id ze stanu f nie sprzątnięte przy ponownym odczycie`);
    expect(r.g.powod).toContain(powodFrag);
  };
  const bliznak = async () => {
    const r = await bieg();
    expect(r.dotkniete(ID_F)).toEqual([
      ['etykieta', ID_F, '+test'],
      ['stan', ID_F, 'Canceled'],
    ]);
    expect(r.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    expect(r.zad(ID_F).etykiety).toContain('test');
    expect(r.g.status).toBe('pass');
  };

  it('bliźniak wspólny: id ze stanu f raz na liście, tytuł Preview → anulowane, (g) pass', async () => {
    await bliznak();
  });
  it('forma 1 (V1): pusty drugi odczyt → id nietknięte, (g) fail z id i powodem', async () => {
    const r = await bieg({ przerob: { 2: (o) => (o.zadania.length = 0) } });
    odmowa(r, 'zadania nie ma na liście');
  });
  it('forma 2 (V2): w drugim odczycie brakuje tylko id f → fail, zadania z biegu nadal anulowane', async () => {
    const r = await bieg({ przerob: { 2: usunF } });
    odmowa(r, 'zadania nie ma na liście');
    expect(r.biegowe.length).toBeGreaterThan(0);
    for (const z of r.biegowe) {
      expect(z).toMatchObject({ stan: 'Canceled' });
      expect(z.etykiety).toContain('test');
    }
  });
  it('forma 3 (V5): id f zduplikowane identycznie w drugim odczycie → fail, nietknięte', async () => {
    const r = await bieg({ przerob: { 2: (o) => o.zadania.push(wpisF(PRZED)) } });
    odmowa(r, 'id występuje na liście 2 razy');
  });
  it('forma 4: id f zduplikowane z prawdziwym tytułem (na końcu i na początku) → fail, nietknięte', async () => {
    for (const naPoczatku of [false, true]) {
      const r = await bieg({
        przerob: {
          2: (o) => {
            if (naPoczatku) o.zadania.unshift(wpisF(PRAWDZIWY));
            else o.zadania.push(wpisF(PRAWDZIWY));
          },
        },
      });
      odmowa(r, 'id występuje na liście 2 razy');
    }
  });
  it.each([
    ['forma 5: zmieniony na prawdziwy tytuł', PRAWDZIWY],
    ['forma 6: nawias pełnej szerokości zamiast "["', '［Preview] Lead: x'],
    ['forma 6b: nawias pełnej szerokości zamiast "]"', '[Preview］ Lead: x'],
    ['forma 7: spacja na początku', ` ${PRZED}`],
    ['forma 7b: mała litera w przedrostku', '[preview] Lead: x'],
    ['pusty tytuł', ''],
  ])('%s przy drugim odczycie → fail, nietknięte', async (_n, tytul) => {
    const r = await bieg({
      przerob: {
        2: (o) => {
          o.zadania.find((z) => z.id === ID_F)!.tytul = tytul;
        },
      },
    });
    odmowa(r, tytul === '' ? 'brak tytułu zadania' : 'tytuł nie zaczyna się od');
  });
  it('forma 8: id f już Canceled (z etykietą test) przy drugim odczycie → traktowane jako zrobione: bez wywołań, (g) pass', async () => {
    const r = await bieg({
      przyOdczycie: {
        2: (a) => {
          const z = a.zadania.find((x) => x.id === ID_F)!;
          z.stan = 'Canceled';
          z.etykiety = ['formularz', 'test'];
        },
      },
    });
    expect(r.dotkniete(ID_F)).toEqual([]);
    expect(r.g.status).toBe('pass');
  });
  it('forma 8b: id f już Canceled bez etykiety test → tylko etykieta, (g) pass', async () => {
    const r = await bieg({
      przyOdczycie: {
        2: (a) => {
          a.zadania.find((x) => x.id === ID_F)!.stan = 'Canceled';
        },
      },
    });
    expect(r.dotkniete(ID_F)).toEqual([['etykieta', ID_F, '+test']]);
    expect(r.g.status).toBe('pass');
  });
  it('forma 9: drugi odczyt rzuca błąd → nic nie dotknięte, (g) fail z powodem odczytu', async () => {
    const r = await bieg({ blad: [2] });
    expect(r.dotkniete(ID_F)).toEqual([]);
    expect(r.zad(ID_F)).toMatchObject({ stan: 'Backlog' });
    expect(r.g.status).toBe('fail');
    expect(r.g.powod).toContain('błąd odczytu');
  });
  it.each([
    ['obiekt zamiast tablicy', JSON.stringify({ zadania: {} })],
    ['null', JSON.stringify({ zadania: null })],
    ['nie JSON', 'to nie jest json'],
    ['pusty napis', ''],
  ])(
    'forma 10: drugi odczyt bez tablicy zadań (%s) → nic nie dotknięte, (g) fail',
    async (_n, surowa) => {
      const r = await bieg({ surowa: { 2: surowa } });
      expect(r.dotkniete(ID_F)).toEqual([]);
      expect(r.zad(ID_F)).toMatchObject({ stan: 'Backlog' });
      expect(r.g.status).toBe('fail');
      expect(r.g.powod).toMatch(/lin lista: /);
    },
  );
  it('forma 11: dwa id f, jedno odrzucone → (g) fail, drugie nadal anulowane; bliźniak: oba poprawne → pass', async () => {
    const r = await bieg({
      dwaF: true,
      przerob: {
        2: (o) => {
          o.zadania.find((z) => z.id === ID_F)!.tytul = PRAWDZIWY;
        },
      },
    });
    odmowa(r, 'tytuł nie zaczyna się od');
    expect(r.g.powod).not.toContain(ID_F2);
    expect(r.zad(ID_F2)).toMatchObject({ stan: 'Canceled' });
    expect(r.zad(ID_F2).etykiety).toContain('test');
    const r2 = await bieg({
      dwaF: true,
      przerob: {
        2: (o) => {
          o.zadania.find((z) => z.id === ID_F2)!.tytul = PRAWDZIWY;
        },
      },
    });
    odmowa(r2, 'tytuł nie zaczyna się od', ID_F2);
    expect(r2.g.powod).not.toContain(`${ID_F}:`);
    expect(r2.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    const ok = await bieg({ dwaF: true });
    expect(ok.g.status).toBe('pass');
    expect(ok.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    expect(ok.zad(ID_F2)).toMatchObject({ stan: 'Canceled' });
  });
  it('forma 12: zadania z biegu nadal anulowane, gdy id f odrzucone; bliźniak: bez id f wszystkie anulowane → pass', async () => {
    const r = await bieg({ przerob: { 2: usunF } });
    expect(r.g.status).toBe('fail');
    expect(r.biegowe.length).toBeGreaterThan(0);
    expect(r.biegowe.every((z) => z.stan === 'Canceled')).toBe(true);
    const bez = kontekst({}, { E2E_BEZ_RESEND: '1' }, null);
    const w = await biegnij(bez.ctx);
    expect(w.wyniki.g.status).toBe('pass');
    expect(bez.a.zadania.every((z) => z.stan === 'Canceled')).toBe(true);
  });
  it('sprzatanie bezpośrednio: odrzucone id f → fail z powodem, zero wywołań dla id; id bez stanu f dalej sprzątane', async () => {
    const { ctx, a } = kontekst();
    a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-11
    a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-12
    a.zadania[0].tytul = PRAWDZIWY;
    const wywolania: string[][] = [];
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      return lin(args);
    };
    const w = await sprzatanie(ctx, new Set([ID_F, ID_F2]), new Set([ID_F]));
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(
      /^LEA-11: id ze stanu f nie sprzątnięte przy ponownym odczycie \(tytuł nie zaczyna się od "\[Preview\] Lead: "/,
    );
    expect(wywolania.filter((x) => x[1] === ID_F)).toEqual([]);
    expect(wywolania.filter((x) => x[1] === ID_F2)).toEqual([
      ['etykieta', ID_F2, '+test'],
      ['stan', ID_F2, 'Canceled'],
    ]);
  });
});

describe('MIX-626I: id ze stanu f odrzucone przy PIERWSZYM odczycie → (g) fail, id nietknięte', () => {
  const ID_F = 'LEA-11';
  const ID_F2 = 'LEA-12';
  const PRZED = '[Preview] Lead: x';
  const PRAWDZIWY = 'Lead: prawdziwy.pl — kontakt';
  type Obj = { zadania: Array<Record<string, unknown>> };
  type Haki = {
    // n-ty odczyt listy PO (e): 1 = odczyt (g), 2 = `teraz` w sprzątaniu, 3 = kontrola po sprzątaniu
    przerob?: Record<number, (o: Obj) => void>; // zmiana tylko w odpowiedzi odczytu
    blad?: number[];
    dwaF?: boolean;
  };
  const bieg = async (h: Haki = {}) => {
    const stan = h.dwaF ? { ...STAN_F_OK, zadania: [ID_F, ID_F2], zadanie: ID_F } : STAN_F_OK;
    const k = kontekst({}, { E2E_BEZ_RESEND: '1' }, stan);
    const { ctx, a, logi } = k;
    if (h.dwaF) a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-12
    for (const z of a.zadania) if ([ID_F, ID_F2].includes(z.id)) z.tytul = PRZED;
    const wywolania: string[][] = [];
    let n = 0;
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      if (args[0] === 'lista' && logi.some((l) => /^\(e\)/.test(l))) {
        n += 1;
        if (h.blad?.includes(n)) throw new Error('lin lista: błąd odczytu');
        const obj = JSON.parse(await lin(args)) as Obj;
        h.przerob?.[n]?.(obj);
        return JSON.stringify(obj);
      }
      return lin(args);
    };
    const w = await biegnij(ctx);
    const dotkniete = (id: string) =>
      wywolania.filter((x) => x[1] === id && (x[0] === 'stan' || x[0] === 'etykieta'));
    const zad = (id: string) => a.zadania.find((z) => z.id === id)!;
    const biegowe = a.zadania.filter((z) => ![ID_F, ID_F2].includes(z.id));
    return { w, a, logi, wywolania, dotkniete, zad, biegowe, g: w.wyniki.g };
  };
  type R = Awaited<ReturnType<typeof bieg>>;
  const usunF = (o: Obj) => {
    o.zadania = o.zadania.filter((z) => z.id !== ID_F);
  };
  const ustawTytul = (tytul: string) => (o: Obj) => {
    o.zadania.find((z) => z.id === ID_F)!.tytul = tytul;
  };
  const wpisF = (tytul: string, id = ID_F) => ({
    id,
    stan: 'Backlog',
    kto: 'jakub',
    delegat: null,
    tytul,
    etykiety: [],
  });
  const odmowa = (r: R, powodFrag: string, id = ID_F) => {
    expect(r.dotkniete(id)).toEqual([]);
    expect(r.zad(id)).toMatchObject({ stan: 'Backlog', etykiety: ['formularz'] });
    expect(r.g.status).toBe('fail');
    expect(r.g.powod).toContain(`${id}: id ze stanu f nie sprzątnięte przy pierwszym odczycie`);
    expect(r.g.powod).toContain(powodFrag);
    expect(r.logi.join('\n')).toContain(`(g) id ${id} ze stanu f pominięte: `);
  };
  const bliznak = async () => {
    const r = await bieg();
    expect(r.dotkniete(ID_F)).toEqual([
      ['etykieta', ID_F, '+test'],
      ['stan', ID_F, 'Canceled'],
    ]);
    expect(r.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    expect(r.zad(ID_F).etykiety).toContain('test');
    expect(r.g.status).toBe('pass');
  };

  it('bliźniak wspólny: id ze stanu f raz na liście, tytuł Preview → anulowane, (g) pass', async () => {
    await bliznak();
  });
  it('forma 1 (V1): pusty pierwszy odczyt → id nietknięte, (g) fail z id i powodem', async () => {
    const r = await bieg({ przerob: { 1: (o) => (o.zadania.length = 0) } });
    odmowa(r, 'zadania nie ma na liście');
  });
  it('forma 2 (V2): w pierwszym odczycie brakuje tylko id f → fail, zadania z biegu nadal anulowane', async () => {
    const r = await bieg({ przerob: { 1: usunF } });
    odmowa(r, 'zadania nie ma na liście');
    expect(r.biegowe.length).toBeGreaterThan(0);
    for (const z of r.biegowe) {
      expect(z).toMatchObject({ stan: 'Canceled' });
      expect(z.etykiety).toContain('test');
    }
  });
  it('forma 3 (V5): id f zduplikowane identycznie w pierwszym odczycie → fail, nietknięte', async () => {
    const r = await bieg({ przerob: { 1: (o) => o.zadania.push(wpisF(PRZED)) } });
    odmowa(r, 'id występuje na liście 2 razy');
  });
  it('forma 4: id f zduplikowane z prawdziwym tytułem (na końcu i na początku) w pierwszym odczycie → fail', async () => {
    for (const naPoczatku of [false, true]) {
      const r = await bieg({
        przerob: {
          1: (o) => {
            if (naPoczatku) o.zadania.unshift(wpisF(PRAWDZIWY));
            else o.zadania.push(wpisF(PRAWDZIWY));
          },
        },
      });
      odmowa(r, 'id występuje na liście 2 razy');
    }
  });
  it.each([
    ['forma 5: prawdziwy tytuł', PRAWDZIWY],
    ['forma 6: nawias pełnej szerokości zamiast "["', '［Preview] Lead: x'],
    ['forma 6b: nawias pełnej szerokości zamiast "]"', '[Preview］ Lead: x'],
    ['forma 7: spacja na początku', ` ${PRZED}`],
    ['forma 7b: mała litera w przedrostku', '[preview] Lead: x'],
    ['forma 8: ZWSP w przedrostku', '[Pre\u200bview] Lead: x'],
    ['forma 8b: ZWSP na początku', `\u200b${PRZED}`],
    ['pusty tytuł', ''],
  ])('%s przy pierwszym odczycie → fail, nietknięte', async (_n, tytul) => {
    const r = await bieg({ przerob: { 1: ustawTytul(tytul) } });
    odmowa(r, tytul === '' ? 'brak tytułu zadania' : 'tytuł nie zaczyna się od');
  });
  it('forma 9: w pierwszym odczycie jest tylko wariant id `lea-11` (brak LEA-11) → fail; bliźniak: dodatkowy wpis `lea-11` obok dokładnego id → pass', async () => {
    const r = await bieg({
      przerob: {
        1: (o) => {
          o.zadania.find((z) => z.id === ID_F)!.id = 'lea-11';
        },
      },
    });
    odmowa(r, 'zadania nie ma na liście');
    const ok = await bieg({ przerob: { 1: (o) => o.zadania.push(wpisF(PRAWDZIWY, 'lea-11')) } });
    expect(ok.g.status).toBe('pass');
    expect(ok.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    expect(ok.dotkniete('lea-11')).toEqual([]);
  });
  it('forma 10: pierwszy odczyt rzuca błąd → nic nie dotknięte, (g) fail z powodem odczytu; bliźniak: odczyt się udaje → pass', async () => {
    const r = await bieg({ blad: [1] });
    expect(r.dotkniete(ID_F)).toEqual([]);
    expect(r.zad(ID_F)).toMatchObject({ stan: 'Backlog' });
    expect(r.g.status).toBe('fail');
    expect(r.g.powod).toContain('błąd odczytu');
    expect(r.logi.join('\n')).toContain(
      `(g) id ${ID_F} ze stanu f pominięte: nie udało się odczytać bieżącego tytułu zadania`,
    );
    await bliznak();
  });
  it('forma 11: dwa id f, jedno odrzucone przy pierwszym odczycie → (g) fail, drugie nadal anulowane; bliźniak: oba poprawne → pass', async () => {
    const r = await bieg({ dwaF: true, przerob: { 1: ustawTytul(PRAWDZIWY) } });
    odmowa(r, 'tytuł nie zaczyna się od');
    expect(r.g.powod).not.toContain(ID_F2);
    expect(r.zad(ID_F2)).toMatchObject({ stan: 'Canceled' });
    expect(r.zad(ID_F2).etykiety).toContain('test');
    const r2 = await bieg({
      dwaF: true,
      przerob: {
        1: (o) => {
          o.zadania.find((z) => z.id === ID_F2)!.tytul = PRAWDZIWY;
        },
      },
    });
    odmowa(r2, 'tytuł nie zaczyna się od', ID_F2);
    expect(r2.g.powod).not.toContain(`${ID_F}:`);
    expect(r2.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    const ok = await bieg({ dwaF: true });
    expect(ok.g.status).toBe('pass');
    expect(ok.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    expect(ok.zad(ID_F2)).toMatchObject({ stan: 'Canceled' });
  });
  it('forma 12: odrzucone przy pierwszym odczycie, poprawne przy drugim → nadal fail i nietknięte; bliźniak: poprawne w obu → pass', async () => {
    const r = await bieg({ przerob: { 1: ustawTytul(PRAWDZIWY) } }); // odczyty 2 i 3 bez zmian
    odmowa(r, 'tytuł nie zaczyna się od');
    expect(r.biegowe.length).toBeGreaterThan(0);
    expect(r.biegowe.every((z) => z.stan === 'Canceled')).toBe(true);
    await bliznak();
  });
  it('id ze stanu f jest też zadaniem utworzonym w biegu i odrzucone przy pierwszym odczycie → nietknięte mimo to, (g) fail', async () => {
    const stan = { ...STAN_F_OK, zadania: ['LEA-12'], zadanie: 'LEA-12' };
    const { ctx, a, logi } = kontekst({}, { E2E_BEZ_RESEND: '1' }, stan);
    const wywolania: string[][] = [];
    let n = 0;
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      if (args[0] === 'lista' && logi.some((l) => /^\(e\)/.test(l))) {
        n += 1;
        const obj = JSON.parse(await lin(args)) as Obj;
        if (n === 1) {
          const z = obj.zadania.find((x) => x.id === 'LEA-12');
          if (z) z.tytul = PRAWDZIWY; // odpowiedź odczytu 1: id f bez przedrostka
        }
        return JSON.stringify(obj);
      }
      return lin(args);
    };
    const w = await biegnij(ctx);
    expect(a.zadania.some((z) => z.id === 'LEA-12')).toBe(true); // utworzone w biegu
    expect(w.wyniki.g.status).toBe('fail');
    expect(w.wyniki.g.powod).toContain(
      'LEA-12: id ze stanu f nie sprzątnięte przy pierwszym odczycie',
    );
    expect(
      wywolania.filter((x) => x[1] === 'LEA-12' && (x[0] === 'stan' || x[0] === 'etykieta')),
    ).toEqual([]);
  });
  it('sprzatanie bezpośrednio: błędy wstępne z pierwszego odczytu przy pustym zbiorze id → fail z powodem; bez błędów → pass', async () => {
    const { ctx } = kontekst();
    const blad = `${ID_F}: id ze stanu f nie sprzątnięte przy pierwszym odczycie (x)`;
    const w = await sprzatanie(ctx, new Set(), new Set(), [blad]);
    expect(w.status).toBe('fail');
    expect(w.powod).toBe(blad);
    expect((await sprzatanie(ctx, new Set(), new Set(), [])).status).toBe('pass');
  });
});

describe('MIX-626J: dwa id f odrzucone przy pierwszym odczycie, odczyt 2 rzuca błąd, bledyWstepne, format id na liście', () => {
  const ID_F = 'LEA-11';
  const ID_F2 = 'LEA-12';
  const PRZED = '[Preview] Lead: x';
  const PRAWDZIWY = 'Lead: prawdziwy.pl — kontakt';
  const NOWE = 'LEA-9001';
  type Obj = { zadania: Array<Record<string, unknown>> };
  type Haki = {
    przerob?: Record<number, (o: Obj) => void>;
    blad?: number[];
    dwaF?: boolean;
    nowe?: string; // id nowego zadania z tytułem Preview, dodane do atrapy przy pierwszym odczycie (g)
  };
  const bieg = async (h: Haki = {}) => {
    const stan = h.dwaF ? { ...STAN_F_OK, zadania: [ID_F, ID_F2], zadanie: ID_F } : STAN_F_OK;
    const k = kontekst({}, { E2E_BEZ_RESEND: '1' }, stan);
    const { ctx, a, logi } = k;
    if (h.dwaF) a.dodaj('example.com', 'kontakt', ['formularz']); // LEA-12
    for (const z of a.zadania) if ([ID_F, ID_F2].includes(z.id)) z.tytul = PRZED;
    const wywolania: string[][] = [];
    let n = 0;
    const lin = ctx.lin;
    ctx.lin = async (args: string[]) => {
      wywolania.push(args);
      if (args[0] === 'lista' && logi.some((l) => /^\(e\)/.test(l))) {
        n += 1;
        if (n === 1 && h.nowe !== undefined)
          a.zadania.push({
            id: h.nowe,
            stan: 'Backlog',
            kto: 'jakub',
            delegat: null,
            tytul: PRZED,
            etykiety: [],
          });
        if (h.blad?.includes(n)) throw new Error('lin lista: błąd odczytu');
        const obj = JSON.parse(await lin(args)) as Obj;
        h.przerob?.[n]?.(obj);
        return JSON.stringify(obj);
      }
      return lin(args);
    };
    const w = await biegnij(ctx);
    const dotkniete = (id: string) =>
      wywolania.filter((x) => x[1] === id && (x[0] === 'stan' || x[0] === 'etykieta'));
    const zad = (id: string) => a.zadania.find((z) => z.id === id)!;
    return { w, a, logi, wywolania, dotkniete, zad, g: w.wyniki.g };
  };
  const ustawTytul = (id: string, tytul: string) => (o: Obj) => {
    o.zadania.find((z) => z.id === id)!.tytul = tytul;
  };
  const POWOD1 = 'id ze stanu f nie sprzątnięte przy pierwszym odczycie';

  describe('uwaga 1 (forma 10): dwa odrzucone id f przy pierwszym odczycie → oba w powodzie (g)', () => {
    it('oba id odrzucone → oba nazwane i nietknięte; bliźniak: odrzucone tylko jedno → nazwane tylko to', async () => {
      const r = await bieg({
        dwaF: true,
        przerob: {
          1: (o) => {
            ustawTytul(ID_F, PRAWDZIWY)(o);
            ustawTytul(ID_F2, PRAWDZIWY)(o);
          },
        },
      });
      expect(r.g.status).toBe('fail');
      expect(r.g.powod).toContain(`${ID_F}: ${POWOD1}`);
      expect(r.g.powod).toContain(`${ID_F2}: ${POWOD1}`);
      expect(r.dotkniete(ID_F)).toEqual([]);
      expect(r.dotkniete(ID_F2)).toEqual([]);
      expect(r.zad(ID_F)).toMatchObject({ stan: 'Backlog' });
      expect(r.zad(ID_F2)).toMatchObject({ stan: 'Backlog' });
      const jedno = await bieg({ dwaF: true, przerob: { 1: ustawTytul(ID_F2, PRAWDZIWY) } });
      expect(jedno.g.status).toBe('fail');
      expect(jedno.g.powod).toContain(`${ID_F2}: ${POWOD1}`);
      expect(jedno.g.powod).not.toContain(`${ID_F}:`);
      expect(jedno.zad(ID_F)).toMatchObject({ stan: 'Canceled' });
    });
    it('oba id odrzucone z różnych powodów (brak i prawdziwy tytuł) → powód każdego osobno', async () => {
      const r = await bieg({
        dwaF: true,
        przerob: {
          1: (o) => {
            o.zadania = o.zadania.filter((z) => z.id !== ID_F);
            ustawTytul(ID_F2, PRAWDZIWY)(o);
          },
        },
      });
      expect(r.g.powod).toContain(`${ID_F}: ${POWOD1} (zadania nie ma na liście)`);
      expect(r.g.powod).toContain(`${ID_F2}: ${POWOD1} (tytuł nie zaczyna się od`);
    });
  });

  describe('uwaga 4 (forma 11): odrzucone przy odczycie 1 i odczyt 2 (albo 3) rzuca błąd → w powodzie id i powód z odczytu 1', () => {
    it('odczyt 2 rzuca → powód zawiera id, powód odrzucenia i błąd odczytu; id nietknięte', async () => {
      const r = await bieg({ przerob: { 1: ustawTytul(ID_F, PRAWDZIWY) }, blad: [2] });
      expect(r.g.status).toBe('fail');
      expect(r.g.powod).toContain(`${ID_F}: ${POWOD1} (tytuł nie zaczyna się od`);
      expect(r.g.powod).toContain('błąd odczytu');
      expect(r.g.powod).not.toBe('g: lin lista: błąd odczytu');
      expect(r.dotkniete(ID_F)).toEqual([]);
    });
    it('dwa odrzucone id i odczyt 2 rzuca → oba id w powodzie', async () => {
      const r = await bieg({
        dwaF: true,
        przerob: {
          1: (o) => {
            ustawTytul(ID_F, PRAWDZIWY)(o);
            ustawTytul(ID_F2, PRAWDZIWY)(o);
          },
        },
        blad: [2],
      });
      expect(r.g.powod).toContain(`${ID_F}: ${POWOD1}`);
      expect(r.g.powod).toContain(`${ID_F2}: ${POWOD1}`);
      expect(r.g.powod).toContain('błąd odczytu');
    });
    it('odczyt 3 (po sprzątaniu) rzuca → powód nadal zawiera id i powód z odczytu 1', async () => {
      const r = await bieg({ przerob: { 1: ustawTytul(ID_F, PRAWDZIWY) }, blad: [3] });
      expect(r.g.status).toBe('fail');
      expect(r.g.powod).toContain(`${ID_F}: ${POWOD1} (tytuł nie zaczyna się od`);
      expect(r.g.powod).toContain('błąd odczytu');
      expect(r.dotkniete(ID_F)).toEqual([]);
    });
    it('bliźniak: bez odrzuconego id odczyt 2 rzucający błąd daje dotychczasowy powód (g: lin lista: błąd odczytu)', async () => {
      const r = await bieg({ blad: [2] });
      expect(r.g.status).toBe('fail');
      expect(r.g.powod).toBe('g: lin lista: błąd odczytu');
    });
  });

  describe('uwaga 2 (forma 12): czwarty parametr bledyWstepne jest fail-closed', () => {
    const wartosci: Array<[string, unknown]> = [
      ['null', null],
      ['liczba 5', 5],
      ['obiekt {}', {}],
      ['obiekt tablicopodobny', { length: 1, 0: 'x' }],
      ['napis "e"', 'e'],
      ['Set z napisem', new Set(['e'])],
      ['Set pusty', new Set()],
      ['napis pusty', ''],
      ['false', false],
    ];
    it.each(wartosci)(
      '%s → (g) fail z powodem o tablicy (puste id i niepuste id)',
      async (_n, v) => {
        const { ctx } = kontekst();
        const pusty = await sprzatanie(ctx, new Set(), new Set(), v as string[]);
        expect(pusty.status).toBe('fail');
        expect(pusty.powod).toContain('bledyWstepne: oczekiwano tablicy');
        const k = kontekst({}, {}, STAN_F_OK);
        const niepusty = await sprzatanie(k.ctx, new Set([ID_F]), new Set(), v as string[]);
        expect(niepusty.status).toBe('fail');
        expect(niepusty.powod).toContain('bledyWstepne: oczekiwano tablicy');
      },
    );
    it('bliźniak: undefined i [] → bez błędu (pass, z zadaniem i bez)', async () => {
      const { ctx } = kontekst();
      expect((await sprzatanie(ctx, new Set(), new Set(), undefined)).status).toBe('pass');
      expect((await sprzatanie(ctx, new Set(), new Set(), [])).status).toBe('pass');
      expect((await sprzatanie(ctx, new Set(), new Set())).status).toBe('pass');
      const k = kontekst({}, {}, STAN_F_OK);
      for (const w of [undefined, []]) {
        const r = await sprzatanie(k.ctx, new Set([ID_F]), new Set(), w as string[] | undefined);
        expect(r.powod).not.toContain('bledyWstepne');
        expect(r.status).toBe('pass');
      }
    });
  });

  describe('uwaga 5 (formy 1-9): id z listy (nowe od migawki, tytuł Preview) tylko w dokładnym formacie; wariant = 0 wywołań i błąd z id', () => {
    const odmowa = async (id: string, opis: string) => {
      const r = await bieg({ nowe: id });
      expect(r.dotkniete(id)).toEqual([]);
      expect(r.zad(id)).toMatchObject({ stan: 'Backlog', etykiety: [] });
      expect(r.g.status).toBe('fail');
      expect(r.g.powod).toContain(`${opis}: id z listy ma niepoprawny format, nie sprzątnięte`);
      expect(r.logi.join('\n')).toContain(
        `(g) id z listy pominięte: niepoprawny format id ${opis}`,
      );
      // zadania z biegu nadal sprzątnięte
      const biegowe = r.a.zadania.filter((z) => z.id !== id && z.id !== ID_F);
      expect(biegowe.length).toBeGreaterThan(0);
      for (const z of biegowe) expect(z).toMatchObject({ stan: 'Canceled' });
    };
    it.each([
      ['forma 1: spacja na końcu', `${NOWE} `, '"LEA-9001\\u0020"'],
      ['forma 2: spacja na początku', ` ${NOWE}`, '"\\u0020LEA-9001"'],
      ['forma 3: małe litery', 'lea-9001', '"lea-9001"'],
      ['forma 4: NBSP w środku', 'LEA 9001', '"LEA\\u00a09001"'],
      ['forma 4b: NBSP zamiast myślnika', 'LEA -9001', '"LEA\\u00a0-9001"'],
      ['forma 5: cyrylica Л Е А', 'ЛЕА-9001', '"\\u041b\\u0415\\u0410-9001"'],
      ['forma 5b: cyrylickie А (jedna litera)', 'LEА-9001', '"LE\\u0410-9001"'],
      ['forma 6: puste id', '', '""'],
      ['forma 7: znak nowej linii na końcu', `${NOWE}\n`, '"LEA-9001\\u000a"'],
      ['forma 8: przyrostek x', `${NOWE}x`, '"LEA-9001x"'],
      ['przedrostek x', 'xLEA-9001', '"xLEA-9001"'],
      ['za dużo cyfr', 'LEA-12345678', '"LEA-12345678"'],
      ['zero cyfr', 'LEA-', '"LEA-"'],
    ])('%s → 0 wywołań etykieta/stan, (g) fail z id', async (_n, id, opis) => {
      await odmowa(id, opis);
    });
    it('forma 9: id niebędące napisem (liczba, null) → lista nieczytelna, (g) fail, nowe zadanie nietknięte; bliźniak: napis → anulowane', async () => {
      for (const zle of [5, null]) {
        const r = await bieg({
          nowe: NOWE,
          przerob: {
            1: (o) => o.zadania.push({ id: zle, stan: 'Backlog', tytul: PRZED, etykiety: [] }),
          },
        });
        expect(r.g.status).toBe('fail');
        expect(r.g.powod).toContain('zadanie bez id albo tytułu');
        expect(r.dotkniete(NOWE)).toEqual([]);
        expect(r.wywolania.filter((x) => x[1] === (zle as unknown as string))).toEqual([]);
      }
      const ok = await bieg({ nowe: NOWE });
      expect(ok.dotkniete(NOWE)).toEqual([
        ['etykieta', NOWE, '+test'],
        ['stan', NOWE, 'Canceled'],
      ]);
    });
    it('bliźniak (formy 1-8): dokładne id nowe od migawki z tytułem Preview → anulowane z etykietą test, (g) pass', async () => {
      const r = await bieg({ nowe: NOWE });
      expect(r.dotkniete(NOWE)).toEqual([
        ['etykieta', NOWE, '+test'],
        ['stan', NOWE, 'Canceled'],
      ]);
      expect(r.zad(NOWE)).toMatchObject({ stan: 'Canceled' });
      expect(r.zad(NOWE).etykiety).toContain('test');
      expect(r.g.status).toBe('pass');
    });
    it('bliźniak: wariant id z prawdziwym tytułem (nie nasze zadanie) → ignorowany bez błędu', async () => {
      const r = await bieg({
        przerob: {
          1: (o) =>
            o.zadania.push({ id: `${NOWE} `, stan: 'Backlog', tytul: PRAWDZIWY, etykiety: [] }),
        },
      });
      expect(r.g.status).toBe('pass');
      expect(r.wywolania.filter((x) => x[1] === `${NOWE} `)).toEqual([]);
    });
    it('wariant id istniejący już w migawce (nie nowy) → ignorowany bez błędu', async () => {
      const k = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
      k.a.zadania.push({
        id: `${NOWE} `,
        stan: 'Backlog',
        kto: 'jakub',
        delegat: null,
        tytul: PRZED,
        etykiety: [],
      });
      const w = await biegnij(k.ctx);
      expect(w.wyniki.g.status).toBe('pass');
    });
  });
});

describe('(f): dwie fazy ręczne', () => {
  it('f1: w_kolejce=1, ponowione=0, zero zadań → pass i zapis stanu', async () => {
    const { ctx, a, stany } = kontekst({
      ponow: [{ ponowione: 0, w_kolejce: 1 }],
      nigdyZadania: true,
    });
    const w = await fazaF1(ctx);
    expect(w.status).toBe('pass');
    expect(a.ponowWywolania()).toBe(1);
    expect(stany).toHaveLength(1);
    expect(stany[0]).toMatchObject({ f1: 'pass', f2: null, sha: SHA, ts: TS0 });
  });
  it('f1: kolejka pojawia się z opóźnieniem (ponow: 0, potem 1) → pass po 2 próbach co 5 s', async () => {
    const { ctx, a } = kontekst({
      ponow: [
        { ponowione: 0, w_kolejce: 0 },
        { ponowione: 0, w_kolejce: 1 },
      ],
      nigdyZadania: true,
    });
    const start = ctx.now();
    const w = await fazaF1(ctx);
    expect(w.status).toBe('pass');
    expect(a.ponowWywolania()).toBe(2);
    expect(ctx.now() - start).toBe(5_000);
  });
  it('f1: kolejka dopiero w 3. próbie → pass; zawsze 0 → fail po dokładnie 3 próbach i 10 s', async () => {
    const trzecia = kontekst({
      ponow: [
        { ponowione: 0, w_kolejce: 0 },
        { ponowione: 0, w_kolejce: 0 },
        { ponowione: 0, w_kolejce: 1 },
      ],
      nigdyZadania: true,
    });
    expect((await fazaF1(trzecia.ctx)).status).toBe('pass');
    expect(trzecia.a.ponowWywolania()).toBe(3);
    const nigdy = kontekst({ nigdyZadania: true });
    const start = nigdy.ctx.now();
    const w = await fazaF1(nigdy.ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/w_kolejce=0/);
    expect(nigdy.a.ponowWywolania()).toBe(3);
    expect(nigdy.ctx.now() - start).toBe(10_000);
  });
  it('f1: ponowione>0 od razu (Linear działa) → fail bez ponawiania prób', async () => {
    const { ctx, a } = kontekst({ ponow: [{ ponowione: 1, w_kolejce: 0 }], nigdyZadania: true });
    const w = await fazaF1(ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/ponowione=1/);
    expect(a.ponowWywolania()).toBe(1);
  });
  it('f1: brak E2E_SHA → fail z powodem, zero żądań POST i ponow', async () => {
    const { ctx, a } = kontekst({ nigdyZadania: true }, { E2E_SHA: '' });
    const w = await fazaF1(ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/brak E2E_SHA/);
    expect(a.posty).toHaveLength(0);
  });
  it('f1: w_kolejce=0 (lead nie trafił do kolejki) → fail', async () => {
    const { ctx } = kontekst({ ponow: [{ ponowione: 0, w_kolejce: 0 }], nigdyZadania: true });
    const w = await fazaF1(ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/w_kolejce=0/);
  });
  it('f1: zadanie powstało mimo zepsutego klucza → fail', async () => {
    const { ctx } = kontekst({ ponow: [{ ponowione: 0, w_kolejce: 1 }] });
    const w = await fazaF1(ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/powstało 1 zadań/);
  });
  it('f1: brak sekretu ponow → fail z powodem, bez wyjątku', async () => {
    const { ctx } = kontekst({ nigdyZadania: true }, { E2E_PONOW_SECRET: '' });
    const w = await fazaF1(ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/E2E_PONOW_SECRET/);
  });
  it('f2: jedno ponow → ponowione=1 i dokładnie 1 zadanie → pass', async () => {
    const k = kontekst({ ponow: [{ ponowione: 1, w_kolejce: 0 }] }, {}, STAN_F1_OK);
    // atrapa tworzy zadanie przy ponow przez wcześniejszy POST: dodajemy je ręcznie, jak zrobiłby serwer
    k.a.dodaj('example.com', 'kontakt', ['formularz', 'test']);
    const w = await fazaF2(k.ctx);
    expect(w.status).toBe('pass');
    expect(k.a.ponowWywolania()).toBe(1);
    expect(k.stanAktualny()).toMatchObject({ f2: 'pass' });
  });
  it('f2: dwa zadania (duplikat po ponowieniu) → fail', async () => {
    const k = kontekst({ ponow: [{ ponowione: 1, w_kolejce: 0 }] }, {}, STAN_F1_OK);
    k.a.dodaj('example.com', 'kontakt', ['formularz', 'test'], 2);
    const w = await fazaF2(k.ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/dokładnie 1 zadania, jest 2/);
  });
  it('f2: ponowione=0 (odstęp nie minął) → fail z podpowiedzią', async () => {
    const k = kontekst({ ponow: [{ ponowione: 0, w_kolejce: 1 }] }, {}, STAN_F1_OK);
    const w = await fazaF2(k.ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/ponowione=0.*odstęp/);
  });
  it('f2 bez zaliczonej f1 → fail i ani jednego ponow', async () => {
    for (const stan of [
      null,
      { ...STAN_F1_OK, f1: 'fail' },
      { sha: SHA, ts: TS0 - GODZ, f1: 'pass' }, // bez listy przed
      { f1: 'pass' },
    ]) {
      const k = kontekst({ ponow: [{ ponowione: 1, w_kolejce: 0 }] }, {}, stan);
      const w = await fazaF2(k.ctx);
      expect(w.status).toBe('fail');
      expect(k.a.ponowWywolania()).toBe(0);
    }
  });
  it('f2: stan f1 z innego SHA, starszy niż 24 h, nieczytelny albo {} → fail z powodem i zero ponow', async () => {
    const warianty: Array<[unknown, RegExp]> = [
      [{ ...STAN_F1_OK, sha: 'fff9999' }, /innego SHA/],
      [{ ...STAN_F1_OK, ts: TS0 - 25 * GODZ }, /starszy niż 24 h/],
      [{ nieczytelny: true }, /nieczytelny/],
      [{}, /innego SHA/],
    ];
    for (const [stan, powod] of warianty) {
      const k = kontekst({ ponow: [{ ponowione: 1, w_kolejce: 0 }] }, {}, stan);
      const w = await fazaF2(k.ctx);
      expect(w.status).toBe('fail');
      expect(w.powod).toMatch(powod);
      expect(k.a.ponowWywolania()).toBe(0);
    }
  });
  it('f2: czeka przed ostatnim przeliczeniem — duplikat, który pojawia się po chwili, jest wykryty (V10)', async () => {
    const k = kontekst({ ponow: [{ ponowione: 1, w_kolejce: 0 }] }, {}, STAN_F1_OK);
    k.a.dodaj('example.com', 'kontakt', ['formularz', 'test']);
    const sleepBazowy = k.ctx.sleep;
    let spoznione = false;
    k.ctx.sleep = async (ms: number) => {
      if (!spoznione) {
        spoznione = true; // drugie zadanie pojawia się dopiero po odczekaniu
        k.a.dodaj('example.com', 'kontakt', ['formularz', 'test']);
      }
      return sleepBazowy(ms);
    };
    const w = await fazaF2(k.ctx);
    expect(spoznione).toBe(true);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/dokładnie 1 zadania, jest 2/);
  });
  it('przebieg --faza f1 przechodzi przez strażnika ochrony przed jakimkolwiek POST', async () => {
    const { ctx, a } = kontekst({ bezOchrony: 'alias' }, {}, null);
    const w = await biegnij(ctx, { faza: 'f1' });
    expect(w.kod).toBe(2);
    expect(a.posty).toHaveLength(0);
  });
});

describe('błędy nieobsłużone: maskowanie', () => {
  const env = { CF_ACCESS_CLIENT_ID: ID, CF_ACCESS_CLIENT_SECRET: SEKRET, E2E_PONOW_SECRET: PONOW };
  it('komunikatBledu maskuje wartości z env i wersje URL, tylko pierwsza linia', () => {
    for (const sek of [ID, SEKRET, PONOW]) {
      const t = komunikatBledu(
        new Error(`boom ${sek} i ${encodeURIComponent(sek)}\nDRUGA-LINIA`),
        env,
      );
      expect(t).toBe('e2e: błąd nieobsłużony: boom *** i ***');
      expect(t).not.toContain(sek);
    }
  });
  it('komunikatBledu: nie-Error, brak env, pusty env', () => {
    expect(komunikatBledu('tekst ' + SEKRET, env)).toContain('***');
    expect(komunikatBledu(undefined)).toBe('e2e: błąd nieobsłużony: undefined');
    expect(komunikatBledu(new Error('x'), { CF_ACCESS_CLIENT_ID: '' })).toBe(
      'e2e: błąd nieobsłużony: x',
    );
  });
  it('CLI: nieznany argument z sekretem nie trafia do stderr (kod 2, zero sieci)', () => {
    const r = spawnSync(process.execPath, ['scripts/test-e2e-linear-lead.mjs', `--${SEKRET}`], {
      env: { ...process.env, CF_ACCESS_CLIENT_SECRET: SEKRET },
      encoding: 'utf8',
      timeout: 20_000,
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('nieznany argument: --***');
    expect(r.stderr).not.toContain(SEKRET);
  });
});

describe('MIX-626J2: jedna bramka idDozwolone przy ujściu (g): id ze wszystkich źródeł, fail-closed', () => {
  type Z = { id: unknown; stan: string; etykiety: string[]; tytul: string };
  const TYTUL = '[Preview] Lead: x';
  const zad = (id: unknown, o: Partial<Z> = {}): Z => ({
    id,
    stan: 'Backlog',
    etykiety: [],
    tytul: TYTUL,
    ...o,
  });
  // Atrapa `lin`: lista ZAWSZE pokazuje podane wpisy (także wariant id w każdym odczycie); zapisy trafiają do `zapisy`.
  const srodowisko = (wpisy: Z[]) => {
    const { ctx, logi } = kontekst();
    const zapisy: string[][] = [];
    const wszystkie: string[][] = [];
    ctx.lin = async (args: string[]) => {
      wszystkie.push(args);
      if (args[0] === 'lista')
        return JSON.stringify({
          zadania: wpisy.map((z) => ({ kto: 'jakub', delegat: null, ...z })),
        });
      zapisy.push(args);
      const z = wpisy.find((w) => w.id === args[1]);
      if (z && args[0] === 'etykieta') z.etykiety.push('test');
      if (z && args[0] === 'stan') z.stan = 'Canceled';
      return '';
    };
    return { ctx, logi, zapisy, wszystkie, wpisy };
  };
  const NBSP = String.fromCharCode(0xa0);
  const odmowy: Array<[string, unknown, string, string]> = [
    ['W1: spacja na końcu', 'LEA-12 ', '"LEA-12\\u0020"', 'LEA-12'],
    ['W12: zero wiodące', 'LEA-09001', '"LEA-09001"', 'LEA-9001'],
    ['zero', 'LEA-0', '"LEA-0"', 'LEA-1'],
    ['cyfry pełnej szerokości', 'LEA-\uff11\uff12', '"LEA-\\uff11\\uff12"', 'LEA-12'],
    ['ZWSP w środku', 'LEA-1\u200b2', '"LEA-1\\u200b2"', 'LEA-12'],
    ['BOM na początku', '\ufeffLEA-12', '"\\ufeffLEA-12"', 'LEA-12'],
    ['cyfry arabsko-indyjskie', 'LEA-\u0661\u0662', '"LEA-\\u0661\\u0662"', 'LEA-12'],
    ['małe litery', 'lea-12', '"lea-12"', 'LEA-12'],
    ['nowa linia na końcu', 'LEA-12\n', '"LEA-12\\u000a"', 'LEA-12'],
    ['8 cyfr', 'LEA-12345678', '"LEA-12345678"', 'LEA-1234567'],
    ['NBSP na końcu', `LEA-12${NBSP}`, '"LEA-12\\u00a0"', 'LEA-12'],
    ['wariant NFKC (łącznik pełnej szerokości)', 'LEA\uff0d12', '"LEA\\uff0d12"', 'LEA-12'],
    ['cyrylickie А', 'LE\u0410-12', '"LE\\u0410-12"', 'LEA-12'],
    ['puste', '', '""', 'LEA-12'],
  ];

  describe('sprzatanie: 0 wywołań lin z wariantem, błąd z id, (g) fail; bliźniak: dokładne id sprzątnięte', () => {
    it.each(odmowy)('%s', async (_n, wariant, opis, bliznak) => {
      const s = srodowisko([zad(wariant)]);
      const w = await sprzatanie(s.ctx, new Set([wariant as string]));
      expect(s.zapisy).toEqual([]);
      expect(s.wszystkie.flat()).not.toContain(wariant);
      expect(w.status).toBe('fail');
      expect(w.powod).toContain(`${opis}: id niezgodne z ^LEA-[1-9][0-9]{0,6}$`);
      expect(s.logi.join('\n')).toContain(`(g) id ${opis} odrzucone przez bramkę`);
      const t = srodowisko([zad(bliznak)]);
      const ok = await sprzatanie(t.ctx, new Set([bliznak]));
      expect(t.zapisy).toEqual([
        ['etykieta', bliznak, '+test'],
        ['stan', bliznak, 'Canceled'],
      ]);
      expect(ok.status).toBe('pass');
    });
    it.each(odmowy)(
      '%s: wariant już Canceled z etykietą test na liście → nadal fail (bez wywołań)',
      async (_n, wariant, opis) => {
        const s = srodowisko([zad(wariant, { stan: 'Canceled', etykiety: ['test'] })]);
        const w = await sprzatanie(s.ctx, new Set([wariant as string]));
        expect(s.zapisy).toEqual([]);
        expect(w.status).toBe('fail');
        expect(w.powod).toContain(opis);
      },
    );
    it('forma 12: dokładne id i wariant razem → dokładne sprzątnięte, wariant odrzucony, (g) fail; samo dokładne → pass', async () => {
      const s = srodowisko([zad('LEA-12'), zad('LEA-12 ')]);
      const w = await sprzatanie(s.ctx, new Set(['LEA-12', 'LEA-12 ']));
      expect(s.zapisy).toEqual([
        ['etykieta', 'LEA-12', '+test'],
        ['stan', 'LEA-12', 'Canceled'],
      ]);
      expect(w.status).toBe('fail');
      expect(w.powod).toContain('"LEA-12\\u0020": id niezgodne');
      expect(w.powod).not.toContain('LEA-12:');
      const t = srodowisko([zad('LEA-12')]);
      expect((await sprzatanie(t.ctx, new Set(['LEA-12']))).status).toBe('pass');
    });
    it('forma 11: id niebędące napisem (liczba, null, obiekt) → 0 wywołań, błąd z typem, (g) fail; bliźniak: napis', async () => {
      for (const zle of [12, null, {}, ['LEA-12'], undefined]) {
        const s = srodowisko([zad('LEA-12')]);
        const w = await sprzatanie(s.ctx, new Set([zle as unknown as string]));
        expect(s.zapisy).toEqual([]);
        expect(w.status).toBe('fail');
        expect(w.powod).toContain(`(typ ${typeof zle})`);
      }
      const t = srodowisko([zad('LEA-12')]);
      expect((await sprzatanie(t.ctx, new Set(['LEA-12']))).status).toBe('pass');
    });
    it('id ze stanu f (idStanuF) i z błędów wstępnych też przechodzą bramkę', async () => {
      const s = srodowisko([zad('LEA-12 ')]);
      const w = await sprzatanie(s.ctx, new Set(['LEA-12 ']), new Set(['LEA-12 ']));
      expect(s.zapisy).toEqual([]);
      expect(w.status).toBe('fail');
      expect(w.powod).toContain('"LEA-12\\u0020"');
    });
    it('mieszanka: wiele wariantów + poprawne id → poprawne sprzątnięte, każdy wariant w powodzie, (g) fail', async () => {
      const warianty = odmowy.map((o) => o[1] as string);
      const s = srodowisko([zad('LEA-77'), ...warianty.map((v) => zad(v))]);
      const w = await sprzatanie(s.ctx, new Set(['LEA-77', ...warianty]));
      expect(s.zapisy).toEqual([
        ['etykieta', 'LEA-77', '+test'],
        ['stan', 'LEA-77', 'Canceled'],
      ]);
      expect(w.status).toBe('fail');
      for (const o of odmowy) expect(w.powod).toContain(`${o[2]}: id niezgodne`);
    });
    it('zmiana żądania lin w sprzatanie: brak odczytu listy, gdy wszystkie id odrzucone', async () => {
      const s = srodowisko([zad('LEA-12 ')]);
      await sprzatanie(s.ctx, new Set(['LEA-12 ']));
      expect(s.wszystkie).toEqual([]);
    });
  });

  describe('zmienLin (jedyne wywołanie lin zmieniające dane): bramka bezpośrednio, bez pośrednictwa sprzatanie', () => {
    it.each(odmowy)(
      '%s: etykieta i stan z wariantem → odmowa z id, 0 wywołań',
      async (_n, wariant, opis) => {
        for (const polecenie of [
          ['etykieta', wariant, '+test'],
          ['stan', wariant, 'Canceled'],
        ]) {
          const s = srodowisko([zad(wariant)]);
          await expect(zmienLin(s.ctx, polecenie)).rejects.toThrow(
            `id ${opis} odrzucone przez bramkę`,
          );
          expect(s.wszystkie).toEqual([]);
        }
      },
    );
    it('bliźniak: dokładne id → wywołanie lin przechodzi, z dokładnymi argumentami', async () => {
      const s = srodowisko([zad('LEA-12')]);
      await zmienLin(s.ctx, ['etykieta', 'LEA-12', '+test']);
      await zmienLin(s.ctx, ['stan', 'LEA-12', 'Canceled']);
      expect(s.zapisy).toEqual([
        ['etykieta', 'LEA-12', '+test'],
        ['stan', 'LEA-12', 'Canceled'],
      ]);
    });
    it('brak argumentu id → odmowa (fail-closed)', async () => {
      const s = srodowisko([]);
      await expect(zmienLin(s.ctx, ['stan'])).rejects.toThrow('odrzucone przez bramkę');
      expect(s.wszystkie).toEqual([]);
    });
  });

  describe('całość przez przebieg: id z ctx.utworzone (źródła a/b/d/e) nie omija bramki', () => {
    it.each([
      ['W1: LEA-12 + spacja', 'LEA-12 ', '"LEA-12\\u0020"'],
      ['W12: LEA-09001', 'LEA-09001', '"LEA-09001"'],
      ['cyfry pełnej szerokości', 'LEA-\uff11\uff12', '"LEA-\\uff11\\uff12"'],
      ['wariant NFKC', 'LEA\uff0d12', '"LEA\\uff0d12"'],
    ])(
      '%s: wariant widoczny w każdym odczycie listy → 0 zapisów z nim, (g) fail',
      async (_n, wariant, opis) => {
        const k = kontekst({}, { E2E_BEZ_RESEND: '1' });
        k.a.zadania.push({
          id: wariant,
          stan: 'Backlog',
          kto: 'jakub',
          delegat: null,
          tytul: TYTUL,
          etykiety: [],
        });
        const zapisy: string[][] = [];
        const lin = k.ctx.lin;
        k.ctx.lin = async (args: string[]) => {
          if (args[0] !== 'lista' && args[0] !== 'komentarze') zapisy.push(args);
          return lin(args);
        };
        k.ctx.utworzone.add(wariant);
        const w = await biegnij(k.ctx);
        expect(zapisy.filter((x) => x[1] === wariant)).toEqual([]);
        expect(w.wyniki.g.status).toBe('fail');
        expect(w.wyniki.g.powod).toContain(`${opis}: id niezgodne`);
      },
    );
    it('bliźniak: dokładne id w ctx.utworzone (zadanie z atrapy) → sprzątnięte, (g) pass', async () => {
      const k = kontekst({}, { E2E_BEZ_RESEND: '1' });
      const [id] = k.a.dodaj('example.com', 'kontakt', ['formularz']);
      k.ctx.utworzone.add(id);
      const w = await biegnij(k.ctx);
      expect(w.wyniki.g.status).toBe('pass');
      expect(k.a.zadania.find((z) => z.id === id)).toMatchObject({ stan: 'Canceled' });
    });
  });
});

describe('MIX-626J2: idDozwolone (allowlista ^LEA-[1-9][0-9]{0,6}$)', () => {
  it.each(['LEA-1', 'LEA-12', 'LEA-9001', 'LEA-1234567'])('przepuszcza %s', (id) => {
    expect(idDozwolone(id)).toBe(true);
  });
  it.each([
    'LEA-0',
    'LEA-01',
    'LEA-12 ',
    ' LEA-12',
    'LEA-12\n',
    'lea-12',
    'LEA-12345678',
    'LEA-',
    '',
    'LEA-\uff11\uff12',
    'LEA-\u0661\u0662',
    'LEA-1\u200b2',
    '\ufeffLEA-12',
    'LEA\uff0d12',
  ])('odmawia %j', (id) => {
    expect(idDozwolone(id)).toBe(false);
  });
  it.each([12, null, undefined, {}, ['LEA-12'], true])('odmawia nie-napisu %j', (id) => {
    expect(idDozwolone(id)).toBe(false);
  });
});

describe('MIX-626K: bramki sprawdzane osobno (ujście zmienLin, pętla sprzatanie) i odczyt lin komentarze', () => {
  const NBSP = String.fromCharCode(0xa0);
  // [nazwa, wariant, opis w błędzie, bliźniak dozwolony]
  const WARIANTY: Array<[string, string, string, string]> = [
    ['W1: spacja na końcu', 'LEA-12 ', '"LEA-12\\u0020"', 'LEA-12'],
    ['W12: zero wiodące', 'LEA-09001', '"LEA-09001"', 'LEA-9001'],
    ['--help', '--help', '"--help"', 'LEA-12'],
    ['-h', '-h', '"-h"', 'LEA-1'],
    ['nowa linia', 'LEA-12\n', '"LEA-12\\u000a"', 'LEA-12'],
    ['cyfry pełnej szerokości', 'LEA-１２', '"LEA-\\uff11\\uff12"', 'LEA-12'],
    ['ZWSP w środku', 'LEA-1​2', '"LEA-1\\u200b2"', 'LEA-12'],
    ['małe litery', 'lea-12', '"lea-12"', 'LEA-12'],
    ['8 cyfr', 'LEA-12345678', '"LEA-12345678"', 'LEA-1234567'],
    ['NBSP', `LEA-12${NBSP}`, '"LEA-12\\u00a0"', 'LEA-12'],
  ];
  const NIE_NAPISY: Array<[string, unknown, string]> = [
    ['liczba 12', 12, '(typ number)'],
    ['null', null, '(typ object)'],
    ['obiekt {}', {}, '(typ object)'],
  ];
  const BRAMKA = '(niezgodne z ^LEA-[1-9][0-9]{0,6}$), 0 wywołań lin';

  describe('ujście zmienLin: ctx.utworzone z wariantem, bramka sprzatanie nie uczestniczy', () => {
    it.each(WARIANTY)(
      '%s: etykieta i stan → odmowa z id, 0 wywołań lin; bliźniak przechodzi',
      async (_n, wariant, opis, blizniak) => {
        const { ctx } = kontekst();
        const wywolania: string[][] = [];
        ctx.lin = async (args: string[]) => {
          wywolania.push(args);
          return '';
        };
        ctx.utworzone.add(wariant);
        for (const polecenie of [
          ['etykieta', wariant, '+test'],
          ['stan', wariant, 'Canceled'],
        ]) {
          await expect(zmienLin(ctx, polecenie)).rejects.toThrow(
            `id ${opis} odrzucone przez bramkę ${BRAMKA}`,
          );
        }
        expect(wywolania).toEqual([]);
        ctx.utworzone.add(blizniak);
        await zmienLin(ctx, ['etykieta', blizniak, '+test']);
        await zmienLin(ctx, ['stan', blizniak, 'Canceled']);
        expect(wywolania).toEqual([
          ['etykieta', blizniak, '+test'],
          ['stan', blizniak, 'Canceled'],
        ]);
      },
    );
    it.each(NIE_NAPISY)(
      '%s w ctx.utworzone: odmowa z typem, 0 wywołań; bliźniak: napis',
      async (_n, zle, typ) => {
        const { ctx } = kontekst();
        const wywolania: string[][] = [];
        ctx.lin = async (args: string[]) => {
          wywolania.push(args);
          return '';
        };
        ctx.utworzone.add(zle as string);
        await expect(zmienLin(ctx, ['stan', zle as string, 'Canceled'])).rejects.toThrow(
          `id ${typ} odrzucone przez bramkę ${BRAMKA}`,
        );
        expect(wywolania).toEqual([]);
        await zmienLin(ctx, ['stan', 'LEA-12', 'Canceled']);
        expect(wywolania).toEqual([['stan', 'LEA-12', 'Canceled']]);
      },
    );
  });

  describe('pętla sprzatanie: id dozwolone i wariant razem, dokładny powód i dokładna lista wywołań lin', () => {
    const LISTA = ['lista', '--zespol', 'LEA', '--json', '--limit', '500'];
    it.each(WARIANTY)(
      '%s razem z LEA-12: wariant poza wywołaniami, powód dokładnie jeden wpis',
      async (_n, wariant, opis) => {
        const { ctx, logi } = kontekst();
        const wpisy = [
          {
            id: 'LEA-12',
            stan: 'Backlog',
            etykiety: [] as string[],
            tytul: '[Preview] Lead: x',
            kto: 'jakub',
            delegat: null,
          },
          {
            id: wariant,
            stan: 'Backlog',
            etykiety: [] as string[],
            tytul: '[Preview] Lead: x',
            kto: 'jakub',
            delegat: null,
          },
        ];
        const wywolania: string[][] = [];
        ctx.lin = async (args: string[]) => {
          wywolania.push(args);
          if (args[0] === 'lista') return JSON.stringify({ zadania: wpisy });
          const z = wpisy.find((w) => w.id === args[1]);
          if (z && args[0] === 'etykieta') z.etykiety.push('test');
          if (z && args[0] === 'stan') z.stan = 'Canceled';
          return '';
        };
        const w = await sprzatanie(ctx, new Set(['LEA-12', wariant]));
        expect(wywolania).toEqual([
          LISTA,
          ['etykieta', 'LEA-12', '+test'],
          ['stan', 'LEA-12', 'Canceled'],
          LISTA,
        ]);
        expect(w.status).toBe('fail');
        expect(w.powod).toBe(
          `${opis}: id niezgodne z ^LEA-[1-9][0-9]{0,6}$, nie sprzątnięte (0 wywołań lin)`,
        );
        expect(logi.filter((l) => l.includes('odrzucone przez bramkę'))).toEqual([
          `(g) id ${opis} odrzucone przez bramkę, nie sprzątnięte`,
        ]);
      },
    );
    it('bliźniak: samo dokładne id → pass, te same wywołania', async () => {
      const { ctx } = kontekst();
      const wpisy = [
        {
          id: 'LEA-12',
          stan: 'Backlog',
          etykiety: [] as string[],
          tytul: 'x',
          kto: 'jakub',
          delegat: null,
        },
      ];
      const wywolania: string[][] = [];
      ctx.lin = async (args: string[]) => {
        wywolania.push(args);
        if (args[0] === 'lista') return JSON.stringify({ zadania: wpisy });
        if (args[0] === 'etykieta') wpisy[0].etykiety.push('test');
        if (args[0] === 'stan') wpisy[0].stan = 'Canceled';
        return '';
      };
      const w = await sprzatanie(ctx, new Set(['LEA-12']));
      expect(w.status).toBe('pass');
      expect(wywolania).toEqual([
        LISTA,
        ['etykieta', 'LEA-12', '+test'],
        ['stan', 'LEA-12', 'Canceled'],
        LISTA,
      ]);
    });
  });

  describe('lin komentarze (odczyt): ujście komentarzeZadania, tylko id z idDozwolone', () => {
    it.each(WARIANTY)(
      '%s: 0 wywołań lin, błąd z id; bliźniak odczytany jak dotąd',
      async (_n, wariant, opis, blizniak) => {
        const wywolania: string[][] = [];
        const lin = async (args: string[]) => {
          wywolania.push(args);
          return '[]';
        };
        await expect(komentarzeZadania(lin, wariant)).rejects.toThrow(
          `id ${opis} odrzucone przez bramkę ${BRAMKA}`,
        );
        expect(wywolania).toEqual([]);
        expect(await komentarzeZadania(lin, blizniak)).toEqual([]);
        expect(wywolania).toEqual([['komentarze', blizniak, '--json']]);
      },
    );
    it.each(NIE_NAPISY)('%s: 0 wywołań, błąd z typem', async (_n, zle, typ) => {
      const wywolania: string[][] = [];
      const lin = async (args: string[]) => {
        wywolania.push(args);
        return '[]';
      };
      await expect(komentarzeZadania(lin, zle as string)).rejects.toThrow(
        `id ${typ} odrzucone przez bramkę`,
      );
      expect(wywolania).toEqual([]);
    });
    it('brak id (undefined) → odmowa', async () => {
      const wywolania: string[][] = [];
      await expect(
        komentarzeZadania(
          async (a: string[]) => (wywolania.push(a), '[]'),
          undefined as unknown as string,
        ),
      ).rejects.toThrow('odrzucone przez bramkę');
      expect(wywolania).toEqual([]);
    });
  });

  describe('przypadek (e): id zadania z listy spoza allowlisty → fail z id, 0 wywołań komentarze, bez drugiego POST', () => {
    // Atrapa `lin` pokazuje w liście wariant zamiast prawdziwego id; komentarze z wariantem są liczone (i przekazywane dalej).
    const biegE = async (wariant: string | null) => {
      const k = kontekst({}, { E2E_BEZ_RESEND: '1' });
      const baza = k.ctx.lin;
      const komentarzeZ: Array<string> = [];
      const wszystkie: string[][] = [];
      let prawdziwe: string | null = null;
      k.ctx.lin = async (args: string[]) => {
        wszystkie.push(args);
        if (args[0] === 'komentarze') {
          komentarzeZ.push(args[1]);
          return baza([
            'komentarze',
            args[1] === wariant && prawdziwe ? prawdziwe : args[1],
            '--json',
          ]);
        }
        const out = await baza(args);
        if (args[0] !== 'lista' || wariant === null) return out;
        const obj = JSON.parse(out);
        for (const z of obj.zadania) {
          prawdziwe = z.id;
          z.id = wariant;
        }
        return JSON.stringify(obj);
      };
      const w = await przypadekE(k.ctx);
      const posty = k.a.posty.filter((p) => p === '/api/contact-submit').length;
      return { w, komentarzeZ, wszystkie, posty };
    };
    it.each(WARIANTY)(
      '%s: (e) fail, powód z id, 0 wywołań komentarze',
      async (_n, wariant, opis) => {
        const r = await biegE(wariant);
        expect(r.w.status).toBe('fail');
        expect(r.w.powod).toBe(`komentarze: id ${opis} odrzucone przez bramkę ${BRAMKA}`);
        expect(r.komentarzeZ).toEqual([]);
        expect(r.posty).toBe(1);
      },
    );
    it('bliźniak: dokładne id z listy → komentarze czytane jak dotąd, (e) pass, 2 POST', async () => {
      const r = await biegE(null);
      expect(r.w.status).toBe('pass');
      expect(r.komentarzeZ.length).toBeGreaterThan(0);
      expect(r.komentarzeZ.every((id) => /^LEA-[1-9][0-9]{0,6}$/.test(id))).toBe(true);
      expect(r.posty).toBe(2);
    });
  });
});

// ---------------------------------------------------------------------------------------------
// (c) na Preview ze ścisłym Turnstile (MIX-1556): skip tylko dla dokładnej odmowy host/akcja
// ---------------------------------------------------------------------------------------------

const ODMOWA_TS = (reason: string) => ({ error: 'Weryfikacja antybotowa nieudana.', reason });
const JSON_TYP = 'application/json';

describe('decyzjaPominieciaC (allowlista, fail-closed)', () => {
  const scisla = (reason = 'captcha: hostname', o: Record<string, unknown> = {}) => ({
    status: 403,
    location: null,
    typ: JSON_TYP,
    json: ODMOWA_TS(reason),
    ...o,
  });
  it('dozwolone: 403 host albo akcja, także z charset → skip z dokładną linią powodu', () => {
    for (const o of [
      scisla('captcha: hostname'),
      scisla('captcha: action'),
      scisla('captcha: hostname', { typ: 'application/json; charset=utf-8' }),
      scisla('captcha: action', { location: undefined }),
    ])
      expect(decyzjaPominieciaC(o)).toEqual({ pomin: true, powod: POWOD_POMINIECIA_C });
    expect(POWOD_POMINIECIA_C).toBe(
      'Preview ze ścisłym Turnstile (token testowy odrzucony), Recenzja L-SYS MIX-626',
    );
  });
  // [forma, odpowiedź, oczekiwany powód odmowy]
  const odmowy: Array<[string, unknown, string]> = [
    ['F1 brak odpowiedzi', undefined, 'brak odpowiedzi'],
    [
      'F2 limit czasu / błąd sieci',
      { blad: 'The operation was aborted due to timeout' },
      'błąd żądania',
    ],
    [
      'F3 500 z kształtem odmowy',
      scisla('captcha: hostname', { status: 500 }),
      'kod 500 zamiast 403',
    ],
    [
      'F4 401 z kształtem odmowy',
      scisla('captcha: hostname', { status: 401 }),
      'kod 401 zamiast 403',
    ],
    [
      'F5 429 z kształtem odmowy',
      scisla('captcha: action', { status: 429 }),
      'kod 429 zamiast 403',
    ],
    [
      'F6 403 z pustym ciałem',
      { status: 403, location: null, typ: JSON_TYP, json: null },
      '403 bez obiektu JSON',
    ],
    [
      'F7 403 strona Access (HTML)',
      { status: 403, location: null, typ: 'text/html', json: null },
      '403 bez typu application/json',
    ],
    [
      'F8 403 JSON podany jako text/html (podmiana nagłówka)',
      scisla('captcha: hostname', { typ: 'text/html' }),
      '403 bez typu application/json',
    ],
    [
      'F9 403 typ application/json-evil',
      scisla('captcha: hostname', { typ: 'application/json-evil' }),
      '403 bez typu application/json',
    ],
    [
      'F10 403 bez nagłówka typu',
      scisla('captcha: hostname', { typ: null }),
      '403 bez typu application/json',
    ],
    [
      'F11 403 z Location (przekierowanie Access)',
      scisla('captcha: hostname', { location: 'https://x.cloudflareaccess.com/' }),
      '403 z nagłówkiem Location',
    ],
    [
      'F12 403 tablica JSON',
      scisla('captcha: hostname', { json: [ODMOWA_TS('captcha: hostname')] }),
      '403 bez obiektu JSON',
    ],
    [
      'F13 403 dodatkowe pole',
      scisla('captcha: hostname', { json: { ...ODMOWA_TS('captcha: hostname'), skip: true } }),
      '403 o innym kształcie niż odmowa Turnstile',
    ],
    [
      'F14 403 bez reason',
      scisla('captcha: hostname', { json: { error: 'Weryfikacja antybotowa nieudana.' } }),
      '403 o innym kształcie niż odmowa Turnstile',
    ],
    [
      'F15 403 honeypot „Spam detected”',
      scisla('x', { json: { error: 'Spam detected', reason: 'captcha: hostname' } }),
      '403 z innym komunikatem niż odmowa Turnstile',
    ],
    [
      'F16 403 komunikat ze spacją',
      scisla('x', {
        json: { error: 'Weryfikacja antybotowa nieudana. ', reason: 'captcha: hostname' },
      }),
      '403 z innym komunikatem niż odmowa Turnstile',
    ],
    [
      'F17 403 captcha: token (błąd skryptu)',
      scisla('captcha: token'),
      '403 Turnstile z powodem spoza listy (host/akcja)',
    ],
    [
      'F18 403 captcha: odrzucony (inny sekret)',
      scisla('captcha: odrzucony'),
      '403 Turnstile z powodem spoza listy (host/akcja)',
    ],
    [
      'F19 403 captcha: brak sekretu',
      scisla('captcha: brak sekretu'),
      '403 Turnstile z powodem spoza listy (host/akcja)',
    ],
    [
      'F20 403 captcha: siteverify niedostępny',
      scisla('captcha: siteverify niedostępny'),
      '403 Turnstile z powodem spoza listy (host/akcja)',
    ],
    [
      'F21 403 wielkość liter w powodzie',
      scisla('Captcha: hostname'),
      '403 Turnstile z powodem spoza listy (host/akcja)',
    ],
    [
      'F22 403 powód ze spacją na końcu',
      scisla('captcha: hostname '),
      '403 Turnstile z powodem spoza listy (host/akcja)',
    ],
    [
      'F23 403 powód jako tablica',
      scisla('x', {
        json: { error: 'Weryfikacja antybotowa nieudana.', reason: ['captcha: hostname'] },
      }),
      '403 Turnstile z powodem spoza listy (host/akcja)',
    ],
  ];
  it.each(odmowy)('%s → nie pomija, powód odmowy', (_f, o, powod) => {
    expect(decyzjaPominieciaC(o as Parameters<typeof decyzjaPominieciaC>[0])).toEqual({
      pomin: false,
      powod,
    });
  });
});

describe('przebieg: (c) przy ścisłym Turnstile (MIX-1556)', () => {
  const ENV = { E2E_BEZ_RESEND: '1' };
  const odp = (obj: unknown, status: number, typ = 'application/json') =>
    new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': typ } });
  const zQuote = (fn: NonNullable<Opcje['nadpiszPost']>[string]) => ({
    nadpiszPost: { '/api/estimation/public-quote': fn },
  });

  it('403 host/akcja z public-quote → (c) skip z linią powodu, kod 0, reszta 6/6 pass, zero zadań kalkulatora', async () => {
    for (const reason of ['captcha: hostname', 'captcha: action']) {
      const { ctx, a, logi } = kontekst(
        zQuote(() => odp(ODMOWA_TS(reason), 403)),
        ENV,
        STAN_F_OK,
      );
      const w = await biegnij(ctx);
      expect(w.wyniki.c).toEqual({ status: 'skip', powod: POWOD_POMINIECIA_C });
      expect(w.kod).toBe(0);
      expect(w.linia).toBe('6/7, pominięte: c (a=pass b=pass c=skip d=pass e=pass f=pass g=pass)');
      expect(a.zadania.some((z) => z.tytul.includes('kalkulator'))).toBe(false);
      expect(logi.join('\n')).toContain(`(c) skip ${POWOD_POMINIECIA_C}`);
    }
  });

  // [forma, nadpisanie public-quote, oczekiwany fragment powodu (c)]
  const porazki: Array<[string, NonNullable<Opcje['nadpiszPost']>[string], RegExp]> = [
    [
      'F24 500',
      () => odp(ODMOWA_TS('captcha: hostname'), 500),
      /^POST: HTTP 500 \(kod 500 zamiast 403\)$/,
    ],
    [
      'F25 403 innego kształtu (captcha: token)',
      () => odp(ODMOWA_TS('captcha: token'), 403),
      /^POST: HTTP 403 \(403 Turnstile z powodem spoza listy/,
    ],
    [
      'F26 403 z pustym ciałem',
      () => new Response(null, { status: 403 }),
      /^POST: HTTP 403 \(403 bez typu application\/json\)$/,
    ],
    [
      'F27 403 HTML Access',
      () =>
        new Response('<html>Access</html>', {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        }),
      /^POST: HTTP 403 \(403 bez typu/,
    ],
    [
      'F28 limit czasu',
      () =>
        Promise.reject(
          new DOMException('The operation was aborted due to timeout', 'TimeoutError'),
        ),
      /^POST: .*timeout \(błąd żądania\)$/,
    ],
    ['F29 200 bez zadania', () => odp({ status: 'ok' }, 200), /^brak zadania w limicie czasu$/],
    [
      'F30 200 z zadaniem o złym tytule',
      (dodaj) => {
        dodaj('example.com', 'kalkulator', ['kalkulator', 'test']);
        return odp({ status: 'ok' }, 200);
      },
      /^brak zadania w limicie czasu$/,
    ],
  ];
  it.each(porazki)('%s → (c) fail z powodem, kod 1', async (_f, fn, powod) => {
    const { ctx } = kontekst(zQuote(fn), ENV, STAN_F_OK);
    const w = await biegnij(ctx);
    expect(w.wyniki.c.status).toBe('fail');
    expect(w.wyniki.c.powod).toMatch(powod);
    expect(w.kod).toBe(1);
    expect(w.linia).toMatch(/PORAŻKA: c\b/);
  });

  it('F31 ta sama odmowa ścisłego Turnstile na (a) formularzu → (a) fail, nie skip (pominięcie tylko dla (c))', async () => {
    const { ctx } = kontekst(
      { nadpiszPost: { '/api/contact-submit': () => odp(ODMOWA_TS('captcha: hostname'), 403) } },
      ENV,
      STAN_F_OK,
    );
    const w = await biegnij(ctx);
    expect(w.wyniki.a).toEqual({ status: 'fail', powod: 'POST: HTTP 403' });
    expect(w.wyniki.c.status).toBe('pass');
    expect(w.kod).toBe(1);
  });
});
