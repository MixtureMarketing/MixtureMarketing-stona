import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  BadgeCheck,
  CheckCircle2,
  Filter,
  Phone,
  ScanSearch,
  SlidersHorizontal,
  Target,
  TrendingUp,
} from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Seo from '../common/Seo';
import HeroTrustLine from '../common/HeroTrustLine';
import MarketingSpokeFooter from '../common/MarketingSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import { useModal } from '../../context/ModalContext';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { SITE_CONFIG } from '../../config/site';
import { GOOGLE_ADS_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSection, PricingTier } from '../../types';
import AuditTeaser from '../features/audit/AuditTeaser';
import BaseCta from '../common/BaseCta';
import FaqSection from '../sections/FaqSection';
import GoogleAdsCalculator from '../features/marketing/GoogleAdsCalculator';
import StandardHero from '../common/StandardHero';
import Container from '../common/Container';

/**
 * /marketing/google-ads/ — przebudowa 2026-07-16 (krytyka 13/40, pełna
 * ścieżka podstron marketingu). Usunięte: H1-obietnica „1. miejsce
 * w Google" (własne FAQ SEO jej przeczyło), zmyślony „ROAS 4.2× / CPA −47%"
 * (hero, bio, sticky bar), atrapa SERP w hero (plik GoogleAdsVisual
 * skasowany), mono-teatr „Algorytmu" (statusy Connected/Processing),
 * „Symulator Zysków" (teraz: arytmetyka założeń z zastrzeżeniem),
 * paleta logo Google jako akcenty. Cena hero = pakiet Start z CMS
 * (1 500 zł/mc). Google Partner zostaje — potwierdzony przez właściciela.
 */
const sanitize = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });

/** Ikony kroków procesu — rozróżnialne, bez terminala i fejk-statusów. */
const PROCESS_ICONS = [ScanSearch, Filter, SlidersHorizontal, TrendingUp];

