import React, { useEffect, useRef } from 'react';
import Seo from '@/components/common/Seo';
import { MARKETING_CONTENT } from '@/data/content';
import StandardHero from '@/components/common/StandardHero';
import HeroTrustLine from '@/components/common/HeroTrustLine';
import StickyMobileBar from '@/components/common/StickyMobileBar';
import { MarketingHeroVisual } from '@/components/visuals/hero/MarketingVisual';
import { SITE_CONFIG } from '@/config/site';
import { Target, Zap } from 'lucide-react';
import MarketingStrategy from '@/components/features/marketing/MarketingStrategy';
import MarketingOmnichannel from '@/components/features/marketing/MarketingOmnichannel';
import MarketingIndustries from '@/components/features/marketing/MarketingIndustries';
import MarketingArsenal from '@/components/features/marketing/MarketingArsenal';
import StandardFaq from '@/components/common/StandardFaq';
import BaseCta from '../common/BaseCta';
import LazyHydrate from '@/components/common/LazyHydrate';
import RelatedArticles from '../articles/RelatedArticles';
import { useModal } from '@/context/ModalContext';

const Marketing: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans overflow-hidden">
      <Seo
        title={MARKETING_CONTENT.seo.title}
        description={MARKETING_CONTENT.seo.description}
        image={MARKETING_CONTENT.seo.image}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Performance Marketing',
            provider: {
              '@type': 'Organization',
              name: 'Mixture Marketing',
              url: 'https://mixturemarketing.pl',
              logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
            },
            areaServed: 'PL',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Usługi Marketingowe',
              itemListElement: MARKETING_CONTENT.arsenal.items.map((item) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: item.title,
                  url: `https://mixturemarketing.pl${item.path}`,
                  description: item.desc,
                },
              })),
            },
          },
        ]}
      />

      <div ref={heroRef}>
        <StandardHero
          badge={MARKETING_CONTENT.hero.badge}
          badgeIcon={Target}
          title={{ line1: MARKETING_CONTENT.hero.title, line2: MARKETING_CONTENT.hero.titleAccent }}
          description={MARKETING_CONTENT.hero.description}
          priceHint="od 800 zł / mc · SEO / Google Ads / Meta Ads / Analytics · raporty co tydzień"
          trustLine={<HeroTrustLine />}
          ctaPrimaryText={MARKETING_CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('marketing')}
          backLinkPath="/"
          backLinkLabel="Wróć do głównej"
          accentGradientFrom="#61B6DE"
          accentGradientTo="#FFFFFF"
          visual={<MarketingHeroVisual />}
        />
      </div>

      {/* Missing Pain Points Section - placeholder if needed or implemented later */}

      <LazyHydrate minHeight="600px">
        <MarketingStrategy />
      </LazyHydrate>

      <LazyHydrate minHeight="500px">
        <MarketingOmnichannel />
      </LazyHydrate>

      <LazyHydrate minHeight="600px">
        <MarketingIndustries />
      </LazyHydrate>

      <LazyHydrate minHeight="800px">
        <MarketingArsenal />
      </LazyHydrate>

      <LazyHydrate minHeight="400px">
        <section className="py-20 md:py-24 bg-white relative z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <StandardFaq items={MARKETING_CONTENT.faqs} />
          </div>
        </section>
      </LazyHydrate>

      <LazyHydrate minHeight="600px">
        <RelatedArticles category="marketing" layout="service" />
      </LazyHydrate>

      {/* --- CTA --- */}
      <div ref={finalCtaRef}>
        <BaseCta
          title={MARKETING_CONTENT.cta.title}
          description={MARKETING_CONTENT.cta.description}
          buttonText={MARKETING_CONTENT.cta.button}
          icon={Zap}
          onClick={() => openModal('marketing')}
          variant="dark"
        />
      </div>

      {/* EH2 reuse — Sticky mobile CTA bar */}
      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja"
        sublabel="Marketing 360° · raport co tydzień"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Zapytaj"
        onPrimary={() => openModal('marketing')}
      />
    </div>
  );
};

export default Marketing;
