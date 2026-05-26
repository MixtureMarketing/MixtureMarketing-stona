/* eslint-disable max-lines -- single-page SaaS marketing landing (16 sekcji) */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Building2,
  FileText,
  Shield,
  Check,
  Sparkles,
  ArrowRight,
  Phone,
  Clock,
  AlertCircle,
  Zap,
  CreditCard,
  Rocket,
  Wrench,
  Scissors,
  Stethoscope,
  Coffee,
  Calculator,
  Briefcase,
  Cpu,
  Cog,
  Database,
  Cloud,
  Code2,
  Mail,
  Linkedin,
  Plus,
  Minimize2,
  Feather,
  Activity,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import AmbientBackground from '../../common/AmbientBackground';
import PreonboardModal, { type AbonamentTier, TIERS } from './PreonboardModal';
import { trackEvent } from '../../../utils/analytics';

// ============================================================================
// DATA
// ============================================================================

// Track 25 (2026-05-19): cennik update 149/199/299 → 179/249/349 + Professional 549.
const PRICING = [
  {
    id: 'starter' as AbonamentTier,
    name: 'Starter',
    pill: 'Start',
    tagline: 'Dla mikrofirm 1–5 osób',
    price: 179,
    priceGross: 220,
    features: [
      { text: 'Klienci znajdą Cię w Google Maps i lokalnym SERP', isNew: false },
      { text: 'Własna domena .pl — w cenie', isNew: false },
      { text: 'Sam zmieniasz cennik i godziny pracy w panelu', isNew: false },
      { text: 'Wizytówka Google — pełny setup', isNew: true },
      { text: 'Rezerwacje przez Booksy / Calendly', isNew: true },
      { text: 'Opinie z Google widoczne automatycznie', isNew: true },
      { text: 'Strona ładuje się <1 sekundę (Cloudflare)', isNew: false },
      { text: 'Formularz z ochroną przed botami', isNew: false },
      { text: 'Codzienna kopia · SSL · ochrona DDoS', isNew: false },
    ],
  },
  {
    id: 'standard' as AbonamentTier,
    name: 'Standard',
    pill: 'Performance',
    tagline: 'Dla rozwijających się',
    price: 249,
    priceGross: 306,
    featured: true,
    diff: 'Wszystko ze Starter + dodatkowo',
    features: [
      { text: 'Do 12 podstron + FAQ + 2 formularze', isNew: false },
      { text: 'Galeria z filtrami (przed/po, kategorie)', isNew: true },
      { text: 'Strony pod każdą dzielnicę / okolicę', isNew: true },
      { text: 'Automatyczny SMS-przypominajka', isNew: true },
      { text: 'Twoje logo + kolory marki', isNew: false },
      { text: 'Rozszerzone meta dane (więcej opinii w SERP)', isNew: false },
      { text: 'Audyt SEO co kwartał + raport pozycji', isNew: false },
    ],
  },
  {
    id: 'premium' as AbonamentTier,
    name: 'Premium',
    pill: 'Scale',
    tagline: 'Dla wielolokalizacyjnych',
    price: 349,
    priceGross: 429,
    diff: 'Wszystko ze Standard + dodatkowo',
    features: [
      { text: 'Odpowiedzi na opinie Google — AI', isNew: true },
      { text: 'Posty w GBP co tydzień — auto', isNew: true },
      { text: 'Call tracking słów kluczowych', isNew: true },
      { text: 'Nielimitowana liczba podstron', isNew: false },
      { text: 'Blog ekspercki — 2 wpisy/mc (AI)', isNew: false },
      { text: 'Testy A/B przycisków', isNew: false },
      { text: 'Priorytet w obsłudze — do 24h', isNew: false },
      { text: 'Audyt SEO co miesiąc + raport pozycji', isNew: false },
    ],
  },
];

const PROFESSIONAL_TIER = {
  id: 'professional' as AbonamentTier,
  name: 'Professional',
  tagline: 'Dla branż regulowanych — adwokat, lekarz, księgowy, fizjoterapeuta',
  price: 549,
  priceGross: 675,
  features: [
    'Sekcja „Publikacje i wystąpienia" jako kolekcja CMS',
    'Case studies anonimizowane (zgodne z tajemnicą zawodową)',
    'Bezpieczny upload dokumentów (end-to-end, R2, 30-day retention)',
    'Pakiet RODO+ (DPA jako ADO, rejestr czynności, klauzule)',
    'Integracja Cal.com + płatna konsultacja przez Stripe',
    'Wersja językowa EN/UA w cenie',
    'Trust badges (nr wpisu na listę, polisa OC)',
    'AI Blog wyłączony domyślnie (ryzyko reputacyjne)',
    'FOMO / Leadpop wyłączone (nieprofesjonalne dla branży)',
  ],
};

const DEMOS = [
  {
    num: '01',
    url: 'https://demo-minimalist.mixturemarketing.pl/',
    title: 'Minimalist',
    desc: 'Czysty, prostotny — usługi profesjonalne.',
    icon: Minimize2,
    swatches: ['#FFFFFF', '#0B1120', '#F9FAFB'],
  },
  {
    num: '02',
    url: 'https://demo-elegant.mixturemarketing.pl/',
    title: 'Elegant',
    desc: 'Luksusowy, klasyczny — beauty, spa, butiki.',
    icon: Feather,
    swatches: ['#1A0F0A', '#B89878', '#F2EAE0'],
  },
  {
    num: '03',
    url: 'https://demo-dynamic.mixturemarketing.pl/',
    title: 'Dynamic',
    desc: 'Energiczny, kolorowy — gastronomia, fitness.',
    icon: Activity,
    swatches: ['#3F3D91', '#61B6DE', '#F9FAFB'],
  },
  {
    num: '04',
    url: 'https://demo-editorial.mixturemarketing.pl/',
    title: 'Editorial',
    desc: 'Magazynowy, typograficzny — eksperci, blog.',
    icon: BookOpen,
    swatches: ['#213261', '#61B6DE', '#F4F0E8'],
  },
];

const TRUST_ITEMS = [
  'Setup w 24h',
  'Min. 3 mies., potem mc-to-mc',
  'Bez ukrytych kosztów',
  'Twoja domena na zawsze',
  'RODO + DPA w pakiecie',
  'Cloudflare edge · 300+ DC',
  'Faktura VAT w panelu',
  'Rezygnujesz kiedy chcesz',
];

const POWODY_179 = [
  {
    icon: Sparkles,
    title: 'AI generuje treści',
    desc: 'Claude Sonnet pisze opisy usług, posty GBP i odpowiedzi na opinie Google. Klient zatwierdza jednym kliknięciem — zero copywritera w kosztach platformy.',
  },
  {
    icon: Zap,
    title: 'Edge = szybkość bez VPS',
    desc: 'Strona to edge worker w 300+ data center — ładuje w ~200 ms. Brak osobnego serwera per klient obniża infrastrukturę o ~80 zł/mc na lokalizację.',
  },
  {
    icon: Cog,
    title: 'Wizard 25 minut',
    desc: 'Klient przechodzi kreator sam. System rejestruje domenę, konfiguruje SSL i wgrywa content automatycznie — zero godzin koordynacji projektu.',
  },
  {
    icon: MapPin,
    title: 'Local SEO w cenie',
    desc: 'Wizytówka Google, schema.org, strony pod dzielnice, sitemap i llms.txt — zintegrowane w pakiecie. W klasycznym projekcie to 1500–3000 zł jednorazowego setup\'u.',
  },
];

