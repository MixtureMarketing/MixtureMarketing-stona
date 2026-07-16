import { describe, it, expect } from 'vitest';
import { onRequestPost } from './quote-status';

// TDD: ten plik powstał PRZED quote-status.ts (ZASADY-PRACY §1).
//
// Sedno: legalności przejść pilnuje API, nie UI (D30). Przycisk, którego nie widać, nie jest
// zabezpieczeniem — jest dekoracją. Poniżej pełna macierz: co wolno, czego nie, i dlaczego.

interface MockOpts {
  quoteRow?: Record<string, unknown> | null;
}
function mockEnv(opts: MockOpts = {}) {
  const calls = { binds: [] as { sql: string; args: unknown[] }[] };
  const makeStmt = (sql: string) => ({
    bind: (...args: unknown[]) => {
      calls.binds.push({ sql, args });
      return {
        first: async () => (sql.includes('FROM est_quotes') ? (opts.quoteRow ?? null) : null),
        all: async () => ({ results: [] }),
        run: async () => ({ meta: { changes: 1 } }),
      };
    },
    first: async () => null,
    all: async () => ({ results: [] }),
    run: async () => ({ meta: { changes: 1 } }),
  });
  return { DB: { prepare: (sql: string) => makeStmt(sql) }, calls };
}

const ctx = (env: unknown, body?: unknown): never =>
  ({ env, request: { json: async () => body } }) as never;

/** Wycena gotowa do wysyłki: po finalize (review) i z OBOMA dokumentami w R2. */
const GOTOWA = {
  id: 4,
  status: 'review',
  lost_reason: null,
  pdf_r2_key: 'quotes/4/oferta.pdf',
  card_r2_key: 'quotes/4/karta-decyzji.pdf',
};

const wywolaj = async (quoteRow: Record<string, unknown> | null, body: unknown) => {
  const { DB, calls } = mockEnv({ quoteRow });
  const res = (await onRequestPost(ctx({ DB }, body))) as Response;
  return { res, body: await res.json(), calls };
};

