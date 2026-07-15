import { describe, it, expect } from 'vitest';
import { generateOfferPdf } from './offerPdf';
import { generateDecisionCardPdf } from './decisionCardDoc';
import type { Offer, DecisionCard } from '@/lib/estimation/documents';

// KLASA TESTU: REALNY RENDER (jak real-seeds i internal-only).
//
// Powód istnienia: E2E f2a mockował jspdf, więc sprawdzał, że do renderera trafia dobry
// obiekt — a nie, że w PDF-ie są znaki. Skutek: oferta #4 wyszła na produkcję z pasem ceny
// zawierającym same glify „32". Przyczyna: pl-PL toLocaleString wstawia TWARDĄ SPACJĘ
// (U+00A0) jako separator tysięcy, a subset fontu jej nie miał — jsPDF ucinał tekst.
// Mock nigdy tego nie złapie, bo bug żyje między stringiem a glifem.
//
// Dlatego tu: generujemy PDF NAPRAWDĘ i czytamy z niego tekst. Każdy nowy dokument
// (albo nowy format liczb/daty) dokłada przypadek TUTAJ.

async function pdfText(blob: Blob): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  // Blob z jsPDF pod jsdom nie ma arrayBuffer() — czytamy przez FileReader.
  const buf = await new Promise<Buffer>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(Buffer.from(fr.result as ArrayBuffer));
    fr.onerror = () => reject(fr.error);
    fr.readAsArrayBuffer(blob);
  });
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

/** Znaki, które MUSZĄ dać się wyrenderować — brak w subsecie = ucięty tekst. */
const RYZYKOWNE = [' ', ' ', '–', '—', '„', '”', 'ą', 'ż', 'ł', 'ó', 'ę', '€', '×'];

const OFFER: Offer = {
  meta: {
    quoteNumber: 4,
    projectName: 'Sklep meblowy',
    clientName: 'Meble sp. z o.o.',
    issuedAt: '2026-07-15',
    validUntil: '2026-08-14',
    validityDays: 30,
  },
  priceRange: { min: 11400, max: 16800 },
  scope: [{ title: 'Frontend', level: 'Standardowy', description: 'Własny layout — gęślą jaźń.' }],
  modules: ['Wishlist'],
  integrations: ['PayU'],
  costs: [
    { name: 'Dojazd', amountPln: 276, note: '120 km × 2', toBeQuoted: false },
    { name: 'Usługa zewnętrzna', amountPln: 0, note: 'do wyceny ręcznej', toBeQuoted: true },
  ],
  costsTotal: 276,
  excluded: [{ title: 'Observability' }],
  terms: ['Ceny netto; nie zawierają licencji.', 'Zażółć gęślą jaźń — Piłsudskiego.'],
};

const CARD: DecisionCard = {
  meta: {
    quoteNumber: 4,
    projectName: 'Sklep meblowy',
    clientName: 'Meble sp. z o.o.',
    issuedAt: '2026-07-15',
  },
  platform: {
    recommended: 'sylius',
    chosen: 'woocommerce',
    reason: 'Klient ma zespół PHP',
    againstRecommendation: true,
  },
  decisions: [
    {
      title: 'Frontend',
      code: 'frontend',
      category: 'A',
      level: 2,
      levelName: 'Standardowy',
      levelDescription: 'Własny layout wg projektu.',
      reasons: ['Sklep wymaga własnego layoutu'],
      overrideReason: null,
      fromArchetypeDefault: false,
    },
  ],
  overrides: [],
  alerts: ['Sklep może wyrosnąć z WooCommerce'],
  outOfScope: [{ title: 'Observability', reason: 'Klient ma własny monitoring' }],
  confidence: { score: 88, breakdown: [{ reason: 'Odpowiedź „nie wiem": Ruch', delta: -4 }] },
  risks: [{ name: 'Nowa technologia', value: 0.15 }],
};

