import { describe, it, expect } from 'vitest';
import { d1Sqlite } from '../../../tests/helpers/d1Sqlite';
import { podpiszZapytanie, bladPodpisu } from './_podpis';
import { onRequestGet as leady } from './leady';

// API dla Mixture CRM: dociąganie leadów. Podpis: HMAC z prefiksem kierunku, okno 300 s.
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
  o: { sekret?: string; czas?: number; podpis?: string } = {},
) {
  const czas = String(o.czas ?? Math.floor(Date.now() / 1000));
  const podpis = o.podpis ?? (await podpiszZapytanie(o.sekret ?? SEKRET, czas, 'GET', sciezka));
  return new Request(`https://mixturemarketing.pl${sciezka}`, {
    headers: { 'X-Mixture-Timestamp': czas, 'X-Mixture-Signature': podpis },
  });
}

function baza() {
  const { DB, db } = d1Sqlite(MIGRACJE);
  const lead = (id: string, o: Record<string, unknown> = {}) =>
    db
      .prepare(
        `INSERT INTO leads (id, name, email, phone, company, service_type, package_name, source_url, website, budget,
           message, details, current_step, source, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
      .run(
        id,
        (o.name as string) ?? null,
        (o.email as string) ?? `${id}@x.test`,
        null,
        (o.company as string) ?? null,
        (o.service_type as string) ?? null,
        null,
        null,
        (o.website as string) ?? null,
        (o.budget as string) ?? null,
        null,
        (o.details as string) ?? null,
        (o.current_step as number) ?? 1,
        (o.source as string) ?? 'website',
        (o.created_at as string) ?? '2026-10-20 10:00:00',
      );
  return { DB, db, lead };
}

const wywolaj = async (f: unknown, request: Request, env: unknown) =>
  (f as (c: unknown) => Promise<Response>)({ request, env });

describe('podpis zapytań CRM', () => {
  it('poprawny podpis przechodzi; zły sekret, stary czas i brak podpisu: 401; brak sekretu: 503', async () => {
    const env = { CRM_INGEST_SECRET: SEKRET };
    expect(await bladPodpisu(await zapytanie('/api/crm/leady'), env)).toBeNull();
    expect(
      (await bladPodpisu(await zapytanie('/api/crm/leady', { sekret: 'c'.repeat(64) }), env))
        ?.status,
    ).toBe(401);
    const stary = Math.floor(Date.now() / 1000) - 301;
    expect(
      (await bladPodpisu(await zapytanie('/api/crm/leady', { czas: stary }), env))?.status,
    ).toBe(401);
    expect(
      (await bladPodpisu(new Request('https://mixturemarketing.pl/api/crm/leady'), env))?.status,
    ).toBe(401);
    expect((await bladPodpisu(await zapytanie('/api/crm/leady'), {}))?.status).toBe(503);
  });

  it('podpis obejmuje zapytanie: inna wartość parametru nie przechodzi', async () => {
    const podpisany = await zapytanie('/api/crm/wycena?ref=1');
    const podmieniony = new Request('https://mixturemarketing.pl/api/crm/wycena?ref=2', {
      headers: podpisany.headers,
    });
    expect((await bladPodpisu(podmieniony, { CRM_INGEST_SECRET: SEKRET }))?.status).toBe(401);
  });
});

describe('GET /api/crm/leady', () => {
  it('mapuje wiersz na format wysyłki do CRM, z numerem wyceny i krokami formularza', async () => {
    const { DB, db, lead } = baza();
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
      `INSERT INTO est_quotes (hourly_rate, params_json, engine_version, id, lead_id, name, archetype_code, status) VALUES (150, '{}', '1.0', 7, 'k1', 'Kalkulator', 'landing', 'draft')`,
    ).run();
    const odp = await wywolaj(leady, await zapytanie('/api/crm/leady?od=2026-10-01'), {
      DB,
      CRM_INGEST_SECRET: SEKRET,
    });
    expect(odp.status).toBe(200);
    const { leady: lista, nastepna } = (await odp.json()) as {
      leady: Record<string, unknown>[];
      nastepna: unknown;
    };
    expect(nastepna).toBeNull();
    expect(lista[0]).toMatchObject({
      external_id: 'a1',
      source: 'website',
      received_at: '2026-10-20T10:00:00Z',
      name: 'Ola',
      company: 'Kłos',
      service: 'Sklep',
      budget_text: '10–30 tys.',
      details: { x: 1 },
      quote_ref: null,
      form_step: 2,
      form_steps: 3,
    });
    expect(lista[1]).toMatchObject({
      external_id: 'k1',
      source: 'calculator',
      quote_ref: '7',
      form_steps: null,
    });
  });

  it('stronicuje po (created_at, id) bez gubienia leadów z tym samym czasem', async () => {
    const { DB, lead } = baza();
    for (const id of ['b', 'a', 'c']) lead(id, { created_at: '2026-10-20 10:00:00' });
    lead('d', { created_at: '2026-10-19 10:00:00' });
    const env = { DB, CRM_INGEST_SECRET: SEKRET };
    const r1 = (await (
      await wywolaj(leady, await zapytanie('/api/crm/leady?od=2026-10-01&limit=2'), env)
    ).json()) as {
      leady: { external_id: string }[];
      nastepna: { od: string; po_id: string };
    };
    expect(r1.leady.map((l) => l.external_id)).toEqual(['d', 'a']);
    const dalej = `/api/crm/leady?od=${encodeURIComponent(r1.nastepna.od)}&po_id=${r1.nastepna.po_id}&limit=2`;
    const r2 = (await (await wywolaj(leady, await zapytanie(dalej), env)).json()) as {
      leady: { external_id: string }[];
      nastepna: unknown;
    };
    expect(r2.leady.map((l) => l.external_id)).toEqual(['b', 'c']);
    expect(r2.nastepna).toBeNull();
  });

  it('zły parametr: 400; bez podpisu: 401', async () => {
    const { DB } = baza();
    const env = { DB, CRM_INGEST_SECRET: SEKRET };
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
  it('wyzwalacze: INSERT bierze created_at, każdy UPDATE ustawia teraz', async () => {
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

  it('dalszy krok formularza wraca w dociąganiu po czasie zmiany, nie po dacie utworzenia', async () => {
    const { DB, db, lead } = baza();
    lead('s1', { created_at: '2026-09-01 10:00:00', current_step: 1 });
    db.prepare(
      "UPDATE leads SET current_step = 3, updated_at = '2026-10-24 12:00:00' WHERE id = 's1'",
    ).run();
    const env = { DB, CRM_INGEST_SECRET: SEKRET };
    const r = (await (
      await wywolaj(leady, await zapytanie('/api/crm/leady?od=2026-10-11'), env)
    ).json()) as {
      leady: { external_id: string; form_step: number; received_at: string }[];
    };
    expect(r.leady).toMatchObject([
      { external_id: 's1', form_step: 3, received_at: '2026-09-01T10:00:00Z' },
    ]);
  });
});
