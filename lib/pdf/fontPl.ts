import type { jsPDF } from 'jspdf';

/**
 * Font PDF z polskimi znakami. Współdzielony przez WSZYSTKIE nasze PDF-y:
 * ofertę i Kartę decyzji (moduł wycen) oraz PDF kalkulatora publicznego (`services/pdfService.ts`).
 *
 * Wbudowane fonty jsPDF (helvetica i spółka) używają WinAnsi — nie mają Latin Extended-A,
 * więc „ą ć ę ł ń ś ź ż" wychodzą połamane. Jedyne wyjście to osadzić TTF.
 * Tu: Manrope (font marki) w subsecie Latin + Latin Ext, ~30 kB base64 na wagę.
 * Ładowane dynamicznie — nie wchodzą do głównego bundla (size-limit).
 *
 * Mieszka w `lib/pdf/`, a nie przy module wycen, właśnie dlatego, że kalkulator publiczny
 * nie ma prawa importować z `components/portal/admin/`.
 * Generator subsetu: `scripts/fonts/build-pdf-font.py` (uruchamiany ręcznie, nie w buildzie).
 */
export const PDF_FONT = 'Manrope';

let cache: { regular: string; bold: string } | null = null;

/** Rejestruje font w dokumencie i ustawia go jako aktywny. Idempotentne per dokument. */
export async function registerPlFont(doc: jsPDF): Promise<void> {
  if (!cache) {
    const [reg, bold] = await Promise.all([import('./manropeRegular'), import('./manropeBold')]);
    cache = { regular: reg.MANROPE_REGULAR_B64, bold: bold.MANROPE_BOLD_B64 };
  }
  doc.addFileToVFS('Manrope-Regular.ttf', cache.regular);
  doc.addFont('Manrope-Regular.ttf', PDF_FONT, 'normal');
  doc.addFileToVFS('Manrope-Bold.ttf', cache.bold);
  doc.addFont('Manrope-Bold.ttf', PDF_FONT, 'bold');
  doc.setFont(PDF_FONT, 'normal');
}
