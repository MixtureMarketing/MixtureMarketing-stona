/* eslint-disable max-lines -- TODO: split into sub-sections (Hero, Cennik, FAQ, Realizacje) */
import React from 'react';
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
  Wrench,
  Sparkles,
} from 'lucide-react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import LazyMap from '../common/LazyMap';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';

const WebDevRzeszow: React.FC = () => {
  const { openModal } = useModal();

  const faq = [
    {
      question: 'Ile kosztuje strona internetowa w Rzeszowie w 2026 roku?',
      answer:
        'Widełki cenowe w Mixture Marketing: prosty landing page od 3 900 zł, strona korporacyjna z CMS od 7 500 zł, sklep internetowy (Shoper/WooCommerce/dedykowany) od 12 000 zł, dedykowana aplikacja webowa od 25 000 zł. Każda wycena jest indywidualna i zależy od liczby podstron, integracji, copywritingu i grafiki. Bezpłatna wycena projektu — wystarczy formularz lub telefon.',
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
      question: 'Czy spotkamy się osobiście w Rzeszowie?',
      answer:
        'Tak. Preferujemy spotkania u klienta — dojeżdżamy na terenie Rzeszowa i całego Podkarpacia (Mielec, Stalowa Wola, Krosno, Przemyśl, Dębica, Jasło). Alternatywnie ustalamy spotkanie w wybranej kawiarni lub przestrzeni coworkingowej w centrum Rzeszowa, albo online (Google Meet / Zoom). Standardowo bezpłatna konsultacja trwa 45–60 minut.',
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
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Landing Page' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              price: '3900',
              minPrice: '3900',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Strona korporacyjna z CMS' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '7500',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Sklep internetowy' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '12000',
            },
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['[itemprop="name"]', '[itemprop="acceptedAnswer"]'],
      },
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
      totalTime: 'P4W',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'PLN',
        value: '7500',
      },
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

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <Container>
          {/* HERO */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-bold uppercase tracking-wider mb-6">
              <Globe size={16} />
              <span>Web Development · Rzeszów</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
              Strony Internetowe{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Rzeszów
              </span>
              <br />
              Tworzenie i Projektowanie WWW
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Tworzymy strony WWW, sklepy e-commerce i aplikacje webowe dla firm z Rzeszowa, Mielca,
              Stalowej Woli, Krosna i Przemyśla. Pracujemy mobilnie — dojeżdżamy do klienta na
              terenie Podkarpacia, wycena widełkowa od pierwszego maila.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button onClick={() => openModal('general', { specificType: 'webdev_rzeszow' })}>
                Bezpłatna wycena
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Zobacz cennik
              </Button>
            </div>
          </div>

          {/* H2: Dla firm z Rzeszowa i Podkarpacia */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Tworzenie stron internetowych dla firm z Rzeszowa i Podkarpacia
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Mixture Marketing to rzeszowski software house z adresem rejestrowym przy Al.
              Piłsudskiego 17/4 (biuro wirtualne) — pracujemy mobilnie, dojeżdżamy do klienta na
              Podkarpaciu. Realizujemy projekty webowe — od prostych landing page&apos;y po
              zaawansowane systemy dedykowane. Pracujemy z lokalnymi firmami z Podkarpacia i
              klientami z całej Polski.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-4">
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
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                  <Workflow size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Full-stack zespół</h3>
                <p className="text-sm text-gray-600">
                  UX designer, programiści (PHP/React/Node.js), marketing, SEO i analityka —
                  wszystko pod jednym dachem. Bez ping-pongowania między 3 podwykonawcami.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-4">
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
                  <Layers className="text-blue-600" size={22} />
                  Kiedy WordPress / Shoper?
                </h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Strona firmowa z CMS dla nietechnicznego zespołu (marketing edytuje treść)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Sklep z gotowymi integracjami: kurierzy, płatności, magazyn</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Budżet do 15 000 zł i czas realizacji 4–6 tygodni</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Zap className="text-violet-600" size={22} />
                  Kiedy Next.js / dedykowana aplikacja?
                </h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Performance marketing — Core Web Vitals jako element strategii SEO</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Aplikacja SaaS / portal klienta / integracje z API zewnętrznymi</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Skala — przewidywany ruch &gt; 50 tys. sesji/mies, peak loads</span>
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
            <div className="grid md:grid-cols-3 gap-6">
              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
                  Producent · SSE Mielec
                </p>
                <h3 className="text-lg font-bold mb-2">Strona korporacyjna B2B + rekrutacja</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Headless Next.js + Sanity CMS. Wielojęzyczność (PL/EN/DE). Landing page
                  rekrutacyjny dla 200+ stanowisk.
                </p>
                <p className="text-2xl font-extrabold text-orange-700">+127%</p>
                <p className="text-xs text-gray-500">organic traffic w 6 miesięcy</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                  E-commerce · Rzeszów
                </p>
                <h3 className="text-lg font-bold mb-2">Sklep B2B wyposażenia biurowego</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Shoper + custom moduł rabatów hurtowych. Integracja z systemem ERP klienta. 1200
                  SKU.
                </p>
                <p className="text-2xl font-extrabold text-emerald-700">−47%</p>
                <p className="text-xs text-gray-500">redukcja kosztu pozyskania klienta</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                  Software House · Podkarpacie
                </p>
                <h3 className="text-lg font-bold mb-2">Rebranding + strona firmowa</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Next.js, animacje Framer Motion, blog techniczny z MDX. Wdrożenie systemu
                  rekrutacyjnego.
                </p>
                <p className="text-2xl font-extrabold text-indigo-700">3.2×</p>
                <p className="text-xs text-gray-500">leady z formularza WWW</p>
              </article>
            </div>
            <p className="text-center mt-8">
              <Link
                to="/portfolio/"
                className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
              >
                Zobacz pełne portfolio realizacji <ArrowRight size={16} />
              </Link>
            </p>
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
                <p className="text-3xl font-extrabold mb-2">od 3 900 zł</p>
                <p className="text-sm text-gray-600">
                  Konwersyjna jedna strona pod kampanie Google Ads / Meta Ads. 7–14 dni.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Strona firmowa
                </p>
                <p className="text-3xl font-extrabold mb-2">od 7 500 zł</p>
                <p className="text-sm text-gray-600">
                  CMS, blog, formularz, integracje analityki. 4–8 tygodni.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-primary/40">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  Sklep internetowy
                </p>
                <p className="text-3xl font-extrabold mb-2">od 12 000 zł</p>
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
          <div className="mb-20 bg-gradient-to-br from-violet-50 to-white rounded-3xl p-8 md:p-12 border border-violet-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-4">
                  <Wrench size={14} />
                  <span>Połącz z marketingiem</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Strona to dopiero początek</h3>
                <p className="text-gray-600 mb-6">
                  Nawet najlepiej zaprojektowana strona bez ruchu organicznego i kampanii Ads
                  pozostanie wizytówką. Po wdrożeniu warto zadbać o widoczność w Google — zarówno
                  organicznie, jak i płatnie.
                </p>
                <Link
                  to="/marketing/seo/rzeszow/"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                >
                  Zobacz ofertę pozycjonowania w Rzeszowie <ArrowRight size={16} />
                </Link>
              </div>
              <div>
                <Link
                  to="/miasto/rzeszow/"
                  className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Hub lokalny
                  </p>
                  <h4 className="font-bold mb-2">Lokalny hub usług w Rzeszowie →</h4>
                  <p className="text-sm text-gray-600">
                    Pełna oferta lokalna: marketing 360°, branding, SEO, Google Ads. Biuro w centrum
                    Rzeszowa.
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
                <p className="text-gray-700 mb-2">
                  <strong>Adres rejestrowy:</strong> Al. Józefa Piłsudskiego 17 / 4, 35-074 Rzeszów
                  <span className="text-gray-500 text-sm"> · biuro wirtualne</span>
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Pracujemy mobilnie — dojeżdżamy do klienta na Podkarpaciu.
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Telefon:</strong>{' '}
                  <a
                    href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                    className="text-primary hover:underline"
                  >
                    {SITE_CONFIG.contact.phone}
                  </a>
                </p>
                <p className="text-gray-700 mb-6">
                  <strong>E-mail:</strong>{' '}
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="text-primary hover:underline"
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
    </div>
  );
};

export default WebDevRzeszow;
