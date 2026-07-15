import React, { useEffect, useRef } from 'react';
import { Fingerprint, Palette } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import StandardFaq from '../common/StandardFaq';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../data/content/services/design/ui-ux';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import DesignSpokeFooter from '../common/DesignSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import LazyHydrate from '../common/LazyHydrate';
import { UiUxHeroVisual } from '../visuals/hero/UiUxVisual';
import { SITE_CONFIG } from '../../config/site';

// Refactored Sub-components
import UiUxDesignSystem from '../features/design/UiUxDesignSystem';
import UiUxRwdShowcase from '../features/design/UiUxRwdShowcase';
import UiUxTransformation from '../features/design/UiUxTransformation';
import UiUxAtomicDesign from '../features/design/UiUxAtomicDesign';
import UiUxInteractions from '../features/design/UiUxInteractions';

const UiUxDesign: React.FC = () => {
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
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Design', item: '/design/' },
          { name: 'UI / UX', item: '/design/ui-ux/' },
        ]}
        service={{
          name: 'UI / UX Design',
          description:
            'Projektowanie interfejsów użytkownika i doświadczeń. Web, mobile, dashboardy. Design system, prototyping w Figma, user testing, atomic design.',
          serviceType: 'UI/UX Design',
        }}
      />

      {/* --- HERO SECTION --- */}
      <div ref={heroRef}>
        <StandardHero
          badge={CONTENT.hero.badge}
          badgeIcon={Fingerprint}
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 4 500 zł / projekt · Figma + design system · prototyping w cenie"
          trustLine={<HeroTrustLine promise="Sam projektuję w Figma, sam buduję design system" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('design', { specificType: 'uiux' })}
          backLinkPath="/design/"
          backLinkLabel="Wróć do Designu"
          visual={<UiUxHeroVisual />}
        />
      </div>

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

      {/* FC1+FC2 — FounderCard + spoke cross-linking */}
      <DesignSpokeFooter
        currentType="ui-ux"
        founderBio={
          <>
            Od 2020 projektuję interfejsy w Figma — dashboardy SaaS, sklepy, aplikacje. Sam buduję
            design system, sam piszę prototypy interaktywne, sam testuję z userami. Bez "konsultanta
            UX" i bez "agencji od kreacji".
          </>
        }
      />

      {/* --- CTA --- */}
      <div ref={finalCtaRef}>
        <BaseCta
          icon={Palette}
          title={`${CONTENT.cta.title.line1} ${CONTENT.cta.title.line2}`}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          onClick={() => openModal('design', { specificType: 'uiux' })}
          // Było `variant="glow"` — wariant, którego BaseCta NIE MA (CtaVariant to
          // dark | gradient | glass | white). containerVariants['glow'] dawało
          // undefined → CTA bez tła, czarny H2 i opis gray-300 na bieli (~1,4:1).
          // Główne CTA rozjechane na produkcji, na podstronie o UI/UX. TypeScript to
          // zgłaszał, ale typecheck jest `continue-on-error` w CI, więc przechodziło.
          // (Uwaga: `glow` jest legalny w BaseCard — stąd pomyłka; to inny komponent.)
          variant="gradient"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja UI/UX"
        sublabel="Figma + design system"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('design', { specificType: 'uiux' })}
      />
    </div>
  );
};

export default UiUxDesign;
