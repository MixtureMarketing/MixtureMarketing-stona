import React, { Suspense, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/context/ModalContext';
import Seo from '@/components/common/Seo';
import Hero from '@/components/sections/Hero';
import StickyMobileBar from '@/components/common/StickyMobileBar';
import { usePagePulse } from '@/hooks/useSectionProgress';
import { SITE_CONFIG } from '@/config/site';
import TestimonialsSlot from '@/components/sections/testimonials/TestimonialsSlot';
import AiSystemsTeaser from '@/components/sections/AiSystemsTeaser';
import { lazyWithPreload } from '@/components/common/lazyWithPreload';
import { isHomeSeoEnabled } from '@/config/flags';
import { HOME_SEO, HOME_SEO_BASE } from '@/data/content/pages/homeSeo';

// Sekcje pod hero — osobne chunki (lazy). Przy starcie z prerenderu preloadRoute()
// woła routePreload() i dociąga je PRZED pierwszym renderem, więc Suspense niżej
// nie pokazuje fallbacku (prerenderowana treść nie zwija się do „arkusza").
const WhyUs = lazyWithPreload(() => import('@/components/sections/WhyUs'));
const Services = lazyWithPreload(() => import('@/components/sections/Services'));
const LeadMagnet = lazyWithPreload(() => import('@/components/sections/LeadMagnet'));
const KnowledgeBaseTeaser = lazyWithPreload(
  () => import('@/components/sections/KnowledgeBaseTeaser'),
);
const FinalBand = lazyWithPreload(() => import('@/components/sections/FinalBand'));

export const routePreload = () =>
  Promise.all(
    [WhyUs, Services, LeadMagnet, KnowledgeBaseTeaser, FinalBand].map((c) => c.preload()),
  );

const Home = () => {
  const { openModal: _openModal } = useModal();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const leadMagnetRef = useRef<HTMLDivElement>(null);

  // Puls strony (--page-p) — patrz usePagePulse: ambient i siatki dryfują
  // z każdym pikselem przewijania, w obie strony.
  usePagePulse();

  // MIX-1269 r3: title i meta (systemy dedykowane, AI) za VITE_MM_HOME_SEO (wyłączony = dzisiejsze).
  const seo = isHomeSeoEnabled() ? HOME_SEO : HOME_SEO_BASE;

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': 'https://mixturemarketing.pl/#website',
          name: 'Mixture Marketing',
          url: 'https://mixturemarketing.pl',
          inLanguage: 'pl-PL',
          publisher: { '@id': 'https://mixturemarketing.pl/#organization' },
          // MIX-1825: bez potentialAction (wyszukiwarka). Baza wiedzy nie obsługuje ?q=, a Google
          // crawlował szablon wyszukiwania /baza-wiedzy?q=… jako osobny adres (GSC 16.11).
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
          {/* MIX-1276: sekcja o AI i systemach, za przełącznikiem VITE_MM_AI_SECTION (domyślnie brak w DOM).
              MIX-1850: zaraz po Services (druga sekcja pod hero), żeby była wyżej na stronie. */}
          <AiSystemsTeaser />
          <WhyUs />
          <div ref={leadMagnetRef}>
            <LeadMagnet />
          </div>
          <KnowledgeBaseTeaser />
          {/* MIX-1326: opinie klientów, za przełącznikiem VITE_MM_TESTIMONIALS (domyślnie brak w DOM). */}
          <TestimonialsSlot />
          <FinalBand onOpenModal={() => _openModal('general')} />
        </Suspense>
      </div>

      {/* Sticky mobile CTA bar (Sprint B3 → Sprint C2 reuse jako wspolny StickyMobileBar) */}
      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={leadMagnetRef}
        label="Darmowy audyt w 60 sekund"
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
