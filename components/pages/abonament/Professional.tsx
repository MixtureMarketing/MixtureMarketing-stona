/* eslint-disable max-lines -- landing dla branz regulowanych z pelna lista RODO+/SLA */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Scale,
  Stethoscope,
  Calculator as CalculatorIcon,
  FileText,
  Lock,
  Globe,
  Award,
  ArrowRight,
  Phone,
  Mail,
  Briefcase,
  Clock,
  ChevronRight,
  Cpu,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import AmbientBackground from '../../common/AmbientBackground';
import PreonboardModal from './PreonboardModal';
import MagneticButton from './MagneticButton';
import { HeroBadge, GhostButton, CountUp } from './shared';
import { trackEvent } from '../../../utils/analytics';

const PROFESSIONAL_PRICE = 549;
const PROFESSIONAL_PRICE_GROSS = 675;

const TARGET_PROFESSIONS = [
  {
    icon: Scale,
    name: 'Adwokat / Radca prawny',
    bullets: [
      'Tajemnica zawodowa',
      'Sekcja publikacji + case studies',
      'Klauzule informacyjne RODO+',
    ],
    chip: 'bg-amber-100 text-amber-800',
  },
  {
    icon: Stethoscope,
    name: 'Lekarz / Dentysta / Fizjoterapeuta',
    bullets: ['Bezpieczny upload zgód', 'Wersja językowa EN/UA w cenie', 'Brak AI Blog (etyka)'],
    chip: 'bg-rose-100 text-rose-800',
  },
  {
    icon: CalculatorIcon,
    name: 'Księgowy / Doradca podatkowy',
    bullets: [
      'Cal.com + płatne konsultacje',
      'Trust badges (nr wpisu, polisa OC)',
      'Per-tenant encryption',
    ],
    chip: 'bg-violet-100 text-violet-800',
  },
];

const PRO_FEATURES = [
  {
    icon: FileText,
    title: 'Sekcja publikacji i wystąpień',
    desc: 'CMS dedykowany pod publikacje branżowe, wystąpienia konferencyjne, artykuły eksperckie. Buduje E-E-A-T dla Google + AI search (ChatGPT, Perplexity cytują autorytety).',
  },
  {
    icon: Briefcase,
    title: 'Case studies zgodne z tajemnicą zawodową',
    desc: 'Anonimowane realizacje wg standardów branżowych (RODO + tajemnica adwokacka/lekarska). Dział "wyniki" bez ujawniania klienta — pokazujesz kompetencje bez ryzyka reputacyjnego.',
  },
  {
    icon: Lock,
    title: 'Bezpieczny upload dokumentów',
    desc: 'End-to-end encryption (AES-GCM 256-bit) → R2 storage. Klient uploaduje zgodę pacjenta, dokumenty sprawy, skan PESELa. Retention 30 dni, auto-delete. Pełna ścieżka audytowa.',
  },
  {
    icon: Shield,
    title: 'Pakiet RODO+',
    desc: 'DPA do podpisu PRZED zakupem (model: Mixture = procesor, Ty = ADO). Rejestr czynności przetwarzania, klauzule informacyjne, lista subprocesorów (Cloudflare/Anthropic/Stripe) + SCC clauses.',
  },
  {
    icon: Globe,
    title: 'EN + UA w cenie',
    desc: 'Wersja angielska i ukraińska — standardowo 199 zł setup/język, w Professional w cenie. Adresuje pacjentów/klientów EU + UA migrants po 2022.',
  },
  {
    icon: Award,
    title: 'Trust badges',
    desc: 'Numer wpisu na listę (adwokat/lekarz), numer polisy OC, certyfikaty IRP/PUODO/POLNS. Widoczne w stopce + footer schema dla Google Knowledge Graph.',
  },
];