describe('quote-status — przejścia LEGALNE', () => {
  it('review → sent: stempluje sent_at', async () => {
    const { res, body, calls } = await wywolaj(GOTOWA, { id: 4, status: 'sent' });
    expect(res.status).toBe(200);
    expect((body as { status: string }).status).toBe('sent');
    const upd = calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'));
    expect(upd, 'brak UPDATE').toBeTruthy();
    expect(upd!.sql).toContain('sent_at');
  });

  it('sent → won: stempluje won_at', async () => {
    const { res, body, calls } = await wywolaj(
      { ...GOTOWA, status: 'sent' },
      { id: 4, status: 'won' },
    );
    expect(res.status).toBe(200);
    expect((body as { status: string }).status).toBe('won');
    expect(calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'))!.sql).toContain('won_at');
  });

  it('sent → lost z powodem: stempluje lost_at i zapisuje powód', async () => {
    const { res, calls } = await wywolaj(
      { ...GOTOWA, status: 'sent' },
      { id: 4, status: 'lost', lost_reason: 'Klient wybrał tańszą ofertę' },
    );
    expect(res.status).toBe(200);
    const upd = calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'))!;
    expect(upd.sql).toContain('lost_at');
    expect(upd.args).toContain('Klient wybrał tańszą ofertę');
  });
});

describe('quote-status — przejścia NIELEGALNE (409)', () => {
  // Każdy przypadek to realny scenariusz kliknięcia, nie teoria: pominięcie finalize,
  // ogłoszenie wygranej przed wysłaniem, cofnięcie wysłanej oferty do edycji,
  // zmiana zdania po rozstrzygnięciu.
  const nielegalne: [string, string, string][] = [
    ['draft', 'sent', 'wysyłka z pominięciem finalize'],
    ['draft', 'won', 'wygrana bez oferty'],
    ['review', 'won', 'wygrana przed wysłaniem'],
    ['review', 'lost', 'przegrana przed wysłaniem'],
    ['sent', 'review', 'cofnięcie wysłanej oferty do edycji'],
    ['sent', 'draft', 'cofnięcie wysłanej oferty do szkicu'],
    ['won', 'lost', 'zmiana zdania po rozstrzygnięciu'],
    ['lost', 'won', 'zmiana zdania po rozstrzygnięciu'],
    ['won', 'sent', 'ponowna wysyłka rozstrzygniętej'],
    // `closed` JEST w słowniku modelu (docs/02), ale nic jeszcze do niego nie prowadzi —
    // dołoży to F3 po wpisaniu godzin rzeczywistych. Do tego czasu 409, nie 400: żądanie
    // jest sensowne, tylko przedwczesne.
    ['won', 'closed', 'zamknięcie należy do F3, nie do tego endpointu'],
  ];
  it.each(nielegalne)('%s → %s jest zablokowane (%s)', async (z, na) => {
    const { res } = await wywolaj(
      { ...GOTOWA, status: z },
      { id: 4, status: na, lost_reason: 'x' },
    );
    expect(res.status).toBe(409);
  });

  it('nie ma UPDATE, gdy przejście jest nielegalne', async () => {
    const { calls } = await wywolaj({ ...GOTOWA, status: 'draft' }, { id: 4, status: 'sent' });
    expect(calls.binds.some((b) => b.sql.includes('UPDATE est_quotes'))).toBe(false);
  });
});

describe('quote-status — guard „sent = dokumenty istnieją" (D30)', () => {
  it('review → sent BEZ uploadu dokumentów: 409', async () => {
    const { res, body } = await wywolaj(
      { ...GOTOWA, pdf_r2_key: null, card_r2_key: null },
      { id: 4, status: 'sent' },
    );
    expect(res.status).toBe(409);
    expect((body as { error: string }).error).toMatch(/dokument/i);
  });

  it('review → sent z SAMĄ ofertą (bez Karty): 409', async () => {
    // Dokumenty są dwa (D28). Jeden to nie „wysłane".
    const { res } = await wywolaj({ ...GOTOWA, card_r2_key: null }, { id: 4, status: 'sent' });
    expect(res.status).toBe(409);
  });

  it('review → sent z SAMĄ Kartą (bez oferty): 409', async () => {
    const { res } = await wywolaj({ ...GOTOWA, pdf_r2_key: null }, { id: 4, status: 'sent' });
    expect(res.status).toBe(409);
  });

  it('guard NIE blokuje won/lost — dokumenty sprawdzamy przy wysyłce, nie po niej', async () => {
    const { res } = await wywolaj(
      { ...GOTOWA, status: 'sent', pdf_r2_key: null, card_r2_key: null },
      { id: 4, status: 'won' },
    );
    expect(res.status).toBe(200);
  });
});

describe('quote-status — lost_reason jest wymagany (docs/02)', () => {
  it('sent → lost bez powodu: 400', async () => {
    const { res, body } = await wywolaj({ ...GOTOWA, status: 'sent' }, { id: 4, status: 'lost' });
    expect(res.status).toBe(400);
    expect((body as { error: string }).error).toMatch(/powód|powod/i);
  });

  it('sent → lost z pustym/białym powodem: 400', async () => {
    // Powód to dane kalibracji handlowej F3, nie pole do odklikania.
    for (const pusty of ['', '   ']) {
      const { res } = await wywolaj(
        { ...GOTOWA, status: 'sent' },
        { id: 4, status: 'lost', lost_reason: pusty },
      );
      expect(res.status, `powód=„${pusty}"`).toBe(400);
    }
  });

  it('powód przy won jest ignorowany, nie zapisywany', async () => {
    const { calls } = await wywolaj(
      { ...GOTOWA, status: 'sent' },
      { id: 4, status: 'won', lost_reason: 'nieistotne' },
    );
    const upd = calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'))!;
    expect(upd.args).not.toContain('nieistotne');
  });
});

describe('quote-status — wejście', () => {
  it('brak id: 400', async () => {
    const { res } = await wywolaj(GOTOWA, { status: 'sent' });
    expect(res.status).toBe(400);
  });

  it('nieistniejąca wycena: 404', async () => {
    const { res } = await wywolaj(null, { id: 999, status: 'sent' });
    expect(res.status).toBe(404);
  });

  it('status spoza słownika: 400 (nie 409 — to nie jest przejście, to śmieć)', async () => {
    // Rozróżnienie jest celowe: 400 = nie wiem, o czym mówisz; 409 = wiem, ale nie teraz.
    // Status z modelu, którego przejście jest niedozwolone, ma dostać 409 (wyżej).
    for (const zly of ['DELETED', '', 'sent; DROP TABLE est_quotes', 'SENT']) {
      const { res } = await wywolaj(GOTOWA, { id: 4, status: zly });
      expect(res.status, `status=„${zly}"`).toBe(400);
    }
  });
});
