import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

/**
 * Zajawka darmowego audytu (formularz → /audyt-360). Przepisana 2026-07-16
 * (audyt B czterech podstron marketingu — komponent skażał każdą stronę,
 * na której stoi): usunięte gradient-text (zakaz), szklany wariant
 * (No-Glass), obce palety emerald/google/indigo (zostaje paleta marki)
 * oraz SFABRYKOWANY social proof („+4k" awatarów i „Zaufali nam liderzy
 * branży" — liczba z powietrza). Nagłówek konfigurowalny (domyślnie h2 —
 * komponent stoi zwykle tuż po hero i h3 przeskakiwał poziom).
 * Stare propsy variant/colorScheme są przyjmowane i ignorowane poza
 * light/dark — wołające strony nie wymagają zmian.
 */
interface AuditTeaserProps {
  placeholder?: string;
  buttonText?: string;
  className?: string;
  initialUrl?: string;
  variant?: 'light' | 'dark' | 'glass';
  colorScheme?: 'emerald' | 'blue' | 'indigo';
  layout?: 'default' | 'compact';
  headingLevel?: 'h2' | 'h3';
}

const AuditTeaser: React.FC<AuditTeaserProps> = ({
  placeholder = 'Wpisz adres...',
  buttonText = 'Analizuj',
  className = '',
  initialUrl = '',
  variant = 'light',
  layout = 'default',
  headingLevel = 'h2',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const navigate = useNavigate();

  const isCompact = layout === 'compact';
  const isDark = variant === 'dark';
  const Heading = headingLevel;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    navigate(`/audyt-360?url=${encodeURIComponent(cleanUrl)}`);
  };

  return (
    <div
      className={`rounded-[2.5rem] border p-1 ${
        isDark
          ? 'border-white/10 bg-deep-dark text-white shadow-2xl'
          : 'border-gray-100 bg-white shadow-xl'
      } ${className} ${isCompact ? 'rounded-3xl' : 'sm:p-2'}`}
    >
      <div
        className={`relative overflow-hidden rounded-[2.2rem] ${
          isCompact ? 'rounded-[1.4rem] p-6' : 'px-6 py-10 sm:p-10'
        }`}
      >
        {/* Tania poświata w palecie marki (radial, bez blur-filtra). */}
        {!isCompact && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(40% 60% at 100% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 65%),' +
                'radial-gradient(40% 60% at 0% 100%, color-mix(in srgb, var(--color-secondary) 8%, transparent), transparent 65%)',
            }}
            aria-hidden="true"
          />
        )}

        <div className="relative z-10">
          <div className={isCompact ? 'mb-6' : 'mb-10 max-w-xl'}>
            <p
              className={`mb-4 text-xxs font-black uppercase tracking-[0.2em] ${
                isDark ? 'text-white/50' : 'text-gray-500'
              } ${isCompact ? '' : 'sm:mb-6'}`}
            >
              {isCompact ? 'Darmowy audyt' : 'Darmowy audyt w 60 sekund'}
            </p>
            <Heading
              className={`font-black leading-[1.1] tracking-tight text-balance ${
                isDark ? 'text-white' : 'text-dark'
              } ${isCompact ? 'text-xl' : 'text-3xl sm:text-4xl'}`}
            >
              {isCompact ? (
                <>
                  Analiza Twojej <span className="text-accent-dark">strony WWW</span>
                </>
              ) : (
                <>
                  Odkryj błędy na <span className="text-accent-dark">swojej stronie WWW</span>
                </>
              )}
            </Heading>
          </div>

          <form onSubmit={handleSubmit} className="group/form relative">
            <div
              className={`flex flex-col gap-3 rounded-[1.8rem] border border-gray-100 bg-gray-50/50 p-2 transition-all group-focus-within/form:bg-white group-focus-within/form:shadow-2xl group-focus-within/form:shadow-black/5 ${
                !isCompact && 'md:flex-row'
              }`}
            >
              <div className="relative flex flex-1 items-center">
                <div className="absolute left-5 text-gray-400 transition-colors group-focus-within/form:text-secondary">
                  <Globe size={isCompact ? 18 : 22} />
                </div>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full bg-transparent py-5 pr-6 font-medium text-dark outline-none placeholder:text-gray-500 ${
                    isCompact ? 'pl-12 text-sm' : 'pl-14 text-lg'
                  }`}
                  required
                />
              </div>
              <button
                type="submit"
                className={`group/btn flex w-full items-center justify-center gap-3 rounded-2xl bg-dark font-bold text-white shadow-lg shadow-[#213261]/20 transition-all hover:bg-secondary hover:shadow-[#213261]/30 active:scale-[0.98] ${
                  isCompact ? 'py-4 text-sm' : 'px-8 py-5 text-lg md:w-auto'
                }`}
              >
                <span>{buttonText}</span>
                <ArrowRight
                  size={isCompact ? 16 : 20}
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              </button>
            </div>
          </form>

          {!isCompact && (
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              {[
                { Icon: ShieldCheck, label: 'Bezpieczna analiza' },
                { Icon: Zap, label: 'Wynik w 60 sekund' },
                { Icon: Search, label: 'Analiza 20+ czynników' },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide ${
                    isDark ? 'text-white/60' : 'text-gray-500'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-secondary">
                    <Icon size={16} />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          )}

          {isCompact && (
            <p className="mt-4 text-center text-xxs font-bold uppercase tracking-widest text-gray-500">
              Bezpłatnie • Wynik w 60s
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTeaser;
