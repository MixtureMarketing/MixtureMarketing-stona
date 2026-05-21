/**
 * Wspólne komponenty grupy /abonament/* (C5 + C2 consistency).
 * GhostButton: secondary CTA (border ghost) cross-page consistent.
 * HeroBadge: re-export z common dla backwards compat.
 */
import React from 'react';
import { Link } from 'react-router-dom';

// Re-export wspolnego HeroBadge (moved to common/HeroBadge.tsx w Sprint B3)
export { default as HeroBadge } from '../../common/HeroBadge';

type Accent = 'emerald' | 'amber';

interface GhostButtonBaseProps {
  accent?: Accent;
  className?: string;
  children: React.ReactNode;
}

interface GhostLinkProps extends GhostButtonBaseProps {
  to: string;
  href?: never;
  onClick?: never;
}
interface GhostAnchorProps extends GhostButtonBaseProps {
  href: string;
  to?: never;
  onClick?: never;
  target?: string;
  rel?: string;
}
interface GhostButtonClickProps extends GhostButtonBaseProps {
  onClick: () => void;
  to?: never;
  href?: never;
  type?: 'button' | 'submit';
}

type GhostProps = GhostLinkProps | GhostAnchorProps | GhostButtonClickProps;

const GHOST_ACCENTS: Record<Accent, string> = {
  emerald:
    'border-gray-200 text-dark hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:border-emerald-600',
  amber:
    'border-gray-200 text-dark hover:border-amber-600 hover:bg-amber-50 hover:text-amber-700 focus-visible:border-amber-600',
};

const GHOST_BASE =
  'inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 font-bold rounded-full transition-colors motion-safe:focus-visible:-translate-y-0.5';

/**
 * CountUp — animuje liczbę od 0 do `to` gdy element wjedzie w viewport.
 * Respektuje prefers-reduced-motion — natychmiast pokazuje finalną wartość.
 */
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
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
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

export const GhostButton: React.FC<GhostProps> = (props) => {
  const accent = props.accent || 'emerald';
  const cls = `${GHOST_BASE} ${GHOST_ACCENTS[accent]} ${props.className || ''}`;
  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={cls}>
        {props.children}
      </Link>
    );
  }
  if ('href' in props && props.href !== undefined) {
    return (
      <a href={props.href} className={cls} target={props.target} rel={props.rel}>
        {props.children}
      </a>
    );
  }
  return (
    <button
      type={(props as GhostButtonClickProps).type || 'button'}
      onClick={(props as GhostButtonClickProps).onClick}
      className={cls}
    >
      {props.children}
    </button>
  );
};
