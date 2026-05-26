/* eslint-disable max-lines -- TODO: split into sub-sections (Hero, FAQ, Process) */
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Wrench,
  Globe,
  BarChart3,
  Phone,
  Layers,
} from 'lucide-react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import FounderCard from '../common/FounderCard';
import StickyMobileBar from '../common/StickyMobileBar';
import HeroBadge from '../common/HeroBadge';
import { CountUp } from './abonament/shared';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';

const PozycjonowanieRzeszow: React.FC = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const faq = [
    {
      question: 'Czy warto pozycjonować stronę firmową w Rzeszowie?',
      answer:
        'Tak, jeżeli klient szuka Twojej usługi w Google. W Rzeszowie miesięcznie ~200–500 osób szuka usług lokalnych typu „dentysta Rzeszów", „kancelaria Rzeszów", „agencja marketingowa Rzeszów". Bez pozycjonowania konkurencja zbiera te kliknięcia za darmo. Inwestycja w SEO 1 200–3 500 zł/mies zwraca się przy stawce 200 zł za lead (typowo branża usługowa) już od 15 nowych zapytań/mies.',
    },
    {
      question: 'Ile kosztuje pozycjonowanie strony WWW w Rzeszowie?',
      answer:
        'Cennik widełkowy Mixture Marketing 2026: lokalne SEO (jedno miasto, do 10 fraz) od 1 200 zł/mies; ogólnopolskie SEO (do 30 fraz) od 2 500 zł/mies; e-commerce SEO (500+ SKU) od 3 500 zł/mies; jednorazowy audyt techniczny od 1 900 zł. Wycena zależy od konkurencyjności branży, stanu wyjściowego strony i zakresu prac. Bezpłatna wstępna wycena po 45-minutowym calls.',
    },
    {
      question: 'Po jakim czasie pozycjonowanie zaczyna działać?',
      answer:
        'Pierwsze efekty (poprawa indeksacji, długi ogon) — 4–8 tygodni. Frazy lokalne typu „X Rzeszów" — 3–6 miesięcy. Frazy konkurencyjne ogólnopolskie — 6–12 miesięcy. Lokalne SEO (Mapy Google) działa szybciej niż ogólnopolskie ze względu na mniejszą konkurencję w SERP. Pierwsze konwersje (zapytania ofertowe) typowo pojawiają się po 8–16 tygodniach.',
    },
    {
      question: 'Co dokładnie dostaję w ramach miesięcznej obsługi pozycjonowania?',
      answer:
        'Standardowy zakres: 4–8h prac contentowych (artykuły, optymalizacja istniejących stron), 2–4h prac technicznych (poprawki on-page, schema, Core Web Vitals, internal linking), monitoring pozycji w Senuto/Ahrefs/GSC, raport miesięczny (top fraz, ruch organic, konwersje, top zmiany), miesięczny call statusowy (45 min). Większe pakiety dodatkowo: link building (3–8 linków/mies), copywriting ekspercki, audyt konkurencji 1×/kwartał.',
    },
    {
      question: 'Czym różni się pozycjonowanie lokalne od ogólnopolskiego?',
      answer:
        'Pozycjonowanie lokalne („SEO Rzeszów") opiera się na 3 filarach: (1) Google Business Profile — Mapy Google, Map Pack, geo-targeting; (2) lokalne sygnały on-page — NAP (nazwa/adres/telefon), schema LocalBusiness, podstrony lokalizacyjne; (3) lokalne backlinki — katalogi polskie (panoramafirm, pkt, aleo), Klaster IT Podkarpacie, Politechnika Rzeszowska, media regionalne. Ogólnopolskie wymaga większego content marketingu, mocniejszych backlinków i dłuższego horyzontu (6–12 mies).',
    },
    {
      question: 'Czy gwarantujecie pozycje TOP 10 w Google?',
      answer:
        'Nie — żadna uczciwa agencja SEO nie da takiej gwarancji. Google ma 200+ czynników rankingowych, część jest poza kontrolą agencji (sygnały konkurencji, zmiany algorytmu, zachowanie użytkowników). Gwarantujemy natomiast: udokumentowane prace zgodne z Google Search Essentials, raporty z konkretnych metryk, transparentność procesu, brak praktyk black-hat. Jeżeli ktoś gwarantuje Ci TOP 10 — uciekaj.',
    },
    {
      question: 'Czy pracujecie z umową długoterminową?',
      answer:
        'Polecamy minimum 6 miesięcy — to realistyczne okno czasowe, w którym SEO zaczyna konwertować. Umowy zawieramy na 1, 3, 6 lub 12 miesięcy z miesięcznym okresem wypowiedzenia po pierwszych 3 miesiącach. Po pierwszym kwartale otrzymujesz pełen raport wpływu i decydujesz, czy kontynuujemy.',
    },
    {
      question: 'Jakie branże w Rzeszowie pozycjonujecie najczęściej?',
      answer:
        'Produkcja (Mielec SSE, Stalowa Wola, Aviation Valley), e-commerce (sklepy lokalne + ogólnopolskie z Podkarpacia), kancelarie prawne, branża medyczna (gabinety, fizjoterapia, stomatologia), HoReCa (hotele Bieszczady, restauracje), edukacja (szkoły językowe, kursy), software house i firmy IT, nieruchomości i deweloperzy.',
    },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Pozycjonowanie stron internetowych Rzeszów',
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
      url: `${SITE_CONFIG.domain}/pozycjonowanie-rzeszow/`,
      description:
        'Pozycjonowanie stron WWW w Rzeszowie — proces SEO, cennik, czas efektów, technologie. Lokalne i ogólnopolskie SEO dla firm z Podkarpacia.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Pakiety pozycjonowania Rzeszów',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Pozycjonowanie lokalne Rzeszów' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '1200',
              billingIncrement: 'P1M',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Pozycjonowanie ogólnopolskie' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '2500',
              billingIncrement: 'P1M',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Pozycjonowanie sklepu e-commerce' },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PLN',
              minPrice: '3500',
              billingIncrement: 'P1M',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Audyt techniczny SEO (jednorazowy)' },
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title="Pozycjonowanie Stron Rzeszów — Proces, Cennik, Efekty"
        description="Pozycjonowanie stron internetowych w Rzeszowie — jak działa, ile kosztuje, kiedy zobaczysz efekty. Lokalne i ogólnopolskie SEO dla firm z Rzeszowa i Podkarpacia. Proces krok po kroku + transparentny cennik."
        canonical="/pozycjonowanie-rzeszow/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Pozycjonowanie Rzeszów', item: '/pozycjonowanie-rzeszow/' },
        ]}
        jsonLd={jsonLd}
      />

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <Container>
          {/* HERO */}
          <div ref={heroRef} className="max-w-4xl mx-auto text-center mb-20">
            <HeroBadge accent="secondary" className="mb-6">
              SEO · Rzeszów · Podkarpacie
            </HeroBadge>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
              Pozycjonowanie Stron{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Rzeszów
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Jak działa pozycjonowanie stron WWW, ile kosztuje, kiedy zobaczysz pierwsze efekty.
              Praktyczny przewodnik po lokalnym i ogólnopolskim SEO dla firm z Rzeszowa, Mielca,
              Stalowej Woli i Podkarpacia.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mt-8">
              <Button onClick={() => openModal('general', { specificType: 'seo_rzeszow' })}>
                Bezpłatna konsultacja SEO
              </Button>
              <Link
                to="/agencja-seo-rzeszow/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-dark hover:border-primary hover:bg-pink-50 hover:text-secondary font-bold rounded-full transition-colors motion-safe:focus-visible:-translate-y-0.5"
              >
                <ArrowRight size={18} aria-hidden="true" />
                Zobacz agencję SEO
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Bezpłatna konsultacja 45–60 min · Cennik widełkowy w 24h
            </p>
          </div>

          {/* Stats strip */}
          <div className="max-w-4xl mx-auto mb-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: 6, suffix: '+', label: 'lat doświadczenia', decimals: 0 },
              { value: 200, suffix: '+', label: 'fraz w TOP 30', decimals: 0 },
              { value: 8, suffix: 'tyg', label: 'pierwszych efektów', decimals: 0 },
              {
                value: 1200,
                prefix: 'od ',
                suffix: ' zł',
                label: 'lokalne SEO / mies',
                decimals: 0,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 text-center shadow-sm"
              >
                <p className="text-2xl md:text-3xl font-extrabold text-secondary">
                  {s.prefix || ''}
                  <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* H2: Co to jest pozycjonowanie */}
          <div className="mb-20 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Co to jest pozycjonowanie stron internetowych i jak działa?
            </h2>
            <div className="text-gray-600 space-y-4 leading-relaxed">
              <p>
                <strong>Pozycjonowanie stron</strong> (SEO — Search Engine Optimization) to zespół
                działań technicznych i contentowych mających na celu poprawę widoczności strony
                internetowej w organicznych wynikach wyszukiwarek (Google, Bing). W przeciwieństwie
                do reklam Google Ads (PPC), za kliknięcie z wyników organicznych nie płacisz —
                płacisz za pracę agencji nad pozycjonowaniem.
              </p>
              <p>
                Google rankuje strony na podstawie ponad <strong>200 czynników</strong>{' '}
                rankingowych, podzielonych na trzy główne grupy:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Techniczne</strong> — szybkość ładowania (Core Web Vitals), mobilność,
                  indeksacja, struktura URL, schema markup, bezpieczeństwo HTTPS.
                </li>
                <li>
                  <strong>On-page</strong> — jakość treści, dopasowanie do intencji wyszukiwania,
                  strukturę nagłówków, internal linking, optymalizacja meta tagów.
                </li>
                <li>
                  <strong>Off-page</strong> — linki przychodzące (backlinki), wzmianki o marce,
                  sygnały z social media, autorytet domeny.
                </li>
              </ul>
              <p>
                Pozycjonowanie jest procesem <strong>długofalowym</strong> — pierwsze realne efekty
                pojawiają się po 8–16 tygodniach, pełne dojrzewanie strategii to 6–12 miesięcy.
                Wartością nadrzędną SEO jest <strong>stabilność ruchu</strong> — raz wypozycjonowana
                fraza generuje wizyty przez lata, w przeciwieństwie do Google Ads gdzie ruch znika z
                chwilą wyłączenia budżetu.
              </p>
            </div>
          </div>

          {/* H2: Specyfika lokalna Rzeszów */}
          <div className="mb-20 max-w-4xl mx-auto bg-gradient-to-br from-pink-50 to-white rounded-3xl p-8 md:p-12 border border-pink-100">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={32} className="text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Pozycjonowanie w Rzeszowie — specyfika lokalna
              </h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed">
              <p>
                Rynek SEO w Rzeszowie ma trzy charakterystyczne cechy odróżniające go od Warszawy,
                Krakowa czy Wrocławia:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-5 rounded-2xl border border-pink-100">
                  <p className="text-xs font-semibold text-pink-700 uppercase tracking-wider mb-2">
                    Konkurencja
                  </p>
                  <p className="text-sm">
                    <strong>Mniejsza niż w Warszawie</strong>, ale rosnąca — Aviation Valley, SSE
                    Mielec i napływ kapitału IT (Asseco, ITSG, Pegasystems) podnoszą popyt na SEO
                    B2B.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-pink-100">
                  <p className="text-xs font-semibold text-pink-700 uppercase tracking-wider mb-2">
                    Frazy
                  </p>
                  <p className="text-sm">
                    Dominują frazy <strong>geo-modyfikowane</strong> („X Rzeszów", „X Podkarpacie")
                    — łatwiejsze do wypozycjonowania niż ogólnopolskie head terms.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-pink-100">
                  <p className="text-xs font-semibold text-pink-700 uppercase tracking-wider mb-2">
                    Backlinki
                  </p>
                  <p className="text-sm">
                    Aktywne źródła lokalne — <strong>Klaster IT Podkarpacie</strong>, RARR,
                    Politechnika Rzeszowska, nowiny24.pl, rzeszow-news, biznes.rzeszow.pl.
                  </p>
                </div>
              </div>
              <p className="mt-6">
                <strong>Skutek:</strong> firma w Rzeszowie inwestująca 1 500–2 500 zł/mies w SEO
                lokalne typowo osiąga TOP 10 dla 5–10 fraz w 4–8 miesięcy. Ten sam budżet w
                Warszawie wystarcza często tylko na utrzymanie pozycji.
              </p>
            </div>
          </div>

          {/* H2: Cennik */}
          <div className="mb-20" id="cennik">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Ile kosztuje pozycjonowanie stron WWW w Rzeszowie?
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Cennik widełkowy 2026 — finalna wycena zależy od konkurencyjności branży, stanu
              wyjściowego strony i zakresu prac.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Lokalne SEO',
                  price: 'od 1 200',
                  suffix: 'zł/mies',
                  desc: 'Jedno miasto, do 10 fraz, GBP, on-page, citations.',
                  bestFor: 'Gabinety, kancelarie, usługi B2C',
                },
                {
                  name: 'Ogólnopolskie SEO',
                  price: 'od 2 500',
                  suffix: 'zł/mies',
                  desc: 'Do 30 fraz, content marketing, link building, audyty kwartalne.',
                  bestFor: 'B2B, usługi profesjonalne, SaaS',
                  highlight: true,
                },
                {
                  name: 'E-commerce SEO',
                  price: 'od 3 500',
                  suffix: 'zł/mies',
                  desc: 'Sklepy 500+ SKU, kategorie, produkty, blog, technical SEO.',
                  bestFor: 'WooCommerce, Shoper, dedykowane',
                },
                {
                  name: 'Audyt SEO',
                  price: 'od 1 900',
                  suffix: 'zł (jednorazowo)',
                  desc: 'Pełny audyt techniczny, on-page, content, konkurencji. 40+ stron raportu.',
                  bestFor: 'Punkt startowy, second opinion',
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`relative bg-white p-6 rounded-2xl border ${
                    p.highlight ? 'border-primary shadow-lg' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Najczęściej wybierane
                    </span>
                  )}
                  <h3 className="text-lg font-bold mb-2">{p.name}</h3>
                  <p className="text-3xl font-extrabold text-secondary mb-1">{p.price}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">{p.suffix}</p>
                  <p className="text-sm text-gray-600 mb-4">{p.desc}</p>
                  <p className="text-xs text-gray-500 italic">
                    <strong>Najlepsze dla:</strong> {p.bestFor}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* H2: Proces 6 krokow */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Proces pozycjonowania krok po kroku
            </h2>
            <ol className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  icon: Search,
                  title: 'Audyt techniczny SEO',
                  desc: 'Screaming Frog, GSC, Lighthouse, Core Web Vitals, indeksacja, schema, duplikaty.',
                },
                {
                  icon: BarChart3,
                  title: 'Keyword research i strategia',
                  desc: 'Senuto/Ahrefs, audyt konkurencji Rzeszów + PL, mapa contentu na 6–12 mies.',
                },
                {
                  icon: Wrench,
                  title: 'Optymalizacja on-page',
                  desc: 'Title, meta, H1-H3, URL, internal linking, schema (LocalBusiness, FAQ, Service), CWV.',
                },
                {
                  icon: Layers,
                  title: 'Content marketing',
                  desc: 'Artykuły eksperckie, podstrony usługowe i lokalizacyjne (pillar + spokes), E-E-A-T.',
                },
                {
                  icon: MapPin,
                  title: 'Lokalne SEO i GBP',
                  desc: 'Google Business Profile, citations PL (panoramafirm, pkt, aleo), backlinki Klaster IT.',
                },
                {
                  icon: TrendingUp,
                  title: 'Monitoring i raporty',
                  desc: 'Miesięczny raport (pozycje, ruch, konwersje GSC/GA4), call 45 min, iteracje kwartalne.',
                },
              ].map((s, i) => (
                <li
                  key={s.title}
                  className="flex gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center font-extrabold text-lg">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon size={20} className="text-primary" />
                      <h3 className="font-bold text-lg">{s.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* H2: Lokalne vs ogolnopolskie */}
          <div className="mb-20 max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Pozycjonowanie lokalne vs ogólnopolskie — co wybrać?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={28} className="text-primary" />
                  <h3 className="text-xl font-bold">Lokalne SEO Rzeszów</h3>
                </div>
                <ul className="text-gray-600 space-y-2 text-sm mb-4">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Mniejsza konkurencja → szybsze efekty (3–6 mies)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Niższy budżet (od 1 200 zł/mies)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Map Pack + Google Business Profile</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Idealne: usługi B2C, lokalne sklepy, gabinety</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Globe size={28} className="text-secondary" />
                  <h3 className="text-xl font-bold">Ogólnopolskie SEO</h3>
                </div>
                <ul className="text-gray-600 space-y-2 text-sm mb-4">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Większy zasięg, dłuższy horyzont (6–12 mies)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Wyższy budżet (od 2 500 zł/mies)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Content marketing + link building</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Idealne: B2B, SaaS, e-commerce ogólnopolskie</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cluster — link do agencji */}
          <div className="mb-20 bg-gradient-to-br from-violet-50 to-white rounded-3xl p-8 md:p-12 border border-violet-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-4">
                  <Calendar size={14} />
                  <span>Kolejny krok</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Wiesz już jak działa SEO. Czas wybrać agencję.
                </h3>
                <p className="text-gray-600 mb-6">
                  Zobacz pełną ofertę agencji SEO Mixture Marketing — przykłady realizacji, opinie
                  klientów, warunki współpracy.
                </p>
                <Link
                  to="/agencja-seo-rzeszow/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-full hover:bg-pink-700 transition-colors"
                >
                  Agencja SEO Rzeszów <ArrowRight size={18} />
                </Link>
              </div>
              <div>
                <Link
                  to="/audyt-360/"
                  className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Najpierw sprawdź
                  </p>
                  <h4 className="font-bold mb-2">Darmowy audyt SEO + UX 360° →</h4>
                  <p className="text-sm text-gray-600">
                    Wpisz URL strony — w 60 sekund dostaniesz raport: błędy SEO, Core Web Vitals,
                    porównanie z konkurencją.
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
                  <p className="text-gray-600 mt-3 whitespace-pre-line">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Founder card */}
          <div ref={contactRef} className="mb-12 max-w-4xl mx-auto">
            <FounderCard
              intro="Spotkasz się z Jakubem"
              bio={
                <>
                  Od 2020 prowadzę agencję marketingową w Rzeszowie. Pozycjonowałem strony dla firm
                  produkcyjnych z Mielca, kancelarii prawnych z Rzeszowa, sklepów e-commerce z
                  Podkarpacia. SEO to maraton, nie sprint — opowiem Ci uczciwie, czego oczekiwać i
                  kiedy.
                </>
              }
            />
          </div>

          {/* CTA finalny */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Bezpłatna 45-minutowa konsultacja SEO
            </h2>
            <p className="text-gray-600 mb-6">
              Sprawdzimy razem: stan Twojej strony, potencjał fraz, realny budżet, czas efektów.
              Wycena widełkowa w 24h od briefu.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => openModal('general', { specificType: 'seo_rzeszow' })}>
                Umów konsultację
              </Button>
              <a
                href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-dark hover:border-primary hover:bg-pink-50 hover:text-secondary font-bold rounded-full transition-colors"
              >
                <Phone size={18} aria-hidden="true" />
                Zadzwoń: {SITE_CONFIG.contact.phone}
              </a>
            </div>
          </div>
        </Container>
      </div>

      <StickyMobileBar
        aboveRef={heroRef}
        belowRef={contactRef}
        label="Konsultacja SEO"
        sublabel="45–60 min · bezpłatnie"
        telephone={SITE_CONFIG.contact.phoneFull}
        telephoneDisplay={SITE_CONFIG.contact.phone}
        primaryLabel="Zapytaj"
        onPrimary={() => openModal('general', { specificType: 'seo_rzeszow' })}
      />
    </div>
  );
};

export default PozycjonowanieRzeszow;
