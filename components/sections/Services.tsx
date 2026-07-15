import React from 'react';
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../common/SectionHeader';
import AmbientBackground from '../common/AmbientBackground';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { SERVICES_CONTENT as CONTENT } from '../../data/content';
import { SERVICES_SECTION_DATA } from '../../data/content/services';

/**
 * Sekcja „Kompetencje, których potrzebujesz".
 *
 * Redesign: usunięto atrapy (fejkowy kod/wykres/bloki UI z ServiceVisuals) oraz
 * watermark „SERVICES". 3 realne kompetencje (Web/Marketing/Design) w siatce,
 * każda z własnym akcentem koloru marki; „Strona w abonamencie" (SaaS) wydzielona
 * jako osobny, wyróżniony pas — bo to produkt, nie równorzędny obszar.
 *
 * Immersyjny scroll (--p z useSectionProgress): to arkusz, który najeżdża na
 * hero — treść „dogania" go z opóźnieniem rosnącym z głębią (nagłówek szybko,
 * karty kolejno, pasy SaaS/lokalny najpóźniej). Scroll-linked = działa w obie
 * strony; spoczynek to var(--p, 1) — prerender/reduced-motion widzi statykę.
 */

// Dryf zależny od głębi: 0 przy p=1 (spoczynek), px przy p=0.
const drift = (px: number): React.CSSProperties => ({
  transform: `translate3d(0, calc((1 - var(--p, 1)) * ${px}px), 0)`,
});

// Akcent per domena — z palety marki (bez nowych kolorów). Statyczne klasy,
// żeby Tailwind je zachował (nie budujemy nazw klas dynamicznie ze stringów).
const ACCENT: Record<string, { icon: string; iconHover: string; check: string; border: string }> = {
  web: {
    icon: 'bg-primary/10 text-primary',
    iconHover: 'group-hover:bg-primary',
    check: 'text-primary',
    border: 'hover:border-primary',
  },
  marketing: {
    icon: 'bg-secondary/10 text-secondary',
    iconHover: 'group-hover:bg-secondary',
    check: 'text-secondary',
    border: 'hover:border-secondary',
  },
  design: {
    icon: 'bg-brand-pink/10 text-brand-pink',
    iconHover: 'group-hover:bg-brand-pink',
    check: 'text-brand-pink',
    border: 'hover:border-brand-pink',
  },
};

const Services: React.FC = () => {
  const core = SERVICES_SECTION_DATA.filter((s) => s.key !== 'saas');
  const saas = SERVICES_SECTION_DATA.find((s) => s.key === 'saas');
  const sectionRef = useSectionProgress<HTMLElement>(0.9);

  return (
    <section
      id="services"
      ref={sectionRef}
      data-mixture-front
      className="relative z-10 -mt-10 overflow-hidden rounded-t-[2rem] bg-gray-50 pt-20 pb-24 md:-mt-16 md:rounded-t-[3rem] md:pt-28 md:pb-28"
    >
      <AmbientBackground />

      <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl md:mb-16" style={drift(24)}>
          <SectionHeader align="left" title={CONTENT.title} description={CONTENT.description} />
        </div>

        {/* 3 realne kompetencje */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-7">
          {core.map((service, index) => {
            const Icon = service.icon;
            const accent = ACCENT[service.key] ?? ACCENT.web;
            return (
              <div key={service.key} className="h-full" style={drift(56 + index * 30)}>
                <Link
                  to={service.path}
                  className={`group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1 ${accent.border}`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 group-hover:text-white ${accent.icon} ${accent.iconHover}`}
                    >
                      <Icon size={26} />
                    </div>
                    <span className="text-xxs font-black uppercase tracking-[0.18em] text-gray-400">
                      {service.subtitle}
                    </span>
                  </div>

                  <h3 className="mb-3 text-2xl font-bold tracking-tight text-dark">
                    {service.title}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-gray-600">{service.desc}</p>

                  <ul className="mb-8 space-y-3">
                    {service.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-gray-700"
                      >
                        <CheckCircle2 size={16} className={`shrink-0 ${accent.check}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* Stretched link (WCAG 4.1.2): karta jest jedynym focusable elementem */}
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-dark after:absolute after:inset-0 after:rounded-2xl group-hover:gap-3">
                    <span>{service.button}</span>
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* SaaS — osobny, wyróżniony pas (produkt, nie obszar) */}
        {saas && (
          <div style={drift(120)}>
            <Link
              to={saas.path}
              className="group relative mt-6 flex flex-col gap-8 overflow-hidden rounded-3xl bg-dark p-8 text-white transition-shadow duration-300 hover:shadow-2xl hover:shadow-secondary/30 md:mt-7 md:flex-row md:items-center md:justify-between md:p-10"
            >
              {/* Tania poświata (bez blur-filtra) */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    'radial-gradient(45% 90% at 100% 0%, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 60%),' +
                    'radial-gradient(40% 90% at 0% 100%, color-mix(in srgb, var(--color-secondary) 30%, transparent), transparent 65%)',
                }}
              />
              <div className="relative z-10 max-w-2xl">
                <span className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xxs font-black uppercase tracking-[0.18em] text-primary">
                  {saas.subtitle}
                </span>
                <h3 className="text-2xl font-black tracking-tight md:text-3xl">{saas.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                  {saas.desc}
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {saas.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm font-medium text-white/80"
                    >
                      <CheckCircle2 size={16} className="shrink-0 text-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <span className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-dark transition-transform motion-safe:group-hover:scale-[1.03]">
                {saas.button}
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </div>
        )}

        {/* Lokalny CTA-band — sygnał lokalny + crawl depth do spoke'ow Rzeszow */}
        <div style={drift(140)}>
          <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:mt-10 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3 md:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-secondary">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    Lokalnie · Rzeszów
                  </p>
                  <p className="text-sm text-gray-700 md:text-base">
                    Szukasz konkretnej usługi dla firmy z Rzeszowa lub Podkarpacia?
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/web-development/rzeszow/"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold transition-colors hover:bg-blue-50 hover:text-secondary"
                >
                  Strony WWW Rzeszów <ArrowRight size={12} />
                </Link>
                <Link
                  to="/pozycjonowanie-rzeszow/"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold transition-colors hover:bg-blue-50 hover:text-secondary"
                >
                  Pozycjonowanie Rzeszów <ArrowRight size={12} />
                </Link>
                <Link
                  to="/agencja-seo-rzeszow/"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold transition-colors hover:bg-blue-50 hover:text-secondary"
                >
                  Agencja SEO Rzeszów <ArrowRight size={12} />
                </Link>
                <Link
                  to="/agencja-interaktywna-rzeszow/"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold transition-colors hover:bg-blue-50 hover:text-secondary"
                >
                  Agencja interaktywna <ArrowRight size={12} />
                </Link>
                <Link
                  to="/miasto/rzeszow/"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary/90"
                >
                  Hub lokalny <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
