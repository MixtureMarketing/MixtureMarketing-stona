import type { Offer } from '@/lib/estimation/documents';
import { registerPlFont, PDF_FONT } from '@/lib/pdf/fontPl';
import { pln } from '@/lib/pdf/text';
import { createLayout, rysujLogo, stopka } from '@/lib/pdf/layout';
import { KOLOR, ODSTEP, STRONA, SZER_TRESCI, TRACKING, TYPO, interlinia } from '@/lib/pdf/theme';
import { SITE_CONFIG } from '@/config/site';

// Render oferty do PDF. Rysuje WYŁĄCZNIE to, co dał buildOffer — zero logiki „co pokazać"
// (ta jest w lib/estimation/documents.ts i pokryta klasą testu internal-only).
// Wymiary, kolory i rytm: lib/pdf/theme.ts. Prymitywy: lib/pdf/layout.ts.

// UWAGA: `pln` pochodzi z lib/pdf/text.ts. Lokalna wersja z gołym `toLocaleString('pl-PL')`
// wstawiała TWARDĄ SPACJĘ i to ona ucięła pas ceny w ofercie #4 do samego „32".

const M = STRONA.margines;
const PRAWA = STRONA.szerokosc - STRONA.margines;

const A = SITE_CONFIG.contact.address;
/** Dane spółki na dole KAŻDEJ strony — źródłem jest SITE_CONFIG, nie przepisane stałe. */
const STOPKA_LEWO = [
  `${SITE_CONFIG.companyName} · ${A.street}, ${A.postalCode} ${A.city}`,
  `NIP: ${SITE_CONFIG.contact.vatID} · KRS: ${SITE_CONFIG.contact.krs}`,
];
const STOPKA_PRAWO = [
  `${SITE_CONFIG.contact.email} · ${SITE_CONFIG.contact.phone}`,
  '{strona}', // podstawiane przez `stopka()` — liczba stron znana dopiero na końcu
];

