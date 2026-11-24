import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { d1Sqlite } from '../../../tests/helpers/d1Sqlite';
import { podpiszZapytanie } from '../crm/_podpis';
import { PREFIKS_PONOW } from '../leady/ponow';
import { onRequest, PREFIKS_RETENCJA, czyProba } from './retencja';
import { wykonajRetencje, progLeada, czasD1, MAKS_PDF } from './_retencja';
import { podpisRetencji } from '../../../scripts/audit-retencja.mjs';

// MIX-1820: retencja audytu (PDF 30 dni, lead 12 miesięcy bez statusu klienta). Prawdziwy SQLite z migracjami strony,
// R2 to atrapa w pamięci z `list` (stronicowanie) i `delete`. Czas zamrożony: 16.11.2026 12:00 UTC.
const TERAZ = Date.parse('2026-11-16T12:00:00Z');
const DZIEN = 24 * 60 * 60 * 1000;
const SEKRET = 'r'.repeat(64);
const SCIEZKA = '/api/audit/retencja';
const MIGRACJE = [
  '0001_init.sql',
  '0002_leads_add_source_company.sql',
  '0009_leads_updated_at.sql',
  '0010_linear_leady.sql',
];

let logi: string[] = [];
beforeEach(() => {
  logi = [];
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(TERAZ));
  for (const k of ['log', 'warn', 'error', 'info'] as const) {
    vi.spyOn(console, k).mockImplementation((...a: unknown[]) => {
      logi.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
    });
  }
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Atrapa R2: klucz → czas wgrania. `list` stronicuje po `limit`, `delete` przyjmuje klucz albo tablicę. */
function atrapaR2(strona = 1000) {
  const pliki = new Map<string, number>();
  const usuniete: string[][] = [];
  const r2 = {
    list: async (o: { prefix?: string; cursor?: string; limit?: number }) => {
      const klucze = [...pliki.keys()].filter((k) => k.startsWith(o.prefix ?? '')).sort();
      const od = o.cursor ? Number(o.cursor) : 0;
      const ile = Math.min(o.limit ?? 1000, strona);
      const kawalek = klucze.slice(od, od + ile);
      const truncated = od + ile < klucze.length;
      return {
        objects: kawalek.map((key) => ({ key, uploaded: new Date(pliki.get(key)!) })),
        truncated,
        cursor: truncated ? String(od + ile) : undefined,
      };
    },
    delete: async (k: string | string[]) => {
      const lista = Array.isArray(k) ? k : [k];
      usuniete.push(lista);
      for (const x of lista) pliki.delete(x);
    },
  };
  return { r2, pliki, usuniete };
}

function srodowisko(over: Record<string, unknown> = {}) {
  const { DB, db } = d1Sqlite(MIGRACJE);
  const { r2, pliki, usuniete } = atrapaR2();
  const env: Record<string, unknown> = {
    DB,
    FILES: r2,
    AUDIT_RETENCJA_SECRET: SEKRET,
    AUDIT_RETENCJA_KASUJ: 'tak',
    SRODOWISKO: 'production',
    ...over,
  };
  return { env, db, pliki, usuniete };
}
type Db = ReturnType<typeof srodowisko>['db'];

let licznik = 0;
interface Lead {
  zmiana: number; // ms
  source?: string;
  status?: string;
  userId?: number | null;
  email?: string;
  kolejka?: boolean;
}
function lead(db: Db, o: Lead) {
  licznik += 1;
  const id = `00000000-0000-4000-8000-${String(licznik).padStart(12, '0')}`;
  const czas = czasD1(o.zmiana);
  db.prepare(
    `INSERT INTO leads (id, email, name, source, status, user_id, created_at, updated_at)
     VALUES (?, ?, 'Lead z audytu', ?, ?, ?, ?, ?)`,
  ).run(
    id,
    o.email ?? `osoba${licznik}@firma${licznik}.pl`,
    o.source ?? 'audit',
    o.status ?? 'new',
    o.userId ?? null,
    czas,
    czas,
  );
  if (o.kolejka) {
    db.prepare(`INSERT INTO linear_leady (lead_id, stan) VALUES (?, 'wyslany')`).run(id);
  }
  return id;
}
const istnieje = (db: Db, id: string) =>
  db.prepare('SELECT 1 AS x FROM leads WHERE id = ?').get(id) !== undefined;

/** Lead zmieniony `n` miesięcy kalendarzowych temu, z przesunięciem w ms. */
function miesiaceTemu(n: number, plusMs = 0) {
  const d = new Date(TERAZ);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d.getTime() + plusMs;
}

async function zadanie(
  o: { body?: string; sekret?: string; prefiks?: string; metoda?: string } = {},
) {
  const czas = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomUUID();
  const podpis = await podpiszZapytanie(
    o.sekret ?? SEKRET,
    czas,
    nonce,
    'POST',
    SCIEZKA,
    o.prefiks ?? PREFIKS_RETENCJA,
  );
  const metoda = o.metoda ?? 'POST';
  return new Request(`https://mixturemarketing.pl${SCIEZKA}`, {
    method: metoda,
    headers: {
      'X-Mixture-Timestamp': czas,
      'X-Mixture-Nonce': nonce,
      'X-Mixture-Signature': podpis,
    },
    body: metoda === 'GET' ? undefined : (o.body ?? ''),
  });
}
const wywolaj = (request: Request, env: Record<string, unknown>) =>
  (onRequest as unknown as (c: unknown) => Promise<Response>)({ request, env });

describe('retencja PDF: granica 29/30/31 dni', () => {
  it('(+) 29 dni i dokładnie 30 dni zostają; 30 dni + 1 s i 31 dni są usuwane', async () => {
    const { env, pliki } = srodowisko();
    pliki.set('audit/a29.pdf', TERAZ - 29 * DZIEN);
    pliki.set('audit/b30.pdf', TERAZ - 30 * DZIEN);
    pliki.set('audit/c30s.pdf', TERAZ - 30 * DZIEN - 1000);
    pliki.set('audit/d31.pdf', TERAZ - 31 * DZIEN);
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.pdf.klucze.sort()).toEqual(['audit/c30s.pdf', 'audit/d31.pdf']);
    expect(w.pdf).toMatchObject({ sprawdzone: 4, do_usuniecia: 2, usuniete: 2 });
    expect([...pliki.keys()].sort()).toEqual(['audit/a29.pdf', 'audit/b30.pdf']);
  });

  it('(−) pliki spoza prefiksu audit/ (np. quotes/) nie są ruszane, nawet bardzo stare', async () => {
    const { env, pliki } = srodowisko();
    pliki.set('quotes/stara-oferta.pdf', TERAZ - 400 * DZIEN);
    pliki.set('audit/stary.pdf', TERAZ - 400 * DZIEN);
    await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect([...pliki.keys()]).toEqual(['quotes/stara-oferta.pdf']);
  });

  it('(+) stronicowanie R2: stare pliki z kolejnych stron też są znalezione', async () => {
    const { DB } = d1Sqlite(MIGRACJE);
    const { r2, pliki } = atrapaR2(2);
    for (let i = 0; i < 5; i++) pliki.set(`audit/p${i}.pdf`, TERAZ - 40 * DZIEN);
    pliki.set('audit/p9-nowy.pdf', TERAZ - DZIEN);
    const w = await wykonajRetencje({ DB, FILES: r2 } as never, { proba: false, teraz: TERAZ });
    expect(w.pdf).toMatchObject({ sprawdzone: 6, usuniete: 5 });
    expect([...pliki.keys()]).toEqual(['audit/p9-nowy.pdf']);
  });

  it('(+) limit plików na przebieg: najwyżej MAKS_PDF kluczy, także gdy strona R2 kończy się za limitem', async () => {
    for (const strona of [1000, 600]) {
      const { DB } = d1Sqlite(MIGRACJE);
      const { r2, pliki } = atrapaR2(strona);
      for (let i = 0; i < MAKS_PDF + 3; i++)
        pliki.set(`audit/x${String(i).padStart(5, '0')}.pdf`, TERAZ - 40 * DZIEN);
      const w = await wykonajRetencje({ DB, FILES: r2 } as never, { proba: false, teraz: TERAZ });
      expect(w.pdf.usuniete).toBe(MAKS_PDF);
      expect(pliki.size).toBe(3);
    }
  });

  it('(+) brak FILES: część PDF pominięta, leady dalej sprawdzane', async () => {
    const { env, db } = srodowisko({ FILES: undefined });
    const id = lead(db, { zmiana: miesiaceTemu(13) });
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.pdf.pominiete).toBe('brak FILES');
    expect(w.leady.usuniete).toBe(1);
    expect(istnieje(db, id)).toBe(false);
  });
});