describe('render PDF — oferta (realny render, nie mock)', () => {
  it('PAS CENY: pełny string z obiema liczbami i „zł" jest w PDF-ie', async () => {
    const text = await pdfText(await generateOfferPdf(OFFER));
    // Bug produkcyjny #4: zostawało samo „32" — liczby ucięte na twardej spacji.
    expect(text).toContain('11');
    expect(text).toContain('400');
    expect(text).toContain('16');
    expect(text).toContain('800');
    expect(text).toContain('zł');
    // Kompletny pas ceny, z tolerancją na to, jak ekstraktor traktuje spacje.
    // Format renderera: „11 400 zł – 16 800 zł" (pln() dokleja „zł" po OBU stronach).
    const zbite = text.replace(/\s/g, '');
    expect(zbite).toContain('11400');
    expect(zbite).toContain('16800');
    expect(zbite).toMatch(/11400zł[–-]16800zł/);
  });

  it('BRAK GLIFÓW-WIDM: polskie znaki i typografia przechodzą w całości', async () => {
    const text = await pdfText(await generateOfferPdf(OFFER));
    expect(text).toContain('Zażółć gęślą jaźń');
    expect(text).toContain('Piłsudskiego');
    expect(text).toContain('Własny layout');
    expect(text).toContain('Usługa zewnętrzna');
    // „Meble sp. z o.o." i nazwa projektu muszą dojść w całości
    expect(text).toContain('Sklep meblowy');
    expect(text.replace(/\s/g, '')).toContain('Meblesp.zo.o.');
  });

  it('sekcje oferty są w dokumencie, a powód wyłączenia NIE', async () => {
    const text = await pdfText(await generateOfferPdf(OFFER));
    // Nagłówki sekcji są WERSALIKAMI (hierarchia typograficzna, f2b) — asercja pilnuje
    // przy okazji, że polskie znaki przeżywają toUpperCase() i render („WYCENĄ").
    // Bez spacji, bo światło międzyliterowe (Tc) bywa czytane przez ekstraktory jako spacja —
    // to cecha ekstrakcji, nie dokumentu, i nie ma po co jej zamrażać w teście.
    const zbite = text.replace(/\s/g, '');
    for (const s of [
      'ZAKRESPRAC',
      'INTEGRACJE',
      'KOSZTYDODATKOWE(POZAWYCENĄPRAC)',
      'POZAZAKRESEMTEJOFERTY',
      'WARUNKI',
    ]) {
      expect(zbite, `brak sekcji: ${s}`).toContain(s);
    }
    expect(text).toContain('Observability');
    expect(text).not.toContain('monitoring'); // powód = Karta, nie oferta
    expect(text).toContain('do wyceny'); // pozycja bez kwoty JAWNIE
  });

  it('każdy ryzykowny znak da się wyrenderować (subset fontu jest kompletny)', async () => {
    const { jsPDF } = await import('jspdf');
    const { registerPlFont, PDF_FONT } = await import('@/lib/pdf/fontPl');
    const doc = new jsPDF();
    await registerPlFont(doc);
    doc.setFont(PDF_FONT, 'normal');
    for (const ch of RYZYKOWNE) {
      const w = doc.getTextWidth(`A${ch}A`);
      const base = doc.getTextWidth('AA');
      expect(w, `znak U+${ch.codePointAt(0)!.toString(16)} nie ma glifu`).toBeGreaterThan(base);
    }
  });
});

/** Surowe bajty PDF — do sprawdzania struktury (obrazy), której ekstraktor tekstu nie widzi. */
async function pdfBytes(blob: Blob): Promise<string> {
  const buf = await new Promise<Buffer>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(Buffer.from(fr.result as ArrayBuffer));
    fr.onerror = () => rej(fr.error);
    fr.readAsArrayBuffer(blob);
  });
  return buf.toString('latin1');
}

