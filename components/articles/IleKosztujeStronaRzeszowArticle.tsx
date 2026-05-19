/* eslint-disable max-lines -- single long-form article */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Layers,
  Code2,
  ShoppingCart,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Award,
  HelpCircle,
  Zap,
  ShieldCheck,
  FileText,
  MapPin,
} from 'lucide-react';
import ArticleShell from './ArticleShell';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';

const SLUG = '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026';

const PRICING_TIERS = [
  {
    icon: Sparkles,
    name: 'Landing Page',
    price: 'od 3 900 zł',
    time: '7–14 dni',
    color: 'from-blue-50 to-white',
    border: 'border-blue-100',
    chip: 'bg-blue-100 text-blue-800',
    desc: 'Konwersyjna 1-strona pod kampanię Ads. Hero, CTA, oferta, dowody społeczne, formularz.',
    includes: ['Copywriting bazowy', 'Schema.org + SEO on-page', 'Core Web Vitals audit', '1 wersja językowa'],
  },
  {
    icon: Layers,
    name: 'Strona firmowa',
    price: 'od 7 500 zł',
    time: '4–8 tygodni',
    color: 'from-violet-50 to-white',
    border: 'border-violet-100',
    chip: 'bg-violet-100 text-violet-800',
    desc: 'Pełna witryna 5–15 podstron + CMS (WordPress lub Sanity). Blog, formularze, integracje.',
    includes: ['CMS dla zespołu non-tech', 'Blog z taxonomy', 'Schema LocalBusiness', 'Mailing integration'],
    featured: true,
  },
  {
    icon: ShoppingCart,
    name: 'Sklep internetowy',
    price: 'od 12 000 zł',
    time: '6–12 tygodni',
    color: 'from-emerald-50 to-white',
    border: 'border-emerald-100',
    chip: 'bg-emerald-100 text-emerald-700',
    desc: 'Shoper, WooCommerce lub dedykowany Next.js + Sanity. Płatności + kurierzy + analityka.',
    includes: ['Do 100 SKU w cenie', 'Bramki płatności + kurierzy', 'Product schema', 'GA4 e-commerce'],
  },
  {
    icon: Cpu,
    name: 'Aplikacja dedykowana',
    price: 'od 25 000 zł',
    time: 'od 3 miesięcy',
    color: 'from-orange-50 to-white',
    border: 'border-orange-100',
    chip: 'bg-orange-100 text-orange-700',
    desc: 'SaaS, portal klienta, system rezerwacji, panel B2B, dashboard z autoryzacją.',
    includes: ['MVP w 6 tygodni', 'OAuth/JWT auth', 'Custom backend API', 'Skalowanie infrastruktury'],
  },
];

