/* eslint-disable max-lines -- TODO: split into sub-sections */
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  MapPin,
  Target,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  FileSearch,
  Globe,
  Layers,
  Wrench,
  Award,
  Phone,
} from 'lucide-react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import LazyMap from '../common/LazyMap';
import FounderCard from '../common/FounderCard';
import StickyMobileBar from '../common/StickyMobileBar';
import HeroBadge from '../common/HeroBadge';
import { CountUp } from './abonament/shared';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';

const SeoRzeszow: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const faq = [
    {
      question: 'Ile kosztuje pozycjonowanie strony w Rzeszowie?',
      answer:
        'Widełki cenowe pozycjonowania w Mixture Marketing: lokalne SEO (jedno miasto, do 10 fraz) od 1 200 zł/mies, ogólnopolskie SEO (do 30 fraz) od 2 500 zł/mies, e-commerce SEO (sklepy z 500+ SKU) od 3 500 zł/mies, audyt techniczny SEO jednorazowy od 1 900 zł. Cennik widełkowy zależy od konkurencyjności branży, stanu wyjściowego strony i zakresu prac. Bezpłatny audyt wstępny + wycena widełkowa po pierwszej konsultacji.',
    },
    {
      question: 'Po jakim czasie zobaczę efekty SEO w Rzeszowie?',
      answer:
        'Pierwsze efekty (poprawa indeksacji, wzrost long-tail) — 4–8 tygodni. Wzrost na frazach średnio-konkurencyjnych Rzeszów (np. „dentysta Rzeszów", „kancelaria Rzeszów") — 3–6 miesięcy. Frazy wysoko-konkurencyjne ogólnopolskie — 6–12 miesięcy. Lokalne SEO (Mapy Google + frazy „w Rzeszowie") działa szybciej niż ogólnopolskie ze względu na mniejszą konkurencję w SERP.',
    },
    {
      question: 'Czym różni się SEO lokalne od ogólnopolskiego?',
      answer:
        'SEO lokalne („SEO Rzeszów") opiera się na 3 filarach: (1) Google Business Profile — Mapy Google, Map Pack w SERP, geo-targeting; (2) lokalne sygnały on-page — NAP (nazwa, adres, telefon), schema LocalBusiness, podstrony lokalizacyjne; (3) lokalne backlinki — katalogi PL (panoramafirm, pkt, aleo), Klaster IT Podkarpacie, Politechnika Rzeszowska, media regionalne (nowiny24, rzeszow-news). SEO ogólnopolskie wymaga większego zaplecza contentowego (blog, baza wiedzy 50+ artykułów), mocniejszych backlinków i dłuższego horyzontu.',
    },
    {
      question: 'Co dostaję w ramach miesięcznej obsługi SEO?',
      answer:
        'Standardowy zakres: 4–8h prac contentowych (nowe artykuły, optymalizacja istniejących), 2–4h prac technicznych (poprawki on-page, schema, Core Web Vitals), monitoring pozycji w Senuto/Ahrefs/GSC, raport miesięczny (top fraz, ruch, konwersje, najważniejsze działania), miesięczny call statusowy (45 min). Większe pakiety dodatkowo: link building (3–8 linków/mies), copywriting eksperckim (2–4 artykuły blog/mies), audyt konkurencji (1×/kwartał).',
    },
    {
      question: 'Czy pracujecie na umowę długoterminową?',
      answer:
        'Polecamy minimum 6 miesięcy współpracy — to realistyczne okno czasowe, w którym SEO zaczyna konwertować. Umowy zawieramy na 1, 3, 6 lub 12 miesięcy z miesięcznym okresem wypowiedzenia po pierwszych 3 miesiącach. Po pierwszym kwartale otrzymujesz pełny raport wpływu i decydujesz, czy kontynuujemy.',
    },
    {
      question: 'Czy mogę zobaczyć Wasze realizacje SEO?',
      answer:
        'Część przypadków objęta jest NDA, ale podczas bezpłatnej konsultacji prezentujemy: realne wykresy z Google Search Console (anonimizowane), wzrosty ruchu organicznego, top fraz na które klient ranguje, ROI estymowany na bazie kosztów Google Ads. Mamy doświadczenie z branżami: produkcja (Mielec, Stalowa Wola), e-commerce (Rzeszów), software house, kancelarie prawne, medycyna, edukacja.',
    },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Pozycjonowanie stron internetowych Rzeszów (SEO)',
      serviceType: 'SEO / Search Engine Optimization',
      provider: {
        '@type': 'ProfessionalService',
        '@id': `${SITE_CONFIG.domain}/#organization`,
      },
      areaServed: [
        { '@type': 'City', name: 'Rzeszów' },
        { '@type': 'AdministrativeArea', name: 'Podkarpackie' },
        { '@type': 'Country', name: 'Polska' },
      ],
      url: `${SITE_CONFIG.domain}/marketing/seo/rzeszow/`,
      description:
        'Pozycjonowanie stron internetowych dla firm z Rzeszowa i Podkarpacia. Lokalne SEO, Google Business Profile, audyt techniczny, content marketing, link building.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Pakiety SEO Rzeszów',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Lokalne SEO Rzeszów' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '1200',
              billingIncrement: 'P1M',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Ogólnopolskie SEO' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '2500',
              billingIncrement: 'P1M',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'E-commerce SEO' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '3500',
              billingIncrement: 'P1M',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Audyt techniczny SEO' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '1900',
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
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Jak działa pozycjonowanie SEO w Rzeszowie — proces Mixture Marketing',
      description:
        'Sześciofazowy proces SEO dla firm z Rzeszowa i Podkarpacia — od audytu, przez strategię, po raportowanie.',
      totalTime: 'P6M',
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'PLN', value: '1500' },
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Audyt SEO',
          text: 'Audyt techniczny (Screaming Frog, GSC, Lighthouse), analiza fraz w Senuto/Ahrefs, audyt konkurencji w Rzeszowie i ogólnopolsko.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Strategia i keyword research',
          text: 'Wybór fraz priorytetowych (lokalne + branżowe), architektura informacji, mapa contentu na 6–12 miesięcy.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Optymalizacja on-page',
          text: 'Poprawa title, meta, nagłówków, struktury URL, schema.org, internal linking, Core Web Vitals.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Content marketing',
          text: 'Tworzenie artykułów eksperckich, podstron usługowych i lokalizacyjnych (pillar + spokes).',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Link building i citations',
          text: 'Polskie katalogi (panoramafirm, pkt, aleo), lokalne backlinki (Klaster IT Podkarpacie, RARR), guest posts.',
        },
        {
          '@type': 'HowToStep',
          position: 6,
          name: 'Raportowanie i optymalizacja',
          text: 'Miesięczny raport pozycji, ruchu i konwersji + call statusowy. Iteracje strategii co kwartał.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title="Pozycjonowanie Stron Rzeszów — Agencja SEO"
        description="Agencja SEO Rzeszów — Mixture Marketing. Pozycjonowanie stron internetowych dla firm z Rzeszowa i Podkarpacia. Lokalne SEO, Google Business Profile, audyty techniczne, content marketing. Cennik widełkowy. Bezpłatny audyt."
        canonical="/marketing/seo/rzeszow/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Marketing', item: '/marketing/' },
          { name: 'SEO', item: '/marketing/seo/' },
          { name: 'Rzeszów', item: '/marketing/seo/rzeszow/' },
        ]}
        jsonLd={jsonLd}
      />

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <Container>
          {/* HERO */}
          <div ref={heroRef} className="max-w-4xl mx-auto text-center mb-20">
            <HeroBadge accent="secondary" className="mb-6">
              SEO · Pozycjonowanie · Rzeszów
            </HeroBadge>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
              Agencja SEO{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Rzeszów
              </span>
              <br />
              Pozycjonowanie Stron Internetowych
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Pozycjonujemy strony dla firm z Rzeszowa, Mielca, Stalowej Woli, Krosna i Przemyśla.
              Lokalne SEO + Mapy Google, ogólnopolskie SEO, e-commerce SEO. Bezpłatny audyt wstępny.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mt-8">
              <Button onClick={() => openModal('general', { specificType: 'seo_rzeszow' })}>
                Bezpłatny audyt SEO
              </Button>
              <a
                href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-dark hover:border-primary hover:bg-blue-50 hover:text-secondary font-bold rounded-full transition-colors motion-safe:focus-visible:-translate-y-0.5"
              >
                <Phone size={18} aria-hidden="true" />
                Zadzwoń: {SITE_CONFIG.contact.phone}
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Pn–Pt 9–17 · Audyt wstępny w 5 dni · Bez zobowiązań
            </p>
          </div>

          {/* H2: Jak dzialamy */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Jak działamy — SEO które konwertuje, nie tylko rankuje
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Pozycjonowanie ma sens tylko wtedy, gdy ruch z Google przekłada się na klientów.
              Łączymy techniczne SEO z performance marketingiem i analityką — każda decyzja opiera
              się na danych z GSC, GA4 i Senuto.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center mb-4">
                  <FileSearch size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Audyt na start</h3>
                <p className="text-sm text-gray-600">
                  Pierwsze 2 tygodnie to pełen audyt: techniczny (Screaming Frog, Lighthouse),
                  contentowy, backlinkowy. Wynik: konkretna lista priorytetów.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                  <Target size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Frazy biznesowe</h3>
                <p className="text-sm text-gray-600">
                  Nie gonimy za vanity metrics. Wybieramy frazy o realnej intencji zakupowej — nawet
                  jeśli wolumen niższy, konwersja wyższa.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Transparentne raporty</h3>
                <p className="text-sm text-gray-600">
                  Miesięczny raport: pozycje, ruch, konwersje, co zrobiliśmy, co dalej. Bez ukrytych
                  metryk i &quot;widoczności w TOP100&quot;.
                </p>
              </div>
            </div>
          </div>

          {/* H2: Dlaczego SEO w Rzeszowie inne */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Dlaczego SEO w Rzeszowie różni się od ogólnopolskiego
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Lokalne SEO w mieście średniej wielkości (Rzeszów — 195 tys. mieszkańców) rządzi się
              innymi prawami niż walka o frazy ogólnopolskie. Krócej, taniej, ale wymaga znajomości
              lokalnego rynku.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <MapPin className="text-violet-600" size={22} />
                  Specyfika lokalna Rzeszów
                </h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Map Pack w SERP zajmuje 30–60% widoku — bez optymalizacji GBP nie wygrasz
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Konkurencja: 50–150 firm per branża zamiast tysięcy — szybsze efekty
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Lokalne sygnały: NAP w katalogach PL, recenzje Google, schema LocalBusiness
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Backlinki regionalne: Klaster IT Podkarpacie, RARR, biznes.rzeszow.pl, PRz
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Globe className="text-blue-600" size={22} />
                  Co działa ogólnopolsko
                </h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Content hub — 50+ artykułów eksperckich, pillar pages, klastry</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Backlink profile — DR 40+ ogólnopolskie portale, branżowe media</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Brand SEO — wzmianki bez linka liczą się dla Google E-E-A-T</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>GEO / AI search — llms.txt, schema, cytowalność dla AI Overviews</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* H2: Zakres uslug */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Zakres usług SEO Mixture Marketing
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: FileSearch,
                  title: 'Audyt techniczny SEO',
                  desc: 'Screaming Frog, GSC, Lighthouse, schema validator. Pełen raport + roadmapa.',
                },
                {
                  icon: MapPin,
                  title: 'Lokalne SEO + GBP',
                  desc: 'Optymalizacja Google Business Profile, citations w PL katalogach, reviews.',
                },
                {
                  icon: Layers,
                  title: 'Content marketing',
                  desc: 'Pillar pages, klastry tematyczne, artykuły eksperckie, FAQ schema.',
                },
                {
                  icon: TrendingUp,
                  title: 'On-page optimization',
                  desc: 'Title, meta, headings, schema.org, internal linking, anchor text.',
                },
                {
                  icon: Wrench,
                  title: 'Core Web Vitals',
                  desc: 'LCP, INP, CLS — optymalizacja wydajności pod Google Page Experience.',
                },
                {
                  icon: Award,
                  title: 'Link building PL',
                  desc: 'Polskie katalogi, guest posts, lokalne backlinki, citations z NAP.',
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 bg-[#F0F7FF] text-secondary rounded-xl flex items-center justify-center mb-4">
                    <s.icon size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* H2: Case study */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Case study — SEO dla firm z Podkarpacia
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Wybrane przypadki realizacji (część anonimowa ze względu na NDA). Pełne dane
              prezentujemy na spotkaniu.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-2">
                  Kancelaria prawna · Rzeszów
                </p>
                <h3 className="text-lg font-bold mb-2">Lokalne SEO + Google Business Profile</h3>
                <p className="text-sm text-gray-600 mb-3">
                  TOP3 dla 8 fraz typu „adwokat Rzeszów", „kancelaria prawna Rzeszów" w 5 miesięcy.
                  Wzrost połączeń z GBP +280%.
                </p>
                <p className="text-2xl font-extrabold text-violet-700">
                  +<CountUp to={340} suffix="%" />
                </p>
                <p className="text-xs text-gray-500">leady z formularza WWW w 6 miesięcy</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                  Producent B2B · SSE Mielec
                </p>
                <h3 className="text-lg font-bold mb-2">Ogólnopolskie SEO + content hub</h3>
                <p className="text-sm text-gray-600 mb-3">
                  35 artykułów eksperckich, podstrony usługowe, pillar pages. TOP10 dla 47 fraz
                  ogólnopolskich w branży lotnictwa.
                </p>
                <p className="text-2xl font-extrabold text-emerald-700">
                  +<CountUp to={127} suffix="%" />
                </p>
                <p className="text-xs text-gray-500">organic traffic w 8 miesięcy</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
                  E-commerce · Podkarpacie
                </p>
                <h3 className="text-lg font-bold mb-2">SEO sklepu — 1200 SKU</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Optymalizacja kategorii, filtrów, snippetów produktowych (Product schema).
                  Konsolidacja duplikatów. Audyt indeksacji.
                </p>
                <p className="text-2xl font-extrabold text-orange-700">
                  −<CountUp to={47} suffix="%" />
                </p>
                <p className="text-xs text-gray-500">CPA — koszt pozyskania klienta</p>
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

          {/* H2: Cennik */}
          <div id="cennik" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Cennik pozycjonowania Rzeszów 2026
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Widełki orientacyjne. Finalna wycena zależy od konkurencyjności branży, stanu
              wyjściowego strony i zakresu prac. Bezpłatny audyt wstępny — wystarczy formularz lub
              telefon.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Lokalne SEO Rzeszów
                </p>
                <p className="text-3xl font-extrabold mb-2">od 1 200 zł/mies</p>
                <p className="text-sm text-gray-600">
                  Do 10 fraz lokalnych. GBP, citations PL, on-page, raport miesięczny.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-primary/40">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  Ogólnopolskie SEO
                </p>
                <p className="text-3xl font-extrabold mb-2">od 2 500 zł/mies</p>
                <p className="text-sm text-gray-600">
                  Do 30 fraz. Content marketing 4–6 art./mies, link building, audyty.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  E-commerce SEO
                </p>
                <p className="text-3xl font-extrabold mb-2">od 3 500 zł/mies</p>
                <p className="text-sm text-gray-600">
                  Sklepy 500+ SKU. Optymalizacja kategorii, Product schema, indeksacja.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Audyt SEO (jednorazowy)
                </p>
                <p className="text-3xl font-extrabold mb-2">od 1 900 zł</p>
                <p className="text-sm text-gray-600">
                  Techniczny + contentowy + backlinkowy. Roadmapa na 6 miesięcy.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-6">
              Minimum współpracy: 3 miesiące. Po pierwszym kwartale otrzymujesz pełen raport wpływu
              i decydujesz, czy kontynuujemy.
            </p>
          </div>

          {/* Internal links — cluster */}
          <div className="mb-20 bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 md:p-12 border border-blue-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
                  <Wrench size={14} />
                  <span>Połącz z web</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  SEO bez dobrej strony nie zadziała
                </h3>
                <p className="text-gray-600 mb-6">
                  Najlepsza optymalizacja SEO nic nie da, jeśli sama strona wczytuje się 6 sekund,
                  nie ma poprawnej struktury URL i schema. Jeśli planujesz większą zmianę — zacznij
                  od solidnego web developmentu.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/web-development/rzeszow/"
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                  >
                    Tworzenie stron internetowych Rzeszów{' '}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/agencja-interaktywna-rzeszow/"
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
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
                    Pełna oferta lokalna: marketing 360°, branding, Google Ads. Pracujemy mobilnie —
                    dojeżdżamy do klienta na Podkarpaciu.
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              FAQ — Pozycjonowanie Rzeszów
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
              intro="Twój kontakt"
              bio={
                <>
                  Od 2020 pozycjonuję strony dla firm z Rzeszowa i Podkarpacia — głównie e-commerce
                  i usługi B2B. Sam czytam dane z GSC, Ahrefs i CrUX, sam piszę rekomendacje. Bez
                  50-stronicowych raportów zlecanych juniorom.
                </>
              }
            />
          </div>

          {/* Mapa + dojazd */}
          <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Bezpłatny audyt SEO Twojej strony
                </h3>
                <p className="text-gray-600 mb-4">
                  Wyślij URL — odeślemy w 5 dni roboczych audyt z konkretnymi rekomendacjami:
                  techniczne błędy, brakujące frazy, konkurencja w Rzeszowie, oszacowanie ROI.
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
                <Button onClick={() => openModal('general', { specificType: 'seo_rzeszow' })}>
                  Zamów bezpłatny audyt SEO
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
        label="Bezpłatny audyt SEO"
        sublabel="Audyt wstępny w 5 dni roboczych"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Audyt"
        onPrimary={() => openModal('general', { specificType: 'seo_rzeszow' })}
      />
    </div>
  );
};

export default SeoRzeszow;