const PROBLEMS = [
  {
    num: '01',
    problem: 'Klient szuka Cię w Google. Nie znajduje.',
    solution: 'Strona + GBP w 24h. Pojawiasz się w Mapach.',
  },
  {
    num: '02',
    problem: 'Klient wypełnia formularz. Ty nic nie wiesz.',
    solution: 'SMS w 30 sekund. Telefon przed konkurencją.',
  },
  {
    num: '03',
    problem: 'Tracisz miesięcznie na agencje, które nic nie dowożą.',
    solution: 'Stała cena. Realne raporty. Wyjście w każdej chwili.',
  },
];

const INDUSTRIES = [
  {
    icon: Wrench,
    name: 'Usługi techniczne',
    examples: 'ślusarz · mechanik · hydraulik · elektryk · dekarz · stolarz',
  },
  {
    icon: Scissors,
    name: 'Beauty & wellness',
    examples: 'fryzjer · kosmetyczka · salon paznokci · masaż',
  },
  {
    icon: Stethoscope,
    name: 'Medycyna i zdrowie',
    examples: 'dentysta · fizjoterapeuta · lekarz · podolog',
  },
  {
    icon: Coffee,
    name: 'Gastronomia',
    examples: 'restauracja · kawiarnia · food truck · catering',
  },
  {
    icon: Calculator,
    name: 'Usługi profesjonalne',
    examples: 'księgowa · prawnik · doradca · tłumacz',
  },
  {
    icon: Briefcase,
    name: 'Inne branże',
    examples: 'kwiaciarnia · agent nieruchomości · szkoła językowa — zapytaj',
  },
];

const INCLUDES = [
  {
    num: '01',
    label: 'Core',
    title: 'Strona Astro 5',
    desc: 'Cloudflare Workers · ładuje w <1 sekundę. Cały deployment edge — globalnie.',
    accent: 'indigo',
  },
  {
    num: '02',
    title: 'Domena',
    desc: 'Rejestracja twojafirma.pl w cenie. Twoja własność.',
  },
  {
    num: '03',
    label: 'SEO',
    title: 'Local SEO',
    desc: 'Do 6 stron programmatic pod miasta. Schema.org + sitemap + llms.txt.',
    accent: 'navy',
  },
  {
    num: '04',
    title: 'GBP sync',
    desc: 'Google Business Profile zsynchronizowany automatycznie.',
  },
  {
    num: '05',
    label: 'Leady',
    title: 'SMS w 30 sek',
    desc: 'Formularz → SMS do Ciebie w 30 sekund. 9× większa szansa zamknięcia.',
    accent: 'blue',
  },
  { num: '06', title: 'Panel klienta', desc: 'Leady, faktury, raporty w jednym miejscu.' },
  {
    num: '07',
    title: 'Blog AI',
    desc: 'Standard+: wpis co 2 tygodnie. Zatwierdzasz przed publikacją.',
  },
  {
    num: '08',
    title: 'RODO + DPA',
    desc: 'Zgodnie z prawem, DPA do podpisu. Per-tenant encryption.',
  },
  { num: '09', title: 'Faktury VAT', desc: 'Automat 1. dnia miesiąca przez Fakturownia.pl.' },
  { num: '10', title: 'Stała cena', desc: 'Min. 3 mies., potem mc-to-mc. Bez ukrytych kosztów.' },
];

const STEPS = [
  {
    num: '01',
    icon: FileText,
    title: 'Wypełniasz formularz',
    time: '3 minuty',
    desc: 'Wybierasz pakiet i podajesz NIP. Dane firmy — nazwa, adres, branża — pobieramy z GUS automatycznie.',
  },
  {
    num: '02',
    icon: CreditCard,
    title: 'Płacisz przez Stripe',
    time: '1 minuta',
    desc: 'BLIK, karta lub przelew. Ochrona kupującego. Umowa min. 3 mies.',
  },
  {
    num: '03',
    icon: Sparkles,
    title: 'Uzupełniasz kreator',
    time: '15–20 minut',
    desc: 'Logo, zdjęcia, Twoja historia zawodowa. System buduje z niej treści E-E-A-T zamiast generycznych opisów. Możesz w 2 turach.',
  },
  {
    num: '04',
    icon: Rocket,
    title: 'Strona idzie online',
    time: '6 minut',
    desc: 'Domena, SSL, DNS, GBP, llms.txt — wszystko konfigurowane bez Twojego udziału.',
  },
];

const KONKRET = [
  {
    icon: Building2,
    title: 'Polska spółka z o.o.',
    items: [
      'Mixture Marketing Sp. z o.o.',
      'NIP: PL5170435774',
      'KRS: 0001034514',
      'Al. Piłsudskiego 17/4, Rzeszów',
    ],
  },
  {
    icon: Database,
    title: 'Backup szyfrowany',
    items: ['Codzienny backup do R2', 'AES-GCM 256-bit', 'Retention 30 dni'],
  },
  {
    icon: Cloud,
    title: 'Cloudflare edge',
    items: ['300+ data center globalnie', 'LCP < 1 sekunda', 'SLA: best-effort 99.9%'],
  },
  {
    icon: Shield,
    title: 'RODO + DPA',
    items: ['DPA template w pakiecie', 'Per-tenant encryption', 'Retencja leadów 24 mc'],
  },
  {
    icon: FileText,
    title: 'Jawne warunki',
    items: ['Min. 3 mies., potem mc-to-mc', 'Wykup w 1. roku: 5000 zł', 'Wykup po 12 mc: 1000 zł'],
  },
  {
    icon: Code2,
    title: 'Open source stack',
    items: [
      'Cloudflare Workers + Astro 5',
      'Stripe + Resend + Anthropic',
      'Bez black-box vendor lock-in',
    ],
  },
];

const COMPARISON = {
  labels: [
    'Czas do uruchomienia',
    'Lokalne SEO + GBP',
    'Blog AI',
    'Backup szyfrowany',
    'Hosting + SSL',
    'Edycja treści',
    'Schema.org + llms.txt',
    'Wsparcie',
    'Model własności',
    'Najlepsze dla',
  ],
  mixture: [
    '25 minut',
    'w cenie',
    'Premium+',
    'AES-GCM 256',
    'Cloudflare Workers',
    'CMS Sveltia',
    'automatycznie',
    'email + telefon',
    'subskrypcja + wykup',
    'mikrofirmy 1–5 osób',
  ],
  agency: [
    '4–8 tygodni',
    'dodatkowy zakres',
    '+ copywriter',
    'zależy od agencji',
    'osobno ~100 zł/mc',
    'zależy od agencji',
    'dodatkowy zakres',
    'account manager',
    'pełna własność',
    'unikalny projekt 4k+',
  ],
  diy: [
    '2–5 dni',
    'brak',
    'brak',
    'platforma',
    'w cenie',
    'drag & drop',
    'brak',
    'tylko forum / chat',
    'uzależnienie',
    'hobby / portfolio',
  ],
};

