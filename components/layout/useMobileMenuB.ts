import React, { useEffect, useRef } from 'react';

// MIX-1465: zachowanie karty menu B przeniesione z makiety (makiety/mix1465/zrodla/b.src.html):
// strona pod kartą `inert`, blokada przewijania, fokus, przeciąganie w dół.

export const TOGGLE_SELECTOR = 'button[aria-controls="mobile-menu"]';
/** Przeciąganie: zamknięcie po > 96 px albo machnięciu > 0,5 px/ms (jak w makiecie). */
export const CLOSE_DISTANCE = 96;
export const FLICK_SPEED = 0.5;

/** Fokusowalne elementy karty do pętli Tab (bez nieaktywnego ekranu i ukrytych zakładek). */
export const focusables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('a[href], button:not([tabindex="-1"])')].filter(
    (el) => !el.closest('[inert],[hidden]'),
  );

/** Strona pod kartą jest `inert`, gdy menu otwarte (jak `page.inert` w makiecie). */
function makeRestInert(keep: HTMLElement): () => void {
  const changed: HTMLElement[] = [];
  for (let el: HTMLElement | null = keep; el && el !== document.body; el = el.parentElement) {
    const parent: HTMLElement | null = el.parentElement;
    if (!parent) break;
    const siblings = Array.from(parent.children) as HTMLElement[];
    for (const sib of siblings) {
      if (sib === el || sib.hasAttribute('inert') || /^(SCRIPT|STYLE|LINK)$/.test(sib.tagName))
        continue;
      sib.setAttribute('inert', '');
      changed.push(sib);
    }
  }
  return () => changed.forEach((el) => el.removeAttribute('inert'));
}

/**
 * Otwarcie: fokus na X, strona pod spodem inert, przewijanie zablokowane (body przypięte z
 * zapamiętanym scrollY, działa też na iOS). Zamknięcie: wszystko cofnięte, fokus wraca na
 * przycisk menu (decyzja Jakuba MIX-1465: Escape na ekranie głównym zamyka i oddaje fokus).
 */
export function useOpenSheet(
  isOpen: boolean,
  layerRef: React.RefObject<HTMLDivElement | null>,
  closeRef: React.RefObject<HTMLButtonElement | null>,
  onOpened: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;
    const layer = layerRef.current;
    const restoreInert = layer ? makeRestInert(layer) : () => {};
    const body = document.body;
    const savedY = window.scrollY;
    const keys = ['position', 'top', 'left', 'right', 'width'] as const;
    const prev = keys.map((k) => body.style[k]);
    Object.assign(body.style, {
      position: 'fixed',
      top: `${-savedY}px`,
      left: '0',
      right: '0',
      width: '100%',
    });
    closeRef.current?.focus({ preventScroll: true });
    const raf = requestAnimationFrame(onOpened);
    return () => {
      cancelAnimationFrame(raf);
      keys.forEach((k, i) => (body.style[k] = prev[i]));
      if (savedY) window.scrollTo({ top: savedY, left: 0, behavior: 'instant' });
      restoreInert();
      document.querySelector<HTMLElement>(TOGGLE_SELECTOR)?.focus({ preventScroll: true });
    };
  }, [isOpen, layerRef, closeRef, onOpened]);
}

type Drag = { id: number; y0: number; dy: number; samples: { y: number; t: number }[] };

/** Przeciąganie w dół za uchwyt i nagłówek: karta idzie za palcem, tło jaśnieje razem z nią. */
export function useSheetDrag(
  layerRef: React.RefObject<HTMLDivElement | null>,
  menuRef: React.RefObject<HTMLDivElement | null>,
  close: () => void,
) {
  const dragRef = useRef<Drag | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current || e.button > 0 || (e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      id: e.pointerId,
      y0: e.clientY,
      dy: 0,
      samples: [{ y: e.clientY, t: e.timeStamp }],
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const layer = layerRef.current;
    if (!drag || e.pointerId !== drag.id || !layer) return;
    drag.dy = Math.max(0, e.clientY - drag.y0);
    drag.samples.push({ y: e.clientY, t: e.timeStamp });
    if (drag.samples.length > 12) drag.samples.shift();
    const h = menuRef.current?.offsetHeight || 1;
    layer.setAttribute('data-dragging', '');
    layer.style.setProperty('--dy', `${drag.dy}px`);
    layer.style.setProperty('--p', String(Math.max(0, 1 - drag.dy / h)));
  };
  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.id) return;
    dragRef.current = null;
    const now = drag.samples[drag.samples.length - 1];
    const ref = drag.samples.find((s) => now.t - s.t <= 100) || now;
    const speed = now.t > ref.t ? (now.y - ref.y) / (now.t - ref.t) : 0;
    const shouldClose = e.type === 'pointerup' && (drag.dy > CLOSE_DISTANCE || speed > FLICK_SPEED);
    const layer = layerRef.current;
    if (layer) {
      layer.removeAttribute('data-dragging');
      layer.style.removeProperty('--dy');
      layer.style.removeProperty('--p');
    }
    if (shouldClose) close();
  };
  return { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag };
}

export type DragZone = ReturnType<typeof useSheetDrag>;

/** Od 1024 px menu mobilne znika (strona pokazuje pasek nawigacji): zamknij, jeśli otwarte. */
export function useCloseOnDesktop(isOpen: boolean, close: () => void, onResize: () => void) {
  useEffect(() => {
    if (!isOpen || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => e.matches && close();
    mq.addEventListener?.('change', onChange);
    window.addEventListener('resize', onResize);
    return () => {
      mq.removeEventListener?.('change', onChange);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, close, onResize]);
}