describe('retencja leadów z audytu: granica 11/12/13 miesięcy, klient chroniony', () => {
  it('(+) 11 miesięcy i dokładnie 12 zostają; 12 miesięcy + 1 s i 13 są usuwane', async () => {
    const { env, db } = srodowisko();
    const m11 = lead(db, { zmiana: miesiaceTemu(11) });
    const m12 = lead(db, { zmiana: miesiaceTemu(12) });
    const m12s = lead(db, { zmiana: miesiaceTemu(12, -1000) });
    const m13 = lead(db, { zmiana: miesiaceTemu(13) });
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.leady.id.sort()).toEqual([m12s, m13].sort());
    expect(w.leady).toMatchObject({ do_usuniecia: 2, usuniete: 2 });
    expect([m11, m12, m12s, m13].map((i) => istnieje(db, i))).toEqual([true, true, false, false]);
  });

  it('(−) klient nie jest kasowany: status converted, user_id albo konto z tym adresem (inna wielkość liter)', async () => {
    const { env, db } = srodowisko();
    db.prepare(
      `INSERT INTO users (email, name, role) VALUES ('Klient@Firma.pl', 'K', 'client')`,
    ).run();
    const uid = Number(
      (db.prepare(`SELECT id FROM users WHERE email = 'Klient@Firma.pl'`).get() as { id: number })
        .id,
    );
    const stary = miesiaceTemu(14);
    const a = lead(db, { zmiana: stary, status: 'converted' });
    const b = lead(db, { zmiana: stary, userId: uid });
    const c = lead(db, { zmiana: stary, email: 'klient@firma.pl' });
    const d = lead(db, { zmiana: stary });
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.leady.id).toEqual([d]);
    expect(w.leady.klienci_chronieni).toBe(3);
    expect([a, b, c, d].map((i) => istnieje(db, i))).toEqual([true, true, true, false]);
  });

  it('(−) stare leady z formularza i kalkulatora nie są ruszane', async () => {
    const { env, db } = srodowisko();
    const f = lead(db, { zmiana: miesiaceTemu(20), source: 'website' });
    const k = lead(db, { zmiana: miesiaceTemu(20), source: 'calculator' });
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.leady.do_usuniecia).toBe(0);
    expect(istnieje(db, f) && istnieje(db, k)).toBe(true);
  });

  it('(+) liczy się moment audytu (created_at): późniejsza zmiana leada nie przedłuża 12 miesięcy (MIX-1842)', async () => {
    const { env, db } = srodowisko();
    // Audyt 13 miesięcy temu, lead zmieniony 2 miesiące temu: kasowany.
    const staryAudyt = lead(db, { zmiana: miesiaceTemu(13) });
    db.prepare('UPDATE leads SET updated_at = ? WHERE id = ?').run(
      czasD1(miesiaceTemu(2)),
      staryAudyt,
    );
    // Audyt 11 miesięcy temu, a updated_at (np. z importu) sprzed 18 miesięcy: zostaje.
    const nowyAudyt = lead(db, { zmiana: miesiaceTemu(11) });
    db.prepare('UPDATE leads SET updated_at = ? WHERE id = ?').run(
      czasD1(miesiaceTemu(18)),
      nowyAudyt,
    );
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.leady.id).toEqual([staryAudyt]);
    expect([istnieje(db, staryAudyt), istnieje(db, nowyAudyt)]).toEqual([false, true]);
  });

  it('(+) brak created_at: liczy się updated_at (lead bez daty audytu nie zostaje na zawsze)', async () => {
    const { env, db } = srodowisko();
    const id = lead(db, { zmiana: miesiaceTemu(13) });
    db.prepare('UPDATE leads SET created_at = NULL WHERE id = ?').run(id);
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.leady.id).toEqual([id]);
    expect(istnieje(db, id)).toBe(false);
  });

  it('(−) wyścig: lead, który został klientem między SELECT a DELETE, zostaje razem z wierszem kolejki', async () => {
    const { env, db } = srodowisko();
    db.exec('PRAGMA foreign_keys = OFF');
    const a = lead(db, { zmiana: miesiaceTemu(13), kolejka: true });
    const b = lead(db, { zmiana: miesiaceTemu(13), kolejka: true, email: 'b@firma-b.pl' });
    const c = lead(db, { zmiana: miesiaceTemu(13), kolejka: true });
    const baza = env.DB as { prepare: (s: string) => unknown; batch: (l: unknown[]) => unknown };
    let zmieniony = false;
    env.DB = {
      prepare: (sql: string) => {
        // Zapytanie o chronionych idzie po wyborze kandydatów, a przed DELETE.
        if (!zmieniony && sql.includes('count(*)')) {
          zmieniony = true;
          db.prepare(`UPDATE leads SET status = 'converted' WHERE id = ?`).run(a);
          db.prepare(
            `INSERT INTO users (email, name, role) VALUES ('B@firma-b.pl', 'B', 'client')`,
          ).run();
        }
        return baza.prepare(sql);
      },
      batch: (l: unknown[]) => baza.batch(l),
    };
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(zmieniony).toBe(true);
    expect(w.leady.do_usuniecia).toBe(3);
    expect(w.leady.usuniete).toBe(1);
    expect([a, b, c].map((i) => istnieje(db, i))).toEqual([true, true, false]);
    const kolejka = db.prepare('SELECT lead_id FROM linear_leady ORDER BY lead_id').all() as {
      lead_id: string;
    }[];
    expect(kolejka.map((x) => x.lead_id)).toEqual([a, b].sort());
  });

  it('(−) błąd przy kasowaniu leada cofa też kasowanie wiersza kolejki (jedna transakcja)', async () => {
    const { env, db } = srodowisko();
    db.exec('PRAGMA foreign_keys = OFF');
    const id = lead(db, { zmiana: miesiaceTemu(13), kolejka: true });
    db.exec(
      `CREATE TRIGGER blokada BEFORE DELETE ON leads BEGIN SELECT RAISE(ABORT, 'blokada'); END`,
    );
    await expect(wykonajRetencje(env as never, { proba: false, teraz: TERAZ })).rejects.toThrow();
    expect(istnieje(db, id)).toBe(true);
    const kolejka = db.prepare('SELECT lead_id FROM linear_leady').all() as { lead_id: string }[];
    expect(kolejka.map((x) => x.lead_id)).toEqual([id]);
  });

  it('(+) usuwa też wiersz kolejki Lineara usuwanego leada; wiersz chronionego zostaje', async () => {
    const { env, db } = srodowisko();
    // Bez kaskady klucza obcego: usunięcie wiersza kolejki ma wynikać z kodu, nie z ustawienia bazy.
    db.exec('PRAGMA foreign_keys = OFF');
    const stary = lead(db, { zmiana: miesiaceTemu(13), kolejka: true });
    const klient = lead(db, { zmiana: miesiaceTemu(13), status: 'converted', kolejka: true });
    await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    const kolejka = db.prepare('SELECT lead_id FROM linear_leady').all() as { lead_id: string }[];
    expect(kolejka.map((x) => x.lead_id)).toEqual([klient]);
    expect(istnieje(db, stary)).toBe(false);
  });

  it('(+) ponad 50 leadów: kasowanie w paczkach (limit parametrów D1), wszystkie usunięte', async () => {
    const { env, db } = srodowisko();
    for (let i = 0; i < 120; i++) lead(db, { zmiana: miesiaceTemu(13) });
    const w = await wykonajRetencje(env as never, { proba: false, teraz: TERAZ });
    expect(w.leady.usuniete).toBe(120);
    expect((db.prepare('SELECT count(*) AS n FROM leads').get() as { n: number }).n).toBe(0);
  });

  it('(+) próg 12 miesięcy: ta sama data rok wcześniej (UTC)', () => {
    expect(czasD1(progLeada(TERAZ))).toBe('2025-11-16 12:00:00');
    expect(czasD1(progLeada(Date.parse('2027-03-31T00:30:00Z')))).toBe('2026-03-31 00:30:00');
    expect(czasD1(progLeada(Date.parse('2028-03-01T06:00:00Z')))).toBe('2027-03-01 06:00:00');
  });

  it('(−) 29 lutego: próg to 28 lutego rok wcześniej, lead z 1 marca nie znika za wcześnie', async () => {
    const teraz = Date.parse('2028-02-29T12:00:00Z');
    expect(czasD1(progLeada(teraz))).toBe('2027-02-28 12:00:00');
    const { env, db } = srodowisko();
    const marzec = lead(db, { zmiana: Date.parse('2027-03-01T06:00:00Z') });
    const luty = lead(db, { zmiana: Date.parse('2027-02-28T11:59:59Z') });
    const w = await wykonajRetencje(env as never, { proba: false, teraz });
    expect(w.leady.id).toEqual([luty]);
    expect([istnieje(db, marzec), istnieje(db, luty)]).toEqual([true, false]);
  });
});