const PRO_NEGATIVES = [
  {
    icon: AlertTriangle,
    title: 'AI Blog wyłączony domyślnie',
    desc: 'Treści medyczne/prawne generowane przez AI = ryzyko reputacyjne i prawne (porady = ADO odpowiedzialność). W Professional Ty piszesz treści, my pomagamy z SEO.',
  },
  {
    icon: AlertTriangle,
    title: 'FOMO / Leadpop wyłączone',
    desc: 'Pop-up "10 osób ogląda teraz" jest niedopuszczalny dla branży regulowanej. Konkurs reklamowy adwokata/lekarza = sankcja izby. Mixture wymusza tu wyłączenie nawet jeśli klient by chciał.',
  },
  {
    icon: AlertTriangle,
    title: 'Brak agresywnych CTA',
    desc: 'Żadnych "Tylko dziś!", "Promocja kończy się za 24h" — etyka branżowa zakazuje pop-up reklam medycznych/prawnych. Domyślne CTA są profesjonalne ("Umów konsultację", "Zapytaj").',
  },
];

interface SlaEntry {
  label: string;
  icon: React.ElementType;
  /** Numeryczna wartość do animacji count-up (gdy null — pokaż tylko text) */
  num: number | null;
  decimals?: number;
  suffix?: string;
  /** Statyczny fallback / pełna treść gdy num=null */
  text: string;
}
const SLA: SlaEntry[] = [
  {
    label: 'Uptime SLA (mierzone publicznie)',
    icon: Cpu,
    num: 99.9,
    decimals: 1,
    suffix: '%',
    text: '99.9%',
  },
  {
    label: 'RTO dla błędu krytycznego',
    icon: Clock,
    num: 4,
    suffix: ' godziny',
    text: '4 godziny',
  },
  {
    label: 'RPO (max utrata danych)',
    icon: Shield,
    num: 24,
    suffix: ' godziny',
    text: '24 godziny',
  },
  {
    label: 'Kara za downtime >8h/mc',
    icon: AlertTriangle,
    num: null,
    text: '1/30 abonamentu × dzień',
  },
];

const SUBPROCESSORS = [
  {
    name: 'Cloudflare',
    service: 'Hosting + CDN + Workers',
    location: 'US/EU (Schrems II via SCC)',
    dpa: 'cloudflare.com/cloudflare-customer-dpa/',
  },
  {
    name: 'Anthropic Claude',
    service: 'AI text generation (only Premium+; OFF in Professional)',
    location: 'US',
    dpa: 'anthropic.com/dpa',
  },
  {
    name: 'Stripe',
    service: 'Subskrypcje + płatności',
    location: 'IE (EU)',
    dpa: 'stripe.com/dpa',
  },
  { name: 'Resend', service: 'Transactional emails', location: 'US', dpa: 'resend.com/legal/dpa' },
  {
    name: 'OVH',
    service: 'Domena .pl rejestracja',
    location: 'PL',
    dpa: 'ovh.com/auth/cgi-bin/uk/order/dpa_register.cgi',
  },
  {
    name: 'Cloudflare R2',
    service: 'File storage (backupy + dokumenty)',
    location: 'US/EU',
    dpa: 'cloudflare.com/cloudflare-customer-dpa/',
  },
];

