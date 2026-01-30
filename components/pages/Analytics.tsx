import React, { useEffect } from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import StandardFaq from '../common/StandardFaq';
import { ANALYTICS_CONTENT as CONTENT } from '../../data/content';
import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import SectionHeader from '../common/SectionHeader';
import { AnalyticsHeroVisual } from '../visuals/hero/AnalyticsVisual';

// Refactored Sub-components
import AnalyticsPainPoints from '../features/marketing/AnalyticsPainPoints';
import AnalyticsCompliance from '../features/marketing/AnalyticsCompliance';
import AnalyticsSliderComparison from '../features/marketing/AnalyticsSliderComparison';
import AnalyticsSolutions from '../features/marketing/AnalyticsSolutions';
import AnalyticsWarehouse from '../features/marketing/AnalyticsWarehouse';

const Analytics: React.FC = () => {
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-[#F4B400]/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Activity}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('marketing')}
        ctaSecondaryText={CONTENT.hero.trustBadge}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={CheckCircle2}
        backLinkPath="/marketing"
        backLinkLabel="Wróć do Marketingu"
        accentGradientFrom="primary"
        accentGradientTo="secondary"
        visual={<AnalyticsHeroVisual />}
      />

      <AnalyticsPainPoints />

      <AnalyticsCompliance />

      <AnalyticsSliderComparison />

      <AnalyticsSolutions />

      <AnalyticsWarehouse />

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-light-gray relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={CONTENT.faq.title} className="mb-12" />
          <StandardFaq items={CONTENT.faq.items} />
        </div>
      </section>

      {/* --- CTA --- */}
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.button}
        icon={Activity}
        onClick={() => openModal('audit')}
        bgClassName="bg-white border-t border-gray-100"
      />
    </div>
  );
};

export default Analytics;
