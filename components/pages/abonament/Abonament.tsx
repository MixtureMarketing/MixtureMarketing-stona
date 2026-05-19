/* eslint-disable max-lines -- single-page SaaS marketing landing */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Globe,
  Link as LinkIcon,
  MapPin,
  Building2,
  Inbox,
  LayoutDashboard,
  FileText,
  Shield,
  Receipt,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
  Search,
  TrendingDown,
  Clock,
  AlertCircle,
  Zap,
  X,
  Plus,
  CreditCard,
  Rocket,
  PhoneCall,
  Wrench,
  Scissors,
  Stethoscope,
  Coffee,
  Calculator,
  Briefcase,
} from 'lucide-react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import AmbientBackground from '../../common/AmbientBackground';
import PreonboardModal, { type AbonamentTier, TIERS } from './PreonboardModal';
import { trackEvent } from '../../../utils/analytics';

const PRICING = [
  {
    id: 'starter' as AbonamentTier,
    name: 'Starter',
    tagline: 'Dla mikrofirm',
    price: 149,
    priceGross: 183,
    accent: 'border-gray-100',
    chip: 'bg-blue-100 text-blue-800',
    features: [
      'Strona w technologii Astro (ładowanie <1s)',
      'Hosting Cloudflare Workers',
      'Domena .pl w cenie pakietu',
      'Local SEO — strony pod miasta z Twojego obszaru',
      'Google Business Profile zsynchronizowany',
      'Lead form → SMS do Ciebie w 30 sekund',
      'Panel klienta (leady, faktury, RODO)',
      'RODO + DPA gotowe do podpisu',
    ],
  },
  {
    id: 'standard' as AbonamentTier,
    name: 'Standard',
    tagline: 'Dla rozwijających się',
    price: 199,
    priceGross: 245,
    featured: true,
    accent: 'border-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700',
    diff: 'Wszystko ze Starter + dodatkowo:',
    features: [
      'Blog AI — 2 wpisy miesięcznie (Claude Sonnet)',
      'Raporty miesięczne — ruch, leady, pozycje',
      'Synchronizacja GBP (godziny, posty, oferty)',
      'Reviews flow — automatyczna prośba o opinię (SMS)',
      'Wsparcie 24h response time',
    ],
  },
  {
    id: 'premium' as AbonamentTier,
    name: 'Premium',
    tagline: 'Dla wielolokalizacyjnych',
    price: 299,
    priceGross: 368,
    accent: 'border-gray-100',
    chip: 'bg-violet-100 text-violet-800',
    diff: 'Wszystko ze Standard + dodatkowo:',
    features: [
      'Multi-location (do 5 lokalizacji)',
      'Programmatic SEO — auto strony per miasto',
      'Priorytetowy support (4h response)',
      'Custom branding (logo + kolory)',
      'Dedicated success manager',
    ],
  },
];

const BENEFITS = [
  { icon: Globe, title: 'Strona', desc: 'Astro 5 + Cloudflare Workers. Ładuje w <1 sekundę.' },
  { icon: LinkIcon, title: 'Domena', desc: 'Rejestracja twojafirma.pl w cenie. Należy do Ciebie.' },
  {
    icon: MapPin,
    title: 'Local SEO',
    desc: 'Do 6 stron programmatic pod miasta z Twojego obszaru.',
  },
  {
    icon: Building2,
    title: 'GBP synced',
    desc: 'Google Business Profile zsynchronizowany ze stroną.',
  },
  { icon: Inbox, title: 'Leady na telefon', desc: 'Formularz → SMS do Ciebie w 30 sekund.' },
  {
    icon: LayoutDashboard,
    title: 'Panel klienta',
    desc: 'Leady, faktury, raporty w jednym miejscu.',
  },
  {
    icon: FileText,
    title: 'Blog AI',
    desc: 'Standard+: nowy wpis co 2 tygodnie. Zatwierdzasz przed publikacją.',
  },
  { icon: Shield, title: 'RODO + DPA', desc: 'Wszystko zgodnie z prawem, DPA do podpisu.' },
  { icon: Receipt, title: 'Faktury VAT', desc: 'Automat 1. dnia miesiąca przez Fakturownia.pl.' },
  { icon: Check, title: 'Stała cena', desc: 'Bez ukrytych kosztów. Rezygnacja w każdej chwili.' },
];

