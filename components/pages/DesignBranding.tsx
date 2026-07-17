import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wand2 } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import LazyHydrate from '../common/LazyHydrate';
import { useModal } from '../../context/ModalContext';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import Seo from '../common/Seo';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../data/content';
import RelatedArticles from '../articles/RelatedArticles';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import StandardFaq from '../common/StandardFaq';
import Container from '../common/Container';
import PlotterTimeline from '../common/PlotterTimeline';
import DesignProof from '../features/design/DesignProof';
import { SITE_CONFIG } from '../../config/site';

/**
 * Hub /design/ — przebudowa 2026-07-16 (krytyka 14/40, pełna ścieżka
 * kategorii design). Usunięte: surowy HTML w hero, sekcja „ROI designu"
 * z liczbami z powietrza (0.05s / 94% / 200% — zakaz: usuwać, nie
 * podmieniać), atrapa wizuala hero (DesignVisual skasowany), martwe karty
 * branż z cursor-pointer bez akcji, filary jako div onClick (niedostępne
 * z klawiatury i niewidoczne dla robota na stronie prerenderowanej pod
 * SEO), czwarty akcent #F4B400 i palety emerald/rose, angielski kostium.
 * Ceny potwierdzone przez właściciela (UI/UX zeszło na od 2 000 zł).
 * Drabina: hero words-only → ciemnia dowodowa (realizacje design z CMS,
 * flip-dot) → filary (stretched-linki) → ekosystem (oś plotera) → branże
 * → narzędzia → FAQ → CTA. Choreografia --p w każdej sekcji.
 */
const DesignBranding: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useSectionProgress<HTMLElement>(0.85);
  const ecosystemRef = useSectionProgress<HTMLElement>(0.8);
  const sectorsRef = useSectionProgress<HTMLElement>(0.85);
  const toolkitRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openConsult = () => openModal('design');

  return (
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Design & Branding',
          provider: {
            '@type': 'Organization',
            name: 'Mixture Marketing',
            url: 'https://mixturemarketing.pl',
            logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
          },
          areaServed: 'PL',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Usługi Projektowe',
            itemListElement: CONTENT.pillars.items.map((item) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: item.title,
                url: `https://mixturemarketing.pl${item.path}`,
                description: item.desc,
              },
            })),
          },
        }}
      />

      {/* Hero words-only w ciemnym rejestrze; ceny = decyzja właściciela. */}
      <div ref={heroRef}>
        <StandardHero
          tone="dark"
          title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
          description={CONTENT.hero.description}
          priceHint="Print od 800 zł · Branding od 3 500 zł · UI/UX od 2 000 zł · Audyt od 2 500 zł"
          trustLine={<HeroTrustLine tone="dark" />}
          ctaPrimaryText={CONTENT.hero.cta}
          ctaPrimaryOnClick={openConsult}
          backLinkPath="/"
          backLinkLabel="Wróć na stronę główną"
        />
      </div>

      <LazyHydrate minHeight="700px">
        <DesignProof />
      </LazyHydrate>

      {/* Filary — sygnaturowy jasny arkusz na ciemni; wiersze-LINKI
          (stretched), nie div-y z onClick. */}
      <section
        ref={pillarsRef}
        className="relative z-10 -mt-10 rounded-t-[2rem] bg-white pt-20 pb-24 md:-mt-16 md:rounded-t-[3rem] md:pt-24"
      >
        <Container>
          <div
            className="max-w-3xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.pillars.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.pillars.description}
            </p>
          </div>
          <div
            className="mt-12 divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white shadow-sm"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
          >
            {CONTENT.pillars.items.map((item, i) => (
              <div
                key={item.id}
                className="group relative flex flex-col gap-4 px-6 py-7 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:items-center md:gap-8 md:px-9"
                style={{ transform: `translate3d(0, calc((1 - var(--p, 1)) * ${12 * i}px), 0)` }}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-500">{item.role}</p>
                  <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-dark transition-colors group-hover:text-secondary">
                    <Link to={item.path} className="after:absolute after:inset-0">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                </div>
                <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-gray-600">
                  {item.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-dark md:justify-self-end">
                  Zobacz szczegóły
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Ekosystem — realna sekwencja 01→03, więc oś plotera. */}
      <section ref={ecosystemRef} className="relative bg-light-gray py-20 md:py-28">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div
              className="lg:col-span-5 lg:self-start lg:sticky lg:top-28"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
                {CONTENT.ecosystem.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-700">
                {CONTENT.ecosystem.description}
              </p>
            </div>
            <PlotterTimeline
              className="mt-12 lg:col-span-7 lg:mt-0"
              items={CONTENT.ecosystem.items.map((s) => ({
                kicker: s.tags.join(' · '),
                title: s.title,
                desc: s.desc,
              }))}
            />
          </div>
        </Container>
      </section>

      {/* Branże — informacyjne wiersze (bez udawania klikalności). */}
      <section ref={sectorsRef} className="relative bg-white py-20 md:py-28">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div
              className="lg:col-span-5 lg:self-start lg:sticky lg:top-28"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
                {CONTENT.sectors.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-700">
                {CONTENT.sectors.description}
              </p>
            </div>
            <div className="mt-12 divide-y divide-gray-100 lg:col-span-7 lg:mt-0">
              {CONTENT.sectors.items.map((item, i) => (
                <div
                  key={item.title}
                  className="py-6 first:pt-0"
                  style={{
                    transform: `translate3d(0, calc((1 - var(--p, 1)) * ${20 + i * 12}px), 0)`,
                  }}
                >
                  <h3 className="text-lg font-extrabold tracking-tight text-dark">{item.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Narzędzia — tabliczka (realny warsztat, bez „Industry Standard"). */}
      <section ref={toolkitRef} className="relative bg-light-gray py-16 md:py-20">
        <Container>
          <div
            className="rounded-3xl border border-gray-200 bg-white px-6 py-8 shadow-sm md:px-9"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 32px), 0)' }}
          >
            <p className="text-sm font-bold text-dark">{CONTENT.toolkit.title}</p>
            <ul className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
              {CONTENT.toolkit.tools.map((tool) => (
                <li key={tool.name} className="text-sm text-gray-700">
                  <span className="font-extrabold text-dark">{tool.name}</span>
                  <span className="ml-2 text-gray-500">{tool.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <LazyHydrate minHeight="600px">
        <RelatedArticles category="design" layout="service" />
      </LazyHydrate>

      <section className="relative z-10 bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Najczęstsze pytania" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      <div ref={finalCtaRef}>
        <BaseCta
          title={CONTENT.cta.title}
          description={CONTENT.cta.text}
          buttonText={CONTENT.cta.button}
          icon={Wand2}
          onClick={openConsult}
          variant="dark"
        />
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja Design"
        sublabel="Branding · UI/UX · Print · Audyt"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={openConsult}
      />
    </div>
  );
};

export default DesignBranding;
