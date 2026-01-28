import React, { useState, useEffect, useRef } from 'react';

interface LazyHydrateProps {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  minHeight?: string | number;
  whenVisible?: boolean;
}

/**
 * LazyHydrate component
 * Prevents React from hydrating its children until they enter the viewport.
 * Vital for performance in heavy visual components.
 */
const LazyHydrate: React.FC<LazyHydrateProps> = ({
  children,
  rootMargin = '200px',
  threshold = 0.01,
  minHeight = '100px',
}) => {
  const [hydrated, setHydrated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we're in a browser and not hydrated yet
    if (typeof window !== 'undefined' && !hydrated) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHydrated(true);
            observer.disconnect();
          }
        },
        { rootMargin, threshold },
      );

      if (rootRef.current) {
        observer.observe(rootRef.current);
      }

      return () => observer.disconnect();
    }
  }, [hydrated, rootMargin, threshold]);

  // Check for Prerendering (Puppeteer/Headless)
  const isPrerendering =
    typeof window !== 'undefined' &&
    (navigator.userAgent.includes('Headless') || (window as any).isPrerendering);

  // During SSR (Node.js) or Prerendering, always render children normally
  if (typeof window === 'undefined' || isPrerendering) {
    return <div style={{ minHeight }}>{children}</div>;
  }

  return (
    <div
      ref={rootRef}
      style={{ minHeight: hydrated ? undefined : minHeight }}
      suppressHydrationWarning={true}
      className={hydrated ? 'lazy-hydrated' : 'lazy-placeholder'}
    >
      {hydrated ? (
        children
      ) : (
        <div dangerouslySetInnerHTML={{ __html: '' }} />
      )}
    </div>
  );
};

export default LazyHydrate;
