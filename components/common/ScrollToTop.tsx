import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { endPrerenderBoot } from '@/utils/bootState';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    // Pierwsze montowanie = wejście na stronę: NIE ruszamy pozycji. Użytkownik mógł
    // już przewinąć prerenderowany HTML (zanim JS się wykonał), a przy reloadzie
    // przeglądarka sama przywraca pozycję. Na górę przewijamy tylko po nawigacji SPA.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    endPrerenderBoot(); // kolejne strony: LazyHydrate wraca do trybu leniwego
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
