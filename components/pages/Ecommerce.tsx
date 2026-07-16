import React, { useEffect, useState } from 'react';
import { Calculator, KeyRound, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
import Container from '../common/Container';
import { PricingSectionData, PricingTier } from '../../types';
import EcommerceProof from '../features/ecommerce/EcommerceProof';
import EcommerceOwnership from '../features/ecommerce/EcommerceOwnership';
import EcommerceIntegrations from '../features/ecommerce/EcommerceIntegrations';
import EcommerceExisting from '../features/ecommerce/EcommerceExisting';
import FaqSection from '../sections/FaqSection';

/**
 * Strona kategorii „Sklepy internetowe" — przebudowa 2026-07-16 (krytyka 20/40,
 * pełna ścieżka /impeccable). Porządek sekcji = drabina zaufania persony:
 * hero (words-only) → dowód (żywy sklep) → własność (centralny argument) →
 * cennik + utrzymanie → integracje → „masz już sklep" → FAQ → founder → CTA.
 * Usunięte atrapy: fejkowy dashboard hero, orbita integracji, konfigurator
 * „ErgoChair", karty boosters, „Bezpieczeństwo klasy Enterprise".
 */
const Ecommerce: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);
  const [pricingFailed, setPricingFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService
      .getPricingSection('ecommerce')
      .then((data) => {
        if (!data) {
          setPricingFailed(true);
          return;
        }
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'ecommerce',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      })
      .catch(() => setPricingFailed(true));
  }, [openModal]);

  const openConsult = () => openModal('web', { specificType: 'ecommerce' });

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Sklepy internetowe', item: '/web-development/ecommerce/' },
        ]}
        service={{
          name: 'Sklepy internetowe i e-commerce',
          description:
            'Tworzenie sklepów internetowych na otwartym oprogramowaniu: WooCommerce, PrestaShop, Medusa.js, Sylius. Integracje płatności (Przelewy24, BLIK, Stripe), kurierów (InPost, DPD, DHL), Allegro i ERP przez BaseLinker.',
          serviceType: 'E-commerce Development',
        }}
      />

      {/* Hero words-only (twarda zasada właściciela: zero atrap i zrzutów w hero).
          Kotwica cenowa = najniższy pakiet cennika (decyzja właściciela 2026-07-15). */}
      <StandardHero
        tone="dark"
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        priceHint="od 6 000 zł · WooCommerce / PrestaShop / Medusa.js / Sylius · 6–12 tygodni"
        trustLine={<HeroTrustLine tone="dark" />}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={openConsult}
        ctaSecondaryText="Wyceń sklep"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=ecommerce')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/web-development/"
        backLinkLabel="Web Development"
      />

      <LazyHydrate minHeight="600px">
        <EcommerceProof />
      </LazyHydrate>

      <EcommerceOwnership />

      {/* Cennik z CMS + uczciwy empty-state (wymóg DESIGN.md: sekcja zasilana
          z Sanity nigdy nie znika po cichu). */}
      {pricingData && (
        <LazyHydrate minHeight="600px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}
      {pricingFailed && (
        <section className="bg-gray-50 py-20">
          <Container>
            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center">
              <p className="text-lg font-bold text-dark">Nie udało się załadować cennika.</p>
              <p className="mt-2 text-gray-700">
                Policz widełki dla swojego sklepu w kalkulatorze — zajmuje to około minuty.
              </p>
              <Link
                to="/offers#calculator?type=ecommerce"
                className="mt-5 inline-flex items-center gap-2 font-bold text-secondary underline-offset-4 hover:underline"
              >
                Przejdź do kalkulatora wyceny
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* Utrzymanie po starcie + pieczęć własności kodu (copy zatwierdzone na hubie).
          Wizualnie kontynuacja strefy cennika (to samo tło, mniejszy oddech). */}
      <section className="bg-gray-50 pb-20 md:pb-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-dark">
              {CONTENT.maintenance.title}
            </h2>
            {CONTENT.maintenance.lines.map((line) => (
              <p key={line} className="mt-3 text-[15px] leading-relaxed text-gray-700">
                {line}
              </p>
            ))}
            <p className="mt-6 flex items-start gap-3 rounded-2xl bg-dark px-6 py-5 text-[15px] font-bold text-white">
              <KeyRound size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {CONTENT.maintenance.seal}
            </p>
          </div>
        </Container>
      </section>

      <EcommerceIntegrations />

      <EcommerceExisting onConsult={openConsult} />

      <FaqSection title="Najczęstsze pytania" items={CONTENT.faqs} bgClassName="bg-white" />

      <WebDevSpokeFooter
        currentType="ecommerce"
        founderBio={
          <>
            Od 2020 buduję sklepy internetowe i marketplace&apos;y dla firm z Podkarpacia. Stack:
            WooCommerce, PrestaShop, przy nietypowej sprzedaży Medusa.js albo Sylius. Integracje
            płatności (Przelewy24, Stripe), kurierów, Allegro i ERP przez BaseLinker. Sam koduję —
            bez &quot;kogoś z agencji od backendu&quot;.
          </>
        }
      />

      <BaseCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={ShoppingCart}
        onClick={openConsult}
        variant="dark"
      />
    </div>
  );
};

export default Ecommerce;
