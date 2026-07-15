import { describe, it, expect } from 'vitest';
import { generatePdf } from '@/services/pdfService';
import type { CalculatorSelections } from '@/hooks/useCalculator';

// PDF kalkulatora idzie do klienta z naszym logo, więc połamane „Piłsudskiego" to nie kosmetyka.
// Wbudowane fonty jsPDF są WinAnsi (brak Latin Extended-A) — bez osadzonego TTF polskie znaki
// wychodzą jako śmieci. Test pilnuje, że font PL jest realnie zarejestrowany i użyty.

const DATA = {
  selections: {
    projectType: 'landingPage',
    designLevel: 'custom',
    features: ['blog', 'newsletter'],
    marketing: ['seo'],
  } as CalculatorSelections,
  result: { minPrice: 5000, maxPrice: 9000, minTime: 4, maxTime: 8 },
  contact: { email: 'klient@example.com' },
};

describe('pdfService — polskie znaki', () => {
  it('generuje PDF (blob niepusty)', async () => {
    const blob = await generatePdf(DATA);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it('osadza font z Latin Ext — glify z ogonkami mają realną szerokość', async () => {
    const { jsPDF } = await import('jspdf');
    const { registerPlFont, PDF_FONT } = await import('@/lib/pdf/fontPl');
    const doc = new jsPDF();
    await registerPlFont(doc);
    doc.setFont(PDF_FONT, 'normal');

    // Gdyby glifów brakowało, jsPDF liczyłby je jako zerowe/zastępcze i szerokość tekstu
    // z ogonkami zrównałaby się z ASCII albo poleciała do zera.
    const pl = doc.getTextWidth('Zażółć gęślą jaźń Piłsudskiego Wstępny');
    const ascii = doc.getTextWidth('Zazolc gesla jazn Pilsudskiego Wstepny');
    expect(pl).toBeGreaterThan(0);
    expect(Math.abs(pl - ascii)).toBeLessThan(ascii * 0.25); // podobna, nie identyczna
    expect(Object.keys(doc.getFontList())).toContain(PDF_FONT);
  });

  it('nie używa już wbudowanego helvetica do treści', async () => {
    // Regresja: powrót do setFont('helvetica') cicho przywróciłby połamane znaki.
    const src = await import('fs').then((fs) =>
      fs.promises.readFile('services/pdfService.ts', 'utf8'),
    );
    expect(src).not.toMatch(/setFont\(\s*'helvetica'/);
    expect(src).toContain('registerPlFont');
  });
});
