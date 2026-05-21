import React, { useEffect, useRef } from 'react';
import { Palette, Wand2 } from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import LazyHydrate from '../common/LazyHydrate';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../data/content';
import RelatedArticles from '../articles/RelatedArticles';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import StandardFaq from '../common/StandardFaq';
import { DesignHeroVisual } from '../visuals/hero/DesignVisual';
import { SITE_CONFIG } from '../../config/site';

// Refactored Sub-components
import DesignToolkit from '../features/design/DesignToolkit';
import DesignEcosystem from '../features/design/DesignEcosystem';
import DesignSectors from '../features/design/DesignSectors';
import DesignPillars from '../features/design/DesignPillars';

const DesignBranding: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Design & Branding',
          provider: {
            '@type': 'Organization',
            name: 'Mixture Marketing',
            url: 'https://mixturemarketing.pl',
            logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
          },
          areaServed: 'PL',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Usługi Projektowe',
            itemListElement: CONTENT.pillars.items.map((item) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: item.title,
                url: `https://mixturemarketing.pl${item.path}`,
                description: item.desc,
              },
            })),
          },
        }}
      />

      {/* --- HERO SECTION --- */}
      <div ref={heroRef}>
        <StandardHero
          badge={CONTENT.hero.badge}
          badgeIcon={Palette}
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 800 zł / Print · od 4 500 zł UI-UX · od 3 500 zł Branding · audyt od 2 500 zł"
          trustLine={<HeroTrustLine />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('design')}
          backLinkPath="/"
          backLinkLabel="Wróć do strony głównej"
          visual={<DesignHeroVisual />}
        />
      </div>

      <DesignToolkit />

      <DesignEcosystem />

      <DesignSectors />

      <DesignPillars />

      {/* --- ROI OF DESIGN --- */}
      <section className="py-24 bg-light-gray relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            {CONTENT.roi.items.map((item, i) => {
              const colors = ['text-secondary', 'text-primary', 'text-success'];
              return (
                <AnimateOnScroll
                  key={i}
                  delay={i * 100}
                  className={i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}
                >
                  <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 h-full">
                    <div className={`text-5xl font-black mb-2 ${colors[i]}`}>{item.val}</div>
                    <p className="text-gray-600 font-medium">{item.label}</p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <LazyHydrate minHeight="600px">
        <RelatedArticles category="design" layout="service" />
      </LazyHydrate>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title="Najczęstsze pytania" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      {/* --- CTA --- */}
      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.text}
          buttonText={CONTENT.cta.button}
          icon={Wand2}
          onClick={() => openModal('design')}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Design"
        sublabel="Branding · UI/UX · Print · Audyt"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('design')}
      />
    </div>
  );
};

export default DesignBranding;