const FAQ = [
  {
    q: 'Jak szybko pojawię się w Google Maps i kiedy przyjdą pierwsze leady?',
    a: 'Wizytówka Google Business Profile jest weryfikowana przez Google w 14–21 dni (standardowa procedura Google — nie mamy na to wpływu). Pierwsze leady z formularza pojawiają się zazwyczaj po 2–4 tygodniach od uruchomienia strony, gdy Google zaindeksuje nową stronę i aktywuje GBP. Stabilna widoczność w TOP 10 lokalnie wymaga 4–6 miesięcy regularnej aktywności SEO.',
  },
  {
    q: 'Ile kosztuje strona w abonamencie?',
    a: 'Trzy pakiety: Starter 179 zł/mc, Standard 249 zł/mc, Premium 349 zł/mc (netto). Dla branż regulowanych — adwokaci, lekarze, księgowi — osobny pakiet Professional od 549 zł/mc. Bez opłat aktywacyjnych. Dla pierwszych 10 klientów: −50 zł/mc przez 3 miesiące.',
  },
  {
    q: 'Czym różni się Professional od Premium?',
    a: 'Professional dodaje pakiet RODO+ (DPA jako ADO, rejestr czynności), bezpieczny upload dokumentów z retencją 30 dni, wersję językową EN/UA w cenie, integrację Cal.com + Stripe. AI Blog i FOMO/Leadpop są domyślnie wyłączone — nieprofesjonalne dla branż regulowanych.',
  },
  {
    q: 'Czy mogę przejść między pakietami?',
    a: 'Tak, w obie strony. Upgrade — od następnego cyklu rozliczeniowego. Downgrade — tak samo. Funkcje wyłącznie z wyższego pakietu (np. Blog AI) znikają, ale dane i treści zostają.',
  },
  {
    q: 'Jak długo trwa minimalna umowa?',
    a: '3 miesiące minimum (potrzebne by SEO/GBP zaczęły działać). Potem rozliczenie mc-to-mc — rezygnujesz w dowolnym momencie, bez kar.',
  },
  {
    q: 'Co dokładnie kupuję — stronę czy usługę?',
    a: 'Kupujesz subskrypcję serwisu: kod, hosting, domena, support, aktualizacje, SEO, backupy — wszystko w jednej cenie. Po 12 mc możesz wykupić stronę na własność za 1000 zł. W pierwszym roku wykup kosztuje 5000 zł.',
  },
  {
    q: 'Kto jest właścicielem domeny?',
    a: 'Ty. Domena .pl rejestrowana jest na Twoje dane firmowe od dnia 1. Nawet jeśli rezygnujesz z abonamentu — domena zostaje Twoja na zawsze.',
  },
  {
    q: 'Co jeśli mam już stronę?',
    a: 'Migrujemy treści w ramach setupu. Stara domena wskazuje na nową stronę — bez przerwy w działaniu. Stare URL-e mapujemy na nowe, żeby nie stracić pozycji w Google.',
  },
  {
    q: 'Kto pisze treści na bloga?',
    a: 'W pakietach Standard+ i Premium — Claude (Anthropic) generuje wpisy na bazie Twoich danych firmowych i tematów z lokalnego SEO. Ty zatwierdzasz jednym kliknięciem przed publikacją. W Professional Blog AI jest domyślnie wyłączony.',
  },
  {
    q: 'Co z RODO?',
    a: 'Pełne. DPA jako wzór w panelu, per-tenant encryption, retencja leadów 24 mc (potem auto-delete). Hostowane w EU. W Professional dodatkowo rejestr czynności + klauzule informacyjne.',
  },
  {
    q: 'Czy obsługujecie moją branżę?',
    a: 'Mamy gotowe szablony dla 16 branż. Jeśli Twojej nie ma na liście — napisz, w 90% przypadków robimy.',
  },
];

const RELATED = [
  {
    tag: 'Rzeszów',
    title: 'Agencja w Rzeszowie',
    desc: 'Pełna oferta lokalna — marketing 360°, dojazd do klienta.',
    href: '/agencja-interaktywna-rzeszow/',
  },
  {
    tag: 'Web dev',
    title: 'Strony WWW dedykowane',
    desc: 'Dedykowane strony i sklepy — od 3 900 zł jednorazowo.',
    href: '/web-development/',
  },
  {
    tag: 'SEO',
    title: 'Pozycjonowanie Rzeszów',
    desc: 'Lokalne i ogólnopolskie SEO — od 1 200 zł/mc.',
    href: '/pozycjonowanie-rzeszow/',
  },
];

// ============================================================================
// PRESENTATION HELPERS
// ============================================================================

const techGrid = (
  <div
    aria-hidden="true"
    className="absolute inset-0 pointer-events-none opacity-[0.04]"
    style={{
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(79 70 229) 1px, transparent 0)',
      backgroundSize: '32px 32px',
    }}
  />
);

const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-900 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm ${className}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
    {children}
  </span>
);

const SectionHead: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
}> = ({ eyebrow, title, lead }) => (
  <div className="grid md:grid-cols-2 gap-8 mb-16 items-end">
    <div>
      <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 leading-[1.05] tracking-tight">
        {title}
      </h2>
    </div>
    {lead && <p className="text-lg text-slate-600 leading-relaxed md:pt-8">{lead}</p>}
  </div>
);

// ============================================================================
// MAIN
// ============================================================================

