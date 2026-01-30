import React, { useEffect, useState } from 'react';
import { Megaphone, Users, Play } from 'lucide-react';
import Seo from '../common/Seo';
import { useModal } from '../../context/ModalContext';
import { META_ADS_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import StandardCta from '../common/StandardCta';
import StandardFaq from '../common/StandardFaq';
import StandardHero from '../common/StandardHero';
import SectionHeader from '../common/SectionHeader';
import { MetaAdsHeroVisual } from '../visuals/hero/MetaAdsVisual';

// Refactored Sub-components
import MetaAdsFunnel from '../features/marketing/MetaAdsFunnel';
import MetaAdsCapi from '../features/marketing/MetaAdsCapi';
import MetaAdsEcosystem from '../features/marketing/MetaAdsEcosystem';
import MetaAdsStrategy from '../features/marketing/MetaAdsStrategy';

const MetaAds: React.FC = () => {
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('meta-ads').then((data) => {
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

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-instagram/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image || '/assets/images/meta-ads.png'}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Megaphone}
        title={{
          line1: CONTENT.hero.title.line1,
          line2: CONTENT.hero.title.line2,
          accent: CONTENT.hero.title.accent,
        }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('marketing', { specificType: 'ads' })}
        ctaSecondaryNode={
          <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-full border border-gray-100 text-sm font-bold text-gray-600 shadow-sm cursor-default">
            <Users size={16} className="text-instagram" /> {CONTENT.hero.microCopy}
          </div>
        }
        backLinkPath="/marketing/"
        backLinkLabel="Marketing"
        accentGradientFrom="#833AB4"
        accentGradientTo="#E1306C"
        visual={<MetaAdsHeroVisual />}
      />

      <MetaAdsFunnel onCta={() => openModal('marketing', { specificType: 'ads' })} />

      <MetaAdsCapi />

      <MetaAdsEcosystem />

      <MetaAdsStrategy />

      {/* --- PRICING --- */}
      {pricingData && (
        <PricingTable
          title={pricingData.title}
          description={pricingData.description}
          tiers={pricingData.tiers}
        />
      )}

      {/* --- FAQ --- */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Pytania o Social Ads" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      {/* --- CTA --- */}
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Play}
        onClick={() => openModal('marketing', { specificType: 'ads' })}
        colorScheme="instagram"
        bgClassName="bg-instagram/5"
      />

      <style>{`
        @keyframes scroll-y {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .animate-infinite-scroll-y {
            animation: scroll-y 20s linear infinite;
        }
        .mask-fade-y {
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};

export default MetaAds;
