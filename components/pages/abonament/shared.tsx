/**
 * Wspólne komponenty grupy /abonament/* (C5 + C2 consistency).
 * HeroBadge: jednolity wzorzec "live-dot" badge nad H1.
 * GhostButton: secondary CTA (border ghost) cross-page consistent.
 */
import React from 'react';
import { Link } from 'react-router-dom';

type Accent = 'emerald' | 'amber';

interface HeroBadgeProps {
  accent?: Accent;
  /** Czy renderować animowaną kropkę "ping" (live signal). Default: true */
  live?: boolean;
  /** Opcjonalna Lucide ikona (zastępuje kropkę gdy live=false) */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const HERO_BADGE_ACCENTS: Record<
  Accent,
  { bg: string; border: string; text: string; dot: string; ping: string }
> = {
  emerald: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-600',
    ping: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-600',
    ping: 'bg-amber-500',
  },
};

export const HeroBadge: React.FC<HeroBadgeProps> = ({
  accent = 'emerald',
  live = true,
  icon,
  children,
  className = '',
}) => {
  const c = HERO_BADGE_ACCENTS[accent];
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${c.bg} border ${c.border} ${c.text} text-xs font-black uppercase tracking-[0.2em] shadow-sm ${className}`}
    >
      {live ? (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span
            className={`motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full ${c.ping} opacity-75`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
        </span>
      ) : icon ? (
        <span aria-hidden="true">{icon}</span>
      ) : null}
      <span>{children}</span>
    </div>
  );
};

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
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )?.matches;
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
