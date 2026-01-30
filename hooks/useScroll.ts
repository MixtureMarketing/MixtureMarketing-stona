import { useState, useEffect } from 'react';

/**
 * Optimized hook for tracking scroll position and direction.
 * Uses requestAnimationFrame to throttle state updates.
 */
export const useScroll = (threshold = 20) => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scrolled state
      if (currentScrollY > threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Update direction
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        // Small buffer for direction
        if (currentScrollY > lastScrollY) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
        setLastScrollY(currentScrollY);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY, threshold]);

  return { scrolled, scrollDirection };
};