const INDUSTRIES = [
  {
    icon: Wrench,
    name: 'Usługi techniczne',
    examples: 'ślusarz, mechanik, hydraulik, elektryk, dekarz, stolarz',
    chip: 'bg-orange-100 text-orange-700',
  },
  {
    icon: Scissors,
    name: 'Beauty i wellness',
    examples: 'fryzjer, kosmetyczka, salon paznokci, masaż',
    chip: 'bg-pink-100 text-pink-700',
  },
  {
    icon: Stethoscope,
    name: 'Medycyna i zdrowie',
    examples: 'dentysta, fizjoterapeuta, lekarz, podolog',
    chip: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Coffee,
    name: 'Gastronomia',
    examples: 'restauracja, kawiarnia, food truck, catering',
    chip: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Calculator,
    name: 'Usługi profesjonalne',
    examples: 'księgowa, prawnik, doradca, tłumacz',
    chip: 'bg-violet-100 text-violet-700',
  },
  {
    icon: Briefcase,
    name: 'Inne',
    examples: 'kwiaciarnia, agent nieruchomości, szkoła językowa — zapytaj o swoją',
    chip: 'bg-emerald-100 text-emerald-700',
  },
];

const STEPS = [
  {
    icon: CreditCard,
    title: 'Wybierasz pakiet',
    desc: 'Klikasz tier i płacisz pierwszą opłatę kartą — Stripe Checkout, 60 sekund.',
    chip: 'bg-blue-100 text-blue-800',
  },
  {
    icon: LayoutDashboard,
    title: 'Wizard onboardingu',
    desc: '5 minut na wypełnienie pytań — godziny pracy, usługi, opinie, obszar.',
    chip: 'bg-violet-100 text-violet-800',
  },
  {
    icon: Rocket,
    title: 'Strona live w 24h',
    desc: 'Robimy stronę za Ciebie. Pod twojafirma.pl + GBP zsynchronizowany.',
    chip: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: PhoneCall,
    title: 'Leady przychodzą',
    desc: 'SMS w 30 sekund. Telefon przed konkurencją.',
    chip: 'bg-amber-100 text-amber-800',
  },
];

const FAQ = [
  {
    q: 'Czy mogę zrezygnować w każdej chwili?',
    a: 'Tak. Anulujesz w panelu klienta, kolejny miesiąc nie zostanie pobrany. Nie ma umowy na rok.',
  },
  {
    q: 'Co jeśli mam już stronę?',
    a: 'Możemy zmigrować content i przekierować Twoją domenę. Doliczamy jednorazowy setup 199 zł — pozostała subskrypcja bez zmian.',
  },
  {
    q: 'Kto jest właścicielem domeny?',
    a: 'Ty. Domena jest rejestrowana na NIP Twojej firmy w OVH — masz pełne prawa, możesz ją w każdej chwili przenieść do innego dostawcy.',
  },
  {
    q: 'Czy muszę cokolwiek robić technicznie?',
    a: 'Nie. Robimy stronę za Ciebie. Wypełniasz 5-minutowy wizard z pytaniami (godziny pracy, usługi, opinie) — resztę przejmujemy my. W panelu klienta widzisz leady, faktury i raporty.',
  },
  {
    q: 'Kto pisze treści na bloga?',
    a: 'Standard i Premium: AI content (Claude Sonnet) generuje wpis, Ty zatwierdzasz przed publikacją. Starter: piszesz przez panel klienta.',
  },
  {
    q: 'Co z RODO?',
    a: 'DPA do podpisu w pakiecie, polityka prywatności na stronie, retencja leadów 24 miesiące. Wszystko zgodnie z RODO i PUODO.',
  },
  {
    q: 'Ile trwa setup?',
    a: '24 godziny od pierwszej płatności. Po wypełnieniu wizardu strona idzie automatycznie do produkcji.',
  },
  {
    q: 'Czy obsługujecie moją branżę?',
    a: '16 wbudowanych branż: ślusarz, mechanik, stolarz, hydraulik, elektryk, dekarz, beauty, fryzjer, dentysta, fizjoterapeuta, księgowa, prawnik, restauracja, kawiarnia, kwiaciarnia. Inne — napisz, podpowiemy.',
  },
];

