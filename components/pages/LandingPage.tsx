import React, { useEffect, useState } from 'react';
import {
  Target,
  BarChart3,
  Zap,
  Magnet,
  Smartphone,
  Database,
  Rocket,
  Play,
  Calculator,
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
import HeroTrustLine from '../common/HeroTrustLine';
import WebDevSpokeFooter from '../common/WebDevSpokeFooter';
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
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        lcpImage={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Landing pages', item: '/web-development/landing-page/' },
        ]}
        service={{
          name: 'Landing page — strony konwersyjne',
          description:
            'Projektowanie i tworzenie landing pages: szybkie strony konwersyjne pod kampanie Google/Meta Ads. A/B testy, integracje z CRM i email marketing, optymalizacja Core Web Vitals.',
          serviceType: 'Landing Page Development',
        }}
      />

      {/* Hero words-only w ciemnym rejestrze (lift 2026-07-16) — „Symulator
          Prędkości" z wymyślonym wzorem -7%/s i fejkowym „Live Check" skasowany.
          Cena wg CMS (od 2 500 zł; hero twierdził 3 900 wbrew tabeli niżej);
          „7–14 dni" potwierdzone, „A/B testy w cenie" usunięte (właściciel). */}
      <StandardHero
        tone="dark"
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        priceHint="od 2 500 zł · gotowy LP w 7–14 dni"
        trustLine={<HeroTrustLine tone="dark" />}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={() => openModal('web', { specificType: 'landing' })}
        ctaSecondaryText="Wyceń stronę"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=landingPage')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/web-development/"
        backLinkLabel="Web Development"
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
            {/* Wiersz „Main KPI" usunięty — „Conversion Rate > 25%" i „Viral
                Coefficient" to wymyślone benchmarki (zakaz: usuwać, nie podmieniać). */}
            {useCases.map((item, index) => (
              <AnimateOnScroll key={index} delay={index * 150} className="h-full">
                <GlassCard className="p-8 h-full flex flex-col transition-all duration-300 group bg-[#F9FAFB] hover:bg-white hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-dark mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shadow-sm border border-gray-100">
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-bold text-dark mb-2">{item.title}</h3>
                  <p className="text-xxs font-black text-secondary uppercase tracking-[0.2em] mb-4">
                    {item.subtitle}
                  </p>

                  <p className="text-gray-700 leading-relaxed text-sm mb-6 flex-grow font-medium">
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xxs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded uppercase border border-gray-200 group-hover:border-secondary/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </AnimateOnScroll>
            ))}
          </div>
        </SectionWrapper>
      </LazyHydrate>

      {/* --- PRICING --- (EH4: PRZED Psychology — high-intent LP klient szuka ceny najpierw) */}
      {pricingData && (
        <LazyHydrate minHeight="600px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

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

      {/* --- FOUNDER TRUST + SPOKE CROSS-LINKS --- */}
      <WebDevSpokeFooter
        currentType="landing"
        founderBio={
          <>
            Od 2020 buduję landing page&apos;y pod kampanie performance (Google/Meta Ads). Robię UX
            wireframes w Figma, koduję w Astro lub Next.js, integruję z analityką i CRM. Sam testuję
            A/B — bez "wycofań do backendu".
          </>
        }
      />

      {/* --- CTA --- */}
      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={AlertTriangle}
        onClick={() => openModal('web', { specificType: 'landing' })}
        variant="gradient"
      />
    </div>
  );
};

export default LandingPage;
