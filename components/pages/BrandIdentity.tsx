import React, { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import StandardFaq from '../common/StandardFaq';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../data/content';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import DesignSpokeFooter from '../common/DesignSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import SectionHeader from '../common/SectionHeader';
import { SITE_CONFIG } from '../../config/site';

// Refactored Sub-components
import BrandProcess from '../features/design/BrandProcess';
import BrandDnaMixer from '../features/design/BrandDnaMixer';
import BrandArchetypes from '../features/design/BrandArchetypes';
import BrandTouchpoints from '../features/design/BrandTouchpoints';
import BrandAssetDelivery from '../features/design/BrandAssetDelivery';

const BrandIdentity: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Design', item: '/design/' },
          { name: 'Branding', item: '/design/branding/' },
        ]}
        service={{
          name: 'Branding / Identyfikacja wizualna',
          description: CONTENT.seo.description,
          serviceType: 'Brand Identity Design',
        }}
      />

      {/* Hero words-only w ciemnym rejestrze (lift kategorii design,
          2026-07-16) — wizual-atrapa i badge usunięte. */}
      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 3 500 zł logo + brand book · od 8 000 zł pełna identyfikacja · 3–4 tyg"
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('design', { specificType: 'branding' })}
          backLinkPath="/design/"
          backLinkLabel="Design"
        />
      </div>

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

      {/* FC1+FC2 — FounderCard + spoke cross-linking */}
      <DesignSpokeFooter
        currentType="branding"
        founderBio={
          <>
            Od 2020 buduję identyfikacje wizualne — logo, brand book, naming, rebranding. Sam
            prowadzę workshop discovery, sam projektuję, sam piszę guidelines. Dla firm z
            Podkarpacia i ogólnopolsko.
          </>
        }
      />

      {/* --- CTA --- */}
      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Zap}
          onClick={() => openModal('design', { specificType: 'branding' })}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Branding"
        sublabel="Logo + brand book · 3–4 tygodnie"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('design', { specificType: 'branding' })}
      />
    </div>
  );
};

export default BrandIdentity;
