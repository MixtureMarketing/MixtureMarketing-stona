import React, { useEffect, useRef } from 'react';
import {
  Activity,
  BarChart3,
  Database,
  EyeOff,
  Scale,
  ShieldCheck,
  Split,
  Workflow,
  LucideIcon,
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import Seo from '../common/Seo';
import { ANALYTICS_CONTENT as CONTENT } from '../../data/content';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import MarketingSpokeFooter from '../common/MarketingSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import Container from '../common/Container';
import WanderingGlow from '../visuals/WanderingGlow';
import { SITE_CONFIG } from '../../config/site';
import FaqSection from '../sections/FaqSection';
import AuditTeaser from '../features/audit/AuditTeaser';

/**
 * /marketing/analytics/ — przebudowa 2026-07-16 (krytyka 10/40 — najniższa
 * w serwisie mimo najmocniejszej merytoryki; rdzeń treści zachowany).
 * Usunięte: fejkowy dashboard hero z licznikiem „124 875 PLN NA ŻYWO"
 * (+125 PLN co 2 s — najcięższe pojedyncze naruszenie czwórki; plik
 * AnalyticsVisual skasowany), symulowany „Security Scan" z werdyktem
 * „Twoja strona jest bezpieczna", suwak Excel→dashboard z Math.random
 * (wróci, gdy właściciel dostarczy PRAWDZIWY zanonimizowany zrzut Looker),
 * martwe przyciski Store/CRM/POS, fonty 7px, „Gwarancja poprawności",
 * ceny bez pokrycia w CMS („od 1 500 zł setup · od 600 zł/mc" — brak
 * sekcji cennika analytics; hero bez ceny do czasu jej założenia).
 */
const PAIN_ICONS: LucideIcon[] = [Scale, EyeOff, Split];
const SOLUTION_ICONS: LucideIcon[] = [
  BarChart3,
  Activity,
  BarChart3,
  Workflow,
  ShieldCheck,
  Database,
];

const Analytics: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const painsRef = useSectionProgress<HTMLElement>(0.85);
  const complianceRef = useSectionProgress<HTMLElement>(0.85);
  const solutionsRef = useSectionProgress<HTMLElement>(0.85);
  const warehouseRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openConsult = () => openModal('marketing', { specificType: 'analytics' });

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'Analityka', item: '/marketing/analytics/' },
        ]}
        service={{
          name: 'Analityka webowa (GA4, Server-Side)',
          description: CONTENT.seo.description,
          serviceType: 'Web Analytics Implementation',
        }}
      />

      {/* Hero words-only; bez ceny — CMS nie ma sekcji cennika analytics
          (decyzja właściciela: cena wróci razem z sekcją w Sanity). */}
      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="wycena po bezpłatnym audycie · GA4 / GTM / Server-Side / Consent Mode v2"
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={openConsult}
          backLinkPath="/marketing/"
          backLinkLabel="Marketing"
        />
      </div>

      <div className="relative z-30 mx-auto -mt-12 max-w-4xl px-4">
        <AuditTeaser buttonText="Sprawdź swoją stronę" placeholder="Adres Twojej strony..." />
      </div>

      {/* Sygnały ostrzegawcze — wiersze z rozróżnialnymi ikonami. */}
      <section ref={painsRef} className="relative z-10 bg-white py-24">
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.painPoints.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.painPoints.description}
            </p>
          </div>
          <div className="mt-12 max-w-3xl divide-y divide-gray-100">
            {CONTENT.painPoints.items.map((item, i) => {
              const Icon = PAIN_ICONS[i] ?? Scale;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-5 py-7"
                  style={{
                    transform: `translate3d(0, calc((1 - var(--p, 1)) * ${28 + i * 16}px), 0)`,
                  }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-secondary">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-dark">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Consent Mode v2 — ciemnia techniczno-prawna (bez symulowanego
          skanera bezpieczeństwa i bez stęchłego badge'a „2024"). */}
      <section ref={complianceRef} className="relative overflow-hidden bg-deep-dark py-24 md:py-28">
        <WanderingGlow
          amplitude={12}
          background={
            'radial-gradient(40% 45% at 88% 4%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 62%),' +
            'radial-gradient(42% 48% at 6% 96%, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 66%)'
          }
        />
        <Container className="relative z-10">
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-white md:text-4xl">
              {CONTENT.compliance.title.line1}{' '}
              <span className="text-primary">{CONTENT.compliance.title.line2}</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              {CONTENT.compliance.description}
            </p>
          </div>
          <div
            className="mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 44px), 0)' }}
          >
            {CONTENT.compliance.features.map((feat) => (
              <div key={feat.title} className="flex items-start gap-3.5">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Fundament techniczny — jasny arkusz wraca sygnaturowym grzbietem;
          6 narzędzi jako zwarte wiersze w dwóch kolumnach. */}
      <section
        ref={solutionsRef}
        className="relative z-10 -mt-8 rounded-t-[2rem] bg-white pt-20 pb-24 md:-mt-12"
      >
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.solutions.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.solutions.description}
            </p>
          </div>
          <div
            className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 44px), 0)' }}
          >
            {CONTENT.solutions.items.map((item, i) => {
              const Icon = SOLUTION_ICONS[i] ?? BarChart3;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-secondary">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      {item.subtitle}
                    </p>
                    <h3 className="mt-0.5 text-lg font-extrabold tracking-tight text-dark">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Magazyn danych — dla B2B/e-commerce (bez martwych przycisków
          Store/CRM/POS i fontów 7px). */}
      <section ref={warehouseRef} className="relative bg-light-gray py-20 md:py-28">
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.warehouse.title.line1}{' '}
              <span className="text-accent-dark">{CONTENT.warehouse.title.line2}</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.warehouse.description}
            </p>
          </div>
          <div className="mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {CONTENT.warehouse.features.map((feat, i) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                style={{
                  transform: `translate3d(0, calc((1 - var(--p, 1)) * ${24 + i * 14}px), 0)`,
                }}
              >
                <h3 className="text-lg font-extrabold tracking-tight text-dark">{feat.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{feat.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <FaqSection title={CONTENT.faq.title} items={CONTENT.faq.items} bgClassName="bg-white" />

      <MarketingSpokeFooter
        currentType="analytics"
        founderBio={
          <>
            Wdrażam analitykę od strony technicznej i biznesowej — GA4, GTM, pomiar serwerowy i
            Consent Mode v2. Projekt prowadzę osobiście: po wdrożeniu siadamy nad Twoim dashboardem
            i uczę Cię go czytać, żeby liczby naprawdę wspierały decyzje.
          </>
        }
      />

      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.text}
          buttonText={CONTENT.cta.button}
          icon={Activity}
          onClick={openConsult}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatny audyt danych"
        sublabel="GA4 · Server-Side · Consent Mode v2"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Zapytaj"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default Analytics;
