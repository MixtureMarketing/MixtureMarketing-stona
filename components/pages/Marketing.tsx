import React, { useEffect } from 'react';
import Seo from '@/components/common/Seo';
import { MARKETING_CONTENT } from '@/data/content';
import MarketingHero from '@/components/features/marketing/MarketingHero';
import MarketingStrategy from '@/components/features/marketing/MarketingStrategy';
import MarketingOmnichannel from '@/components/features/marketing/MarketingOmnichannel';
import MarketingIndustries from '@/components/features/marketing/MarketingIndustries';
import MarketingArsenal from '@/components/features/marketing/MarketingArsenal';
import StandardFaq from '@/components/common/StandardFaq';
import StandardCta from '@/components/common/StandardCta';
import { Compass } from 'lucide-react';
import LazyHydrate from '@/components/common/LazyHydrate';
import RelatedArticles from '../articles/RelatedArticles';
import { useModal } from '@/context/ModalContext';

const Marketing: React.FC = () => {
  const { openModal } = useModal();
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

      <MarketingHero />

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

      <LazyHydrate minHeight="300px">
        <StandardCta
          title={MARKETING_CONTENT.cta.title}
          description={MARKETING_CONTENT.cta.description}
          buttonText={MARKETING_CONTENT.cta.button}
          icon={Compass}
          onClick={() => openModal('consultation')}
          variant="white"
          bgClassName="bg-deep-dark text-white"
          className="text-white"
        />
      </LazyHydrate>
    </div>
  );
};

export default Marketing;
