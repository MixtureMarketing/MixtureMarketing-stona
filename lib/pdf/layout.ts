import type { jsPDF } from 'jspdf';
import { PDF_FONT } from './fontPl';
import { KOLOR, ODSTEP, STRONA, SZER_TRESCI, TRACKING, TYPO, interlinia } from './theme';

// Prymitywy rysowania wspólne dla oferty i Karty decyzji. Oba dokumenty miały własne,
// skopiowane `pageBreak/h/p` — tu są raz. Renderery mają opisywać TREŚĆ dokumentu,
// a nie liczyć milimetry.

const M = STRONA.margines;
const PRAWA = STRONA.szerokosc - STRONA.margines;

/**
 * Logo w nagłówku. Raster (jsPDF nie umie SVG) z `scripts/logo/build-pdf-logo.mjs`.
 * Ładowane dynamicznie — 16 kB base64 nie ma prawa wejść do głównego bundla.
 * Wysokość liczona z proporcji rastra, żeby logo nigdy nie zostało zniekształcone.
 */
export async function rysujLogo(doc: jsPDF, x: number, y: number, szerokosc = 32): Promise<number> {
  const { LOGO_PNG_B64, LOGO_PROPORCJE } = await import('./logoPng');
  const wysokosc = (szerokosc * LOGO_PROPORCJE.wysokosc) / LOGO_PROPORCJE.szerokosc;
  // `compression` JEST konieczne: jsPDF domyślnie osadza rozpakowany bitmapowy raster,
  // ignorując to, że PNG był już skompresowany. Zmierzone na tym logo: 450 kB bez
  // kompresji vs 30 kB ze 'SLOW'. Oferta #4 puchła przez to do pół megabajta.
  // `alias` zapobiega osadzeniu tego samego obrazu drugi raz, gdyby kiedyś trafił
  // na kolejną stronę.
  doc.addImage(LOGO_PNG_B64, 'PNG', x, y, szerokosc, wysokosc, 'mixture-logo', 'SLOW');
  return y + wysokosc;
}

/** Każda kolumna wiersza ma własny stopień, kolor i wagę — inaczej „Razem" wygląda jak notka. */
export interface OpcjeWiersza {
  rozmiar?: number;
  kolor?: string;
  grubo?: boolean;
  rozmiarPrawo?: number;
  kolorPrawo?: string;
  gruboPrawo?: boolean;
}

export interface Layout {
  y: number;
  /** Łamie stronę, jeśli `potrzeba` mm już się nie mieści nad stopką. */
  lamStrone(potrzeba?: number): void;
  /** Nagłówek sekcji: wersaliki, tracking, cienka linia pod spodem. */
  sekcja(tytul: string): void;
  /** Akapit z zawijaniem do szerokości kolumny. */
  tekst(
    t: string,
    opcje?: { rozmiar?: number; kolor?: string; wciecie?: number; grubo?: boolean },
  ): void;
  /** Wiersz dwukolumnowy: nazwa z lewej, wartość dosunięta do prawego marginesu. */
  wiersz(lewo: string, prawo?: string, opcje?: OpcjeWiersza): void;
  /** Lista punktowana. */
  punkty(pozycje: string[], opcje?: { rozmiar?: number; kolor?: string }): void;
  /**
   * Ile mm zajmie akapit po zawinięciu. Do rezerwacji miejsca PRZED rysowaniem —
   * `lamStrone(12)` na oko zostawiał tytuł pozycji na dole strony, a jego opis wypychał
   * na następną (próbka f2b: „UX/UI Design" bez opisu).
   */
  wysokoscTekstu(t: string, opcje?: { rozmiar?: number; wciecie?: number }): number;
  odstep(mm: number): void;
}

