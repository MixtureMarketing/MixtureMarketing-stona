import React, { useEffect, useRef, useState } from 'react';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import PricingTable from '../common/PricingTable';
import SectionHeader from '../common/SectionHeader';
import AuditTeaser from '../features/audit/AuditTeaser';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import MarketingSpokeFooter from '../common/MarketingSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import Container from '../common/Container';
import WanderingGlow from '../visuals/WanderingGlow';
import { SITE_CONFIG } from '../../config/site';
import {
  CheckCircle2,
  Crosshair,
  FileText,
  Gauge,
  Link2,
  MapPin,
  Wrench,
  LucideIcon,
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { PricingSectionData, PricingTier } from '../../types';
import { cmsService } from '../../services/cmsService';
import { SEO_CONTENT as CONTENT } from '../../data/content';
import SeoRoiCalculator from '../features/seo/SeoRoiCalculator';
import StandardFaq from '../common/StandardFaq';
import RelatedArticles from '../articles/RelatedArticles';
import PlotterTimeline from '../common/PlotterTimeline';

/**
 * /marketing/seo/ — przebudowa 2026-07-16 (krytyka 14/40, pełna ścieżka
 * podstron marketingu). Usunięte: animowana obietnica pozycji w hero
 * (SERP #6→#1 co 2 s — SeoVisual skasowany; tykał nawet przy
 * reduced-motion), teatr „LIVE OPTIMIZATION" z gauge złapanym na zerze,
 * „Zdominuj wyniki", „TOP 3" ×3, wpływ „-7%/+50%" z ręki, mono-kostium.
 * Cena hero 1 500 → 1 200 (pakiet SEO lokalne z CMS — hero przeczyło
 * własnej tabeli). Dowód szybkości = REALNY pomiar CrUX wdrożenia klienta
 * z datą (ciemnia z dowodem). FAQ „nie gwarantujemy 1. miejsca" awansuje
 * z ukrycia do atutu strony.
 */
const PILLAR_ICONS: LucideIcon[] = [Wrench, FileText, Link2];

const MarketingSeo: React.FC = () => {
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useSectionProgress<HTMLElement>(0.85);
  const localRef = useSectionProgress<HTMLElement>(0.85);
  const speedRef = useSectionProgress<HTMLElement>(0.85);
  const roadRef = useSectionProgress<HTMLElement>(0.8);
  const roiRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('seo').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () => openModal('marketing', { specificType: 'seo', package: tier.title }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  const openConsult = () => openModal('marketing', { specificType: 'seo' });

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        type="Service"
        service={{
          name: 'Pozycjonowanie Stron WWW (SEO)',
          description: CONTENT.seo.description,
          serviceType: 'SEO Optimization',
          areaServed: 'Poland',
        }}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing' },
          { name: 'Pozycjonowanie (SEO)', item: '/marketing/seo' },
        ]}
      />

      {/* Hero words-only, ciemny rejestr; kotwica = najniższy pakiet CMS. */}
      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 1 200 zł / mc · SEO lokalne i ogólnopolskie · pierwsze mierzalne ruchy w 3–6 mc"
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={openConsult}
          backLinkPath="/marketing/"
          backLinkLabel="Marketing"
        />
      </div>

      <div className="relative z-30 mx-auto -mt-12 max-w-4xl px-4">
        <AuditTeaser
          buttonText="Sprawdź widoczność w Google"
          placeholder="Adres Twojej strony (np. mojanazwa.pl)..."
        />
      </div>

      {/* Trzy filary — asymetryczna siatka: nagłówek z lewej (sticky),
          wiersze z prawej. Cała szerokość pracuje (zgłoszenie właściciela:
          „prawa strona pusta wszędzie"). */}
      <section ref={pillarsRef} className="relative z-10 bg-white py-24">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div
              className="lg:col-span-5 lg:self-start lg:sticky lg:top-28"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
                {CONTENT.pillars.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-700">
                {CONTENT.pillars.description}
              </p>
            </div>
            <div className="mt-12 divide-y divide-gray-100 lg:col-span-7 lg:mt-0">
              {CONTENT.pillars.items.map((item, i) => {
                const Icon = PILLAR_ICONS[i] ?? Wrench;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-5 py-7 first:pt-0"
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
                      <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Szybkość — CIEMNIA Z DOWODEM: realny pomiar CrUX z datą (zamiast
          teatru „LIVE OPTIMIZATION" z fejkowym gauge). */}
      <section ref={speedRef} className="relative overflow-hidden bg-deep-dark py-24 md:py-28">
        <WanderingGlow
          amplitude={12}
          background={
            'radial-gradient(40% 45% at 88% 4%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 62%),' +
            'radial-gradient(42% 48% at 6% 96%, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 66%)'
          }
        />
        <Container className="relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div
              className="lg:col-span-5"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-balance text-white md:text-4xl">
                {CONTENT.technicalSeo.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/75">
                {CONTENT.technicalSeo.description}
              </p>
            </div>

            <div className="mt-10 lg:col-span-7 lg:mt-0">
              <div
                className="rounded-2xl border border-success/25 bg-success/[0.07] p-5"
                style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 40px), 0)' }}
              >
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <Gauge size={16} className="shrink-0 text-success" aria-hidden="true" />
                  {CONTENT.technicalSeo.proof.label}
                </p>
                <p className="mt-1.5 pl-6 text-xs leading-relaxed text-white/55">
                  {CONTENT.technicalSeo.proof.detail}{' '}
                  <a
                    href={CONTENT.technicalSeo.proof.linkTo}
                    className="font-bold text-primary underline-offset-4 hover:underline"
                  >
                    {CONTENT.technicalSeo.proof.linkLabel}
                  </a>
                </p>
              </div>

              <ul
                className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2"
                style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 56px), 0)' }}
              >
                {CONTENT.technicalSeo.stack.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-white/75">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Lokalne SEO — jasny arkusz wraca na ciemnię sygnaturowym grzbietem. */}
      <section
        ref={localRef}
        className="relative z-10 -mt-8 rounded-t-[2rem] bg-white pt-20 pb-24 md:-mt-12"
      >
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div
              className="lg:col-span-5"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
                {CONTENT.localSeo.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-700">
                {CONTENT.localSeo.description}
              </p>
            </div>
            <ul className="mt-10 space-y-5 lg:col-span-7 lg:mt-2">
              {CONTENT.localSeo.items.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-3.5 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-[15px] leading-relaxed text-gray-700 shadow-sm"
                  style={{
                    transform: `translate3d(0, calc((1 - var(--p, 1)) * ${20 + i * 12}px), 0)`,
                  }}
                >
                  <MapPin size={18} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Roadmapa — linia plotera rysowana scrollem przez 4 etapy. */}
      <section ref={roadRef} className="relative bg-light-gray py-20 md:py-28">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div
              className="lg:col-span-5 lg:self-start lg:sticky lg:top-28"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
                {CONTENT.roadmap.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-700">
                {CONTENT.roadmap.description}
              </p>
            </div>
            <PlotterTimeline
              className="mt-12 lg:col-span-7 lg:mt-0"
              items={CONTENT.roadmap.steps.map((s) => ({
                kicker: s.month,
                title: s.title,
                desc: s.desc,
              }))}
            />
          </div>
        </Container>
      </section>

      {/* Wartość ruchu — arytmetyka założeń (CTR suwakiem, zastrzeżenie w UI). */}
      <section ref={roiRef} className="relative bg-white py-24">
        <Container>
          <div style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}>
            <SectionHeader
              title={CONTENT.roi.title}
              description={CONTENT.roi.description}
              className="mb-12"
            />
          </div>
          <div style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}>
            <SeoRoiCalculator />
          </div>
        </Container>
      </section>

      {pricingData && (
        <LazyHydrate minHeight="800px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      <LazyHydrate minHeight="600px">
        <section className="bg-light-gray py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Pytania o pozycjonowanie" className="mb-12" />
            <StandardFaq items={CONTENT.faqs} />
          </div>
        </section>
      </LazyHydrate>

      <LazyHydrate minHeight="600px">
        <RelatedArticles currentSlug="seo" category="Marketing" />
      </LazyHydrate>

      <MarketingSpokeFooter
        currentType="seo"
        founderBio={
          <>
            Od 2020 pozycjonujemy strony firm z Podkarpacia — głównie e-commerce i usługi B2B.
            Projekt prowadzę osobiście: dane z Google Search Console i CrUX czytamy razem na
            comiesięcznym spotkaniu, a rekomendacje dostajesz po polsku, nie w 50-stronicowym
            PDF-ie.
          </>
        }
      />

      <LazyHydrate minHeight="400px">
        <div ref={finalCtaRef}>
          <BaseCta
            title={CONTENT.cta.title}
            description={CONTENT.cta.description}
            buttonText={CONTENT.cta.button}
            icon={Crosshair}
            onClick={openConsult}
            variant="dark"
          />
        </div>
      </LazyHydrate>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatny audyt SEO"
        sublabel="Bez gwarancji pozycji — z pomiarem"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Audyt"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default MarketingSeo;
