// Pominięcie przejścia wstecz w toku (MIX-1699, MIX-1707 r2); wydzielone z utils/caseStudyGeneration.ts.
import { BACK_RELEASE_MAX_MS, SCROLL_TOLERANCE_PX } from './caseStudyBackOptions';
import { currentGeneration } from './caseStudyGeneration';

type Restore = (y: number) => void;

/**
 * MIX-1719: cofnięcie naszego przewinięcia listy przy spóźnionym drugim cofnięciu (człowiek: 100–250 ms, po
 * potwierdzeniu okna MIX-1711): korzeń wraca na pozycję sprzed przewinięcia, jak przy drugim cofnięciu w oknie
 * (wtedy nic nie przewijamy). Allowlista: korzeń nadal stoi na naszej pozycji (±4 px; ruch użytkownika,
 * przeglądarki albo innego kodu = nic) i pozycja sprzed jest liczbą ≥ 0 różną od naszej.
 */
function undoListScroll(win: Window, before: number, y: number): void {
  if (!(before >= 0)) return;
  if (Math.abs(win.scrollY - y) > SCROLL_TOLERANCE_PX) return;
  if (Math.abs(before - y) <= SCROLL_TOLERANCE_PX) return;
  win.scrollTo({ top: before, left: win.scrollX, behavior: 'instant' });
}

/**
 * MIX-1699 (kontrakt r6, pkt 2): pominięcie przejścia wstecz w toku. Rejestruje je przejście
 * (utils/caseStudyBackTransition.ts, `release` = wyrejestrowanie przy końcu); nieprzyjęte cofnięcie (np.
 * drugie cofnięcie na "/" w trakcie przejścia) woła skipBackTransition: skipTransition, nazwy i atrybut
 * znikają od razu, zanim router wyrenderuje nową stronę, a dalej działa przeglądarka. Brak przejścia = nic.
 * r2: `woken` budzi wywołanie zwrotne przejścia od razu (sonda r1: koniec wywołania +72 ms po drugim
 * cofnięciu, za renderem nowej strony, z malowaniem wstrzymanym przez przejście). MIX-1707: bez żadnego
 * przewinięcia z naszej strony (oddawanie pozycji z f431473 usunięte; listy nie przewijamy przed potwierdzeniem).
 */
export interface BackSkip {
  release: () => void;
  woken: Promise<false>;
  /** MIX-1719: przewinięcie listy na `y` przez `run`; pierwsze zapamiętuje pozycję korzenia sprzed niego. */
  restoring: (win: Window | null, y: number, run: Restore) => void;
}
export const NO_SKIP: BackSkip = {
  release: () => undefined,
  woken: new Promise(() => undefined),
  restoring: (_win, y, run) => run(y),
};
let skipActive: (() => Promise<void>) | null = null;

/**
 * MIX-1711 (A12, A13): koniec wywołania zwrotnego przejścia jako obietnica, która ZAWSZE się spełnia: przy końcu
 * (sukces albo błąd) albo od razu, gdy `updateCallbackDone` nie ma, nie jest obietnicą albo jego odczyt rzuca.
 * Nic tu nie zostaje odrzucone, więc nic, co na nią czeka (oddanie cofnięcia routerowi, sprzątanie), nie stoi.
 */
export function callbackSettled(t: { readonly updateCallbackDone?: unknown }): Promise<void> {
  try {
    const p = t.updateCallbackDone as PromiseLike<unknown> | null | undefined;
    if (!p || typeof p.then !== 'function') return Promise.resolve();
    return new Promise<void>((resolve) => {
      try {
        p.then(
          () => resolve(),
          () => resolve(),
        );
      } catch {
        resolve();
      }
    });
  } catch {
    return Promise.resolve();
  }
}

export function setBackSkip(
  t: { skipTransition: () => void; readonly updateCallbackDone?: unknown },
  cleanup: () => void,
  releaseMs: number = BACK_RELEASE_MAX_MS,
): BackSkip {
  let wake: (v: false) => void = () => undefined;
  const woken = new Promise<false>((resolve) => (wake = resolve));
  let undo: (() => void) | null = null;
  const restoring = (win: Window | null, y: number, run: Restore) => {
    // tylko pierwsze przewinięcie: późniejsza korekta dryfu (ten sam cel) nie nadpisuje pozycji sprzed
    if (win && !undo) {
      const before = win.scrollY;
      undo = () => undoListScroll(win, before, y);
    }
    run(y);
  };
  const skip = () => {
    // MIX-1719: najpierw oddanie pozycji sprzed naszego przewinięcia listy (raz), synchronicznie w popstate,
    // przed pierwszą malowaną klatką; błąd = pozycja zostaje, a pominięcie i oddanie routerowi idą dalej
    const u = undo;
    undo = null;
    try {
      u?.();
    } catch {
      /* nawigacja nie stoi */
    }
    // MIX-1711 (A13): rzucające skipTransition nie zatrzymuje oddania cofnięcia routerowi
    try {
      t.skipTransition();
    } catch {
      /* przejście już skończone albo przeglądarka odmawia: dalej sprzątanie i oddanie */
    }
    cleanup();
    wake(false);
    // MIX-1707 r2: malowanie jest wstrzymane do końca wywołania zwrotnego; czekamy na nie (sukces albo błąd),
    // najdłużej releaseMs; MIX-1711 (A12, A13): brak albo błąd `updateCallbackDone` = bez czekania
    return new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, releaseMs);
      void callbackSettled(t).then(() => {
        clearTimeout(timer);
        resolve();
      });
    });
  };
  skipActive = skip;
  const release = () => {
    if (skipActive === skip) skipActive = null;
  };
  return { release, woken, restoring };
}
/**
 * Pomija przejście w toku. Zwraca obietnicę zwolnienia malowania (koniec wywołania zwrotnego przejścia albo
 * BACK_RELEASE_MAX_MS) albo null, gdy żadne nasze przejście nie trwa (wtedy nic nie robimy).
 */
export function skipBackTransition(): Promise<void> | null {
  const skip = skipActive;
  skipActive = null;
  return skip ? skip() : null;
}

/**
 * MIX-1707 r2 (decyzja lidera): nieprzyjęty popstate w trakcie naszego przejścia (np. drugie cofnięcie na "/")
 * kończy przejście od razu, a router dostaje go dopiero po zwolnieniu wstrzymanego malowania, żeby nowa strona i
 * przywrócenie przeglądarki szły jak przy wyłączonym przełączniku. Nowszy popstate w tym czasie ma już router,
 * więc to oddanie przepada. Brak naszego przejścia = false: zdarzenie idzie do routera od razu, bez zmian.
 */
export function skipAndHandOver(e: Event, handToRouter: () => void): boolean {
  let released: Promise<void> | null;
  try {
    released = skipBackTransition();
  } catch {
    // MIX-1711 (A12, A13): błąd przy pomijaniu = zdarzenie idzie do routera od razu (nawigacja nigdy nie stoi)
    released = null;
  }
  if (released === null) return false;
  e.stopImmediatePropagation();
  const gen = currentGeneration();
  void released.then(() => {
    if (currentGeneration() === gen) handToRouter();
  });
  return true;
}
