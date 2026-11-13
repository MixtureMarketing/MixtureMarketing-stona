// Stan „wejście przez przejście” dla CaseStudyHero (MIX-1308; useSyncExternalStore).
// Ustawia go tylko utils/caseStudyTransition.ts, więc przy wyłączonym przełączniku jest zawsze null.
let arrivalPath: string | null = null;
const listeners = new Set<() => void>();
let readyWaiter: { path: string; resolve: () => void } | null = null;

export function getArrivalPath(): string | null {
  return arrivalPath;
}

export function subscribeArrival(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setArrivalPath(path: string | null): void {
  if (arrivalPath === path) return;
  arrivalPath = path;
  listeners.forEach((l) => l());
}

/** Nagłówek realizacji zgłasza, że jest w DOM z nazwami (useLayoutEffect). */
export function signalTargetReady(path: string): void {
  if (readyWaiter && readyWaiter.path === path) {
    readyWaiter.resolve();
    readyWaiter = null;
  }
}

export function waitForTarget(path: string, ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      readyWaiter = null;
      resolve(false);
    }, ms);
    readyWaiter = {
      path,
      resolve: () => {
        clearTimeout(timer);
        resolve(true);
      },
    };
  });
}

/** Wynik obietnicy albo `fallback` po `ms` (także przy odrzuceniu). */
export function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}
