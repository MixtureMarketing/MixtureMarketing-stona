import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  MousePointerClick,
  BarChart3,
  CheckCircle2,
  Zap,
  Split,
  Magnet,
  Smartphone,
  Database,
  Rocket,
  Play,
  Gauge,
  AlertTriangle,
  Calculator,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import IntegrationGrid, { IntegrationCategory } from '../common/IntegrationGrid';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { useModal } from '../../context/ModalContext';
import { LANDING_PAGE_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import StandardCta from '../common/StandardCta';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [loadTime, setLoadTime] = useState(0.8);
  const [conversionDrop, setConversionDrop] = useState(0);
  const [score, setScore] = useState(98);

  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch pricing from Sanity and inject modal actions
    cmsService.getPricingSection('landing-page').then((data) => {
      if (data) {
        // Inject onCtaClick handler for each tier
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'landing',
              package: tier.title, // Pass the package name
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  useEffect(() => {
    if (loadTime <= 1) {
      setConversionDrop(0);
      setScore(Math.max(90, 100 - loadTime * 5));
    } else {
      const drop = Math.min((loadTime - 1) * 7, 100);
      setConversionDrop(Math.round(drop * 10) / 10);
      setScore(Math.max(0, 90 - (loadTime - 1) * 20));
    }
  }, [loadTime]);

  const getScoreColor = (s: number) => {
    if (s >= 90) return '#00C853';
    if (s >= 50) return '#FFA000';
    return '#FF5252';
  };

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
      <section className="relative py-24 lg:py-32 bg-[#F9FAFB] overflow-hidden">
        <AmbientBackground />

        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="lg:w-1/2 text-center lg:text-left">
              <button
                onClick={() => navigate('/web-development/')}
                className="group inline-flex items-center text-xxs font-bold text-gray-600 hover:text-secondary mb-8 transition-colors uppercase tracking-[0.2em] border border-gray-200 rounded-full px-3 py-1 bg-white hover:border-secondary"
              >
                <ArrowLeft
                  className="mr-2 group-hover:-translate-x-1 transition-transform"
                  size={12}
                />
                Web Development
              </button>

              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-secondary text-xxs font-black uppercase tracking-widest mb-6 border border-secondary/10">
                  <MousePointerClick size={12} /> {CONTENT.hero.badge}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-dark mb-6 leading-[1.1] tracking-tight">
                  {CONTENT.hero.title.line1} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-[#E1306C]">
                    {CONTENT.hero.title.line2}
                  </span>
                </h1>

                <p className="text-xl text-gray-700 mb-10 leading-relaxed font-medium">
                  {CONTENT.hero.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={() => openModal('web', { specificType: 'landing' })}
                    size="lg"
                    className="shadow-xl shadow-secondary/20"
                  >
                    Umów się na konsultację
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/offers#calculator?type=landingPage')}
                    icon={<Calculator size={18} />}
                  >
                    Wyceń stronę
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="lg:w-1/2 w-full relative animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative z-10 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 p-8 md:p-10 max-w-lg mx-auto transform transition-all hover:scale-[1.01] duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-dark flex items-center gap-2">
                    <Gauge size={20} className="text-instagram" />
                    {CONTENT.hero.simulator.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xxs font-bold uppercase tracking-wider text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live
                    Check
                  </div>
                </div>

                <div className="flex justify-center mb-10 relative">
                  <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="88"
                      fill="none"
                      stroke="#F3F4F6"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="88"
                      fill="none"
                      stroke={getScoreColor(Math.round(score))}
                      strokeWidth="12"
                      strokeDasharray={552}
                      strokeDashoffset={552 - (552 * Math.round(score)) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-4xl font-black tracking-tighter leading-none transition-colors duration-300"
                      style={{ color: getScoreColor(Math.round(score)) }}
                    >
                      {Math.round(score)}
                    </span>
                    <span className="text-xs font-bold text-gray-600 uppercase mt-2 tracking-widest">
                      {CONTENT.hero.simulator.labels.score}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <div className="text-xxs text-gray-600 uppercase font-bold mb-1">
                      {CONTENT.hero.simulator.labels.loadTime}
                    </div>
                    <div className="text-xl font-black text-dark">{loadTime.toFixed(1)}s</div>
                  </div>
                  <div
                    className={`p-4 rounded-2xl border text-center transition-colors duration-300 ${conversionDrop > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
                  >
                    <div className="text-xxs uppercase font-bold mb-1 flex items-center justify-center gap-1">
                      {conversionDrop > 0 ? (
                        <AlertTriangle size={12} className="text-red-500" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 size={12} className="text-green-500" aria-hidden="true" />
                      )}
                      <span className={conversionDrop > 0 ? 'text-red-600' : 'text-green-600'}>
                        {CONTENT.hero.simulator.labels.conversionLoss}
                      </span>
                    </div>
                    <div
                      className={`text-xl font-black ${conversionDrop > 0 ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {conversionDrop > 0 ? `-${conversionDrop}%` : '0%'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>{CONTENT.hero.simulator.labels.fast}</span>
                    <span>{CONTENT.hero.simulator.labels.slow}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={loadTime}
                    onChange={(e) => setLoadTime(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#213261]"
                    aria-label="Symulacja: Dostosuj czas ładowania strony"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- USE CASES --- */}
      <LazyHydrate minHeight="600px">
        <section className="py-24 bg-white relative z-10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </section>
      </LazyHydrate>

      {/* --- PSYCHOLOGY --- */}
      <LazyHydrate minHeight="800px">
        <section id="anatomy" className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
              <div className="lg:w-3/5 w-full flex justify-center lg:justify-start order-2 lg:order-1">
                <AnimateOnScroll delay={200} className="w-full">
                  <div className="relative w-full max-w-xl mx-auto bg-[#0F172A] rounded-md border-2 border-[#1E293B] p-2 shadow-2xl">
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

                    <div className="bg-[#0B1120] p-6 space-y-6 relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: 'radial-gradient(#61B6DE 1px, transparent 1px)',
                          backgroundSize: '10px 10px',
                        }}
                      ></div>

                      <div
                        onMouseEnter={() => setActiveStep(0)}
                        onMouseLeave={() => setActiveStep(null)}
                        className={`relative border border-dashed border-instagram bg-instagram/5 p-6 rounded transition-all duration-300 cursor-pointer ${
                          activeStep === 0
                            ? 'ring-2 ring-[#E1306C] bg-instagram/10 scale-[1.02] shadow-[0_0_30px_rgba(225,48,108,0.2)] z-10'
                            : activeStep !== null
                              ? 'opacity-30 blur-[1px]'
                              : ''
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-instagram text-white text-xxs font-bold px-2 py-0.5">
                          ATTENTION
                        </div>
                        <div className="flex gap-4">
                          <div className="w-2/3 space-y-2">
                            <div className="h-6 w-full bg-instagram/40 rounded-sm"></div>
                            <div className="h-6 w-3/4 bg-instagram/40 rounded-sm"></div>
                            <div className="h-3 w-full bg-instagram/20 mt-4 rounded-sm"></div>
                            <div className="h-3 w-5/6 bg-instagram/20 rounded-sm"></div>
                            <div className="h-8 w-32 bg-instagram mt-4 rounded flex items-center justify-center text-xxs font-bold text-white shadow-lg">
                              CTA
                            </div>
                          </div>
                          <div className="w-1/3 bg-instagram/10 border border-instagram/30 flex items-center justify-center text-instagram text-xs">
                            Hero Img
                          </div>
                        </div>
                      </div>

                      <div
                        onMouseEnter={() => setActiveStep(1)}
                        onMouseLeave={() => setActiveStep(null)}
                        className={`relative border border-dashed border-primary bg-primary/5 p-6 rounded transition-all duration-300 cursor-pointer ${
                          activeStep === 1
                            ? 'ring-2 ring-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_rgba(97,182,222,0.2)] z-10'
                            : activeStep !== null
                              ? 'opacity-30 blur-[1px]'
                              : ''
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-primary text-[#0B1120] text-xxs font-bold px-2 py-0.5">
                          INTEREST
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col gap-2">
                              <div className="h-12 bg-primary/20 rounded w-full"></div>
                              <div className="h-2 w-full bg-primary/20 rounded-sm"></div>
                              <div className="h-2 w-2/3 bg-primary/20 rounded-sm"></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        onMouseEnter={() => setActiveStep(2)}
                        onMouseLeave={() => setActiveStep(null)}
                        className={`relative border border-dashed border-secondary bg-secondary/5 p-6 rounded transition-all duration-300 cursor-pointer ${
                          activeStep === 2
                            ? 'ring-2 ring-secondary bg-secondary/10 scale-[1.02] shadow-[0_0_30px_rgba(63,61,145,0.3)] z-10'
                            : activeStep !== null
                              ? 'opacity-30 blur-[1px]'
                              : ''
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-secondary text-white text-xxs font-bold px-2 py-0.5">
                          DESIRE
                        </div>
                        <div className="flex gap-4 items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-secondary/40 border-2 border-secondary shrink-0"></div>
                          <div className="space-y-2 w-full max-w-sm">
                            <div className="h-2 w-full bg-secondary/20 rounded-sm"></div>
                            <div className="h-2 w-5/6 bg-secondary/20 rounded-sm"></div>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className="w-3 h-3 bg-secondary rounded-full"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        onMouseEnter={() => setActiveStep(3)}
                        onMouseLeave={() => setActiveStep(null)}
                        className={`relative border border-success bg-success/5 p-6 rounded flex justify-center items-center flex-col transition-all duration-300 cursor-pointer ${
                          activeStep === 3
                            ? 'ring-2 ring-[#00C853] bg-success/10 scale-[1.02] shadow-[0_0_30px_rgba(0,200,83,0.3)] z-10'
                            : activeStep !== null
                              ? 'opacity-30 blur-[1px]'
                              : ''
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-success text-[#0B1120] text-xxs font-bold px-2 py-0.5">
                          ACTION
                        </div>
                        <div className="h-14 w-full max-w-sm bg-success rounded-lg shadow-[0_0_20px_rgba(0,200,83,0.4)] animate-pulse flex items-center justify-center text-[#0B1120] font-black text-lg uppercase tracking-widest border-2 border-white/20">
                          Odbierz Bonus
                        </div>
                        <div className="mt-3 text-xxs text-success/60 font-mono">
                          Gwarancja Satysfakcji 100%
                        </div>
                      </div>
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
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 group cursor-default ${
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
                                activeStep === i
                                  ? 'bg-white text-black'
                                  : 'bg-white/10 text-gray-300'
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
          </div>
        </section>
      </LazyHydrate>

      {/* --- INTEGRATIONS --- */}
      <LazyHydrate minHeight="400px">
        <section className="py-16 md:py-24 bg-[#F9FAFB] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <SectionHeader
              title={CONTENT.integrations.title}
              description={CONTENT.integrations.description}
              className="mb-16"
            />

            <IntegrationGrid categories={integrationCategories} />
          </div>
        </section>
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
