import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Target,
  BarChart3,
  Zap,
  Split,
  Magnet,
  Smartphone,
  Database,
  Rocket,
  Play,
  Calculator,
  MousePointerClick,
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
import StandardCta from '../common/StandardCta';
import SectionWrapper from '../common/SectionWrapper';
import StandardHero from '../common/StandardHero';
import { LandingPageHeroVisual } from '../visuals/hero/LandingPageVisual';
import { PricingSectionData, PricingTier } from '../../types';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [activeStep, setActiveStep] = useState<number | null>(null);
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

  const anatomySteps = CONTENT.psychology.steps.map((step, i) => {
    const colors = ['#E1306C', '#61B6DE', '#3F3D91', '#00C853'];
    return { ...step, color: colors[i] };
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
        <SectionWrapper id="anatomy" variant="dark">
          <div className="bg-tech-grid absolute inset-0 opacity-20 pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-16 items-start relative z-10">
            <div className="lg:w-3/5 w-full flex justify-center lg:justify-start order-2 lg:order-1">
              <AnimateOnScroll delay={200} className="w-full">
                <div className="relative w-full max-w-xl mx-auto bg-[#0F172A] rounded-md border-2 border-[#1E293B] p-2 shadow-2xl">
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

                  <div className="bg-deep-dark p-6 space-y-6 relative overflow-hidden">
                    <div className="bg-grid-pattern absolute inset-0 opacity-10 pointer-events-none"></div>

                    {[0, 1, 2, 3].map((i) => {
                      const stepColors = [
                        'border-instagram bg-instagram/5 text-instagram ring-[#E1306C]',
                        'border-primary bg-primary/5 text-primary ring-primary',
                        'border-secondary bg-secondary/5 text-secondary ring-secondary',
                        'border-success bg-success/5 text-success ring-[#00C853]',
                      ];
                      const labels = ['ATTENTION', 'INTEREST', 'DESIRE', 'ACTION'];

                      return (
                        <div
                          key={i}
                          onMouseEnter={() => setActiveStep(i)}
                          onMouseLeave={() => setActiveStep(null)}
                          onClick={() => setActiveStep(activeStep === i ? null : i)}
                          className={`relative border border-dashed p-6 rounded transition-all duration-300 cursor-pointer ${
                            activeStep === i
                              ? `ring-2 ${stepColors[i].split(' ').slice(2).join(' ')} scale-[1.02] shadow-xl z-10`
                              : activeStep !== null
                                ? 'opacity-30 blur-[1px]'
                                : ''
                          } ${stepColors[i].split(' ').slice(0, 2).join(' ')}`}
                        >
                          <div
                            className={`absolute top-0 right-0 text-white text-[10px] font-bold px-2 py-0.5 ${stepColors[i].split(' ')[2]}`}
                          >
                            {labels[i]}
                          </div>
                          {i === 0 && (
                            <div className="flex gap-4">
                              <div className="w-2/3 space-y-2">
                                <div className="h-6 w-full bg-instagram/40 rounded-sm"></div>
                                <div className="h-6 w-3/4 bg-instagram/40 rounded-sm"></div>
                                <div className="h-3 w-full bg-instagram/20 mt-4 rounded-sm"></div>
                                <div className="h-8 w-32 bg-instagram mt-4 rounded flex items-center justify-center text-xxs font-bold text-white">
                                  CTA
                                </div>
                              </div>
                              <div className="w-1/3 bg-instagram/10 border border-instagram/30 flex items-center justify-center text-instagram text-xs">
                                Hero
                              </div>
                            </div>
                          )}
                          {i === 1 && (
                            <div className="grid grid-cols-3 gap-4">
                              {[1, 2, 3].map((j) => (
                                <div key={j} className="flex flex-col gap-2">
                                  <div className="h-12 bg-primary/20 rounded w-full"></div>
                                  <div className="h-2 w-full bg-primary/20 rounded-sm"></div>
                                </div>
                              ))}
                            </div>
                          )}
                          {i === 2 && (
                            <div className="flex gap-4 items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-secondary/40 border-2 border-secondary shrink-0"></div>
                              <div className="space-y-2 w-full max-w-sm">
                                <div className="h-2 w-full bg-secondary/20 rounded-sm"></div>
                                <div className="flex gap-1 mt-2">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <div
                                      key={s}
                                      className="w-2 h-2 bg-secondary rounded-full"
                                    ></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {i === 3 && (
                            <div className="flex flex-col items-center">
                              <div className="h-12 w-full max-w-xs bg-success rounded shadow-lg flex items-center justify-center text-deep-dark font-black text-sm uppercase tracking-widest">
                                Konwertuj
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <div className="lg:w-2/5 order-1 lg:order-2">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-instagram/10 border border-instagram/20 text-instagram text-xs font-bold uppercase tracking-wider mb-6">
                  <Split size={14} /> {CONTENT.psychology.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  {CONTENT.psychology.title.line1}
                  <br />
                  <span className="text-instagram">{CONTENT.psychology.title.line2}</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {CONTENT.psychology.description}
                </p>

                <div className="space-y-4">
                  {anatomySteps.map((step, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setActiveStep(i)}
                      onMouseLeave={() => setActiveStep(null)}
                      onClick={() => setActiveStep(activeStep === i ? null : i)}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 group cursor-pointer ${
                        activeStep === i
                          ? 'bg-white/10 border-white/30 translate-x-2'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-lg font-mono border transition-all ${
                          activeStep === i
                            ? 'bg-white text-black border-transparent scale-110'
                            : 'bg-transparent text-white border-white/10'
                        }`}
                        style={
                          activeStep === i ? {} : { color: step.color, borderColor: step.color }
                        }
                      >
                        {step.step}
                      </div>
                      <div>
                        <h3
                          className={`font-bold text-sm mb-1 flex items-center gap-2 transition-colors ${
                            activeStep === i ? 'text-white' : 'text-gray-100'
                          }`}
                        >
                          {step.name}
                          <span
                            className={`text-xxs px-2 py-0.5 rounded font-mono transition-colors ${
                              activeStep === i ? 'bg-white text-black' : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {step.tech}
                          </span>
                        </h3>
                        <p
                          className={`text-xs leading-relaxed transition-colors ${
                            activeStep === i ? 'text-white' : 'text-gray-300'
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </SectionWrapper>
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
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={AlertTriangle}
        onClick={() => openModal('consultation', { specificType: 'landing' })}
        colorScheme="instagram"
        bgClassName="bg-instagram/5"
      />
    </div>
  );
};

export default LandingPage;
