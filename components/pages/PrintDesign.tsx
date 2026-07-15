import React, { useEffect, useRef } from 'react';
import { Printer, Zap } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import DesignSpokeFooter from '../common/DesignSpokeFooter';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import StandardFaq from '../common/StandardFaq';
import SectionHeader from '../common/SectionHeader';
import { PrintHeroVisual } from '../visuals/hero/PrintVisual';
import Seo from '../common/Seo';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../data/content';
import { SITE_CONFIG } from '../../config/site';

// Refactored Sub-components
import PrintGuarantee from '../features/design/PrintGuarantee';
import PrintFinishes from '../features/design/PrintFinishes';
import PrintPaperEngineering from '../features/design/PrintPaperEngineering';
import PrintPackaging from '../features/design/PrintPackaging';
import PrintPreflight from '../features/design/PrintPreflight';
import PrintArsenal from '../features/design/PrintArsenal';

const PrintDesign: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Design', item: '/design/' },
          { name: 'Print', item: '/design/print/' },
        ]}
        service={{
          name: 'Print Design',
          description:
            'Projektowanie materiałów drukowanych: katalogi, broszury, opakowania, POS, kalendarze. Preflight, profile kolorów, przygotowanie pod konkretną drukarnię.',
          serviceType: 'Print Design',
        }}
      />

      {/* --- HERO SECTION --- */}
      <div ref={heroRef}>
        <StandardHero
          badge={CONTENT.hero.badge}
          badgeIcon={Printer}
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 800 zł / projekt · preflight w cenie · profile drukarni"
          trustLine={<HeroTrustLine promise="Sam projektuję i robię preflight pod drukarnię" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={() => openModal('design', { specificType: 'print' })}
          backLinkPath="/design/"
          backLinkLabel="Wróć do Designu"
          visual={<PrintHeroVisual />}
        />
      </div>

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

      {/* FC1+FC2 — FounderCard + spoke cross-linking */}
      <DesignSpokeFooter
        currentType="print"
        founderBio={
          <>
            Od 2020 projektuję materiały drukowane — katalogi, opakowania, POS, kalendarze. Sam
            robię preflight, sam pilnuje profili kolorów CMYK/Pantone. Bez "wymiany maili z
            drukarnią o spady".
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
          onClick={() => openModal('design', { specificType: 'print' })}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Print"
        sublabel="Katalogi · opakowania · POS"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('design', { specificType: 'print' })}
      />
    </div>
  );
};

export default PrintDesign;
