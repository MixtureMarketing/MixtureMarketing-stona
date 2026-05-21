/**
 * Wspolny komponent badge "live-dot" nad H1 — uzywany na wszystkich landingach.
 * Spojny wzorzec dla calej witryny (przeniesiony z grupy A /abonament/* gdzie
 * po raz pierwszy zdefiniowany).
 */
import React from 'react';

type Accent = 'emerald' | 'amber' | 'secondary' | 'primary';

interface HeroBadgeProps {
  accent?: Accent;
  /** Czy renderowac animowana kropke "ping" (live signal). Default: true */
  live?: boolean;
  /** Opcjonalna ikona (zastepuje kropke gdy live=false) */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ACCENTS: Record<
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
  secondary: {
    bg: 'bg-white',
    border: 'border-secondary/20',
    text: 'text-secondary',
    dot: 'bg-secondary',
    ping: 'bg-secondary',
  },
  primary: {
    bg: 'bg-white',
    border: 'border-primary/30',
    text: 'text-dark',
    dot: 'bg-primary',
    ping: 'bg-primary',
  },
};

const HeroBadge: React.FC<HeroBadgeProps> = ({
  accent = 'emerald',
  live = true,
  icon,
  children,
  className = '',
}) => {
  const c = ACCENTS[accent];
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

export default HeroBadge;
