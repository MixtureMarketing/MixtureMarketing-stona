import React, { useEffect, useRef, useState } from 'react';
import { addScrollTask } from '@/hooks/useSectionProgress';
import type { MixtureHandle } from './mixtureConfig';

/**
 * Pole „Mixture" — canvas sceny hero. Silnik (mixtureEngine) ładowany
 * dynamicznie PO hydratacji: zero kosztu w głównym chunku i w prerenderze
 * (window.isPrerendering → canvas zostaje pusty, bazowe tło sceny niesie CSS).
 * Fade-in po pierwszej narysowanej klatce; reduced-motion dostaje jedną
 * statyczną klatkę (globalny reduced-motion CSS zeruje czas przejścia).
 *
 * Komponent zasila silnik zdarzeniami DOM (motion-safe):
 * - pointer: fine → wygładzony kierunek gestu (setPointer, „mieszanie"),
 * - pointerdown (każdy rodzaj wskaźnika, także dotyk) → fala uderzeniowa
 *   ze śladem precyzji (pulse); klik w CTA też ją budzi — to celowe echo,
 * - scroll/resize → krawędź arkusza [data-mixture-front] (setFront — kropki
 *   rozpychane falą dziobową) + CSS var --cover na sekcji hero (0..1 pokrycia
 *   viewportu arkuszem; treść hero lekko ucieka i gaśnie).
 */
const MixtureField: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const handleRef = useRef<MixtureHandle | null>(null);
  const pausedRef = useRef(paused);

  // Pauza użytkownika (WCAG 2.2.2) — przycisk w Hero steruje pętlą silnika.
  useEffect(() => {
    pausedRef.current = paused;
    handleRef.current?.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.isPrerendering) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.closest('section') as HTMLElement | null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointerFine = !reduced && window.matchMedia('(pointer: fine)').matches;

    let handle: MixtureHandle | undefined;
    let cancelled = false;
    const ptr = { x: 0, y: 0, dx: 0, dy: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Wygładzony kierunek ruchu — prąd „miesza" w stronę gestu.
      const dx = x - ptr.x;
      const dy = y - ptr.y;
      const len = Math.hypot(dx, dy);
      if (len > 0.5) {
        ptr.dx = ptr.dx * 0.85 + (dx / len) * 0.15;
        ptr.dy = ptr.dy * 0.85 + (dy / len) * 0.15;
      }
      ptr.x = x;
      ptr.y = y;
      handle?.setPointer(x, y, ptr.dx, ptr.dy, true);
    };
    const onPointerLeave = () => handle?.setPointer(0, 0, 0, 0, false);

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      handle?.pulse(e.clientX - rect.left, e.clientY - rect.top);
    };

    // Krawędź arkusza „Kompetencji" → front silnika + --cover; zadanie we
    // wspólnym schedulerze (READ: rect-y arkusza/canvasu → WRITE: var + inert).
    let wasCovered = false;
    const measureTask = () => {
      const sheet = document.querySelector('[data-mixture-front]');
      if (!sheet) return;
      const top = sheet.getBoundingClientRect().top;
      const frontY = top - canvas.getBoundingClientRect().top;
      const cover = Math.min(1, Math.max(0, (window.innerHeight - top) / window.innerHeight));
      return () => {
        handle?.setFront(frontY);
        host?.style.setProperty('--cover', cover.toFixed(3));
        // Pełne zakrycie → inert na treści hero: fokus nie może wylądować pod
        // nieprzezroczystym arkuszem (WCAG 2.4.11 focus-obscured).
        const covered = cover >= 0.98;
        if (covered !== wasCovered) {
          wasCovered = covered;
          host
            ?.querySelectorAll('[data-hero-covers]')
            .forEach((el) => el.toggleAttribute('inert', covered));
        }
      };
    };

    let removeTask: (() => void) | undefined;

    import('./mixtureEngine').then(({ startMixture }) => {
      if (cancelled) return;
      handle = startMixture(canvas, {
        reducedMotion: reduced,
        onFirstFrame: () => setReady(true),
      });
      handleRef.current = handle;
      if (pausedRef.current) handle.setPaused(true);
      if (!reduced) removeTask = addScrollTask(measureTask);
    });

    if (pointerFine && host) {
      host.addEventListener('pointermove', onPointerMove, { passive: true });
      host.addEventListener('pointerleave', onPointerLeave, { passive: true });
    }
    if (!reduced && host) host.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      cancelled = true;
      removeTask?.();
      if (pointerFine && host) {
        host.removeEventListener('pointermove', onPointerMove);
        host.removeEventListener('pointerleave', onPointerLeave);
      }
      if (!reduced && host) host.removeEventListener('pointerdown', onPointerDown);
      handleRef.current = null;
      handle?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full transition-opacity duration-1000 ease-out ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
};

export default MixtureField;
