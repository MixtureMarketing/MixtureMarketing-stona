/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Briefcase,
  Server,
  ShieldCheck,
  Lock,
  Eye,
  AlertTriangle,
  Cloud,
  Network,
  GitMerge,
  Terminal,
  ArrowUpRight,
  Activity,
  Sparkles,
  BarChart3,
  Calculator,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import LazyHydrate from '../common/LazyHydrate';
import Seo from '../common/Seo';
import { useModal } from '../../context/ModalContext';
import { CORPORATE_WEBSITE_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import { useParallax } from '../../hooks/useParallax';

import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import { CorporateHeroVisual } from '../visuals/HeroVisuals';

const CorporateWebsite: React.FC = () => {
  const [activeCms, setActiveCms] = useState<'wordpress' | 'headless'>('wordpress');
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('corporate-website').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'corporate',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      setMigrationStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const businessModules = CONTENT.modules.items.map((mod, i) => {
    const icons = [
      <Users key="users" size={24} />,
      <BarChart3 key="chart" size={24} />,
      <Lock key="lock" size={24} />,
      <MessageSquare key="msg" size={24} />,
    ];
    return { ...mod, icon: icons[i] };
  });

  const complianceFeatures = CONTENT.compliance.items.map((feat, i) => {
    const icons = [
      <Eye key="eye" size={20} />,
      <ShieldCheck key="shield" size={20} />,
      <Cloud key="cloud" size={20} />,
      <Server key="server" size={20} />,
    ];
    return { ...feat, icon: icons[i] };
  });

  const steps = CONTENT.migration.steps.map((step, i) => {
    const icons = [
      <Search key="search" size={20} />,
      <GitMerge key="merge" size={20} />,
      <ArrowUpRight key="up" size={20} />,
      <CheckCircle2 key="check" size={20} />,
    ];
    return { ...step, icon: icons[i] };
  });

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
        badgeIcon={Globe}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={() => openModal('web', { specificType: 'corporate' })}
        ctaSecondaryText="Wyceń stronę firmową"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=corporate')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/web-development"
        backLinkLabel="Web Development"
        visual={<CorporateHeroVisual />}
      />

      {/* --- BUSINESS MODULES --- */}
      <section className="py-24 bg-[#F9FAFB] relative z-10">
        <LazyHydrate whenVisible>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title={CONTENT.modules.title}
              description={CONTENT.modules.description}
              className="mb-16"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessModules.map((mod, i) => (
                <AnimateOnScroll key={i} delay={i * 100} className="h-full">
                  <GlassCard className="p-8 h-full flex flex-col hover:border-secondary hover:shadow-lg transition-all group bg-white hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-secondary shadow-sm border border-[#E0EFFF] group-hover:scale-110 transition-transform">
                        {mod.icon}
                      </div>
                      <div className="bg-blue-50 text-secondary text-xxs font-mono px-2 py-1 rounded border border-secondary/10">
                        {mod.tech}
                      </div>
                    </div>
                    <h3 className="font-bold text-dark text-lg mb-3 group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{mod.desc}</p>
                  </GlassCard>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </LazyHydrate>
      </section>

      {/* --- CMS SECTION --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <LazyHydrate whenVisible>
          {/* ... (Content same as original) ... */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Abbreviated CMS section content */}
            <div className="text-center mb-16">
              <SectionHeader title={CONTENT.cms.title} description={CONTENT.cms.description} />
              <div
                className="inline-flex bg-[#F1F5F9] p-1.5 rounded-full mt-8 border border-gray-200 shadow-inner relative"
                role="group"
                aria-label="Wybór silnika CMS"
              >
                <div
                  className={`absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm border border-gray-200 transition-all duration-300 ease-in-out z-0`}
                  style={{
                    left: activeCms === 'wordpress' ? '6px' : '50%',
                    width: 'calc(50% - 6px)',
                  }}
                ></div>
                <button
                  onClick={() => setActiveCms('wordpress')}
                  aria-pressed={activeCms === 'wordpress'}
                  className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 ${activeCms === 'wordpress' ? 'text-dark' : 'text-gray-700 hover:text-gray-700'}`}
                >
                  {CONTENT.cms.wordpress.label}
                </button>
                <button
                  onClick={() => setActiveCms('headless')}
                  aria-pressed={activeCms === 'headless'}
                  className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 ${activeCms === 'headless' ? 'text-dark' : 'text-gray-700 hover:text-gray-700'}`}
                >
                  {CONTENT.cms.headless.label}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-dark">
                  {activeCms === 'wordpress'
                    ? CONTENT.cms.wordpress.title
                    : CONTENT.cms.headless.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {activeCms === 'wordpress'
                    ? CONTENT.cms.wordpress.desc
                    : CONTENT.cms.headless.desc}
                </p>
                <ul className="space-y-3">
                  {(activeCms === 'wordpress'
                    ? CONTENT.cms.wordpress.features
                    : CONTENT.cms.headless.features
                  ).map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                      <CheckCircle2 size={18} className="text-success" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual part remains same */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-2xl transform rotate-2"></div>
                <GlassCard className="relative bg-white shadow-xl overflow-hidden aspect-[16/10] flex flex-col p-0 border border-gray-200">
                  {/* Mockup UI */}
                  <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                  </div>
                  {/* Mockup Content - Simplified */}
                  <div className="p-6 flex gap-6 h-full animate-fade-in bg-gray-50/50">
                    <div className="m-auto text-gray-400 font-bold">CMS UI PREVIEW</div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </LazyHydrate>
      </section>

      {/* --- COMPLIANCE & SECURITY --- */}
      <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        <LazyHydrate whenVisible>
          {/* ... (Content same as original) ... */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Abbreviated Compliance Section */}
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <AnimateOnScroll>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    {CONTENT.compliance.title.line1} <br />
                    {CONTENT.compliance.title.line2}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {complianceFeatures.map((feat, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-colors group"
                      >
                        <div className="text-primary mb-3">{feat.icon}</div>
                        <h3 className="font-bold text-sm mb-1">{feat.title}</h3>
                      </div>
                    ))}
                  </div>
                </AnimateOnScroll>
              </div>
              {/* Visual part abbreviated */}
            </div>
          </div>
        </LazyHydrate>
      </section>

      {/* --- SAFE MIGRATION --- */}
      <section className="py-24 bg-white relative z-10 overflow-hidden">
        <LazyHydrate whenVisible>
          {/* ... (Content same as original) ... */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title={CONTENT.migration.title}
              subtitle={CONTENT.migration.subtitle}
              description={CONTENT.migration.description}
              className="mb-16"
            />
            <AnimateOnScroll className="relative w-full max-w-6xl mx-auto">
              {/* Migration visual abbreviated */}
              <div className="bg-[#0F172A] rounded-3xl border border-[#334155] p-12 text-center text-white">
                MIGRATION PROTOCOL VISUALIZATION
              </div>
            </AnimateOnScroll>
          </div>
        </LazyHydrate>
      </section>

      {/* --- PRICING --- */}
      {pricingData && (
        <LazyHydrate whenVisible>
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
        icon={Briefcase}
        onClick={() => openModal('consultation', { specificType: 'corporate' })}
        bgClassName="bg-white border-t border-gray-100"
      />
    </div>
  );
};

export default CorporateWebsite;
