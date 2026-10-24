import React, { useState, useEffect, useRef } from 'react';
import { isPrerenderBoot } from '@/utils/bootState';

interface LazyHydrateProps {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  minHeight?: string | number;
  whenVisible?: boolean; // Default behavior, kept for compatibility
  /**
   * Wrapper wypełnia wysokość rodzica (height: 100%). Potrzebne, gdy dziecko mierzy
   * rodzica — np. recharts `ResponsiveContainer height="100%"`: bez tego wrapper ma
   * wysokość 0 i wykres się nie rysuje.
   */
  fill?: boolean;
}

/**
 * LazyHydrate component
 * Prevents React from hydrating its children until they enter the viewport.
 * Vital for performance in heavy visual components.
 *
 * Wyjątek: start z prerenderowanego HTML (isPrerenderBoot). Treść sekcji JEST już
 * w DOM — zwinięcie jej do placeholdera kolapsowałoby wysokość dokumentu (utrata
 * pozycji przewijania) i zmuszało do ponownego renderu przy wejściu w viewport.
 * Wtedy LazyHydrate przepuszcza dzieci od razu (bez IntersectionObservera). Koszt:
 * efekty sekcji poniżej linii zgięcia startują od razu — tak jak dziś w pierwszym
 * renderze (dzieci i tak się montowały, a potem były odmontowywane). Po pierwszej
 * nawigacji SPA wraca zwykły, leniwy tryb.
 */
const LazyHydrate: React.FC<LazyHydrateProps> = ({
  children,
  rootMargin = '600px',
  threshold = 0.01,
  minHeight = '100px',
  fill = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(isPrerenderBoot);
  const rootRef = useRef<HTMLDivElement>(null);

  // Check for Prerendering (Puppeteer/Headless)

  const isPrerendering =
    typeof window !== 'undefined' &&
    (navigator.userAgent.includes('Headless') || window.isPrerendering);

  useEffect(() => {
    // Już renderujemy dzieci (prerender albo pass-through) — bez zbędnego re-renderu.
    if (isPrerendering || hydrated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Use requestAnimationFrame to prioritize visual stability
          requestAnimationFrame(() => {
            setHydrated(true);
          });
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    if (rootRef.current) {
      observer.observe(rootRef.current);
    }

    return () => observer.disconnect();
  }, [hydrated, rootMargin, threshold, isPrerendering]);

  // For SEO and initial hydration match
  // On the server AND on the first client render, we render children
  const shouldRenderChildren = isPrerendering || !mounted || hydrated;

  return (
    <div
      ref={rootRef}
      style={{
        minHeight: shouldRenderChildren ? undefined : minHeight,
        display: 'block',
        width: '100%',
        height: fill ? '100%' : undefined,
      }}
      suppressHydrationWarning={true}
      className={`lazy-hydrate ${hydrated ? 'lazy-hydrated' : 'lazy-placeholder'}`}
    >
      {shouldRenderChildren ? (
        children
      ) : (
        <div style={{ height: minHeight }} dangerouslySetInnerHTML={{ __html: '' }} />
      )}
    </div>
  );
};

export default LazyHydrate;
