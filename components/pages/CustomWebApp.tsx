import React, { useEffect, useState } from 'react';
import { Code2, Calculator, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import LazyHydrate from '../common/LazyHydrate';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import StandardHero from '../common/StandardHero';
import BaseCta from '../common/BaseCta';
import { WebAppHeroVisual } from '../visuals/hero/WebAppVisual';

// Refactored Sub-components
import WebAppUseCases from '../features/web-development/WebAppUseCases';
import WebAppTechStack from '../features/web-development/WebAppTechStack';
import WebAppTrust from '../features/web-development/WebAppTrust';
import WebAppQaPipeline from '../features/web-development/WebAppQaPipeline';

const CustomWebApp: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('custom-web-app').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'custom',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        lcpImage={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Aplikacje dedykowane', item: '/web-development/custom-app/' },
        ]}
        service={{
          name: 'Aplikacje webowe dedykowane',
          description:
            'Tworzenie dedykowanych aplikacji webowych SaaS / B2B / portali klienckich. Stack: Next.js + Node.js + PostgreSQL / Sanity / Cloudflare Workers. SLA 99.5% uptime.',
          serviceType: 'Custom Web Application Development',
        }}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Code2}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={() => openModal('web', { specificType: 'custom' })}
        ctaSecondaryText="Wyceń aplikację"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=custom')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/web-development"
        backLinkLabel="Web Development"
        visual={<WebAppHeroVisual />}
      />

      <WebAppUseCases />

      <WebAppTechStack />

      <WebAppTrust />

      <WebAppQaPipeline />

      {/* --- PRICING --- */}
      {pricingData && (
        <LazyHydrate minHeight="600px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      {/* --- CTA --- */}
      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Settings}
        onClick={() => openModal('web', { specificType: 'custom' })}
        variant="dark"
      />
    </div>
  );
};

export default CustomWebApp;
