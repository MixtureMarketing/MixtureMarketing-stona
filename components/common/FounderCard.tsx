/**
 * Wspolny komponent karty zalozyciela — uzywany na local landings (Grupa C)
 * jako lokalny trust signal. Wersja "compact" zoptymalizowana pod sekcje
 * "Spotkasz sie z Jakubem", bez dlugiego bio (vs pelne /abonament/).
 *
 * Local B2B kupuje od czlowieka, nie od bezimiennej agencji — szczegolnie
 * istotne gdy biuro jest wirtualne (memory rule).
 */
import React from 'react';
import { Linkedin, Mail, MapPin } from 'lucide-react';

const LINKEDIN_URL = 'https://pl.linkedin.com/in/jakub-niedziela-9251a8254';
const EMAIL = 'info@mixturemarketing.pl';

interface FounderCardProps {
  /** Krotkie zdanie wprowadzajace ("Spotkasz sie z Jakubem", "Twoj kontakt", etc.) */
  intro?: string;
  /** Custom bio (kontekst per landing — Web/SEO/Agencja) */
  bio?: React.ReactNode;
  className?: string;
}

const DEFAULT_BIO = (
  <>
    Od 2020 prowadzę agencję marketingową w Rzeszowie. Łączę kompetencje fullstack developera z
    performance marketingiem — strona, kampania i analityka pod jednym dachem. Spotkasz się
    bezpośrednio ze mną, bez handlowca-pośrednika.
  </>
);

const FounderCard: React.FC<FounderCardProps> = ({
  intro = 'Spotkasz się z Jakubem',
  bio = DEFAULT_BIO,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 ${className}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">{intro}</p>
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-primary/10">
          <picture>
            <source srcSet="/assets/team/jakub-niedziela-400.avif" type="image/avif" />
            <source srcSet="/assets/team/jakub-niedziela-400.webp" type="image/webp" />
            <img
              src="/assets/team/jakub-niedziela-400.jpg"
              alt="Jakub Niedziela — założyciel Mixture Marketing"
              width="160"
              height="160"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </picture>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl md:text-2xl font-bold text-dark mb-1">Jakub Niedziela</h3>
          <p className="text-sm font-semibold text-secondary mb-2 flex items-center gap-1.5 flex-wrap">
            Założyciel · Fullstack developer
            <span className="inline-flex items-center gap-1 text-gray-500 font-medium">
              <MapPin size={12} aria-hidden="true" />
              Rzeszów
            </span>
          </p>
          <div className="text-gray-700 text-sm leading-relaxed">{bio}</div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer me"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full text-xs font-bold transition-colors"
              aria-label="LinkedIn Jakub Niedziela (nowa karta)"
            >
              <Linkedin size={14} aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-primary hover:text-secondary text-dark rounded-full text-xs font-bold transition-colors"
            >
              <Mail size={14} aria-hidden="true" />
              {EMAIL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderCard;