describe('tryb próbny i log', () => {
  it('(+) proba: liczy i wypisuje id, ale niczego nie usuwa', async () => {
    const { env, db, pliki, usuniete } = srodowisko();
    pliki.set('audit/stary.pdf', TERAZ - 31 * DZIEN);
    const id = lead(db, { zmiana: miesiaceTemu(13) });
    const w = await wykonajRetencje(env as never, { proba: true, teraz: TERAZ });
    expect(w.tryb).toBe('proba');
    expect(w.pdf).toMatchObject({ do_usuniecia: 1, usuniete: 0, klucze: ['audit/stary.pdf'] });
    expect(w.leady).toMatchObject({ do_usuniecia: 1, usuniete: 0, id: [id] });
    expect(pliki.has('audit/stary.pdf')).toBe(true);
    expect(usuniete).toEqual([]);
    expect(istnieje(db, id)).toBe(true);
  });

  it('(−) log i odpowiedź bez adresu e-mail i nazwy leada: tylko liczby, id i klucze', async () => {
    const { env, db } = srodowisko();
    lead(db, { zmiana: miesiaceTemu(13), email: 'tajny.adres@przyklad-firmy.pl' });
    // Najpierw próba (lead jeszcze jest w bazie), potem kasowanie.
    const proba = await wywolaj(await zadanie({ body: '{"proba":true}' }), env);
    const odp = await wywolaj(await zadanie(), env);
    const tekst = (await proba.text()) + (await odp.text());
    const wszystko = [tekst, ...logi].join('\n');
    expect(wszystko).not.toContain('tajny.adres');
    expect(wszystko).not.toContain('@');
    expect(wszystko).not.toContain('Lead z audytu');
    expect(logi.some((l) => l.startsWith('[audyt:retencja] '))).toBe(true);
  });
});

