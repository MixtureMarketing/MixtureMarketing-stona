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
  /** Rejestr tła hero. `dark` → tekst w bieli (text-dark na granacie byłby niewidoczny). */
  tone?: 'light' | 'dark';
}

const HeroTrustLine: React.FC<HeroTrustLineProps> = ({
  promise = 'Odpowiadam osobiście w 24h',
  className = '',
  tone = 'light',
}) => {
  const dark = tone === 'dark';
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
        <p className={`flex items-center gap-1.5 font-bold ${dark ? 'text-white' : 'text-dark'}`}>
          Jakub Niedziela
          {/* role="img" — aria-label na gołym <span> (rola generic) jest zakazany
              przez ARIA i axe zgłasza to jako serious (aria-prohibited-attr). */}
          <span
            role="img"
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-white"
            aria-label="Zweryfikowany założyciel"
            title="Zweryfikowany założyciel"
          >
            <Check size={9} strokeWidth={3} aria-hidden="true" />
          </span>
        </p>
        <p className={dark ? 'text-white/65' : 'text-gray-600'}>{promise}</p>
      </div>
    </div>
  );
};

export default HeroTrustLine;
