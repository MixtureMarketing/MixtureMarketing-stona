import React, { useEffect } from 'react';
import Seo from '@/components/common/Seo';
import { MARKETING_CONTENT } from '@/data/content';
import MarketingHero from '@/components/features/marketing/MarketingHero';
import MarketingStrategy from '@/components/features/marketing/MarketingStrategy';
import MarketingOmnichannel from '@/components/features/marketing/MarketingOmnichannel';
import MarketingIndustries from '@/components/features/marketing/MarketingIndustries';
import MarketingArsenal from '@/components/features/marketing/MarketingArsenal';
import MarketingFaq from '@/components/features/marketing/MarketingFaq';
import MarketingCta from '@/components/features/marketing/MarketingCta';
import LazyHydrate from '@/components/common/LazyHydrate';
import ServiceRelatedArticles from '../features/services/ServiceRelatedArticles';

const Marketing: React.FC = () => {
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
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: MARKETING_CONTENT.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          },
        ]}
      />

      <MarketingHero />

      {/* Missing Pain Points Section - placeholder if needed or implemented later */}

      <LazyHydrate>
        <MarketingStrategy />
      </LazyHydrate>

      <LazyHydrate>
        <MarketingOmnichannel />
      </LazyHydrate>

      <LazyHydrate>
        <MarketingIndustries />
      </LazyHydrate>

      <LazyHydrate>
        <MarketingArsenal />
      </LazyHydrate>

      <LazyHydrate>
        <MarketingFaq />
      </LazyHydrate>

      <LazyHydrate minHeight="600px">
        <ServiceRelatedArticles category="marketing" />
      </LazyHydrate>

      <LazyHydrate>
        <MarketingCta />
      </LazyHydrate>
    </div>
  );
};

export default Marketing;
