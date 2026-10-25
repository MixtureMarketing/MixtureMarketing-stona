import { describe, it, expect } from 'vitest';
import { d1Sqlite } from '../../../tests/helpers/d1Sqlite';
import { podpiszZapytanie, bladPodpisu } from './_podpis';
import { onRequestGet as leady } from './leady';

// API dla Mixture CRM: dociąganie leadów. Podpis: osobny sekret, prefiks kierunku, nonce, okno 300 s,
// powtórzenie 409. Wszystko na prawdziwym SQLite z migracjami strony.
const SEKRET = 'b'.repeat(64);
const MIGRACJE = [
  '0001_init.sql',
  '0002_leads_add_source_company.sql',
  '0003_estimation_core.sql',
  '0004_est_modules_goals.sql',
  '0005_est_snapshot_offer_fields.sql',
  '0006_est_quote_lifecycle.sql',
  '0007_est_client_content.sql',
  '0008_est_quote_closed.sql',
  '0009_leads_updated_at.sql',
];

async function zapytanie(
  sciezka: string,
  o: { sekret?: string; czas?: number; podpis?: string; nonce?: string } = {},
) {
  const czas = String(o.czas ?? Math.floor(Date.now() / 1000));
  const nonce = o.nonce ?? crypto.randomUUID();
  const podpis =
    o.podpis ?? (await podpiszZapytanie(o.sekret ?? SEKRET, czas, nonce, 'GET', sciezka));
  return new Request(`https://mixturemarketing.pl${sciezka}`, {
    headers: {
      'X-Mixture-Timestamp': czas,
      'X-Mixture-Nonce': nonce,
      'X-Mixture-Signature': podpis,
    },
  });
}