describe('render PDF — łamanie stron', () => {
  // Regresja z próbki f2b: „UX/UI Design" został na dole strony 1, a jego opis wylądował
  // samotnie na górze strony 2 — rezerwacja miejsca była zgadywana (12 mm) zamiast policzona.
  //
  // Test jest WŁASNOŚCIOWY, i to nie z zamiłowania do teorii. Dwie wcześniejsze wersje
  // przechodziły NA ZEPSUTYM KODZIE, bo przy tej akurat treści granica strony wypadała
  // między pozycjami. Test zależny od tego, gdzie przypadkiem wypadnie łamanie, nie pilnuje
  // niczego — pilnuje szczęścia.
  //
  // Dlatego przesuwamy FAZĘ: pierwsza pozycja („klin") rośnie o wiersz na wariant, więc
  // granica strony przechodzi przez cały cykl i któryś wariant MUSI trafić w blok.
  // Sprawdzone na starym kodzie: warianty 3 i 4 rozrywają pozycję 11.
  // (Sam sweep to za mało: poprzednia wersja dokładała słowa, które nigdy nie przepchnęły
  // opisu na kolejny wiersz — osiem „wariantów" dawało osiem identycznych dokumentów.)
  const ZDANIE =
    'Zakres prac, przyjęte założenia oraz wszystko, co trzeba powiedzieć, zanim ktokolwiek zobaczy cenę. ';
  // Znacznik na KOŃCU opisu: przy rozerwaniu bloku pierwsze wiersze zostają przy tytule,
  // więc asercja po początku opisu niczego by nie zauważyła.
  const opis = (i: number, wiersze: number) =>
    `Opis obszaru ${i}: ${ZDANIE.repeat(wiersze)}KONIEC-OPISU-${i}.`;

  it.each([0, 1, 2, 3, 4, 5])(
    'pozycja zakresu nie rozpada się między stronami (klin +%i)',
    async (klin) => {
      const { PDFParse } = await import('pdf-parse');
      const duza: Offer = {
        ...OFFER,
        scope: [
          { title: 'Obszar numer 99', level: 'Standardowy', description: opis(99, 1 + klin) },
          ...Array.from({ length: 26 }, (_, i) => ({
            title: `Obszar numer ${i + 1}`,
            level: 'Standardowy',
            description: opis(i + 1, 1),
          })),
        ],
      };
      const blob = await generateOfferPdf(duza);
      const buf = await new Promise<Buffer>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(Buffer.from(fr.result as ArrayBuffer));
        fr.onerror = () => rej(fr.error);
        fr.readAsArrayBuffer(blob);
      });
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      try {
        const wynik = await parser.getText();
        expect(wynik.pages.length).toBeGreaterThan(1);
        const strony = wynik.pages.map((p) => p.text.replace(/\s+/g, ' '));
        for (const i of [...Array.from({ length: 26 }, (_, k) => k + 1), 99]) {
          const naTytule = strony.findIndex((t) => t.includes(`Obszar numer ${i} `));
          const naKoncuOpisu = strony.findIndex((t) => t.includes(`KONIEC-OPISU-${i}.`));
          expect(naTytule, `nie znaleziono tytułu: ${i}`).toBeGreaterThan(-1);
          expect(naKoncuOpisu, `nie znaleziono końca opisu: ${i}`).toBeGreaterThan(-1);
          expect(naKoncuOpisu, `opis pozycji ${i} rozerwany od tytułu`).toBe(naTytule);
        }
      } finally {
        await parser.destroy();
      }
    },
  );
});

describe('render PDF — logo w nagłówku', () => {
  it('oferta i Karta osadzają raster logo (XObject typu Image)', async () => {
    // Ekstraktor tekstu nie zobaczy obrazka, a `addImage` na błędnym base64 nie rzuca —
    // dlatego asercja idzie po strukturze pliku, nie po tekście.
    for (const [nazwa, blob] of [
      ['oferta', await generateOfferPdf(OFFER)],
      ['karta', await generateDecisionCardPdf(CARD)],
    ] as const) {
      const raw = await pdfBytes(blob);
      expect(raw, `${nazwa}: brak XObject obrazu`).toContain('/Subtype /Image');
      expect(raw, `${nazwa}: logo nie jest tym rastrem`).toContain('/Width 756');
    }
  });

  it('WAGA: osadzone logo jest skompresowane (oferta poniżej 150 kB)', async () => {
    // jsPDF domyślnie wsadza raster ROZPAKOWANY — wersja bez `compression` ważyła 504 kB
    // przy logo, które na dysku ma 12 kB. Dokument idzie mailem do klienta, a takiej
    // regresji nie widać: wygląda identycznie, tylko waży dziesięć razy więcej.
    const oferta = await generateOfferPdf(OFFER);
    const karta = await generateDecisionCardPdf(CARD);
    expect(oferta.size, `oferta: ${(oferta.size / 1024).toFixed(0)} kB`).toBeLessThan(150 * 1024);
    expect(karta.size, `karta: ${(karta.size / 1024).toFixed(0)} kB`).toBeLessThan(150 * 1024);
  });

  it('logo zachowuje proporcje asetu (nie rozciągamy marki)', async () => {
    const { LOGO_PROPORCJE } = await import('@/lib/pdf/logoPng');
    // Zgodność z viewBox SVG „0 0 1224.64 481.83" — raster nie ma prawa zmienić kształtu.
    expect(LOGO_PROPORCJE.szerokosc / LOGO_PROPORCJE.wysokosc).toBeCloseTo(1224.64 / 481.83, 2);
  });
});

