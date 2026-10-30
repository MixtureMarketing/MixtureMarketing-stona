import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  domenaFirmowa,
  tytulZadania,
  opisZadania,
  trescProsby,
  zglosLead,
  zglosLeadWTle,
  komentarzKroku,
  drenujKolejke,
  DOMENY_PRYWATNE,
  ODSTEPY_MIN,
  type LeadRow,
  type LinearEnv,
} from './_linear';
import { d1Sqlite } from '../../tests/helpers/d1Sqlite';
import { createFakeKV } from '../../tests/helpers/fakeD1';

// ---------------------------------------------------------------------------------------------
// Atrapa API Lineara: odpowiedzi po operationName, każde wywołanie trafia do `wyw`.
// ---------------------------------------------------------------------------------------------

type Json = Record<string, unknown>;
interface Wywolanie {
  op: string;
  vars: Json;
  auth: string;
}
type Spec =
  | { status?: number; headers?: Record<string, string>; json?: unknown }
  | 'siec'
  | 'timeout'
  | (() => Promise<Spec> | Spec);

let wyw: Wywolanie[] = [];
let kolejki: Record<string, Spec[]> = {};
let opoznienie: () => Promise<void> = async () => {};
let logi: string[] = [];

const ETYKIETY = ['formularz', 'audyt', 'kalkulator', 'bez-firmy', 'test'];

