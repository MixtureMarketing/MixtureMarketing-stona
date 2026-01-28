/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  ArrowRight,
  Target,
  MousePointerClick,
  TrendingUp,
  Filter,
  ShoppingBag,
  Settings,
  Award,
  ChevronDown,
  ShieldCheck,
  Tag,
  ShoppingCart,
  Briefcase,
  Store,
  Layers,
  Database,
  Cpu,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import { useModal } from '../../context/ModalContext';
import { useTypewriter } from '../../hooks/useTypewriter';
import { GOOGLE_ADS_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import AuditTeaser from '../features/audit/AuditTeaser';

const GoogleAds: React.FC = () => {
  // Hooks
  const navigate = useNavigate();
  const { openModal } = useModal();

  // Simulator State using custom hook
  const { displayText: typedText, isComplete: showResults } = useTypewriter(
    CONTENT.hero.simulator.placeholder,
    {
      speed: 60,
      delay: 600,
    },
  );

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  // Calculator State
  const [budget, setBudget] = useState(5000);
  const [cpc, setCpc] = useState(3.5);
  const [convRate, setConvRate] = useState(2.5); // %
  const [avgOrderValue, setAvgOrderValue] = useState(400); // PLN

  // Derived Metrics for Funnel
  const traffic = Math.floor(budget / cpc);
  const leads = Math.floor(traffic * (convRate / 100));
  const cpa = leads > 0 ? (budget / leads).toFixed(2) : 0;
  const potentialRevenue = leads * avgOrderValue;
  const roas = budget > 0 ? ((potentialRevenue / budget) * 100).toFixed(0) : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('google-ads').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('marketing', {
              specificType: 'ads',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const algorithmSteps = CONTENT.algorithm.steps.map((item, i) => {
    const icons = [
      <Database key="db" size={20} />,
      <Layers key="layers" size={20} />,
      <Cpu key="cpu" size={20} />,
      <TrendingUp key="trend" size={20} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-[#4285F4]/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image || '/assets/images/google-ads.png'}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: CONTENT.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        }}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-24 bg-[#F9FAFB] overflow-hidden">
        <AmbientBackground />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => navigate('/marketing/')}
            className="group flex items-center text-sm font-semibold text-gray-700 hover:text-secondary mb-8 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Wróć do Marketingu
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in border border-secondary/10">
                <ShieldCheck size={14} /> {CONTENT.hero.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-[1.1] animate-fade-in-up">
                {CONTENT.hero.title.line1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#34A853]">
                  {CONTENT.hero.title.line2}
                </span>
              </h1>

              <p
                className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                {CONTENT.hero.description}
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <Button
                  onClick={() => openModal('marketing', { specificType: 'ads' })}
                  icon={<ArrowRight size={18} />}
                >
                  {CONTENT.hero.cta}
                </Button>
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-full border border-gray-100 text-sm font-bold text-gray-600 shadow-sm cursor-default">
                  <TrendingUp size={16} className="text-[#34A853]" /> {CONTENT.hero.microCopy}
                </div>
              </div>

              <div
                className="mt-10 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up max-w-lg"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="bg-green-100 p-2.5 rounded-lg text-success shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="text-xxs font-bold text-gray-600 uppercase tracking-widest mb-1">
                    {CONTENT.hero.caseStudy.label}
                  </div>
                  <div
                    className="text-sm text-dark leading-snug"
                    dangerouslySetInnerHTML={{ __html: CONTENT.hero.caseStudy.desc }}
                  />
                </div>
              </div>
            </div>

            <div
              className="lg:w-1/2 w-full relative animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(66,133,244,0.2)] border border-gray-200 p-2 max-w-lg mx-auto transform rotate-1 hover:rotate-0 transition-all duration-500">
                <div className="bg-[#F1F3F4] rounded-t-xl px-4 py-3 flex items-center gap-4 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-full h-8 px-4 flex items-center text-sm text-gray-600 shadow-sm relative overflow-hidden">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                      alt="G"
                      className="h-3 mr-3"
                    />
                    <span className="truncate">{typedText}</span>
                    <span className="w-0.5 h-4 bg-[#4285F4] ml-0.5 animate-pulse"></span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-white rounded-b-xl min-h-[320px]">
                  {showResults ? (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="p-4 rounded-xl bg-white border border-[#4285F4] shadow-[0_4px_20px_-5px_rgba(66,133,244,0.15)] relative overflow-hidden group cursor-pointer transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#4285F4]"></div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-dark text-[11px]">
                            {CONTENT.hero.simulator.ad.label}
                          </span>
                          <span className="text-gray-600 text-xxs">•</span>
                          <div className="flex items-center gap-1 text-gray-700 text-[11px]">
                            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                            <span>twoja-firma.pl</span>
                          </div>
                        </div>
                        <h3 className="text-[#1a0dab] text-lg font-medium group-hover:underline leading-snug mb-2">
                          {CONTENT.hero.simulator.ad.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                          {CONTENT.hero.simulator.ad.desc}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {CONTENT.hero.simulator.ad.links.map((link, i) => (
                            <span
                              key={i}
                              className="text-[#1a0dab] text-xs hover:underline cursor-pointer bg-[#F1F3F4] px-3 py-1.5 rounded-full font-medium hover:bg-[#E8F0FE]"
                            >
                              {link}
                            </span>
                          ))}
                        </div>

                        <div className="absolute bottom-4 right-8 pointer-events-none animate-bounce hidden sm:block drop-shadow-xl">
                          <MousePointerClick size={28} className="text-dark fill-white" />
                        </div>
                      </div>

                      <div className="px-2 opacity-30 blur-[2px] grayscale select-none pointer-events-none">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          <div className="w-32 h-3 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-64 h-4 bg-gray-400 rounded mb-2"></div>
                        <div className="w-full h-12 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 opacity-20">
                      <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-[#4285F4] animate-spin mb-4"></div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Wyszukiwanie...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AUDIT TEASER --- */}
      <div className="relative z-30 max-w-4xl mx-auto -mt-12 px-4">
        <AuditTeaser
          variant="glass"
          colorScheme="blue"
          buttonText="Audyt Konta Ads"
          placeholder="Adres Twojej strony..."
        />
      </div>

      {/* --- DIAGNOSIS --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.painPoints.title}
            description={CONTENT.painPoints.description}
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CONTENT.painPoints.items.map((item, i) => {
              const icons = [
                <Filter key="filter" size={32} className="text-red-500" />,
                <Target key="target" size={32} className="text-red-500" />,
                <Award key="award" size={32} className="text-red-500" />,
              ];
              return (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="bg-[#FFF5F5] border border-red-100 p-8 rounded-2xl h-full hover:shadow-lg transition-all hover:-translate-y-1 group">
                    <div className="mb-6 bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      {icons[i]}
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- INDUSTRY STRATEGY --- */}
      <section className="py-24 bg-[#F9FAFB] relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title={CONTENT.industries.title}
            description={CONTENT.industries.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <AnimateOnScroll className="h-full">
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg h-full flex flex-col hover:border-[#4285F4] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Briefcase size={120} className="text-[#4285F4]" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#4285F4]">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-dark">
                      {CONTENT.industries.services.title}
                    </h3>
                    <p className="text-sm text-gray-700 font-bold uppercase tracking-wider">
                      {CONTENT.industries.services.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {CONTENT.industries.services.desc}
                </p>
                <ul className="space-y-4 mb-8 flex-grow">
                  {CONTENT.industries.services.features.map((feat, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={18} className="text-[#4285F4] mt-0.5 shrink-0" />
                      <span
                        className="text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ __html: feat }}
                      />
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  onClick={() => openModal('marketing', { specificType: 'ads' })}
                >
                  {CONTENT.industries.services.cta}
                </Button>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100} className="h-full">
              <div className="bg-white rounded-3xl p-8 border-2 border-[#34A853]/20 shadow-xl h-full flex flex-col hover:border-[#34A853] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Store size={120} className="text-[#34A853]" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-[#34A853]">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-dark">
                      {CONTENT.industries.ecommerce.title}
                    </h3>
                    <p className="text-sm text-gray-700 font-bold uppercase tracking-wider">
                      {CONTENT.industries.ecommerce.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {CONTENT.industries.ecommerce.desc}
                </p>
                <ul className="space-y-4 mb-8 flex-grow">
                  {CONTENT.industries.ecommerce.features.map((feat, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={18} className="text-[#34A853] mt-0.5 shrink-0" />
                      <span
                        className="text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ __html: feat }}
                      />
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  onClick={() => openModal('marketing', { specificType: 'ads' })}
                  className="!bg-[#34A853] hover:!bg-[#2E8B46] border-none"
                >
                  {CONTENT.industries.ecommerce.cta}
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* --- CALCULATOR --- */}
      <section className="py-24 bg-white relative z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.calculator.title}
            description={CONTENT.calculator.description}
            className="mb-12"
          />

          <div className="bg-[#F9FAFB] rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
                <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-2">
                  <Settings size={20} className="text-primary" /> Parametry Kampanii
                </h3>

                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-dark mb-2">
                      <label id="budget-label">{CONTENT.calculator.labels.budget}</label>
                      <span className="text-[#34A853] bg-[#34A853]/10 px-3 py-1 rounded-md border border-[#34A853]/20">
                        {budget} PLN
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#34A853]"
                      aria-labelledby="budget-label"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {CONTENT.calculator.labels.budgetDesc}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold text-dark mb-2">
                      <label id="cpc-label">{CONTENT.calculator.labels.cpc}</label>
                      <span className="text-[#4285F4] bg-[#4285F4]/10 px-3 py-1 rounded-md border border-[#4285F4]/20">
                        {cpc} PLN
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="15"
                      step="0.1"
                      value={cpc}
                      onChange={(e) => setCpc(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4285F4]"
                      aria-labelledby="cpc-label"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {CONTENT.calculator.labels.cpcDesc}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold text-dark mb-2">
                      <label id="cr-label">{CONTENT.calculator.labels.cr}</label>
                      <span className="text-[#EA4335] bg-[#EA4335]/10 px-3 py-1 rounded-md border border-[#EA4335]/20">
                        {convRate}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={convRate}
                      onChange={(e) => setConvRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EA4335]"
                      aria-labelledby="cr-label"
                    />
                    <p className="text-xs text-gray-600 mt-2">{CONTENT.calculator.labels.crDesc}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold text-dark mb-2">
                      <label id="aov-label">{CONTENT.calculator.labels.aov}</label>
                      <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                        {avgOrderValue} PLN
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      step="50"
                      value={avgOrderValue}
                      onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                      aria-labelledby="aov-label"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 p-8 bg-[#F9FAFB] flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                      {CONTENT.calculator.labels.traffic}
                    </div>
                    <div className="text-2xl font-black text-[#4285F4] flex items-center gap-2">
                      {traffic.toLocaleString()} <MousePointerClick size={16} />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                      {CONTENT.calculator.labels.leads}
                    </div>
                    <div className="text-2xl font-black text-dark flex items-center gap-2">
                      {leads.toLocaleString()} <ShoppingBag size={16} />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                      {CONTENT.calculator.labels.cpa}
                    </div>
                    <div className="text-2xl font-black text-[#EA4335]">{cpa} PLN</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                      {CONTENT.calculator.labels.roas}
                    </div>
                    <div className="text-2xl font-black text-[#34A853]">{roas}%</div>
                  </div>
                </div>

                <div className="bg-dark text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
                      {CONTENT.calculator.labels.revenue}
                    </div>
                    <div className="text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                      {potentialRevenue.toLocaleString()}{' '}
                      <span className="text-2xl text-gray-600">PLN</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold text-gray-300">
                      <TrendingUp size={14} className="text-success" />
                      {CONTENT.calculator.labels.profit}:{' '}
                      {(potentialRevenue - budget).toLocaleString()} PLN
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ALGORITHM --- */}
      <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title={CONTENT.algorithm.title}
            subtitle={CONTENT.algorithm.subtitle}
            description={CONTENT.algorithm.description}
            lightMode
            className="mb-16"
          />

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-[#1E293B] -translate-y-1/2 z-0"></div>
            <div
              className="hidden lg:block absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#4285F4] to-[#34A853] -translate-y-1/2 z-0 animate-width-grow"
              style={{ width: '100%', animationDuration: '3s' }}
            ></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {algorithmSteps.map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 150} className="relative z-10">
                  <div className="group bg-[#1E293B] rounded-2xl p-6 border border-[#334155] hover:border-[#4285F4] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(66,133,244,0.15)] flex flex-col h-full">
                    <div className="absolute -top-4 -right-4 text-6xl font-black text-white opacity-5 select-none transition-opacity group-hover:opacity-10">
                      {item.step}
                    </div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#0B1120] flex items-center justify-center text-[#4285F4] border border-[#334155] group-hover:scale-110 transition-transform shadow-lg">
                        {item.icon}
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#4285F4]/10 px-2 py-1 rounded text-xxs font-bold text-[#4285F4] border border-[#4285F4]/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-pulse"></div>
                        {item.status}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#4285F4] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6 flex-grow">
                      {item.desc}
                    </p>

                    <div className="mt-auto bg-[#0B1120] rounded-lg p-3 font-mono text-xxs text-gray-300 border border-[#334155] flex items-center gap-2 overflow-hidden">
                      <Terminal size={12} className="text-[#34A853] shrink-0" />
                      <span className="truncate group-hover:text-[#34A853] transition-colors">
                        {item.cmd}
                      </span>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      {pricingData && (
        <PricingTable
          title={pricingData.title}
          description={pricingData.description}
          tiers={pricingData.tiers}
        />
      )}

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Pytania o Google Ads" className="mb-12" />

          <div className="space-y-4" role="region" aria-label="FAQ">
            {CONTENT.faqs.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'bg-white border-primary shadow-md' : 'bg-white border-gray-200 hover:border-primary/50'}`}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span
                    className={`font-bold text-base md:text-lg pr-4 transition-colors ${openFaq === i ? 'text-secondary' : 'text-dark'}`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-secondary text-white rotate-180' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100/50 bg-gray-50/50">
                    <div className="flex gap-3">
                      <div className="w-0.5 min-h-full bg-primary"></div>
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-blue-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block p-4 rounded-full bg-white border border-[#4285F4]/10 mb-6 shadow-sm animate-pulse">
            <Target size={32} className="text-[#4285F4]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
            {CONTENT.ctaAudit.title}
          </h2>
          <p className="text-xl text-gray-600 mb-10">{CONTENT.ctaAudit.description}</p>

          <Button
            onClick={() => openModal('audit', { specificType: 'ads' })}
            variant="primary"
            size="lg"
          >
            {CONTENT.ctaAudit.button}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default GoogleAds;