function baza() {
  const { DB, db } = d1Sqlite(MIGRACJE);
  const lead = (id: string, o: Record<string, unknown> = {}) =>
    db
      .prepare(
        `INSERT INTO leads (id, name, email, company, service_type, website, budget, details, current_step,
           source, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
      .run(
        id,
        (o.name as string) ?? null,
        (o.email as string) ?? `${id}@x.test`,
        (o.company as string) ?? null,
        (o.service_type as string) ?? null,
        (o.website as string) ?? null,
        (o.budget as string) ?? null,
        (o.details as string) ?? null,
        (o.current_step as number) ?? 1,
        (o.source as string) ?? 'website',
        (o.created_at as string) ?? '2026-10-20 10:00:00',
      );
  const env = { DB, CRM_STRONA_SECRET: SEKRET };
  return { DB, db, lead, env };
}

const wywolaj = async (f: unknown, request: Request, env: unknown) =>
  (f as (c: unknown) => Promise<Response>)({ request, env });

type Odpowiedz = {
  leady: Record<string, unknown>[];
  kursor: { od: string; po_id: string } | null;
  wiecej: boolean;
};

describe('podpis zapytań CRM', () => {
  it('poprawny podpis przechodzi; zły sekret, stary czas, brak nonce albo podpisu: 401; brak sekretu: 503', async () => {
    const { env, DB } = baza();
    expect(await bladPodpisu(await zapytanie('/api/crm/leady'), env)).toBeNull();
    expect(
      (await bladPodpisu(await zapytanie('/api/crm/leady', { sekret: 'c'.repeat(64) }), env))
        ?.status,
    ).toBe(401);
    const stary = Math.floor(Date.now() / 1000) - 301;
    expect(
      (await bladPodpisu(await zapytanie('/api/crm/leady', { czas: stary }), env))?.status,
    ).toBe(401);
    const bezNonce = await zapytanie('/api/crm/leady');
    const h = new Headers(bezNonce.headers);
    h.delete('X-Mixture-Nonce');
    expect((await bladPodpisu(new Request(bezNonce.url, { headers: h }), env))?.status).toBe(401);
    expect(
      (await bladPodpisu(new Request('https://mixturemarketing.pl/api/crm/leady'), env))?.status,
    ).toBe(401);
    expect((await bladPodpisu(await zapytanie('/api/crm/leady'), { DB }))?.status).toBe(503);
  });

  it('podpis obejmuje zapytanie i nonce: podmiana parametru albo nonce nie przechodzi', async () => {
    const { env } = baza();
    const podpisany = await zapytanie('/api/crm/leady?od=2026-10-01');
    const podmieniony = new Request('https://mixturemarketing.pl/api/crm/leady?od=2026-01-01', {
      headers: podpisany.headers,
    });
    expect((await bladPodpisu(podmieniony, env))?.status).toBe(401);
    const h = new Headers(podpisany.headers);
    h.set('X-Mixture-Nonce', crypto.randomUUID());
    expect((await bladPodpisu(new Request(podpisany.url, { headers: h }), env))?.status).toBe(401);
  });

  it('to samo podpisane zapytanie drugi raz w oknie: 409; stare wpisy rejestru są czyszczone', async () => {
    const { env, db } = baza();
    const nonce = crypto.randomUUID();
    const czas = Math.floor(Date.now() / 1000);
    expect(await bladPodpisu(await zapytanie('/api/crm/leady', { nonce, czas }), env)).toBeNull();
    expect(
      (await bladPodpisu(await zapytanie('/api/crm/leady', { nonce, czas }), env))?.status,
    ).toBe(409);
    db.prepare(
      "INSERT INTO crm_zapytania (skrot, created_at) VALUES ('stary', '2020-01-01 00:00:00')",
    ).run();
    await bladPodpisu(await zapytanie('/api/crm/leady'), env);
    expect(
      db.prepare("SELECT count(*) AS n FROM crm_zapytania WHERE skrot = 'stary'").get(),
    ).toEqual({ n: 0 });
  });
});

describe('GET /api/crm/leady', () => {
  it('mapuje wiersz na format wysyłki do CRM, z numerem wyceny i krokami formularza', async () => {
    const { db, lead, env } = baza();
    lead('a1', {
      name: 'Ola',
      company: 'Kłos',
      service_type: 'Sklep',
      budget: '10–30 tys.',
      details: '{"x":1}',
      current_step: 2,
    });
    lead('k1', {
      source: 'calculator',
      details: '{"priceRange":{"min":4500,"max":8000}}',
      created_at: '2026-10-21 09:00:00',
    });
    db.prepare(
      `INSERT INTO est_quotes (hourly_rate, params_json, engine_version, id, lead_id, name, archetype_code, status)
       VALUES (150, '{}', '1.0', 7, 'k1', 'Kalkulator', 'landing', 'draft')`,
    ).run();
    const odp = await wywolaj(leady, await zapytanie('/api/crm/leady?od=2026-10-01'), env);
    expect(odp.status).toBe(200);
    const r = (await odp.json()) as Odpowiedz;
    expect(r.wiecej).toBe(false);
    expect(r.kursor).toEqual({ od: '2026-10-21 09:00:00', po_id: 'k1' });
    expect(r.leady[0]).toMatchObject({
      external_id: 'a1',
      source: 'website',
      received_at: '2026-10-20T10:00:00Z',
      name: 'Ola',
      company: 'Kłos',
      service: 'Sklep',
      budget_text: '10–30 tys.',
      details: { x: 1 },
      form_step: 2,
      form_steps: 3,
    });
    expect(r.leady[1]).toMatchObject({
      external_id: 'k1',
      source: 'calculator',
      quote_ref: '7',
      form_steps: null,
    });
  });

  it('stronicuje po (czas zmiany, id) z kursora, bez gubienia leadów z tym samym czasem', async () => {
    const { lead, env } = baza();
    for (const id of ['b', 'a', 'c']) lead(id, { created_at: '2026-10-20 10:00:00' });
    lead('d', { created_at: '2026-10-19 10:00:00' });
    const r1 = (await (
      await wywolaj(leady, await zapytanie('/api/crm/leady?od=2026-10-01&limit=2'), env)
    ).json()) as Odpowiedz;
    expect(r1.leady.map((l) => l.external_id)).toEqual(['d', 'a']);
    expect(r1.wiecej).toBe(true);
    const dalej = `/api/crm/leady?od=${encodeURIComponent(r1.kursor!.od)}&po_id=${r1.kursor!.po_id}&limit=2`;
    const r2 = (await (await wywolaj(leady, await zapytanie(dalej), env)).json()) as Odpowiedz;
    expect(r2.leady.map((l) => l.external_id)).toEqual(['b', 'c']);
    expect(r2.wiecej).toBe(false);
  });

  it('zły parametr: 400; bez podpisu: 401', async () => {
    const { env } = baza();
    expect((await wywolaj(leady, await zapytanie('/api/crm/leady?limit=500'), env)).status).toBe(
      400,
    );
    expect((await wywolaj(leady, await zapytanie('/api/crm/leady?od=wczoraj'), env)).status).toBe(
      400,
    );
    expect(
      (await wywolaj(leady, new Request('https://mixturemarketing.pl/api/crm/leady'), env)).status,
    ).toBe(401);
  });
});

describe('czas zmiany leada (migracja 0009)', () => {
  it('backfill i wyzwalacze: INSERT bierze created_at, każdy UPDATE ustawia teraz', async () => {
    const { db, lead } = baza();
    lead('z1', { created_at: '2026-10-20 10:00:00' });
    const czas = () =>
      (db.prepare('SELECT updated_at FROM leads WHERE id = ?').get('z1') as { updated_at: string })
        .updated_at;
    expect(czas()).toBe('2026-10-20 10:00:00');
    db.prepare("UPDATE leads SET current_step = 2 WHERE id = 'z1'").run();
    expect(czas() > '2026-10-20 10:00:00').toBe(true);
    // UPDATE, który sam ustawia updated_at, zostaje przy swojej wartości.
    db.prepare(
      "UPDATE leads SET status = 'contacted', updated_at = '2030-01-01 00:00:00' WHERE id = 'z1'",
    ).run();
    expect(czas()).toBe('2030-01-01 00:00:00');
  });

  it('lead z krokiem 1 sprzed tygodni, dokończony później, wraca po czasie zmiany', async () => {
    const { db, lead, env } = baza();
    lead('s1', { created_at: '2026-09-01 10:00:00', current_step: 1 });
    db.prepare(
      "UPDATE leads SET current_step = 3, updated_at = '2026-10-24 12:00:00' WHERE id = 's1'",
    ).run();
    const r = (await (
      await wywolaj(leady, await zapytanie('/api/crm/leady?od=2026-10-11'), env)
    ).json()) as Odpowiedz;
    expect(r.leady).toMatchObject([
      { external_id: 's1', form_step: 3, received_at: '2026-09-01T10:00:00Z' },
    ]);
  });
});
