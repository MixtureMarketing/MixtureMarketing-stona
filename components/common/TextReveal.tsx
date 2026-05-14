import React, { useEffect, useRef, useState } from 'react';
import { useDeferUntilLoad } from '../../hooks/useDeferUntilLoad';

interface TextRevealProps {
  children: string | React.ReactNode;
  className?: string;
  delay?: number; // Initial delay before animation starts in ms
  stagger?: number; // Delay between each word in ms
  priority?: boolean; // If true, start animation immediately (good for Hero LCP)
}

/**
 * Animacja "reveal" per slowo — slowa wjezdzaja od dolu z opoznieniem.
 *
 * Performance:
 * - `priority=true` (Hero LCP) — animuje natychmiast (slowo Hero JEST LCP).
 * - Domyslnie (priority=false): czeka az `useDeferUntilLoad` zwroci true,
 *   wtedy uzbraja IntersectionObserver. Do tego czasu tekst jest visible
 *   (zachowuje prerender state, brak CLS).
 */
const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = '',
  delay = 0,
  stagger = 50,
  priority = false,
}) => {
  // Observer toggle - zaczyna jako false (przed-LCP visible przez derived state).
  const [observerVisible, setObserverVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const deferred = useDeferUntilLoad();

  // Derived final visibility:
  // - priority: zawsze visible (Hero LCP)
  // - przed LCP (deferred=false): visible (zachowuje prerender match)
  // - po LCP: kontroluje observer
  const isVisible = priority || !deferred || observerVisible;

  useEffect(() => {
    if (priority) return;
    if (!deferred) return;
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setObserverVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      },
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [deferred, priority]);

  const processText = (text: string) => {
    return text.split(' ').map((word, i) => (
      <span
        key={i}
        className="inline-block overflow-hidden align-bottom"
        style={{ marginRight: '0.25em' }}
      >
        <span
          className="reveal-text-item block"
          style={{
            animationDelay: isVisible ? `${delay + i * stagger}ms` : '999s',
            animationPlayState: isVisible ? 'running' : 'paused',
          }}
        >
          {word}
        </span>
      </span>
    ));
  };

  const content = typeof children === 'string' ? processText(children) : children;

  return (
    <span ref={ref} className={`${className} inline-block leading-tight`}>
      {content}
    </span>
  );
};

export default TextReveal;
