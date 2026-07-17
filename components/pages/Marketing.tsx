import React, { useEffect, useRef } from 'react';
import Seo from '@/components/common/Seo';
import { MARKETING_CONTENT } from '@/data/content';
import StandardHero from '@/components/common/StandardHero';
import HeroTrustLine from '@/components/common/HeroTrustLine';
import StickyMobileBar from '@/components/common/StickyMobileBar';
import { SITE_CONFIG } from '@/config/site';
import { Zap } from 'lucide-react';
import MarketingProof from '@/components/features/marketing/MarketingProof';
import MarketingPains from '@/components/features/marketing/MarketingPains';
import MarketingModels from '@/components/features/marketing/MarketingModels';
import MarketingSynergy from '@/components/features/marketing/MarketingSynergy';
import MarketingServices from '@/components/features/marketing/MarketingServices';
import StandardFaq from '@/components/common/StandardFaq';
import BaseCta from '../common/BaseCta';
import LazyHydrate from '@/components/common/LazyHydrate';
import RelatedArticles from '../articles/RelatedArticles';
import { useModal } from '@/context/ModalContext';

/**
 * Hub /marketing/ — przebudowa 2026-07-16 (krytyka 12/40, pełna ścieżka;
 * snapshot w .impeccable/critique/). Porządek = drabina zaufania persony:
 * hero words-only (ciemne) → ciemnia dowodowa (realizacje ads/seo + metoda,
 * flip-dot) → jasny arkusz „dlaczego reklamy nie działają" (ekspertyza bez
 * liczb) → dwa modele wzrostu (uczciwe lustro) → synergia (linia plotera)
 * → drabinka usług → FAQ → artykuły → CTA.
 * Usunięte atrapy: fejkowy dashboard hero (losowo rosnący „przychód",
 * „ROAS 8.5"), pseudo-symulacja parametrów, wieczna orbita „DATA HUB",
 * plakietki „TOP 3 w Google". Decyzje właściciela: kotwica od 1 200 zł/mc,
 * raportowanie = dashboard 24/7 + spotkanie co miesiąc, bez LinkedIn
 * Ads / Cold Mailingu / YouTube Ads (niepotwierdzone).
 */
const Marketing: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openConsult = () => openModal('marketing');

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={MARKETING_CONTENT.seo.title}
        description={MARKETING_CONTENT.seo.description}
        image={MARKETING_CONTENT.seo.image}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Digital Marketing',
            provider: {
              '@type': 'Organization',
              name: 'Mixture Marketing',
              url: 'https://mixturemarketing.pl',
              logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
            },
            areaServed: 'PL',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Usługi Marketingowe',
              itemListElement: MARKETING_CONTENT.services.items.map((item) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: item.title,
                  url: `https://mixturemarketing.pl${item.path}`,
                  description: item.desc,
                },
              })),
            },
          },
        ]}
      />

      {/* Hero words-only w ciemnym rejestrze (The Hero Is Words Rule) —
          fejkowy dashboard z licznikiem przychodu usunięty wraz z plikiem.
          Kotwica cenowa = najniższy realny pakiet CMS (SEO lokalne 1 200). */}
      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: MARKETING_CONTENT.hero.title, line2: MARKETING_CONTENT.hero.titleAccent }}
          description={MARKETING_CONTENT.hero.description}
          priceHint="od 1 200 zł / mc · Google Ads / Meta Ads / SEO / Analytics · dashboard z wynikami 24/7"
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText={MARKETING_CONTENT.hero.cta}
          ctaPrimaryOnClick={openConsult}
          backLinkPath="/"
          backLinkLabel="Wróć na stronę główną"
        />
      </div>

      <LazyHydrate minHeight="700px">
        <MarketingProof />
      </LazyHydrate>

      <MarketingPains />

      <MarketingModels />

      <MarketingSynergy />

      <MarketingServices />

      <LazyHydrate minHeight="400px">
        <section className="relative z-10 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <StandardFaq items={MARKETING_CONTENT.faqs} />
          </div>
        </section>
      </LazyHydrate>

      <LazyHydrate minHeight="600px">
        <RelatedArticles category="marketing" layout="service" />
      </LazyHydrate>

      <div ref={finalCtaRef}>
        <BaseCta
          title={MARKETING_CONTENT.cta.title}
          description={MARKETING_CONTENT.cta.description}
          buttonText={MARKETING_CONTENT.cta.button}
          icon={Zap}
          onClick={openConsult}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja"
        sublabel="Dashboard 24/7 · spotkanie co miesiąc"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Zapytaj"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default Marketing;
