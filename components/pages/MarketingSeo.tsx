import React, { useEffect, useState } from 'react';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import PricingTable from '../common/PricingTable';
import AuditTeaser from '../features/audit/AuditTeaser';
import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import { SeoHeroVisual } from '../visuals/HeroVisuals';
import { TrendingUp, Crosshair } from 'lucide-react';

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
        faq={CONTENT.faqs.map((f) => ({ question: f.q, answer: f.a }))}
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
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('marketing', { specificType: 'seo' })}
        ctaSecondaryText={CONTENT.hero.microCopy}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={Globe}
        backLinkPath="/marketing"
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
        <RelatedArticles currentSlug="seo" category="Marketing" />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <StandardCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Crosshair}
          onClick={() => openModal('audit', { specificType: 'seo' })}
          colorScheme="success"
          bgClassName="bg-success text-white"
          className="text-white"
        />
      </LazyHydrate>
    </div>
  );
};

export default MarketingSeo;
