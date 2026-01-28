import React, { useEffect, useState } from 'react';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import PricingTable from '../common/PricingTable';
import AuditTeaser from '../features/audit/AuditTeaser';
import SeoHero from '../features/seo/SeoHero';
import SeoLocalSection from '../features/seo/SeoLocalSection';
import SeoContentIntelligence from '../features/seo/SeoContentIntelligence';
import SeoTechnicalSection from '../features/seo/SeoTechnicalSection';
import SeoRoadmap from '../features/seo/SeoRoadmap';
import SeoRoiCalculator from '../features/seo/SeoRoiCalculator';
import SeoFaq from '../features/seo/SeoFaq';
import SeoCta from '../features/seo/SeoCta';
import { useModal } from '../../context/ModalContext';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import { SEO_CONTENT as CONTENT } from '../../data/content';

const MarketingSeo: React.FC = () => {
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('seo').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('marketing', {
              specificType: 'seo',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'SEO Optimization',
    provider: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
    },
    description: CONTENT.seo.description,
    areaServed: 'Poland',
  };

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-success/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        jsonLd={structuredData}
      />

      <SeoHero />

      <div className="relative z-30 max-w-4xl mx-auto -mt-12 px-4">
        <AuditTeaser
          variant="glass"
          buttonText="Sprawdź widoczność w Google"
          placeholder="Adres Twojej strony (np. mojanazwa.pl)..."
        />
      </div>

      <LazyHydrate whenVisible>
        <SeoLocalSection />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <SeoContentIntelligence />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <SeoTechnicalSection />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <SeoRoadmap />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <SeoRoiCalculator />
      </LazyHydrate>

      {pricingData && (
        <LazyHydrate whenVisible>
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      <LazyHydrate whenVisible>
        <SeoFaq />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <SeoCta />
      </LazyHydrate>
    </div>
  );
};

export default MarketingSeo;
