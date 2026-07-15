import type { jsPDF } from 'jspdf';
import { sanitizePdfText } from './text';

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

/**
 * Rejestruje font w dokumencie i ustawia go jako aktywny. Idempotentne per dokument.
 *
 * Podpina też sanityzację do `text()` i `splitTextToSize()` — CELOWO tutaj, a nie w każdym
 * rendererze z osobna. Bug oferty #4 polegał właśnie na tym, że jedno miejsce wywołania
 * dostało string z twardą spacją; helper, który trzeba pamiętać wywołać, prędzej czy później
 * zostanie pominięty, a kara to po cichu ucięta cena w dokumencie wysłanym klientowi.
 * Skoro każdy nasz PDF i tak przechodzi przez `registerPlFont`, to jest jedyne miejsce,
 * które gwarantuje pokrycie. `splitTextToSize` opakowane, bo ono MIERZY tekst — musi
 * mierzyć to samo, co finalnie zostanie narysowane.
 */
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

  const d = doc as unknown as Record<string, unknown> & { __plSanitized?: boolean };
  if (d.__plSanitized) return;
  d.__plSanitized = true;

  const czysc = (v: unknown): unknown =>
    typeof v === 'string' ? sanitizePdfText(v) : Array.isArray(v) ? v.map(czysc) : v;

  const origText = doc.text.bind(doc);
  doc.text = ((txt: string | string[], ...reszta: unknown[]) =>
    origText(czysc(txt) as string | string[], ...(reszta as [number, number]))) as typeof doc.text;

  const origSplit = doc.splitTextToSize.bind(doc);
  doc.splitTextToSize = ((txt: string, ...reszta: unknown[]) =>
    origSplit(czysc(txt) as string, ...(reszta as [number]))) as typeof doc.splitTextToSize;
}
