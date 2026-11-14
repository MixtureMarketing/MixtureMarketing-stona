// Stałe i opcje przejścia realizacja → lista (MIX-1675, MIX-1707). Przejście: utils/caseStudyBackTransition.ts.

/** Ile czekamy na kartę na liście po cofnięciu, zanim zrezygnujemy z przejścia (MIX-1675). */
export const BACK_CARD_MAX_MS = 300;
/**
 * MIX-1707: tyle ms od przyjętego cofnięcia przejście czeka (z malowaniem wstrzymanym, na zdjęciu realizacji),
 * zanim przewinie listę: drugie cofnięcie w tym czasie = nasz kod nic nie przewija. Pomiar sondy r2 (chmura,
 * odstępy history.back() 12–30 ms): drugi popstate 17–152 ms po pierwszym przy włączonym przełączniku,
 * 32–193 ms przy wyłączonym i w bazie; 250 = najdłuższy zmierzony + zapas, w granicy BACK_CARD_MAX_MS.
 */
export const BACK_CONFIRM_MS = 250;
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
}
