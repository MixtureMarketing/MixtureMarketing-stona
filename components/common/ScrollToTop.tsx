import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { endPrerenderBoot } from '@/utils/bootState';

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
  const { pathname, hash } = useLocation();
  const isFirst = useRef(true);
  const prevPathname = useRef(pathname);

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
      if (pathChanged) window.scrollTo(0, 0);
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