function domyslna(op: string, vars: Json): unknown {
  const input = (vars.input ?? {}) as Json;
  switch (op) {
    case 'Etykiety':
      return {
        team: {
          id: 'team-1',
          key: 'LEA',
          labels: { nodes: ETYKIETY.map((n) => ({ id: `lab-${n}`, name: n })) },
        },
      };
    case 'KlientUpsert':
      return {
        customerUpsert: {
          success: true,
          customer: { id: `cust-${input.externalId}`, name: input.name },
        },
      };
    case 'ZadanieUtworz':
      return {
        issueCreate: {
          success: true,
          issue: {
            id: input.id,
            identifier: 'LEA-1',
            url: 'https://linear.app/mixture/issue/LEA-1',
          },
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

async function rozwin(spec: Spec): Promise<Exclude<Spec, () => unknown>> {
  return typeof spec === 'function' ? rozwin(await spec()) : spec;
}

beforeEach(() => {
  wyw = [];
  kolejki = {};
  logi = [];
  opoznienie = async () => {};
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T10:00:00Z'));
  for (const k of ['log', 'warn', 'error', 'info'] as const) {
    vi.spyOn(console, k).mockImplementation((...a: unknown[]) => {
      logi.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
    });
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      expect(String(url)).toBe('https://api.linear.app/graphql');
      const body = JSON.parse(String(init?.body)) as { operationName: string; variables: Json };
      const h = new Headers(init?.headers);
      wyw.push({
        op: body.operationName,
        vars: body.variables,
        auth: h.get('Authorization') ?? '',
      });
      await opoznienie();
      const spec = kolejki[body.operationName]?.shift();
      if (spec === undefined) {
        return new Response(
          JSON.stringify({ data: domyslna(body.operationName, body.variables) }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      const s = await rozwin(spec);
      if (s === 'siec') throw new TypeError('fetch failed');
      if (s === 'timeout') throw new DOMException('The operation timed out', 'TimeoutError');
      return new Response(JSON.stringify(s.json ?? {}), {
        status: s.status ?? 200,
        headers: { 'Content-Type': 'application/json', ...(s.headers ?? {}) },
      });
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------------------------
// Pomocnicze
// ---------------------------------------------------------------------------------------------

const KLUCZ_API = 'lin_api_TAJNY_KLUCZ_0123456789abcdef';
const MIGRACJE = [
  '0001_init.sql',
  '0002_leads_add_source_company.sql',
  '0009_leads_updated_at.sql',
];

function srodowisko(opcje: { migracje?: string[]; env?: Partial<LinearEnv> } = {}) {
  const { DB, db } = d1Sqlite(opcje.migracje ?? [...MIGRACJE, '0010_linear_leady.sql']);
  const kv = createFakeKV();
  const env = {
    DB,
    CACHE: kv,
    LINEAR_API_KEY: KLUCZ_API,
    LINEAR_TEAM_LEADY_ID: 'team-1',
    LINEAR_PROWADZACY_ID: 'user-jakub',
    ...opcje.env,
  } as unknown as LinearEnv;
  return { env, db, kv };
}
type Db = ReturnType<typeof srodowisko>['db'];

let licznik = 0;
function dodajLead(db: Db, over: Partial<LeadRow> & Record<string, unknown> = {}): LeadRow {
  licznik += 1;
  const lead = {
    id: `00000000-0000-4000-8000-${String(licznik).padStart(12, '0')}`,
    email: 'jan.kowalski@firma.pl',
    name: 'Jan Kowalski',
    phone: '+48 600 100 200',
    service_type: 'web',
    source: 'website',
    source_url: 'https://mixturemarketing.pl/kontakt',
    current_step: 1,
    ...over,
  } as LeadRow & Record<string, unknown>;
  db.prepare(
    `INSERT INTO leads (id, email, name, phone, company, website, budget, message, service_type,
       package_name, details, source, source_url, current_step) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    lead.id,
    lead.email,
    lead.name ?? null,
    lead.phone ?? null,
    lead.company ?? null,
    lead.website ?? null,
    lead.budget ?? null,
    lead.message ?? null,
    lead.service_type ?? null,
    lead.package_name ?? null,
    lead.details ?? null,
    lead.source ?? 'website',
    lead.source_url ?? null,
    lead.current_step ?? 1,
  );
  return lead;
}

interface Wiersz {
  lead_id: string;
  stan: string;
  issue_id: string | null;
  identifier: string | null;
  url: string | null;
  customer_request: number;
  duplikat_of: string | null;
  proby: number;
  ostatni_blad: string | null;
  nastepna_proba: string;
  updated_at: string;
}
const wiersz = (db: Db, id: string) =>
  db.prepare('SELECT * FROM linear_leady WHERE lead_id = ?').get(id) as unknown as
    Wiersz | undefined;
const liczWierszy = (db: Db) =>
  Number((db.prepare('SELECT COUNT(*) AS n FROM linear_leady').get() as { n: number }).n);

const ustaw = (db: Db, id: string, kolumny: Record<string, string | number | null>) =>
  db
    .prepare(
      `UPDATE linear_leady SET ${Object.keys(kolumny)
        .map((k) => `${k} = ?`)
        .join(', ')} WHERE lead_id = ?`,
    )
    .run(...Object.values(kolumny), id);

const utc = (s: string) => Date.parse(`${s.replace(' ', 'T')}Z`);
const opy = () => wyw.map((w) => w.op);
const input = (op: string) => wyw.find((w) => w.op === op)?.vars.input as Json;
const teraz = () => Date.now();
const minuty = (m: number) => m * 60_000;

// ---------------------------------------------------------------------------------------------
// 1. Czyste funkcje
// ---------------------------------------------------------------------------------------------

describe('domenaFirmowa', () => {
  it('normalizuje wielkość liter i zachowuje subdomeny', () => {
    expect(domenaFirmowa('Jan@Firma.PL')).toBe('firma.pl');
    expect(domenaFirmowa('jan@mail.firma.pl')).toBe('mail.firma.pl');
    expect(domenaFirmowa('  a@example.com ')).toBe('example.com');
  });

  it('(−) każda domena prywatna (także wielkimi literami) daje null', () => {
    expect(DOMENY_PRYWATNE.length).toBeGreaterThanOrEqual(36);
    for (const d of DOMENY_PRYWATNE) {
      expect(domenaFirmowa(`jan@${d}`), d).toBeNull();
      expect(domenaFirmowa(`Jan@${d.toUpperCase()}`), d).toBeNull();
    }
  });

  it('(−) zły adres, brak domeny, dwa @, domena z numerem telefonu → null', () => {
    for (const zle of [
      'zle',
      '',
      '@firma.pl',
      'jan@',
      'jan@@firma.pl',
      'a@b@firma.pl',
      'jan@firma',
      'j an@firma.pl',
      'jan@1234567890.pl',
      'jan@-firma.pl',
    ]) {
      expect(domenaFirmowa(zle), zle).toBeNull();
    }
    expect(domenaFirmowa(undefined)).toBeNull();
    expect(domenaFirmowa(12)).toBeNull();
  });
});

const baza = (over: Partial<LeadRow> = {}): LeadRow => ({
  id: 'id-1',
  email: 'jan.kowalski@firma.pl',
  name: 'Jan Kowalski',
  phone: '+48 600 100 200',
  source: 'website',
  ...over,
});

describe('tytulZadania', () => {
  it('formularz: sześć wartości service_interest, pakiet i temat nieznany', () => {
    const oczekiwane: Record<string, string> = {
      general: 'kontakt',
      web: 'strona www',
      marketing: 'marketing',
      design: 'design',
      audit: 'audyt',
      consultation: 'konsultacja',
    };
    for (const [k, v] of Object.entries(oczekiwane)) {
      expect(tytulZadania(baza({ service_type: k }))).toBe(`Lead: firma.pl — ${v}`);
    }
    expect(tytulZadania(baza({ package_name: 'Pakiet Start' }))).toBe(
      'Lead: firma.pl — abonament: Pakiet Start',
    );
    expect(tytulZadania(baza({ service_type: 'Sklep <b>online</b>!' }))).toBe(
      'Lead: firma.pl — Sklep b online b',
    );
    expect(tytulZadania(baza({ service_type: null }))).toBe('Lead: firma.pl — kontakt');
  });

  it('audyt i kalkulator', () => {
    expect(
      tytulZadania(
        baza({ source: 'audit', details: JSON.stringify({ score: 73.4, pdf_key: 'x' }) }),
      ),
    ).toBe('Lead: firma.pl — audyt strony, wynik 73/100');
    expect(
      tytulZadania(
        baza({
          source: 'calculator',
          details: JSON.stringify({ priceRange: { min: 8000, max: 15000 } }),
        }),
      ),
    ).toBe('Lead: firma.pl — kalkulator: 8 000–15 000 zł');
  });

  it('poczta prywatna: „osoba prywatna” zamiast domeny', () => {
    expect(tytulZadania(baza({ email: 'jan@gmail.com', service_type: 'design' }))).toBe(
      'Lead: osoba prywatna — design',
    );
  });

  it('Preview dodaje przedrostek, a całość mieści się w 120 znakach', () => {
    expect(tytulZadania(baza(), { preview: true })).toMatch(/^\[Preview\] Lead: firma\.pl/);
    const dlugi = tytulZadania(baza({ email: `a@${'x'.repeat(60)}.${'y'.repeat(60)}.pl` }), {
      preview: true,
    });
    expect(dlugi.length).toBeLessThanOrEqual(120);
    expect(dlugi.startsWith('[Preview] ')).toBe(true);
  });

  it('(−) 1000 losowych wejść: nigdy @, imię, ciąg ≥ 7 cyfr; długość ≤ 120', () => {
    let seed = 20261030;
    const los = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const wybierz = <T>(a: T[]) => a[Math.floor(los() * a.length)];
    const imiona = [
      'Zdzisław',
      'Bogumiła',
      'Kunegunda',
      'Radosław',
      'Hieronim',
      'Oktawian',
      'Weronika',
    ];
    const nazwiska = ['Przybylski', 'Wiśniewska', 'Kowalczyk', 'Zawadzki'];
    const domeny = ['firma.pl', 'gmail.com', 'wp.pl', 'sklep.example.org', 'studio.com.pl'];
    const telefony = () =>
      wybierz([
        `${600 + Math.floor(los() * 399)}${String(Math.floor(los() * 1e6)).padStart(6, '0')}`,
        `+48 ${600 + Math.floor(los() * 399)} ${100 + Math.floor(los() * 899)} ${100 + Math.floor(los() * 899)}`,
        `${600 + Math.floor(los() * 399)}-${100 + Math.floor(los() * 899)}-${100 + Math.floor(los() * 899)}`,
      ]);
    for (let i = 0; i < 1000; i++) {
      const imie = wybierz(imiona);
      const nazwisko = wybierz(nazwiska);
      const tel = telefony();
      const email =
        `${imie}.${nazwisko}${Math.floor(los() * 1e4)}@${wybierz(domeny)}`.toLowerCase();
      const wrog = wybierz([
        `${imie} ${nazwisko}`,
        email,
        tel,
        `${imie}${nazwisko}`,
        `${imie.toUpperCase()}-${tel}`,
        `tel ${tel} ${email} ${imie}`,
        'web',
        'general',
        '<script>alert(1)</script>',
        '',
      ]);
      const lead: LeadRow = {
        id: `id-${i}`,
        email,
        name: `${imie} ${nazwisko}`,
        phone: tel,
        service_type: wrog,
        package_name: wybierz([null, wrog, 'Pakiet 360']),
        source: wybierz(['website', 'audit', 'calculator']),
        details: JSON.stringify({
          score: Math.floor(los() * 100),
          priceRange: { min: Math.floor(los() * 90000), max: 90000 + Math.floor(los() * 400000) },
        }),
      };
      const t = tytulZadania(lead, { preview: los() < 0.5 });
      expect(t, t).not.toContain('@');
      expect(t.toLowerCase(), t).not.toContain(imie.toLowerCase());
      expect(t.toLowerCase(), t).not.toContain(nazwisko.toLowerCase());
      expect(t, t).not.toMatch(/\d{7,}/);
      expect(t.replace(/[\s-]/g, ''), t).not.toMatch(/\d{7,}/);
      expect(t.length).toBeLessThanOrEqual(120);
    }
  });
});

describe('opisZadania', () => {
  it('ucieka znak |, cytuje wiadomość i nie zawiera HTML', () => {
    const o = opisZadania(
      baza({
        name: 'Jan | Kowalski',
        message: 'linia 1 | a\n<script>x</script>\nlinia 3',
        company: 'A|B',
      }),
    );
    expect(o).toContain('| Imię | Jan \\| Kowalski |');
    expect(o).toContain('| Firma | A\\|B |');
    expect(o).toContain('> linia 1 \\| a');
    expect(o).toContain('> linia 3');
    expect(o).not.toMatch(/<\/?script/);
    for (const l of o.split('\n').filter((x) => x.startsWith('| ') && !x.startsWith('| Pole'))) {
      expect(l.replace(/\\\|/g, '').split('|').length).toBe(4);
    }
  });

  it('(−) message ucięty do 4 000, całość ≤ 10 000, ucięcie nie zgubi nagłówka', () => {
    const o = opisZadania(baza({ message: 'x'.repeat(50_000) }));
    expect((o.match(/x/g) ?? []).length).toBe(4000);
    const gigant = opisZadania(
      baza({
        source: 'calculator',
        details: JSON.stringify({
          answers: Object.fromEntries(
            Array.from({ length: 200 }, (_, i) => [`q${i}`, 'y'.repeat(500)]),
          ),
        }),
        message: 'z'.repeat(4000),
      }),
    );
    expect(gigant.length).toBeLessThanOrEqual(10_000);
    expect(gigant.startsWith('**Źródło:**')).toBe(true);
  });

  it('(−) wiadomość z tysiącami krótkich linii też jest ucięta do 4 000 znaków', () => {
    const o = opisZadania(baza({ message: Array.from({ length: 6000 }, () => 'x').join('\n') }));
    expect((o.match(/^> x$/gm) ?? []).length).toBe(2000);
  });

  it('etykiety budżetu', () => {
    expect(opisZadania(baza({ budget: 'mid' }))).toContain('| Budżet | 5 000–15 000 PLN |');
    expect(opisZadania(baza({ budget: 'low' }))).toContain('do 5 000 PLN');
    expect(opisZadania(baza({ budget: 'high' }))).toContain('15 000–50 000 PLN');
    expect(opisZadania(baza({ budget: 'enterprise' }))).toContain('powyżej 50 000 PLN');
  });

  it('audyt: wynik, adres strony i klucz R2; kalkulator: widełki i odpowiedzi', () => {
    const a = opisZadania(
      baza({
        source: 'audit',
        website: 'https://inna.pl',
        details: JSON.stringify({ score: 61, pdf_key: 'audit/abc.pdf' }),
      }),
    );
    expect(a).toContain('**Wynik audytu:** 61/100');
    expect(a).toContain('**Adres strony:** https://inna.pl');
    expect(a).toContain('audit/abc.pdf');
    const k = opisZadania(
      baza({
        source: 'calculator',
        budget: '8000 - 15000',
        details: JSON.stringify({
          priceRange: { min: 8000, max: 15000 },
          answers: { typ: 'sklep', moduly: ['a', 'b'] },
        }),
      }),
    );
    expect(k).toContain('**Widełki:** 8 000–15 000 zł');
    expect(k).toContain('- typ: sklep');
    expect(k).toContain('- moduly: ["a","b"]');
  });

  it('(−) pola techniczne i tajne z details nie trafiają do opisu', () => {
    const o = opisZadania(
      baza({
        details: JSON.stringify({
          edit_token: 'TAJNE-1',
          captcha_token: 'TAJNE-2',
          ip: '1.2.3.4',
          klucz: 'ok',
        }),
      }),
    );
    expect(o).not.toContain('TAJNE');
    expect(o).not.toContain('1.2.3.4');
    expect(o).toContain('- klucz: ok');
  });
});

describe('trescProsby', () => {
  it('temat, budżet i do 200 znaków wiadomości', () => {
    const t = trescProsby(baza({ budget: 'mid', message: 'q'.repeat(900), service_type: 'web' }));
    expect(t).toContain('Temat: strona www');
    expect(t).toContain('Budżet: 5 000–15 000 PLN');
    expect((t.match(/q/g) ?? []).length).toBe(200);
  });
  it('audyt: temat z wynikiem, bez wiadomości', () => {
    const t = trescProsby(
      baza({ source: 'audit', message: 'cos', details: JSON.stringify({ score: 40 }) }),
    );
    expect(t).toBe('Temat: audyt strony, wynik 40/100');
  });
});

// ---------------------------------------------------------------------------------------------
// 2. Ścieżka szczęśliwa i warianty
// ---------------------------------------------------------------------------------------------

describe('zglosLead — ścieżka szczęśliwa', () => {
  it('4 operacje w kolejności, id zadania = id leada, przypisanie, wiersz wyslany, dedup w KV', async () => {
    const { env, db, kv } = srodowisko();
    const lead = dodajLead(db, { message: 'Potrzebuję strony', budget: 'mid' });
    await zglosLead(env, lead.id);

    expect(opy()).toEqual(['Etykiety', 'KlientUpsert', 'ZadanieUtworz', 'ProsbaKlienta']);
    const issue = input('ZadanieUtworz');
    expect(issue.id).toBe(lead.id);
    expect(issue.assigneeId).toBe('user-jakub');
    expect(issue.teamId).toBe('team-1');
    expect(issue.labelIds).toEqual(['lab-formularz']);
    expect(issue.title).toBe('Lead: firma.pl — strona www');
    expect(issue).not.toHaveProperty('stateId');
    expect(String(issue.description)).toContain('Potrzebuję strony');
    expect(input('KlientUpsert')).toEqual({
      externalId: 'firma.pl',
      name: 'firma.pl',
      domains: ['firma.pl'],
    });
    expect(input('ProsbaKlienta')).toMatchObject({ customerId: 'cust-firma.pl', issueId: lead.id });
    expect(wyw.every((w) => w.auth === KLUCZ_API)).toBe(true);

    const w = wiersz(db, lead.id)!;
    expect(w).toMatchObject({
      stan: 'wyslany',
      identifier: 'LEA-1',
      issue_id: lead.id,
      customer_request: 1,
      proby: 0,
    });
    expect(w.url).toContain('LEA-1');
    expect([...kv.store.keys()].some((k) => k.startsWith('linear:dedup:'))).toBe(true);
    expect(kv.store.has('linear:etykiety:team-1')).toBe(true);
  });

  it('etykiety z cache KV: drugi lead nie odpytuje Etykiety', async () => {
    const { env, db } = srodowisko();
    await zglosLead(env, dodajLead(db).id);
    wyw = [];
    await zglosLead(env, dodajLead(db, { email: 'anna@inna-firma.pl' }).id);
    expect(opy()).toEqual(['KlientUpsert', 'ZadanieUtworz', 'ProsbaKlienta']);
  });

  it('LINEAR_STAN_TRIAGE_ID trafia do stateId; bez przypisania nie ma assigneeId', async () => {
    const { env, db } = srodowisko({
      env: { LINEAR_STAN_TRIAGE_ID: 'stan-triage', LINEAR_PROWADZACY_ID: undefined },
    });
    await zglosLead(env, dodajLead(db).id);
    const issue = input('ZadanieUtworz');
    expect(issue.stateId).toBe('stan-triage');
    expect(issue).not.toHaveProperty('assigneeId');
  });

  it('poczta prywatna: 0 wywołań Customer, etykieta bez-firmy, tytuł „osoba prywatna” (wszystkie domeny)', async () => {
    const { env, db } = srodowisko();
    for (const [i, d] of DOMENY_PRYWATNE.entries()) {
      wyw = [];
      const lead = dodajLead(db, { email: `jan${i}@${d}` });
      await zglosLead(env, lead.id);
      expect(
        opy().filter((o) => o === 'KlientUpsert' || o === 'ProsbaKlienta'),
        d,
      ).toEqual([]);
      expect(opy().filter((o) => o === 'ZadanieUtworz')).toHaveLength(1);
      const issue = input('ZadanieUtworz');
      expect(issue.labelIds, d).toEqual(['lab-formularz', 'lab-bez-firmy']);
      expect(String(issue.title).startsWith('Lead: osoba prywatna — '), d).toBe(true);
      expect(wiersz(db, lead.id)).toMatchObject({ stan: 'wyslany', customer_request: 2 });
    }
  });

  it('duplikat w ciągu godziny: tylko commentCreate, duplikat_of, 0 nowych zadań', async () => {
    const { env, db } = srodowisko();
    const pierwszy = dodajLead(db, { email: 'Jan@Firma.pl' });
    await zglosLead(env, pierwszy.id);
    wyw = [];
    const drugi = dodajLead(db, { email: 'jan@firma.PL', message: 'drugi raz' });
    await zglosLead(env, drugi.id);
    expect(opy()).toEqual(['Komentarz']);
    expect(input('Komentarz').issueId).toBe(pierwszy.id);
    expect(String(input('Komentarz').body)).toContain('drugi raz');
    expect(wiersz(db, drugi.id)).toMatchObject({
      stan: 'wyslany',
      duplikat_of: pierwszy.id,
      identifier: 'LEA-1',
      customer_request: 2,
    });
  });

  it('(−) inny adres albo po wygaśnięciu klucza dedup: powstaje nowe zadanie', async () => {
    const { env, db, kv } = srodowisko();
    await zglosLead(env, dodajLead(db, { email: 'a@firma.pl' }).id);
    wyw = [];
    await zglosLead(env, dodajLead(db, { email: 'b@firma.pl' }).id);
    expect(opy()).toContain('ZadanieUtworz');
    for (const k of [...kv.store.keys()]) if (k.startsWith('linear:dedup:')) kv.store.delete(k);
    wyw = [];
    await zglosLead(env, dodajLead(db, { email: 'a@firma.pl' }).id);
    expect(opy()).toContain('ZadanieUtworz');
    expect(opy()).not.toContain('Komentarz');
  });

  it('(−) komentarz dedup do usuniętego zadania (errors) nie blokuje leada: tworzy nowe zadanie', async () => {
    const { env, db } = srodowisko();
    await zglosLead(env, dodajLead(db, { email: 'a@firma.pl' }).id);
    wyw = [];
    kolejki.Komentarz = [
      { json: { errors: [{ message: 'x', extensions: { code: 'NOT_FOUND' } }] } },
    ];
    const lead = dodajLead(db, { email: 'a@firma.pl' });
    await zglosLead(env, lead.id);
    expect(opy()).toContain('ZadanieUtworz');
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'wyslany', duplikat_of: null });
  });

  it('Preview: etykieta test w labelIds i przedrostek [Preview]', async () => {
    const { env, db } = srodowisko({ env: { SRODOWISKO: 'preview' } });
    await zglosLead(env, dodajLead(db).id);
    const issue = input('ZadanieUtworz');
    expect(issue.labelIds).toEqual(['lab-formularz', 'lab-test']);
    expect(String(issue.title).startsWith('[Preview] ')).toBe(true);
  });

  it('(−) produkcja: bez etykiety test i bez przedrostka', async () => {
    for (const s of [undefined, 'production']) {
      wyw = [];
      const { env, db } = srodowisko({ env: { SRODOWISKO: s } });
      await zglosLead(env, dodajLead(db).id);
      const issue = input('ZadanieUtworz');
      expect(issue.labelIds).not.toContain('lab-test');
      expect(String(issue.title)).not.toContain('[Preview]');
    }
  });

  it('audyt z e-mailem jan@firma.pl i website=inna.pl: Customer = firma.pl, inna.pl tylko w opisie', async () => {
    const { env, db } = srodowisko();
    await zglosLead(
      env,
      dodajLead(db, {
        source: 'audit',
        email: 'jan@firma.pl',
        website: 'https://inna.pl',
        details: JSON.stringify({ score: 73, pdf_key: 'audit/1.pdf' }),
      }).id,
    );
    expect(input('KlientUpsert')).toEqual({
      externalId: 'firma.pl',
      name: 'firma.pl',
      domains: ['firma.pl'],
    });
    expect(JSON.stringify(input('KlientUpsert'))).not.toContain('inna.pl');
    const issue = input('ZadanieUtworz');
    expect(issue.labelIds).toEqual(['lab-audyt']);
    expect(issue.title).toBe('Lead: firma.pl — audyt strony, wynik 73/100');
    expect(String(issue.description)).toContain('inna.pl');
  });

  it('kalkulator: etykieta kalkulator i widełki w tytule', async () => {
    const { env, db } = srodowisko();
    await zglosLead(
      env,
      dodajLead(db, {
        source: 'calculator',
        service_type: 'Kalkulator wyceny',
        details: JSON.stringify({ priceRange: { min: 8000, max: 15000 }, answers: { a: 1 } }),
      }).id,
    );
    const issue = input('ZadanieUtworz');
    expect(issue.labelIds).toEqual(['lab-kalkulator']);
    expect(issue.title).toBe('Lead: firma.pl — kalkulator: 8 000–15 000 zł');
  });

  it('zglosLeadWTle przekazuje obietnicę do waitUntil i nie rzuca', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    const obietnice: Promise<unknown>[] = [];
    zglosLeadWTle((p) => obietnice.push(p), env, lead.id);
    expect(obietnice).toHaveLength(1);
    await Promise.all(obietnice);
    expect(wiersz(db, lead.id)?.stan).toBe('wyslany');
  });
});

// ---------------------------------------------------------------------------------------------
// 3. Nogi ujemne: błędy, ponowienia, zamek
// ---------------------------------------------------------------------------------------------

describe('zglosLead — awarie i kolejka', () => {
  it('(−) HTTP 500 → kolejka, proby=1, nastepna_proba = teraz + 60 s', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    kolejki.ZadanieUtworz = [{ status: 500, json: {} }];
    await zglosLead(env, lead.id);
    const w = wiersz(db, lead.id)!;
    expect(w).toMatchObject({
      stan: 'kolejka',
      proby: 1,
      ostatni_blad: 'HTTP 500',
      issue_id: null,
    });
    expect(Math.abs(utc(w.nastepna_proba) - (teraz() + 60_000))).toBeLessThanOrEqual(2000);
    expect(wyw.filter((x) => x.op === 'ZadanieUtworz')).toHaveLength(1);
  });

  it('(−) 429 z Retry-After: 120 → +120 s; 429 bez nagłówka → +5 min', async () => {
    const { env, db } = srodowisko();
    const a = dodajLead(db);
    kolejki.Etykiety = [{ status: 429, headers: { 'Retry-After': '120' }, json: {} }];
    await zglosLead(env, a.id);
    expect(wiersz(db, a.id)).toMatchObject({ stan: 'kolejka', ostatni_blad: 'HTTP 429', proby: 1 });
    expect(
      Math.abs(utc(wiersz(db, a.id)!.nastepna_proba) - (teraz() + 120_000)),
    ).toBeLessThanOrEqual(2000);

    const b = dodajLead(db);
    kolejki.Etykiety = [{ status: 429, json: {} }];
    await zglosLead(env, b.id);
    expect(
      Math.abs(utc(wiersz(db, b.id)!.nastepna_proba) - (teraz() + minuty(5))),
    ).toBeLessThanOrEqual(2000);
    // Błędny nagłówek (data HTTP, śmieci) to też 5 minut.
    const c = dodajLead(db);
    kolejki.Etykiety = [
      { status: 429, headers: { 'Retry-After': 'Wed, 21 Oct 2026 07:28:00 GMT' }, json: {} },
    ];
    await zglosLead(env, c.id);
    expect(
      Math.abs(utc(wiersz(db, c.id)!.nastepna_proba) - (teraz() + minuty(5))),
    ).toBeLessThanOrEqual(2000);
  });

  it('(−) 401, wyjątek sieci, timeout, errors w odpowiedzi 200 → kolejka z właściwym ostatni_blad', async () => {
    const przypadki: [Spec, string][] = [
      [{ status: 401, json: { errors: [{ message: 'x' }] } }, 'HTTP 401'],
      ['siec', 'siec'],
      ['timeout', 'timeout'],
      [
        {
          json: {
            errors: [
              { message: 'Argument Validation Error', extensions: { code: 'INVALID_INPUT' } },
            ],
          },
        },
        'errors:INVALID_INPUT',
      ],
      [{ json: { errors: [{ message: 'bez kodu' }] } }, 'errors:UNKNOWN'],
    ];
    for (const [spec, blad] of przypadki) {
      const { env, db } = srodowisko();
      const lead = dodajLead(db);
      kolejki.KlientUpsert = [spec];
      await zglosLead(env, lead.id);
      expect(wiersz(db, lead.id), blad).toMatchObject({
        stan: 'kolejka',
        proby: 1,
        ostatni_blad: blad,
      });
      expect(opy().includes('ZadanieUtworz'), blad).toBe(false);
    }
  });

  it('(−) odstępy między próbami: 1, 5, 15, 60, 180, 360, 720 min', async () => {
    expect([...ODSTEPY_MIN]).toEqual([1, 5, 15, 60, 180, 360, 720]);
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    kolejki.ZadanieUtworz = Array.from({ length: 7 }, () => ({ status: 503, json: {} }));
    await zglosLead(env, lead.id);
    for (let proba = 1; proba <= 7; proba++) {
      const w = wiersz(db, lead.id)!;
      expect(w.proby).toBe(proba);
      expect(w.stan).toBe('kolejka');
      expect(
        Math.abs(utc(w.nastepna_proba) - (teraz() + minuty(ODSTEPY_MIN[proba - 1]))),
      ).toBeLessThanOrEqual(2000);
      vi.setSystemTime(utc(w.nastepna_proba) + 1000);
      if (proba < 7) await drenujKolejke(env, { limit: 5 });
    }
  });

  it('(−) ósma porażka → zablokowany (siódma jeszcze nie)', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    await zglosLead(env, lead.id); // tworzy wiersz i wysyła
    ustaw(db, lead.id, {
      stan: 'kolejka',
      issue_id: null,
      identifier: null,
      proby: 6,
      customer_request: 0,
    });
    kolejki.ZadanieUtworz = [
      { status: 500, json: {} },
      { status: 500, json: {} },
    ];
    vi.setSystemTime(teraz() + 1000);
    await drenujKolejke(env);
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'kolejka', proby: 7 });
    ustaw(db, lead.id, { nastepna_proba: '2000-01-01 00:00:00' });
    await drenujKolejke(env);
    expect(wiersz(db, lead.id)).toMatchObject({
      stan: 'zablokowany',
      proby: 8,
      ostatni_blad: 'HTTP 500',
    });
    // Zablokowany nie wraca sam do drenażu.
    wyw = [];
    vi.setSystemTime(teraz() + 24 * 3600_000);
    await drenujKolejke(env);
    expect(wyw).toHaveLength(0);
  });

  it('(−) brak LINEAR_API_KEY albo LINEAR_TEAM_LEADY_ID: 0 fetch, 0 wierszy, log linear:wylaczone', async () => {
    for (const brak of ['LINEAR_API_KEY', 'LINEAR_TEAM_LEADY_ID'] as const) {
      logi = [];
      const { env, db } = srodowisko({ env: { [brak]: undefined } });
      await zglosLead(env, dodajLead(db).id);
      await komentarzKroku(env, 'x', 'krok2', { a: 1 });
      const d = await drenujKolejke(env);
      expect(wyw, brak).toHaveLength(0);
      expect(liczWierszy(db), brak).toBe(0);
      expect(d).toMatchObject({ ponowione: 0, w_kolejce: 0 });
      expect(
        logi.some((l) => l.includes('linear:wylaczone')),
        brak,
      ).toBe(true);
    }
  });

  it('(−) brak tabeli linear_leady (D1 bez 0010): bez wyjątku, log linear:brak-tabeli, 0 fetch', async () => {
    const { env, db } = srodowisko({ migracje: MIGRACJE });
    const lead = dodajLead(db);
    await expect(zglosLead(env, lead.id)).resolves.toBeUndefined();
    await expect(komentarzKroku(env, lead.id, 'krok2', { a: 1 })).resolves.toBeUndefined();
    await expect(drenujKolejke(env)).resolves.toMatchObject({ ponowione: 0 });
    expect(logi.some((l) => l.includes('linear:brak-tabeli'))).toBe(true);
    expect(wyw).toHaveLength(0);
  });

  it('(−) nieistniejący lead: bez wiersza i bez wywołań', async () => {
    const { env, db } = srodowisko();
    await zglosLead(env, 'nie-ma-takiego');
    expect(liczWierszy(db)).toBe(0);
    expect(wyw).toHaveLength(0);
  });

  it('(−) zajęty id przy ponowieniu → ZadaniePoId → wyslany bez drugiego issueCreate', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    kolejki.ZadanieUtworz = [
      { json: { errors: [{ message: 'duplicate', extensions: { code: 'INVALID_INPUT' } }] } },
    ];
    kolejki.ZadaniePoId = [
      {
        json: {
          data: {
            issue: {
              id: lead.id,
              identifier: 'LEA-77',
              url: 'https://linear.app/mixture/issue/LEA-77',
            },
          },
        },
      },
    ];
    await zglosLead(env, lead.id);
    expect(opy().filter((o) => o === 'ZadanieUtworz')).toHaveLength(1);
    expect(opy()).toContain('ZadaniePoId');
    expect(wiersz(db, lead.id)).toMatchObject({
      stan: 'wyslany',
      identifier: 'LEA-77',
      customer_request: 1,
      proby: 0,
    });
  });

  it('(−) timeout przy tworzeniu zadania, które jednak powstało: ponowienie nie robi duplikatu', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    kolejki.ZadanieUtworz = ['timeout'];
    kolejki.ZadaniePoId = [
      { json: { data: { issue: { id: lead.id, identifier: 'LEA-5', url: 'https://l/5' } } } },
    ];
    await zglosLead(env, lead.id);
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'wyslany', identifier: 'LEA-5' });
    expect(opy().filter((o) => o === 'ZadanieUtworz')).toHaveLength(1);
  });

  it('(−) customerNeedCreate pada → wyslany, customer_request=0; następny drenaż robi tylko Customer Request', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    kolejki.ProsbaKlienta = [{ status: 500, json: {} }];
    await zglosLead(env, lead.id);
    let w = wiersz(db, lead.id)!;
    expect(w).toMatchObject({
      stan: 'wyslany',
      customer_request: 0,
      identifier: 'LEA-1',
      proby: 1,
      ostatni_blad: 'HTTP 500',
    });
    expect(opy().filter((o) => o === 'ZadanieUtworz')).toHaveLength(1);

    // Przed upływem odstępu nic się nie dzieje.
    wyw = [];
    await drenujKolejke(env);
    expect(wyw).toHaveLength(0);

    vi.setSystemTime(utc(w.nastepna_proba) + 1000);
    const wynik = await drenujKolejke(env);
    expect(opy()).toEqual(['KlientUpsert', 'ProsbaKlienta']);
    expect(wynik.ponowione).toBe(1);
    w = wiersz(db, lead.id)!;
    expect(w).toMatchObject({ stan: 'wyslany', customer_request: 1, proby: 0, ostatni_blad: null });
  });

  it('(−) padł proces po utworzeniu zadania (w_toku > 120 s z issue_id): wraca i robi tylko Customer Request', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    ustaw(db, lead.id, { stan: 'w_toku', customer_request: 0, updated_at: '2000-01-01 00:00:00' });
    wyw = [];
    await drenujKolejke(env);
    expect(opy()).toEqual(['KlientUpsert', 'ProsbaKlienta']);
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'wyslany', customer_request: 1 });
  });

  it('(−) w_toku młodszy niż 120 s pozostaje zamknięty, starszy wraca do kolejki', async () => {
    const { env, db } = srodowisko();
    const mlody = dodajLead(db);
    const stary = dodajLead(db, { email: 'stary@inna.pl' });
    await zglosLead(env, mlody.id);
    await zglosLead(env, stary.id);
    for (const id of [mlody.id, stary.id]) {
      ustaw(db, id, { stan: 'w_toku', issue_id: null, identifier: null, customer_request: 0 });
    }
    const t = (ms: number) => new Date(teraz() - ms).toISOString().replace('T', ' ').slice(0, 19);
    ustaw(db, mlody.id, { updated_at: t(100_000) });
    ustaw(db, stary.id, { updated_at: t(130_000) });
    wyw = [];
    await drenujKolejke(env);
    expect(wiersz(db, mlody.id)!.stan).toBe('w_toku');
    expect(wiersz(db, stary.id)!.stan).toBe('wyslany');
    expect(wyw.filter((x) => x.op === 'ZadanieUtworz')).toHaveLength(1);
  });

  it('(−) dwa równoległe drenaże tego samego wiersza → dokładnie 1 issueCreate', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    db.prepare('DELETE FROM linear_leady').run();
    db.prepare(
      `INSERT INTO linear_leady (lead_id, stan, nastepna_proba) VALUES (?, 'kolejka', '2000-01-01 00:00:00')`,
    ).run(lead.id);
    wyw = [];
    opoznienie = async () => {
      await new Promise((r) => setImmediate(r));
    };
    const [a, b] = await Promise.all([drenujKolejke(env), drenujKolejke(env)]);
    expect(wyw.filter((x) => x.op === 'ZadanieUtworz')).toHaveLength(1);
    expect(a.ponowione + b.ponowione).toBe(1);
    expect(wiersz(db, lead.id)!.stan).toBe('wyslany');
  });

  it('(−) budżet 25 s: po jego przekroczeniu wiersz wraca do kolejki bez doliczania próby', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    opoznienie = async () => {
      vi.setSystemTime(teraz() + 26_000);
    };
    await zglosLead(env, lead.id);
    expect(opy()).toEqual(['Etykiety']);
    expect(wiersz(db, lead.id)).toMatchObject({
      stan: 'kolejka',
      proby: 0,
      ostatni_blad: 'budzet',
    });
  });
});

describe('drenujKolejke', () => {
  it('bierze tylko wiersze z nastepna_proba <= teraz i szanuje limit', async () => {
    const { env, db } = srodowisko();
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const l = dodajLead(db, { email: `u${i}@firma${i}.pl` });
      ids.push(l.id);
      db.prepare(
        `INSERT INTO linear_leady (lead_id, stan, nastepna_proba) VALUES (?, 'kolejka', ?)`,
      ).run(l.id, i < 3 ? '2026-11-02 09:00:00' : '2026-11-02 11:00:00');
    }
    const w = await drenujKolejke(env, { limit: 2 });
    expect(w.ponowione).toBe(2);
    expect(w.w_kolejce).toBe(2);
    expect(opy().filter((o) => o === 'ZadanieUtworz')).toHaveLength(2);
    expect(wiersz(db, ids[3])!.stan).toBe('kolejka');
    await drenujKolejke(env, { limit: 50 });
    expect(wiersz(db, ids[3])!.stan).toBe('kolejka'); // przyszłość
    vi.setSystemTime(new Date('2026-11-02T11:00:01Z'));
    const koniec = await drenujKolejke(env);
    expect(koniec).toMatchObject({
      ponowione: 1,
      w_kolejce: 0,
      zablokowane: 0,
      bez_customer_request: 0,
    });
    expect(koniec.czas).toMatch(/^2026-11-02T/);
  });

  it('(−) zablokowany wraca tylko z odblokuj=true (proby=0)', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    db.prepare(
      `INSERT INTO linear_leady (lead_id, stan, proby, nastepna_proba) VALUES (?, 'zablokowany', 8, '2000-01-01 00:00:00')`,
    ).run(lead.id);
    const bez = await drenujKolejke(env);
    expect(bez).toMatchObject({ ponowione: 0, zablokowane: 1 });
    expect(wyw).toHaveLength(0);
    const z = await drenujKolejke(env, { odblokuj: true });
    expect(z).toMatchObject({ ponowione: 1, zablokowane: 0 });
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'wyslany', proby: 0 });
  });

  it('zgłoszenie dociąga zaległe wiersze (do 5), nie tylko własny lead', async () => {
    const { env, db } = srodowisko();
    const stary = dodajLead(db, { email: 'stary@inna.pl' });
    db.prepare(
      `INSERT INTO linear_leady (lead_id, stan, nastepna_proba) VALUES (?, 'kolejka', '2000-01-01 00:00:00')`,
    ).run(stary.id);
    await zglosLead(env, dodajLead(db).id);
    expect(wiersz(db, stary.id)!.stan).toBe('wyslany');
  });

  it('(−) KlientUpsert pada → zadanie nie powstaje (kolejka), a lead nie ginie', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    kolejki.KlientUpsert = [{ status: 502, json: {} }];
    await zglosLead(env, lead.id);
    expect(opy()).not.toContain('ZadanieUtworz');
    expect(wiersz(db, lead.id)).toMatchObject({ stan: 'kolejka', ostatni_blad: 'HTTP 502' });
  });
});

// ---------------------------------------------------------------------------------------------
// 4. Komentarze kroków
// ---------------------------------------------------------------------------------------------

describe('komentarzKroku', () => {
  it('zadanie istnieje → 1 komentarz, powtórka tego kroku → 0, inny krok → kolejny', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    wyw = [];
    await komentarzKroku(env, lead.id, 'krok2', {
      projectType: 'sklep',
      budget: 'mid',
      website: 'https://x.pl',
    });
    expect(opy()).toEqual(['Komentarz']);
    expect(input('Komentarz').issueId).toBe(lead.id);
    expect(String(input('Komentarz').body)).toContain('- projectType: sklep');
    await komentarzKroku(env, lead.id, 'krok2', { projectType: 'sklep' });
    expect(opy()).toEqual(['Komentarz']);
    await komentarzKroku(env, lead.id, 'krok3', { message: 'Cześć\nwiadomość', company: 'ACME' });
    expect(opy()).toEqual(['Komentarz', 'Komentarz']);
    expect(String(wyw[1].vars.input && (wyw[1].vars.input as Json).body)).toContain('> wiadomość');
  });

  it('(−) zadania nie ma (brak wiersza albo kolejka): 0 wywołań', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    await komentarzKroku(env, lead.id, 'krok2', { a: 1 });
    expect(wyw).toHaveLength(0);
    db.prepare(`INSERT INTO linear_leady (lead_id, stan) VALUES (?, 'kolejka')`).run(lead.id);
    await komentarzKroku(env, lead.id, 'krok2', { a: 1 });
    ustaw(db, lead.id, { stan: 'zablokowany' });
    await komentarzKroku(env, lead.id, 'krok2', { a: 1 });
    expect(wyw).toHaveLength(0);
  });

  it('(−) nazwa kroku spoza wzorca i pola tajne: brak wywołania / pole pominięte; błąd API nie blokuje powtórki', async () => {
    const { env, db } = srodowisko();
    const lead = dodajLead(db);
    await zglosLead(env, lead.id);
    wyw = [];
    await komentarzKroku(env, lead.id, 'krok 2; DROP', { a: 1 });
    expect(wyw).toHaveLength(0);
    kolejki.Komentarz = [{ status: 500, json: {} }];
    await komentarzKroku(env, lead.id, 'krok2', { edit_token: 'TAJNE', ok: 'tak' });
    expect(String(input('Komentarz').body)).not.toContain('TAJNE');
    await komentarzKroku(env, lead.id, 'krok2', { ok: 'tak' }); // pierwsza próba padła, więc druga idzie
    expect(opy()).toEqual(['Komentarz', 'Komentarz']);
  });
});

// ---------------------------------------------------------------------------------------------
// 5. Logi i migracja
// ---------------------------------------------------------------------------------------------

describe('logi i migracja', () => {
  it('(−) żadna linia logu nie zawiera e-maila, telefonu, treści ani klucza', async () => {
    const { env, db } = srodowisko();
    const pii = dodajLead(db, {
      email: 'tajna.osoba@sekretna-firma.pl',
      phone: '+48 511 222 333',
      name: 'Tajemnica Osobowa',
      message: 'TRESC-WIADOMOSCI-XYZ',
    });
    const scenariusze: Spec[][] = [
      [{ status: 500, json: { errors: [{ message: 'tajna.osoba@sekretna-firma.pl 511222333' }] } }],
      [{ status: 429, headers: { 'Retry-After': '10' }, json: {} }],
      ['siec'],
      ['timeout'],
      [{ json: { errors: [{ message: 'TRESC-WIADOMOSCI-XYZ', extensions: { code: 'X' } }] } }],
    ];
    for (const s of scenariusze) {
      kolejki.Etykiety = [...s];
      db.prepare('DELETE FROM linear_leady').run();
      await zglosLead(env, pii.id);
    }
    kolejki.ZadanieUtworz = ['timeout'];
    db.prepare('DELETE FROM linear_leady').run();
    await zglosLead(env, pii.id);
    kolejki.ProsbaKlienta = [{ status: 500, json: {} }];
    db.prepare('DELETE FROM linear_leady').run();
    await zglosLead(env, pii.id);
    await drenujKolejke(env, { odblokuj: true });
    const zlaTabela = srodowisko({ migracje: MIGRACJE });
    await zglosLead(
      zlaTabela.env,
      dodajLead(zlaTabela.db, { email: 'tajna.osoba@sekretna-firma.pl' }).id,
    );

    expect(logi.length).toBeGreaterThan(0);
    for (const l of logi) {
      expect(l).not.toMatch(
        /tajna\.osoba|sekretna-firma|511\s?222\s?333|Tajemnica|Osobowa|TRESC-WIADOMOSCI|lin_api|TAJNY_KLUCZ/,
      );
    }
  });

  it('migracja 0010 stosuje się dwa razy z rzędu na czystej bazie', () => {
    const { db } = srodowisko({ migracje: MIGRACJE });
    const sql = readFileSync(resolve(__dirname, '../../migrations/0010_linear_leady.sql'), 'utf8');
    expect(() => {
      db.exec(sql);
      db.exec(sql);
    }).not.toThrow();
    const kolumny = (db.prepare('PRAGMA table_info(linear_leady)').all() as { name: string }[]).map(
      (c) => c.name,
    );
    expect(kolumny).toEqual([
      'lead_id',
      'stan',
      'issue_id',
      'identifier',
      'url',
      'customer_request',
      'duplikat_of',
      'proby',
      'ostatni_blad',
      'nastepna_proba',
      'created_at',
      'updated_at',
    ]);
  });

  it('migracja nie zmienia leads (brak nowych kolumn, wyzwalacz 0009 nie widzi wpisu do linear_leady)', () => {
    const { db } = srodowisko();
    const l = dodajLead(db);
    const przed = (
      db.prepare('SELECT updated_at FROM leads WHERE id = ?').get(l.id) as { updated_at: string }
    ).updated_at;
    db.prepare(`INSERT INTO linear_leady (lead_id, stan) VALUES (?, 'wyslany')`).run(l.id);
    db.prepare(`UPDATE linear_leady SET stan = 'kolejka' WHERE lead_id = ?`).run(l.id);
    expect(
      (db.prepare('SELECT updated_at FROM leads WHERE id = ?').get(l.id) as { updated_at: string })
        .updated_at,
    ).toBe(przed);
    const kol = (db.prepare('PRAGMA table_info(leads)').all() as { name: string }[]).map(
      (c) => c.name,
    );
    expect(kol.some((k) => k.includes('linear'))).toBe(false);
  });

  it('(−) usunięcie leada kasuje wiersz linear_leady (kaskada)', () => {
    const { db } = srodowisko();
    const l = dodajLead(db);
    db.prepare(`INSERT INTO linear_leady (lead_id) VALUES (?)`).run(l.id);
    db.prepare('DELETE FROM leads WHERE id = ?').run(l.id);
    expect(liczWierszy(db)).toBe(0);
  });
});