const Abonament: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openTier, setOpenTier] = useState<AbonamentTier | null>(null);
  const stripeCanceled = searchParams.get('stripe') === 'canceled';
  const pricingRef = useRef<HTMLElement | null>(null);
  const viewPricingTracked = useRef(false);

  // Deep-link support: /abonament/?tier=standard → auto-open modal
  useEffect(() => {
    const tierParam = searchParams.get('tier') as AbonamentTier | null;
    if (tierParam && ['starter', 'standard', 'premium'].includes(tierParam)) {
      setOpenTier(tierParam);
      trackEvent('open_modal', {
        tier: tierParam,
        price_pln: TIERS[tierParam].price,
        source: 'deep_link',
      });
    }
  }, [searchParams]);

  // UTM persistence — zapisz utm_* z URL w sessionStorage, żeby Stripe success URL
  // mógł zachować atrybucję kampanii. Modal pobierze to przy redirect.
  useEffect(() => {
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const present = utmKeys.filter((k) => searchParams.has(k));
    if (present.length === 0) return;
    const utmString = present.map((k) => `${k}=${encodeURIComponent(searchParams.get(k) || '')}`).join('&');
    try {
      sessionStorage.setItem('mm_utm', utmString);
    } catch {
      // sessionStorage może być wyłączony (private mode) — ignoruj
    }
  }, [searchParams]);

  // Cancel banner: scroll do pricing + track
  useEffect(() => {
    if (stripeCanceled) {
      trackEvent('purchase_canceled', { recovery_offered: true });
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stripeCanceled]);

  // Funnel #1 — view_pricing (IntersectionObserver, once)
  useEffect(() => {
    if (!pricingRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !viewPricingTracked.current) {
            viewPricingTracked.current = true;
            trackEvent('view_pricing', { source: window.location.pathname });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(pricingRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePickTier = (tier: AbonamentTier, source: 'pricing_card' | 'hero_cta' = 'pricing_card') => {
    trackEvent('click_tier_button', {
      tier,
      price_pln: TIERS[tier].price,
      source: stripeCanceled ? 'retry_after_cancel' : source,
    });
    setOpenTier(tier);
    trackEvent('open_modal', { tier, price_pln: TIERS[tier].price });
    if (stripeCanceled) {
      const next = new URLSearchParams(searchParams);
      next.delete('stripe');
      setSearchParams(next, { replace: true });
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // ============ JSON-LD ============
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Service', 'Product'],
    name: 'Strona internetowa w abonamencie',
    serviceType: 'SaaS website subscription',
    description:
      'Strona internetowa w modelu abonamentowym dla polskich mikrofirm — strona WWW, Local SEO, Google Business Profile i leady na telefon w stałej miesięcznej cenie od 149 zł.',
    provider: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
      url: 'https://mixturemarketing.pl',
    },
    areaServed: [
      { '@type': 'Country', name: 'Polska' },
      { '@type': 'City', name: 'Rzeszów' },
      { '@type': 'AdministrativeArea', name: 'Podkarpackie' },
    ],
    dateModified: new Date().toISOString().split('T')[0],
    offers: PRICING.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      description: `Pakiet ${p.name} — ${p.tagline}. ${p.price} zł netto / miesiąc.`,
      price: String(p.price),
      priceCurrency: 'PLN',
      eligibleRegion: { '@type': 'Country', name: 'Polska' },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(p.price),
        priceCurrency: 'PLN',
        billingDuration: 'P1M',
        billingIncrement: 1,
        unitText: 'MON',
      },
    })),
  };

  // FAQ schema z poprawnymi selectorami (details/summary, nie itemprop)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.abonament-faq summary', '.abonament-faq .faq-answer'],
    },
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white text-dark">
      <Seo
        title="Strona w abonamencie od 149 zł/mc — gotowa strona WWW dla małej firmy"
        description="Strona w abonamencie od 149 zł/mc. Robimy stronę WWW, SEO lokalne i Google Business Profile za Ciebie. Setup w 24h, bez umowy na rok, własna domena. Wybierz pakiet i zacznij dziś."
        canonical="/abonament/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Strona w abonamencie', item: '/abonament/' },
        ]}
        jsonLd={[serviceJsonLd, faqJsonLd]}
      />

      <AmbientBackground />

      {/* ==================== HERO ==================== */}
      <section className="relative pt-32 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-[120px]" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Nowość · strona od 149 zł/mc</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-dark leading-[1.05] tracking-tight mb-6">
              Strona internetowa{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
                  w&nbsp;abonamencie
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-emerald-200/50 -skew-y-1 -z-0" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-4 max-w-3xl mx-auto">
              <strong className="text-dark">Robimy stronę za Ciebie</strong> — bez wiedzy
              technicznej. Od{' '}
              <strong className="text-dark whitespace-nowrap">149&nbsp;zł&nbsp;netto/mc</strong>.
            </p>
            <p className="text-base md:text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Strona + SEO + Google Business + leady na&nbsp;telefon.
              <br className="hidden sm:block" />
              <span className="font-semibold text-dark">Bez setupu. Bez umowy na rok.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-10 max-w-xl mx-auto">
              <a
                href="#pricing"
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="group flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 motion-safe:hover:-translate-y-1 transition-all"
              >
                Wybierz pakiet
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-dark hover:text-emerald-700 font-bold rounded-full text-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                Jak to działa?
              </a>
            </div>

            {/* Trust signals row - 5 chipów z 'Twoja domena na zawsze' */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
              {[
                { icon: Zap, text: 'Setup w 24h' },
                { icon: Check, text: 'Bez umowy na rok' },
                { icon: X, text: 'Bez ukrytych kosztów' },
                { icon: Globe, text: 'Twoja domena na zawsze' },
                { icon: Shield, text: 'RODO + DPA' },
              ].map((item) => (
                <span
                  key={item.text}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-gray-700"
                >
                  <item.icon size={14} className="text-emerald-600" aria-hidden="true" />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== STRIPE CANCELED BANNER ==================== */}
      {stripeCanceled && (
        <Container>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-12 flex items-start gap-3 max-w-3xl mx-auto">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-dark mb-1">Anulowałeś płatność</p>
              <p className="text-sm text-gray-700">
                Możesz spróbować ponownie — Twój wybór nie został utracony.{' '}
                <a
                  href="#pricing"
                  onClick={(e) => handleSmoothScroll(e, 'pricing')}
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Wróć do pakietów ↑
                </a>
              </p>
            </div>
          </div>
        </Container>
      )}

      {/* ==================== PROBLEM ↔ SOLUTION ==================== */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Czemu właśnie to potrzebujesz
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Mała firma. Brak czasu na marketing.
            </h2>
            <p className="text-lg text-gray-600">
              Trzy konkretne sytuacje, w których strona w abonamencie rozwiązuje to za Ciebie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Search,
                problem: 'Klient szuka Cię w Google. Nie znajduje.',
                solution: 'Strona + GBP w 24h. Pojawiasz się w Mapach.',
              },
              {
                icon: Phone,
                problem: 'Klient wypełnia formularz. Ty nic nie wiesz.',
                solution: 'SMS w 30 sekund. Telefon przed konkurencją.',
              },
              {
                icon: TrendingDown,
                problem: 'Co miesiąc tracisz na agencje, które nic nie dowożą.',
                solution: 'Stała cena. Realne raporty. Możesz wyjść w każdej chwili.',
              },
            ].map((b, i) => (
              <div
                key={i}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                      <b.icon size={20} aria-hidden="true" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600 pt-2">
                      Problem
                    </p>
                  </div>
                  <p className="text-gray-800 font-semibold leading-snug">{b.problem}</p>
                </div>
                <div className="p-6 bg-emerald-50/40">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ArrowRight size={20} aria-hidden="true" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700 pt-2">
                      Rozwiązanie
                    </p>
                  </div>
                  <p className="text-emerald-900 font-bold leading-snug">{b.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== DLA KOGO (industries) ==================== */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Dla kogo
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Strona w abonamencie dla Twojej branży
            </h2>
            <p className="text-lg text-gray-600">
              Mamy gotowe szablony dla 16 typów mikrofirm w Polsce. Inne — zapytaj.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.name}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${ind.chip} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <ind.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-1.5">{ind.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{ind.examples}</p>
              </div>
            ))}
          </div>

          {/* Beta program callout — uczciwy substytut testimoniali */}
          <div className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 text-center">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              <Sparkles size={14} aria-hidden="true" /> Program wczesnego dostępu
            </p>
            <p className="text-base md:text-lg text-dark font-semibold mb-1">
              Jesteśmy w fazie pilotażu z pierwszymi 10 firmami z Podkarpacia.
            </p>
            <p className="text-sm text-gray-600">
              Pełen rebate setupu (199 zł) dla pierwszych 10 klientów. Później wracamy do standardowej ceny.
            </p>
          </div>
        </Container>
      </section>

      {/* ==================== PRICING ==================== */}
      <section
        id="pricing"
        ref={pricingRef}
        className="py-20 md:py-28 relative overflow-hidden bg-gray-50/60"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[150px]" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Pakiety
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Pakiety strony w abonamencie — 149, 199, 299 zł/mc
            </h2>
            <p className="text-lg text-gray-600">
              Trzy pakiety. Płacisz miesięcznie. Rezygnujesz kiedy chcesz.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
            {PRICING.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-3xl p-8 border-2 ${tier.accent} ${
                  tier.featured
                    ? 'shadow-2xl shadow-emerald-500/20 lg:scale-105 lg:-my-2 z-10 ring-2 ring-emerald-500/20'
                    : 'shadow-sm hover:shadow-xl'
                } transition-all flex flex-col h-full`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    ⭐ Najpopularniejszy
                  </div>
                )}

                <div className="mb-6">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tier.chip} mb-4`}
                  >
                    {tier.name}
                  </span>
                  <p className="text-sm text-gray-500 mb-5">{tier.tagline}</p>

                  {/* Netto cena z brutto micro-line */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      od
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-extrabold text-dark">
                      {tier.price}
                    </span>
                    <span className="text-xl text-gray-500 font-semibold">zł / mc</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Netto · <strong className="text-gray-700">brutto: {tier.priceGross} zł</strong>{' '}
                    · Faktura VAT w panelu
                  </p>
                </div>

                {tier.diff && (
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700 mb-4 pb-4 border-b border-emerald-100">
                    {tier.diff}
                  </p>
                )}
                {!tier.diff && (
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    Pakiet bazowy zawiera:
                  </p>
                )}

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed"
                    >
                      <CheckCircle2
                        size={18}
                        className={`shrink-0 mt-0.5 ${
                          tier.featured ? 'text-emerald-600' : 'text-emerald-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handlePickTier(tier.id)}
                  className={
                    tier.featured
                      ? 'w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 motion-safe:hover:-translate-y-0.5 transition-all'
                      : 'w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-dark hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold rounded-full transition-all'
                  }
                >
                  Wybierz {tier.name}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-10">
            Setup w&nbsp;cenie. Rezygnacja w&nbsp;każdej chwili z&nbsp;panelu klienta. Brak ukrytych
            opłat.
          </p>
        </Container>
      </section>

      {/* ==================== BENEFITS GRID ==================== */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              W pakiecie
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Co zawiera abonament strony internetowej
            </h2>
            <p className="text-lg text-gray-600">
              10 elementów, które normalnie kupowałbyś osobno — tutaj zintegrowane w jednej cenie.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-emerald-700 group-hover:text-white transition-all">
                  <b.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-1.5">{b.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== HOW IT WORKS — TIMELINE ==================== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Proces
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Jak działa strona w abonamencie — od zakupu do pierwszego leada
            </h2>
            <p className="text-lg text-gray-600">
              Średnio 24 godziny od pierwszej płatności do strony live.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 -z-10" />

            <div className="grid md:grid-cols-4 gap-6 md:gap-4">
              {STEPS.map((s, i) => (
                <div key={i} className="relative text-center md:text-left">
                  <div className="flex md:block items-center gap-4">
                    <div className="relative flex-shrink-0 mb-0 md:mb-5 mx-0 md:mx-auto">
                      <div className="w-20 h-20 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center font-extrabold text-2xl text-emerald-700 shadow-lg relative z-10">
                        {i + 1}
                      </div>
                      <div
                        className={`absolute -top-1 -right-1 w-7 h-7 ${s.chip} rounded-full flex items-center justify-center shadow z-20`}
                      >
                        <s.icon size={14} aria-hidden="true" />
                      </div>
                    </div>
                    <div className="flex-1 text-left md:text-center">
                      <h3 className="font-extrabold text-dark mb-1">{s.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
              <Clock size={16} aria-hidden="true" />
              Średnio 24 godziny od pierwszej płatności do strony live
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-20 md:py-28 abonament-faq">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Najczęściej zadawane pytania
            </h2>
            <p className="text-lg text-gray-600">
              Krótkie odpowiedzi na to, co najczęściej słyszymy.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((f, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors overflow-hidden shadow-sm"
              >
                <summary className="list-none cursor-pointer p-6 flex items-center justify-between gap-4">
                  <h3 className="font-bold text-dark text-left flex-1">{f.q}</h3>
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center shrink-0 group-open:bg-emerald-600 group-open:text-white transition-colors">
                    <Plus
                      size={18}
                      className="group-open:rotate-45 transition-transform"
                      aria-hidden="true"
                    />
                  </div>
                </summary>
                <div className="faq-answer px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== INTERNAL LINKS / RELATED ==================== */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Powiązane
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight">
              Wolisz dedykowaną stronę?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                title: 'Agencja w Rzeszowie',
                desc: 'Pełna oferta lokalna — marketing 360°, dojazd do klienta',
                link: '/miasto/rzeszow/',
              },
              {
                title: 'Tworzenie stron Rzeszów',
                desc: 'Dedykowane strony WWW i sklepy — od 3 900 zł',
                link: '/web-development/rzeszow/',
              },
              {
                title: 'Pozycjonowanie Rzeszów',
                desc: 'Lokalne i ogólnopolskie SEO — od 1 200 zł/mc',
                link: '/marketing/seo/rzeszow/',
              },
            ].map((r) => (
              <Link
                key={r.link}
                to={r.link}
                className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-dark mb-1 flex items-center gap-2">
                  {r.title}
                  <ArrowRight
                    size={14}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-700"
                    aria-hidden="true"
                  />
                </h3>
                <p className="text-sm text-gray-600">{r.desc}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== COLD-CTA BOTTOM ==================== */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="relative bg-gradient-to-br from-dark via-[#1a2752] to-dark rounded-3xl p-10 md:p-16 text-white overflow-hidden max-w-5xl mx-auto">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full opacity-30 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-emerald-700 rounded-full opacity-40 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-emerald-100 text-xs font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
                <Sparkles size={12} aria-hidden="true" />
                <span>Nie jesteś pewien którego pakietu?</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white leading-tight">
                Porozmawiajmy bez zobowiązań
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
                Jeśli nie wiesz który pakiet wybrać albo masz pytania o swoją branżę — napisz lub
                zadzwoń. 45 minut konsultacji bezpłatnie, bez sprzedażowego pingowania.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:info@mixturemarketing.pl?subject=Pytanie%20o%20abonament"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-white text-dark rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Napisz do nas
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a
                  href="tel:+48794443551"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors"
                >
                  <Phone size={18} aria-hidden="true" />
                  +48 794 443 551
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Modal */}
      <PreonboardModal tier={openTier} onClose={() => setOpenTier(null)} />
    </div>
  );
};

export default Abonament;
