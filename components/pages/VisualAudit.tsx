import React, { useEffect, useRef } from 'react';
import { Microscope, Fingerprint } from 'lucide-react';
import Seo from '../common/Seo';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import DesignSpokeFooter from '../common/DesignSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import { useModal } from '../../context/ModalContext';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../data/content/services/design/visual-audit';
import { VisualAuditHeroVisual } from '../visuals/hero/VisualAuditVisual';
import FiveSecondTest from '../features/audit/FiveSecondTest';
import WcagTerminal from '../features/audit/WcagTerminal';
import HeuristicsGrid from '../features/audit/HeuristicsGrid';
import FaqSection from '../sections/FaqSection';
import { SITE_CONFIG } from '../../config/site';

const VisualAudit: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-instagram/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Design', item: '/design/' },
          { name: 'Audyt wizualny', item: '/design/visual-audit/' },
        ]}
        service={{
          name: 'Audyt wizualny / heurystyczny UX',
          description:
            'Ekspercka analiza brandingu i UI. 5-second test, heuristic review wg Nielsen 10, WCAG 2.2 AA, raport z konkretnymi rekomendacjami i priorytetami.',
          serviceType: 'Visual / UX Audit',
        }}
      />

      {/* --- HERO SECTION --- */}
      <div ref={heroRef}>
        <StandardHero
          badge={CONTENT.hero.badge}
          badgeIcon={Microscope}
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 2 500 zł / audyt · raport w 5–7 dni · konkretne rekomendacje"
          trustLine={<HeroTrustLine promise="Sam piszę raport — nie szablon z juniora" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('design', { specificType: 'visual_audit' })}
          backLinkPath="/design/"
          backLinkLabel="Design"
          accentGradientFrom="#E1306C"
          accentGradientTo="#833AB4"
          visual={<VisualAuditHeroVisual />}
        />
      </div>

      {/* --- 5-SECOND TEST SIMULATOR --- */}
      <section className="py-24 bg-white relative z-10">
        <FiveSecondTest />
      </section>

      {/* --- WCAG & ACCESSIBILITY SCANNER --- */}
      <section className="py-24 bg-deep-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
        <WcagTerminal />
      </section>

      {/* --- HEURISTIC ANALYSIS --- */}
      <section className="py-24 bg-white relative z-10">
        <HeuristicsGrid />
      </section>

      {/* --- FAQ SECTION --- */}
      <FaqSection title="Pytania o Audyt" items={CONTENT.faqs} bgClassName="bg-light-gray" />

      {/* FC1+FC2 — FounderCard + spoke cross-linking */}
      <DesignSpokeFooter
        currentType="visual-audit"
        founderBio={
          <>
            Od 2020 audytuję strony i aplikacje pod kątem UI/UX i WCAG 2.2 AA. Sam czytam dane, sam
            piszę raport z priorytetami (BLOCKER / MAJOR / MINOR), sam pokazuję jak naprawić. Bez
            "checklisty z generatora".
          </>
        }
      />

      {/* --- CTA --- */}
      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Fingerprint}
          onClick={() => openModal('design', { specificType: 'visual_audit' })}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja audytu"
        sublabel="Raport w 5–7 dni"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('design', { specificType: 'visual_audit' })}
      />
    </div>
  );
};

export default VisualAudit;
