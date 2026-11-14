// Pominięcie przejścia wstecz w toku (MIX-1699, MIX-1707 r2); wydzielone z utils/caseStudyGeneration.ts.
import { BACK_RELEASE_MAX_MS } from './caseStudyBackOptions';
import { currentGeneration } from './caseStudyGeneration';

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
}
export const NO_SKIP: BackSkip = { release: () => undefined, woken: new Promise(() => undefined) };
let skipActive: (() => Promise<void>) | null = null;
export function setBackSkip(
  t: { skipTransition: () => void; updateCallbackDone: Promise<void> },
  cleanup: () => void,
  releaseMs: number = BACK_RELEASE_MAX_MS,
): BackSkip {
  let wake: (v: false) => void = () => undefined;
  const woken = new Promise<false>((resolve) => (wake = resolve));
  const skip = () => {
    t.skipTransition();
    cleanup();
    wake(false);
    // MIX-1707 r2: malowanie jest wstrzymane do końca wywołania zwrotnego; czekamy na nie (sukces albo błąd),
    // najdłużej releaseMs
    return new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, releaseMs);
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      t.updateCallbackDone.then(done, done);
    });
  };
  skipActive = skip;
  const release = () => {
    if (skipActive === skip) skipActive = null;
  };
  return { release, woken };
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
  const released = skipBackTransition();
  if (released === null) return false;
  e.stopImmediatePropagation();
  const gen = currentGeneration();
  void released.then(() => {
    if (currentGeneration() === gen) handToRouter();
  });
  return true;
}
