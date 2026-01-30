import React, { useState, useEffect, useRef } from 'react';

interface LazyHydrateProps {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  minHeight?: string | number;
  whenVisible?: boolean; // Default behavior, kept for compatibility
}

/**
 * LazyHydrate component
 * Prevents React from hydrating its children until they enter the viewport.
 * Vital for performance in heavy visual components.
 */
const LazyHydrate: React.FC<LazyHydrateProps> = ({
  children,
  rootMargin = '600px',
  threshold = 0.01,
  minHeight = '100px',
}) => {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Check for Prerendering (Puppeteer/Headless)

  const isPrerendering =
    typeof window !== 'undefined' &&
    (navigator.userAgent.includes('Headless') || window.isPrerendering);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (isPrerendering || hydrated) return;

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
