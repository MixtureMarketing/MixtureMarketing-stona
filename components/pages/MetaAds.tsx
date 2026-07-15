import React, { useEffect, useRef, useState } from 'react';
import { Megaphone, Play, Phone } from 'lucide-react';
import Seo from '../common/Seo';
import HeroTrustLine from '../common/HeroTrustLine';
import { useModal } from '../../context/ModalContext';
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
import { MetaAdsHeroVisual } from '../visuals/hero/MetaAdsVisual';

// Refactored Sub-components
import MetaAdsFunnel from '../features/marketing/MetaAdsFunnel';
import MetaAdsCapi from '../features/marketing/MetaAdsCapi';
import MetaAdsEcosystem from '../features/marketing/MetaAdsEcosystem';
import MetaAdsStrategy from '../features/marketing/MetaAdsStrategy';

const MetaAds: React.FC = () => {
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('meta-ads').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('marketing', {
              specificType: 'ads',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-instagram/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image || '/assets/images/meta-ads.png'}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'Meta Ads', item: '/marketing/meta-ads/' },
        ]}
        service={{
          name: 'Meta Ads — Facebook & Instagram',
          description:
            'Kampanie Facebook Ads i Instagram Ads. Targetowanie behawioralne, kreacje video, retargeting, lookalike audiences. Pixel + Conversions API + integracja z CRM.',
          serviceType: 'Meta Ads / Social Media Advertising',
        }}
      />

      {/* --- HERO SECTION --- */}
      <div ref={heroRef}>
        <StandardHero
          badge={CONTENT.hero.badge}
          badgeIcon={Megaphone}
          title={{
            line1: CONTENT.hero.title.line1,
            line2: CONTENT.hero.title.line2,
            accent: CONTENT.hero.title.accent,
          }}
          description={CONTENT.hero.description}
          priceHint="od 1 200 zł / mc + budżet · Pixel + CAPI · kreacje video w cenie"
          trustLine={<HeroTrustLine promise="Sam testuję kreacje i targetowanie" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('marketing', { specificType: 'ads' })}
          ctaSecondaryNode={
            <a
              href={`tel:${SITE_CONFIG.contact.phoneFull}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-dark hover:border-instagram hover:bg-pink-50 hover:text-instagram font-bold rounded-full transition-colors motion-safe:focus-visible:-translate-y-0.5"
            >
              <Phone size={18} aria-hidden="true" />
              Zadzwoń: {SITE_CONFIG.contact.phone}
            </a>
          }
          backLinkPath="/marketing/"
          backLinkLabel="Marketing"
          visual={<MetaAdsHeroVisual />}
        />
      </div>

      {/* AuditTeaser pod hero (symetria z SEO/GoogleAds) */}
      <div className="relative z-30 max-w-4xl mx-auto -mt-12 px-4">
        <AuditTeaser
          variant="light"
          colorScheme="indigo"
          placeholder="Wpisz adres swojej strony..."
          buttonText="Sprawdź ślady reklamowe"
        />
      </div>

      <MetaAdsFunnel onCta={() => openModal('marketing', { specificType: 'ads' })} />

      <MetaAdsCapi />

      <MetaAdsEcosystem />

      <MetaAdsStrategy />

      {/* --- PRICING --- */}
      {pricingData && (
        <PricingTable
          title={pricingData.title}
          description={pricingData.description}
          tiers={pricingData.tiers}
        />
      )}

      {/* --- FAQ --- */}
      <FaqSection title="Pytania o Social Ads" items={CONTENT.faqs} />

      {/* FC1+FC2 — FounderCard + spoke cross-linking */}
      <MarketingSpokeFooter
        currentType="meta-ads"
        founderBio={
          <>
            Od 2020 prowadzę kampanie Facebook Ads i Instagram Ads. Sam piszę briefy kreacyjne, sam
            testuję targetowanie, sam podpinam Pixel + Conversions API. Bez "agencji od kreacji" i
            bez "freelancera od konfiguracji".
          </>
        }
      />

      {/* --- CTA --- */}
      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Play}
          onClick={() => openModal('marketing', { specificType: 'ads' })}
          variant="gradient"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Meta Ads"
        sublabel="Pixel + CAPI · kreacje video"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('marketing', { specificType: 'ads' })}
      />

      <style>{`
        @keyframes scroll-y {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .animate-infinite-scroll-y {
            animation: scroll-y 20s linear infinite;
        }
        .mask-fade-y {
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};

export default MetaAds;
