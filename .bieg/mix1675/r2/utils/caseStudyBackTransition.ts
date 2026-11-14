// Przejście realizacja → lista (MIX-1675). Decyzje: utils/caseStudyBack.ts (planBack).
import { waitUntil } from './caseStudyRestore';
import {
  VT_ATTR,
  VT_ATTR_VALUE,
  VT_NAMES,
  VT_STILL,
  type ViewTransitionLike,
  type VtDocument,
} from './viewTransitions';
import { setTransitionActive } from './caseStudyTransition';

const setName = (el: HTMLElement, name: string) =>
  el.style.setProperty('view-transition-name', name);
const clearName = (el: HTMLElement) => el.style.removeProperty('view-transition-name');

/** Ile czekamy na kartę na liście po cofnięciu, zanim zrezygnujemy z przejścia (MIX-1675). */
export const BACK_CARD_MAX_MS = 300;
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
  /** Przewinięcie do `y` bez animacji. */
  restore: (y: number) => void;
  doc: Document;
  cardMs?: number;
}

/**
 * Przejście realizacja → lista (MIX-1675), odwrotność runCaseStudyTransition: zdjęcie i tytuł
 * realizacji zmniejszają się do karty. Nazwy źródła (nagłówek realizacji) znikają, gdy stare
 * zdjęcie jest zrobione; nazwy karty dostaje dopiero lista po przywróceniu pozycji; wszystkie
 * nazwy znikają po końcu przejścia. Fail-closed: brak API, błąd, lista albo karta niegotowa w
 * 300 ms, karta poza ekranem = przejście pominięte, a lista i tak stoi na zapisanej pozycji.
 */
export async function runCaseStudyBackTransition(
  opts: BackRunOptions,
): Promise<'transition' | 'plain'> {
  const { doc, hero, y } = opts;
  setTransitionActive(true);
  const start = (doc as VtDocument).startViewTransition;
  if (typeof start !== 'function') {
    setTransitionActive(false);
    opts.redispatch();
    return 'plain';
  }

  const named: HTMLElement[] = [];
  const mark = (el: HTMLElement, name: string) => {
    setName(el, name);
    named.push(el);
  };
  mark(hero.image, VT_NAMES.image);
  if (hero.title) mark(hero.title, VT_NAMES.title);
  for (const { selector, name } of VT_STILL) {
    const el = doc.querySelector<HTMLElement>(selector);
    if (el) mark(el, name);
  }
  doc.documentElement.setAttribute(VT_ATTR, VT_ATTR_VALUE);

  const cleanup = () => {
    named.forEach(clearName);
    doc.documentElement.removeAttribute(VT_ATTR);
    setTransitionActive(false);
  };

  let transition: ViewTransitionLike;
  try {
    transition = start.call(doc, async () => {
      // Zdjęcie starej strony jest zrobione: nagłówek realizacji oddaje nazwy.
      clearName(hero.image);
      if (hero.title) clearName(hero.title);
      opts.redispatch();
      const ready = await waitUntil(opts.listReady, opts.cardMs ?? BACK_CARD_MAX_MS);
      opts.restore(y);
      const card = ready ? opts.findCard() : null;
      if (!card) {
        transition.skipTransition();
        return;
      }
      mark(card.image, VT_NAMES.image);
      if (card.title && hero.title) mark(card.title, VT_NAMES.title);
    });
  } catch {
    cleanup();
    opts.redispatch();
    return 'plain';
  }
  // Przeglądarka potrafi dosunąć przewinięcie tuż po zrobieniu nowego zdjęcia (pomiar: +24 do +221 px
  // przed pierwszą klatką, przyczyna nieustalona); rAF działa przed malowaniem pierwszej klatki.
  transition.ready.then(
    () => {
      const win = doc.defaultView;
      win?.requestAnimationFrame(() => {
        if (Math.abs(win.scrollY - y) > SCROLL_TOLERANCE_PX) opts.restore(y);
      });
    },
    () => undefined,
  );
  transition.updateCallbackDone.catch(() => undefined);
  transition.finished.catch(() => undefined).finally(cleanup);
  return 'transition';
}
