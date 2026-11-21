/**
 * CountUp — animuje liczbę od 0 do `to` gdy element wjedzie w viewport.
 * Respektuje prefers-reduced-motion — natychmiast pokazuje finalną wartość.
 * Wydzielone w MIX-1849 z modułu usuniętej usługi; używają go strony Rzeszowa
 * (agencja interaktywna, pozycjonowanie).
 */
import React from 'react';

interface CountUpProps {
  to: number;
  /** Liczba miejsc po przecinku */
  decimals?: number;
  /** Sufix (np. "%", " s") */
  suffix?: string;
  /** Czas animacji w ms */
  duration?: number;
  className?: string;
}
export const CountUp: React.FC<CountUpProps> = ({
  to,
  decimals = 0,
  suffix = '',
  duration = 1200,
  className,
}) => {
  // Start od wartości docelowej przy prerenderze: Puppeteer zapisywał do
  // dist/**/index.html stan „0" sprzed IntersectionObservera — Google
  // indeksował „od 0 zł" i „0+" zamiast realnych liczb (P0, 2026-07-17).
  const [value, setValue] = React.useState(() =>
    typeof window !== 'undefined' && window.isPrerendering ? to : 0,
  );
  const ref = React.useRef<HTMLSpanElement>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (window.isPrerendering) return;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion: od razu wartość końcowa
      setValue(to);
      return;
    }
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(to * eased);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};
