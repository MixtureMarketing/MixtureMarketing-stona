import React, { useEffect, useState } from 'react';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import PricingTable from '../common/PricingTable';
import SectionHeader from '../common/SectionHeader';
import AuditTeaser from '../features/audit/AuditTeaser';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import BaseCta from '../common/BaseCta';
import { SeoHeroVisual } from '../visuals/hero/SeoVisual';
import { TrendingUp, Crosshair } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { PricingSectionData, PricingTier } from '../../types';
import { cmsService } from '../../services/cmsService';
import { SEO_CONTENT as CONTENT } from '../../data/content';
import SeoLocalSection from '../features/seo/SeoLocalSection';
import SeoContentIntelligence from '../features/seo/SeoContentIntelligence';
import SeoTechnicalSection from '../features/seo/SeoTechnicalSection';
import SeoRoadmap from '../features/seo/SeoRoadmap';
import SeoRoiCalculator from '../features/seo/SeoRoiCalculator';
import StandardFaq from '../common/StandardFaq';
import RelatedArticles from '../articles/RelatedArticles';

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

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-success/20">
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

      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={TrendingUp}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        priceHint="od 1 500 zł / mc · audyt techniczny w cenie · pierwsze efekty w 3–6 mc"
        trustLine={<HeroTrustLine promise="Sam czytam dane z GSC / Ahrefs — bez juniorów" />}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('marketing', { specificType: 'seo' })}
        backLinkPath="/marketing/"
        backLinkLabel="Wróć do Marketingu"
        visual={<SeoHeroVisual />}
      />

      <div className="relative z-30 max-w-4xl mx-auto -mt-12 px-4">
        <AuditTeaser
          variant="glass"
          buttonText="Sprawdź widoczność w Google"
          placeholder="Adres Twojej strony (np. mojanazwa.pl)..."
        />
      </div>

      <LazyHydrate minHeight="700px">
        <SeoLocalSection />
      </LazyHydrate>

      <LazyHydrate minHeight="800px">
        <SeoContentIntelligence />
      </LazyHydrate>

      <LazyHydrate minHeight="900px">
        <SeoTechnicalSection />
      </LazyHydrate>

      <LazyHydrate minHeight="1000px">
        <SeoRoadmap />
      </LazyHydrate>

      <LazyHydrate minHeight="600px">
        <SeoRoiCalculator />
      </LazyHydrate>

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
        <section className="py-24 bg-light-gray">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Pytania o Pozycjonowanie" className="mb-12" />
            <StandardFaq items={CONTENT.faqs} />
          </div>
        </section>
      </LazyHydrate>

      <LazyHydrate minHeight="600px">
        <RelatedArticles currentSlug="seo" category="Marketing" />
      </LazyHydrate>

      <LazyHydrate minHeight="400px">
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Crosshair}
          onClick={() => openModal('marketing', { specificType: 'seo' })}
          variant="gradient"
        />
      </LazyHydrate>
    </div>
  );
};

export default MarketingSeo;
