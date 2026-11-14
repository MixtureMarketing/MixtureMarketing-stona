// Przywrócenie pozycji przewinięcia bez animacji po powrocie z realizacji (MIX-1675).
import { RESTORE_MAX_MS, holdRecording, releaseRecording } from './caseStudyBack';

export interface RestoreDeps {
  win: Pick<Window, 'scrollTo' | 'innerHeight'>;
  doc: Pick<Document, 'documentElement'>;
  /** Wywołuje `cb` przy każdej możliwej zmianie układu; zwraca funkcję zatrzymującą. */
  watch: (cb: () => void) => () => void;
  maxMs: number;
  /** Czy nadal wolno przewijać (np. lokalizacja nie zmieniła się); false = przerywamy bez przewijania. */
  guard?: () => boolean;
}

/** Czy dokument jest dość wysoki, żeby przewinąć do `y`. */
export function canReach(y: number, deps: Pick<RestoreDeps, 'win' | 'doc'>): boolean {
  return deps.doc.documentElement.scrollHeight - deps.win.innerHeight >= y - 1;
}

/** Przewinięcie bez animacji (`html { scroll-behavior: smooth }` nie ma tu wpływu). */
export function scrollInstant(y: number, win: Pick<Window, 'scrollTo'>): void {
  win.scrollTo({ top: y, left: 0, behavior: 'instant' });
}

export function defaultWatch(cb: () => void): () => void {
  let alive = true;
  let raf = 0;
  const tick = () => {
    if (!alive) return;
    cb();
    if (alive) raf = requestAnimationFrame(tick);
  };
  let ro: ResizeObserver | undefined;
  try {
    ro = new ResizeObserver(() => cb());
    ro.observe(document.documentElement);
  } catch {
    ro = undefined;
  }
  raf = requestAnimationFrame(tick);
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    ro?.disconnect();
  };
}

let cancelCurrent: (() => void) | null = null;

/**
 * Przywraca pozycję `y` natychmiast, gdy strona jest dość wysoka (lista z danymi), inaczej
 * czeka na wzrost układu (najdłużej `maxMs`) i przewija tak daleko, jak się da. Bez animacji.
 */
export function startRestore(y: number, partial: Partial<RestoreDeps> = {}): () => void {
  const deps: RestoreDeps = {
    win: partial.win ?? window,
    doc: partial.doc ?? document,
    watch: partial.watch ?? defaultWatch,
    maxMs: partial.maxMs ?? RESTORE_MAX_MS,
    guard: partial.guard,
  };
  cancelCurrent?.();
  holdRecording(deps.maxMs + 500);
  let finished = false;
  let unwatch: () => void = () => undefined;
  const stop = () => {
    if (finished) return;
    finished = true;
    unwatch();
    clearTimeout(timer);
    if (cancelCurrent === stop) cancelCurrent = null;
    // zapis wraca dopiero po chwili, żeby zdarzenie od naszego scrollTo nie nadpisało pozycji
    setTimeout(() => {
      if (!cancelCurrent) releaseRecording();
    }, 100);
  };
  cancelCurrent = stop;
  const timer = setTimeout(() => {
    if (finished) return;
    if (!deps.guard || deps.guard()) scrollInstant(y, deps.win);
    stop();
  }, deps.maxMs);
  const attempt = () => {
    if (finished) return;
    if (deps.guard && !deps.guard()) return stop();
    if (!canReach(y, deps)) return;
    scrollInstant(y, deps.win);
    stop();
  };
  unwatch = deps.watch(attempt);
  attempt();
  return stop;
}

/** Przerywa oczekujące przywrócenie pozycji (zmiana trasy albo kolejne cofnięcie): nic już nie przewinie. */
export function cancelRestore(): void {
  cancelCurrent?.();
}

/** Czeka, aż `pred()` da prawdę (sprawdza co 16 ms), najdłużej `ms`; false po czasie. */
export function waitUntil(pred: () => boolean, ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const started = Date.now();
    const step = () => {
      let ok = false;
      try {
        ok = pred();
      } catch {
        ok = false;
      }
      if (ok) return resolve(true);
      if (Date.now() - started >= ms) return resolve(false);
      setTimeout(step, 16);
    };
    step();
  });
}
