// Przebieg przejścia karta realizacji → strona realizacji (MIX-1308, A1 + A2).
// Decyzje (allowlista, fail-closed) są w utils/viewTransitions.ts, stan celu w utils/caseStudyArrival.ts.
import { setArrivalPath, waitForTarget, withTimeout } from './caseStudyArrival';
import {
  PRELOAD_MAX_MS,
  TARGET_READY_MAX_MS,
  VT_ATTR,
  VT_ATTR_VALUE,
  VT_NAMES,
  VT_STILL,
  type ViewTransitionLike,
  type VtDocument,
} from './viewTransitions';

let active = false;

/** Przewinięcie na górę bez animacji (MIX-1471). */
export const INSTANT_TOP: ScrollToOptions = { top: 0, left: 0, behavior: 'instant' };

/** Czy przejście jest teraz w toku (drugi klik w trakcie = zwykła nawigacja). */
export function isTransitionActive(): boolean {
  return active;
}

export interface RunOptions {
  path: string;
  parts: { image: HTMLElement; title: HTMLElement | null };
  navigate: () => void;
  preload: () => Promise<void>;
  doc: Document;
  win: Pick<Window, 'scrollTo'>;
  preloadMs?: number;
  readyMs?: number;
}

const setName = (el: HTMLElement, name: string) =>
  el.style.setProperty('view-transition-name', name);
const clearName = (el: HTMLElement) => el.style.removeProperty('view-transition-name');

/**
 * Przejście karta → realizacja. Wynik: `transition` (przejście ruszyło) albo `plain`
 * (zwykła nawigacja: brak danych w 300 ms albo błąd API). Nazwy źródła znikają w chwili
 * zrobienia zdjęcia starej strony, nazwy celu i elementów nieruchomych po końcu przejścia.
 */
export async function runCaseStudyTransition(opts: RunOptions): Promise<'transition' | 'plain'> {
  const { path, parts, navigate, preload, doc, win } = opts;
  active = true;
  const preloaded = await withTimeout(
    preload().then(() => true),
    opts.preloadMs ?? PRELOAD_MAX_MS,
    false,
  );
  const start = (doc as VtDocument).startViewTransition;
  if (!preloaded || typeof start !== 'function') {
    active = false;
    navigate();
    return 'plain';
  }

  const source: HTMLElement[] = [];
  const still: HTMLElement[] = [];
  setName(parts.image, VT_NAMES.image);
  source.push(parts.image);
  if (parts.title) {
    setName(parts.title, VT_NAMES.title);
    source.push(parts.title);
  }
  for (const { selector, name } of VT_STILL) {
    const el = doc.querySelector<HTMLElement>(selector);
    if (el) {
      setName(el, name);
      still.push(el);
    }
  }
  doc.documentElement.setAttribute(VT_ATTR, VT_ATTR_VALUE);

  const cleanup = () => {
    source.forEach(clearName);
    still.forEach(clearName);
    doc.documentElement.removeAttribute(VT_ATTR);
    setArrivalPath(null);
    active = false;
  };

  let transition: ViewTransitionLike;
  try {
    transition = start.call(doc, async () => {
      // Zdjęcie starej strony jest zrobione: źródło oddaje nazwy, zanim pojawi się cel.
      source.forEach(clearName);
      const ready = waitForTarget(path, opts.readyMs ?? TARGET_READY_MAX_MS);
      setArrivalPath(path);
      navigate();
      const ok = await ready;
      // MIX-1471: `html { scroll-behavior: smooth }` (index.css) zrobiłby z tego animowane
      // przewijanie w górę widoczne po przejściu; nowa strona ma stać na 0 od pierwszej klatki.
      win.scrollTo(INSTANT_TOP);
      if (!ok) transition.skipTransition();
    });
  } catch {
    cleanup();
    navigate();
    return 'plain';
  }
  transition.ready.catch(() => undefined);
  transition.updateCallbackDone.catch(() => undefined);
  transition.finished.catch(() => undefined).finally(cleanup);
  return 'transition';
}
