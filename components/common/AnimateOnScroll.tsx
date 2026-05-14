import React, { useEffect, useRef, useState } from 'react';
import { useDeferUntilLoad } from '../../hooks/useDeferUntilLoad';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

/**
 * Wrapper z animacja fade+rise gdy element wchodzi w viewport.
 *
 * Performance:
 * - Hydratacja: `isVisible=true` (zachowuje SSG/prerender state, brak CLS).
 * - IntersectionObserver odpalany dopiero po `window.load` (useDeferUntilLoad),
 *   wiec NIE konkuruje z LCP painted o main thread w pierwszej sekundzie.
 * - `motion-reduce` respektuje prefers-reduced-motion.
 */
const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
  once = true,
}) => {
  // Domyslnie visible — zgodne z prerender'em (HTML ma juz opacity-100).
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const deferred = useDeferUntilLoad();

  useEffect(() => {
    // Nie ruszamy observer'a dopoki LCP sie nie ulozyl.
    if (!deferred) return;
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setIsVisible(false);
        } else if (entry.boundingClientRect.top > 0) {
          // Element jest ponizej viewportu - schowaj, niech animuje gdy doscrolluje.
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      },
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [deferred, once, threshold]);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;
