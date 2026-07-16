import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/context/ModalContext';
import Seo from '@/components/common/Seo';
import Hero from '@/components/sections/Hero';
import StickyMobileBar from '@/components/common/StickyMobileBar';
import { addScrollTask } from '@/hooks/useSectionProgress';
import { SITE_CONFIG } from '@/config/site';

// These components were defined inline in App.tsx, moving them here to separate file
// to allow proper lazy loading in routes.tsx
const WhyUs = lazy(() => import('@/components/sections/WhyUs'));
const Services = lazy(() => import('@/components/sections/Services'));
const LeadMagnet = lazy(() => import('@/components/sections/LeadMagnet'));
const KnowledgeBaseTeaser = lazy(() => import('@/components/sections/KnowledgeBaseTeaser'));
const FinalBand = lazy(() => import('@/components/sections/FinalBand'));

const Home = () => {
  const { openModal: _openModal } = useModal();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const leadMagnetRef = useRef<HTMLDivElement>(null);

  // Puls strony (--page-p, 0..1 całego scrolla) na :root — ambient, siatki
  // i inne warstwy tła dryfują z KAŻDYM pikselem przewijania, w obie strony
  // (wątek „żywej całości", 2026-07-16). Wspólny scheduler READ→WRITE;
  // prerender/reduced-motion: brak zmiennej → var(--page-p, 0) = statyka.
  useEffect(() => {
    if (typeof window === 'undefined' || window.isPrerendering) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    let last = -1;
    const remove = addScrollTask(() => {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      return () => root.style.setProperty('--page-p', p.toFixed(3));
    });
    return () => {
      remove();
      root.style.removeProperty('--page-p');
    };
  }, []);

  return (
    <>
      <Seo
        title="Agencja Marketingowa Rzeszów — Web, SEO, Ads"
        description="Agencja marketingowa Rzeszów. Strony WWW, SEO, Google Ads, Meta Ads, branding. Pracujemy mobilnie — dojeżdżamy do klientów w Rzeszowie i na Podkarpaciu. Realizacje dla firm z całej Polski. Wycena widełkowa."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': 'https://mixturemarketing.pl/#website',
          name: 'Mixture Marketing',
          url: 'https://mixturemarketing.pl',
          inLanguage: 'pl-PL',
          publisher: { '@id': 'https://mixturemarketing.pl/#organization' },
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://mixturemarketing.pl/baza-wiedzy/?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      {/* Scroll-takeover (desktop, motion-safe): runway 200vh z przypiętym hero,
          arkusz „Kompetencji" (-mt-[100vh] przez .hero-takeover-offset) najeżdża
          na niego przy scrollu. Mobile/reduced-motion: klasy są bierne → klasyczny
          przepływ. Definicje w index.css. */}
      <div ref={heroRef} className="hero-runway relative">
        <div className="hero-pin">
          <Hero onOpenModal={() => _openModal('general')} />
        </div>
      </div>

      <div className="hero-takeover-offset relative z-10">
        {/* Fallback = sylwetka nadjeżdżającego arkusza (nie biała dziura):
            ten sam zaokrąglony grzbiet i tło co Services, zanim chunk dojedzie */}
        <Suspense
          fallback={
            <div
              className="relative z-10 -mt-10 h-screen rounded-t-[2rem] bg-gray-50 md:-mt-16 md:rounded-t-[3rem]"
              aria-hidden="true"
            />
          }
        >
          <Services />
          <WhyUs />
          <div ref={leadMagnetRef}>
            <LeadMagnet />
          </div>
          <KnowledgeBaseTeaser />
          <FinalBand onOpenModal={() => _openModal('general')} />
        </Suspense>
      </div>

      {/* Sticky mobile CTA bar (Sprint B3 → Sprint C2 reuse jako wspolny StickyMobileBar) */}
      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={leadMagnetRef}
        label="Darmowy audyt w 60s"
        sublabel="Sprawdź błędy na swojej stronie"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Sprawdź"
        onPrimary={() => navigate('/audyt-360/')}
      />
    </>
  );
};

export default Home;
