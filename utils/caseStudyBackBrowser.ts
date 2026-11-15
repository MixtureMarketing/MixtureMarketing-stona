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
import { skipAndHandOver } from './caseStudyBackSkip';
import { withTopPin } from './caseStudyRootScroll';
import { backTicket, claimBack } from './caseStudyGeneration';
import { canReach, startRestore } from './caseStudyRestore';
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

  // Ten sam zapis przy kliknięciu (pozycja w chwili kliknięcia): zdarzenie `scroll` z ostatniej klatki mogłoby nie zdążyć przed nawigacją.

  // oddanie wstrzymanego popstate routerowi (nasłuch routera w fazie bąbelkowania); dispatchEvent nie rzuca
  // wyjątków nasłuchów (zgłasza je przeglądarka), więc flaga zawsze wraca
  const handToRouter = () => {
    passthrough = true;
    win.dispatchEvent(new PopStateEvent('popstate', { state: win.history.state }));
    passthrough = false;
  };

  const onPop = (e: PopStateEvent) => {
    if (passthrough) return; // nasze własne oddanie zdarzenia routerowi: to samo cofnięcie
    // nowe pokolenie (każdy odroczony skutek poprzedniego cofnięcia gaśnie); r6: dalej tylko pierwsze
    // cofnięcie dokładnie na listę źródłową, każde inne = przeglądarka (jak przy wyłączonym przełączniku)
    // MIX-1699: nieprzyjęte cofnięcie kończy też nasze przejście w toku od razu (bez czekania na jego bilet)
    // MIX-1707: bez żadnego przewinięcia z naszej strony (lista nie jest przewijana przed potwierdzeniem)
    // MIX-1707 r2: nasze przejście w toku = router dostaje je po zwolnieniu malowania (utils/caseStudyBackSkip.ts);
    // MIX-1739 (K3): po oddaniu pilnowanie góry strony (withTopPin)
    if (!claimBack(win.location)) return void skipAndHandOver(e, withTopPin(win, handToRouter));
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
    const cardHref = from.endsWith('/') ? from : `${from}/`;
    if (plan.kind !== 'transition' || !hero) return; // router działa, ScrollToTop przywróci pozycję
    e.stopImmediatePropagation();
    const live = backTicket(() => win.location);
    void runCaseStudyBackTransition({
      y: plan.y,
      hero,
      doc,
      redispatch: handToRouter,
      listReady: () => hasCard(doc, win, cardHref) && canReach(plan.y, { win, doc }),
      findCard: () => visibleCard(doc, win, cardHref),
      live,
      // MIX-1707: jedyne przywrócenie tego cofnięcia (ScrollToTop nie przewija, backOwned); lista jeszcze
      // niedość wysoka = czekanie na wzrost układu z tym samym biletem (jak dotąd w ScrollToTop)
      restore: (y) => void startRestore(y, { win, doc, guard: live }),
    });
  };

  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('click', onScroll, true);
  // capture: przed nasłuchem routera, który rejestruje się w fazie bąbelkowania
  win.addEventListener('popstate', onPop, true);
  return () => {
    win.removeEventListener('scroll', onScroll);
    win.removeEventListener('click', onScroll, true);
    win.removeEventListener('popstate', onPop, true);
  };
}