const Abonament: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Deep-link support: /abonament/?tier=standard → open modal at mount.
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

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  const viewPricingTracked = useRef(false);
  const [showStickyMobileBar, setShowStickyMobileBar] = useState(false);
  const [pricingInView, setPricingInView] = useState(false);

  // Deep-link tracking
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

  // UTM persistence
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
      // ignore
    }
  }, [searchParams]);

  // Cancel banner
  useEffect(() => {
    if (stripeCanceled) {
      trackEvent('purchase_canceled', { recovery_offered: true });
      scrollToId('pricing');
    }
  }, [stripeCanceled]);

  // Funnel #1 — view_pricing
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

  // Body data-attribute for sticky bar
  useEffect(() => {
    const active = showStickyMobileBar && !pricingInView;
    if (active) {
      document.body.dataset.stickyMobileBar = 'true';
    } else {
      delete document.body.dataset.stickyMobileBar;
    }
    return () => {
      delete document.body.dataset.stickyMobileBar;
    };
  }, [showStickyMobileBar, pricingInView]);

  // Sticky mobile bar appearance
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
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
  const allOffers = [...PRICING, PROFESSIONAL_TIER];
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
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
      '@id': `https://mixturemarketing.pl/abonament/#offer-${p.id}`,
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

  const founderJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://mixturemarketing.pl/#founder',
    name: 'Jakub Niedziela',
    givenName: 'Jakub',
    familyName: 'Niedziela',
    jobTitle: 'Założyciel & Fullstack Developer',
    worksFor: { '@id': 'https://mixturemarketing.pl/#organization' },
    url: 'https://mixturemarketing.pl/o-nas/',
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
    <div className="min-h-screen bg-white text-slate-900 pb-20 md:pb-0">
      <Seo
        title="Strona w abonamencie dla małej firmy • Gotowa strona WWW od 179 zł/mc"
        description="Szukasz klientów z Google? Otrzymaj nowoczesną stronę internetową w abonamencie z pełnym pozycjonowaniem lokalnym (SEO) i Mapami Google. Bez opłat startowych!"
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
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 md:pb-28 overflow-hidden bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30"
      >
        {techGrid}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 -left-32 w-[480px] h-[480px] bg-indigo-300/30 rounded-full blur-[140px] motion-safe:animate-blob" />
          <div
            className="absolute -top-10 -right-32 w-[440px] h-[440px] bg-blue-300/30 rounded-full blur-[140px] motion-safe:animate-blob"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <Container className="relative z-10">
          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-12">
            <span className="text-indigo-600">● NOWOŚĆ · 2026 · 4 pakiety od 179 zł/mc</span>
            <span className="hidden md:inline">Mixture Marketing · Rzeszów · od 2020</span>
            <span>Pilotaż · Podkarpacie · 10 miejsc</span>
          </div>

          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <Eyebrow className="mb-7">Strona w abonamencie</Eyebrow>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-950 leading-[1.05] tracking-tight mb-7">
                Nowoczesna{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700">
                  strona internetowa
                </span>
                <br />
                w abonamencie dla małej firmy.
              </h1>

              <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-8 max-w-2xl">
                Zdobądź nowych klientów z Google bez wydawania tysięcy złotych na start. Kompletna
                strona WWW, pełne pozycjonowanie lokalne i automatyczne pozyskiwanie opinii —
                wszystko w stałym abonamencie od{' '}
                <strong className="text-slate-950">179&nbsp;zł&nbsp;netto/mc</strong>. Bez opłat
                startowych.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a
                  href="#pricing"
                  onClick={(e) => handleSmoothScroll(e, 'pricing')}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-bold rounded-full text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 motion-safe:hover:-translate-y-0.5 transition-all"
                >
                  Wybierz pakiet
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="#demo"
                  onClick={(e) => handleSmoothScroll(e, 'demo')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 hover:text-indigo-700 font-bold rounded-full text-base border-2 border-slate-200 hover:border-indigo-300 transition-all"
                >
                  Zobacz demo
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-indigo-600" aria-hidden="true" />
                  Setup w 24h
                </span>
                <span className="text-slate-300">·</span>
                <span>Bez umowy na rok</span>
                <span className="text-slate-300">·</span>
                <span>RODO + DPA</span>
              </div>
            </div>

            {/* Hero price card */}
            <div className="relative bg-gradient-to-br from-slate-950 to-indigo-950 text-white p-8 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-900/30 overflow-hidden">
              {techGrid}
              <span className="absolute -top-3 right-6 inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                Najtańszy pakiet
              </span>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300 mb-4">
                  <Sparkles size={14} aria-hidden="true" />
                  Starter
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-400">od</span>
                  <span className="text-7xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                    179
                  </span>
                  <span className="text-2xl font-bold text-indigo-300">PLN</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">/ miesięcznie · netto · brutto 220 zł</p>
                <div className="h-px bg-gradient-to-r from-indigo-500/40 to-transparent mb-6" />
                <ul className="space-y-2.5 text-sm">
                  {[
                    'Strona + domena .pl',
                    'Google Business Profile',
                    'Local SEO + Schema.org',
                    'Leady SMS w 30 sekund',
                    'Cloudflare edge (300+ DC)',
                    'RODO + DPA w pakiecie',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-slate-200">
                      <Check
                        size={16}
                        className="text-indigo-400 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handlePickTier('starter', 'hero_cta')}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-900 font-bold rounded-full text-sm hover:bg-indigo-50 transition-colors"
                >
                  Wybierz Starter
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== STRIPE CANCELED BANNER ==================== */}
      {stripeCanceled && (
        <Container>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 my-8 flex items-start gap-3 max-w-3xl mx-auto">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-slate-900 mb-1">Anulowałeś płatność</p>
              <p className="text-sm text-slate-700">
                Możesz spróbować ponownie — Twój wybór nie został utracony.{' '}
                <a
                  href="#pricing"
                  onClick={(e) => handleSmoothScroll(e, 'pricing')}
                  className="text-indigo-700 hover:underline font-semibold"
                >
                  Wróć do pakietów ↑
                </a>
              </p>
            </div>
          </div>
        </Container>
      )}

      {/* ==================== TRUST MARQUEE ==================== */}
      <div className="bg-slate-950 text-white border-y border-indigo-900/40 py-4 overflow-hidden">
        <div className="flex gap-8 motion-safe:animate-marquee whitespace-nowrap">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-300"
            >
              <span className="text-indigo-400">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ==================== DEMO ==================== */}
      <section id="demo" className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Live demo · 4 style"
            title={
              <>
                Zobacz 4 style.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  Wybierasz
                </span>
                <br />
                wygląd, my dopasujemy treść.
              </>
            }
            lead="Każde demo to ten sam silnik (Astro + Cloudflare) ale inny styl wizualny. Po zakupie wybierasz styl i wypełniasz wizard — strona dostaje Twoje treści."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMOS.map((d) => (
              <a
                key={d.url}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Otwórz demo stylu ${d.title} (nowa karta)`}
                className="group relative flex flex-col justify-between p-6 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl motion-safe:hover:-translate-y-1 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {d.num} · Demo
                    </span>
                    <d.icon
                      size={18}
                      className="text-slate-400 group-hover:text-indigo-600 transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 mb-2">{d.title}</h3>
                  <p className="text-sm text-slate-600 mb-5">{d.desc}</p>
                  <div className="flex gap-1.5 mb-6">
                    {d.swatches.map((c, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded-full border border-slate-200"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
                  Otwórz live <ExternalLink size={12} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== CENA VS TECH (STATS + 6 POWODÓW) ==================== */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        {techGrid}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[380px] h-[380px] bg-indigo-300/20 rounded-full blur-[120px] motion-safe:animate-blob"
        />
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Cena vs technologia"
            title={
              <>
                Dlaczego{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  179 zł/mc,
                </span>
                <br />a nie 1500?
              </>
            }
            lead="Mixture jest agencją marketingową — klasyczne projekty robimy w cenie 4 000 – 30 000 zł. Tam płacisz osobogodziny. Tutaj — większość pracy wykonuje platforma."
          />

          {/* Stats grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            <div className="md:col-span-2 lg:row-span-2 relative p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white overflow-hidden flex flex-col justify-between">
              {techGrid}
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-3">
                  <Activity size={12} aria-hidden="true" />
                  Pilotaż · 30 dni
                </div>
                <h4 className="text-2xl font-bold mb-4 leading-tight">
                  Pierwsza klientka — fryzjerka z Drabinianki
                </h4>
              </div>
              <div className="relative z-10 mt-8">
                <p className="text-8xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
                  19<span className="text-3xl font-bold text-indigo-300">h</span>
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300 mt-3">
                  do go-live · 8 rezerwacji w 14 dni · #2 lokalne Google
                </p>
              </div>
            </div>
            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
              {techGrid}
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 mb-3">
                  Cloudflare edge
                </p>
                <p className="text-5xl font-black mb-2">
                  ~1<span className="text-xl font-bold text-blue-200">s</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                  Load · 300+ data center
                </p>
              </div>
            </div>
            <div className="relative p-6 rounded-3xl bg-white border-2 border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Lead → SMS
              </p>
              <p className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                30<span className="text-xl font-bold">s</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                9× większa szansa zamknięcia (HBR)
              </p>
            </div>
            <div className="md:col-span-2 relative p-6 rounded-3xl bg-white border-2 border-slate-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                  Setup vs klasyczne zlecenie
                </p>
                <h4 className="text-2xl font-bold text-slate-950">25 minut zamiast 6 tygodni.</h4>
              </div>
              <div className="hidden md:flex items-end gap-1 h-16">
                {[20, 35, 28, 50, 42, 65, 58, 80].map((h, i) => (
                  <span
                    key={i}
                    className="w-2 rounded-full bg-gradient-to-t from-indigo-200 to-indigo-600"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4 powody */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {POWODY_179.map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 mb-4">
                  <p.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== PROBLEM / SOLUTION ==================== */}
      <section className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Trzy scenariusze"
            title={
              <>
                Mała firma.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  Brak czasu
                </span>
                <br />
                na marketing.
              </>
            }
            lead="Trzy konkretne sytuacje, w których strona w abonamencie rozwiązuje problem za Ciebie."
          />

          <div className="space-y-4">
            {PROBLEMS.map((p) => (
              <div
                key={p.num}
                className="grid md:grid-cols-[80px_1fr_1fr] gap-4 md:gap-6 p-6 md:p-8 rounded-3xl border border-slate-200 hover:border-indigo-200 transition-colors"
              >
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-200 to-indigo-400">
                  {p.num}
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-700 mb-2">
                    Problem
                  </div>
                  <div className="text-lg font-bold text-slate-950">{p.problem}</div>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-2">
                    Rozwiązanie
                  </div>
                  <div className="text-lg font-bold text-slate-950">{p.solution}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== INDUSTRIES + PROMO ==================== */}
      <section className="relative py-24 md:py-32 bg-slate-50 overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Dla kogo"
            title={
              <>
                16 branż.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  Twoja
                </span>{' '}
                w pakiecie.
              </>
            }
            lead="Gotowe szablony dla 16 typów mikrofirm w Polsce. Inne — zapytaj, w 90% przypadków robimy."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {INDUSTRIES.map((i) => (
              <div
                key={i.name}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 mb-4">
                  <i.icon size={22} aria-hidden="true" />
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">
                  {i.name}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{i.examples}</p>
              </div>
            ))}
          </div>

          {/* PROMO BANNER */}
          <div className="relative grid md:grid-cols-[2fr_1fr] gap-8 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
            {techGrid}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.18em] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Promo · pierwsze 10 firm
              </span>
              <h3 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                −50 zł/mc przez
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">
                  3 miesiące.
                </span>
              </h3>
              <p className="text-lg text-slate-300 mb-7 max-w-lg">
                Oszczędzasz do 150 zł na starcie. Dla pierwszych 10 firm z Podkarpacia. Później
                wracamy do standardowej ceny.
              </p>
              <a
                href="#pricing"
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-900 font-bold rounded-full hover:bg-indigo-50 transition-colors"
              >
                Zarezerwuj miejsce <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-blue-300 leading-none">
                3
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mt-2">
                miesiące × −50 zł
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== PRICING ==================== */}
      <section
        id="pricing"
        ref={pricingRef}
        className="relative py-24 md:py-32 bg-white overflow-hidden"
      >
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Pakiety"
            title={
              <>
                179, 249, 349.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  Trzy pakiety.
                </span>{' '}
                Stała cena.
              </>
            }
            lead="Płacisz miesięcznie. Rezygnujesz kiedy chcesz. Bez opłat aktywacyjnych."
          />

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {PRICING.map((tier) => {
              const isFeatured = !!tier.featured;
              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col p-7 md:p-8 rounded-3xl border-2 transition-all ${
                    isFeatured
                      ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-950 text-white border-indigo-500 shadow-2xl shadow-indigo-900/30 lg:scale-[1.02]'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                  }`}
                >
                  {isFeatured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                      Najpopularniejszy
                    </span>
                  )}
                  <span
                    className={`inline-flex self-start items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] mb-4 ${
                      isFeatured
                        ? 'bg-white/10 text-indigo-200 border border-white/20'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}
                  >
                    {tier.pill}
                  </span>
                  <h3
                    className={`text-3xl font-black mb-1 ${isFeatured ? 'text-white' : 'text-slate-950'}`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-sm mb-6 ${isFeatured ? 'text-indigo-200' : 'text-slate-500'}`}
                  >
                    {tier.tagline}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className={`text-sm font-semibold ${isFeatured ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      od
                    </span>
                    <span
                      className={`text-6xl font-black leading-none ${
                        isFeatured
                          ? 'bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200'
                          : 'text-slate-950'
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={`text-xl font-bold ${isFeatured ? 'text-indigo-300' : 'text-slate-600'}`}
                    >
                      PLN
                    </span>
                  </div>
                  <p className={`text-xs ${isFeatured ? 'text-slate-400' : 'text-slate-500'} mb-1`}>
                    / miesięcznie
                  </p>
                  <p
                    className={`text-[11px] mb-6 ${isFeatured ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    netto · brutto {tier.priceGross} zł · Faktura VAT w panelu
                  </p>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-3 ${
                      isFeatured ? 'text-indigo-300' : 'text-slate-500'
                    }`}
                  >
                    {tier.diff || 'Pakiet bazowy zawiera'}
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {tier.features.map((f) => (
                      <li
                        key={f.text}
                        className={`flex items-start gap-2.5 text-sm leading-snug ${
                          isFeatured ? 'text-slate-200' : 'text-slate-700'
                        }`}
                      >
                        <Check
                          size={16}
                          className={`mt-0.5 flex-shrink-0 ${
                            isFeatured ? 'text-indigo-400' : 'text-emerald-600'
                          }`}
                          aria-hidden="true"
                        />
                        <span>
                          {f.text}
                          {f.isNew && (
                            <span
                              className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isFeatured
                                  ? 'bg-indigo-500/30 text-indigo-200'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              Nowe
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handlePickTier(tier.id)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-full text-sm transition-all ${
                      isFeatured
                        ? 'bg-white text-slate-900 hover:bg-indigo-50'
                        : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 motion-safe:hover:-translate-y-0.5'
                    }`}
                  >
                    Wybierz {tier.name}
                    {isFeatured && <ArrowRight size={16} aria-hidden="true" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* PROFESSIONAL panel */}
          <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-0 rounded-3xl overflow-hidden border-2 border-slate-200">
            <div className="relative p-8 md:p-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
              {techGrid}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.18em] mb-5">
                  <Shield size={12} aria-hidden="true" />
                  Branże regulowane
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-3">Pakiet Professional.</h3>
                <p className="text-slate-300 mb-7 leading-relaxed">
                  Dla adwokatów, lekarzy, księgowych, fizjoterapeutów, doradców — gdzie wymagamy
                  podwyższonych standardów prywatności i RODO.
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-400">od</span>
                  <span className="text-6xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                    549
                  </span>
                  <span className="text-xl font-bold text-indigo-300">PLN</span>
                </div>
                <p className="text-xs text-slate-400 mb-7">
                  netto · brutto 675 zł · Przy stawkach 300–500 zł/h jeden lead zwraca rok
                  abonamentu.
                </p>
                <button
                  type="button"
                  onClick={() => handlePickTier(PROFESSIONAL_TIER.id)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-900 font-bold rounded-full hover:bg-indigo-50 transition-colors"
                >
                  Wybierz Professional <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-slate-50">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-4">
                Wszystko z pakietu Premium + dodatkowo
              </div>
              <ul className="space-y-2.5">
                {PROFESSIONAL_TIER.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm leading-snug text-slate-700"
                  >
                    <Check
                      size={16}
                      className="text-indigo-600 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600 mt-8 max-w-3xl mx-auto">
            Bez opłat aktywacyjnych. Umowa minimum <strong>3 miesiące</strong>, potem rozliczenie{' '}
            <strong>mc-to-mc</strong>. Po roku możesz wykupić stronę na własność (1 000 zł po 12 mc,
            5 000 zł w pierwszym roku).
          </p>
        </Container>
      </section>

      {/* ==================== INCLUDES BENTO ==================== */}
      <section className="relative py-24 md:py-32 bg-slate-50 overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="W pakiecie"
            title={
              <>
                10 rzeczy,
                <br />
                które normalnie
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  płaciłbyś
                </span>{' '}
                osobno.
              </>
            }
            lead="Zintegrowane w jednej cenie. Bez dopłat za hosting, domenę, SEO setup, SSL czy kopię zapasową."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
            {INCLUDES.map((inc) => {
              const accentStyles: Record<string, string> = {
                indigo:
                  'lg:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border-indigo-500/30',
                navy: 'lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-slate-700/40',
                blue: 'lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-400/30',
              };
              const accent = inc.accent
                ? accentStyles[inc.accent]
                : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300';
              return (
                <div
                  key={inc.num}
                  className={`relative flex flex-col justify-between p-6 rounded-3xl border-2 overflow-hidden transition-all ${accent}`}
                >
                  {inc.accent && techGrid}
                  <div className="relative z-10">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${
                        inc.accent ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      {inc.num}
                      {inc.label && ` · ${inc.label}`}
                    </p>
                    <h4
                      className={`text-xl font-black mb-2 ${inc.accent ? 'text-white' : 'text-slate-950'}`}
                    >
                      {inc.title}
                    </h4>
                  </div>
                  <p
                    className={`relative z-10 text-sm leading-relaxed ${
                      inc.accent ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {inc.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ==================== PROCESS ==================== */}
      <section id="proces" className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Proces · 4 kroki"
            title={
              <>
                Od zakupu do
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  pierwszego
                </span>{' '}
                leada.
              </>
            }
            lead='Średnio ~25 minut Twojego czasu. Bez maili. Bez „spotkania zoom z konsultantem".'
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-indigo-600">
                    {s.num}
                  </span>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700">
                    <s.icon size={18} aria-hidden="true" />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-950 mb-1">{s.title}</h4>
                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600 mb-3">
                  ━ {s.time}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative text-center p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
            {techGrid}
            <p className="relative z-10 text-2xl md:text-3xl font-black mb-2">
              ~25 minut od decyzji do działającej strony.
            </p>
            <p className="relative z-10 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
              Bez maili · Bez telefonów · Bez „spotkania zoom"
            </p>
          </div>
        </Container>
      </section>

      {/* ==================== DLACZEGO NIE WORDPRESS ==================== */}
      <section className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Mixture vs WordPress"
            title={
              <>
                Czego{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  nie dostaniesz
                </span>
                <br />
                na WordPressie.
              </>
            }
            lead="WordPress to świetne narzędzie — ale nie rozwiąże za Ciebie Local SEO i nie zbuduje treści E-E-A-T z Twojej historii zawodowej."
          />

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-950 text-white overflow-hidden relative">
                {techGrid}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-3">
                    <MapPin size={12} aria-hidden="true" />
                    Local SEO Pro
                  </div>
                  <h3 className="text-2xl font-black mb-3">
                    Programmatic geo pages — automatycznie.
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    System generuje osobne podstrony dla każdej dzielnicy i okolicznego miasta
                    — z unikalną treścią i lokalnymi słowami kluczowymi. Nie kopiuje treści,
                    tylko personalizuje je pod lokalizację. Efekt: widoczność w Google dla
                    fraz „[usługa] [dzielnica]" bez ręcznego pisania dziesiątek podstron.
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-300">
                    Dostępne od pakietu Standard · do 6 lokalizacji
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                  <Sparkles size={12} className="text-indigo-600" aria-hidden="true" />
                  E-E-A-T z realnych historii
                </div>
                <h3 className="text-xl font-black text-slate-950 mb-3">
                  Treści z Twojej historii zawodowej — nie z generatora.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Kreator zbiera Twoje certyfikaty, lata doświadczenia, realizacje i opinie
                  klientów. System buduje z tych danych unikalne treści spełniające wymogi
                  Google E-E-A-T (Experience · Expertise · Authoritativeness · Trust). Strona
                  „fryzjer Rzeszów" z prawdziwą historią właścicielki bije anonimowy szablon
                  WordPress w rankingach.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Shield,
                  title: 'RODO per-tenant z pudełka',
                  desc: 'WordPress wymaga płatnych wtyczek GDPR + hosting zgodny z RODO + ręczna konfiguracja. Tu: per-tenant encryption, DPA template, retencja leadów 24 mc — w cenie od dnia 1.',
                },
                {
                  icon: Activity,
                  title: 'GBP sync bez ręcznej pracy',
                  desc: 'Posty w Google Business Profile, odpowiedzi na opinie i aktualizacja godzin — automatyczne, na bazie Twoich danych w panelu. Na WordPressie to osobna wtyczka i godziny konfiguracji.',
                },
                {
                  icon: Cpu,
                  title: 'SMS leady w 30 sekund',
                  desc: 'Formularz → SMS do Ciebie w 30 sekund. HBR: szansa zamknięcia leada spada 9-krotnie jeśli zadzwonisz po 5 minutach. Na WordPressie wymaga Zapier + Twilio + osobny abonament.',
                },
                {
                  icon: Cloud,
                  title: 'LCP <1 sekundy bez konfiguracji',
                  desc: 'Astro 5 na Cloudflare Workers — żadnych pluginów cache, żadnego LiteSpeed, żadnego CDN do ręcznej konfiguracji. Każda strona jest statycznym HTML na edge.',
                },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex gap-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 shrink-0 mt-0.5">
                    <item.icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== KONKRET ==================== */}
      <section className="relative py-24 md:py-32 bg-slate-50 overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Konkret, nie marketing"
            title={
              <>
                Co{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  stoi za
                </span>
                <br />
                tymi cenami.
              </>
            }
            lead="Realne dane firmowe, infrastruktura, RODO. Możesz zweryfikować każdą pozycję."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {KONKRET.map((k) => (
              <div key={k.title} className="p-6 rounded-3xl bg-white border border-slate-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 mb-4">
                  <k.icon size={22} aria-hidden="true" />
                </div>
                <h4 className="text-lg font-bold text-slate-950 mb-3">{k.title}</h4>
                <ul className="space-y-1.5">
                  {k.items.map((it, i) => (
                    <li
                      key={i}
                      className={`text-sm text-slate-600 ${i === 0 ? 'font-bold text-slate-900' : ''}`}
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== COMPARISON ==================== */}
      <section id="porownanie" className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="3 modele zakupu"
            title={
              <>
                Abonament vs{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  klasyka
                </span>
                <br />
                vs DIY.
              </>
            }
            lead="Każdy model ma sens dla innego budżetu i potrzeb. Wybierz świadomie."
          />

          <div className="overflow-x-auto -mx-4 px-4">
            <div className="min-w-[760px] grid grid-cols-4 gap-3 mb-3">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 self-end pb-3">
                3 modele zakupu strony WWW
              </div>
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-950 text-white border-2 border-indigo-500/40">
                <h4 className="text-xl font-black">Mixture</h4>
                <p className="text-xs text-indigo-300 uppercase tracking-[0.15em] font-bold mt-1">
                  Abonament
                </p>
                <p className="text-2xl font-black mt-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                  od 179 zł
                </p>
                <p className="text-[10px] text-slate-400 mt-1">miesięcznie · min. 3 mies.</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <h4 className="text-xl font-black text-slate-950">Agencja</h4>
                <p className="text-xs text-slate-500 uppercase tracking-[0.15em] font-bold mt-1">
                  Klasyczne zlecenie
                </p>
                <p className="text-2xl font-black text-slate-950 mt-3">4–30 tys.</p>
                <p className="text-[10px] text-slate-500 mt-1">jednorazowo</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <h4 className="text-xl font-black text-slate-950">DIY</h4>
                <p className="text-xs text-slate-500 uppercase tracking-[0.15em] font-bold mt-1">
                  Wix / Squarespace
                </p>
                <p className="text-2xl font-black text-slate-950 mt-3">od 60 zł</p>
                <p className="text-[10px] text-slate-500 mt-1">sam ją robisz</p>
              </div>
            </div>
            <div className="min-w-[760px] grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-2">
                {COMPARISON.labels.map((l) => (
                  <div
                    key={l}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-sm font-bold text-slate-700"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {COMPARISON.mixture.map((v, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 rounded-xl bg-indigo-50 text-sm text-slate-900 font-semibold border border-indigo-100"
                  >
                    {v}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {COMPARISON.agency.map((v, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 rounded-xl bg-white text-sm text-slate-600 border border-slate-200"
                  >
                    {v}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {COMPARISON.diy.map((v, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 rounded-xl bg-white text-sm text-slate-600 border border-slate-200"
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600 mt-8 max-w-3xl mx-auto">
            Mixture jest też klasyczną agencją marketingową — zlecenia{' '}
            <strong>4 000–30 000 zł</strong> realizujemy w tradycyjnym modelu. Abonament to osobny
            produkt dla mikrofirm bez budżetu na full custom.
          </p>

          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <div className="p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-200">
              <h4 className="text-xl font-bold text-slate-950 mb-4">
                Klasyczne zlecenie,
                <br />
                jeśli...
              </h4>
              <ul className="space-y-2 text-sm text-slate-700 mb-6">
                <li className="flex gap-2">
                  <Check size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <span>masz unikalny projekt z budżetem 5–30 tys. zł</span>
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <span>potrzebujesz custom designu lub dedykowanych integracji</span>
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <span>chcesz mieć pełne prawa do kodu i grafiki od dnia 1</span>
                </li>
              </ul>
              <Link
                to="/web-development/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-full text-sm border-2 border-slate-200 hover:border-indigo-300 transition-colors"
              >
                Oferta agencji <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-950 text-white border border-indigo-500/30 overflow-hidden">
              {techGrid}
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-4">
                  Abonament Mixture,
                  <br />
                  jeśli...
                </h4>
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex gap-2">
                    <Check size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>masz mikrofirmę (1–5 osób) bez budżetu na 5+ tys. zł setupu</span>
                  </li>
                  <li className="flex gap-2">
                    <Check size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>nie chcesz robić strony sam (DIY) ani prowadzić projektu z agencją</span>
                  </li>
                  <li className="flex gap-2">
                    <Check size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>potrzebujesz lokalnych leadów i SEO Google Business — od razu</span>
                  </li>
                </ul>
                <a
                  href="#pricing"
                  onClick={(e) => handleSmoothScroll(e, 'pricing')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-full text-sm hover:bg-indigo-50 transition-colors"
                >
                  Wybierz pakiet <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== AUTHOR ==================== */}
      <section className="relative py-24 md:py-32 bg-slate-50 overflow-hidden">
        {techGrid}
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-32 w-[380px] h-[380px] bg-indigo-300/20 rounded-full blur-[120px] motion-safe:animate-blob"
        />
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Twarz za platformą"
            title={
              <>
                Kto to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  buduje.
                </span>
              </>
            }
            lead="Jakub Niedziela — założyciel Mixture Marketing. Rzeszów, 2020 → dziś."
          />

          <div className="grid md:grid-cols-[1fr_1.4fr] gap-8 items-center">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
              <img
                src="/assets/team/jakub-niedziela-400.jpg"
                alt="Jakub Niedziela — założyciel Mixture Marketing"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover grayscale"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                ↓ B&amp;W · Jakub Niedziela
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 mb-3">
                Założyciel · Fullstack developer · Rzeszów
              </p>
              <h3 className="text-4xl md:text-5xl font-black text-slate-950 mb-2">
                Jakub Niedziela.
              </h3>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500 mb-6">
                Founder · Mixture Marketing Sp. z o.o.
              </p>
              <div className="space-y-4 text-slate-700 leading-relaxed mb-6">
                <p>
                  Od 2020 prowadzę agencję marketingową w Rzeszowie. Setki konsultacji z lokalnymi
                  firmami pokazały mi jedno: tradycyjny model agencji (3000 zł/mc za stronę
                  WordPress + ręczna obsługa){' '}
                  <strong>nie pasuje do mikrofirmy na Podkarpaciu</strong>.
                </p>
                <p>
                  W 2025 zacząłem budować Mixture jako odpowiedź — strona w abonamencie, którą
                  mikrofirma uruchamia w 25 minut bez maili z konsultantem. Cloudflare Workers,
                  Astro, AI Claude do treści. Cała platforma od zera, bez kompromisów na rzecz
                  „tańszej przyszłości WordPress".
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://pl.linkedin.com/in/jakub-niedziela-9251a8254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-full text-sm border-2 border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <Linkedin size={16} aria-hidden="true" /> LinkedIn{' '}
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
                <a
                  href="mailto:info@mixturemarketing.pl"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-slate-700 font-bold rounded-full text-sm hover:text-indigo-700 transition-colors"
                >
                  <Mail size={16} aria-hidden="true" /> info@mixturemarketing.pl
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== PHONE CTA ==================== */}
      <section id="kontakt" className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Wolisz porozmawiać?"
            title={
              <>
                Nie musisz
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  klikać
                </span>{' '}
                i płacić online.
              </>
            }
            lead="Pn–Pt 9:00–17:00 · Polski · Konsultacja bez zobowiązań"
          />

          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-stretch">
            <div className="p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Wiemy że nie każdy lubi self-service. Możesz po prostu zadzwonić, porozmawiać z
                  Jakubem, dostać <strong>fakturę proforma</strong> i zapłacić zwykłym przelewem
                  bankowym.
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-7">
                  Bez Stripe&apos;a · Bez karty · Bez kreatora
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:info@mixturemarketing.pl?subject=Faktura%20VAT%20za%20abonament"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-bold rounded-full text-sm shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 motion-safe:hover:-translate-y-0.5 transition-all"
                >
                  Napisz — faktura VAT <ArrowRight size={14} aria-hidden="true" />
                </a>
                <Link
                  to="/contact/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-full text-sm border-2 border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  Konsultacja 45 min · 0 zł
                </Link>
              </div>
            </div>
            <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
              {techGrid}
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.18em] self-start">
                  <Clock size={12} aria-hidden="true" />
                  Pn–Pt 9:00–17:00
                </div>
                <div className="my-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300 mb-3">
                    +48
                  </p>
                  <p className="text-5xl md:text-6xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                    794 443 551
                  </p>
                </div>
                <a
                  href="tel:+48794443551"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-full text-sm hover:bg-indigo-50 transition-colors self-start"
                >
                  Zadzwoń do Jakuba <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ==================== FAQ ==================== */}
      <section
        id="faq"
        className="abonament-faq relative py-24 md:py-32 bg-slate-50 overflow-hidden"
      >
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="FAQ"
            title={
              <>
                Częste
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  pytania.
                </span>
              </>
            }
            lead="Krótkie odpowiedzi na to, co najczęściej słyszymy."
          />

          <div className="max-w-4xl mx-auto space-y-3">
            {FAQ.map((f, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 open:border-indigo-300 open:shadow-md transition-all"
              >
                <summary className="flex items-start gap-4 p-5 md:p-6 cursor-pointer list-none marker:hidden">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-base md:text-lg font-bold text-slate-950">
                    {f.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-open:bg-indigo-100 group-open:text-indigo-700 group-open:rotate-45 transition-all text-lg"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </span>
                </summary>
                <div className="faq-answer px-5 md:px-6 pb-5 md:pb-6 pl-14 md:pl-16">
                  <p className="text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== TECH SPEC (dla deweloperów / dociekliwych) ==================== */}
      <section className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Stack techniczny"
            title={
              <>
                Dla{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  dociekliwych.
                </span>
              </>
            }
            lead="Jeśli jesteś programistą lub po prostu lubisz wiedzieć z czego korzystasz — pełna specyfikacja platformy."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Code2,
                title: 'Astro 5 + Cloudflare Workers',
                items: [
                  'Static HTML na edge — żadnego runtime SSR',
                  'Cloudflare Workers for SaaS (multi-tenant)',
                  'LCP < 1 sekundy z pudełka, zero cache plugins',
                ],
              },
              {
                icon: Database,
                title: 'Multi-tenant architektura',
                items: [
                  'Osobne Git repo per klient (izolacja kodu)',
                  'Cloudflare D1 (SQLite) + KV per tenant',
                  'R2 storage — pliki, zdjęcia, dokumenty',
                ],
              },
              {
                icon: Shield,
                title: 'Bezpieczeństwo danych',
                items: [
                  'AES-GCM 256-bit backup szyfrowany per tenant',
                  'Retencja 30 dni · EU data residency',
                  'Per-tenant encryption key — izolacja na poziomie danych',
                ],
              },
              {
                icon: Sparkles,
                title: 'AI stack',
                items: [
                  'Claude (Anthropic) — treści usługowe i blogowe',
                  'Human-in-the-loop: klient zatwierdza przed publikacją',
                  'Professional: AI Blog wyłączony domyślnie',
                ],
              },
              {
                icon: MapPin,
                title: 'AI Search visibility',
                items: [
                  'llms.txt + llms-full.txt per strona',
                  'Schema.org: LocalBusiness + Service + FAQ + Person',
                  'Sitemap XML per tenant z realnym lastmod',
                ],
              },
              {
                icon: CreditCard,
                title: 'Billing stack',
                items: [
                  'Stripe Billing — subskrypcje + checkout',
                  'Faktury przez Fakturownia.pl API (1. dnia mc)',
                  'Webhooks: upgrade/downgrade/cancel automatyczny',
                ],
              },
            ].map((card) => (
              <div key={card.title} className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 mb-4">
                  <card.icon size={22} aria-hidden="true" />
                </div>
                <h4 className="text-lg font-bold text-slate-950 mb-3">{card.title}</h4>
                <ul className="space-y-1.5">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-indigo-400 mt-0.5 shrink-0">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== RELATED ==================== */}
      <section className="relative py-24 md:py-32 bg-white overflow-hidden">
        {techGrid}
        <Container className="relative z-10">
          <SectionHead
            eyebrow="Powiązane usługi"
            title={
              <>
                Wolisz
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  dedykowaną
                </span>{' '}
                stronę?
              </>
            }
            lead="Mixture to też klasyczna agencja — pełna paleta usług marketingowych dla firm z większym budżetem."
          />

          <div className="grid md:grid-cols-3 gap-5">
            {RELATED.map((r) => (
              <Link
                key={r.href}
                to={r.href}
                className="group flex items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white hover:shadow-lg transition-all"
              >
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-[0.15em] mb-3">
                    {r.tag}
                  </span>
                  <h4 className="text-lg font-bold text-slate-950 mb-1">{r.title}</h4>
                  <p className="text-sm text-slate-600">{r.desc}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="text-2xl text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
        {techGrid}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-[440px] h-[440px] bg-indigo-500/20 rounded-full blur-[140px] motion-safe:animate-blob" />
          <div
            className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[140px] motion-safe:animate-blob"
            style={{ animationDelay: '3s' }}
          />
        </div>
        <Container className="relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.02] tracking-tight mb-6">
            Pomówmy
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-white">
              bez zobowiązań.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            45 minut konsultacji bezpłatnie. Bez sprzedażowego pingowania. Jak nie dla Ciebie —
            polecimy coś innego.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-full text-base hover:bg-indigo-50 motion-safe:hover:-translate-y-0.5 transition-all"
            >
              Napisz do nas <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href="tel:+48794443551"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full text-base border-2 border-white/20 hover:bg-white/20 transition-all"
            >
              <Phone size={18} aria-hidden="true" /> +48 794 443 551
            </a>
          </div>
        </Container>
      </section>

      {/* Modal */}
      <PreonboardModal tier={openTier} onClose={() => setOpenTier(null)} />

      {/* Sticky mobile bar */}
      <div
        aria-hidden={!showStickyMobileBar || pricingInView}
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
          showStickyMobileBar && !pricingInView ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs leading-tight">
            <p className="font-bold text-slate-900">Od 179 zł / mc</p>
            <p className="text-slate-500">4 pakiety · faktura VAT</p>
          </div>
          <a
            href="tel:+48794443551"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-700 transition-colors"
            aria-label="Zadzwoń: +48 794 443 551"
          >
            <Phone size={18} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => scrollToId('pricing')}
            className="inline-flex items-center gap-1.5 px-5 h-11 bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-bold rounded-full shadow-md text-sm"
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
