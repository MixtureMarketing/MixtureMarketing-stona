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
import { NO_SKIP, ownBack, setBackSkip, type BackSkip } from './caseStudyGeneration';
import {
  BACK_CARD_MAX_MS,
  BACK_CONFIRM_MS,
  SCROLL_TOLERANCE_PX,
  type BackRunOptions,
} from './caseStudyBackOptions';

export { BACK_CARD_MAX_MS, BACK_CONFIRM_MS, SCROLL_TOLERANCE_PX, type BackRunOptions };

const setName = (el: HTMLElement, name: string) =>
  el.style.setProperty('view-transition-name', name);
const clearName = (el: HTMLElement) => el.style.removeProperty('view-transition-name');

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
  const { doc, hero, y, cardMs = BACK_CARD_MAX_MS, confirmMs = BACK_CONFIRM_MS } = opts;
  const acceptedAt = Date.now();
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

  // MIX-1699 r2: pominięcie (nieprzyjęte cofnięcie) budzi czekanie na listę od razu (skip.woken)
  let skip: BackSkip = NO_SKIP;
  const cleanup = () => {
    named.forEach(clearName);
    doc.documentElement.removeAttribute(VT_ATTR);
    setTransitionActive(false);
    skip.release();
  };

  let transition: ViewTransitionLike;
  try {
    // MIX-1707: przywrócenie tego cofnięcia należy do przejścia (ScrollToTop nie przewija, backOwned)
    ownBack(true);
    transition = start.call(doc, async () => {
      // Zdjęcie starej strony jest zrobione: nagłówek realizacji oddaje nazwy.
      clearName(hero.image);
      if (hero.title) clearName(hero.title);
      // nowsza nawigacja przed zdjęciem starej strony: ona ma już router, to cofnięcie nic nie robi
      if (!opts.live()) {
        transition.skipTransition();
        return;
      }
      opts.redispatch();
      // czekanie kończy się od razu przy nowszej nawigacji (renderowanie nie stoi 300 ms)
      const ready = await Promise.race([waitUntil(opts.listReady, cardMs, opts.live), skip.woken]);
      // MIX-1707: lista przewija się dopiero po potwierdzeniu, że cofnięcie jest pojedyncze (BACK_CONFIRM_MS
      // od przyjęcia bez nowszego popstate); drugie cofnięcie budzi czekanie od razu (skip.woken)
      const left = confirmMs - (Date.now() - acceptedAt);
      if (left > 0) await Promise.race([new Promise((r) => setTimeout(r, left)), skip.woken]);
      // szybkie drugie cofnięcie: lista nie jest już na ekranie, jej pozycji nie wolno stawiać na innej stronie
      if (!opts.live()) {
        transition.skipTransition();
        return;
      }
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
    ownBack(false);
    cleanup();
    opts.redispatch();
    return 'plain';
  }
  // MIX-1699: nieprzyjęte cofnięcie w trakcie = pominięcie od razu (utils/caseStudyGeneration.ts)
  skip = setBackSkip(transition, cleanup);
  // Przeglądarka potrafi dosunąć przewinięcie tuż po zrobieniu nowego zdjęcia (pomiar: +24 do +221 px
  // przed pierwszą klatką, przyczyna nieustalona); rAF działa przed malowaniem pierwszej klatki.
  // Korekta na KAŻDEJ ścieżce: po pominięciu przejścia (brak karty) `ready` jest odrzucone, więc czekamy
  // na rozstrzygnięcie `ready` i końca wywołania zwrotnego, nie tylko na `ready` spełnione.
  const correctDrift = () => {
    const win = doc.defaultView;
    win?.requestAnimationFrame(() => {
      if (!opts.live()) return;
      if (Math.abs(win.scrollY - y) > SCROLL_TOLERANCE_PX) opts.restore(y);
    });
  };
  void Promise.allSettled([transition.ready, transition.updateCallbackDone]).then(correctDrift);
  transition.updateCallbackDone.catch(() => undefined);
  transition.finished.catch(() => undefined).finally(cleanup);
  return 'transition';
}
