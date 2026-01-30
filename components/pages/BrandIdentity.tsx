import React, { useEffect } from 'react';
import { Fingerprint, Grid, Briefcase } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import StandardFaq from '../common/StandardFaq';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../data/content';
import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import SectionHeader from '../common/SectionHeader';
import { DesignHeroVisual } from '../visuals/hero/DesignVisual';

// Refactored Sub-components
import BrandProcess from '../features/design/BrandProcess';
import BrandDnaMixer from '../features/design/BrandDnaMixer';
import BrandArchetypes from '../features/design/BrandArchetypes';
import BrandTouchpoints from '../features/design/BrandTouchpoints';
import BrandAssetDelivery from '../features/design/BrandAssetDelivery';

const BrandIdentity: React.FC = () => {
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Schema
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Brand Identity Design',
    provider: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
    },
    description: CONTENT.seo.description,
    areaServed: 'Poland',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Pakiety Brandingowe',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Logo Design' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Brand Book' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rebranding' } },
      ],
    },
  };

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        jsonLd={structuredData}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Fingerprint}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('design', { specificType: 'branding' })}
        ctaSecondaryText={CONTENT.hero.microCopy}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={Grid}
        backLinkPath="/design"
        backLinkLabel="Wróć do Designu"
        visual={<DesignHeroVisual />}
      />

      <BrandProcess />

      <BrandDnaMixer />

      <BrandArchetypes />

      <BrandTouchpoints />

      <BrandAssetDelivery />

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title="Pytania o Branding" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Briefcase}
        onClick={() => openModal('design', { specificType: 'branding' })}
        bgClassName="bg-light-gray border-t border-gray-100"
      />
    </div>
  );
};

export default BrandIdentity;
