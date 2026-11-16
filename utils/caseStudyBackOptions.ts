// Stałe i opcje przejścia realizacja → lista (MIX-1675, MIX-1707). Przejście: utils/caseStudyBackTransition.ts.

/** Ile czekamy na kartę na liście po cofnięciu, zanim zrezygnujemy z przejścia (MIX-1675). */
export const BACK_CARD_MAX_MS = 300;
/**
 * MIX-1707: tyle ms od przyjętego cofnięcia przejście czeka (z malowaniem wstrzymanym, na zdjęciu realizacji),
 * zanim przewinie listę: drugie cofnięcie w tym czasie = nasz kod nic nie przewija. Pomiar sondy r2 (chmura,
 * odstępy history.back() 12–30 ms): drugi popstate 17–152 ms po pierwszym przy włączonym przełączniku,
 * 32–193 ms przy wyłączonym i w bazie; 250 = najdłuższy zmierzony + zapas, w granicy BACK_CARD_MAX_MS.
 * MIX-1711: 250 ms dawało +190 ms zamrożonego ekranu przed pierwszą klatką powrotu (wejście startuje po 63–84 ms;
 * sonda .bieg/mix1711/smooth.sh). Drugie cofnięcie spóźnia się, bo stoi za renderem listy (zegar history.back()
 * czeka na wolny wątek), więc okno ma dwie części: co najmniej BACK_CONFIRM_MS od przyjęcia ORAZ co najmniej
 * BACK_SETTLE_MS od chwili, gdy lista jest gotowa (wątek wolny, zaległe cofnięcie zdąży dojść). Sonda MIX-1707 r2
 * (chmura): drugi popstate 14–48 ms po pierwszym; 90 = 2 × 48 bez dwóch klatek.
 */
export const BACK_CONFIRM_MS = 90;
/** MIX-1711: najkrótsze czekanie po gotowości listy, zanim ją przewiniemy (dwie klatki 60 Hz). */
export const BACK_SETTLE_MS = 32;
/**
 * MIX-1707 r2: najdłużej tyle ms nieprzyjęte cofnięcie (np. drugie na "/") w trakcie naszego przejścia czeka na
 * koniec wywołania zwrotnego pominiętego przejścia (zwolnienie wstrzymanego malowania), zanim router je dostanie;
 * brak rozstrzygnięcia w tym czasie = router dostaje je i tak (nawigacja nigdy nie stoi).
 */
export const BACK_RELEASE_MAX_MS = 100;
/** Dopuszczalne odchylenie pozycji po powrocie (px). */
export const SCROLL_TOLERANCE_PX = 4;

export interface BackRunOptions {
  /** Pozycja listy sprzed wejścia (px). */
  y: number;
  /** Zdjęcie (ramka) i tytuł otwartej realizacji, czyli źródło przejścia. */
  hero: { image: HTMLElement; title: HTMLElement | null };
  /** Oddaje cofnięcie routerowi (zdarzenie popstate wstrzymane przez nasz nasłuch). */
  redispatch: () => void;
  /** Czy lista jest już w DOM i dość wysoka, żeby stanąć na `y`. */
  listReady: () => boolean;
  /** Karta tej samej realizacji na liście (zdjęcie i tytuł) albo null; tylko widoczna. */
  findCard: () => { image: HTMLElement; title: HTMLElement | null } | null;
  /**
   * Bilet tego cofnięcia (backTicket): to samo pokolenie nawigacji i nadal lista, dla której zapisano
   * `y` (ścieżka i query). Fałsz = żaden odroczony skutek tego cofnięcia już nie działa.
   */
  live: () => boolean;
  /** Przewinięcie do `y` bez animacji. */
  restore: (y: number) => void;
  doc: Document;
  cardMs?: number;
  confirmMs?: number;
  settleMs?: number;
}
