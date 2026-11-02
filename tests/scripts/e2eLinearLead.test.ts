// Testy czystych części skryptu e2e leady → Linear oraz przebiegu na atrapach (bez sieci, bez `lin`).
import { describe, it, expect } from 'vitest';
import {
  adresE2E,
  czekaj,
  czyUruchomicB,
  czytajArgumenty,
  decyzjaDostepu,
  decyzjaOchrony,
  etykietyPrzypadku,
  fazaF1,
  fazaF2,
  maskuj,
  pobierzZadania,
  podpisPonow,
  podsumuj,
  przebieg,
  sprawdzAdresPreview,
  sprawdzOchrone,
  tytulPasuje,
  wynikF,
  zbudujKontekst,
  zbudujRaport,
} from '../../scripts/test-e2e-linear-lead.mjs';
import { podpiszZapytanie } from '../../functions/api/crm/_podpis';

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
  drugiLeadTworzyZadanie?: boolean;
  nigdyZadania?: boolean;
  ponow?: Array<Record<string, number>>;
  dlaKazdegoPostuZadan?: number;
  zepsutaLista?: boolean;
  kto?: string;
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
    if (u.pathname === '/api/contact-submit') {
      const b = JSON.parse(String(init.body));
      const email: string = b.lead.email;
      const domena = email.split('@')[1];
      const firmowa = domena !== 'gmail.com' ? domena : null;
      if (widziane.has(email)) {
        const pierwsze = zadania.find((z) => z.id === widziane.get(email));
        if (opcje.drugiLeadTworzyZadanie) dodaj(firmowa, 'kontakt', ['formularz', 'test']);
        else if (pierwsze) {
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

function kontekst(opcje: Opcje = {}, env: Record<string, string> = {}, stan: unknown = null) {
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

const STAN_F_OK = { f1: 'pass', f2: 'pass', zadanie: 'LEA-11', zadania: ['LEA-11'] };

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
  it('pominięte (b) albo brak (f) = 3, nie 0', () => {
    expect(podsumuj({ ...wszystkie(), b: { status: 'skip' } })).toMatchObject({ kod: 3, ok: 6 });
    expect(podsumuj({ ...wszystkie(), f: { status: 'brak' } }).kod).toBe(3);
    expect(podsumuj({ ...wszystkie(), f: undefined }).kod).toBe(3);
  });
  it('nieznany status, puste wejście i porażka obok pominiętego = fail-closed', () => {
    expect(podsumuj({ ...wszystkie(), a: { status: 'ok' } }).kod).toBe(1);
    expect(podsumuj({}).kod).toBe(3);
    expect(podsumuj(undefined).kod).toBe(3);
    expect(podsumuj({ ...wszystkie(), b: { status: 'skip' }, c: { status: 'fail' } }).kod).toBe(1);
  });
  it('wynikF: pass tylko po f1 i f2', () => {
    expect(wynikF(null).status).toBe('brak');
    expect(wynikF({ f1: 'pass' }).status).toBe('brak');
    expect(wynikF({ f1: 'fail' }).status).toBe('fail');
    expect(wynikF({ f1: 'pass', f2: 'pass', zadanie: 'LEA-3' }).status).toBe('pass');
    expect(wynikF({ f1: 'pass', f2: 'fail' }).status).toBe('brak');
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
  it('jest zgodny z podpisem po stronie funkcji (crm/_podpis.ts)', async () => {
    const czas = '1760000000';
    const nonce = '123e4567-e89b-42d3-a456-426614174000';
    expect(podpisPonow(PONOW, czas, nonce)).toBe(
      await podpiszZapytanie(PONOW, czas, nonce, 'POST', '/api/leady/ponow', 'leady-ponow:v1:'),
    );
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

describe('strażnik: adres Preview', () => {
  it('przepuszcza alias i link z hashem', () => {
    expect(sprawdzAdresPreview(BAZA)).toMatchObject({
      ok: true,
      host: 'dev.mixturemarketing-stona.pages.dev',
    });
    expect(sprawdzAdresPreview(HASH).ok).toBe(true);
    expect(sprawdzAdresPreview('https://DEV.Mixturemarketing-Stona.Pages.Dev/x').host).toBe(
      'dev.mixturemarketing-stona.pages.dev',
    );
  });
  const odmowy: Array<[string, unknown, RegExp]> = [
    ['pusty', '', /pusty/],
    ['spacje', '   ', /pusty/],
    ['nie-tekst', undefined, /pusty/],
    ['http://', 'http://dev.mixturemarketing-stona.pages.dev', /https/],
    ['bez schematu', 'dev.mixturemarketing-stona.pages.dev', /niepoprawny/],
    ['produkcja pages.dev', 'https://mixturemarketing-stona.pages.dev', /produkcji/],
    ['produkcja domena', 'https://mixturemarketing.pl', /produkcji/],
    ['produkcja www', 'https://www.mixturemarketing.pl', /produkcji/],
    ['subdomena produkcji', 'https://dev.mixturemarketing.pl', /produkcji/],
    ['obcy host', 'https://evil.tld', /pages\.dev/],
    ['pages.dev w ścieżce', 'https://evil.tld/x.pages.dev', /pages\.dev/],
    ['lookalike pages.dev.evil.tld', 'https://dev.pages.dev.evil.tld', /pages\.dev/],
    ['dane logowania', 'https://x@dev.mixturemarketing-stona.pages.dev', /dane logowania/],
    ['port', 'https://dev.mixturemarketing-stona.pages.dev:8443', /port/],
    ['apex pages.dev', 'https://pages.dev', /pages\.dev/],
  ];
  for (const [nazwa, wejscie, powod] of odmowy) {
    it(`odmowa: ${nazwa}`, () => {
      const r = sprawdzAdresPreview(wejscie as string);
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
  it('odmowa gdy hash i alias to ten sam host', async () => {
    const { ctx } = kontekst({}, { E2E_HASH_URL: BAZA });
    const r = await sprawdzOchrone(ctx);
    expect(r.ok).toBe(false);
    expect(r.powody.join(' ')).toMatch(/ten sam host/);
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
    const w = await przebieg(ctx);
    expect(w.kod).toBe(2);
    expect(logi.join('\n')).toMatch(/Preview bez ochrony: .*alias dev\./);
    expect(a.posty).toHaveLength(0);
    expect(a.zadaniaFetch.every((z) => z.startsWith('GET'))).toBe(true);
  });
  it('7/7: a–e, g i fazy f zapisane; zadania Canceled z etykietą test; kod 0', async () => {
    const stanF = STAN_F_OK;
    const { ctx, a, raporty } = kontekst({}, { E2E_BEZ_RESEND: '1' }, stanF);
    const w = await przebieg(ctx);
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
  it('bez E2E_BEZ_RESEND (b) pominięte: kod 3, żaden adres gmail nie wysłany', async () => {
    const { ctx, a, logi } = kontekst({}, {}, STAN_F_OK);
    const w = await przebieg(ctx);
    expect(w.kod).toBe(3);
    expect(w.linia).toMatch(/6\/7, niepełny: b/);
    expect(a.zadania.some((z) => z.tytul.includes('osoba prywatna'))).toBe(false);
    expect(logi.join('\n')).toMatch(/\(b\) skip/);
  });
  it('brak zapisanych faz f: kod 3 i nic w (f)', async () => {
    const { ctx } = kontekst({}, { E2E_BEZ_RESEND: '1' }, null);
    const w = await przebieg(ctx);
    expect(w.kod).toBe(3);
    expect(w.wyniki.f.status).toBe('brak');
  });
  it('(e): drugi lead tworzy drugie zadanie → porażka, kod 1, sprzątanie nadal działa', async () => {
    const { ctx, a } = kontekst(
      { drugiLeadTworzyZadanie: true },
      { E2E_BEZ_RESEND: '1' },
      STAN_F_OK,
    );
    const w = await przebieg(ctx);
    expect(w.wyniki.e.status).toBe('fail');
    expect(w.wyniki.e.powod).toMatch(/drugi lead utworzył zadanie|komentarz/);
    expect(w.kod).toBe(1);
    expect(a.zadania.every((z) => z.stan === 'Canceled')).toBe(true);
  });
  it('zadanie nie pojawia się w limicie czasu: fail, kod 1, bez wyjątku', async () => {
    const { ctx } = kontekst({ nigdyZadania: true }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await przebieg(ctx);
    expect(w.wyniki.a).toMatchObject({ status: 'fail' });
    expect(w.wyniki.a.powod).toMatch(/limicie czasu/);
    expect(w.kod).toBe(1);
  });
  it('dwa zadania zamiast jednego w (a): fail', async () => {
    const { ctx } = kontekst({ dlaKazdegoPostuZadan: 2 }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await przebieg(ctx);
    expect(w.wyniki.a.status).toBe('fail');
    expect(w.wyniki.a.powod).toMatch(/oczekiwano 1 zadania, jest 2/);
  });
  it('zadanie przypisane do kogoś innego niż Jakub: fail', async () => {
    const { ctx } = kontekst({ kto: 'karol' }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await przebieg(ctx);
    expect(w.wyniki.a.powod).toMatch(/nie jest przypisane do jakub/);
  });
  it('lin zwraca śmieci: przypadki padają (fail-closed), kod 1', async () => {
    const { ctx } = kontekst({ zepsutaLista: true }, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    const w = await przebieg(ctx);
    expect(w.wyniki.a.status).toBe('fail');
    expect(w.wyniki.g.status).toBe('fail');
    expect(w.kod).toBe(1);
  });
  it('sekrety nie trafiają do logów ani raportu', async () => {
    const { ctx, logi, raporty } = kontekst({}, { E2E_BEZ_RESEND: '1' }, STAN_F_OK);
    await przebieg(ctx);
    const calosc = [...logi, ...raporty].join('\n');
    for (const s of [ID, SEKRET, PONOW]) expect(calosc).not.toContain(s);
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
    expect(stany[0]).toMatchObject({ f1: 'pass' });
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
    const k = kontekst(
      { ponow: [{ ponowione: 1, w_kolejce: 0 }] },
      {},
      { f1: 'pass', przed: [], zadania: [] },
    );
    // atrapa tworzy zadanie przy ponow przez wcześniejszy POST: dodajemy je ręcznie, jak zrobiłby serwer
    k.a.dodaj('example.com', 'kontakt', ['formularz', 'test']);
    const w = await fazaF2(k.ctx);
    expect(w.status).toBe('pass');
    expect(k.a.ponowWywolania()).toBe(1);
    expect(k.stanAktualny()).toMatchObject({ f2: 'pass' });
  });
  it('f2: dwa zadania (duplikat po ponowieniu) → fail', async () => {
    const k = kontekst(
      { ponow: [{ ponowione: 1, w_kolejce: 0 }] },
      {},
      { f1: 'pass', przed: [], zadania: [] },
    );
    k.a.dodaj('example.com', 'kontakt', ['formularz', 'test'], 2);
    const w = await fazaF2(k.ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/dokładnie 1 zadania, jest 2/);
  });
  it('f2: ponowione=0 (odstęp nie minął) → fail z podpowiedzią', async () => {
    const k = kontekst(
      { ponow: [{ ponowione: 0, w_kolejce: 1 }] },
      {},
      { f1: 'pass', przed: [], zadania: [] },
    );
    const w = await fazaF2(k.ctx);
    expect(w.status).toBe('fail');
    expect(w.powod).toMatch(/ponowione=0.*odstęp/);
  });
  it('f2 bez zaliczonej f1 → fail i ani jednego ponow', async () => {
    for (const stan of [null, { f1: 'fail', przed: [] }, { f1: 'pass' }]) {
      const k = kontekst({ ponow: [{ ponowione: 1, w_kolejce: 0 }] }, {}, stan);
      const w = await fazaF2(k.ctx);
      expect(w.status).toBe('fail');
      expect(k.a.ponowWywolania()).toBe(0);
    }
  });
  it('przebieg --faza f1 przechodzi przez strażnika ochrony przed jakimkolwiek POST', async () => {
    const { ctx, a } = kontekst({ bezOchrony: 'alias' }, {}, null);
    const w = await przebieg(ctx, { faza: 'f1' });
    expect(w.kod).toBe(2);
    expect(a.posty).toHaveLength(0);
  });
});
