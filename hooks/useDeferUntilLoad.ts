import { useEffect, useState } from 'react';

/**
 * Zwraca `true` dopiero po LCP — konkretnie po pierwszym `window.load`
 * eventem lub po idle callback (fallback). Animacje, IntersectionObservery,
 * `requestAnimationFrame` loop'y i inne non-critical taski powinny czekac
 * na ten sygnal, zeby nie konkurowac z renderem o main thread w window LCP.
 *
 * SSR/Prerender: zawsze zwraca `false` (puppeteer ma `window.isPrerendering`).
 * W produkcji uzytkownicy widza tresc visible od razu (prerendered HTML);
 * animacje wskakuja gdy LCP juz sie ulozyl.
 */
export const useDeferUntilLoad = (): boolean => {
  const [ready, setReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Prerendering: nigdy nie odpalamy animacji (zachowujemy CSS visible state).
    if (window.isPrerendering) return false;
    // Strona juz w pelni zaladowana (np. powrot z BFCache, route change).
    return document.readyState === 'complete';
  });

  useEffect(() => {
    if (ready) return;
    if (typeof window === 'undefined') return;
    if (window.isPrerendering) return;

    let cancelled = false;
    const finish = () => {
      if (!cancelled) setReady(true);
    };

    if (document.readyState === 'complete') {
      // Mozliwe gdy hook montuje sie po pelnym load.
      finish();
      return;
    }

    const onLoad = () => {
      // Dorzucamy maly delay + idle, zeby browser zdazyl ulozyc LCP i
      // observer/animacje nie konkurowaly o frame z LCP paintem.
      const win = window as typeof window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof win.requestIdleCallback === 'function') {
        win.requestIdleCallback(finish, { timeout: 500 });
      } else {
        setTimeout(finish, 100);
      }
    };

    window.addEventListener('load', onLoad, { once: true });
    // Bezpiecznik: jezeli load eventu nie ma (np. user scrolluje natychmiast
    // i przegladarka odpala wlasny render), po 2.5s i tak wlaczamy animacje.
    const fallback = setTimeout(onLoad, 2500);

    return () => {
      cancelled = true;
      window.removeEventListener('load', onLoad);
      clearTimeout(fallback);
    };
  }, [ready]);

  return ready;
};
