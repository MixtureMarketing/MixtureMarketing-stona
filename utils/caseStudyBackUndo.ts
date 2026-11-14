// Szybkie drugie cofnięcie po naszym przewinięciu listy (MIX-1699 r2). Decyzje: utils/caseStudyGeneration.ts.
//
// Sonda r1 (a2197b7, ROOTDBG double-back): przyjęte cofnięcie na listę przewija ją do zapisanej pozycji
// (scrollTo 672 przy 1280, 1341 przy 375), a drugie cofnięcie na "/" przychodzi 2–23 ms później. "/" startował
// więc z naszej pozycji listy (klatki 620 i 1313 z DOM strony głównej, linki 3) zamiast z pozycji, którą
// przeglądarka miała przed nami (przy wyłączonym przełączniku: 0), i dopiero potem zjeżdżał do 300.
// Zapis: przewinięcia przyjętego cofnięcia (pozycja sprzed pierwszego, ostatni cel, czas). Cofnięcie, którego
// nie przyjmujemy, w ciągu UNDO_WINDOW_MS oddaje przeglądarce stan sprzed nas: jedno przewinięcie bez animacji
// na pozycję sprzed naszego, tylko gdy strona stoi tam, gdzie ją postawiliśmy. Allowlista, fail-closed: brak
// zapisu, wartość nieliczbowa, po czasie, strona ruszona (przeglądarka, użytkownik), błąd = nic.

/** Okno (ms) od naszego przewinięcia, w którym nieprzyjęte cofnięcie oddaje pozycję sprzed nas. */
export const UNDO_WINDOW_MS = 300;
/** Ile pikseli od naszej pozycji strona jest jeszcze „nasza”. */
export const UNDO_TOLERANCE_PX = 4;

export type ScrollWin = Pick<Window, 'scrollTo'> & { scrollY?: unknown };
type OurScroll = { before: number; y: number; at: number };

let ourScroll: OurScroll | null = null;
let undoFor: OurScroll | null = null;

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Nasze przewinięcie przyjętego cofnięcia: `before` = scrollY tuż przed nim, `y` = cel. */
export function noteOurScroll(before: unknown, y: number): void {
  if (!finite(before) || !finite(y)) return;
  ourScroll = { before: ourScroll ? ourScroll.before : before, y, at: Date.now() };
}

/** PUSH, ruch użytkownika, nowe przyjęte cofnięcie: zapis znika (nic do oddania). */
export function forgetOurScroll(): void {
  ourScroll = null;
}

/** Każdy popstate: zapis przechodzi do oddania tylko przy cofnięciu, którego nie przyjmujemy. */
export function armUndo(accepted: boolean): void {
  undoFor = accepted ? null : ourScroll;
  ourScroll = null;
}

/** Nieprzyjęte cofnięcie: jedno przewinięcie na pozycję sprzed nas albo nic. */
export function undoOurScroll(win: ScrollWin | undefined): void {
  const u = undoFor;
  undoFor = null;
  if (!u || !win) return;
  try {
    const now = win.scrollY;
    if (!finite(now) || Date.now() - u.at > UNDO_WINDOW_MS) return;
    if (Math.abs(now - u.y) > UNDO_TOLERANCE_PX) return;
    win.scrollTo({ top: u.before, left: 0, behavior: 'instant' });
  } catch {
    /* brak obsługi: zachowanie przeglądarki */
  }
}

/** Testy: czysty stan. */
export function resetUndo(): void {
  ourScroll = null;
  undoFor = null;
}
