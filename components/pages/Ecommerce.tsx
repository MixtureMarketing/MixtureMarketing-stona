import React, { useEffect, useState } from 'react';
import { ShoppingCart, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { useModal } from '../../context/ModalContext';
import { ECOMMERCE_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import WebDevSpokeFooter from '../common/WebDevSpokeFooter';
import BaseCta from '../common/BaseCta';
import { PricingSectionData, PricingTier } from '../../types';
import { EcommerceHeroVisual } from '../visuals/hero/EcommerceVisual';
import EcommerceAutomation from '../features/ecommerce/EcommerceAutomation';
import EcommerceConfigurator from '../features/ecommerce/EcommerceConfigurator';
import EcommerceBoosters from '../features/ecommerce/EcommerceBoosters';
import EcommerceTechnical from '../features/ecommerce/EcommerceTechnical';
import EcommerceComparison from '../features/ecommerce/EcommerceComparison';
import FaqSection from '../sections/FaqSection';

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
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Sklepy internetowe', item: '/web-development/ecommerce/' },
        ]}
        service={{
          name: 'Sklepy internetowe i e-commerce',
          description:
            'Tworzenie sklepów internetowych: Shoper, WooCommerce, dedykowane Next.js+Sanity. Integracje płatności (Przelewy24, BLIK, Stripe), kurierów (InPost, DPD, DHL) i ERP.',
          serviceType: 'E-commerce Development',
        }}
      />

      {/* --- HERO SECTION (Direct usage of StandardHero) --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={ShoppingCart}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        priceHint="od 12 000 zł · Shoper / WooCommerce / dedykowany · 6–12 tygodni"
        trustLine={<HeroTrustLine />}
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

      <EcommerceConfigurator onCta={() => openModal('web', { specificType: 'ecommerce' })} />

      {/* --- PRICING TIERS --- (EH4: PRZED Boosters/Technical/Comparison — klient szuka ceny najpierw) */}
      {pricingData && (
        <LazyHydrate minHeight="600px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      <EcommerceBoosters />

      <EcommerceTechnical />

      <EcommerceComparison />

      {/* --- FAQ --- */}
      <FaqSection title="Najczęstsze pytania" items={CONTENT.faqs} />

      {/* --- FOUNDER TRUST + SPOKE CROSS-LINKS --- */}
      <WebDevSpokeFooter
        currentType="ecommerce"
        founderBio={
          <>
            Od 2020 buduję sklepy internetowe i marketplace&apos;y dla firm z Podkarpacia. Stack:
            Shoper, WooCommerce, dedykowany Next.js+Sanity. Integracje płatności (Przelewy24,
            Stripe), kurierów i ERP. Sam koduję — bez "kogoś z agencji od backendu".
          </>
        }
      />

      {/* --- CTA --- */}
      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={ShoppingCart}
        onClick={() => openModal('web', { specificType: 'ecommerce' })}
        variant="dark"
      />
    </div>
  );
};

export default Ecommerce;
