/**
 * Mini trust line pod hero CTA — kompaktowa wersja FounderCard z avatarem
 * + krotka mikrolinia ("Jakub Niedziela odpowiada osobiscie w 24h").
 * Uzywana na service landings (Grupa E) gdzie pelna FounderCard byloby
 * over-engineering w hero (jest jeszcze ponizej w sekcji kontakt).
 */
import React from 'react';
import { Check } from 'lucide-react';

interface HeroTrustLineProps {
  /** Krotki tekst pod imieniem (np. "odpowiada osobiscie w 24h") */
  promise?: string;
  className?: string;
}

const HeroTrustLine: React.FC<HeroTrustLineProps> = ({
  promise = 'Odpowiadam osobiście w 24h',
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
        <picture>
          <source srcSet="/assets/team/jakub-niedziela-400.avif" type="image/avif" />
          <source srcSet="/assets/team/jakub-niedziela-400.webp" type="image/webp" />
          <img
            src="/assets/team/jakub-niedziela-400.jpg"
            alt="Jakub Niedziela — założyciel Mixture Marketing"
            width="40"
            height="40"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </picture>
      </div>
      <div className="text-xs leading-tight">
        <p className="font-bold text-dark flex items-center gap-1.5">
          Jakub Niedziela
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-white"
            aria-label="Zweryfikowany założyciel"
            title="Zweryfikowany założyciel"
          >
            <Check size={9} strokeWidth={3} aria-hidden="true" />
          </span>
        </p>
        <p className="text-gray-600">{promise}</p>
      </div>
    </div>
  );
};

export default HeroTrustLine;
