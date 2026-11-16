/**
 * Warunki i harmonogram filmów portfolio (MIX-1831/MIX-1873).
 *
 * Zasady wydajności (Jakub, MIX-1831): zdjęcie zostaje elementem LCP, przed zdarzeniem `load`
 * nie idzie żaden bajt filmu, doczytywanie dopiero po `load` + `requestIdleCallback`, tylko dla
 * elementów w polu widzenia, kolejno i najwyżej 2 naraz. Bez doczytywania: dotyk, `Save-Data`,
 * wolne łącze (`slow-2g|2g|3g`), `prefers-reduced-motion`.
 */

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

function mediaMatches(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

/** Prerender (Puppeteer) albo brak okna: filmu nie ma w HTML. */
export function isPrerenderOrServer(): boolean {
  return (
    typeof window === 'undefined' ||
    Boolean((window as unknown as { isPrerendering?: boolean }).isPrerendering)
  );
}

export function prefersReducedMotion(): boolean {
  return mediaMatches('(prefers-reduced-motion: reduce)');
}

/** Mysz albo gładzik: najechanie istnieje. Dotyk = brak filmu na liście. */
export function canHover(): boolean {
  return mediaMatches('(hover: hover) and (pointer: fine)');
}

/** Telefon: wąski ekran, strona realizacji bierze wariant 720 px. */
export function isNarrowViewport(): boolean {
  return mediaMatches('(max-width: 767px)');
}

function connection(): NetworkInformationLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as unknown as { connection?: NetworkInformationLike }).connection;
}

/** `Save-Data` albo wolne łącze: oszczędzamy dane. */
export function isDataSaving(): boolean {
  const c = connection();
  if (!c) return false;
  if (c.saveData === true) return true;
  return typeof c.effectiveType === 'string' && SLOW_CONNECTIONS.has(c.effectiveType);
}

/** Czy wolno doczytywać film w tle (lista i strona realizacji). */
export function canPreloadVideo(): boolean {
  return !isPrerenderOrServer() && !prefersReducedMotion() && !isDataSaving();
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Wywołuje `cb` po zdarzeniu `load` i w chwili bezczynności przeglądarki (`requestIdleCallback`,
 * a bez niego `setTimeout`). Zwraca funkcję anulującą.
 */
export function afterLoadIdle(cb: () => void, idleTimeoutMs = 2000): () => void {
  const w = window as IdleWindow;
  let cancelled = false;
  let idleId: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const onIdle = () => {
    if (!cancelled) cb();
  };
  const scheduleIdle = () => {
    if (cancelled) return;
    if (typeof w.requestIdleCallback === 'function') {
      idleId = w.requestIdleCallback(onIdle, { timeout: idleTimeoutMs });
    } else {
      timeoutId = setTimeout(onIdle, 200);
    }
  };
  const onLoad = () => scheduleIdle();

  if (document.readyState === 'complete') scheduleIdle();
  else window.addEventListener('load', onLoad, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener('load', onLoad);
    if (idleId !== null && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId);
    if (timeoutId !== null) clearTimeout(timeoutId);
  };
}
