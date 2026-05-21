import React, { useEffect, useState } from 'react';
import {
  Globe,
  Users,
  Search,
  CheckCircle2,
  MessageSquare,
  GitMerge,
  ArrowUpRight,
  BarChart3,
  Calculator,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import GlassCard from '../common/GlassCard';
import LazyHydrate from '../common/LazyHydrate';
import Seo from '../common/Seo';
import { useModal } from '../../context/ModalContext';
import { CORPORATE_WEBSITE_CONTENT as CONTENT } from '../../data/content/services/web-development/corporate';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';

import StandardHero from '../common/StandardHero';
import BaseCta from '../common/BaseCta';
import { CorporateHeroVisual } from '../visuals/hero/CorporateVisual';
import SectionWrapper from '../common/SectionWrapper';
import CorporateCmsComparison from '../features/web-development/CorporateCmsComparison';
import CorporateSecurity from '../features/web-development/CorporateSecurity';

const CorporateWebsite: React.FC = () => {
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

  const businessModules = CONTENT.modules.items.map((mod, i) => {
    const icons = [
      <Users key="users" size={24} />,
      <BarChart3 key="chart" size={24} />,
      <Lock key="lock" size={24} />,
      <MessageSquare key="msg" size={24} />,
    ];
    return { ...mod, icon: icons[i] };
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
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Strony korporacyjne', item: '/web-development/corporate/' },
        ]}
        service={{
          name: 'Strony korporacyjne i firmowe',
          description:
            'Tworzenie stron firmowych z CMS dla średnich i dużych przedsiębiorstw. Migracja z WordPress, integracje ERP/CRM, RODO compliance, wielojęzyczność.',
          serviceType: 'Corporate Website Development',
        }}
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
      <LazyHydrate whenVisible>
        <SectionWrapper variant="light-gray">
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
        </SectionWrapper>
      </LazyHydrate>

      {/* --- CMS SECTION --- */}
      <LazyHydrate whenVisible>
        <CorporateCmsComparison />
      </LazyHydrate>

      {/* --- COMPLIANCE & SECURITY --- */}
      <LazyHydrate whenVisible>
        <CorporateSecurity />
      </LazyHydrate>

      {/* --- SAFE MIGRATION --- */}
      <LazyHydrate whenVisible>
        <SectionWrapper variant="white" padding="lg">
          <SectionHeader
            title={CONTENT.migration.title}
            subtitle={CONTENT.migration.subtitle}
            description={CONTENT.migration.description}
            className="mb-16"
          />
          {/* Semantic <ol> dla kolejnosci krokow migracji (WCAG 1.3.1 - SR czyta jako uporządkowaną listę) */}
          <ol className="list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <li key={i}>
                <AnimateOnScroll delay={i * 100} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-secondary mb-6 border border-gray-100 shadow-sm relative z-10 group-hover:bg-blue-50 transition-colors">
                      {step.icon}
                      <div
                        aria-hidden="true"
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-xs font-black text-dark"
                      >
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-dark text-lg mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                  {i < 3 && (
                    <div
                      aria-hidden="true"
                      className="hidden lg:block absolute top-8 left-[calc(100%-2rem)] w-full h-px bg-gradient-to-r from-gray-200 to-transparent z-0"
                    ></div>
                  )}
                </AnimateOnScroll>
              </li>
            ))}
          </ol>
        </SectionWrapper>
      </LazyHydrate>

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
      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={ShieldCheck}
        onClick={() => openModal('web', { specificType: 'corporate' })}
        variant="dark"
      />
    </div>
  );
};

export default CorporateWebsite;