describe('czyProba: kasowanie tylko przy fladze i poza Preview', () => {
  it.each([
    [{}, {}, true],
    [{ AUDIT_RETENCJA_KASUJ: 'TAK' }, {}, true],
    [{ AUDIT_RETENCJA_KASUJ: '1' }, { proba: false }, true],
    [{ AUDIT_RETENCJA_KASUJ: 'tak' }, {}, false],
    [{ AUDIT_RETENCJA_KASUJ: 'tak' }, { proba: true }, true],
    [{ AUDIT_RETENCJA_KASUJ: 'tak', SRODOWISKO: 'preview' }, {}, true],
    [{ AUDIT_RETENCJA_KASUJ: 'tak', SRODOWISKO: 'preview' }, { proba: true }, true],
    [{ AUDIT_RETENCJA_KASUJ: 'tak', SRODOWISKO: 'preview' }, { proba: false }, false],
    [{ AUDIT_RETENCJA_KASUJ: 'tak', SRODOWISKO: 'Preview' }, {}, true],
    [{ AUDIT_RETENCJA_KASUJ: 'tak', SRODOWISKO: ' PREVIEW ' }, {}, true],
    [{ AUDIT_RETENCJA_KASUJ: 'tak', SRODOWISKO: 'Preview' }, { proba: false }, false],
  ])('env %j body %j → proba %s', (env, body, oczekiwane) => {
    expect(czyProba(env as never, body)).toBe(oczekiwane);
  });
});

