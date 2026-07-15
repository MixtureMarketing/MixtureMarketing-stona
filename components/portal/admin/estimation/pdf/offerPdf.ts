import type { Offer } from '@/lib/estimation/documents';
import { registerPlFont, PDF_FONT } from './fontPl';

// Render oferty do PDF. Rysuje WYŁĄCZNIE to, co dał buildOffer — zero logiki „co pokazać"
// (ta jest w lib/estimation/documents.ts i pokryta klasą testu internal-only).
// Wzorzec i kolory marki jak w services/pdfService.ts (kalkulator publiczny).

const BRAND = '#213261';
const ACCENT = '#61B6DE';
const GRAY = '#6b7280';
const M = 18; // margines
const W = 210; // A4 szerokość mm

const pln = (n: number) => `${Math.round(n).toLocaleString('pl-PL')} zł`;

export async function generateOfferPdf(offer: Offer): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await registerPlFont(doc); // polskie znaki — bez tego „ą/ć/ę" wychodzą połamane
  let y = 20;

  const pageBreak = (need = 12) => {
    if (y + need > 280) {
      doc.addPage();
      y = 20;
    }
  };
  const h = (text: string, size = 11) => {
    pageBreak(14);
    doc.setFont(PDF_FONT, 'bold');
    doc.setFontSize(size);
    doc.setTextColor(BRAND);
    doc.text(text, M, y);
    y += size / 2 + 3;
  };
  const p = (text: string, size = 9.5, color = '#111827') => {
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color);
    for (const line of doc.splitTextToSize(text, W - 2 * M) as string[]) {
      pageBreak();
      doc.text(line, M, y);
      y += size / 2 + 1.6;
    }
  };

  // ── Nagłówek ──
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(BRAND);
  doc.text('Mixture Marketing', M, y);
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(GRAY);
  doc.text('Software House & Marketing Agency · Rzeszów', M, y + 5);
  doc.text(`Oferta nr ${offer.meta.quoteNumber}`, W - M, y, { align: 'right' });
  doc.text(`Wystawiona: ${offer.meta.issuedAt}`, W - M, y + 5, { align: 'right' });
  doc.setTextColor(BRAND);
  doc.setFont(PDF_FONT, 'bold');
  doc.text(`Ważna do: ${offer.meta.validUntil}`, W - M, y + 10, { align: 'right' });
  y += 20;

  doc.setDrawColor(ACCENT);
  doc.setLineWidth(0.8);
  doc.line(M, y, W - M, y);
  y += 8;

  // ── Projekt + cena ──
  h(offer.meta.projectName, 15);
  if (offer.meta.clientName) p(`dla: ${offer.meta.clientName}`, 9.5, GRAY);
  y += 3;
  doc.setFillColor(245, 247, 250);
  doc.rect(M, y - 4, W - 2 * M, 16, 'F');
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(15);
  doc.setTextColor(BRAND);
  doc.text(`${pln(offer.priceRange.min)} – ${pln(offer.priceRange.max)}`, M + 3, y + 6);
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(GRAY);
  doc.text('netto, zakres jak niżej', W - M - 3, y + 6, { align: 'right' });
  y += 20;

  // ── Zakres (słowami — bez godzin) ──
  h('Zakres prac');
  for (const s of offer.scope) {
    pageBreak(10);
    doc.setFont(PDF_FONT, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor('#111827');
    doc.text(`• ${s.title}${s.level ? ` — ${s.level}` : ''}`, M, y);
    y += 5;
    if (s.description) p(`   ${s.description}`, 8.5, GRAY);
    y += 1;
  }
  y += 3;

  if (offer.modules.length) {
    h('Funkcje dodatkowe');
    p(offer.modules.map((m) => `• ${m}`).join('\n'));
    y += 3;
  }
  if (offer.integrations.length) {
    h('Integracje');
    p(offer.integrations.map((i) => `• ${i}`).join('\n'));
    y += 3;
  }

  // ── Koszty dodatkowe (pozycje bez wyceny JAWNIE) ──
  if (offer.costs.length) {
    h('Koszty dodatkowe (poza wyceną prac)');
    for (const c of offer.costs) {
      pageBreak();
      doc.setFont(PDF_FONT, 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#111827');
      doc.text(`• ${c.name}${c.note ? ` (${c.note})` : ''}`, M, y);
      doc.setFont(PDF_FONT, 'bold');
      doc.text(c.toBeQuoted ? 'do wyceny' : pln(c.amountPln), W - M, y, { align: 'right' });
      y += 5;
    }
    if (offer.costsTotal > 0) {
      doc.setFont(PDF_FONT, 'bold');
      doc.setTextColor(BRAND);
      doc.text(`Razem koszty: ${pln(offer.costsTotal)}`, W - M, y + 1, { align: 'right' });
      y += 7;
    }
  }

  // ── Poza zakresem ──
  if (offer.excluded.length) {
    h('Poza zakresem tej oferty');
    p(offer.excluded.map((e) => `• ${e.title}${e.reason ? ` — ${e.reason}` : ''}`).join('\n'));
    y += 3;
  }

  // ── Warunki ──
  if (offer.terms.length) {
    h('Warunki');
    p(offer.terms.map((t) => `• ${t}`).join('\n'), 8.5, GRAY);
  }

  return doc.output('blob');
}
