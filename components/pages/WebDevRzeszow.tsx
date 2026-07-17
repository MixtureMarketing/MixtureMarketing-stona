/* eslint-disable max-lines -- TODO: split into sub-sections (Hero, Cennik, FAQ, Realizacje) */
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Globe,
  ShoppingCart,
  Layers,
  Zap,
  Gauge,
  Workflow,
  CheckCircle2,
  ArrowRight,
  Building2,
  Sparkles,
  Phone,
} from 'lucide-react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import LazyMap from '../common/LazyMap';
import FounderCard from '../common/FounderCard';
import StickyMobileBar from '../common/StickyMobileBar';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';

const WebDevRzeszow: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const faq = [
    {
      question: 'Ile kosztuje strona internetowa w Rzeszowie w 2026 roku?',
      answer:
        'Widełki cenowe w Mixture Marketing: prosty landing page od 2 500 zł, strona korporacyjna z CMS od 4 500 zł, sklep internetowy (Shoper/WooCommerce/dedykowany) od 6 000 zł, dedykowana aplikacja webowa od 25 000 zł. Każda wycena jest indywidualna i zależy od liczby podstron, integracji, copywritingu i grafiki. Bezpłatna wycena projektu — wystarczy formularz lub telefon.',
    },
    {
      question: 'Jak długo trwa realizacja strony internetowej?',
      answer:
        'Landing page: 7–14 dni roboczych. Strona korporacyjna z CMS: 4–8 tygodni. Sklep internetowy: 6–12 tygodni w zależności od liczby integracji. Aplikacja dedykowana: od 3 miesięcy. Harmonogram zawsze konsultujemy przed startem.',
    },
    {
      question: 'Czy tworzycie strony na WordPressie czy na Next.js?',
      answer:
        'Obie technologie — wybór zależy od potrzeb. WordPress polecamy dla stron firmowych z CMS dla nietechnicznego zespołu i niższym budżetem. Next.js (React) dla projektów wymagających wysokiej wydajności, integracji z headless CMS (Sanity, Strapi), zaawansowanej animacji lub jako PWA. Sklepy budujemy na Shoper, WooCommerce lub dedykowanym Next.js+Sanity.',
    },
    {
      question: 'Czy strona będzie zoptymalizowana pod SEO i Core Web Vitals?',
      answer:
        'Tak — to standard. Każda strona przechodzi przez audyt Core Web Vitals (LCP, INP, CLS) przed oddaniem. Implementujemy schema.org, sitemap.xml, optymalizację obrazów (WebP/AVIF), lazy loading, prerendering, robots.txt zgodny z aktualnymi standardami AI search. Jeśli potrzebujesz dodatkowo pozycjonowania, zobacz naszą ofertę pozycjonowania stron w Rzeszowie.',
    },
    {
      question: 'Czy oferujecie utrzymanie strony po wdrożeniu?',
      answer:
        'Tak. Dostępne są pakiety wsparcia technicznego (od 290 zł/mies) obejmujące aktualizacje bezpieczeństwa, monitoring, kopie zapasowe i drobne zmiany contentowe. Dla większych klientów oferujemy SLA z gwarantowanym czasem reakcji.',
    },
    {
      question: 'Czy przed kodowaniem spotykamy się na żywo?',
      answer:
        'Tak — Discovery (faza 1 procesu) najczęściej robimy osobiście. Dojeżdżamy do siedziby klienta na terenie Rzeszowa i Podkarpacia (Mielec, Stalowa Wola, Krosno, Przemyśl, Dębica, Jasło), żeby zobaczyć biuro, magazyn lub showroom — to ważne dla wytyczenia copywritingu i zdjęć. Kolejne fazy (Design, Dev, Testing) zwykle prowadzimy online przez Figma + Google Meet. Sprint launch + szkolenie CMS znowu na żywo. Konsultacja Discovery: bezpłatna, 45–60 min.',
    },
  ];

  // Schema: Service + LocalBusiness + FAQPage
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Tworzenie stron internetowych w Rzeszowie',
      serviceType: 'Web Development',
      provider: {
        '@type': 'ProfessionalService',
        '@id': `${SITE_CONFIG.domain}/#organization`,
      },
      areaServed: [
        { '@type': 'City', name: 'Rzeszów' },
        { '@type': 'AdministrativeArea', name: 'Podkarpackie' },
        { '@type': 'Country', name: 'Polska' },
      ],
      url: `${SITE_CONFIG.domain}/web-development/rzeszow/`,
      description:
        'Tworzenie i projektowanie stron internetowych dla firm z Rzeszowa i Podkarpacia. Landing page, strony korporacyjne, sklepy e-commerce, dedykowane aplikacje webowe.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Pakiety stron internetowych Rzeszów',
        itemListElement: [
          // Ceny zgodne z CMS (2026-07-17): landing 2 500, korporacyjna 4 500,
          // sklep 6 000 — poprzednie wartości (3 900/7 500/12 000) właściciel
          // kazał wyciąć już 16.07 na stronach usługowych.
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Landing Page' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '2500',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Strona korporacyjna z CMS' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '4500',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Sklep internetowy' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '6000',
            },
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      // speakable usunięte — selektory itemprop wskazywały w próżnię (brak microdata w DOM)
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
    // HowTo schema — proces 5-fazowy. Cytowalne przez AI Overviews dla zapytan
    // "jak zamowic strone www w Rzeszowie" i podobnych long-tail informational.
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Jak zamówić stronę internetową w Rzeszowie',
      description:
        'Pięciofazowy proces realizacji strony internetowej w Mixture Marketing dla firm z Rzeszowa i Podkarpacia.',
      // totalTime/estimatedCost usunięte — wymyślona „średnia" wysyłana Google jako dana
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Discovery',
          text: 'Bezpłatna konsultacja 45-60 minut. Omawiamy cele biznesowe, persony użytkowników, analizę konkurencji w Rzeszowie i KPI projektu.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'UX/UI Design',
          text: 'Architektura informacji, wireframes, projekt graficzny w Figma. Akceptacja design system przed kodowaniem.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Development',
          text: 'Frontend (React/Next.js lub WordPress) + backend + CMS + integracje (płatności, kurierzy, analityka).',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Testing',
          text: 'Audyt Core Web Vitals (LCP, INP, CLS), testy a11y (WCAG 2.2), cross-browser, security headers.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Launch & SLA',
          text: 'Wdrożenie na produkcję, szkolenie zespołu klienta z CMS, opieka pogwarancyjna (SLA 99.5% uptime, czas reakcji 4h na błąd krytyczny).',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title="Strony Internetowe Rzeszów — Tworzenie i Projektowanie WWW"
        description="Tworzenie stron internetowych dla firm z Rzeszowa i Podkarpacia. Landing page, strony korporacyjne, sklepy e-commerce, aplikacje webowe. WordPress, Next.js, custom CMS. Cennik widełkowy. Bezpłatna wycena projektu."
        canonical="/web-development/rzeszow/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Web Development', item: '/web-development/' },
          { name: 'Rzeszów', item: '/web-development/rzeszow/' },
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
              Strony internetowe <span className="text-primary">Rzeszów</span>
              <br />
              tworzenie i projektowanie WWW
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl">
              Tworzymy strony WWW, sklepy e-commerce i aplikacje webowe dla firm z Rzeszowa, Mielca,
              Stalowej Woli, Krosna i Przemyśla. Pracujemy mobilnie — dojeżdżamy do klienta na
              terenie Podkarpacia, wycena widełkowa od pierwszego maila.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8">
              <Button onClick={() => openModal('general', { specificType: 'webdev_rzeszow' })}>
                Bezpłatna wycena
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
              Pn–Pt 9–17 · Wycena widełkowa w 24h · Bezpłatna konsultacja 45–60 min
            </p>
          </div>
        </Container>
      </div>

      <div className="py-20 relative z-10">
        <AmbientBackground />
        <Container className="relative z-10">
          {/* H2: Dla firm z Rzeszowa i Podkarpacia */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Tworzenie stron internetowych dla firm z Rzeszowa i Podkarpacia
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Mixture Marketing to rzeszowska agencja i software house z adresem rejestrowym przy
              Al. Piłsudskiego 17/4 (biuro wirtualne) — pracujemy mobilnie, dojeżdżamy do klienta na
              Podkarpaciu. Realizujemy projekty webowe — od prostych landing page&apos;y po
              zaawansowane systemy dedykowane. Pracujemy z lokalnymi firmami z Podkarpacia i
              klientami z całej Polski.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 text-secondary rounded-xl flex items-center justify-center mb-4">
                  <Building2 size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Realna lokalność</h3>
                <p className="text-sm text-gray-600">
                  Model pracy mobilnej w Rzeszowie. Spotkania u klienta, dojazd na terenie
                  Podkarpacia (Mielec, Stalowa Wola, Krosno, Przemyśl, Dębica, Jasło) bez
                  dodatkowych opłat.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 text-secondary rounded-xl flex items-center justify-center mb-4">
                  <Workflow size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Full-stack zespół</h3>
                <p className="text-sm text-gray-600">
                  UX designer, programiści (PHP/React/Node.js), marketing, SEO i analityka —
                  wszystko pod jednym dachem. Bez ping-pongowania między 3 podwykonawcami.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 text-secondary rounded-xl flex items-center justify-center mb-4">
                  <Gauge size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Wydajność jako standard</h3>
                <p className="text-sm text-gray-600">
                  Każda strona przechodzi audyt Core Web Vitals przed oddaniem. Lighthouse 90+ jako
                  cel domyślny, nie opcja premium.
                </p>
              </div>
            </div>
          </div>

          {/* H2: Technologie */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Technologie — WordPress, Next.js, custom CMS
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Dobieramy stack do potrzeb biznesowych, nie odwrotnie. Pracujemy z obiema głównymi
              ścieżkami: szybki time-to-market (WordPress / Shoper) lub maksymalna wydajność i
              kontrola (Next.js + headless CMS).
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Layers className="text-secondary" size={22} />
                  Kiedy WordPress / Shoper?
                </h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>
                      Strona firmowa z CMS dla nietechnicznego zespołu (marketing edytuje treść)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Sklep z gotowymi integracjami: kurierzy, płatności, magazyn</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Niższy budżet i czas realizacji 4–6 tygodni</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Zap className="text-secondary" size={22} />
                  Kiedy Next.js / dedykowana aplikacja?
                </h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Performance marketing — Core Web Vitals jako element strategii SEO</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Aplikacja SaaS / portal klienta / integracje z API zewnętrznymi</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Duża skala ruchu i piki obciążenia</span>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-6 max-w-2xl mx-auto">
              Niezdecydowany? Podczas bezpłatnej konsultacji omówimy Twoje cele i zarekomendujemy
              technologię, która faktycznie pasuje — bez sprzedawania &quot;najmodniejszego
              stack&apos;u&quot;.
            </p>
          </div>

          {/* H2: Typy stron */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Typy projektów webowych — co dla Ciebie wykonamy
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[
                {
                  icon: Globe,
                  title: 'Strona firmowa',
                  desc: 'Wizytówka B2B, prezentacja zespołu i usług, blog, formularz kontaktowy.',
                  link: '/web-development/corporate/',
                },
                {
                  icon: Sparkles,
                  title: 'Landing page',
                  desc: 'Konwersyjna strona pod kampanie Google Ads / Meta Ads. A/B testing.',
                  link: '/web-development/landing-page/',
                },
                {
                  icon: ShoppingCart,
                  title: 'Sklep internetowy',
                  desc: 'Shoper, WooCommerce lub dedykowany Next.js + Sanity. Integracje kurier+płatności.',
                  link: '/web-development/ecommerce/',
                },
                {
                  icon: Code2,
                  title: 'Aplikacja dedykowana',
                  desc: 'SaaS, portal klienta, system CRM, panel B2B, integracje API.',
                  link: '/web-development/custom-app/',
                },
              ].map((t) => (
                <Link
                  key={t.title}
                  to={t.link}
                  className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-[#F0F7FF] text-secondary rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                    <t.icon size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    {t.title}
                    <ArrowRight
                      size={16}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                    />
                  </h3>
                  <p className="text-sm text-gray-600">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* H2: Realizacje dla firm z Rzeszowa */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Realizacje dla firm z Rzeszowa i Podkarpacia
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Wybrane projekty (część anonimizowana ze względu na NDA klientów). Pełne case studies
              prezentujemy na spotkaniu.
            </p>
            {/* Trzy anonimowe karty z metrykami (+127% / −47% / 3.2×) usunięte —
                te same liczby powtarzały się na /agencja-seo-rzeszow z innymi
                ramami czasowymi (odcisk palca generatora, nie pomiaru).
                Dowód = podpisane case studies z CMS w portfolio. */}
            <div className="text-center bg-white rounded-3xl p-10 border border-gray-100 shadow-sm max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 mb-6">
                Nie pokazujemy tu anonimowych procentów. Podpisane realizacje — KorepetytorAI,
                Impackt Edu, Fundacja Niepodzielni, Driftmark Marine i kolejne — znajdziesz w
                portfolio z opisem zakresu prac.
              </p>
              <Link
                to="/portfolio/"
                className="text-secondary hover:underline font-semibold inline-flex items-center gap-2"
              >
                Zobacz pełne portfolio realizacji <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* H2: Proces */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Proces i harmonogram realizacji
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Każdy projekt przebiega w 5 fazach. Spotkania statusowe co tydzień, transparentny
              kanban (Notion/ClickUp) z dostępem dla klienta.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { n: '1', title: 'Discovery', desc: 'Cele biznesowe, persony, konkurencja, KPI.' },
                {
                  n: '2',
                  title: 'UX/UI',
                  desc: 'Architektura informacji, wireframe, design system.',
                },
                { n: '3', title: 'Development', desc: 'Frontend + backend + CMS + integracje.' },
                {
                  n: '4',
                  title: 'Testing',
                  desc: 'Core Web Vitals, a11y, cross-browser, security.',
                },
                {
                  n: '5',
                  title: 'Launch & SLA',
                  desc: 'Wdrożenie, szkolenie, opieka pogwarancyjna.',
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"
                >
                  <div className="w-10 h-10 mx-auto bg-primary text-white rounded-full flex items-center justify-center font-bold mb-3">
                    {step.n}
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* H2: Cennik */}
          <div id="cennik" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Cennik tworzenia stron internetowych Rzeszów 2026
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Widełki orientacyjne. Finalna wycena zależy od zakresu funkcjonalności, copywritingu,
              grafiki i integracji. Bezpłatna wycena projektu — wystarczy formularz lub telefon.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Landing Page
                </p>
                <p className="text-3xl font-extrabold mb-2">od 2 500 zł</p>
                <p className="text-sm text-gray-600">
                  Konwersyjna jedna strona pod kampanie Google Ads / Meta Ads. 7–14 dni.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Strona firmowa
                </p>
                <p className="text-3xl font-extrabold mb-2">od 4 500 zł</p>
                <p className="text-sm text-gray-600">
                  CMS, blog, formularz, integracje analityki. 4–8 tygodni.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-primary/40">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  Sklep internetowy
                </p>
                <p className="text-3xl font-extrabold mb-2">od 6 000 zł</p>
                <p className="text-sm text-gray-600">
                  Shoper / WooCommerce / dedykowany. Integracje kurier+płatności. 6–12 tyg.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Aplikacja dedykowana
                </p>
                <p className="text-3xl font-extrabold mb-2">od 25 000 zł</p>
                <p className="text-sm text-gray-600">
                  SaaS, portal klienta, dedykowany system. Od 3 miesięcy.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-6">
              Opieka pogwarancyjna: od 290 zł/mies (security updates, monitoring, kopie zapasowe,
              drobne zmiany).
            </p>
          </div>

          {/* Internal link do SEO spoke */}
          <div className="mb-20 bg-blue-50/50 rounded-3xl p-8 md:p-12 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Strona to dopiero początek</h3>
                <p className="text-gray-600 mb-6">
                  Nawet najlepiej zaprojektowana strona bez ruchu organicznego i kampanii Ads
                  pozostanie wizytówką. Po wdrożeniu warto zadbać o widoczność w Google — zarówno
                  organicznie, jak i płatnie.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/agencja-seo-rzeszow/"
                    className="inline-flex items-center gap-2 text-secondary font-semibold hover:underline"
                  >
                    Pozycjonowanie SEO w Rzeszowie <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/agencja-interaktywna-rzeszow/"
                    className="inline-flex items-center gap-2 text-secondary font-semibold hover:underline"
                  >
                    Agencja interaktywna Rzeszów (pełna oferta 360°){' '}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div>
                <Link
                  to="/miasto/rzeszow/"
                  className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Hub lokalny
                  </p>
                  <h4 className="font-bold mb-2">Mixture w Rzeszowie — pełna oferta →</h4>
                  <p className="text-sm text-gray-600">
                    Marketing 360°, branding, SEO, Google Ads. Pracujemy mobilnie — dojeżdżamy do
                    klienta na Podkarpaciu.
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              FAQ — Strony internetowe Rzeszów
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

          {/* CH1 — Founder trust card */}
          <div ref={contactRef} className="mb-12 max-w-4xl mx-auto">
            <FounderCard
              intro="Z kim się spotkasz"
              bio={
                <>
                  Od 2020 buduję strony WWW i aplikacje webowe dla firm z Podkarpacia. Prowadzę
                  projekt osobiście — od analizy wymagań po wdrożenie — a koduje nasz zespół
                  developerów. Masz jeden punkt kontaktu, bez gry w głuchy telefon między grafikiem
                  a developerem.
                </>
              }
            />
          </div>

          {/* Mapa + dojazd */}
          <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Porozmawiajmy o Twoim projekcie w Rzeszowie
                </h3>
                <p className="text-gray-600 mb-4">
                  Bezpłatna konsultacja (45–60 min) — online (Google Meet / Zoom), u Ciebie w
                  siedzibie lub w neutralnej lokalizacji w centrum Rzeszowa. Omówimy cele,
                  technologie i harmonogram.
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
                <Button onClick={() => openModal('general', { specificType: 'webdev_rzeszow' })}>
                  Bezpłatna wycena projektu
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
        label="Bezpłatna wycena projektu"
        sublabel="Wycena widełkowa w 24h"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Wycena"
        onPrimary={() => openModal('general', { specificType: 'webdev_rzeszow' })}
      />
    </div>
  );
};

export default WebDevRzeszow;
