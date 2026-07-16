import React, { useEffect, useRef, useState } from 'react';
import { Megaphone, MessageSquare, Phone, ServerCog, ShoppingBag } from 'lucide-react';
import Seo from '../common/Seo';
import HeroTrustLine from '../common/HeroTrustLine';
import { useModal } from '../../context/ModalContext';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { SITE_CONFIG } from '../../config/site';
import { META_ADS_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import BaseCta from '../common/BaseCta';
import FaqSection from '../sections/FaqSection';
import StandardHero from '../common/StandardHero';
import MarketingSpokeFooter from '../common/MarketingSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import AuditTeaser from '../features/audit/AuditTeaser';
import Container from '../common/Container';
import WanderingGlow from '../visuals/WanderingGlow';

/**
 * /marketing/meta-ads/ — przebudowa 2026-07-16 (krytyka 11/40, pełna
 * ścieżka podstron marketingu). Usunięte: surowy HTML w hero (widoczne
 * tagi <strong>), fejkowy panel „META_ADS_MANAGER_V2.0" (ROAS 8.4x
 * z powietrza), „Flow Efficiency 98.2%" + Priority CRITICAL + scanline,
 * atrapa feedu IG w hero (MetaAdsVisual skasowany), autoplay lejka co 3 s
 * ignorujący reduced-motion, tekstura z transparenttextures.com (zewnętrzny
 * request), karty TikTok/LinkedIn (usług NIE świadczymy — decyzja
 * właściciela), badge „Meta Business Partner" (NIE mamy), „20-30% więcej
 * konwersji" (mechanika bez procentów). Cena hero 1 200 → 1 500 (CMS).
 * Lejek = linia plotera na --p; przełącznik E-commerce/B2B zostaje jako
 * uczciwa interakcja (bez fejkowych metryk).
 */
const MetaAds: React.FC = () => {
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);
  const [model, setModel] = useState<'ecommerce' | 'b2b'>('ecommerce');
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const funnelRef = useSectionProgress<HTMLElement>(0.8);
  const capiRef = useSectionProgress<HTMLElement>(0.85);
  const selectorRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('meta-ads').then((data) => {
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
  const activeModel = CONTENT.strategySelector[model];

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'Meta Ads', item: '/marketing/meta-ads/' },
        ]}
        service={{
          name: 'Meta Ads (Facebook i Instagram)',
          description:
            'Kampanie sprzedażowe i leadowe na Facebooku i Instagramie: lejek TOF/MOF/BOF, remarketing dynamiczny, Conversions API.',
          serviceType: 'Social Media Advertising',
        }}
      />

      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 1 500 zł / mc + budżet mediowy · kampanie sprzedażowe i leadowe · dashboard 24/7"
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

      <div className="relative z-30 mx-auto -mt-12 max-w-4xl px-4">
        <AuditTeaser buttonText="Sprawdź swoją stronę" placeholder="Adres Twojej strony..." />
      </div>

      {/* Lejek — linia plotera rysowana scrollem przez 4 etapy (edukacja
          zamiast „command center" z symulowaną telemetrią). */}
      <section ref={funnelRef} className="relative z-10 bg-white py-24">
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.funnel.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.funnel.description}
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
              {CONTENT.funnel.stages.map((stage, i) => {
                const start = i / CONTENT.funnel.stages.length;
                return (
                  <li
                    key={stage.step}
                    className="relative flex items-start gap-6"
                    style={{ opacity: `calc((var(--p, 1) - ${start.toFixed(2)}) / 0.2)` }}
                  >
                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-white text-xs font-black tabular-nums text-secondary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        {stage.label}
                      </p>
                      <h3 className="mt-1 text-lg font-extrabold tracking-tight text-dark">
                        {stage.step}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">
                        {stage.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Container>
      </section>

      {/* CAPI — ciemnia techniczna: mechanika bez procentów, bez snippetu
          z wymyślonymi danymi. */}
      <section ref={capiRef} className="relative overflow-hidden bg-deep-dark py-24 md:py-28">
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
              {CONTENT.capi.title.line1}{' '}
              <span className="text-primary">{CONTENT.capi.title.line2}</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">{CONTENT.capi.description}</p>
          </div>
          <div
            className="mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 44px), 0)' }}
          >
            {CONTENT.capi.features.map((feat) => (
              <div key={feat.title} className="flex items-start gap-3.5">
                <ServerCog size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Strategia — uczciwy przełącznik dwóch modeli setupu (sygnaturowy
          jasny arkusz wraca na ciemnię). */}
      <section
        ref={selectorRef}
        className="relative z-10 -mt-8 rounded-t-[2rem] bg-white pt-20 pb-24 md:-mt-12"
      >
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.strategySelector.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.strategySelector.description}
            </p>
          </div>

          <div
            className="mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 36px), 0)' }}
          >
            {(['ecommerce', 'b2b'] as const).map((key) => {
              const opt = CONTENT.strategySelector[key];
              const active = model === key;
              const Icon = key === 'ecommerce' ? ShoppingBag : MessageSquare;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModel(key)}
                  aria-pressed={active}
                  className={`flex flex-1 items-center gap-4 rounded-2xl border-2 p-5 text-left transition-colors ${
                    active
                      ? 'border-secondary bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      active ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-extrabold tracking-tight text-dark">{opt.label}</p>
                    <p className="text-sm text-gray-600">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {activeModel.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-extrabold tracking-tight text-dark">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {pricingData && (
        <PricingTable
          title={pricingData.title}
          description={pricingData.description}
          tiers={pricingData.tiers}
        />
      )}

      <FaqSection title="Pytania o Meta Ads" items={CONTENT.faqs} bgClassName="bg-light-gray" />

      <MarketingSpokeFooter
        currentType="meta-ads"
        founderBio={
          <>
            Od 2020 prowadzimy kampanie na Facebooku i Instagramie dla firm z Podkarpacia — sklepów
            i usług. Projekt prowadzę osobiście: od lejka i pomiaru (Pixel + CAPI) po comiesięczne
            omówienie wyników nad wspólnym dashboardem.
          </>
        }
      />

      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Megaphone}
          onClick={openConsult}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Meta Ads"
        sublabel="Dashboard 24/7 · konto zostaje Twoje"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Zapytaj"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default MetaAds;
