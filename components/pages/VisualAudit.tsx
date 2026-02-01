import React, { useEffect } from 'react';
import { Microscope, ScanEye, Fingerprint } from 'lucide-react';
import Seo from '../common/Seo';
import StandardHero from '../common/StandardHero';
import BaseCta from '../common/BaseCta';
import { useModal } from '../../context/ModalContext';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../data/content';
import { VisualAuditHeroVisual } from '../visuals/hero/VisualAuditVisual';
import FiveSecondTest from '../features/audit/FiveSecondTest';
import WcagTerminal from '../features/audit/WcagTerminal';
import HeuristicsGrid from '../features/audit/HeuristicsGrid';
import FaqSection from '../sections/FaqSection';

const VisualAudit: React.FC = () => {
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-instagram/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Microscope}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('audit', { specificType: 'visual_audit' })}
        ctaSecondaryNode={
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-gray-300 backdrop-blur-sm">
            <ScanEye size={16} className="text-instagram" /> {CONTENT.hero.microCopy}
          </div>
        }
        backLinkPath="/design/"
        backLinkLabel="Design"
        accentGradientFrom="#E1306C"
        accentGradientTo="#833AB4"
        visual={<VisualAuditHeroVisual />}
      />

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

      {/* --- CTA --- */}
      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Fingerprint}
        onClick={() => openModal('audit')}
        variant="dark"
      />
    </div>
  );
};

export default VisualAudit;
