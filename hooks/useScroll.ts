import { useState, useEffect } from 'react';
import { addScrollTask } from './useSectionProgress';

/**
 * Stan przewinięcia (próg) i kierunek dla nawigacji.
 *
 * Działa we wspólnym schedulerze scrolla (addScrollTask): odczyt scrollY w fazie
 * READ razem z pozostałymi efektami, setState w fazie WRITE i tylko przy zmianie
 * (MIX-1470). Wcześniej własny rAF czytał scrollY po zapisach stylów innych
 * efektów w tej samej klatce, a efekt z zależnością [lastScrollY] co kilka
 * pikseli zdejmował i zakładał listener.
 */
export const useScroll = (threshold = 20) => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let lastY = 0;
    let lastScrolled = false;
    let lastDirection: 'up' | 'down' = 'up';

    return addScrollTask(() => {
      const y = window.scrollY;
      const nextScrolled = y > threshold;
      let nextDirection = lastDirection;
      // Bufor 5 px na kierunek (drgania trackpada nie przełączają go).
      if (Math.abs(y - lastY) > 5) {
        nextDirection = y > lastY ? 'down' : 'up';
        lastY = y;
      }
      if (nextScrolled === lastScrolled && nextDirection === lastDirection) return;
      lastScrolled = nextScrolled;
      lastDirection = nextDirection;
      return () => {
        setScrolled(nextScrolled);
        setScrollDirection(nextDirection);
      };
    });
  }, [threshold]);

  return { scrolled, scrollDirection };
};