const Professional: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    trackEvent('click_tier_button', {
      tier: 'professional',
      price_pln: PROFESSIONAL_PRICE,
      source: 'professional_landing',
    });
    setModalOpen(true);
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Service', 'Product'],
    name: 'Strona dla gabinetu / kancelarii — abonament Professional',
    description:
      'Strona internetowa w abonamencie dla branż regulowanych: adwokat, lekarz, dentysta, fizjoterapeuta, księgowy, doradca podatkowy. Zgodna z RODO+, tajemnicą zawodową. 549 zł/mc.',
    provider: { '@type': 'Organization', '@id': 'https://mixturemarketing.pl/#organization' },
    areaServed: { '@type': 'Country', name: 'Polska' },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Adwokaci, lekarze, fizjoterapeuci, księgowi, doradcy podatkowi',
    },
    offers: {
      '@type': 'Offer',
      name: 'Professional',
      price: String(PROFESSIONAL_PRICE),
      priceCurrency: 'PLN',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(PROFESSIONAL_PRICE),
        priceCurrency: 'PLN',
        billingDuration: 'P1M',
        billingIncrement: 1,
        unitText: 'MON',
      },
    },
  };

  return (
    <div className="min-h-screen bg-white text-dark">
      <Seo
        title="Strona dla kancelarii / gabinetu — zgodna z RODO i tajemnicą zawodową"
        description="Strona internetowa w abonamencie dla adwokatów, lekarzy, dentystów, fizjoterapeutów, księgowych. Pakiet RODO+ (DPA jako procesor, lista subprocesorów, SCC). SLA 99.9% z RTO 4h. 549 zł/mc."
        canonical="/abonament/professional/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Strona w abonamencie', item: '/abonament/' },
          { name: 'Professional (branże regulowane)', item: '/abonament/professional/' },
        ]}
        jsonLd={serviceJsonLd}
      />

      <AmbientBackground />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-100/40 rounded-full blur-[150px] opacity-50 motion-safe:animate-blob" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <HeroBadge accent="amber" className="mb-8">
              Branże regulowane · RODO+
            </HeroBadge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark leading-[1.05] tracking-tight mb-6">
              Strona dla kancelarii i&nbsp;gabinetu
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-700 via-amber-800 to-amber-700">
                zgodna z&nbsp;RODO i&nbsp;tajemnicą zawodową
              </span>
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed mb-10 max-w-3xl mx-auto">
              Dla{' '}
              <strong className="text-dark">
                adwokatów, lekarzy, fizjoterapeutów, księgowych, doradców podatkowych
              </strong>
              . Pakiet RODO+ z DPA jako procesor. Lista subprocesorów z SCC. SLA 99.9% z RTO 4h dla
              błędu krytycznego. Wersje EN/UA w cenie. AI Blog wyłączony domyślnie (etyka branżowa).
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-8 max-w-xl mx-auto">
              <MagneticButton
                type="button"
                strength={0.35}
                onClick={handleOpenModal}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-full text-lg shadow-xl shadow-amber-500/30 transition-shadow"
              >
                Zamów Professional
                <ArrowRight size={20} aria-hidden="true" />
              </MagneticButton>
              <GhostButton accent="amber" href="tel:+48794443551">
                <Phone size={18} aria-hidden="true" />
                Zadzwoń przed
              </GhostButton>
            </div>

            <div className="inline-flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-extrabold text-dark">{PROFESSIONAL_PRICE} zł</span>
              <span className="text-base text-gray-500 font-semibold">/ miesiąc netto</span>
            </div>
            <p className="text-xs text-gray-500">
              {PROFESSIONAL_PRICE_GROSS} zł brutto · Faktura VAT · Min. 3 mies., potem mc-to-mc
            </p>
          </div>
        </Container>
      </section>

      {/* ============ TARGET PROFESSIONS ============ */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3">
              Dla kogo
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              Kim są nasi klienci Professional
            </h2>
            <p className="text-lg text-gray-600">
              Łączy ich wspólny mianownik:{' '}
              <strong>
                tajemnica zawodowa, podwyższone wymogi RODO, dbałość o reputację eksperta
              </strong>
              .
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {TARGET_PROFESSIONS.map((p) => (
              <div
                key={p.name}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${p.chip} rounded-xl mb-4`}
                >
                  <p.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-3">{p.name}</h3>
                <ul className="space-y-1.5 m-0 p-0 list-none">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed"
                    >
                      <ChevronRight
                        size={12}
                        className="shrink-0 mt-0.5 text-amber-500"
                        aria-hidden="true"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ CORE FEATURES — Co dostajesz ============ */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3">
              Co dostajesz
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              6 funkcji których brak w standardowych pakietach
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {PRO_FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 text-amber-700 rounded-xl mb-4">
                  <f.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-2 leading-tight">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ WHAT'S OFF — czego NIE robimy ============ */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3">
              Czego nie robimy
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              Wyłączamy domyślnie funkcje ryzykowne dla branży
            </h2>
            <p className="text-lg text-gray-600">
              Standardowe pakiety mają AI Blog, FOMO pop-upy i agresywne CTA. W Professional są
              wyłączone — to <strong>świadoma decyzja</strong> wymuszona ryzykiem reputacyjnym i
              izbą zawodową.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PRO_NEGATIVES.map((n) => (
              <div
                key={n.title}
                className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 bg-rose-50 text-rose-600 rounded-xl mb-4">
                  <n.icon size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base text-dark mb-2">{n.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ SLA ============ */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3">
              Konkretne gwarancje
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              SLA: uptime + RTO + kara za downtime
            </h2>
            <p className="text-lg text-gray-600">
              "Best-effort" nie istnieje dla branży regulowanej. Konkretne liczby i kara umowna w
              pakiecie.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {SLA.map((s) => (
              <div
                key={s.label}
                className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100 shadow-sm"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 text-amber-700 rounded-xl mb-3">
                  <s.icon size={18} aria-hidden="true" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-700 mb-1">
                  {s.label}
                </p>
                <p className="text-xl font-extrabold text-dark">
                  {s.num !== null ? (
                    <CountUp to={s.num} decimals={s.decimals} suffix={s.suffix} />
                  ) : (
                    s.text
                  )}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8 max-w-2xl mx-auto">
            Uptime mierzone publicznie. Status page będzie dostępny pod{' '}
            <a href="https://status.mixturemarketing.pl" className="text-amber-700 hover:underline">
              status.mixturemarketing.pl
            </a>{' '}
            (uruchomienie w Q3 2026). Aktualnie metryki w panelu klienta.
          </p>
        </Container>
      </section>

      {/* ============ SUBPROCESSORS ============ */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3">
              Lista subprocesorów
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              Z kim Mixture współpracuje
            </h2>
            <p className="text-lg text-gray-600">
              Pełna transparentność dla DPA. Każdy subprocesor ma własną klauzulę umowną (SCC)
              zgodną z Schrems II.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-100">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                    Subprocesor
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                    Usługa
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                    Lokalizacja
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                    DPA
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {SUBPROCESSORS.map((s) => (
                  <tr key={s.name} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-dark">{s.name}</td>
                    <td className="px-4 py-3 text-gray-700">{s.service}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.location}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://${s.dpa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Otwórz DPA dla ${s.name} (nowa karta)`}
                        className="inline-block py-1.5 text-amber-700 hover:underline text-xs"
                      >
                        Link DPA →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6 max-w-3xl mx-auto">
            Lista subprocesorów może się zmienić — informujemy z 30-dniowym wyprzedzeniem (zgodnie z
            RODO Art. 28). Klient może odrzucić zmianę lub wypowiedzieć umowę bez sankcji.
          </p>
        </Container>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="relative bg-gradient-to-br from-amber-700 via-amber-800 to-amber-700 rounded-3xl p-10 md:p-16 text-white overflow-hidden max-w-5xl mx-auto">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-400 rounded-full opacity-20 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-amber-100 text-xs font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
                <Sparkles size={12} aria-hidden="true" />
                <span>Professional · {PROFESSIONAL_PRICE} zł/mc</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white leading-tight">
                Najpierw rozmowa, potem decyzja
              </h2>
              <p className="text-lg md:text-xl text-amber-50 mb-10 leading-relaxed">
                Branża regulowana = osobiste poznanie się przed podpisaniem DPA. Zadzwoń do Jakuba —
                45 minut konsultacji bezpłatnie. Omawiamy Twoje konkretne wymogi (izba zawodowa,
                polisa OC, lista pracowników mająca dostęp do strony).
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+48794443551"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-white text-amber-800 rounded-full font-bold hover:bg-amber-50 transition-colors shadow-lg"
                >
                  <Phone size={18} aria-hidden="true" />
                  +48 794 443 551
                </a>
                <a
                  href="mailto:info@mixturemarketing.pl?subject=Pytanie%20o%20pakiet%20Professional"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors"
                >
                  <Mail size={18} aria-hidden="true" />
                  Napisz
                </a>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-7 py-4 bg-amber-900/40 border-2 border-amber-300/30 text-amber-50 rounded-full font-bold hover:bg-amber-900/60 transition-colors"
                >
                  Zamów online
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Link do hub'a */}
          <div className="text-center mt-8">
            <Link
              to="/abonament/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-amber-700 transition-colors"
            >
              <ArrowRight size={14} className="rotate-180" aria-hidden="true" />
              Wróć do wszystkich pakietów (Starter / Standard / Premium)
            </Link>
          </div>
        </Container>
      </section>

      <PreonboardModal
        tier={modalOpen ? 'professional' : null}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Professional;
