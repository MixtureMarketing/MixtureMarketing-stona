import React, { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { ANALYTICS_CONTENT as CONTENT } from '../../data/content';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import MarketingSpokeFooter from '../common/MarketingSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import { SITE_CONFIG } from '../../config/site';
import PricingTable from '../common/PricingTable';
import LazyHydrate from '../common/LazyHydrate';
import FaqSection from '../sections/FaqSection';
import AuditTeaser from '../features/audit/AuditTeaser';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import { AnalyticsHeroVisual } from '../visuals/hero/AnalyticsVisual';

// Refactored Sub-components
import AnalyticsPainPoints from '../features/marketing/AnalyticsPainPoints';
import AnalyticsCompliance from '../features/marketing/AnalyticsCompliance';
import AnalyticsSliderComparison from '../features/marketing/AnalyticsSliderComparison';
import AnalyticsSolutions from '../features/marketing/AnalyticsSolutions';
import AnalyticsWarehouse from '../features/marketing/AnalyticsWarehouse';

const Analytics: React.FC = () => {
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('analytics').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('marketing', {
              specificType: 'analytics',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-[#F4B400]/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'Analytics', item: '/marketing/analytics/' },
        ]}
        service={{
          name: 'Analytics — GA4, GTM, server-side tracking',
          description:
            'Wdrażanie i konfiguracja Google Analytics 4, Google Tag Manager, server-side tracking, Conversions API. Dashboardy, atrybucja, raporty per kanał i lejek konwersji.',
          serviceType: 'Web Analytics Implementation',
        }}
      />

      {/* --- HERO SECTION --- */}
      <div ref={heroRef}>
        <StandardHero
          badge={CONTENT.hero.badge}
          badgeIcon={Activity}
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 1 500 zł setup · od 600 zł / mc maintenance · GA4 + GTM + server-side"
          trustLine={<HeroTrustLine promise="Sam pisze konfigurację GTM, sam czytam dane" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('marketing', { specificType: 'analytics' })}
          backLinkPath="/marketing/"
          backLinkLabel="Wróć do Marketingu"
          visual={<AnalyticsHeroVisual />}
        />
      </div>

      {/* AuditTeaser pod hero (asymetria fix: MetaAds tez powinien dostac) */}
      <div className="relative z-30 max-w-4xl mx-auto -mt-12 px-4">
        <AuditTeaser
          variant="light"
          colorScheme="blue"
          placeholder="Wpisz adres swojej strony..."
          buttonText="Sprawdź setup analytics"
        />
      </div>

      <AnalyticsPainPoints />

      <AnalyticsCompliance />

      <AnalyticsSliderComparison />

      <AnalyticsSolutions />

      <AnalyticsWarehouse />

      {/* --- PRICING TIERS --- */}
      {pricingData && (
        <LazyHydrate minHeight="600px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      {/* --- FAQ SECTION --- */}
      <FaqSection title={CONTENT.faq.title} items={CONTENT.faq.items} bgClassName="bg-light-gray" />

      {/* FC1+FC2 — FounderCard + spoke cross-linking */}
      <MarketingSpokeFooter
        currentType="analytics"
        founderBio={
          <>
            Od 2020 wdrażam analytics — GA4, GTM, server-side tracking, Conversions API. Sam piszę
            konfigurację GTM, sam debuguję eventy, sam czytam dane. Bez "konsultanta GA" i bez
            "developera od integracji".
          </>
        }
      />

      {/* --- CTA --- */}
      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.text}
          buttonText={CONTENT.cta.button}
          icon={Activity}
          onClick={() => openModal('marketing', { specificType: 'analytics' })}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Analytics"
        sublabel="GA4 + GTM + server-side"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('marketing', { specificType: 'analytics' })}
      />
    </div>
  );
};

export default Analytics;
