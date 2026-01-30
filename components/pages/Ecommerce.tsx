import React, { useEffect, useState } from 'react';
import { ShoppingCart, Calculator, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../common/SectionHeader';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { useModal } from '../../context/ModalContext';
import { ECOMMERCE_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import StandardFaq from '../common/StandardFaq';
import { PricingSectionData, PricingTier } from '../../types';

// Refactored Sub-components
import { EcommerceHeroVisual } from '../visuals/hero/EcommerceVisual';
import EcommerceAutomation from '../features/ecommerce/EcommerceAutomation';
import EcommerceConfigurator from '../features/ecommerce/EcommerceConfigurator';
import EcommerceBoosters from '../features/ecommerce/EcommerceBoosters';
import EcommerceTechnical from '../features/ecommerce/EcommerceTechnical';
import EcommerceComparison from '../features/ecommerce/EcommerceComparison';

const Ecommerce: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('ecommerce').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'ecommerce',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-success/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        lcpImage={CONTENT.seo.image}
      />

      {/* --- HERO SECTION (Direct usage of StandardHero) --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={ShoppingCart}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={() => openModal('web', { specificType: 'ecommerce' })}
        ctaSecondaryText="Wyceń sklep"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=ecommerce')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/web-development/"
        backLinkLabel="Web Development"
        accentGradientFrom="#00C853"
        accentGradientTo="#3F3D91"
        visual={<EcommerceHeroVisual />}
      />

      <EcommerceAutomation />

      <EcommerceConfigurator
        onCta={() => openModal('consultation', { specificType: 'ecommerce' })}
      />

      <EcommerceBoosters />

      <EcommerceTechnical />

      <EcommerceComparison />

      {/* --- PRICING TIERS --- */}
      {pricingData && (
        <LazyHydrate minHeight="600px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      {/* --- FAQ --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Najczęstsze pytania" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      {/* --- CTA --- */}
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.button}
        icon={Box}
        onClick={() => openModal('consultation', { specificType: 'ecommerce' })}
        bgClassName="bg-white border-t border-gray-100"
      />
    </div>
  );
};

export default Ecommerce;