describe('render PDF — stopka oferty', () => {
  it('dane spółki są na KAŻDEJ stronie i pochodzą z SITE_CONFIG', async () => {
    const { PDFParse } = await import('pdf-parse');
    const { SITE_CONFIG } = await import('@/config/site');
    // Oferta z zakresem na tyle długim, że musi się złamać na 2+ strony:
    const duza: Offer = {
      ...OFFER,
      scope: Array.from({ length: 40 }, (_, i) => ({
        title: `Obszar ${i + 1}`,
        level: 'Standardowy',
        description: 'Opis poziomu, wystarczająco długi, by zająć wiersz w dokumencie.',
      })),
    };
    const blob = await generateOfferPdf(duza);
    const buf = await new Promise<Buffer>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(Buffer.from(fr.result as ArrayBuffer));
      fr.onerror = () => rej(fr.error);
      fr.readAsArrayBuffer(blob);
    });
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    try {
      const wynik = await parser.getText();
      expect(wynik.pages.length).toBeGreaterThan(1);
      for (const strona of wynik.pages) {
        const t = strona.text.replace(/\s+/g, ' ');
        expect(t, `brak nazwy spółki na stronie ${strona.num}`).toContain(SITE_CONFIG.companyName);
        expect(t, `brak NIP na stronie ${strona.num}`).toContain(SITE_CONFIG.contact.vatID);
        expect(t, `brak kontaktu na stronie ${strona.num}`).toContain(SITE_CONFIG.contact.email);
      }
    } finally {
      await parser.destroy();
    }
  });
});

describe('render PDF — Karta decyzji (realny render)', () => {
  it('zawiera rekomendację, wybór i powód rozjazdu', async () => {
    const text = await pdfText(await generateDecisionCardPdf(CARD));
    expect(text).toContain('sylius');
    expect(text).toContain('woocommerce');
    expect(text).toContain('Klient ma zespół PHP');
  });

  it('REKOMENDOWANA nad WYBRANĄ; przy zgodności — „zgodna z rekomendacją"', async () => {
    const rozjazd = await pdfText(await generateDecisionCardPdf(CARD));
    expect(rozjazd.indexOf('Rekomendowana')).toBeGreaterThan(-1);
    // kolejność: rekomendacja MUSI być przed wyborem
    expect(rozjazd.indexOf('Rekomendowana')).toBeLessThan(rozjazd.indexOf('Wybrana'));
    expect(rozjazd).toContain('wbrew rekomendacji');

    const zgodny = await pdfText(
      await generateDecisionCardPdf({
        ...CARD,
        platform: {
          recommended: 'woocommerce',
          chosen: 'woocommerce',
          reason: null,
          againstRecommendation: false,
        },
      }),
    );
    expect(zgodny).toContain('Zgodna z rekomendacją');
    expect(zgodny).not.toContain('wbrew rekomendacji');
  });

  it('Karta (wewnętrzna) POKAZUJE Confidence i alerty', async () => {
    const text = await pdfText(await generateDecisionCardPdf(CARD));
    expect(text).toContain('88');
    expect(text.replace(/\s/g, '')).toContain('Sklepmożewyrosnąć');
  });
});
