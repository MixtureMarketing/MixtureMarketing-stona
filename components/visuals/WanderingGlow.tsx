import React from 'react';
import { useSectionProgress } from '../../hooks/useSectionProgress';

/**
 * Wędrujące światło ciemnych pasm (wątek „żywej całości", 2026-07-16):
 * warstwa gradientu przesuwa się poziomo wraz z przewijaniem — światło
 * z ciemni hero „przechodzi" przez stronę, w obie strony scrolla.
 * Compositor-only (translate3d na warstwie-dziecku, nigdy background-position
 * = paint). Span 1.6: postęp biegnie przez CAŁY tranzyt pasma przez viewport,
 * nie tylko wejście. Spoczynek/prerender/reduced: var(--p,1) → światło stoi
 * w pozycji końcowej — statyczna kompozycja bez ruchu.
 * Rodzic MUSI być relative + overflow-hidden; warstwa wystaje po 20%
 * z każdej strony, żeby ruch nie odsłaniał krawędzi.
 */
interface WanderingGlowProps {
  /** CSS background (radial-gradienty w kolorach marki). */
  background: string;
  /** Amplituda ruchu w % szerokości warstwy (pełny przebieg p 0→1). */
  amplitude?: number;
  className?: string;
}

const WanderingGlow: React.FC<WanderingGlowProps> = ({
  background,
  amplitude = 10,
  className = '',
}) => {
  const ref = useSectionProgress<HTMLDivElement>(1.6);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-[20%] ${className}`}
      style={{
        background,
        transform: `translate3d(calc((var(--p, 1) - 0.5) * ${amplitude}%), 0, 0)`,
      }}
    />
  );
};

export default WanderingGlow;
