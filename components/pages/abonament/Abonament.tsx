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
  Wrench,
  Scissors,
  Stethoscope,
  Coffee,
  Calculator,
  Briefcase,
  Bot,
  Cpu,
  Cog,
  Target,
  Wallet,
  Lock,
  ChevronRight,
  Linkedin,
  Mail,
  Minimize2,
  Feather,
  Activity,
  BookOpen,
} from 'lucide-react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import AmbientBackground from '../../common/AmbientBackground';
import PreonboardModal, { type AbonamentTier, TIERS } from './PreonboardModal';
import MagneticButton from './MagneticButton';
import { HeroBadge } from './shared';
import { trackEvent } from '../../../utils/analytics';

// Track 25 (2026-05-19): cennik update 149/199/299 → 179/249/349 + Professional 549.
// Setup 199 zł wycofany (0 zł, wliczone). Promo: -50 zł/mc x3 mies dla pierwszych 10.
const PRICING = [
  {
    id: 'starter' as AbonamentTier,
    name: 'Starter',
    tagline: 'Dla mikrofirm',
    price: 179,
    priceGross: 220,
    accent: 'border-gray-100',
    chip: 'bg-blue-100 text-blue-800',
    // Bullety pisane biznesowo (nie tech) — "co Ci to da" zamiast "jaką technologię"
    features: [
      { text: 'Klienci znajdą Cię w Google Maps i lokalnym SERP', isNew: false },
      { text: 'Własna domena .pl (np. twojafirma.pl) — w cenie', isNew: false },
      { text: 'Sam zmieniasz cennik i godziny pracy w panelu', isNew: false },
      { text: 'Wizytówka Google — pełny setup za Ciebie', isNew: true },
      { text: 'Rezerwacje przez Booksy / Calendly na stronie', isNew: true },
      { text: 'Opinie z Google widoczne na stronie automatycznie', isNew: true },
      { text: 'Telefon-jednym-tap z mobilki (Click-to-call)', isNew: true },
      { text: 'Strona ładuje się <1 sekundę (Cloudflare edge)', isNew: false },
      { text: 'Formularz kontaktowy z ochroną przed botami', isNew: false },
      { text: 'Codzienna kopia zapasowa · SSL · ochrona DDoS', isNew: false },
    ],
  },
  {
    id: 'standard' as AbonamentTier,
    name: 'Standard',
    tagline: 'Dla rozwijających się',
    price: 249,
    priceGross: 306,
    featured: true,
    accent: 'border-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700',
    diff: 'Wszystko ze Starter + dodatkowo:',
    features: [
      { text: 'Do 12 podstron + FAQ + 2 formularze (np. wycena/rezerwacja)', isNew: false },
      { text: 'Galeria z filtrami (np. przed/po dla beauty, kategorie menu)', isNew: true },
      { text: 'Strony pod każdą dzielnicę / okoliczne miejscowości', isNew: true },
      { text: 'Automatyczny SMS-przypominajka dla klientów (1 typ)', isNew: true },
      { text: 'Twoje logo + kolory marki — zindywidualizowany wygląd', isNew: false },
      { text: 'Rozszerzone meta dane dla Google (więcej opinii w SERP)', isNew: false },
      { text: 'Audyt SEO co kwartał + raport pozycji w Google', isNew: false },
    ],
  },
  {
    id: 'premium' as AbonamentTier,
    name: 'Premium',
    tagline: 'Dla wielolokalizacyjnych',
    price: 349,
    priceGross: 429,
    accent: 'border-gray-100',
    chip: 'bg-violet-100 text-violet-800',
    diff: 'Wszystko ze Standard + dodatkowo:',
    features: [
      { text: 'Odpowiedzi na opinie Google — AI proponuje, Ty akceptujesz', isNew: true },
      { text: 'Posty w wizytówce Google co tydzień — automatycznie', isNew: true },
      { text: 'Pomiar które słowa kluczowe dzwonią Ci telefonem (call tracking)', isNew: true },
      { text: 'Nielimitowana liczba podstron', isNew: false },
      { text: 'Blog ekspercki — 2 wpisy/miesiąc generowane przez AI', isNew: false },
      { text: 'Testy A/B przycisków (sprawdzamy co lepiej konwertuje)', isNew: false },
      { text: 'Priorytet w obsłudze — odpowiadamy do 24h', isNew: false },
      { text: 'Audyt SEO co miesiąc + raport pozycji', isNew: false },
    ],
  },
];

// Professional tier — osobny banner pod siatką (branża regulowana, B2B).
const PROFESSIONAL_TIER = {
  id: 'professional' as AbonamentTier,
  name: 'Professional',
  tagline: 'Dla branż profesjonalnych — prawnik, lekarz, księgowy, fizjoterapeuta',
  price: 549,
  priceGross: 675,
  features: [
    'Sekcja "Publikacje i wystąpienia" jako kolekcja CMS',
    'Case studies anonimizowane (zgodne z tajemnicą zawodową)',
    'Bezpieczny upload dokumentów (end-to-end, R2, 30-day retention)',
    'Pakiet RODO+ (DPA jako ADO, rejestr czynności, klauzule informacyjne)',
    'Integracja Cal.com + płatna konsultacja przez Stripe',
    'Wersja językowa EN/UA w cenie',
    'Trust badges (nr wpisu na listę, polisa OC)',
    'AI Blog wyłączony domyślnie (ryzyko reputacyjne)',
    'FOMO / Leadpop wyłączone (nieprofesjonalne dla branży)',
  ],
};

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
  {
    icon: Check,
    title: 'Stała cena',
    desc: 'Minimum 3 mies. współpracy, potem rozliczenie mc-to-mc. Bez ukrytych kosztów.',
  },
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
    icon: FileText,
    title: 'Wypełniasz formularz',
    duration: '3 minuty',
    desc: 'Wybierasz pakiet, podajesz NIP, nazwę firmy, branżę i miasto. Bez maili, bez telefonów.',
    chip: 'bg-blue-100 text-blue-800',
  },
  {
    icon: CreditCard,
    title: 'Płacisz przez Stripe',
    duration: '1 minuta',
    desc: 'BLIK, karta lub przelew. Pełna ochrona kupującego. Umowa minimum 3 miesiące.',
    chip: 'bg-violet-100 text-violet-800',
  },
  {
    icon: LayoutDashboard,
    title: 'Uzupełniasz kreator',
    duration: '10–15 minut',
    desc: 'Logo, zdjęcia, godziny pracy, opis usług — w wygodnym wizardzie. Możesz uzupełnić w 2 turach.',
    chip: 'bg-amber-100 text-amber-800',
  },
  {
    icon: Rocket,
    title: 'Strona idzie online',
    duration: '6 minut',
    desc: 'Provisioning automatyczny: domena, SSL, DNS, GBP, llms.txt — wszystko bez Twojego udziału.',
    chip: 'bg-emerald-100 text-emerald-700',
  },
];

