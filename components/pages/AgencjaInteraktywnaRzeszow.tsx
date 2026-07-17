/* eslint-disable max-lines -- TODO: split into sub-sections (Hero, FAQ, Realizacje) */
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Palette,
  Code2,
  Smartphone,
  Layers,
  Zap,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Eye,
  Phone,
} from 'lucide-react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import LazyMap from '../common/LazyMap';
import FounderCard from '../common/FounderCard';
import StickyMobileBar from '../common/StickyMobileBar';
import { CountUp } from './abonament/shared';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';

const AgencjaInteraktywnaRzeszow: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const faq = [
    {
      question: 'Czym agencja interaktywna różni się od marketingowej?',
      answer:
        'Agencja marketingowa skupia się na strategii, kampaniach reklamowych i komunikacji marki. Agencja interaktywna łączy te kompetencje z technologią — tworzy strony WWW, aplikacje, narzędzia interaktywne (konfiguratory, kalkulatory, gry brandowe). Mixture Marketing działa jako agencja interaktywna 360°: strategia + design + development + performance marketing pod jednym dachem.',
    },
    {
      question: 'Co konkretnie robi agencja interaktywna w Rzeszowie?',
      answer:
        'Najczęściej: projektowanie i wdrażanie stron WWW (firmowych, e-commerce, dedykowanych), tworzenie aplikacji webowych i mobilnych, branding cyfrowy, kampanie performance (Google Ads, Meta Ads), kreacje wideo i animacje, audyty UX, prototypowanie w Figma, narzędzia interaktywne (konfiguratory produktów, kalkulatory, quizy lead-genowe).',
    },
    {
      question: 'Ile kosztuje współpraca z agencją interaktywną w Rzeszowie?',
      answer:
        'Pojedynczy projekt (strona WWW + branding) — od 8 500 zł. Stała opieka (web + marketing + design) — pakiety abonamentowe od 3 200 zł/mies. Realizacja dedykowana z aplikacją webową — od 25 000 zł. Bezpłatna wycena widełkowa — wysłana w 24h od briefu.',
    },
    {
      question: 'Jak długo trwa realizacja projektu strony WWW w Rzeszowie?',
      answer:
        'Landing page (1 sekcja, formularz) — 5–10 dni roboczych. Strona firmowa (5–10 podstron, CMS) — 4–8 tygodni. Sklep e-commerce (WooCommerce/Shoper) — 6–12 tygodni. Aplikacja webowa dedykowana (z bazą danych, panel admina) — od 12 tygodni wzwyż. Branding (logo + identyfikacja) — równolegle 3–5 tygodni. Harmonogram dostajesz z dnia 0, statusy 1×/tydz na call lub Slack.',
    },
    {
      question: 'Jakie branże obsługujecie najczęściej w Rzeszowie i na Podkarpaciu?',
      answer:
        'Produkcja (Mielec SSE, Stalowa Wola, Aviation Valley), software house i firmy IT, kancelarie prawne, branża medyczna (gabinety, fizjoterapia, stomatologia), e-commerce (sklepy lokalne + ogólnopolskie), HoReCa (restauracje, hotele Bieszczady), edukacja (szkoły językowe, kursy biznesowe), nieruchomości i deweloperzy. Obsługujemy też klientów z Mielca, Krosna, Przemyśla, Stalowej Woli i Dębicy.',
    },
    {
      question: 'Czy spotkamy się osobiście w Rzeszowie?',
      answer:
        'Tak. Preferujemy spotkania u klienta — dojeżdżamy na terenie Rzeszowa i całego Podkarpacia (Mielec, Stalowa Wola, Krosno, Przemyśl, Dębica, Jasło). Alternatywnie ustalamy spotkanie w wybranej kawiarni lub przestrzeni coworkingowej w centrum Rzeszowa, albo online (Google Meet / Zoom). Standardowo bezpłatna konsultacja trwa 45–60 minut.',
    },
    {
      question: 'Czym Mixture różni się od dużego software house’u?',
      answer:
        'Duże software house’y specjalizują się w długich projektach enterprise (ERP, banking, telco). Mixture jest agencją interaktywną dla MŚP i scale-upów: projekty 8 000–80 000 zł, terminy 4–12 tygodni, jedna osoba kontaktowa, zwinność w decyzjach. Łączymy też marketing i design, czego klasyczny software house nie robi.',
    },
    {
      question: 'Jakie technologie stosujecie?',
      answer:
        'Frontend: React, Next.js, Astro. CMS: WordPress, Sanity, Shoper, WooCommerce. Backend: Node.js, PHP (Laravel), Go. Design: Figma, Adobe CC. Analityka: GA4, GSC, Hotjar, Clarity. Stack dobieramy do projektu, nie odwrotnie.',
    },
    {
      question: 'Czy mogę zobaczyć Wasze realizacje z Rzeszowa i Podkarpacia?',
      answer:
        'Część przypadków objęta jest NDA (zwłaszcza B2B przemysł, Aviation Valley, sektor publiczny). Podczas konsultacji prezentujemy: anonimizowane case studies z konkretnymi metrykami (wzrost konwersji, leadów, ruchu), zrzuty z GA4/GSC, opinie klientów. W portfolio publicznym mamy też kilka rebrandów i stron e-commerce gotowych do pokazania.',
    },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Agencja interaktywna Rzeszów',
      serviceType: 'Interactive Agency / Digital Agency',
      provider: {
        '@type': 'ProfessionalService',
        '@id': `${SITE_CONFIG.domain}/#organization`,
      },
      areaServed: [
        { '@type': 'City', name: 'Rzeszów' },
        { '@type': 'AdministrativeArea', name: 'Podkarpackie' },
        { '@type': 'Country', name: 'Polska' },
      ],
      url: `${SITE_CONFIG.domain}/agencja-interaktywna-rzeszow/`,
      description:
        'Mixture Marketing — agencja interaktywna z Rzeszowa. Strony WWW, aplikacje webowe, branding cyfrowy, performance marketing, narzędzia interaktywne.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Pakiety usług agencji interaktywnej',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Strona WWW + branding (projekt)' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '8500',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Stała opieka 360° (abonament)' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '3200',
              billingIncrement: 'P1M',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Aplikacja webowa dedykowana' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '25000',
            },
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Jak współpracujemy — proces agencji interaktywnej Mixture Marketing',
      description:
        'Sześciofazowy proces realizacji projektu interaktywnego — od briefu, przez koncepcję, design, wdrożenie, aż po launch i opiekę.',
      // totalTime/estimatedCost usunięte — wymyślona „średnia" wysyłana Google jako dana
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Brief i konsultacja',
          text: 'Bezpłatna konsultacja 45–60 min (online lub u klienta). Omawiamy cele biznesowe, grupę docelową, harmonogram i budżet.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Strategia i koncepcja',
          text: 'Research konkurencji, mapa konkurencji w Rzeszowie i ogólnopolsko, dobór technologii, propozycja koncepcji wizualno-funkcjonalnej.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Design i prototyp w Figma',
          text: 'Wireframes, prototyp interaktywny, identyfikacja wizualna, mood board. Iteracje z klientem 2–3 rundy.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Development i integracje',
          text: 'Kodowanie frontend (React/Next/Vue) + backend (Node/PHP), integracje CMS (Sanity/WordPress), CRM, płatności, analityka GA4.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Launch i testy',
          text: 'Testy QA, audyt Core Web Vitals, audyt dostępności WCAG, konfiguracja domeny i hostingu (Cloudflare/Vercel), wdrożenie produkcyjne.',
        },
        {
          '@type': 'HowToStep',
          position: 6,
          name: 'Opieka i marketing',
          text: 'Stała opieka techniczna (abonament), kampanie Google/Meta Ads, SEO, content marketing, miesięczny raport KPI.',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title="Agencja Interaktywna Rzeszów — Web, Branding, Marketing"
        description="Mixture Marketing — agencja interaktywna Rzeszów. Strony WWW, aplikacje webowe, branding cyfrowy, kampanie Google/Meta Ads, narzędzia interaktywne. Spotkania u klienta na terenie Rzeszowa i Podkarpacia, online lub w centrum miasta."
        canonical="/agencja-interaktywna-rzeszow/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Agencja Interaktywna Rzeszów', item: '/agencja-interaktywna-rzeszow/' },
        ]}
        jsonLd={jsonLd}
      />

      {/* Hero words-only w ciemnym rejestrze (lift 2026-07-17) — HeroBadge
          i gradient-text out. */}
      <div ref={heroRef} className="bg-deep-dark text-white pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Agencja interaktywna <span className="text-primary">Rzeszów</span>
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl">
              Strategia + design + technologia + marketing pod jednym dachem. Tworzymy strony,
              aplikacje, brandy i kampanie dla firm z Rzeszowa, Mielca, Krosna i całej Polski.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8">
              <Button onClick={() => openModal('general', { specificType: 'interactive_rzeszow' })}>
                Bezpłatna konsultacja
              </Button>
              <a
                href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border-2 border-white/15 text-white hover:border-primary hover:text-primary font-bold rounded-full transition-colors"
              >
                <Phone size={18} aria-hidden="true" />
                Zadzwoń: {SITE_CONFIG.contact.phone}
              </a>
            </div>
            <p className="text-xs text-white/70 mt-3">
              Pn–Pt 9–17 · Odpowiadamy w 24h · Bezpłatna konsultacja 45–60 min
            </p>
          </div>
        </Container>
      </div>

      <div className="py-20 relative z-10">
        <AmbientBackground />
        <Container className="relative z-10">
          {/* Stats strip — trust signals dla lokalnego B2B */}
          <div className="max-w-4xl mx-auto mb-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: 2020, prefix: 'od ', label: 'doświadczenie zespołu', decimals: 0 },
              { value: 120, suffix: '+', label: 'projektów', decimals: 0 },
              { value: 15, suffix: '+', label: 'branż', decimals: 0 },
              { value: 24, suffix: 'h', label: 'czas odpowiedzi', decimals: 0 },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 text-center shadow-sm"
              >
                <p className="text-3xl md:text-4xl font-extrabold text-secondary">
                  <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* H2: Synonim coverage — agencja digital / studio interaktywne */}
          <div className="mb-20 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Agencja digital, studio interaktywne, agencja kreatywna — co dla kogo?
            </h2>
            <div className="text-gray-600 space-y-4 leading-relaxed">
              <p>
                Na rynku rzeszowskim spotkasz różne nazwy podobnych firm:{' '}
                <strong>agencja digital</strong>, <strong>studio interaktywne</strong>,{' '}
                <strong>agencja kreatywna</strong>, <strong>agencja 360</strong>. W praktyce zakres
                kompetencji mocno się pokrywa — różnica tkwi w punkcie startu i akcencie zespołu.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Agencja digital</strong> — fokus na kampanie performance (Google/Meta
                  Ads), analityka, automatyzacja marketingu, lead-gen. Często bez własnego
                  developmentu.
                </li>
                <li>
                  <strong>Studio interaktywne</strong> — silny dział kreacji i animacji (motion
                  design, video, kreacje banerowe). Dobre do brandingu i kampanii wizualnych.
                </li>
                <li>
                  <strong>Agencja kreatywna</strong> — strategia komunikacji, copywriting, ATL/BTL,
                  social. Słabszy dział technologii.
                </li>
                <li>
                  <strong>Agencja interaktywna 360°</strong> (Mixture Marketing) — wszystkie
                  powyższe kompetencje pod jednym dachem, jedna osoba kontaktowa. Najlepszy wybór
                  dla MŚP, scale-upów i firm B2B na Podkarpaciu, które nie chcą koordynować 3–4
                  dostawców.
                </li>
              </ul>
            </div>
          </div>

          {/* H2: Co to jest agencja interaktywna */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Co to jest agencja interaktywna i czym różni się od marketingowej?
            </h2>
            <div className="max-w-3xl mx-auto text-gray-600 space-y-4 leading-relaxed">
              <p>
                <strong>Agencja interaktywna</strong> to firma łącząca trzy światy: kreację
                (branding, design), technologię (web, mobile, apps) i marketing (performance,
                content, social). W odróżnieniu od czystej agencji marketingowej (która głównie
                planuje i prowadzi kampanie) lub czystego software house&apos;u (który koduje),
                agencja interaktywna bierze klienta &quot;od pomysłu do efektu&quot; — od strategii
                marki, przez identyfikację wizualną, stronę, aplikację, aż po kampanie generujące
                ruch.
              </p>
              <p>
                Mixture Marketing działa w tej formule od początku. Mamy adres rejestrowy przy Al.
                Piłsudskiego 17/4 w Rzeszowie (biuro wirtualne), a pracujemy mobilnie — dojeżdżamy
                do klienta na terenie Rzeszowa i Podkarpacia. Zespół łączy kompetencje UX/UI,
                programowania (PHP, React, Node.js) i performance marketingu (Google Ads, Meta Ads),
                a projekt prowadzi jedna osoba kontaktowa. Dzięki temu klient nie musi koordynować
                3–4 dostawców — wszystko płynie z jednego briefu.
              </p>
            </div>
          </div>

          {/* H2: Uslugi */}
          <div id="uslugi" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Usługi agencji interaktywnej Mixture Marketing
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: Code2,
                  title: 'Strony WWW i aplikacje',
                  desc: 'Landing page, strony firmowe, sklepy, dedykowane systemy. WordPress, Next.js, Sanity.',
                  link: '/web-development/rzeszow/',
                },
                {
                  icon: Palette,
                  title: 'Branding cyfrowy',
                  desc: 'Logo, identyfikacja wizualna, design system, brand book — z myślą o digitalu.',
                  link: '/design/branding/',
                },
                {
                  icon: Eye,
                  title: 'UX/UI Design',
                  desc: 'Wireframes, prototypy Figma, design system, badania użyteczności, audyty UX.',
                  link: '/design/ui-ux/',
                },
                {
                  icon: Zap,
                  title: 'Performance Marketing',
                  desc: 'Google Ads, Meta Ads, kampanie remarketingowe, konfiguracja konwersji, analityka.',
                  link: '/marketing/google-ads/',
                },
                {
                  icon: Sparkles,
                  title: 'SEO i content',
                  desc: 'Pozycjonowanie lokalne i ogólnopolskie, content marketing, pillar pages.',
                  link: '/agencja-seo-rzeszow/',
                },
                {
                  icon: Smartphone,
                  title: 'Narzędzia interaktywne',
                  desc: 'Konfiguratory produktów, kalkulatory wycen, quizy lead-genowe, ankiety.',
                  link: '/web-development/custom-app/',
                },
              ].map((s) => (
                <Link
                  key={s.title}
                  to={s.link}
                  className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 bg-[#F0F7FF] text-secondary rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                    <s.icon size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    {s.title}
                    <ArrowRight
                      size={16}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                    />
                  </h3>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* H2: Dla kogo */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Dla kogo pracujemy</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase size={28} className="text-primary" />
                  <h3 className="text-xl font-bold">B2B i przemysł</h3>
                </div>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Producenci z Mielca, Stalowej Woli, Rzeszowa</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Klaster Lotnictwa Polskiego, Aviation Valley</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Software house&apos;y i firmy IT z Podkarpacia</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Eksport: strony EN/DE/CZ, materiały na targi</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Layers size={28} className="text-secondary" />
                  <h3 className="text-xl font-bold">B2C i usługi</h3>
                </div>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>E-commerce: sklepy Shoper, WooCommerce, dedykowane</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Kancelarie prawne, gabinety medyczne, fizjoterapia</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Restauracje, hotele, turystyka, agroturystyka</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Szkoły językowe, kursy, akademie biznesu</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* H2: Projekty interaktywne */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Projekty interaktywne — wybrane realizacje
            </h2>
            {/* Trzy anonimowe karty z metrykami (+62% / 3.8x / +210%) usunięte —
                wzorzec z pozostałych stron pSEO (liczby bez pomiaru). */}
            <div className="text-center bg-white rounded-3xl p-10 border border-gray-100 shadow-sm max-w-3xl mx-auto mt-12">
              <p className="text-lg text-gray-700 mb-6">
                Budujemy narzędzia interaktywne — konfiguratory produktów, kalkulatory wycen, quizy
                lead-genowe — ale nie pokazujemy tu anonimowych procentów. Podpisane realizacje z
                opisem zakresu prac znajdziesz w portfolio.
              </p>
            </div>
            <p className="text-center mt-8">
              <Link
                to="/portfolio/"
                className="text-secondary hover:underline font-semibold inline-flex items-center gap-2"
              >
                Zobacz pełne portfolio <ArrowRight size={16} />
              </Link>
            </p>
          </div>

          {/* Cluster internal links */}
          <div className="mb-20 bg-blue-50/50 rounded-3xl p-8 md:p-12 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Szukasz konkretnej usługi?</h3>
                <p className="text-gray-600 mb-6">
                  Mamy dedykowane podstrony lokalne pod konkretne usługi — szczegółowe cenniki, case
                  studies i FAQ.
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/web-development/rzeszow/"
                      className="text-secondary hover:underline font-semibold inline-flex items-center gap-2"
                    >
                      → Tworzenie stron internetowych Rzeszów
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/agencja-seo-rzeszow/"
                      className="text-secondary hover:underline font-semibold inline-flex items-center gap-2"
                    >
                      → Pozycjonowanie stron Rzeszów
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <Link
                  to="/miasto/rzeszow/"
                  className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Hub lokalny
                  </p>
                  <h4 className="font-bold mb-2">Mixture Marketing w Rzeszowie →</h4>
                  <p className="text-sm text-gray-600">
                    Strona główna oferty lokalnej — pełna oferta 360° w jednym miejscu, model pracy
                    z dojazdem do klienta na Podkarpaciu.
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              FAQ — Agencja Interaktywna Rzeszów
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faq.map((f, i) => (
                <details
                  key={i}
                  className="group bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 open:shadow-md open:border-primary/20 transition-shadow"
                >
                  <summary className="text-lg font-bold cursor-pointer list-none flex items-start justify-between gap-4 marker:hidden">
                    <span>{f.question}</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 mt-1 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center group-open:rotate-45 group-open:bg-primary/10 group-open:text-primary transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-gray-600 mt-3">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CH1 — Founder trust card: lokalny B2B kupuje od czlowieka */}
          <div ref={contactRef} className="mb-12 max-w-4xl mx-auto">
            <FounderCard
              intro="Spotkasz się z Jakubem"
              bio={
                <>
                  Od 2020 prowadzę agencję marketingową w Rzeszowie. Setki briefów dla firm z
                  Podkarpacia nauczyły mnie jednego: strategia, design i kod muszą trafić do jednej
                  osoby — inaczej projekt utknie w pingu między 3 dostawcami. W Mixture spotkasz się
                  bezpośrednio ze mną, bez handlowca-pośrednika.
                </>
              }
            />
          </div>

          {/* Mapa + dojazd */}
          <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Spotkajmy się w Rzeszowie</h3>
                <p className="text-gray-600 mb-4">
                  Bezpłatna konsultacja (45–60 min) — online (Google Meet / Zoom), u Ciebie w
                  siedzibie lub w neutralnej lokalizacji w centrum Rzeszowa. Omawiamy cele,
                  technologie, harmonogram i budżet.
                </p>
                <address className="not-italic text-gray-700 mb-2">
                  <strong>Adres rejestrowy:</strong> Al. Józefa Piłsudskiego 17 / 4, 35-074 Rzeszów
                  <span className="text-gray-500 text-sm"> · biuro wirtualne</span>
                </address>
                <p className="text-gray-600 text-sm mb-2">
                  Pracujemy mobilnie — dojeżdżamy do klienta na Podkarpaciu.
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Telefon:</strong>{' '}
                  <a
                    href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                    className="text-secondary font-bold hover:underline"
                  >
                    {SITE_CONFIG.contact.phone}
                  </a>
                </p>
                <p className="text-gray-700 mb-6">
                  <strong>E-mail:</strong>{' '}
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="text-secondary font-bold hover:underline"
                  >
                    {SITE_CONFIG.contact.email}
                  </a>
                </p>
                <Button
                  onClick={() => openModal('general', { specificType: 'interactive_rzeszow' })}
                >
                  Zamów konsultację
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video">
                <LazyMap
                  src="https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w&output=embed"
                  title="Mapa — adres rejestrowy Mixture Marketing w Rzeszowie"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* CH5 — Sticky mobile CTA bar */}
      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={contactRef}
        label="Bezpłatna konsultacja"
        sublabel="45–60 min · u Ciebie lub online"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Zapytaj"
        onPrimary={() => openModal('general', { specificType: 'interactive_rzeszow' })}
      />
    </div>
  );
};

export default AgencjaInteraktywnaRzeszow;
