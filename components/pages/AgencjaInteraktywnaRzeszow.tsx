/* eslint-disable max-lines -- TODO: split into sub-sections */
import React from 'react';
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
  Wrench,
  Eye,
} from 'lucide-react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import LazyMap from '../common/LazyMap';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';

const AgencjaInteraktywnaRzeszow: React.FC = () => {
  const { openModal } = useModal();

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
      question: 'Czy spotkamy się osobiście w Rzeszowie?',
      answer:
        'Tak. Preferujemy spotkania u klienta — dojeżdżamy na terenie Rzeszowa i całego Podkarpacia (Mielec, Stalowa Wola, Krosno, Przemyśl, Dębica, Jasło). Alternatywnie ustalamy spotkanie w wybranej kawiarni lub przestrzeni coworkingowej w centrum Rzeszowa, albo online (Google Meet / Zoom). Standardowo bezpłatna konsultacja trwa 45–60 minut.',
    },
    {
      question: 'Jakie technologie stosujecie?',
      answer:
        'Frontend: React, Next.js, Vue, Astro, vanilla JS. CMS: WordPress, Sanity, Strapi, Shoper, WooCommerce. Backend: Node.js, PHP (Symfony, Laravel), Python. Mobile: React Native, PWA. Design: Figma, Adobe CC. Analityka: GA4, GSC, Hotjar, Clarity. Stack dobieramy do projektu, nie odwrotnie.',
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

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <Container>
          {/* HERO */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-800 text-sm font-bold uppercase tracking-wider mb-6">
              <Sparkles size={16} />
              <span>Agencja Interaktywna · Rzeszów</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
              Agencja Interaktywna{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Rzeszów
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Strategia + design + technologia + marketing pod jednym dachem. Tworzymy strony,
              aplikacje, brandy i kampanie dla firm z Rzeszowa, Mielca, Krosna i całej Polski.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button onClick={() => openModal('general', { specificType: 'interactive_rzeszow' })}>
                Bezpłatna konsultacja
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById('uslugi')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Zobacz usługi
              </Button>
            </div>
          </div>

          {/* H2: Co to jest agencja interaktywna */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Co to jest agencja interaktywna i czym różni się od marketingowej?
            </h2>
            <div className="max-w-3xl mx-auto text-gray-600 space-y-4 leading-relaxed">
              <p>
                <strong>Agencja interaktywna</strong> to firma łącząca trzy światy: kreację (branding,
                design), technologię (web, mobile, apps) i marketing (performance, content, social).
                W odróżnieniu od czystej agencji marketingowej (która głównie planuje i prowadzi
                kampanie) lub czystego software house&apos;u (który koduje), agencja interaktywna
                bierze klienta &quot;od pomysłu do efektu&quot; — od strategii marki, przez identyfikację
                wizualną, stronę, aplikację, aż po kampanie generujące ruch.
              </p>
              <p>
                Mixture Marketing działa w tej formule od początku. Pracujemy z biura przy Al.
                Piłsudskiego 17/4 w Rzeszowie, a nasz zespół łączy: UX/UI designerów, programistów
                (PHP, React, Node.js), specjalistów performance marketing (Google Ads, Meta Ads),
                copywriterów, animatorów i analityków danych. Dzięki temu klient nie musi
                koordynować 3–4 dostawców — wszystko płynie z jednego brieffa.
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
                  link: '/marketing/seo/rzeszow/',
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Dla kogo pracujemy
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase size={28} className="text-primary" />
                  <h3 className="text-xl font-bold">B2B i przemysł</h3>
                </div>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Producenci z Mielca, Stalowej Woli, Rzeszowa</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Klaster Lotnictwa Polskiego, Aviation Valley</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Software house&apos;y i firmy IT z Podkarpacia</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
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
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>E-commerce: sklepy Shoper, WooCommerce, dedykowane</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Kancelarie prawne, gabinety medyczne, fizjoterapia</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Restauracje, hotele, turystyka, agroturystyka</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
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
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-pink-700 uppercase tracking-wider mb-2">
                  Konfigurator · Producent SSE Mielec
                </p>
                <h3 className="text-lg font-bold mb-2">Konfigurator produktów B2B</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Interaktywny konfigurator komponentów lotniczych. PDF eksport, integracja z CRM,
                  formularz zapytania ofertowego.
                </p>
                <p className="text-2xl font-extrabold text-pink-700">+62%</p>
                <p className="text-xs text-gray-500">zapytania ofertowe miesięcznie</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-2">
                  Kalkulator · Firma usługowa Rzeszów
                </p>
                <h3 className="text-lg font-bold mb-2">Kalkulator wyceny online</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Wieloetapowy quiz lead-genowy z natychmiastową wstępną wyceną. Integracja z
                  mailingiem i CRM.
                </p>
                <p className="text-2xl font-extrabold text-violet-700">3.8×</p>
                <p className="text-xs text-gray-500">więcej leadów niż klasyczny formularz</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                  Branding + WWW · Software house
                </p>
                <h3 className="text-lg font-bold mb-2">Rebranding + portal kariery</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Identyfikacja wizualna, strona firmowa Next.js, portal rekrutacyjny z ATS.
                  Employer branding w IT.
                </p>
                <p className="text-2xl font-extrabold text-indigo-700">+210%</p>
                <p className="text-xs text-gray-500">aplikacje kandydatów / kwartał</p>
              </article>
            </div>
            <p className="text-center mt-8">
              <Link
                to="/portfolio/"
                className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
              >
                Zobacz pełne portfolio <ArrowRight size={16} />
              </Link>
            </p>
          </div>

          {/* Cluster internal links */}
          <div className="mb-20 bg-gradient-to-br from-pink-50 to-white rounded-3xl p-8 md:p-12 border border-pink-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 text-pink-800 text-xs font-bold uppercase tracking-wider mb-4">
                  <Wrench size={14} />
                  <span>Cluster lokalny</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Szukasz konkretnej usługi?
                </h3>
                <p className="text-gray-600 mb-6">
                  Mamy dedykowane podstrony lokalne pod konkretne usługi — szczegółowe cenniki,
                  case studies i FAQ.
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/web-development/rzeszow/"
                      className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
                    >
                      → Tworzenie stron internetowych Rzeszów
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/marketing/seo/rzeszow/"
                      className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
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
                    Strona główna oferty lokalnej — pełna oferta 360° w jednym miejscu, model
                    pracy z dojazdem do klienta na Podkarpaciu.
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
            <div className="max-w-3xl mx-auto space-y-6">
              {faq.map((f, i) => (
                <div
                  key={i}
                  className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-3">{f.question}</h3>
                  <p className="text-gray-600">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa + dojazd */}
          <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Spotkajmy się w Rzeszowie
                </h3>
                <p className="text-gray-600 mb-4">
                  Bezpłatna konsultacja (45–60 min) — online (Google Meet / Zoom), u Ciebie w
                  siedzibie lub w neutralnej lokalizacji w centrum Rzeszowa. Omawiamy cele,
                  technologie, harmonogram i budżet.
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Adres:</strong> Al. Józefa Piłsudskiego 17 / 4, 35-074 Rzeszów
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
                <Button onClick={() => openModal('general', { specificType: 'interactive_rzeszow' })}>
                  Zamów konsultację
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video">
                <LazyMap
                  src="https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w&output=embed"
                  title="Mapa — biuro Mixture Marketing Rzeszów"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AgencjaInteraktywnaRzeszow;
