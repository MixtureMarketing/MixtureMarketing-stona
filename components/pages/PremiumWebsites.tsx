import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Zap,
  Globe,
  Smartphone,
  Edit3,
  ArrowRight,
  MousePointerClick,
  ShoppingCart,
  Database,
  Building2,
  Rocket,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import TechSeparator from '../common/TechSeparator';
import { PREMIUM_WEBSITES_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData } from '../../types';

interface PremiumWebsitesProps {
  onBack: () => void;
  onContactClick: () => void;
}

const PremiumWebsites: React.FC<PremiumWebsitesProps> = ({ onBack, onContactClick }) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [metrics, setMetrics] = useState({ perf: 0, acc: 0, bp: 0, seo: 0 });
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('premium-websites').then((data) => {
      if (data) {
        setPricingData(data);
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        perf: Math.min(prev.perf + 2, 98),
        acc: Math.min(prev.acc + 2, 100),
        bp: Math.min(prev.bp + 2, 100),
        seo: Math.min(prev.seo + 2, 100),
      }));
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const subCategories = CONTENT.subCategories.items.map((cat, i) => {
    const icons = [
      <Rocket key="rocket" size={24} />,
      <Building2 key="bldg" size={24} />,
      <ShoppingCart key="cart" size={24} />,
      <Database key="db" size={24} />,
    ];
    return { ...cat, icon: icons[i] };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={onBack}
            className="group flex items-center text-sm font-semibold text-gray-700 hover:text-secondary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Powrót do menu
          </button>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
                <Zap size={14} fill="currentColor" /> {CONTENT.hero.badge}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-tight animate-fade-in-up">
                {CONTENT.hero.title.line1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
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
                <Button onClick={onContactClick} icon={<ArrowRight size={18} />}>
                  {CONTENT.hero.ctaPrimary}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  {CONTENT.hero.ctaSecondary}
                </Button>
              </div>
            </div>

            <div
              className="lg:w-1/2 relative animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 aspect-[16/10] relative group">
                  <div className="h-8 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 w-64 h-4 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="w-1/3 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex gap-4">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-full h-48 bg-gradient-to-br from-[#E0EFFF] to-white rounded-xl border border-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Globe className="text-primary" />
                        </div>
                        <div className="w-48 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded mx-auto"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6 bg-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary" />
                    Pixel Perfect
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-2xl transform translate-x-4 translate-y-4 -z-10 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SUBCATEGORIES --- */}
      <section id="categories" className="py-24 bg-white relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.subCategories.title}
            description={CONTENT.subCategories.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subCategories.map((cat, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 100} className="h-full">
                <GlassCard className="p-6 h-full flex flex-col hover:border-primary transition-colors relative overflow-hidden group">
                  {cat.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-xxs font-bold px-3 py-1 rounded-bl-lg z-10">
                      POPULARNE
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{cat.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6 flex-grow">{cat.desc}</p>
                  <div className="space-y-2 mb-6">
                    {cat.tags.map((tag, tIdx) => (
                      <div
                        key={tIdx}
                        className="flex items-center text-xs font-medium text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                        {tag}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={onContactClick}
                  >
                    Wybierz
                  </Button>
                </GlassCard>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- PERFORMANCE METRICS --- */}
      <section id="performance" className="py-20 bg-[#F9FAFB]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.performance.title}
            description={CONTENT.performance.description}
            className="mb-16"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: CONTENT.performance.metrics[0], value: metrics.perf, color: '#00CC66' },
              { label: CONTENT.performance.metrics[1], value: metrics.acc, color: '#00CC66' },
              { label: CONTENT.performance.metrics[2], value: metrics.bp, color: '#00CC66' },
              { label: CONTENT.performance.metrics[3], value: metrics.seo, color: '#00CC66' },
            ].map((metric, index) => (
              <AnimateOnScroll key={index} delay={index * 100}>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke={metric.color}
                        strokeWidth="8"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * metric.value) / 100}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-black text-dark">
                        {Math.round(metric.value)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-600 uppercase tracking-wide text-sm">
                    {metric.label}
                  </h3>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <TechSeparator />

      {/* --- CMS PREVIEW --- */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-dark text-xs font-bold uppercase tracking-wider mb-6">
                  <Edit3 size={14} /> {CONTENT.cms.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
                  {CONTENT.cms.title.line1}
                  <br />
                  {CONTENT.cms.title.line2}
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {CONTENT.cms.description}
                </p>

                <div className="space-y-4">
                  {CONTENT.cms.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-secondary">
                        {i === 0 ? <MousePointerClick size={20} /> : <Smartphone size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-dark">{feature.title}</h3>
                        <p className="text-sm text-gray-700">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            <div className="lg:w-1/2 w-full">
              <AnimateOnScroll delay={200}>
                <div className="bg-dark rounded-2xl p-2 shadow-2xl">
                  <div className="bg-gray-900 rounded-xl overflow-hidden relative">
                    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex bg-gray-700 rounded p-1 text-xs">
                        <button
                          onClick={() => setActiveTab('editor')}
                          className={`px-3 py-1 rounded transition-colors ${activeTab === 'editor' ? 'bg-primary text-white' : 'text-gray-600'}`}
                        >
                          {CONTENT.cms.labels.editor}
                        </button>
                        <button
                          onClick={() => setActiveTab('preview')}
                          className={`px-3 py-1 rounded transition-colors ${activeTab === 'preview' ? 'bg-primary text-white' : 'text-gray-600'}`}
                        >
                          {CONTENT.cms.labels.preview}
                        </button>
                      </div>
                    </div>

                    <div className="h-80 p-8 flex items-center justify-center bg-white transition-opacity duration-300">
                      {activeTab === 'editor' ? (
                        <div className="w-full space-y-4 animate-fade-in">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">
                              {CONTENT.cms.labels.labelH1}
                            </label>
                            <div className="w-full p-3 border-2 border-primary rounded bg-white text-dark font-bold">
                              Zmieniam tekst w 5 sekund|
                            </div>
                          </div>
                          <div className="space-y-1 opacity-50">
                            <label className="text-xs font-bold text-gray-600 uppercase">
                              {CONTENT.cms.labels.labelDesc}
                            </label>
                            <div className="w-full p-3 border border-gray-200 rounded bg-gray-50 text-gray-600">
                              {CONTENT.cms.labels.placeholderDesc}
                            </div>
                          </div>
                          <div className="pt-2">
                            <button className="bg-dark text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                              <CheckCircle2 size={14} /> {CONTENT.cms.labels.save}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center animate-fade-in">
                          <h2 className="text-3xl font-extrabold text-dark mb-4">
                            Zmieniam tekst w 5 sekund
                          </h2>
                          <p className="text-gray-700 mb-6">{CONTENT.cms.labels.placeholderDesc}</p>
                          <button className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg">
                            Sprawdź ofertę
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
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

      {/* --- COMPARISON --- */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.comparison.title}
            description={CONTENT.comparison.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <AnimateOnScroll>
              <div className="p-8 rounded-3xl border border-gray-100 bg-white opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-700">
                    {CONTENT.comparison.cheap.title}
                  </h3>
                  <XCircle className="text-red-400" size={32} />
                </div>
                <ul className="space-y-4">
                  {CONTENT.comparison.cheap.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <XCircle size={18} className="shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <div className="p-8 rounded-3xl border-2 border-primary bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  REKOMENDOWANE
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-dark">
                    {CONTENT.comparison.premium.title}
                  </h3>
                  <CheckCircle2 className="text-primary" size={32} />
                </div>
                <ul className="space-y-4">
                  {CONTENT.comparison.premium.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-dark font-medium">
                      <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            {CONTENT.cta.title.line1} <br />
            <span className="text-primary">{CONTENT.cta.title.line2}</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">{CONTENT.cta.description}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={onContactClick} variant="white" size="lg">
              {CONTENT.cta.buttonPrimary}
            </Button>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-dark"
              onClick={onBack}
            >
              {CONTENT.cta.buttonSecondary}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PremiumWebsites;
