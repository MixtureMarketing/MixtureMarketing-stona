// MIX-1799: chowanie przycisku ciasteczek (`fixed`) na czas, gdy przewijany element kalkulatora
// nachodzi na niego. Pomiar na prawdziwych prostokątach (każda szerokość), reguła CSS w index.css.
import React, { useEffect } from 'react';

/** Zapas wokół przycisku ciasteczek (px): chowamy go, zanim krawędź podglądu dojedzie pod niego. */
export const COOKIE_GAP_PX = 4;

/**
 * Przycisk ciasteczek jest `fixed`, więc podczas przewijania zasłaniałby dół podglądu (MIX-1799,
 * uwaga Z6: 1250 px² na 390 px) i przyciski linku (700 px²). Gdy prostokąt elementu nachodzi na
 * widoczny przycisk, body dostaje znacznik `flag` (data-config-preview-cookie albo
 * data-config-link-cookie), a reguła w index.css chowa przycisk (visibility), dopóki podgląd nie
 * zjedzie. Pomiar na prawdziwych prostokątach, więc działa na każdej szerokości; przycisk wraca po
 * przewinięciu, a ustawienia zgód zostają dostępne.
 */
export function useHideCookieOver(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  flag: 'configPreviewCookie' | 'configLinkCookie' | 'timelineCookie',
) {
  useEffect(() => {
    const box = ref.current;
    if (!active || !box) return;
    const body = document.body;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const p = box.getBoundingClientRect();
      let over = false;
      if (p.width > 0 && p.height > 0) {
        for (const el of document.querySelectorAll('.cookie-floating-btn')) {
          const c = el.getBoundingClientRect();
          if (c.width <= 0 || c.height <= 0) continue;
          if (
            c.left < p.right &&
            c.right > p.left &&
            c.top - COOKIE_GAP_PX < p.bottom &&
            c.bottom + COOKIE_GAP_PX > p.top
          )
            over = true;
        }
      }
      if (over) body.dataset[flag] = 'true';
      else delete body.dataset[flag];
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Przycisk ciasteczek ma przejście `bottom` (300 ms): po jego końcu pomiar jest ostateczny.
    document.addEventListener('transitionend', schedule);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    ro?.observe(box);
    return () => {
      ro?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('transitionend', schedule);
      if (raf) cancelAnimationFrame(raf);
      delete body.dataset[flag];
    };
  }, [ref, active, flag]);
}
