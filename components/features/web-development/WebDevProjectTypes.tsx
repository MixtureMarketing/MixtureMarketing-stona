import React, { useMemo } from 'react';
import { Rocket, Building2, ShoppingCart, Database, ArrowRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../../common/Container';
import SectionHeader from '../../common/SectionHeader';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { WEB_DEV_CONTENT } from '../../../data/content';

/**
 * Siatka typów projektów.
 *
 * Etap 2 (2026-07-15) — pięć poprawek stylu, wszystkie z listy zakazów:
 * - `GlassCard` → płaska karta w języku home. Glass był dekoracyjnym backdrop-blur
 *   (The No-Glass Rule); komponentu nie ruszam, bo ma 18 konsumentów (m.in. portal),
 *   po prostu przestaję go tu używać.
 * - `border-t-4` → pełne, cienkie obramowanie. Gruby kolorowy pasek na krawędzi karty
 *   to ta sama rodzina co side-stripe z listy absolutnych zakazów, a do tego kłócił
 *   się z zaokrągleniem rogu (detektor: `border-accent-on-rounded`).
 * - `text-[#0284C7]` (sky-600, spoza palety, 4.05:1 na bieli) → tekst pomocniczy
 *   w palecie. The Trzy Prądy Rule + WCAG AA.
 * - uppercase+tracking na podtytule każdej karty → zwykły tekst. Cztery mikro-etykiety
 *   w jednym widoku to gramatyka eyebrow (The Jeden Eyebrow Rule).
 * - „Main KPI" z buzzwordem → pole usunięte w treści.
 *
 * Ruch (The Motion Has A Job Rule): karty wjeżdżają RÓWNO, bez staggeru. To są
 * równorzędne opcje wyboru — kaskada sugerowałaby ranking, którego nie ma. Brak
 * staggeru jest tu decyzją, nie zaniechaniem. Pas „Dedykowane systemy" dojeżdża
 * później i z większej głębi, bo NIE jest równorzędny — to inna kategoria.
 * Spoczynek = var(--p, 1).
 */

const ICONS: Record<string, LucideIcon> = {
  '/web-development/landing-page/': Rocket,
  '/web-development/corporate/': Building2,
  '/web-development/ecommerce/': ShoppingCart,
  '/web-development/custom-app/': Database,
};

const WebDevProjectTypes: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.9);

  const { cards, band } = useMemo(() => {
    const all = WEB_DEV_CONTENT.projectTypes.map((t) => ({ ...t, Icon: ICONS[t.path] ?? Rocket }));
    return {
      cards: all.filter((t) => !('band' in t && t.band)),
      band: all.find((t) => 'band' in t && t.band),
    };
  }, []);

  return (
    <section
      id="offer-grid"
      ref={sectionRef}
      className="relative overflow-hidden bg-light-gray pt-10 pb-20 md:pt-12 md:pb-28"
    >
      <Container className="relative z-10">
        <div
          className="mb-14 max-w-3xl md:mb-16"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <SectionHeader
            align="left"
            title={WEB_DEV_CONTENT.offerGrid.title}
            description={WEB_DEV_CONTENT.offerGrid.description}
          />
        </div>

        <div
          className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          {cards.map(({ Icon, ...type }) => (
            <Link
              key={type.path}
              to={type.path}
              className={`group relative flex h-full flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:border-primary hover:shadow-xl motion-safe:hover:-translate-y-1 ${
                type.highlight ? 'border-secondary/40' : 'border-gray-100'
              }`}
            >
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-colors duration-300 group-hover:bg-secondary group-hover:text-white">
                <Icon size={24} aria-hidden="true" />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-dark">{type.title}</h3>
              <p className="mt-1 text-sm text-accent-dark">{type.subtitle}</p>

              <p className="mt-4 flex-grow text-sm leading-relaxed text-gray-700">{type.desc}</p>

              <ul className="mt-6 flex flex-wrap gap-1.5">
                {type.techs.map((t) => (
                  <li
                    key={t}
                    className="rounded border border-gray-100 bg-gray-50 px-2 py-1 text-xxs font-bold text-gray-600"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              {/* Stretched link (WCAG 4.1.2): karta ma dokładnie jeden focusable element */}
              <span className="mt-8 inline-flex items-center gap-2 border-t border-gray-100 pt-6 text-sm font-bold text-dark after:absolute after:inset-0 after:rounded-2xl group-hover:gap-3">
                Zobacz szczegóły
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>

        {/* Pas wychodzący z siatki — inna kategoria, więc inna forma. Dojeżdża
            później i z większej głębi niż karty (120px vs 48px): najpierw wybierasz
            spośród równorzędnych stron, dopiero potem dowiadujesz się, że jest jeszcze
            coś innego. Ciemny band w języku pasa SaaS ze strony głównej. */}
        {band && (
          <div style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 120px), 0)' }}>
            <Link
              to={band.path}
              className="group relative mt-6 flex flex-col gap-8 overflow-hidden rounded-3xl bg-dark p-8 text-white transition-shadow duration-300 hover:shadow-2xl hover:shadow-secondary/30 md:mt-7 md:flex-row md:items-center md:justify-between md:p-10"
            >
              <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    'radial-gradient(45% 90% at 100% 0%, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 60%),' +
                    'radial-gradient(40% 90% at 0% 100%, color-mix(in srgb, var(--color-secondary) 30%, transparent), transparent 65%)',
                }}
                aria-hidden="true"
              />
              <div className="relative z-10 max-w-2xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-primary">
                  <band.Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight md:text-3xl">{band.title}</h3>
                <p className="mt-1 text-sm text-primary">{band.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                  {'bandNote' in band && band.bandNote ? band.bandNote : band.desc}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {band.techs.map((t) => (
                    <li
                      key={t}
                      className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xxs font-bold text-white/70"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <span className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-dark transition-transform motion-safe:group-hover:scale-[1.03]">
                Zobacz szczegóły
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
};

export default WebDevProjectTypes;
