import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Target,
  BarChart3,
  Zap,
  Magnet,
  Smartphone,
  Database,
  Rocket,
  Play,
  Calculator,
  MousePointerClick,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import GlassCard from '../common/GlassCard';
import IntegrationGrid, { IntegrationCategory } from '../common/IntegrationGrid';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { useModal } from '../../context/ModalContext';
import { LANDING_PAGE_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import BaseCta from '../common/BaseCta';
import SectionWrapper from '../common/SectionWrapper';
import StandardHero from '../common/StandardHero';
import { LandingPageHeroVisual } from '../visuals/hero/LandingPageVisual';
import { PricingSectionData, PricingTier } from '../../types';
import LandingPagePsychology from '../features/web-development/LandingPagePsychology';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('landing-page').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'landing',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  const useCases = CONTENT.useCases.items.map((item, i) => {
    const icons = [
      <Magnet key="magnet" size={24} />,
      <Rocket key="rocket" size={24} />,
      <Play key="play" size={24} />,
      <Smartphone key="phone" size={24} />,
    ];
    return { ...item, icon: icons[i] };
  });

  const integrationCategories: IntegrationCategory[] = [
    {
      name: 'Analytics',
      icon: <BarChart3 size={20} />,
      color: '#3F3D91',
      tools: ['GA4', 'Hotjar', 'Clarity', 'Mixpanel'],
    },
    {
      name: 'Ads Pixels',
      icon: <Target size={20} />,
      color: '#E1306C',
      tools: ['Meta Pixel', 'TikTok Pixel', 'LinkedIn Insight', 'Google Ads'],
    },
    {
      name: 'CRM / Data',
      icon: <Database size={20} />,
      color: '#00C853',
      tools: ['HubSpot', 'Salesforce', 'Pipedrive', 'ActiveCampaign'],
    },
    {
      name: 'Automation',
      icon: <Zap size={20} />,
      color: '#F4B400',
      tools: ['Zapier', 'Make.com', 'MailerLite', 'ConvertKit'],
    },
  ];

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        lcpImage={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={MousePointerClick}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={() => openModal('web', { specificType: 'landing' })}
        ctaSecondaryText="Wyceń stronę"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=landingPage')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/web-development/"
        backLinkLabel="Web Development"
        accentGradientFrom="#61B6DE"
        accentGradientTo="#E1306C"
        visual={<LandingPageHeroVisual />}
      />

      {/* --- USE CASES --- */}
      <LazyHydrate minHeight="600px">
        <SectionWrapper variant="white">
          <SectionHeader
            title={CONTENT.useCases.title}
            description={CONTENT.useCases.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((item, index) => (
              <AnimateOnScroll key={index} delay={index * 150} className="h-full">
                <GlassCard className="p-8 h-full flex flex-col transition-all duration-300 group bg-[#F9FAFB] hover:bg-white hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border-t-4 border-t-transparent hover:border-t-[#E1306C]">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-dark mb-6 group-hover:bg-instagram group-hover:text-white transition-colors duration-300 shadow-sm border border-gray-100">
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-bold text-dark mb-2">{item.title}</h3>
                  <p className="text-xxs font-black text-instagram uppercase tracking-[0.2em] mb-4">
                    {item.subtitle}
                  </p>

                  <p className="text-gray-700 leading-relaxed text-sm mb-8 flex-grow font-medium">
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xxs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded uppercase border border-gray-200 group-hover:border-instagram/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 w-full flex justify-between items-center">
                    <div>
                      <div className="text-xxs font-bold text-gray-600 uppercase tracking-widest">
                        Main KPI
                      </div>
                      <div className="text-xs font-black text-dark">{item.kpi}</div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 group-hover:text-instagram transition-colors transform group-hover:translate-x-1"
                    />
                  </div>
                </GlassCard>
              </AnimateOnScroll>
            ))}
          </div>
        </SectionWrapper>
      </LazyHydrate>

      {/* --- PSYCHOLOGY --- */}
      <LazyHydrate minHeight="800px">
        <LandingPagePsychology />
      </LazyHydrate>

      {/* --- INTEGRATIONS --- */}
      <LazyHydrate minHeight="400px">
        <SectionWrapper variant="light-gray">
          <SectionHeader
            title={CONTENT.integrations.title}
            description={CONTENT.integrations.description}
            className="mb-16"
          />

          <IntegrationGrid categories={integrationCategories} />
        </SectionWrapper>
      </LazyHydrate>

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
        icon={AlertTriangle}
        onClick={() => openModal('consultation', { specificType: 'landing' })}
        variant="gradient"
      />
    </div>
  );
};

export default LandingPage;
