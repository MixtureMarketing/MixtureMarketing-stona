import React, { useEffect } from 'react';
import { Fingerprint, Figma, Zap } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import StandardFaq from '../common/StandardFaq';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../data/content/services/design/ui-ux';
import StandardHero from '../common/StandardHero';
import BaseCta from '../common/BaseCta';
import LazyHydrate from '../common/LazyHydrate';
import { UiUxHeroVisual } from '../visuals/hero/UiUxVisual';

// Refactored Sub-components
import UiUxDesignSystem from '../features/design/UiUxDesignSystem';
import UiUxRwdShowcase from '../features/design/UiUxRwdShowcase';
import UiUxTransformation from '../features/design/UiUxTransformation';
import UiUxAtomicDesign from '../features/design/UiUxAtomicDesign';
import UiUxInteractions from '../features/design/UiUxInteractions';

const UiUxDesign: React.FC = () => {
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Fingerprint}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('design', { specificType: 'uiux' })}
        ctaSecondaryText={`${CONTENT.hero.microCopy.label}: ${CONTENT.hero.microCopy.value}`}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={Figma}
        backLinkPath="/design"
        backLinkLabel="Wróć do Designu"
        visual={<UiUxHeroVisual />}
      />

      <LazyHydrate whenVisible>
        <UiUxDesignSystem />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <UiUxRwdShowcase />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <UiUxTransformation />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <UiUxAtomicDesign />
      </LazyHydrate>

      <LazyHydrate whenVisible>
        <UiUxInteractions />
      </LazyHydrate>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-light-gray relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title="Pytania o UI/UX" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      {/* --- CTA --- */}
      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Zap}
        onClick={() => openModal('design', { specificType: 'ui-ux' })}
        variant="dark"
      />
    </div>
  );
};

export default UiUxDesign;
