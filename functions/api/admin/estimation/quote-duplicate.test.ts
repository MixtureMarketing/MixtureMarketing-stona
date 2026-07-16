import { describe, it, expect } from 'vitest';
import { onRequestPost } from './quote-duplicate';

// TDD: powstało PRZED quote-duplicate.ts (ZASADY-PRACY §1).
//
// Przypadek z życia: „klient prosi o poprawkę, ale wysłanej wersji nie wolno ruszyć".
// Duplikat to NOWA wycena w draftcie z odpowiedziami źródłowej — bez snapshotu, bez statusu,
// bez dokumentów. Źródło zostaje NIETKNIĘTE (inwariant 3) i to jest tu główna asercja.

interface MockOpts {
  quoteRow?: Record<string, unknown> | null;
  answers?: { question_code: string; answer_json: string }[];
  params?: { key: string; value: string }[];
}
function mockEnv(opts: MockOpts = {}) {
  const calls = { binds: [] as { sql: string; args: unknown[] }[], batched: [] as unknown[][] };
  const rowsFor = (sql: string): unknown[] => {
    if (sql.includes('est_quote_answers')) return opts.answers ?? [];
    if (sql.includes('est_params')) return opts.params ?? [{ key: 'hourly_rate', value: '50' }];
    return [];
  };
  const makeStmt = (sql: string) => ({
    bind: (...args: unknown[]) => {
      calls.binds.push({ sql, args });
      return {
        first: async () =>
          sql.includes('FROM est_quotes') && sql.includes('WHERE id')
            ? (opts.quoteRow ?? null)
            : null,
        all: async () => ({ results: rowsFor(sql) }),
        run: async () => ({ meta: { last_row_id: 77 } }),
      };
    },
    first: async () => null,
    all: async () => ({ results: rowsFor(sql) }),
    run: async () => ({ meta: { last_row_id: 77 } }),
  });
  return {
    DB: {
      prepare: (sql: string) => makeStmt(sql),
      batch: async (stmts: unknown[]) => {
        calls.batched.push(stmts);
        return [];
      },
    },
    calls,
  };
}

const wywolaj = async (
  quoteRow: Record<string, unknown> | null,
  body: unknown,
  opts: MockOpts = {},
) => {
  const env = mockEnv({ quoteRow, ...opts });
  const res = (await onRequestPost({
    env,
    request: { json: async () => body },
  } as never)) as Response;
  return { res, body: await res.json(), calls: env.calls };
};

/** Wycena wysłana klientowi: ma snapshot, status, dokumenty i wynik. */
const WYSLANA = {
  id: 4,
  name: 'Sklep meblowy',
  lead_id: 'lead-1',
  project_id: null,
  client_name: 'Meble sp. z o.o.',
  archetype_code: 'woocommerce',
  archetype_recommended: 'sylius',
  archetype_reason: 'Klient ma zespół PHP',
  status: 'sent',
  lost_reason: null,
  hourly_rate: 45,
  params_json: '{"hourly_rate":"45"}',
  confidence: 88,
  totals_json: '{"price":{"min":1,"max":2}}',
  pdf_r2_key: 'quotes/4/oferta.pdf',
  card_r2_key: 'quotes/4/karta-decyzji.pdf',
  sent_at: '2026-07-15 10:00:00',
};
const ODPOWIEDZI = [
  { question_code: 'traffic', answer_json: '"high"' },
  { question_code: 'sla', answer_json: '{"unknown":true}' },
];

const insertQuotes = (calls: { binds: { sql: string; args: unknown[] }[] }) =>
  calls.binds.find((b) => b.sql.includes('INSERT INTO est_quotes'))!;

