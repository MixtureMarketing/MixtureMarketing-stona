import React, { useEffect } from 'react';
import { Printer, Droplet, Package } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import { useModal } from '../../context/ModalContext';
import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import StandardFaq from '../common/StandardFaq';
import { PrintHeroVisual } from '../visuals/hero/PrintVisual';
import Seo from '../common/Seo';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../data/content';

// Refactored Sub-components
import PrintGuarantee from '../features/design/PrintGuarantee';
import PrintFinishes from '../features/design/PrintFinishes';
import PrintPaperEngineering from '../features/design/PrintPaperEngineering';
import PrintPackaging from '../features/design/PrintPackaging';
import PrintPreflight from '../features/design/PrintPreflight';
import PrintArsenal from '../features/design/PrintArsenal';

const PrintDesign: React.FC = () => {
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      <Seo title={CONTENT.seo.title} description={CONTENT.seo.description} />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Printer}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('design', { specificType: 'print' })}
        ctaSecondaryText={CONTENT.hero.microCopy}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={Droplet}
        backLinkPath="/design/"
        backLinkLabel="Wróć do Designu"
        accentGradientFrom="#F4B400"
        accentGradientTo="#FFD700"
        visual={<PrintHeroVisual />}
      />

      <PrintGuarantee />

      <PrintFinishes />

      <PrintPaperEngineering />

      <PrintPackaging />

      <PrintPreflight />

      <PrintArsenal />

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-light-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Pytania o Druk" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      {/* --- CTA --- */}
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Package}
        onClick={() => openModal('design')}
        bgClassName="bg-white border-t border-gray-100"
      />
    </div>
  );
};

export default PrintDesign;
