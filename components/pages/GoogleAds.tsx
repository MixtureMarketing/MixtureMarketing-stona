import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  ShieldCheck,
  TrendingUp,
  Database,
  Layers,
  Cpu,
  Terminal,
  Target,
  ShoppingCart,
  Briefcase,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { Phone } from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Seo from '../common/Seo';
import HeroTrustLine from '../common/HeroTrustLine';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';
import { GOOGLE_ADS_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSection, PricingTier } from '../../types';
import AuditTeaser from '../features/audit/AuditTeaser';
import BaseCta from '../common/BaseCta';
import FaqSection from '../sections/FaqSection';
import GoogleAdsCalculator from '../features/marketing/GoogleAdsCalculator';
import StandardHero from '../common/StandardHero';
import { GoogleAdsHeroVisual } from '../visuals/hero/GoogleAdsVisual';
import Container from '../common/Container';

/**
 * FB3 — sanityzacja CMS content z whitelistą tylko bezpiecznych tagow.
 * Eliminuje XSS risk z `dangerouslySetInnerHTML` bez utraty formatowania
 * (<strong>, <em>) z Sanity. Whitelist explicit — wszystko inne wyciete.
 */
const sanitize = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
  });

const GoogleAds: React.FC = () => {
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSection | null>(null);

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
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'Google Ads', item: '/marketing/google-ads/' },
        ]}
        service={{
          name: 'Google Ads / Performance Marketing',
          description:
            'Kampanie Google Ads: Search, Performance Max, Shopping, Display. Optymalizacja CPA i ROAS dla e-commerce, B2B i lokalnych usług. Zarządzanie budżetem, A/B testy kreacji, integracje z GA4.',
          serviceType: 'Google Ads / PPC Management',
        }}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={ShieldCheck}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        priceHint="od 1 200 zł / mc + budżet reklamowy · ROAS sredni 4.2× · raporty co tydzień"
        trustLine={<HeroTrustLine promise="Sam optymalizuję kampanie, raporty pisze ja" />}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('marketing', { specificType: 'ads' })}
        ctaSecondaryNode={
          <a
            href={`tel:${SITE_CONFIG.contact.phoneFull}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-dark hover:border-secondary hover:bg-blue-50 hover:text-secondary font-bold rounded-full transition-colors motion-safe:focus-visible:-translate-y-0.5"
          >
            <Phone size={18} aria-hidden="true" />
            Zadzwoń: {SITE_CONFIG.contact.phone}
          </a>
        }
        backLinkPath="/marketing/"
        backLinkLabel="Marketing"
        accentGradientFrom="#4285F4"
        accentGradientTo="#34A853"
        visual={<GoogleAdsHeroVisual />}
      />

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
        <Container>
          <SectionHeader
            title={CONTENT.painPoints.title}
            description={CONTENT.painPoints.description}
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CONTENT.painPoints.items.map((item, i) => {
              const icons = [
                <Terminal key="filter" size={32} className="text-red-500" />,
                <Target key="target" size={32} className="text-red-500" />,
                <ShieldCheck key="award" size={32} className="text-red-500" />,
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
        </Container>
      </section>

      {/* --- INDUSTRY STRATEGY --- */}
      <section className="py-24 bg-light-gray relative overflow-hidden">
        <Container className="relative z-10">
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
                        dangerouslySetInnerHTML={{ __html: sanitize(feat) }}
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
                        dangerouslySetInnerHTML={{ __html: sanitize(feat) }}
                      />
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  onClick={() => openModal('marketing', { specificType: 'ads' })}
                  className="!bg-[#008a3a] hover:!bg-[#007a33] border-none"
                >
                  {CONTENT.industries.ecommerce.cta}
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* --- CALCULATOR --- */}
      <section className="py-24 bg-white relative z-20">
        <Container>
          <SectionHeader
            title={CONTENT.calculator.title}
            description={CONTENT.calculator.description}
            className="mb-12"
          />
          <GoogleAdsCalculator />
        </Container>
      </section>

      {/* --- ALGORITHM --- */}
      <section className="py-24 bg-deep-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <Container className="relative z-10">
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
                      <div className="w-12 h-12 rounded-xl bg-deep-dark flex items-center justify-center text-[#4285F4] border border-[#334155] group-hover:scale-110 transition-transform shadow-lg">
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

                    <div className="mt-auto bg-deep-dark rounded-lg p-3 font-mono text-xxs text-gray-300 border border-[#334155] flex items-center gap-2 overflow-hidden">
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
        </Container>
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
      <FaqSection title="Pytania o Google Ads" items={CONTENT.faqs} />

      {/* --- CTA --- */}
      <BaseCta
        title={CONTENT.ctaAudit.title}
        description={CONTENT.ctaAudit.description}
        buttonText={CONTENT.ctaAudit.button}
        icon={Target}
        onClick={() => openModal('marketing', { specificType: 'ads' })}
        variant="dark"
      />
    </div>
  );
};

export default GoogleAds;
