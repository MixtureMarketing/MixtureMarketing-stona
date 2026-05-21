import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, Zap } from 'lucide-react';
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
  const navigate = useNavigate();

  // BC4 — sticky mobile CTA bar: pokazuje sie po wyjsciu Hero z viewportu,
  // ukrywa sie w sekcji LeadMagnet (tam pelny CTA Audyt 360, no need to duplicate).
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const leadMagnetSentinelRef = useRef<HTMLDivElement>(null);
  const [heroOut, setHeroOut] = useState(false);
  const [leadMagnetIn, setLeadMagnetIn] = useState(false);

  useEffect(() => {
    if (!heroSentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => setHeroOut(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: '-40px 0px 0px 0px',
    });
    obs.observe(heroSentinelRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!leadMagnetSentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => setLeadMagnetIn(entry.isIntersecting), {
      threshold: 0.15,
    });
    obs.observe(leadMagnetSentinelRef.current);
    return () => obs.disconnect();
  }, []);

  const showBar = heroOut && !leadMagnetIn;

  // Toggle body data-attribute zeby CookieFloatingButton wiedzial ze bar jest aktywny
  // (CSS w index.css przesuwa cookie button w gore gdy data-sticky-mobile-bar="true").
  useEffect(() => {
    if (showBar) {
      document.body.dataset.stickyMobileBar = 'true';
    } else {
      delete document.body.dataset.stickyMobileBar;
    }
    return () => {
      delete document.body.dataset.stickyMobileBar;
    };
  }, [showBar]);

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

      <div ref={heroSentinelRef}>
        <Hero onOpenModal={() => openModal('general')} />
      </div>

      <Suspense fallback={<div className="h-screen" />}>
        <Services />
        <WhyUs />
        <div ref={leadMagnetSentinelRef}>
          <LeadMagnet />
        </div>
        <KnowledgeBaseTeaser />
      </Suspense>

      {/* BC4 — Sticky mobile CTA bar (jak w /abonament/) */}
      <div className="md:hidden h-20" aria-hidden={!showBar}>
        {/* spacer pod ostatnia sekcja zeby content nie byl zaslaniany */}
      </div>
      <div
        aria-hidden={!showBar}
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
          showBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs leading-tight">
            <p className="font-bold text-dark flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400 fill-amber-400" aria-hidden="true" />
              Darmowy audyt w 60s
            </p>
            <p className="text-gray-500">Sprawdź błędy na swojej stronie</p>
          </div>
          <a
            href="tel:+48794443551"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border-2 border-gray-200 text-gray-700 hover:border-secondary hover:text-secondary transition-colors"
            aria-label="Zadzwoń: +48 794 443 551"
          >
            <Phone size={18} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => navigate('/audyt-360/')}
            className="inline-flex items-center gap-1.5 px-5 h-11 bg-gradient-to-br from-secondary to-primary text-white font-bold rounded-full shadow-md text-sm"
          >
            Sprawdź
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
