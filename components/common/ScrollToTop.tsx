import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { endPrerenderBoot } from '@/utils/bootState';
import { backRestoreTarget, savedPosition } from '@/utils/caseStudyBack';
import {
  armSource,
  backTicket,
  bumpGeneration,
  listenUserInput,
} from '@/utils/caseStudyGeneration';
import { startRestore } from '@/utils/caseStudyRestore';
import { installBackInterceptor, noteLocation } from '@/utils/caseStudyBackBrowser';
import { topScrollArgs } from '@/utils/caseStudyTransition';
import { isViewTransitionsEnabled } from '@/utils/viewTransitions';

/** Jak długo czekamy na element kotwicy po nawigacji SPA (trasa jest lazy — chunk i render). */
const HASH_WAIT_MS = 3000;
const HASH_POLL_MS = 100;

function findHashTarget(hash: string): HTMLElement | null {
  const id = hash.replace(/^#/, '');
  if (!id) return null;
  try {
    return document.getElementById(decodeURIComponent(id));
  } catch {
    return document.getElementById(id);
  }
}

export default function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();
  const navType = useNavigationType();
  const isFirst = useRef(true);
  const prevPathname = useRef(pathname);
  const prevLayoutPath = useRef(pathname);
  const restoredFor = useRef<string | null>(null);
  const locRef = useRef({ pathname, search });

  // MIX-1675: bieżąca lokalizacja routera dla biletu przywrócenia (zapis w efekcie, nie w renderze);
  // przejście linkiem (PUSH/REPLACE) to nowe pokolenie: oczekujące przywrócenie listy gaśnie.
  // r6: PUSH zapisuje stronę, z której wyszliśmy (jedyny cel, na który cofnięcie przywraca pozycję);
  // REPLACE (np. przekierowanie adresu realizacji) nie zmienia wpisu pod spodem, więc zapisu nie rusza.
  useLayoutEffect(() => {
    const from = locRef.current;
    locRef.current = { pathname, search };
    if (!isViewTransitionsEnabled() || navType === 'POP') return;
    bumpGeneration();
    if (navType === 'PUSH') armSource(from);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- każda nawigacja (klucz wpisu)
  }, [key]);

  // MIX-1675: zapis pozycji listy i przejęcie cofnięcia; layout effect dzieci wykonuje się przed
  // efektem routera, więc nasłuch popstate (faza capture) jest pierwszy.
  // Przełącznik wyłączony = nic nie nasłuchuje i nic nie przywraca (zachowanie jak przed MIX-1675).
  useLayoutEffect(() => (isViewTransitionsEnabled() ? installBackInterceptor() : undefined), []);
  // r6: przewinięcie, klawisz albo dotyk po cofnięciu = nasze oczekujące przywrócenie gaśnie
  useLayoutEffect(() => (isViewTransitionsEnabled() ? listenUserInput(window) : undefined), []);

  // MIX-1675: powrót z realizacji na stronę z zapisaną pozycją stoi na niej od pierwszej klatki
  // (layout effect, bez animacji) zamiast przewijać od góry. Kotwice (#) zostają po staremu.
  useLayoutEffect(() => {
    const prev = prevLayoutPath.current;
    prevLayoutPath.current = pathname;
    restoredFor.current = null;
    if (!isViewTransitionsEnabled()) return;
    noteLocation(pathname);
    if (prev === pathname || hash) return;
    const y = backRestoreTarget({
      from: prev,
      to: pathname,
      navType,
      saved: savedPosition(pathname),
    });
    if (y === null) return;
    // r6: tylko cofnięcie przyjęte w popstate (pierwsze, dokładnie na listę źródłową); inaczej jak wyłączony
    const live = backTicket(() => locRef.current);
    if (!live()) return;
    restoredFor.current = pathname;
    // bilet: inne pokolenie, inna ścieżka/query albo ruch użytkownika = oczekujące przywrócenie nic nie przewija
    startRestore(y, { guard: live });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tylko zmiana ścieżki
  }, [pathname]);

  useEffect(() => {
    // Pierwsze montowanie = wejście na stronę: NIE ruszamy pozycji. Użytkownik mógł
    // już przewinąć prerenderowany HTML (zanim JS się wykonał), a przy reloadzie
    // przeglądarka sama przywraca pozycję (i sama obsługuje #kotwicę z URL-a).
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const pathChanged = prevPathname.current !== pathname;
    prevPathname.current = pathname;
    if (pathChanged) {
      endPrerenderBoot(); // kolejne strony: LazyHydrate wraca do trybu leniwego
    }

    if (!hash) {
      if (pathChanged && restoredFor.current !== pathname) {
        const args = topScrollArgs(pathname, isViewTransitionsEnabled());
        if (args.length === 1) window.scrollTo(args[0]);
        else window.scrollTo(args[0], args[1]);
      }
      return;
    }

    // Nawigacja SPA z kotwicą (np. „Zobacz pakiety” → /abonament/#pricing): przeglądarka
    // nie przewija sama, bo docelowa strona renderuje się dopiero po zmianie URL-a.
    // Bez tego użytkownik lądował na górze strony zamiast w cenniku. Czekamy na element
    // (lazy chunk trasy) i przewijamy do niego; scroll-padding-top z index.css odsuwa
    // go spod stałego Navbara.
    if (pathChanged) window.scrollTo(0, 0);
    let cancelled = false;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tryScroll = () => {
      if (cancelled) return;
      const el = findHashTarget(hash);
      if (el) {
        el.scrollIntoView();
        return;
      }
      if (Date.now() - started < HASH_WAIT_MS) {
        timer = setTimeout(tryScroll, HASH_POLL_MS);
      }
    };
    tryScroll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}