const FAQ = [
  {
    q: 'Ile kosztuje strona w abonamencie?',
    a: 'Mamy 4 pakiety: Starter 179 zł/mc (mikrofirmy), Standard 249 zł/mc (rozwijające się firmy), Premium 349 zł/mc (wielolokalizacyjne) i Professional 549 zł/mc (branże regulowane — prawnik, lekarz, księgowy). Wszystkie ceny netto, brak opłat aktywacyjnych, faktura VAT w panelu. Dla pierwszych 10 klientów: −50 zł/mc przez 3 miesiące.',
  },
  {
    q: 'Czym różni się Professional od Premium?',
    a: 'Professional jest dla branż regulowanych (adwokat, lekarz, księgowy, fizjoterapeuta, doradca), gdzie wymagamy podwyższonych standardów: prywatność klienta, pakiet RODO+ (DPA jako ADO, rejestr czynności, szyfrowanie załączników), sekcja publikacji jako kolekcja CMS, anonimizowane case studies (zgodne z tajemnicą zawodową), bezpieczny upload dokumentów, integracja Cal.com z płatną konsultacją, wersja językowa EN/UA w cenie, trust badges (nr wpisu, polisa OC). AI Blog i FOMO/Leadpop są domyślnie wyłączone — ryzyko reputacyjne.',
  },
  {
    q: 'Dla kogo jest pakiet Professional?',
    a: 'Adwokat, radca prawny, lekarz, dentysta, fizjoterapeuta, księgowy, doradca podatkowy, dietetyk, psycholog — wszędzie tam gdzie obowiązuje tajemnica zawodowa, podwyższone wymogi RODO i klient szuka eksperta a nie "sklepu". Przy stawkach 300–500 zł/h jeden lead zwraca rok abonamentu.',
  },
  {
    q: 'Czy mogę przejść między pakietami?',
    a: 'Tak. Zmiana pakietu odbywa się w panelu klienta i wchodzi w życie od następnego okresu rozliczeniowego. Możesz upgradować (np. Starter → Standard) lub downgradować bez okresu wypowiedzenia.',
  },
  {
    q: 'Jak długo trwa minimalna umowa?',
    a: 'Minimum 3 miesiące, potem rozliczenie mc-to-mc — anulujesz w panelu klienta, kolejny miesiąc nie zostanie pobrany. Po pierwszych 3 mc masz pełną elastyczność.',
  },
  {
    q: 'Co dokładnie kupuję — stronę czy usługę?',
    a: 'Kupujesz subskrypcję serwisu strony — kompletną usługę: utrzymanie infrastruktury, hosting, SSL, backupy, lokalne SEO, Google Business Profile, generowanie leadów, panel klienta, content na bloga (Premium+), i ciągłe ulepszenia. Tak działa Office 365, Netflix, Spotify — płacisz za usługę i jej rozwój, nie za jednorazowe nabycie pliku. Domena jest osobnym tematem (patrz niżej).',
  },
  {
    q: 'Czy mogę wykupić stronę na własność?',
    a: 'Tak, w dowolnym momencie. Cennik wykupu jest jawny: 5 000 zł w pierwszym roku (pełna własność kodu, konfiguracji, contentu jako paczka eksportowa) lub 1 000 zł po przepracowaniu pełnych 12 miesięcy abonamentu (po roku pokrywamy tylko koszt prac przeniesienia). Domena na Twoim NIP zawsze zostaje u Ciebie, niezależnie od decyzji o wykupie.',
  },
  {
    q: 'Dlaczego strona jest u Was, a nie u mnie od początku?',
    a: 'Strona jest głęboko zintegrowana z naszą platformą — panel klienta, lead routing (SMS w 30s), AI Blog, GBP sync, monitoring uptime. Wyciągnięcie tego osobno wymaga prac. Dzięki temu modelowi możemy oferować pakiet 179 zł/mc (przy klasycznym projekcie własnościowym koszt to 6 000–15 000 zł setup + 200 zł/mc hosting/maintenance). Płacisz za wygodę i to że my zajmujemy się serwerem, kodem, aktualizacjami — Ty robisz biznes.',
  },
  {
    q: 'Co jeśli mam już stronę?',
    a: 'Możemy zmigrować content i przekierować Twoją domenę — bez dodatkowych opłat. Migracja jest częścią procesu setup, który jest w cenie pakietu.',
  },
  {
    q: 'Kto jest właścicielem domeny?',
    a: 'To zależy od ustaleń. Domyślnie rejestrujemy domenę na Twój NIP w OVH — masz pełne prawa, możesz ją w każdej chwili przenieść do innego dostawcy. Strona (kod, konfiguracja, infrastruktura) zostaje własnością Mixture przez czas subskrypcji.',
  },
  {
    q: 'Czy muszę cokolwiek robić technicznie?',
    a: 'Nie. Robimy stronę za Ciebie. Wypełniasz 5-minutowy wizard z pytaniami (godziny pracy, usługi, opinie) — resztę przejmujemy my. W panelu klienta widzisz leady, faktury i raporty.',
  },
  {
    q: 'Kto pisze treści na bloga?',
    a: 'Premium: AI content (Claude Haiku) generuje wpis, Ty zatwierdzasz przed publikacją. Starter i Standard: piszesz przez panel klienta. Professional: AI Blog jest domyślnie wyłączony (ryzyko reputacyjne) — Ty piszesz, my pomagamy z SEO.',
  },
  {
    q: 'Co z RODO?',
    a: 'DPA do podpisu w pakiecie, polityka prywatności na stronie, retencja leadów 24 miesiące. Wszystko zgodnie z RODO i PUODO. Professional ma rozszerzony pakiet RODO+ (DPA jako ADO, rejestr czynności, klauzule informacyjne, szyfrowanie załączników).',
  },
  {
    q: 'Ile trwa setup?',
    a: '24 godziny od pierwszej płatności. Po wypełnieniu wizardu strona idzie automatycznie do produkcji. Bez opłat aktywacyjnych.',
  },
  {
    q: 'Czy obsługujecie moją branżę?',
    a: 'Pakiety Starter/Standard/Premium: 16 wbudowanych branż (ślusarz, mechanik, stolarz, hydraulik, elektryk, dekarz, beauty, fryzjer, dentysta, fizjoterapeuta, księgowa, prawnik, restauracja, kawiarnia, kwiaciarnia). Pakiet Professional dedykowany dla branż regulowanych. Inne branże — napisz, podpowiemy.',
  },
];