const COST_FACTORS = [
  {
    icon: FileText,
    title: 'Copywriting i grafika',
    impact: '25-40%',
    desc: 'Najczęstsza pułapka — oferta „od 4 900 zł", w której musisz dostarczyć teksty, zdjęcia, ikony, logo. Realnie copywriting + grafika to 1/3 wartości projektu.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Code2,
    title: 'Liczba integracji',
    impact: '800–4 000 zł / szt',
    desc: 'Każda integracja (płatności, kurierzy, ERP, hurtownie, CRM, mailing, ATS, e-fakturowanie) to dodatkowy koszt zależny od złożoności API. Średni sklep w Rzeszowie ma 4–8 integracji.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'Wydajność i SEO',
    impact: 'krytyczne',
    desc: 'Strona ładująca się 6 sekund bez schema.org nie wygeneruje ruchu organicznego — nawet jeśli kosztowała 30 000 zł. Audyt Core Web Vitals, WebP/AVIF, prerendering powinien być w cenie.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: ShieldCheck,
    title: 'Opieka pogwarancyjna',
    impact: '290–890 zł / mies',
    desc: 'Aktualizacje bezpieczeństwa, monitoring uptime, kopie zapasowe, drobne zmiany contentowe. Jeśli agencja nie oferuje opieki SLA, prawdopodobnie znika po wdrożeniu.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

const ECOMMERCE_TIERS = [
  { range: 'do 100 SKU', price: 'od 12 000 zł', detail: 'Shoper / WooCommerce, gotowe motywy + customization' },
  { range: '100–500 SKU + filtry', price: '18 000–30 000 zł', detail: 'Filtry zaawansowane, atrybuty, warianty produktowe' },
  { range: '500+ SKU + ERP / B2B', price: 'od 40 000 zł', detail: 'Integracja z ERP, hurtownie, ceny per-klient' },
];

const MISTAKES = [
  {
    title: 'Brak briefa',
    desc: 'Zlecenie „potrzebuję strony" bez celów biznesowych prowadzi do 2-3 rund zmian po wdrożeniu. Koszt rośnie o 30–50%.',
  },
  {
    title: 'Cena bez specyfikacji',
    desc: 'Oferta na „5 000 zł za stronę firmową" bez liczby podstron, języków, integracji i tekstów to gwarantowany aneks.',
  },
  {
    title: 'Pominięcie SEO',
    desc: 'Strona bez schema.org, sitemap, Core Web Vitals będzie wymagała audytu po 6 miesiącach (3 000–8 000 zł).',
  },
  {
    title: 'Brak hostingu w cenie',
    desc: 'Niektóre agencje sprzedają hosting z marżą 200–400%. Sprawdź czy możesz wybrać własnego dostawcę.',
  },
  {
    title: 'Freelancer „po przyjacielsku"',
    desc: 'Brak umowy, brak fakturowania, brak gwarancji — i brak komunikacji w momencie krytycznym.',
  },
];

const CONTRACT_CHECKLIST = [
  { title: 'Przeniesienie praw autorskich', desc: 'Do kodu i grafiki — nie tylko licencja użytkowania.' },
  { title: 'Dostęp do CMS i hostingu', desc: 'Jako administrator — nie tylko jako edytor.' },
  { title: 'Eksport bazy danych', desc: 'Klauzula portability — kopia .sql + obrazy na życzenie.' },
  { title: 'Gwarancja 30–90 dni', desc: 'Bezpłatne poprawki błędów po wdrożeniu.' },
  { title: 'SLA opieki pogwarancyjnej', desc: 'Gwarantowany czas reakcji na błąd krytyczny (np. 4h).' },
  { title: 'Audyt Core Web Vitals', desc: 'LCP < 2.5s, INP < 200ms, CLS < 0.1 przed odebraniem.' },
];

const IleKosztujeStronaRzeszowArticle: React.FC = () => {
  return (
    <ArticleShell
      id="ile-kosztuje-strona-rzeszow-2026"
      title="Ile kosztuje strona internetowa w Rzeszowie w 2026 roku: pełny cennik"
      description="Realne widełki cenowe stron WWW w Rzeszowie w 2026: landing page, strony firmowe, sklepy, aplikacje. Co wpływa na koszt, jak czytać oferty, gdzie ukryte są dopłaty. Praktyczny przewodnik dla zamawiającego."
      category="business"
      categoryLabel="Cennik · Rzeszów · 2026"
      image="/assets/images/sygnet.png"
      icon={Calculator}
      accentColor="#3F3D91"
      slug={SLUG}
      author={{
        name: 'Zespół Mixture Marketing',
        role: 'Web Development · Rzeszów',
        url: '/o-nas/',
      }}
      publishedDate="2026-05-19"
      updatedDate="2026-05-19"
      heroVisual={
        <AnimateOnScroll>
          <div className="not-prose grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {PRICING_TIERS.map((t) => (
              <div
                key={t.name}
                className={`relative bg-gradient-to-br ${t.color} p-6 rounded-2xl border ${t.border} ${
                  t.featured ? 'shadow-2xl scale-105 ring-2 ring-secondary/20' : 'shadow-sm'
                }`}
              >
                {t.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-secondary text-white text-xxs font-black uppercase tracking-[0.2em]">
                    Najczęściej
                  </div>
                )}
                <div className={`w-12 h-12 ${t.chip} rounded-xl flex items-center justify-center mb-4`}>
                  <t.icon size={24} />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {t.name}
                </p>
                <p className="text-3xl font-extrabold text-dark mb-1">{t.price}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                  <Clock size={12} />
                  {t.time}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      }
    >
      <AnimateOnScroll>
        <p className="lead text-xl md:text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-3 bg-blue-50/30 rounded-r-xl not-prose">
          W skrócie: <strong className="text-dark">landing page od 3 900 zł</strong>, strona firmowa
          z CMS <strong className="text-dark">od 7 500 zł</strong>, sklep internetowy{' '}
          <strong className="text-dark">od 12 000 zł</strong>, dedykowana aplikacja webowa{' '}
          <strong className="text-dark">od 25 000 zł</strong>. Poniżej — co realnie wpływa na finalną
          cenę i jak czytać oferty agencji z Rzeszowa, żeby nie zapłacić dwa razy.
        </p>
      </AnimateOnScroll>

      <SectionHeader
        title="Dlaczego ceny stron w Rzeszowie są tak rozstrzelone?"
        subtitle="Te same słowa, różne rzeczywistości"
        level="h2"
        align="left"
      />

      <p>
        Jeśli zapytasz pięć agencji w Rzeszowie o wycenę „prostej strony firmowej", dostaniesz
        oferty od 1 500 zł do 25 000 zł. Różnica nie wynika z chęci zysku, tylko z tego, co każda
        firma rozumie pod pojęciem „strona firmowa". Poniższe cztery typy projektów obejmują 95%
        przypadków na rynku 2026.
      </p>

      {/* Detailed pricing tiers (already shown in hero as summary) */}
      <AnimateOnScroll>
        <div className="not-prose grid gap-6 my-12">
          {PRICING_TIERS.map((t) => (
            <div
              key={`detail-${t.name}`}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className={`w-16 h-16 ${t.chip} rounded-2xl flex items-center justify-center shrink-0`}>
                  <t.icon size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-dark m-0">{t.name}</h3>
                    <span className="text-2xl font-extrabold text-secondary">{t.price}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Clock size={14} />
                      {t.time}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{t.desc}</p>
                  <ul className="grid sm:grid-cols-2 gap-2 m-0 p-0 list-none">
                    {t.includes.map((inc) => (
                      <li key={inc} className="flex items-center gap-2 text-sm text-gray-700 m-0">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title="Co realnie wpływa na cenę"
        subtitle="Cztery czynniki, które wyjaśniają 80% rozstrzału ofert"
        level="h2"
        align="left"
      />

      <AnimateOnScroll>
        <div className="not-prose grid md:grid-cols-2 gap-6 my-12">
          {COST_FACTORS.map((f) => (
            <div
              key={f.title}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <f.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-dark m-0 mb-1">{f.title}</h3>
                  <p className={`text-sm font-black uppercase tracking-[0.15em] ${f.color} m-0`}>
                    {f.impact}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 m-0 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title="Sklep internetowy — cena zależy od skali"
        subtitle="Trzy realne progi dla e-commerce w 2026"
        level="h2"
        align="left"
      />

      <AnimateOnScroll>
        <div className="not-prose my-12 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                  Skala sklepu
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                  Cena
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-gray-500 hidden md:table-cell">
                  Zakres
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {ECOMMERCE_TIERS.map((t) => (
                <tr key={t.range} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-dark">{t.range}</td>
                  <td className="px-6 py-4 font-extrabold text-secondary text-lg">{t.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{t.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title="Cennik widełkowy Mixture Marketing — Rzeszów 2026"
        subtitle="Pełna transparentność, wszystkie ceny netto"
        level="h2"
        align="left"
      />

      <p>
        Pracujemy z firmami z Rzeszowa i całego Podkarpacia (model mobilny — dojazd do klienta).
        Klienci ogólnopolscy obsługiwani są zdalnie. Każda wycena jest indywidualna i zależy od
        zakresu funkcjonalności, copywritingu, grafiki i integracji.
      </p>

      <AnimateOnScroll>
        <div className="not-prose bg-gradient-to-br from-violet-50 via-white to-blue-50 p-8 md:p-12 rounded-3xl border border-violet-100 my-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center shrink-0">
              <Calculator size={28} />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-dark m-0 mb-2">
                Kalkulator wyceny online
              </h3>
              <p className="text-gray-600 m-0">
                Wieloetapowy konfigurator z natychmiastową wstępną wyceną — bez zobowiązań.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/offers#calculator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-full font-bold hover:bg-secondary/90 transition-colors no-underline"
            >
              Otwórz kalkulator
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/web-development/rzeszow/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-secondary text-secondary rounded-full font-bold hover:bg-secondary hover:text-white transition-colors no-underline"
            >
              Zobacz ofertę web dev Rzeszów
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title="Jak zamawiający najczęściej tracą pieniądze"
        subtitle="Pięć błędów obserwowanych w 9 na 10 zapytań"
        level="h2"
        align="left"
      />

      <AnimateOnScroll>
        <div className="not-prose my-12 space-y-4">
          {MISTAKES.map((m, i) => (
            <div
              key={m.title}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-rose-200 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-1">
                  <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <h3 className="font-bold text-lg text-dark m-0">{m.title}</h3>
                </div>
                <p className="text-sm text-gray-600 m-0 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title="Co warto wynegocjować w umowie"
        subtitle="Sześć punktów, które oddzielają agencję od freelancera-zniknięcia"
        level="h2"
        align="left"
      />

      <AnimateOnScroll>
        <div className="not-prose grid md:grid-cols-2 gap-4 my-12">
          {CONTRACT_CHECKLIST.map((c) => (
            <div
              key={c.title}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3 hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-dark m-0 mb-1">{c.title}</h3>
                <p className="text-sm text-gray-600 m-0">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title="FAQ — Cena strony w Rzeszowie"
        subtitle="Najczęściej zadawane pytania w 2026"
        level="h2"
        align="left"
      />

      <AnimateOnScroll>
        <div className="not-prose space-y-4 my-12">
          {[
            {
              q: 'Czy WordPress jest tańszy niż Next.js?',
              a: (
                <>
                  Tak, ale tylko na start. WordPress wykorzystuje gotowe motywy i wtyczki —
                  szybciej, taniej. Next.js wymaga developmentu od podstaw, ale w długim okresie
                  jest tańszy w utrzymaniu (mniej aktualizacji bezpieczeństwa, lepsza wydajność).
                  Wybór zależy od skali. Patrz:{' '}
                  <Link to="/web-development/rzeszow/" className="text-primary hover:underline">
                    tworzenie stron Rzeszów
                  </Link>
                  .
                </>
              ),
            },
            {
              q: 'Czy można zrobić stronę w 2 tygodnie?',
              a: 'Tak — landing page. Strona firmowa „na wczoraj" (2 tygodnie zamiast 6) zwykle oznacza dopłatę 30–50% i kompromisy contentowe. Najlepiej zaplanować 6–8 tygodni od briefa do startu.',
            },
            {
              q: 'Czy można dostać stronę za darmo z dofinansowaniem PARP / RPO?',
              a: 'Tak — programy dla MŚP z Podkarpacia (RPO Województwa Podkarpackiego, Bony na cyfryzację PARP) refundują 50–85% wartości projektu. Warto sprawdzić aktualną perspektywę finansową. Pomagamy z dokumentacją w ramach tych programów.',
            },
            {
              q: 'Czy konkurencja w Rzeszowie zauważy moją nową stronę?',
              a: (
                <>
                  Tylko jeśli zadbasz o widoczność w Google. Sama strona to dopiero początek —
                  kluczowe jest{' '}
                  <Link to="/marketing/seo/rzeszow/" className="text-primary hover:underline">
                    pozycjonowanie w Rzeszowie
                  </Link>{' '}
                  i kampanie Ads. Bez ruchu strona stoi i nie generuje przychodu.
                </>
              ),
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <HelpCircle size={18} />
                </div>
                <h3 className="font-bold text-lg text-dark m-0">{item.q}</h3>
              </div>
              <div className="text-gray-600 pl-11 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* Final CTA band — brand-defining dark pattern */}
      <AnimateOnScroll>
        <div className="not-prose relative bg-dark rounded-3xl p-8 md:p-12 text-white overflow-hidden my-16">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary rounded-full opacity-40 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-blue-100 text-xs font-black uppercase tracking-[0.2em] mb-6">
              <MapPin size={12} />
              <span>Rzeszów · Podkarpacie</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Porozmawiajmy o Twoim projekcie
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Bezpłatna konsultacja 45–60 minut — online, u Ciebie w siedzibie lub w neutralnej
              lokalizacji w centrum Rzeszowa. Bez zobowiązań, bez sztywnej oferty na siłę.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/offers#calculator"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-secondary rounded-full font-bold hover:bg-gray-100 transition-colors no-underline shadow-lg"
              >
                <Calculator size={18} />
                Kalkulator wyceny
              </Link>
              <Link
                to="/contact/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors no-underline"
              >
                Skontaktuj się
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title="Powiązane materiały"
        subtitle="Pogłęb temat — pokrewne podstrony i artykuły"
        level="h2"
        align="left"
      />

      <AnimateOnScroll>
        <div className="not-prose grid md:grid-cols-2 gap-4 my-12">
          {[
            {
              icon: MapPin,
              title: 'Pełna oferta lokalna w Rzeszowie',
              desc: 'Hub Mixture Marketing — pillar lokalny z FAQ, branżami, realizacjami',
              link: '/miasto/rzeszow/',
              color: 'from-blue-50 to-white',
              chip: 'bg-blue-100 text-blue-800',
            },
            {
              icon: Code2,
              title: 'Tworzenie stron Rzeszów',
              desc: 'Dedykowana podstrona web dev z cennikiem, procesem, FAQ',
              link: '/web-development/rzeszow/',
              color: 'from-emerald-50 to-white',
              chip: 'bg-emerald-100 text-emerald-700',
            },
            {
              icon: TrendingUp,
              title: 'Pozycjonowanie stron Rzeszów',
              desc: 'Lokalne SEO i ogólnopolskie — cennik widełkowy, case studies',
              link: '/marketing/seo/rzeszow/',
              color: 'from-violet-50 to-white',
              chip: 'bg-violet-100 text-violet-800',
            },
            {
              icon: Award,
              title: 'Core Web Vitals 2025',
              desc: 'Jak mierzyć i poprawiać wydajność strony pod Google Page Experience',
              link: '/baza-wiedzy/core-web-vitals-2025',
              color: 'from-orange-50 to-white',
              chip: 'bg-orange-100 text-orange-700',
            },
          ].map((r) => (
            <Link
              key={r.link}
              to={r.link}
              className={`bg-gradient-to-br ${r.color} p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group no-underline`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${r.chip} rounded-xl flex items-center justify-center shrink-0`}>
                  <r.icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-dark m-0 mb-1 flex items-center gap-2">
                    {r.title}
                    <ArrowRight
                      size={14}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                    />
                  </h3>
                  <p className="text-sm text-gray-600 m-0">{r.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AnimateOnScroll>
    </ArticleShell>
  );
};

export default IleKosztujeStronaRzeszowArticle;
