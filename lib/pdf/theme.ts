// Tokeny wizualne dokumentów PDF. JEDNO źródło dla oferty i Karty decyzji.
//
// Powód istnienia: rozmiary, kolory i odstępy były wpisane wprost w obu rendererach.
// Ta sama sekcja miała 11 pt w ofercie i 12 pt w Karcie, marginesy i łamanie stron
// były skopiowane. Zmiana „hierarchii" znaczyła wtedy polowanie na magiczne liczby
// w dwóch plikach — a dokumenty i tak się rozjeżdżały.

export const KOLOR = {
  marka: '#213261',
  akcent: '#61B6DE',
  tekst: '#111827',
  tekstSlaby: '#6b7280',
  /** Ostrzeżenia i odstępstwa (bursztyn) — wyłącznie w Karcie, oferta nie straszy klienta. */
  uwaga: '#b45309',
  linia: '#e2e8f0',
  tlo: '#f4f6fa',
} as const;

/** Geometria A4 w mm — jsPDF pracuje w mm (`unit: 'mm'`). */
export const STRONA = {
  szerokosc: 210,
  wysokosc: 297,
  margines: 18,
  /** Pierwsza linia bazowa treści. */
  gora: 20,
  /**
   * Dolna granica treści. NIE 280 — stopka zaczyna się linią na 281 i miała trzy
   * wiersze tekstu pod spodem. Poprzedni próg pozwalał treści wejść w stopkę
   * i nadpisać dane spółki.
   */
  dolTresci: 272,
  stopkaLinia: 279,
  stopkaTekst: 283,
} as const;

/** Szerokość kolumny treści. */
export const SZER_TRESCI = STRONA.szerokosc - 2 * STRONA.margines;

/**
 * Skala typograficzna. Cztery poziomy, świadomie rozstrzelone — sąsiednie rozmiary
 * różniące się o 0,5 pt nie tworzą hierarchii, tylko wrażenie niechlujstwa.
 */
export const TYPO = {
  /** Tytuł projektu / dokumentu. */
  tytul: 15,
  /** Pas ceny — największy element strony, bo to pierwsze, czego szuka czytający. */
  cena: 16,
  /** Nagłówek sekcji (wersaliki + tracking). */
  sekcja: 8.5,
  /** Nazwa pozycji na liście. */
  pozycja: 9.5,
  tekst: 9,
  drobny: 8,
  stopka: 6.5,
} as const;

/** Odstępy pionowe w mm — rytm dokumentu. Nie wpisuj liczb obok tych stałych. */
export const ODSTEP = {
  przedSekcja: 6,
  poSekcji: 4.5,
  miedzyPozycjami: 1.6,
  poBloku: 3,
} as const;

/**
 * Światło międzyliterowe nagłówków-wersalików, w MILIMETRACH.
 *
 * Pułapka: `doc.setCharSpace()` liczy w jednostkach dokumentu (u nas mm), a nie w punktach.
 * Pierwsza wersja miała 0,55 — czyli ~1,6 pt przy piśmie 8,5 pt, prawie 1/5 firetu.
 * Wersaliki rozjeżdżały się w „Z A K R E S  P R A C", a ekstraktor tekstu zaczynał je
 * czytać jako osobne litery. 0,2 mm ≈ 0,57 pt ≈ 7% firetu — tyle, ile trzeba, i nie więcej.
 */
export const TRACKING = 0.2;

const PT_MM = 25.4 / 72;

/**
 * Interlinia dla danego stopnia pisma.
 *
 * Poprzednio: `y += size / 2 + 1.6`, czyli dla 9,5 pt aż 6,35 mm — prawie dwie
 * interlinie. Tekst dryfował, a dokument wyglądał na rozstrzelony. Tu liczymy uczciwie:
 * punkty → mm → × gęstość.
 */
export const interlinia = (pt: number, gestosc = 1.35): number => pt * PT_MM * gestosc;
