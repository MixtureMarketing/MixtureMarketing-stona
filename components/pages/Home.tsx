import React, { Suspense, lazy, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/context/ModalContext';
import Seo from '@/components/common/Seo';
import Hero from '@/components/sections/Hero';
import StickyMobileBar from '@/components/common/StickyMobileBar';
import { SITE_CONFIG } from '@/config/site';

// These components were defined inline in App.tsx, moving them here to separate file
// to allow proper lazy loading in routes.tsx
const WhyUs = lazy(() => import('@/components/sections/WhyUs'));
const Services = lazy(() => import('@/components/sections/Services'));
const LeadMagnet = lazy(() => import('@/components/sections/LeadMagnet'));
const KnowledgeBaseTeaser = lazy(() => import('@/components/sections/KnowledgeBaseTeaser'));

const Home = () => {
  const { openModal: _openModal } = useModal();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const leadMagnetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Seo
        title="Agencja Marketingowa Rzeszów — Web, SEO, Ads"
        description="Agencja marketingowa Rzeszów. Strony WWW, SEO, Google Ads, Meta Ads, branding. Pracujemy mobilnie — dojeżdżamy do klientów w Rzeszowie i na Podkarpaciu. Realizacje dla firm z całej Polski. Wycena widełkowa."
        lcpImage="/assets/images/sygnet.png"
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

      <div ref={heroRef}>
        <Hero onOpenModal={() => _openModal('general')} />
      </div>

      <Suspense fallback={<div className="h-screen" />}>
        <Services />
        <WhyUs />
        <div ref={leadMagnetRef}>
          <LeadMagnet />
        </div>
        <KnowledgeBaseTeaser />
      </Suspense>

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