const Abonament: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Deep-link support: /abonament/?tier=standard → open modal at mount.
  // Lazy initializer zamiast useEffect+setState — unika cascading render warning.
  const [openTier, setOpenTier] = useState<AbonamentTier | null>(() => {
    if (typeof window === 'undefined') return null;
    const tierParam = new URLSearchParams(window.location.search).get(
      'tier',
    ) as AbonamentTier | null;
    return tierParam && ['starter', 'standard', 'premium', 'professional'].includes(tierParam)
      ? tierParam
      : null;
  });
  const stripeCanceled = searchParams.get('stripe') === 'canceled';
  const pricingRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  // N5: scroll z offsetem 80px (sticky header) zamiast scrollIntoView — fix WCAG 2.4.11
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  const viewPricingTracked = useRef(false);
  // H5: sticky mobile CTA bar po wyjściu z hero, ukryty gdy pricing widoczny
  const [showStickyMobileBar, setShowStickyMobileBar] = useState(false);
  const [pricingInView, setPricingInView] = useState(false);

  // Deep-link tracking — jeśli modal otwarty z URL'a, wyślij GA4 event raz po mount
  const deepLinkTrackedRef = useRef(false);
  useEffect(() => {
    if (openTier && !deepLinkTrackedRef.current) {
      deepLinkTrackedRef.current = true;
      trackEvent('open_modal', {
        tier: openTier,
        price_pln: TIERS[openTier].price,
        source: 'deep_link',
      });
    }
  }, [openTier]);

  // UTM persistence — zapisz utm_* z URL w sessionStorage, żeby Stripe success URL
  // mógł zachować atrybucję kampanii. Modal pobierze to przy redirect.
  useEffect(() => {
    const utmKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
    ];
    const present = utmKeys.filter((k) => searchParams.has(k));
    if (present.length === 0) return;
    const utmString = present
      .map((k) => `${k}=${encodeURIComponent(searchParams.get(k) || '')}`)
      .join('&');
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
      scrollToId('pricing');
    }
  }, [stripeCanceled]);

  // Funnel #1 — view_pricing (IntersectionObserver, once) + pricingInView toggle dla H5 bar
  useEffect(() => {
    if (!pricingRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setPricingInView(entry.isIntersecting);
          if (entry.isIntersecting && !viewPricingTracked.current) {
            viewPricingTracked.current = true;
            trackEvent('view_pricing', { source: window.location.pathname });
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(pricingRef.current);
    return () => observer.disconnect();
  }, []);

  // H5 — sticky mobile bar appearance: po wyjściu hero z viewportu (0% widoczny)
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // hero NIE jest widoczny → pokaż bar
          setShowStickyMobileBar(!entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: '-40px 0px 0px 0px' },
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePickTier = (
    tier: AbonamentTier,
    source: 'pricing_card' | 'hero_cta' = 'pricing_card',
  ) => {
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
    scrollToId(id);
  };

  // ============ JSON-LD ============
  // Track 25: 4 offers (Starter 179, Standard 249, Premium 349, Professional 549).
  const allOffers = [...PRICING, PROFESSIONAL_TIER];
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Service', 'Product'],
    name: 'Strona internetowa w abonamencie',
    serviceType: 'SaaS website subscription',
    description:
      'Strona internetowa w modelu abonamentowym dla polskich mikrofirm — strona WWW, Local SEO, Google Business Profile i leady na telefon w stałej miesięcznej cenie od 179 zł.',
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
    offers: allOffers.map((p) => ({
      '@type': 'Offer',
      '@id': `https://mixturemarketing.pl/abonament#offer-${p.id}`,
      name: `Pakiet ${p.name}`,
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
  // Person schema dla zalozyciela — wzmacnia E-E-A-T (Expertise + Authoritativeness)
  // dla AI search (ChatGPT, Perplexity, Google AI Overviews).
  const founderJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://mixturemarketing.pl/#founder',
    name: 'Jakub Niedziela',
    givenName: 'Jakub',
    familyName: 'Niedziela',
    jobTitle: 'Założyciel & Fullstack Developer',
    worksFor: { '@id': 'https://mixturemarketing.pl/#organization' },
    url: 'https://mixturemarketing.pl/abonament/',
    image: 'https://mixturemarketing.pl/assets/team/jakub-niedziela-400.jpg',
    sameAs: ['https://pl.linkedin.com/in/jakub-niedziela-9251a8254'],
    knowsAbout: [
      'Web Development',
      'SEO',
      'Cloudflare Workers',
      'Astro',
      'SaaS architecture',
      'Local marketing',
    ],
    homeLocation: { '@type': 'Place', name: 'Rzeszów, Polska' },
  };

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
    <div className="min-h-screen bg-white text-dark pb-20 md:pb-0">
      <Seo
        title="Strona w abonamencie od 179 zł/mc — gotowa strona WWW dla małej firmy"
        description="Strona w abonamencie od 179 zł/mc. 4 pakiety (179/249/349/549). Robimy stronę WWW, SEO lokalne i Google Business Profile za Ciebie. Setup w 24h, bez opłat aktywacyjnych, umowa od 3 miesięcy. Wybierz pakiet i zacznij dziś."
        canonical="/abonament/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Strona w abonamencie', item: '/abonament/' },
        ]}
        jsonLd={[serviceJsonLd, faqJsonLd, founderJsonLd]}
      />

      <AmbientBackground />

      {/* ==================== HERO ==================== */}
      <section ref={heroRef} className="relative pt-32 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-[120px] motion-safe:animate-blob" />
          <div
            className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-[120px] motion-safe:animate-blob"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <HeroBadge accent="emerald" className="mb-8">
              Nowość · 4 pakiety od 179 zł/mc
            </HeroBadge>

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
              <strong className="text-dark whitespace-nowrap">179&nbsp;zł&nbsp;netto/mc</strong>.
            </p>
            <p className="text-base md:text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Strona + SEO + Google Business + leady na&nbsp;telefon.
              <br className="hidden sm:block" />
              <span className="font-semibold text-dark">
                Bez opłat aktywacyjnych. Minimum 3 mies., potem mc-to-mc.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-10 max-w-xl mx-auto">
              <a
                href="#pricing"
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="group flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 transition-all"
              >
                Wybierz pakiet
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </a>
              <a
                href="#demo"
                onClick={(e) => handleSmoothScroll(e, 'demo')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-dark hover:text-emerald-700 font-bold rounded-full text-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                Zobacz przykłady
              </a>
            </div>

            {/* Trust signals row - 5 chipów z 'Twoja domena na zawsze' */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
              {[
                { icon: Zap, text: 'Setup w 24h' },
                { icon: Check, text: 'Min. 3 mies., potem mc-to-mc' },
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

      {/* ==================== DEMO GALLERY (4 style designu) ==================== */}
      <section id="demo" className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Live demo
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Zobacz 4 style — wybierasz wygląd, my dopasujemy treść
            </h2>
            <p className="text-lg text-gray-600">
              Każdy demo to ten sam silnik (Astro + Cloudflare) ale inny styl wizualny. Po zakupie
              wybierasz styl i wypełniasz wizard — strona dostaje Twoje zdjęcia, opinie, kolory i
              opisy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              {
                url: 'https://demo-minimalist.mixturemarketing.pl/',
                title: 'Minimalist',
                subtitle: 'Czysty, prostotny, dużo whitespace — pasuje do usług profesjonalnych',
                icon: Minimize2,
                chip: 'bg-slate-100 text-slate-700',
                accent: 'from-slate-50 to-white border-slate-100',
              },
              {
                url: 'https://demo-elegant.mixturemarketing.pl/',
                title: 'Elegant',
                subtitle: 'Luksusowy, klasyczny — beauty, fryzjer, spa, butiki',
                icon: Feather,
                chip: 'bg-rose-100 text-rose-700',
                accent: 'from-rose-50 to-white border-rose-100',
              },
              {
                url: 'https://demo-dynamic.mixturemarketing.pl/',
                title: 'Dynamic',
                subtitle: 'Energiczny, kolorowy — gastronomia, fitness, eventy',
                icon: Activity,
                chip: 'bg-violet-100 text-violet-700',
                accent: 'from-violet-50 to-white border-violet-100',
              },
              {
                url: 'https://demo-editorial.mixturemarketing.pl/',
                title: 'Editorial',
                subtitle: 'Magazynowy, typograficzny — eksperci, blog, branże kreatywne',
                icon: BookOpen,
                chip: 'bg-indigo-100 text-indigo-700',
                accent: 'from-indigo-50 to-white border-indigo-100',
              },
            ].map((demo) => (
              <a
                key={demo.url}
                href={demo.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Otwórz demo stylu ${demo.title} (nowa karta)`}
                className={`group bg-gradient-to-br ${demo.accent} p-6 rounded-2xl border hover:shadow-xl hover:-translate-y-1 transition-all`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${demo.chip} rounded-xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  <demo.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-1.5">{demo.title}</h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">{demo.subtitle}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Otwórz live <ArrowRight size={12} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Demo otwierają się w nowej karcie. Każdy demo to prawdziwy produkcyjny Cloudflare Worker
            — zobaczysz prędkość ładowania w realnych warunkach.
          </p>
          <p className="text-center text-xs text-gray-400 mt-3 max-w-2xl mx-auto italic">
            Treści w demo są ilustracyjne. Po zakupie wybierasz preferowany styl i wypełniasz wizard
            — strona dostaje Twoje zdjęcia, opinie, opisy usług, kolory marki i funkcjonalności
            (rezerwacje, formularze, mapa).
          </p>
        </Container>
      </section>

      {/* ==================== DLACZEGO TAK TANIO ==================== */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-50 rounded-full blur-[150px] opacity-50" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Cena vs technologia
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-5">
              Dlaczego 179 zł/mc, a nie 1500?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              <strong className="text-dark">Mixture jest agencją marketingową</strong> — robimy też
              klasyczne, custom strony i kampanie SEO/Ads dla firm z większym budżetem (4 000 – 30
              000 zł projekt). Tam koszt wynika z liczby osobogodzin: copywriter, designer,
              programista, account manager.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong className="text-dark">Strona w abonamencie to osobny produkt</strong> —
              zbudowany od zera w 2025 dla mikrofirm, których nie stać na klasyczne zlecenie.
              Większość pracy wykonuje platforma (AI + Cloudflare + automatyzacja) zamiast ludzi.
              Stąd 179 zł zamiast 1500.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Bot,
                title: 'AI generuje treści',
                desc: 'Claude Sonnet pisze treści blogowe, opisy usług i odpowiedzi na opinie Google. Klient akceptuje jednym kliknięciem — zamiast godzin copywritera.',
                chip: 'bg-violet-100 text-violet-800',
              },
              {
                icon: Zap,
                title: 'Cloudflare Workers (nie VPS)',
                desc: 'Twoja strona to edge worker w 300+ data center na świecie, ładuje w ~200 ms. Hosting nie wymaga osobnego VPS-a per klient (jak przy klasycznym WordPressie).',
                chip: 'bg-orange-100 text-orange-700',
              },
              {
                icon: Cog,
                title: 'Self-service provisioning',
                desc: 'Klient idzie sam przez wizard (25 min), system automatycznie rejestruje domenę, konfiguruje SSL, wgrywa content. Zero ręcznej koordynacji projektu.',
                chip: 'bg-blue-100 text-blue-800',
              },
              {
                icon: MapPin,
                title: 'Local SEO w pakiecie',
                desc: 'Wizytówka Google, schema.org, sitemap, llms.txt — zintegrowane. W klasycznym projekcie agencyjnym to dodatkowa pozycja (1 500–3 000 zł setup).',
                chip: 'bg-emerald-100 text-emerald-700',
              },
              {
                icon: Target,
                title: 'Stała architektura, nie custom',
                desc: 'Wszystkie strony używają tej samej kombinacji (Astro + Sanity + Cloudflare). Nie projektujemy od zera per klient — wymieniamy tylko content, kolory i logo.',
                chip: 'bg-pink-100 text-pink-700',
              },
              {
                icon: Wallet,
                title: 'Bez marży za czas zespołu',
                desc: 'Klasyczny projekt 8 000 zł = 60% to wynagrodzenia osób pracujących nad NIM. Abonament zastępuje większość tych godzin platformą — koszt to głównie infra + support.',
                chip: 'bg-amber-100 text-amber-700',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${item.chip} rounded-xl mb-4`}
                >
                  <item.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-2 leading-tight">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

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
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${ind.chip} rounded-xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  <ind.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-1.5">{ind.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{ind.examples}</p>
              </div>
            ))}
          </div>

          {/* Beta program callout — promo dla pierwszych 10 klientów (Track 25) */}
          <div className="max-w-3xl mx-auto mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-center shadow-xl shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-black uppercase tracking-[0.2em] text-emerald-50 mb-4 border border-white/20">
                <Sparkles size={14} aria-hidden="true" /> Promo · pierwsze 10 firm
              </p>
              <p className="text-xl md:text-2xl font-extrabold mb-2 leading-tight">
                −50 zł/mc przez pierwsze 3 miesiące
              </p>
              <p className="text-sm md:text-base text-emerald-50">
                Oszczędzasz do <strong className="text-white">150 zł</strong> na starcie. Dla
                pierwszych 10 firm z&nbsp;Podkarpacia. Później wracamy do standardowej ceny.
              </p>
            </div>
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
              Pakiety strony w abonamencie — 179, 249, 349 zł/mc
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
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    <Sparkles size={12} aria-hidden="true" />
                    Najpopularniejszy
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
                    Netto · <strong className="text-gray-700">brutto {tier.priceGross} zł</strong>{' '}
                    (VAT 23%) · ≈{' '}
                    <strong className="text-gray-700">{tier.price * 12} zł/rok netto</strong>
                  </p>
                  <p className="text-xxs text-gray-400 mt-0.5">
                    Bez opłaty aktywacyjnej · Faktura VAT 1. dnia miesiąca
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
                      key={f.text}
                      className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed"
                    >
                      <CheckCircle2
                        size={18}
                        className={`shrink-0 mt-0.5 ${
                          tier.featured ? 'text-emerald-600' : 'text-emerald-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        {f.text}
                        {f.isNew && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xxs font-black uppercase tracking-wider align-middle">
                            Nowe
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <MagneticButton
                  type="button"
                  strength={tier.featured ? 0.35 : 0.25}
                  onClick={() => handlePickTier(tier.id)}
                  className={
                    tier.featured
                      ? 'w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow'
                      : 'w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-dark hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold rounded-full transition-colors'
                  }
                >
                  Wybierz {tier.name}
                  <ArrowRight size={18} aria-hidden="true" />
                </MagneticButton>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-10">
            Bez&nbsp;opłat aktywacyjnych. Umowa minimum 3 miesiące, potem rozliczenie mc-to-mc. Po
            roku możesz wykupić stronę na własność (opcja).
          </p>

          {/* ============ PROFESSIONAL TIER BANNER ============ */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-br from-slate-900 via-[#1a2752] to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-amber-400 rounded-full opacity-15 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-emerald-500 rounded-full opacity-20 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid lg:grid-cols-5 gap-8 items-start">
                {/* Lewa kolumna — heading + cena + CTA */}
                <div className="lg:col-span-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 backdrop-blur-sm text-amber-200 text-xs font-black uppercase tracking-[0.2em] mb-5 border border-amber-500/30">
                    <Briefcase size={12} aria-hidden="true" />
                    <span>Branże regulowane</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                    Pakiet Professional
                  </h3>
                  <p className="text-base text-slate-300 mb-6 leading-relaxed">
                    Dla{' '}
                    <strong className="text-white">
                      adwokatów, lekarzy, księgowych, fizjoterapeutów, doradców
                    </strong>{' '}
                    — gdzie wymagamy podwyższonych standardów prywatności i RODO.
                  </p>

                  <div className="mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      od
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl md:text-6xl font-extrabold text-white">
                      {PROFESSIONAL_TIER.price}
                    </span>
                    <span className="text-xl text-slate-300 font-semibold">zł / mc</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Netto · brutto: {PROFESSIONAL_TIER.priceGross} zł · Faktura VAT w panelu
                  </p>

                  <p className="text-sm text-emerald-300 font-semibold mb-6 leading-relaxed">
                    Przy stawkach 300–500 zł/h jeden lead zwraca rok abonamentu.
                  </p>

                  <button
                    type="button"
                    onClick={() => handlePickTier(PROFESSIONAL_TIER.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-full shadow-lg hover:shadow-amber-500/40 motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:-translate-y-0.5 transition-all"
                  >
                    Zapytaj o Professional
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>

                {/* Prawa kolumna — lista ficzerów */}
                <div className="lg:col-span-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-4">
                    Wszystko z pakietu Premium + dodatkowo:
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                    {PROFESSIONAL_TIER.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed"
                      >
                        <CheckCircle2
                          size={16}
                          className="shrink-0 mt-0.5 text-emerald-400"
                          aria-hidden="true"
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
                    {/* w-20 EXPLICIT zeby outer wrapper byl 80x80 tak jak kolko —
                        bez tego mx-auto centruje pelne fluid width, a absolute -top -right
                        ikonka odlatuje do prawego rogu parent container, nie kolka. */}
                    <div className="relative flex-shrink-0 w-20 h-20 mb-0 md:mb-5 mx-0 md:mx-auto">
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
                      <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-emerald-700 mb-2">
                        <Clock size={11} aria-hidden="true" />
                        {s.duration}
                      </p>
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
              Razem ~25 minut od decyzji do działającej strony
            </div>
            <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
              Bez maili, bez telefonów, bez „spotkania zoom z konsultantem". Pełna automatyzacja od
              formularza do live URL.
            </p>
          </div>
        </Container>
      </section>

      {/* ==================== TRUST SIGNALS GRID ==================== */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Konkret, nie marketing
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Co stoi za tymi cenami
            </h2>
            <p className="text-lg text-gray-600">
              Realne dane firmowe, infrastruktura, RODO. Możesz zweryfikować każdą pozycję.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Briefcase,
                title: 'Polska spółka z o.o.',
                lines: [
                  'Mixture Marketing Sp. z o.o.',
                  'NIP: PL5170435774',
                  'Al. Piłsudskiego 17/4, Rzeszów',
                ],
                chip: 'bg-blue-100 text-blue-800',
              },
              {
                icon: Lock,
                title: 'Backup szyfrowany',
                lines: [
                  'Codzienny backup do R2',
                  'Szyfrowanie AES-GCM 256-bit',
                  'Retention 30 dni',
                ],
                chip: 'bg-emerald-100 text-emerald-700',
              },
              {
                icon: Cpu,
                title: 'Cloudflare edge infra',
                lines: [
                  '300+ data center globalnie',
                  'LCP < 1 sekunda',
                  'SLA: best-effort uptime 99.9%',
                ],
                chip: 'bg-orange-100 text-orange-700',
              },
              {
                icon: Shield,
                title: 'RODO + DPA',
                lines: [
                  'DPA template w pakiecie',
                  'Per-tenant encryption',
                  'Retencja leadów 24 mc',
                ],
                chip: 'bg-violet-100 text-violet-800',
              },
              {
                icon: Wallet,
                title: 'Jawne warunki subskrypcji',
                lines: [
                  'Min. 3 mies., potem mc-to-mc',
                  'Wykup w 1. roku: 5 000 zł',
                  'Wykup po 12 mc: 1 000 zł',
                ],
                chip: 'bg-pink-100 text-pink-700',
              },
              {
                icon: FileText,
                title: 'Open source stack',
                lines: [
                  'Cloudflare Workers + Astro 5',
                  'Stripe + Resend + Anthropic',
                  'Bez black-box vendor lock-in',
                ],
                chip: 'bg-amber-100 text-amber-700',
              },
            ].map((box) => (
              <div
                key={box.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${box.chip} rounded-xl mb-4`}
                >
                  <box.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-3">{box.title}</h3>
                <ul className="space-y-1 m-0 p-0 list-none">
                  {box.lines.map((line) => (
                    <li
                      key={line}
                      className="text-xs text-gray-600 leading-relaxed flex items-start gap-1.5"
                    >
                      <ChevronRight
                        size={12}
                        className="shrink-0 mt-0.5 text-emerald-500"
                        aria-hidden="true"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== COMPARISON TABLE ==================== */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
              Porównanie modeli
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
              Abonament vs klasyczne zlecenie vs DIY
            </h2>
            <p className="text-lg text-gray-600">
              Trzy modele zakupu strony WWW. Każdy ma sens dla innego budżetu i potrzeb.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Single table — header cards jako thead z 4 kolumnami (label + 3 tier'y).
                Inline width na col + spojny padding p-5 we wszystkich th. */}
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden table-fixed">
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                </colgroup>
                <thead>
                  <tr className="align-top">
                    {/* Lewa kolumna z labelem "PORÓWNANIE" */}
                    <th className="p-5 bg-gray-50 border-b border-gray-200 text-left">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 mt-3">
                        Porównanie
                      </p>
                      <p className="text-base font-bold text-gray-600 mt-1">3 modele zakupu</p>
                    </th>

                    {/* Mixture — featured. Badge w GORZE cell, NIE absolute (nie wystaje poza table). */}
                    <th className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-left border-b border-emerald-700">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-emerald-700 text-xxs font-black uppercase tracking-[0.15em] shadow whitespace-nowrap">
                        <Sparkles size={10} aria-hidden="true" />
                        Mixture
                      </span>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-100 mt-3 mb-2">
                        Abonament
                      </p>
                      <p className="text-xl md:text-2xl font-extrabold mb-1">od 179 zł</p>
                      <p className="text-xxs text-emerald-50 font-medium normal-case tracking-normal">
                        miesięcznie · min. 3 mies.
                      </p>
                    </th>

                    {/* Klasyczne zlecenie */}
                    <th className="p-5 bg-white text-left border-b border-gray-200">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xxs font-black uppercase tracking-[0.15em] whitespace-nowrap">
                        <Briefcase size={10} aria-hidden="true" />
                        Agencja
                      </span>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-500 mt-3 mb-2">
                        Klasyczne zlecenie
                      </p>
                      <p className="text-xl md:text-2xl font-extrabold text-dark mb-1">
                        4–30 tys. zł
                      </p>
                      <p className="text-xxs text-gray-600 font-medium normal-case tracking-normal">
                        jednorazowo · agencja / freelancer
                      </p>
                    </th>

                    {/* DIY Wix */}
                    <th className="p-5 bg-white text-left border-b border-gray-200">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xxs font-black uppercase tracking-[0.15em] whitespace-nowrap">
                        <Globe size={10} aria-hidden="true" />
                        DIY
                      </span>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-500 mt-3 mb-2">
                        Wix / Squarespace
                      </p>
                      <p className="text-xl md:text-2xl font-extrabold text-dark mb-1">od 60 zł</p>
                      <p className="text-xxs text-gray-600 font-medium normal-case tracking-normal">
                        miesięcznie · sam ją robisz
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {[
                    {
                      label: 'Czas do uruchomienia',
                      mm: { status: 'ok', text: '25 minut' },
                      ag: { status: 'mid', text: '4–8 tygodni' },
                      wix: { status: 'mid', text: '2–5 dni (sam)' },
                    },
                    {
                      label: 'Lokalne SEO + Google Business',
                      mm: { status: 'ok', text: 'w cenie' },
                      ag: { status: 'mid', text: 'dodatkowy zakres' },
                      wix: { status: 'no', text: 'brak' },
                    },
                    {
                      label: 'Blog AI (treści automatyczne)',
                      mm: { status: 'ok', text: 'Premium+' },
                      ag: { status: 'mid', text: '+ copywriter / post' },
                      wix: { status: 'no', text: 'brak' },
                    },
                    {
                      label: 'Backup szyfrowany co 24h',
                      mm: { status: 'ok', text: 'AES-GCM 256' },
                      ag: { status: 'mid', text: 'zależy od agencji' },
                      wix: { status: 'mid', text: 'platforma' },
                    },
                    {
                      label: 'Hosting + SSL w cenie',
                      mm: { status: 'ok', text: 'Cloudflare Workers' },
                      ag: { status: 'mid', text: 'osobno (~100 zł/mc)' },
                      wix: { status: 'ok', text: 'w cenie' },
                    },
                    {
                      label: 'Edycja treści przez klienta',
                      mm: { status: 'ok', text: 'CMS Sveltia' },
                      ag: { status: 'mid', text: 'zależy od agencji' },
                      wix: { status: 'ok', text: 'drag & drop' },
                    },
                    {
                      label: 'Schema.org + llms.txt (AI search)',
                      mm: { status: 'ok', text: 'automatycznie' },
                      ag: { status: 'mid', text: 'dodatkowy zakres' },
                      wix: { status: 'no', text: 'brak' },
                    },
                    {
                      label: 'Wsparcie po wdrożeniu',
                      mm: { status: 'ok', text: 'email + telefon' },
                      ag: { status: 'ok', text: 'account manager' },
                      wix: { status: 'no', text: 'tylko forum / chat' },
                    },
                    {
                      label: 'Model własności',
                      mm: { status: 'ok', text: 'subskrypcja serwisu + opcja wykupu (1k–5k zł)' },
                      ag: { status: 'ok', text: 'pełne własność po zapłacie' },
                      wix: { status: 'mid', text: 'uzależnienie od platformy' },
                    },
                    {
                      label: 'Najlepsze dla',
                      mm: { status: 'ok', text: 'mikrofirmy 1–5 osób' },
                      ag: { status: 'ok', text: 'unikalny projekt 4k+ zł' },
                      wix: { status: 'mid', text: 'hobby / portfolio' },
                    },
                  ].map((row) => {
                    const StatusCell = ({
                      status,
                      text,
                      featured,
                    }: {
                      status: 'ok' | 'mid' | 'no';
                      text: string;
                      featured?: boolean;
                    }) => {
                      const Icon = status === 'ok' ? CheckCircle2 : status === 'no' ? X : Plus;
                      const color =
                        status === 'ok'
                          ? 'text-emerald-600'
                          : status === 'no'
                            ? 'text-rose-400'
                            : 'text-amber-500';
                      return (
                        <td className={`px-4 py-4 ${featured ? 'bg-emerald-50/30' : ''}`}>
                          <div className="flex items-start gap-2">
                            <Icon
                              size={16}
                              className={`${color} shrink-0 mt-0.5 ${
                                status === 'mid' ? 'rotate-45' : ''
                              }`}
                              aria-hidden="true"
                            />
                            <span
                              className={`text-sm ${
                                featured ? 'font-semibold text-dark' : 'text-gray-700'
                              }`}
                            >
                              {text}
                            </span>
                          </div>
                        </td>
                      );
                    };
                    return (
                      <tr key={row.label} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-4 font-semibold text-dark text-xs uppercase tracking-wide w-1/4">
                          {row.label}
                        </td>
                        <StatusCell {...row.mm} featured />
                        <StatusCell {...row.ag} />
                        <StatusCell {...row.wix} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4 italic">
              Mixture jest też klasyczną agencją marketingową — zlecenia 4 000–30 000 zł realizujemy
              w tradycyjnym modelu. Abonament to osobny produkt dla mikrofirm bez budżetu na full
              custom.
            </p>
          </div>

          {/* Decyzyjne tipki — kiedy który model wybrać */}
          <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Briefcase size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-dark">Wybierz klasyczne zlecenie, jeśli…</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-blue-600 shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>masz unikalny projekt z budżetem 5–30 tys. zł</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-blue-600 shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>potrzebujesz custom designu lub dedykowanych integracji</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-blue-600 shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>chcesz mieć pełne prawa do kodu i grafiki od dnia 1</span>
                </li>
              </ul>
              <Link
                to="/web-development/"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 hover:underline mt-4"
              >
                Zobacz ofertę klasycznej agencji <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-dark">Wybierz abonament Mixture, jeśli…</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600 shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>masz mikrofirmę (1–5 osób) bez budżetu na 5+ tys. zł setupu</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600 shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>nie chcesz robić strony sam (DIY) ani prowadzić projektu z agencją</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600 shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>potrzebujesz lokalnych leadów i SEO Google Business — od razu</span>
                </li>
              </ul>
              <a
                href="#pricing"
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:underline mt-4"
              >
                Wybierz pakiet abonamentu <ArrowRight size={12} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== KTO ZA TYM STOI (placeholder) ==================== */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
                Twarz za platformą
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-dark leading-tight mb-4">
                Kto to buduje
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1">
                  <div className="relative w-40 h-40 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-lg ring-4 ring-emerald-100">
                    <picture>
                      <source srcSet="/assets/team/jakub-niedziela-400.avif" type="image/avif" />
                      <source srcSet="/assets/team/jakub-niedziela-400.webp" type="image/webp" />
                      <img
                        src="/assets/team/jakub-niedziela-400.jpg"
                        alt="Jakub Niedziela — założyciel Mixture Marketing"
                        width="160"
                        height="160"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-dark mb-1">Jakub Niedziela</h3>
                  <p className="text-sm font-semibold text-emerald-700 mb-4">
                    Założyciel Mixture Marketing · Fullstack developer · Rzeszów
                  </p>
                  <div className="text-gray-700 space-y-3 leading-relaxed">
                    <p>
                      Od 2020 prowadzę agencję marketingową w Rzeszowie. Setki konsultacji z
                      lokalnymi firmami pokazały mi jedno: tradycyjny model agencji (3000 zł/mc za
                      stronę WordPress + ręczna obsługa) nie pasuje do mikrofirmy na Podkarpaciu.
                    </p>
                    <p>
                      W 2025 zacząłem budować Mixture jako odpowiedź — strona w abonamencie, którą
                      mikrofirma uruchamia w 25 minut bez maili z konsultantem. Cloudflare Workers,
                      Astro, AI Claude do treści. Cała platforma od zera, bez kompromisów na rzecz
                      „tańszej przyszłości WordPress".
                    </p>
                  </div>

                  {/* Kontakt + LinkedIn */}
                  <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                    <a
                      href="https://pl.linkedin.com/in/jakub-niedziela-9251a8254"
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full text-sm font-bold transition-colors shadow-sm"
                    >
                      <Linkedin size={16} aria-hidden="true" />
                      LinkedIn
                    </a>
                    <a
                      href="mailto:info@mixturemarketing.pl"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-emerald-600 hover:text-emerald-700 text-dark rounded-full text-sm font-bold transition-colors"
                    >
                      <Mail size={16} aria-hidden="true" />
                      info@mixturemarketing.pl
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== WOLISZ ZADZWONIĆ? (alternatywa do self-service) ==================== */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-emerald-50/40 to-blue-50/40">
        <Container>
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-emerald-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
                  Wolisz porozmawiać?
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-dark mb-3 leading-tight">
                  Niekoniecznie musisz klikać i płacić online
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Wiemy że nie każdy lubi self-service. Możesz po prostu zadzwonić, porozmawiać
                  z&nbsp;Jakubem, dostać fakturę proforma i&nbsp;zapłacić zwykłym przelewem
                  bankowym. Bez Stripe'a, bez karty, bez kreatora.
                </p>
                <p className="text-xs text-gray-500">
                  Pn–Pt 9:00–17:00 · Polski język · Konsultacja bez zobowiązań
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="tel:+48794443551"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Phone size={20} aria-hidden="true" />
                  <div className="text-left">
                    <span className="block text-lg leading-none">+48 794 443 551</span>
                    <span className="block text-xs text-emerald-100 font-medium">
                      Zadzwoń do Jakuba
                    </span>
                  </div>
                </a>
                <a
                  href="mailto:info@mixturemarketing.pl?subject=Pytanie%20o%20abonament%20-%20chc%C4%99%20przelew%20VAT"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 hover:border-emerald-600 hover:text-emerald-700 text-dark font-bold rounded-full transition-all"
                >
                  <Mail size={20} aria-hidden="true" />
                  <span>Napisz — faktura VAT</span>
                </a>
              </div>
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

      {/* H5: Sticky mobile CTA bar — pokazuje się po wyjściu hero, znika w sekcji pricing.
          Łączy primary CTA "Wybierz pakiet" z secondary "Zadzwoń" (Marek-persona). */}
      <div
        aria-hidden={!showStickyMobileBar || pricingInView}
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
          showStickyMobileBar && !pricingInView ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs leading-tight">
            <p className="font-bold text-dark">Od 179 zł / mc</p>
            <p className="text-gray-500">4 pakiety · faktura VAT</p>
          </div>
          <a
            href="tel:+48794443551"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
            aria-label="Zadzwoń: +48 794 443 551"
          >
            <Phone size={18} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => scrollToId('pricing')}
            className="inline-flex items-center gap-1.5 px-5 h-11 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-md text-sm"
          >
            Wybierz pakiet
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Abonament;
