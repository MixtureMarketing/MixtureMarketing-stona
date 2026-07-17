import React from 'react';

interface TrustMarqueeProps {
  label: string;
  items: string[];
  className?: string;
  /** Pauza użytkownika (WCAG 2.2.2) — zatrzymuje pętlę marquee. */
  paused?: boolean;
}

/**
 * Pas zaufania — CSS-only marquee (zero nowego JS, przyjazny size-limit).
 * Lista renderowana 2× dla bezszwowej pętli (translate -50%). prefers-reduced-motion
 * zatrzymuje ruch (index.css → .animate-marquee w liście animation:none) i pas jest
 * czytelny statycznie. Wariant typograficzny (nazwy realizacji); podmiana na logo
 * bez zmiany struktury.
 */
const MarqueeRow: React.FC<{ items: string[]; ariaHidden?: boolean }> = ({ items, ariaHidden }) => (
  <ul
    className="flex shrink-0 items-center gap-x-10 pr-10"
    aria-hidden={ariaHidden}
    role={ariaHidden ? 'presentation' : 'list'}
  >
    {items.map((name, i) => (
      <li key={i} className="flex items-center gap-x-10">
        <span className="whitespace-nowrap text-sm font-bold tracking-wide text-white/70">
          {name}
        </span>
        <span className="h-1 w-1 rounded-full bg-primary/70" aria-hidden="true" />
      </li>
    ))}
  </ul>
);

const TrustMarquee: React.FC<TrustMarqueeProps> = ({
  label,
  items,
  className = '',
  paused = false,
}) => {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 ${className}`}>
      <span className="shrink-0 text-xxs font-black uppercase tracking-[0.22em] text-white/45">
        {label}
      </span>
      <div className="mask-fade-x relative w-full overflow-hidden">
        <div
          className="flex w-max motion-safe:animate-marquee"
          style={paused ? { animationPlayState: 'paused' } : undefined}
        >
          <MarqueeRow items={items} />
          <MarqueeRow items={items} ariaHidden />
        </div>
      </div>
    </div>
  );
};

export default TrustMarquee;