// `start: number`, a nie wnioskowane — STRONA jest `as const`, więc `STRONA.gora` ma typ
// literalny `20` i bez tej adnotacji createLayout(doc, 46) nie przechodzi typecheku.
export function createLayout(doc: jsPDF, start: number = STRONA.gora): Layout {
  let y: number = start;

  const ustaw = (rozmiar: number, kolor: string, grubo = false) => {
    doc.setFont(PDF_FONT, grubo ? 'bold' : 'normal');
    doc.setFontSize(rozmiar);
    doc.setTextColor(kolor);
  };

  const api: Layout = {
    get y() {
      return y;
    },
    set y(v: number) {
      y = v;
    },

    odstep(mm) {
      y += mm;
    },

    lamStrone(potrzeba = 10) {
      if (y + potrzeba > STRONA.dolTresci) {
        doc.addPage();
        y = STRONA.gora;
      }
    },

    sekcja(tytul) {
      y += ODSTEP.przedSekcja;
      api.lamStrone(18);
      ustaw(TYPO.sekcja, KOLOR.marka, true);
      // Wersaliki + światło międzyliterowe: nagłówek sekcji różni się od nazwy pozycji
      // KLASĄ, nie samym rozmiarem. Dwa stopnie pisma obok siebie nie zbudują hierarchii.
      doc.setCharSpace(TRACKING);
      doc.text(tytul.toUpperCase(), M, y);
      doc.setCharSpace(0);
      y += 2.4;
      doc.setDrawColor(KOLOR.linia);
      doc.setLineWidth(0.2);
      doc.line(M, y, PRAWA, y);
      y += ODSTEP.poSekcji;
    },

    tekst(t, { rozmiar = TYPO.tekst, kolor = KOLOR.tekst, wciecie = 0, grubo = false } = {}) {
      ustaw(rozmiar, kolor, grubo);
      const linie = doc.splitTextToSize(t, SZER_TRESCI - wciecie) as string[];
      for (const linia of linie) {
        // Wiersz rezerwuje DOKŁADNIE swoją wysokość. Wcześniej każdy wiersz żądał 10 mm
        // (magiczna stała), choć zajmuje ~4 — więc łamał stronę, mając 6 mm zapasu.
        // To, a nie zła rezerwacja bloku, rozrywało pozycje: blok mieścił się w limicie,
        // po czym jego własny opis wywoływał łamanie w środku.
        api.lamStrone(interlinia(rozmiar));
        ustaw(rozmiar, kolor, grubo); // po ewentualnym łamaniu strony stan jest bezpieczny
        doc.text(linia, M + wciecie, y);
        y += interlinia(rozmiar);
      }
    },

    wiersz(lewo, prawo, opcje = {}) {
      const {
        rozmiar = TYPO.pozycja,
        kolor = KOLOR.tekst,
        grubo = true,
        rozmiarPrawo = TYPO.drobny,
        kolorPrawo = KOLOR.tekstSlaby,
        gruboPrawo = false,
      } = opcje;
      api.lamStrone(interlinia(rozmiar));
      if (lewo) {
        ustaw(rozmiar, kolor, grubo);
        doc.text(lewo, M, y);
      }
      if (prawo) {
        ustaw(rozmiarPrawo, kolorPrawo, gruboPrawo);
        doc.text(prawo, PRAWA, y, { align: 'right' });
      }
      y += interlinia(rozmiar);
    },

    wysokoscTekstu(t, { rozmiar = TYPO.tekst, wciecie = 0 } = {}) {
      // Rozmiar MUSI być ustawiony przed pomiarem — splitTextToSize łamie wg aktualnego pisma.
      doc.setFont(PDF_FONT, 'normal');
      doc.setFontSize(rozmiar);
      const linie = doc.splitTextToSize(t, SZER_TRESCI - wciecie) as string[];
      return linie.length * interlinia(rozmiar);
    },

    punkty(pozycje, { rozmiar = TYPO.tekst, kolor = KOLOR.tekst } = {}) {
      for (const poz of pozycje) {
        // Miejsce na punktor I pierwszy wiersz tekstu — inaczej punktor zostaje sierotą
        // na dole strony, a jego treść wędruje na następną.
        api.lamStrone(interlinia(rozmiar) * 2);
        ustaw(rozmiar, KOLOR.akcent);
        doc.text('•', M, y);
        const przed = y;
        api.tekst(poz, { rozmiar, kolor, wciecie: 4 });
        if (y === przed) y += interlinia(rozmiar); // pusty string nie może zapętlić rytmu
      }
    },
  };

  return api;
}

/**
 * Stopka na KAŻDEJ stronie: dwie kolumny (tożsamość z lewej, kontakt/numeracja z prawej),
 * obie dosunięte do marginesów. Wołana na końcu renderu, gdy znana jest ostateczna liczba
 * stron — treść mogła dołożyć strony po drodze.
 */
export function stopka(doc: jsPDF, lewo: string[], prawo: string[]): void {
  const stron = doc.getNumberOfPages();
  for (let i = 1; i <= stron; i++) {
    doc.setPage(i);
    doc.setDrawColor(KOLOR.linia);
    doc.setLineWidth(0.2);
    doc.line(M, STRONA.stopkaLinia, PRAWA, STRONA.stopkaLinia);
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(TYPO.stopka);
    doc.setTextColor(KOLOR.tekstSlaby);
    const wiersze = Math.max(lewo.length, prawo.length);
    for (let w = 0; w < wiersze; w++) {
      const yw = STRONA.stopkaTekst + w * 3.2;
      if (lewo[w]) doc.text(lewo[w], M, yw);
      // Numer strony wchodzi w OSTATNI wiersz prawej kolumny — dlatego podstawiany tutaj,
      // a nie w wywołaniu: liczba stron jest znana dopiero teraz.
      const p = prawo[w]?.replace('{strona}', `${i}/${stron}`);
      if (p) doc.text(p, PRAWA, yw, { align: 'right' });
    }
  }
}
