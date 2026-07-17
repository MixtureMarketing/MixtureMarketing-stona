import React, { useEffect, useRef, useState } from 'react';
import type { FlipDotHandle } from './flipdotEngine';

/**
 * Nagłówek flip-dot — prawdziwy element nagłówka (SEO/czytniki/zaznaczanie),
 * w którym każde słowo dostaje własny moduł-tablicę (canvas nad spanem);
 * łamanie wierszy zostaje natywne dla HTML. Silnik ładowany dynamicznie PO
 * hydratacji; kaskada gra raz, przy wejściu w viewport. Prerender i
 * reduced-motion dostają czysty HTML — tablica w ogóle nie powstaje
 * (spoczynek = treść). Tekst gaśnie (inline color, wygrywa z utility)
 * dopiero gdy silnik POTWIERDZI zbudowaną tablicę — żaden scenariusz nie
 * zostawia pustego pasa.
 */
interface FlipDotHeadingProps {
  text: string;
  as?: 'h2' | 'h3';
  className?: string;
  /** Tryb laboratorium: klik/tap w nagłówek odgrywa kaskadę od nowa. */
  replayOnClick?: boolean;
}

const FlipDotHeading: React.FC<FlipDotHeadingProps> = ({
  text,
  as: Tag = 'h2',
  className = '',
  replayOnClick = false,
}) => {
  const headRef = useRef<HTMLHeadingElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const handleRef = useRef<FlipDotHandle | null>(null);
  const [board, setBoard] = useState(false);
  const words = text.split(' ');

  useEffect(() => {
    if (typeof window === 'undefined' || window.isPrerendering) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const head = headRef.current;
    if (!head) return;

    let cancelled = false;
    let io: IntersectionObserver | undefined;

    // Glify z matrycy znaków (flipdotFont) — silnik nie zależy od
    // załadowania Manrope; wystarczy geometria spanów po layoucie.
    Promise.all([import('./flipdotEngine'), document.fonts.ready]).then(([{ startFlipDot }]) => {
      if (cancelled) return;
      const targets = words
        .map((word, i) => ({ word, canvas: canvasRefs.current[i] }))
        .filter((t): t is { word: string; canvas: HTMLCanvasElement } => t.canvas !== null);
      if (targets.length !== words.length) return;
      const handle = startFlipDot(head, targets);
      handleRef.current = handle;
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io?.disconnect();
          if (handle.play()) setBoard(true);
        },
        { threshold: 0.4 },
      );
      io.observe(head);
    });

    return () => {
      cancelled = true;
      io?.disconnect();
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // words pochodzi z text — wystarczy zależność od text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag
      ref={headRef}
      className={`${className} transition-colors duration-300`}
      style={board ? { color: 'transparent' } : undefined}
      onClick={replayOnClick ? () => handleRef.current?.replay() : undefined}
    >
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          {i > 0 && ' '}
          <span className="relative inline-block">
            {word}
            <canvas
              ref={(el) => {
                canvasRefs.current[i] = el;
              }}
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 h-full w-full ${
                board ? '' : 'opacity-0'
              }`}
            />
          </span>
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default FlipDotHeading;