describe('quote-duplicate — co kopiujemy', () => {
  it('tworzy NOWĄ wycenę w statusie draft', async () => {
    const { res, body, calls } = await wywolaj(WYSLANA, { id: 4 }, { answers: ODPOWIEDZI });
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ id: 77, status: 'draft' });
    expect(insertQuotes(calls).sql).toContain("'draft'");
  });

  it('kopiuje odpowiedzi źródłowej co do jednej', async () => {
    const { calls } = await wywolaj(WYSLANA, { id: 4 }, { answers: ODPOWIEDZI });
    const wstawione = calls.binds.filter((b) => b.sql.includes('INSERT INTO est_quote_answers'));
    expect(wstawione).toHaveLength(2);
    expect(wstawione.flatMap((b) => b.args)).toEqual(
      expect.arrayContaining(['traffic', '"high"', 'sla', '{"unknown":true}']),
    );
  });

  it('kopiuje pola archetypu (rekomendacja i powód rozjazdu zostają)', async () => {
    const { calls } = await wywolaj(WYSLANA, { id: 4 }, { answers: ODPOWIEDZI });
    const args = insertQuotes(calls).args;
    expect(args).toContain('woocommerce');
    expect(args).toContain('sylius');
    expect(args).toContain('Klient ma zespół PHP');
    expect(args).toContain('Meble sp. z o.o.');
  });

  it('nazwa dostaje „(rev 2)" (docs/02)', async () => {
    const { calls } = await wywolaj(WYSLANA, { id: 4 });
    expect(insertQuotes(calls).args).toContain('Sklep meblowy (rev 2)');
  });

  it('duplikat duplikatu to „(rev 3)", nie „(rev 2) (rev 2)"', async () => {
    const { calls } = await wywolaj({ ...WYSLANA, name: 'Sklep meblowy (rev 2)' }, { id: 4 });
    expect(insertQuotes(calls).args).toContain('Sklep meblowy (rev 3)');
  });

  it('własna nazwa z żądania wygrywa z automatem', async () => {
    const { calls } = await wywolaj(WYSLANA, { id: 4, name: 'Sklep — wariant tańszy' });
    expect(insertQuotes(calls).args).toContain('Sklep — wariant tańszy');
  });
});

describe('quote-duplicate — czego NIE kopiujemy (inwariant 3)', () => {
  it('duplikat nie dostaje snapshotu ani wyniku źródła', async () => {
    // Snapshot jest własnością wyceny, z której powstał. Skopiowany do draftu udawałby
    // wynik, którego nikt nie policzył — do pierwszego finalize byłby kłamstwem.
    const { calls } = await wywolaj(WYSLANA, { id: 4 }, { answers: ODPOWIEDZI });
    const wszystkieSql = calls.binds.map((b) => b.sql).join(' ');
    for (const tabela of ['est_quote_aspects', 'est_quote_items', 'est_quote_multipliers']) {
      expect(wszystkieSql, `snapshot skopiowany: ${tabela}`).not.toContain(tabela);
    }
    const args = insertQuotes(calls).args;
    expect(args, 'skopiowany totals_json').not.toContain('{"price":{"min":1,"max":2}}');
    expect(args, 'skopiowane confidence').not.toContain(88);
  });

  it('duplikat nie dziedziczy statusu, dat ani dokumentów źródła', async () => {
    const { calls } = await wywolaj(WYSLANA, { id: 4 });
    const ins = insertQuotes(calls);
    for (const kolumna of [
      'pdf_r2_key',
      'card_r2_key',
      'sent_at',
      'won_at',
      'lost_at',
      'lost_reason',
    ]) {
      expect(ins.sql, `duplikat dziedziczy ${kolumna}`).not.toContain(kolumna);
    }
    expect(ins.args).not.toContain('quotes/4/oferta.pdf');
    expect(ins.args).not.toContain('2026-07-15 10:00:00');
  });

  it('ŹRÓDŁO zostaje nietknięte — żadnego UPDATE ani DELETE', async () => {
    const { calls } = await wywolaj(WYSLANA, { id: 4 }, { answers: ODPOWIEDZI });
    const groźne = calls.binds.filter(
      (b) => b.sql.includes('UPDATE est_quotes') || b.sql.includes('DELETE'),
    );
    expect(groźne, 'duplikacja tknęła źródło').toHaveLength(0);
  });

  it('bierze ŚWIEŻE parametry, nie params_json źródła (to nowa wycena, z dzisiaj)', async () => {
    const { calls } = await wywolaj(
      WYSLANA,
      { id: 4 },
      { params: [{ key: 'hourly_rate', value: '60' }] },
    );
    const args = insertQuotes(calls).args;
    expect(args, 'zamrożona stara stawka').not.toContain(45);
    expect(args).toContain(60);
  });
});

describe('quote-duplicate — wejście', () => {
  it('duplikować wolno KAŻDY status (w tym draft — wariant „a co, gdyby")', async () => {
    for (const status of ['draft', 'review', 'sent', 'won', 'lost']) {
      const { res } = await wywolaj({ ...WYSLANA, status }, { id: 4 });
      expect(res.status, `status=${status}`).toBe(200);
    }
  });

  it('brak id: 400; nieistniejąca wycena: 404', async () => {
    expect((await wywolaj(WYSLANA, {})).res.status).toBe(400);
    expect((await wywolaj(null, { id: 999 })).res.status).toBe(404);
  });
});
