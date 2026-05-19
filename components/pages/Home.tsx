import React, { Suspense, lazy } from 'react';
import { useModal } from '@/context/ModalContext';
import Seo from '@/components/common/Seo';
import Hero from '@/components/sections/Hero';

// These components were defined inline in App.tsx, moving them here to separate file
// to allow proper lazy loading in routes.tsx
const WhyUs = lazy(() => import('@/components/sections/WhyUs'));
const Services = lazy(() => import('@/components/sections/Services'));
const LeadMagnet = lazy(() => import('@/components/sections/LeadMagnet'));
const KnowledgeBaseTeaser = lazy(() => import('@/components/sections/KnowledgeBaseTeaser'));

const Home = () => {
  const { openModal } = useModal();

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
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://mixturemarketing.pl/baza-wiedzy/?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      <Hero onOpenModal={() => openModal('general')} />

      <Suspense fallback={<div className="h-screen" />}>
        <Services />
        <WhyUs />
        <LeadMagnet />
        <KnowledgeBaseTeaser />
      </Suspense>
    </>
  );
};

export default Home;
