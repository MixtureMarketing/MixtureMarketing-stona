import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Calculator, Activity } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { WEB_DEV_CONTENT } from '../../data/content';
import RelatedArticles from '../articles/RelatedArticles';
import StandardHero from '../common/StandardHero';
import HeroTrustLine from '../common/HeroTrustLine';
import StickyMobileBar from '../common/StickyMobileBar';
import BaseCta from '../common/BaseCta';
import { SITE_CONFIG } from '../../config/site';
import Container from '../common/Container';

// Refactored Sub-components
import WebDevHeroTitle from '../features/web-development/WebDevHeroTitle';
import WebDevRealizations from '../features/web-development/WebDevRealizations';
import WebDevEcosystem from '../features/web-development/WebDevEcosystem';
import WebDevStackChoice from '../features/web-development/WebDevStackChoice';
import WebDevProjectTypes from '../features/web-development/WebDevProjectTypes';
import WebDevWpCustom from '../features/web-development/WebDevWpCustom';
import WebDevInfrastructure from '../features/web-development/WebDevInfrastructure';
import WebDevComparison from '../features/web-development/WebDevComparison';
import FaqSection from '../sections/FaqSection';

const WebDevelopment: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    // Bez `pt-20`: ciemny hero jest min-h-screen i sam czyści przybity navbar
    // swoim pt-28/pt-32 — dokładnie jak hero strony głównej. Z wrapperem hero
    // startowało 80px niżej wewnątrz 100vh pina (overflow:hidden), więc pas
    // realizacji lądował na 911px i był ucinany w całości.
    <div className="bg-white animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={WEB_DEV_CONTENT.seo.title}
        description={WEB_DEV_CONTENT.seo.description}
        image={WEB_DEV_CONTENT.seo.image}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Web Development',
            provider: {
              '@type': 'Organization',
              name: 'Mixture Marketing',
              url: 'https://mixturemarketing.pl',
              logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
            },
            areaServed: 'PL',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Usługi Programistyczne',
              itemListElement: WEB_DEV_CONTENT.projectTypes.map((type) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: type.title,
                  url: `https://mixturemarketing.pl${type.path}`,
                  description: type.desc,
                },
              })),
            },
          },
        ]}
      />

      {/* --- HERO — słowne (PRODUCT.md → Constraints: zero zrzutów realizacji w hero;
          dowód żyje w sekcji Realizacje poniżej). Atrapa WebDevHeroVisual (fejkowy
          Lighthouse 98 / „SEO 100%" / „AA+" / „LCP 0.7s") usunięta wraz z plikiem. --- */}
      {/* CIEMNA STREFA: hero + Realizacje jako jedna bryła granatu. PRODUCT.md:
          „hybryda: ciemny hero+proof, jaśniejsze sekcje treściowe". Wcześniej było
          odwrotnie — blady hero i osamotniony ciemny pas w morzu bieli (12 sekcji
          jasnych na 13). Scroll-takeover (desktop, motion-safe) przypina hero, a
          Realizacje najeżdżają na nie od dołu: obietnica ustępuje dowodowi.
          Mobile / reduced-motion / niskie okna: klasy bierne → klasyczny przepływ. */}
      <div ref={heroRef} className="hero-runway relative">
        <div className="hero-pin">
          <StandardHero
            tone="dark"
            titleNode={<WebDevHeroTitle />}
            title=""
            description={WEB_DEV_CONTENT.hero.description}
            priceHint="od 3 900 zł · realizacja 4–8 tygodni · płatność etapami"
            trustLine={<HeroTrustLine tone="dark" />}
            ctaPrimaryText="Umów się na konsultację"
            ctaPrimaryOnClick={() => openModal('web')}
            ctaSecondaryText="Wyceń projekt"
            ctaSecondaryOnClick={() => navigate('/offers#calculator?type=webApp')}
            ctaSecondaryIcon={Calculator}
            backLinkPath="/"
            backLinkLabel="Wróć na stronę główną"
            bottomBand={
              <div className="flex flex-col gap-4 border-t border-white/10 pt-8 pb-16 sm:flex-row sm:items-center sm:gap-6">
                <span className="shrink-0 text-xxs font-black uppercase tracking-[0.22em] text-white/45">
                  {WEB_DEV_CONTENT.heroTrust.label}
                </span>
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {WEB_DEV_CONTENT.heroTrust.items.map((name) => (
                    <li key={name} className="flex items-center gap-6">
                      <span className="text-sm font-bold tracking-wide text-white/70">{name}</span>
                      <span
                        className="h-1 w-1 rounded-full bg-primary/70 last:hidden"
                        aria-hidden="true"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        </div>
      </div>

      <div className="hero-takeover-offset relative z-10">
        {/* Realizacje — arkusz najeżdżający na hero (data-takeover-front napędza
            --cover). Ten sam granat co hero: to nie jest nowa sekcja, tylko dalszy
            ciąg tej samej ciemni, w której dowód zaczyna świecić. */}
        <LazyHydrate minHeight="700px">
          <WebDevRealizations />
        </LazyHydrate>

        {/* JASNY ARKUSZ — granica ciemnej strefy. Nasuwa się zaokrąglonym grzbietem
            na Realizacje, dokładnie jak arkusz „Kompetencji" na stronie głównej.
            To sygnaturowy ruch redesignu; tej podstronie go brakowało.

            Fakty o firmie. Trzy zmiany względem poprzedniej wersji:
            1. „99.5% Uptime SLA" wycięte — nie jesteśmy w stanie tego zagwarantować
               (decyzja właściciela 2026-07-15); umowne SLA to osobna, płatna opcja.
            2. CountUp usunięty — animowany licznik to metryka „dla efektu" (PRODUCT.md).
            3. Siatka wielkich cyfr z drobnymi etykietami → zdanie. Wielka liczba +
               mikro-label + wsparcie statystykami to hero-metric template, czyli szablon
               SaaS z listy zakazów. Zostają liczby, które właściciel firmuje. */}
        <section className="relative z-10 -mt-10 rounded-t-[2rem] bg-white pt-16 pb-12 md:-mt-16 md:rounded-t-[3rem] md:pt-20">
          <Container>
            <ul className="flex flex-col items-center justify-center gap-y-4 text-center sm:flex-row sm:flex-wrap sm:gap-x-4">
              {[
                { value: '30+', label: 'wdrożeń webowych' },
                { value: '3+', label: 'lata na rynku' },
                { value: '24 h', label: 'na wycenę widełkową' },
              ].map((fact, i) => (
                <li key={fact.label} className="flex items-center gap-4 text-base text-gray-700">
                  {i > 0 && (
                    <span className="hidden h-4 w-px bg-gray-200 sm:block" aria-hidden="true" />
                  )}
                  <span>
                    <span className="font-extrabold text-dark">{fact.value}</span> {fact.label}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <WebDevProjectTypes />

        {/* Sekcja „Technologia to Twój zysk, nie koszt." (sections/TechStack) usunięta
          2026-07-15 wraz z plikiem. Nie dlatego, że była brzydka — dlatego, że miała złą
          treść. Trzy przebudowy wizualne poległy, bo forma nie naprawia sprzeczności:
          hero i FAQ obiecują „technologię dobieramy do Twojego celu", a tamta pokazywała
          jeden stały stos sześciu rzeczy; warstwa PostgreSQL straszyła „rosnącymi
          abonamentami", gdy w menu jest /abonament/; cztery z sześciu nazw padały ekran
          wyżej w WebDevProjectTypes. Właściciel nazwał prawdziwą tezę: sekcja miała
          pokazywać, W CZYM UMIEMY i że WYBÓR ZALEŻY OD PROJEKTU. Stąd StackChoice. */}
        <WebDevStackChoice />

        {/* Sekcja „Panel Administratora" (WebDevAdminPanel) usunięta 2026-07-15:
          stawiała tezę bez dowodu — jej wizual był w całości zmyślony (dashboard
          z „Total Users 12 450", „Revenue $45.2k", „+12% this week", użytkownikiem
          „Jan D." i transakcjami). Prawdziwego zrzutu panelu nie mamy: u Niepodzielnych
          panel należy do Bookero (integrujemy się, nie budowaliśmy go), a KorepetytorAI
          nie ma go w CMS. Teza („klient pracuje w znajomym panelu") wtopiona w copy
          WebDevWpCustom, gdzie stoi obok realnego zrzutu. */}
        <WebDevWpCustom />

        <WebDevEcosystem />

        <WebDevInfrastructure />

        <WebDevComparison />

        {/* --- FAQ — bez `subtitle`: eyebrow „Ekspercka Wiedza" nad „Najczęstsze pytania"
          nic nie wnosił (The Jeden Eyebrow Rule) --- */}
        <FaqSection
          title={WEB_DEV_CONTENT.faq.title}
          items={WEB_DEV_CONTENT.faqs}
          bgClassName="bg-light-gray"
        />

        {/* --- LOKALNY LANDING — LINK DO SPOKE RZESZÓW --- */}
        <Container className="py-12">
          <Link
            to="/web-development/rzeszow/"
            className="group block bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-2xl p-6 md:p-8 transition-colors"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-700 flex-shrink-0">
                <MapPin size={28} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                  Lokalna oferta
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                  Tworzenie stron internetowych dla firm z Rzeszowa →
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Dedykowany cennik, lokalne case studies, spotkania u klienta na terenie Rzeszowa i
                  Podkarpacia (online lub w centrum miasta).
                </p>
              </div>
            </div>
          </Link>
        </Container>

        {/* --- RELATED ARTICLES --- */}
        <LazyHydrate minHeight="600px">
          <RelatedArticles category="web" layout="service" />
        </LazyHydrate>

        {/* --- FINAL CTA --- */}
        <div ref={finalCtaRef}>
          <BaseCta
            title={WEB_DEV_CONTENT.ctaSection.title}
            description={WEB_DEV_CONTENT.ctaSection.description}
            buttonText={WEB_DEV_CONTENT.ctaSection.buttonText}
            icon={Activity}
            onClick={() => openModal('web')}
            variant="gradient"
          />
        </div>
      </div>

      {/* EH2 — Sticky mobile CTA bar (hub ma 200+ linii scroll) */}
      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={finalCtaRef}
        label="Bezpłatna konsultacja"
        sublabel="Wycena widełkowa w 24h"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wyceń"
        onPrimary={() => openModal('web')}
      />
    </div>
  );
};

export default WebDevelopment;