export async function generateOfferPdf(offer: Offer): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await registerPlFont(doc); // polskie znaki — bez tego „ą/ć/ę" wychodzą połamane

  // ── Nagłówek: logo zamiast nazwy pisanej tekstem ──
  // Logo to lockup (sygnet + wordmark „MIXTURE MARKETING"), więc powtórzenie nazwy
  // obok byłoby powiedzeniem tego samego dwa razy, dwoma krojami.
  const dolLogo = await rysujLogo(doc, M, 16, 32);
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(KOLOR.tekstSlaby);
  doc.text('Software House & Marketing Agency · Rzeszów', M, dolLogo + 3.5);

  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(KOLOR.marka);
  doc.text(`Oferta nr ${offer.meta.quoteNumber}`, PRAWA, 20, { align: 'right' });
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(TYPO.drobny);
  doc.setTextColor(KOLOR.tekstSlaby);
  doc.text(`Wystawiona: ${offer.meta.issuedAt}`, PRAWA, 25.5, { align: 'right' });
  doc.setFont(PDF_FONT, 'bold');
  doc.setTextColor(KOLOR.marka);
  doc.text(`Ważna do: ${offer.meta.validUntil}`, PRAWA, 30.5, { align: 'right' });

  doc.setDrawColor(KOLOR.akcent);
  doc.setLineWidth(0.8);
  doc.line(M, 37, PRAWA, 37);

  const L = createLayout(doc, 46);

  // ── Projekt ──
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(TYPO.tytul);
  doc.setTextColor(KOLOR.marka);
  doc.text(offer.meta.projectName, M, L.y);
  L.odstep(5.5);
  if (offer.meta.clientName) L.tekst(`dla: ${offer.meta.clientName}`, { kolor: KOLOR.tekstSlaby });

  // ── Pas ceny ──
  // Największy element strony. To pierwsza rzecz, której czytający szuka, i jedyna,
  // której brak zauważy każdy (patrz: oferta #4).
  L.odstep(3);
  const gora = L.y;
  doc.setFillColor(KOLOR.tlo);
  doc.rect(M, gora, SZER_TRESCI, 18, 'F');
  doc.setFillColor(KOLOR.akcent);
  doc.rect(M, gora, 1.6, 18, 'F');
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(TYPO.stopka);
  doc.setTextColor(KOLOR.tekstSlaby);
  doc.setCharSpace(TRACKING);
  doc.text('WARTOŚĆ PRAC (NETTO)', M + 5, gora + 6);
  doc.setCharSpace(0);
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(TYPO.cena);
  doc.setTextColor(KOLOR.marka);
  doc.text(`${pln(offer.priceRange.min)} – ${pln(offer.priceRange.max)}`, M + 5, gora + 13.5);
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(TYPO.drobny);
  doc.setTextColor(KOLOR.tekstSlaby);
  doc.text('zakres jak niżej', PRAWA - 4, gora + 13.5, { align: 'right' });
  L.y = gora + 18;

  // ── Zakres (słowami — bez godzin) ──
  L.sekcja('Zakres prac');
  for (const s of offer.scope) {
    // Pozycja jest nierozdzielna: tytuł z poziomem i jego opis zostają razem.
    const opis = s.description ? L.wysokoscTekstu(s.description, { rozmiar: 8.5, wciecie: 4 }) : 0;
    L.lamStrone(interlinia(TYPO.pozycja) + opis);
    L.wiersz(s.title, s.level ?? undefined);
    if (s.description)
      L.tekst(s.description, { rozmiar: 8.5, kolor: KOLOR.tekstSlaby, wciecie: 4 });
    L.odstep(ODSTEP.miedzyPozycjami);
  }

  if (offer.modules.length) {
    L.sekcja('Funkcje dodatkowe');
    L.punkty(offer.modules);
  }
  if (offer.integrations.length) {
    L.sekcja('Integracje');
    L.punkty(offer.integrations);
  }

  // ── Koszty dodatkowe (pozycje bez wyceny JAWNIE) ──
  if (offer.costs.length) {
    L.sekcja('Koszty dodatkowe (poza wyceną prac)');
    for (const c of offer.costs) {
      L.wiersz(
        `${c.name}${c.note ? ` (${c.note})` : ''}`,
        c.toBeQuoted ? 'do wyceny' : pln(c.amountPln),
        {
          rozmiar: TYPO.tekst,
          grubo: false,
          rozmiarPrawo: TYPO.tekst,
          // „do wyceny" świadomie szare i nie-grube: to brak kwoty, nie kwota.
          kolorPrawo: c.toBeQuoted ? KOLOR.tekstSlaby : KOLOR.tekst,
          gruboPrawo: !c.toBeQuoted,
        },
      );
    }
    if (offer.costsTotal > 0) {
      L.odstep(1);
      doc.setDrawColor(KOLOR.linia);
      doc.setLineWidth(0.2);
      doc.line(PRAWA - 60, L.y - 2.5, PRAWA, L.y - 2.5);
      L.wiersz('', `Razem: ${pln(offer.costsTotal)}`, {
        rozmiarPrawo: TYPO.tekst,
        kolorPrawo: KOLOR.marka,
        gruboPrawo: true,
      });
    }
  }

  // ── Poza zakresem (same nazwy — powody są w Karcie decyzji) ──
  if (offer.excluded.length) {
    L.sekcja('Poza zakresem tej oferty');
    L.punkty(offer.excluded.map((e) => e.title));
  }

  // ── Warunki ──
  if (offer.terms.length) {
    L.sekcja('Warunki');
    L.punkty(offer.terms, { rozmiar: 8.5, kolor: KOLOR.tekstSlaby });
  }

  stopka(doc, STOPKA_LEWO, STOPKA_PRAWO);
  return doc.output('blob');
}
