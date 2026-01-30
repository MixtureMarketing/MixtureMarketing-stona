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
        title="Agencja Marketingowa 360° i Software House"
        description="Łączymy precyzję Software House'u z kreatywnością Agencji Reklamowej. Budujemy systemy, które działają i kampanie, które sprzedają. Poznaj naszą ofertę."
        lcpImage="/assets/images/sygnet.png"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Mixture Marketing',
          url: 'https://mixturemarketing.pl',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://mixturemarketing.pl/search?q={search_term_string}',
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
