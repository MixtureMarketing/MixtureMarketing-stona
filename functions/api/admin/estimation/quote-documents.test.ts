import { describe, it, expect } from 'vitest';
import { onRequestPost } from './quote-documents';

// TDD: powstało PRZED quote-documents.ts (ZASADY-PRACY §1).
//
// Endpoint przyjmuje WYGENEROWANE po stronie klienta PDF-y (jsPDF w przeglądarce, lazy chunk —
// SKILL.md) i kładzie je w R2 pod deterministycznym prefiksem quotes/{id}/. Klucze wracają
// do est_quotes, bo to one są warunkiem przejścia na `sent` (D30).

interface MockOpts {
  quoteRow?: Record<string, unknown> | null;
  putRzuca?: boolean;
}
function mockEnv(opts: MockOpts = {}) {
  const calls = {
    binds: [] as { sql: string; args: unknown[] }[],
    puts: [] as { key: string; typ: string | undefined; bajty: number }[],
  };
  const makeStmt = (sql: string) => ({
    bind: (...args: unknown[]) => {
      calls.binds.push({ sql, args });
      return {
        first: async () => (sql.includes('FROM est_quotes') ? (opts.quoteRow ?? null) : null),
        run: async () => ({ meta: { changes: 1 } }),
      };
    },
  });
  const FILES = {
    put: async (
      key: string,
      dane: ArrayBuffer,
      opcje?: { httpMetadata?: { contentType?: string } },
    ) => {
      if (opts.putRzuca) throw new Error('R2 padło');
      calls.puts.push({ key, typ: opcje?.httpMetadata?.contentType, bajty: dane.byteLength });
    },
  };
  return { DB: { prepare: (sql: string) => makeStmt(sql) }, FILES, calls };
}

/**
 * File „jak w Workers". jsdom implementuje File bez `arrayBuffer()` — runtime Cloudflare
 * je ma, więc to luka ŚRODOWISKA TESTOWEGO, nie kodu (ta sama, przez którą Blob z jsPDF
 * wymaga FileReadera w render.test.ts). Dokładamy metodę na instancji, zamiast naginać
 * produkcję: `instanceof File` zostaje prawdziwe, a test mierzy kod, nie jsdom.
 */
const pdf = (tresc: string) => {
  const f = new File([tresc], 'x.pdf', { type: 'application/pdf' });
  if (typeof f.arrayBuffer !== 'function') {
    Object.defineProperty(f, 'arrayBuffer', {
      value: async () => new TextEncoder().encode(tresc).buffer,
    });
  }
  return f;
};

const wywolaj = async (
  quoteRow: Record<string, unknown> | null,
  form: Record<string, string | File>,
  opts: MockOpts = {},
) => {
  const env = mockEnv({ quoteRow, ...opts });
  const fd = new FormData();
  for (const [k, v] of Object.entries(form)) fd.append(k, v);
  const res = (await onRequestPost({
    env,
    request: { formData: async () => fd },
  } as never)) as Response;
  return { res, body: await res.json(), calls: env.calls };
};

const WYCENA = { id: 4, status: 'review' };
const KOMPLET = { id: '4', oferta: pdf('%PDF-oferta'), karta: pdf('%PDF-karta') };

describe('quote-documents — zapis do R2', () => {
  it('kładzie OBA pliki pod prefiksem quotes/{id}/ i zwraca klucze', async () => {
    const { res, body, calls } = await wywolaj(WYCENA, KOMPLET);
    expect(res.status).toBe(200);
    expect(calls.puts.map((p) => p.key).sort()).toEqual([
      'quotes/4/karta-decyzji.pdf',
      'quotes/4/oferta.pdf',
    ]);
    expect(body).toMatchObject({
      pdf_r2_key: 'quotes/4/oferta.pdf',
      card_r2_key: 'quotes/4/karta-decyzji.pdf',
    });
  });

  it('zapisuje contentType application/pdf (inaczej przeglądarka pobiera śmieć)', async () => {
    const { calls } = await wywolaj(WYCENA, KOMPLET);
    expect(calls.puts.every((p) => p.typ === 'application/pdf')).toBe(true);
  });

  it('klucz jest DETERMINISTYCZNY — ponowny zapis nadpisuje, nie mnoży plików', async () => {
    // Bez tego każda regeneracja zostawiałaby w R2 kolejny osierocony plik, a `pdf_r2_key`
    // wskazywałby na ostatni. Prefiks per wycena = jeden komplet aktualnych dokumentów.
    const a = await wywolaj(WYCENA, KOMPLET);
    const b = await wywolaj(WYCENA, KOMPLET);
    expect(a.calls.puts.map((p) => p.key)).toEqual(b.calls.puts.map((p) => p.key));
  });

  it('zapisuje OBA klucze do est_quotes', async () => {
    const { calls } = await wywolaj(WYCENA, KOMPLET);
    const upd = calls.binds.find((b) => b.sql.includes('UPDATE est_quotes'));
    expect(upd, 'brak UPDATE').toBeTruthy();
    expect(upd!.sql).toContain('pdf_r2_key');
    expect(upd!.sql).toContain('card_r2_key');
    expect(upd!.args).toContain('quotes/4/oferta.pdf');
    expect(upd!.args).toContain('quotes/4/karta-decyzji.pdf');
  });
});

describe('quote-documents — odmowy', () => {
  it('nieistniejąca wycena: 404 i ZERO zapisów w R2', async () => {
    const { res, calls } = await wywolaj(null, KOMPLET);
    expect(res.status).toBe(404);
    expect(calls.puts).toHaveLength(0);
  });

  it('brak któregoś pliku: 400 i ZERO zapisów (komplet albo nic)', async () => {
    // Połowa kompletu w R2 to stan, w którym guard D30 dalej blokuje wysyłkę,
    // ale w koszyku leży plik-sierota. Wolimy odmówić.
    for (const niepelny of [
      { id: '4', oferta: pdf('%PDF') },
      { id: '4', karta: pdf('%PDF') },
      { id: '4' },
    ]) {
      const { res, calls } = await wywolaj(WYCENA, niepelny);
      expect(res.status).toBe(400);
      expect(calls.puts).toHaveLength(0);
    }
  });

  it('brak id: 400', async () => {
    const { res } = await wywolaj(WYCENA, { oferta: pdf('%PDF'), karta: pdf('%PDF') });
    expect(res.status).toBe(400);
  });

  it('padnięte R2: 500 i BEZ zapisu kluczy do bazy', async () => {
    // Klucz w bazie bez pliku w R2 przepuściłby wycenę na `sent` z martwym linkiem —
    // dokładnie to, przed czym guard D30 ma chronić.
    const { res, calls } = await wywolaj(WYCENA, KOMPLET, { putRzuca: true });
    expect(res.status).toBe(500);
    expect(calls.binds.some((b) => b.sql.includes('UPDATE est_quotes'))).toBe(false);
  });

  it('wycena w draft: 409 — dokumenty powstają z SNAPSHOTU, a draft go nie ma', async () => {
    const { res, calls } = await wywolaj({ id: 4, status: 'draft' }, KOMPLET);
    expect(res.status).toBe(409);
    expect(calls.puts).toHaveLength(0);
  });
});