const GoogleAds: React.FC = () => {
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSection | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const painsRef = useSectionProgress<HTMLElement>(0.85);
  const industriesRef = useSectionProgress<HTMLElement>(0.85);
  const processRef = useSectionProgress<HTMLElement>(0.8);
  const calcRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('google-ads').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () => openModal('marketing', { specificType: 'ads', package: tier.title }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  const openConsult = () => openModal('marketing', { specificType: 'ads' });

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image || '/assets/images/google-ads.png'}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'Google Ads', item: '/marketing/google-ads/' },
        ]}
        service={{
          name: 'Google Ads / Performance Marketing',
          description:
            'Kampanie Google Ads: Search, Performance Max, Shopping. Optymalizacja kosztu pozyskania, zarządzanie budżetem, integracja z GA4. Konto reklamowe zostaje własnością klienta.',
          serviceType: 'Google Ads / PPC Management',
        }}
      />

      {/* Hero words-only w ciemnym rejestrze — atrapa SERP usunięta z plikiem.
          Kotwica = pakiet Start z CMS (koniec rozjazdu 1 200 vs 1 500). */}
      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 1 500 zł / mc + budżet mediowy · Search / Shopping / PMax · dashboard 24/7"
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={openConsult}
          ctaSecondaryNode={
            <a
              href={`tel:${SITE_CONFIG.contact.phoneFull}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-white/20 px-6 py-3 font-bold text-white transition-colors hover:border-white/50 hover:bg-white/10"
            >
              <Phone size={18} aria-hidden="true" />
              Zadzwoń: {SITE_CONFIG.contact.phone}
            </a>
          }
          backLinkPath="/marketing/"
          backLinkLabel="Marketing"
        />
      </div>

      {/* Darmowy audyt — realne narzędzie serwisu (audyt-360), bez szkła. */}
      <div className="relative z-30 mx-auto -mt-12 max-w-4xl px-4">
        <AuditTeaser buttonText="Audyt konta Ads" placeholder="Adres Twojej strony..." />
      </div>

      {/* Diagnoza — ekspertyza bez liczb: wiersze z rozróżnialnymi ikonami. */}
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
            {CONTENT.painPoints.items.map((item, i) => (
              <div
                key={item.title}
                className="flex items-start gap-5 py-7"
                style={{
                  transform: `translate3d(0, calc((1 - var(--p, 1)) * ${28 + i * 16}px), 0)`,
                }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-secondary">
                  <Target size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-dark">{item.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Branże — lustro dwóch strategii (usługi | e-commerce), wjazd
          przeciwbieżny na --p; bez wielkich ikon-watermarków. */}
      <section ref={industriesRef} className="relative bg-light-gray py-20 md:py-28">
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.industries.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.industries.description}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-gray-200">
            {[CONTENT.industries.services, CONTENT.industries.ecommerce].map((col, ci) => (
              <div
                key={col.title}
                className={ci === 0 ? 'lg:pr-12' : 'lg:pl-12'}
                style={{
                  transform: `translate3d(calc((1 - var(--p, 1)) * ${ci === 0 ? -14 : 14}px), 0, 0)`,
                }}
              >
                <p className="text-sm font-semibold text-gray-500">{col.subtitle}</p>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight text-dark">
                  {col.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-700">{col.desc}</p>
                <ul className="mt-6 space-y-4">
                  {col.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-secondary" />
                      <span
                        className="text-sm leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{ __html: sanitize(feat) }}
                      />
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-8" onClick={openConsult}>
                  {col.cta}
                </Button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Matematyka kampanii — arytmetyka założeń użytkownika (z jawnym
          zastrzeżeniem), nie „symulator zysków". */}
      <section ref={calcRef} className="relative z-20 bg-white py-24">
        <Container>
          <div style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}>
            <SectionHeader
              title={CONTENT.calculator.title}
              description={CONTENT.calculator.description}
              className="mb-12"
            />
          </div>
          <div style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}>
            <GoogleAdsCalculator />
          </div>
        </Container>
      </section>

      {/* Proces — linia plotera rysowana scrollem (język „żywej całości"),
          zamiast ciemnego mono-teatru z fejk-statusami. */}
      <section ref={processRef} className="relative bg-light-gray py-20 md:py-28">
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.process.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.process.description}
            </p>
          </div>

          <div className="relative mt-12 max-w-3xl">
            <svg
              className="absolute top-2 bottom-2 left-[21px] w-[2px]"
              aria-hidden="true"
              preserveAspectRatio="none"
              viewBox="0 0 2 100"
            >
              <path
                d="M1 0 L1 100"
                pathLength={1}
                stroke="var(--color-secondary)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="1"
                style={{ strokeDashoffset: 'calc(1 - var(--p, 1))' }}
              />
            </svg>
            <ol className="space-y-10">
              {CONTENT.process.steps.map((step, i) => {
                const Icon = PROCESS_ICONS[i] ?? ScanSearch;
                const start = i / CONTENT.process.steps.length;
                return (
                  <li
                    key={step.title}
                    className="relative flex items-start gap-6"
                    style={{ opacity: `calc((var(--p, 1) - ${start.toFixed(2)}) / 0.2)` }}
                  >
                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary">
                      <Icon size={19} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold tracking-tight text-dark">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Google Partner — potwierdzony status, weryfikowalny publicznie. */}
          <p className="mt-12 flex max-w-3xl items-start gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-gray-700">
            <BadgeCheck size={18} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
            <span>
              <strong className="text-dark">{CONTENT.partner.label}.</strong> {CONTENT.partner.desc}
            </span>
          </p>
        </Container>
      </section>

      {pricingData && (
        <PricingTable
          title={pricingData.title}
          description={pricingData.description}
          tiers={pricingData.tiers}
        />
      )}

      <FaqSection title="Pytania o Google Ads" items={CONTENT.faqs} />

      <MarketingSpokeFooter
        currentType="google-ads"
        founderBio={
          <>
            Od 2020 prowadzimy kampanie Google Ads dla firm z Podkarpacia — Search, Performance Max,
            Shopping. Projekt prowadzę osobiście: od audytu konta po comiesięczne omówienie wyników,
            a Ty patrzysz na te same liczby co my w dashboardzie.
          </>
        }
      />

      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.ctaAudit.title}
          description={CONTENT.ctaAudit.description}
          buttonText={CONTENT.ctaAudit.button}
          icon={Target}
          onClick={openConsult}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Google Ads"
        sublabel="Dashboard 24/7 · konto zostaje Twoje"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default GoogleAds;
