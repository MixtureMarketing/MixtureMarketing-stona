import React, { useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { ANALYTICS_CONTENT as CONTENT } from '../../data/content';
import StandardHero from '../common/StandardHero';
import BaseCta from '../common/BaseCta';
import FaqSection from '../sections/FaqSection';
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
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'Analytics', item: '/marketing/analytics/' },
        ]}
        service={{
          name: 'Analytics — GA4, GTM, server-side tracking',
          description:
            'Wdrażanie i konfiguracja Google Analytics 4, Google Tag Manager, server-side tracking, Conversions API. Dashboardy, atrybucja, raporty per kanał i lejek konwersji.',
          serviceType: 'Web Analytics Implementation',
        }}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Activity}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('marketing', { specificType: 'analytics' })}
        backLinkPath="/marketing/"
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
      <FaqSection title={CONTENT.faq.title} items={CONTENT.faq.items} bgClassName="bg-light-gray" />

      {/* --- CTA --- */}
      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.button}
        icon={Activity}
        onClick={() => openModal('audit')}
        variant="dark"
      />
    </div>
  );
};

export default Analytics;
