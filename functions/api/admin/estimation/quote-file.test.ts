import { describe, it, expect } from 'vitest';
import { onRequestGet } from './quote-file';

// TDD: powstało PRZED quote-file.ts (ZASADY-PRACY §1).
// Pobranie dokumentu wyceny z R2. Klucza NIE składamy w kliencie — czytamy go z bazy,
// bo to baza wie, co naprawdę zostało zapisane (i to ona jest źródłem dla guardu D30).

function mockEnv(quoteRow: Record<string, unknown> | null, obiekty: Record<string, string> = {}) {
  const calls = { gets: [] as string[] };
  return {
    DB: { prepare: () => ({ bind: () => ({ first: async () => quoteRow }) }) },
    FILES: {
      get: async (key: string) => {
        calls.gets.push(key);
        if (!(key in obiekty)) return null;
        return {
          body: obiekty[key],
          httpEtag: '"abc"',
          writeHttpMetadata: (h: Headers) => h.set('content-type', 'application/pdf'),
        };
      },
    },
    calls,
  };
}

const wywolaj = async (
  quoteRow: Record<string, unknown> | null,
  url: string,
  obiekty?: Record<string, string>,
) => {
  const env = mockEnv(quoteRow, obiekty);
  const res = (await onRequestGet({
    env,
    request: { url: `https://x.pl/api/admin/estimation/quote-file${url}` },
  } as never)) as Response;
  return { res, calls: env.calls };
};

const WYSLANA = {
  id: 4,
  name: 'Sklep meblowy',
  pdf_r2_key: 'quotes/4/oferta.pdf',
  card_r2_key: 'quotes/4/karta-decyzji.pdf',
};
const PLIKI = { 'quotes/4/oferta.pdf': 'PDF-O', 'quotes/4/karta-decyzji.pdf': 'PDF-K' };

describe('quote-file — pobieranie', () => {
  it('doc=offer czyta klucz oferty Z BAZY', async () => {
    const { res, calls } = await wywolaj(WYSLANA, '?id=4&doc=offer', PLIKI);
    expect(res.status).toBe(200);
    expect(calls.gets).toEqual(['quotes/4/oferta.pdf']);
    expect(res.headers.get('content-type')).toBe('application/pdf');
  });

  it('doc=card czyta klucz Karty', async () => {
    const { res, calls } = await wywolaj(WYSLANA, '?id=4&doc=card', PLIKI);
    expect(res.status).toBe(200);
    expect(calls.gets).toEqual(['quotes/4/karta-decyzji.pdf']);
  });

  it('nazwa pliku dla użytkownika zawiera numer wyceny (nie „oferta.pdf" × 10 w folderze)', async () => {
    const { res } = await wywolaj(WYSLANA, '?id=4&doc=offer', PLIKI);
    expect(res.headers.get('Content-Disposition')).toContain('wycena-4');
  });

  it('Karta NIE jest cache’owana publicznie — to dokument wewnętrzny (D28)', async () => {
    const { res } = await wywolaj(WYSLANA, '?id=4&doc=card', PLIKI);
    expect(res.headers.get('Cache-Control')).toContain('private');
  });
});

describe('quote-file — odmowy', () => {
  it('brak id albo zły doc: 400', async () => {
    for (const zly of ['?doc=offer', '?id=4', '?id=4&doc=faktura', '?id=abc&doc=offer']) {
      const { res } = await wywolaj(WYSLANA, zly, PLIKI);
      expect(res.status, zly).toBe(400);
    }
  });

  it('nieistniejąca wycena: 404', async () => {
    const { res } = await wywolaj(null, '?id=999&doc=offer');
    expect(res.status).toBe(404);
  });

  it('wycena bez wygenerowanego dokumentu: 404 (klucz w bazie jest NULL)', async () => {
    const { res, calls } = await wywolaj(
      { ...WYSLANA, card_r2_key: null },
      '?id=4&doc=card',
      PLIKI,
    );
    expect(res.status).toBe(404);
    expect(calls.gets, 'nie ma po co pytać R2 o nic').toHaveLength(0);
  });

  it('klucz w bazie, ale pliku brak w R2: 404 zamiast pustej odpowiedzi', async () => {
    const { res } = await wywolaj(WYSLANA, '?id=4&doc=offer', {});
    expect(res.status).toBe(404);
  });
});