describe('POST /api/audit/retencja', () => {
  it('(+) poprawny podpis, flaga tak, produkcja: 200 i kasowanie', async () => {
    const { env, db, pliki } = srodowisko();
    pliki.set('audit/stary.pdf', TERAZ - 31 * DZIEN);
    const id = lead(db, { zmiana: miesiaceTemu(13) });
    const odp = await wywolaj(await zadanie(), env);
    expect(odp.status).toBe(200);
    expect(odp.headers.get('Cache-Control')).toBe('no-store');
    const dane = (await odp.json()) as {
      tryb: string;
      pdf: { usuniete: number };
      leady: { usuniete: number };
    };
    expect(dane.tryb).toBe('kasowanie');
    expect(dane.pdf.usuniete).toBe(1);
    expect(dane.leady.usuniete).toBe(1);
    expect(istnieje(db, id)).toBe(false);
  });

  it('(−) Preview bez jawnego proba:false: tryb próbny, nic nie znika', async () => {
    const { env, db, pliki } = srodowisko({ SRODOWISKO: 'preview' });
    pliki.set('audit/stary.pdf', TERAZ - 31 * DZIEN);
    const id = lead(db, { zmiana: miesiaceTemu(13) });
    const odp = await wywolaj(await zadanie(), env);
    expect(((await odp.json()) as { tryb: string }).tryb).toBe('proba');
    expect(pliki.size).toBe(1);
    expect(istnieje(db, id)).toBe(true);
  });

  it('(−) bez flagi AUDIT_RETENCJA_KASUJ: tryb próbny', async () => {
    const { env, db } = srodowisko({ AUDIT_RETENCJA_KASUJ: undefined });
    const id = lead(db, { zmiana: miesiaceTemu(13) });
    const odp = await wywolaj(await zadanie({ body: '{"proba":false}' }), env);
    expect(((await odp.json()) as { tryb: string }).tryb).toBe('proba');
    expect(istnieje(db, id)).toBe(true);
  });

  it('(−) brak sekretu albo za krótki: 503 z komunikatem retencji (nie CRM)', async () => {
    for (const s of [undefined, 'x'.repeat(31)]) {
      const { env } = srodowisko({ AUDIT_RETENCJA_SECRET: s });
      const odp = await wywolaj(await zadanie(), env);
      expect(odp.status).toBe(503);
      expect(await odp.json()).toEqual({ blad: 'Retencja audytu jest wyłączona.' });
    }
  });

  it('(−) podpis innym sekretem albo prefiksem ponow: 401, nic nie znika', async () => {
    const { env, db } = srodowisko();
    const id = lead(db, { zmiana: miesiaceTemu(13) });
    expect((await wywolaj(await zadanie({ sekret: 'z'.repeat(64) }), env)).status).toBe(401);
    expect((await wywolaj(await zadanie({ prefiks: PREFIKS_PONOW }), env)).status).toBe(401);
    expect(istnieje(db, id)).toBe(true);
  });

  it('(−) GET: 405 z Allow: POST', async () => {
    const { env } = srodowisko();
    const odp = await wywolaj(await zadanie({ metoda: 'GET' }), env);
    expect(odp.status).toBe(405);
    expect(odp.headers.get('Allow')).toBe('POST');
  });

  it('(−) zły body: 400', async () => {
    const { env } = srodowisko();
    for (const body of ['[1]', '{"proba":"tak"}', 'nie-json', 'x'.repeat(1025)]) {
      expect((await wywolaj(await zadanie({ body }), env)).status).toBe(400);
    }
  });

  it('(−) błąd D1: 500 bez szczegółów', async () => {
    const { env } = srodowisko();
    env.DB = {
      prepare: (sql: string) => {
        if (sql.includes('crm_zapytania')) return d1Sqlite(MIGRACJE).DB.prepare(sql);
        throw new Error('D1 padło: tajny.adres@x.pl');
      },
    };
    const odp = await wywolaj(await zadanie(), env);
    expect(odp.status).toBe(500);
    expect([await odp.text(), ...logi].join('\n')).not.toContain('tajny.adres');
  });
});

describe('skrypt timera scripts/audit-retencja.mjs', () => {
  it('podpis skryptu jest zgodny z podpisem sprawdzanym po stronie funkcji', async () => {
    const nonce = '123e4567-e89b-42d3-a456-426614174000';
    expect(podpisRetencji(SEKRET, '1763294400', nonce)).toBe(
      await podpiszZapytanie(SEKRET, '1763294400', nonce, 'POST', SCIEZKA, PREFIKS_RETENCJA),
    );
  });
});
