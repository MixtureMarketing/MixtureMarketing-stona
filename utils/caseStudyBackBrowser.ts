// Podpięcie powrotu z realizacji na listę do przeglądarki (MIX-1675).
// Montuje to ScrollToTop TYLKO przy włączonym przełączniku VITE_MM_VIEW_TRANSITIONS: zapis pozycji
// listy i przywrócenie jej bez animacji; przejście (zmniejszenie zdjęcia do karty) dodatkowo przy
// wszystkich warunkach z planBack(). Wyłączony = brak nasłuchów i zmian (zachowanie jak dawniej).
import {
  holdRecording,
  manualRestorationFor,
  isCaseStudyRoute,
  planBack,
  recordScroll,
  savedPosition,
} from './caseStudyBack';
import { runCaseStudyBackTransition } from './caseStudyBackTransition';
import { canReach, scrollInstant } from './caseStudyRestore';
import { isTransitionActive } from './caseStudyTransition';
import {
  caseStudyPath,
  findCardParts,
  findHeroParts,
  isViewTransitionsEnabled,
  motionAllowed,
  supportsViewTransitions,
} from './viewTransitions';

let trackedPath: string | null = null;
let passthrough = false;

/** ScrollToTop zgłasza każdą zmianę trasy (potrzebne do rozpoznania „z realizacji”). */
export function noteLocation(pathname: string): void {
  trackedPath = pathname;
}

/** Karta realizacji `href` na liście: widoczny link ze zdjęciem (ta sama reguła co przy wejściu). */
function visibleCard(
  doc: Document,
  win: Window,
  href: string,
): { image: HTMLElement; title: HTMLElement | null } | null {
  for (const a of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    if (caseStudyPath(a.getAttribute('href'), win.location.origin) !== href) continue;
    const parts = findCardParts(a);
    if (!parts) continue;
    const r = parts.image.getBoundingClientRect();
    if (r.bottom > 0 && r.top < win.innerHeight && r.width > 0) return parts;
  }
  return null;
}

function hasCard(doc: Document, win: Window, href: string): boolean {
  return Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href]')).some(
    (a) => caseStudyPath(a.getAttribute('href'), win.location.origin) === href,
  );
}

/** Nasłuch przewijania i cofania; zwraca funkcję zdejmującą. Wołać przed montażem routera. */
export function installBackInterceptor(win: Window = window, doc: Document = document): () => void {
  if (trackedPath === null) trackedPath = win.location.pathname;

  const onScroll = () => recordScroll(win.location.pathname, win.scrollY);

  // Pozycja w chwili kliknięcia: zdarzenie `scroll` z ostatniej klatki mogłoby nie zdążyć przed nawigacją.
  const onClick = () => recordScroll(win.location.pathname, win.scrollY);

  const onPop = (e: PopStateEvent) => {
    if (passthrough) return;
    const from = trackedPath;
    const to = win.location.pathname;
    if (!from || !isCaseStudyRoute(from) || isCaseStudyRoute(to)) return;
    const saved = savedPosition(to);
    if (saved === null) return; // wejście bez zapisu: zachowanie przeglądarki
    const hero = findHeroParts(doc);
    const plan = planBack({
      from,
      to,
      saved,
      enabled: isViewTransitionsEnabled(),
      supported: supportsViewTransitions(doc),
      motion: motionAllowed(win),
      active: isTransitionActive(),
      hero: hero !== null,
    });
    if (plan.kind === 'none') return; // przełącznik wyłączony: bez żadnych zmian
    // zdarzenia przewinięcia od samej przeglądarki nie mogą nadpisać zapisanej pozycji
    holdRecording();
    manualRestorationFor(win);
    const toSearch = win.location.search;
    const cardHref = from.endsWith('/') ? from : `${from}/`;
    if (plan.kind !== 'transition' || !hero) return; // router działa, ScrollToTop przywróci pozycję
    e.stopImmediatePropagation();
    void runCaseStudyBackTransition({
      y: plan.y,
      hero,
      doc,
      redispatch: () => {
        passthrough = true;
        try {
          win.dispatchEvent(new PopStateEvent('popstate', { state: win.history.state }));
        } finally {
          passthrough = false;
        }
      },
      listReady: () => hasCard(doc, win, cardHref) && canReach(plan.y, { win, doc }),
      findCard: () => visibleCard(doc, win, cardHref),
      stillOnList: () => win.location.pathname === to && win.location.search === toSearch,
      restore: (y) => scrollInstant(y, win),
    });
  };

  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('click', onClick, true);
  // capture: przed nasłuchem routera, który rejestruje się w fazie bąbelkowania
  win.addEventListener('popstate', onPop, true);
  return () => {
    win.removeEventListener('scroll', onScroll);
    win.removeEventListener('click', onClick, true);
    win.removeEventListener('popstate', onPop, true);
  };
}
