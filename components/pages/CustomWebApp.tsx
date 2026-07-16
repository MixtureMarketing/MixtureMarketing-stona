import React, { useEffect, useRef, useState } from 'react';
import { Calculator, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import LazyHydrate from '../common/LazyHydrate';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import WebDevSpokeFooter from '../common/WebDevSpokeFooter';
import BaseCta from '../common/BaseCta';
import Container from '../common/Container';
import StickyMobileBar from '../common/StickyMobileBar';
import { SITE_CONFIG } from '../../config/site';
import CustomAppProof from '../features/web-development/CustomAppProof';
import CustomAppStart from '../features/web-development/CustomAppStart';
import WebAppUseCases from '../features/web-development/WebAppUseCases';
import WebAppTechStack from '../features/web-development/WebAppTechStack';
import WebAppTrust from '../features/web-development/WebAppTrust';
import WebAppQaPipeline from '../features/web-development/WebAppQaPipeline';
import FaqSection from '../sections/FaqSection';

/**
 * Strona „Aplikacje dedykowane" — przebudowa 2026-07-16 (krytyka 16/40, pełna
 * ścieżka /impeccable). Porządek = siatka bezpieczeństwa decyzyjnego persony:
 * hero (words-only) → dowód (żywy SaaS) → co budujemy → jak zaczynamy (proces
 * właściciela) → stack (potwierdzony) → własność kodu → jakość → cennik +
 * utrzymanie → FAQ → founder → CTA. Usunięte: fejkowy SYSTEM_MONITOR_V2,
 * terminal CI z emoji, atrapa umowy, SLA 99.5/99.9/99.99%.
 */
const CustomWebApp: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);
  const [pricingFailed, setPricingFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService
      .getPricingSection('custom-web-app')
      .then((data) => {
        if (!data) {
          setPricingFailed(true);
          return;
        }
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'custom',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      })
      .catch(() => setPricingFailed(true));
  }, [openModal]);

  const openConsult = () => openModal('web', { specificType: 'custom' });

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Aplikacje dedykowane', item: '/web-development/custom-app/' },
        ]}
        service={{
          name: 'Aplikacje webowe dedykowane',
          description:
            'Dedykowane aplikacje webowe: portale B2B, systemy rezerwacji, CRM/ERP, SaaS. Node.js, Python, Laravel, React, PostgreSQL. Repozytorium od pierwszego dnia i pełne prawa autorskie.',
          serviceType: 'Custom Web Application Development',
        }}
      />

      {/* Hero words-only (zasada właściciela). Kotwica 25 000 zł potwierdzona
          2026-07-16; „płatność etapami" = obietnica z huba. BEZ SLA. */}
      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="od 25 000 zł · od 3 miesięcy · płatność etapami"
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText="Umów darmową rozmowę"
          ctaPrimaryOnClick={openConsult}
          ctaSecondaryText="Wyceń aplikację"
          ctaSecondaryOnClick={() => navigate('/offers#calculator?type=custom')}
          ctaSecondaryIcon={Calculator}
          backLinkPath="/web-development/"
          backLinkLabel="Web Development"
        />
      </div>

      <LazyHydrate minHeight="600px">
        <CustomAppProof />
      </LazyHydrate>

      <WebAppUseCases />

      <CustomAppStart />

      <WebAppTechStack />

      <WebAppTrust />

      <WebAppQaPipeline />

      {/* Cennik z CMS (modele współpracy) + uczciwy empty-state (DESIGN.md). */}
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
              <p className="text-lg font-bold text-dark">
                Nie udało się załadować modeli współpracy.
              </p>
              <p className="mt-2 text-gray-700">
                Policz widełki dla swojej aplikacji w kalkulatorze — zajmuje to około minuty.
              </p>
              <Link
                to="/offers#calculator?type=custom"
                className="mt-5 inline-flex items-center gap-2 font-bold text-secondary underline-offset-4 hover:underline"
              >
                Przejdź do kalkulatora wyceny
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* Utrzymanie + jedyne uczciwe zdanie o SLA (osobna umowa serwisowa). */}
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
          </div>
        </Container>
      </section>

      <FaqSection title="Najczęstsze pytania" items={CONTENT.faqs} bgClassName="bg-white" />

      {/* Bio zgodne z prawdą (decyzja właściciela 2026-07-16): Jakub = analityk
          biznesowy i PM, jeden punkt kontaktu; koduje zespół developerów. */}
      <WebDevSpokeFooter
        currentType="custom"
        founderBio={
          <>
            Prowadzę projekty dedykowane od analizy biznesowej po wdrożenie — to ze mną rozmawiasz
            na każdym etapie, bez handlowca-pośrednika. Koduje nasz zespół developerów, a przy
            większych projektach wspierają nas sprawdzeni, zaprzyjaźnieni specjaliści. Jeden punkt
            kontaktu, zero głuchego telefonu.
          </>
        }
      />

      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.description}
          buttonText={CONTENT.cta.button}
          icon={Settings}
          onClick={openConsult}
          variant="dark"
        />
      </div>

      {/* Sticky mobile CTA — parytet z hubem (strona ma ~14 tys. px scrolla). */}
      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Darmowa rozmowa"
        sublabel="Wstępne widełki w 24h"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default CustomWebApp;
