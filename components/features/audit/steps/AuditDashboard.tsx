/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuditResult } from '../../../../services/auditService';
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Download,
  RefreshCw,
  XCircle,
  Star,
  ShieldCheck,
  Zap,
  TrendingUp,
  BarChart3,
  FileCode,
  Image as ImageIcon,
  Gauge,
  MapPin,
  ListTodo,
  Search,
} from 'lucide-react';
import Button from '../../../common/Button';
import Accordion from '../../../common/Accordion';
import LazyHydrate from '../../../common/LazyHydrate';

interface AuditDashboardProps {
  data: AuditResult;
  email: string;
  onReset: () => void;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ data, email, onReset }) => {
  const [budget, setBudget] = useState(2500);
  const [isDownloading, setIsDownloading] = useState(false);

  const { client, competitor } = data;
  const score = client.total_score;
  const lcp = client.metrics.lcp_value;

  const delay = Math.max(0, lcp - 2.0);
  const conversionDropRate = 0.07;
  const lossPercentage = Math.min(delay * conversionDropRate, 0.5);
  const monthlyLoss = Math.round(budget * lossPercentage);

  const [expandedError, setExpandedError] = useState<string | null>(null);

  const toggleError = (key: string) => {
    setExpandedError(expandedError === key ? null : key);
  };

  const errorDetails: Record<
    string,
    {
      title: string;
      impact: string;
      desc: string;
      cta: string;
      offerLink: string;
      articleLink?: string;
      priority: 'red' | 'yellow' | 'blue';
      dataValue?: string;
    }
  > = {
    NO_CITY_KEYWORD: {
      title: 'Brak Miasta w Treści',
      impact: '📉 Klient Cię nie znajdzie',
      desc: 'Twoja firma działa w konkretnym mieście, ale nie ma o nim wzmianki w treści strony, nagłówku H1 ani tytule. Tracisz klientów wpisujących "usługa + miasto".',
      cta: 'Pozycjonowanie Lokalne',
      offerLink: '/marketing/seo',
      articleLink: '/marketing/seo',
      priority: 'yellow',
    },
    NO_PIXEL: {
      title: 'Ślepota Facebooka',
      impact: '📉 Tracisz powracających klientów',
      desc: 'Twoja strona nie wysyła danych do Facebooka. Remarketing jest niemożliwy. Każdy odwiedzający przepada bezpowrotnie.',
      cta: 'Wdróż Meta Pixel',
      offerLink: '/marketing/meta-ads',
      articleLink: '/baza-wiedzy/server-side-tracking-koniec-cookies',
      priority: 'red',
    },
    NO_ANALYTICS: {
      title: 'Brak Analityki',
      impact: '📉 Lecisz z zamkniętymi oczami',
      desc: 'Nie wiesz, skąd przychodzą klienci i na czym tracisz pieniądze. Konieczne wdrożenie GA4.',
      cta: 'Wdróż GA4',
      offerLink: '/marketing/analytics',
      priority: 'red',
    },
    SLOW_LCP: {
      title: 'Wolny Serwer (LCP)',
      impact: '📉 Klienci uciekają',
      desc: 'Klient czeka ponad 2.5 sekundy na treść. Według Google, każda sekunda opóźnienia to spadek konwersji o 7%. Tracisz budżet reklamowy na puste kliknięcia.',
      cta: 'Przyspiesz Stronę',
      offerLink: '/web-development/corporate',
      articleLink: '/baza-wiedzy/core-web-vitals-2025',
      priority: 'red',
      dataValue: `Twój wynik: ${lcp}s (Zalecane: <2.5s)`,
    },
    MED_LCP: {
      title: 'Można Szybciej',
      impact: '⚠️ Tracisz potencjał',
      desc: 'Jesteś w normie, ale konkurencja może być szybsza. Warto zoptymalizować zdjęcia i skrypty.',
      cta: 'Optymalizacja Szybkości',
      offerLink: '/web-development/corporate',
      articleLink: '/baza-wiedzy/core-web-vitals-2025',
      priority: 'yellow',
      dataValue: `Twój wynik: ${lcp}s (Zalecane: <2.5s)`,
    },
    NO_MOBILE: {
      title: 'Brak Wersji Mobile',
      impact: '📉 Ignorujesz 70% rynku',
      desc: 'Twoja strona nie skaluje się na telefonach. Ponad 70% ruchu z reklam to mobile - ci ludzie nic u Ciebie nie kupią.',
      cta: 'Nowa Strona RWD',
      offerLink: '/web-development/landing-page',
      articleLink: '/baza-wiedzy/audyt-ux-sklepu-internetowego',
      priority: 'red',
    },
    NO_SSL: {
      title: 'Strona Niezabezpieczona',
      impact: '📉 Brak zaufania',
      desc: 'Brak kłódki (SSL). Przeglądarki oznaczają Twoją stronę jako "Niebezpieczną", co drastycznie odstrasza klientów.',
      cta: 'Zabezpiecz Stronę',
      offerLink: '/web-development/custom-app',
      articleLink: '/baza-wiedzy/waf-bezpieczenstwo',
      priority: 'red',
    },
    GHOST_FIRM: {
      title: 'Firma Widmo',
      impact: '📉 Niska wiarygodność',
      desc: 'Masz mniej niż 5 opinii. Dla nowego klienta wyglądasz na firmę, która powstała wczoraj. Trudno zaufać takiej wizytówce.',
      cta: 'Strategia Reputacji',
      offerLink: '/kontakt',
      priority: 'red',
      dataValue: `Liczba opinii: ${client.reputation.reviews_count}`,
    },
    BAD_RATING: {
      title: 'Niska Ocena',
      impact: '📉 Klienci wybierają innych',
      desc: 'Twoja średnia to poniżej 4.2. Klienci wybierają konkurencję z lepszymi ocenami. To wymaga pilnej strategii naprawczej.',
      cta: 'Napraw Reputację',
      offerLink: '/kontakt',
      priority: 'red',
      dataValue: `Twoja ocena: ${client.reputation.rating}`,
    },
    NO_PHOTOS: {
      title: 'Pusta Wizytówka',
      impact: '📉 Mniej kliknięć',
      desc: 'Brak zdjęć w wizytówce Google. Klienci kupują oczami. Profile ze zdjęciami mają 2x więcej kliknięć.',
      cta: 'Uzupełnij wizytówkę',
      offerLink: '/kontakt',
      priority: 'yellow',
    },
    HIGH_CLS: {
      title: 'Skacząca Treść',
      impact: '📉 Irytacja użytkownika',
      desc: 'Elementy strony przesuwają się podczas ładowania. To irytuje użytkowników i obniża wynik Core Web Vitals.',
      cta: 'Napraw Stabilność',
      offerLink: '/web-development/corporate',
      articleLink: '/baza-wiedzy/core-web-vitals-2025',
      priority: 'yellow',
    },
    BIG_IMAGES: {
      title: 'Ciężkie Zdjęcia',
      impact: '📉 Wolne ładowanie',
      desc: 'Twoje grafiki nie są skompresowane lub używają starych formatów (JPG/PNG). Przejdź na WebP/AVIF, aby zyskać na szybkości.',
      cta: 'Zoptymalizuj Grafiki',
      offerLink: '/web-development/corporate',
      articleLink: '/baza-wiedzy/optymalizacja-obrazow-webp-avif',
      priority: 'yellow',
    },
    NO_GTM: {
      title: 'Brak Tag Managera',
      impact: '📉 Wyższe koszty zmian',
      desc: 'Kody wpięte na sztywno utrudniają zarządzanie marketingiem i generują koszty programistyczne.',
      cta: 'Wdrożenie GTM',
      offerLink: '/marketing/analytics',
      priority: 'yellow',
    },
    NO_DESC: {
      title: 'Brak Opisu SEO',
      impact: '📉 Słabsze SEO',
      desc: 'Google nie wie, jaki opis wyświetlić w wyszukiwarce. Tracisz darmowe kliknięcia z SEO organicznego.',
      cta: 'Audyt SEO',
      offerLink: '/kontakt',
      articleLink: '/marketing/seo',
      priority: 'blue',
    },
    OLD_JS: {
      title: 'Przestarzały Kod',
      impact: '📉 Ryzyko błędów',
      desc: 'Strona używa starych bibliotek JS. Może to powodować problemy na nowych telefonach i obniżać bezpieczeństwo.',
      cta: 'Modernizacja Strony',
      offerLink: '/web-development/custom-app',
      priority: 'blue',
    },
    NO_SOCIAL: {
      title: 'Brak Social Media',
      impact: '📉 Ograniczony zasięg',
      desc: 'Nie wykryliśmy linków do mediów społecznościowych. Tracisz szansę na budowanie społeczności i lojalności klientów.',
      cta: 'Strategia Social',
      offerLink: '/kontakt',
      priority: 'yellow',
    },
    BAD_A11Y: {
      title: 'Niedostępna Strona',
      impact: '📉 Wykluczenie użytkowników',
      desc: 'Twoja strona jest trudna w obsłudze dla osób niepełnosprawnych (np. czytniki ekranu). Wynik dostępności poniżej 70/100.',
      cta: 'Popraw dostępność',
      offerLink: '/web-development/corporate',
      priority: 'red',
    },
    NO_OG: {
      title: 'Brzydkie Linki',
      impact: '📉 Mniej kliknięć z Facebooka',
      desc: 'Brak tagów Open Graph. Gdy ktoś udostępni Twoją stronę na Facebooku/LinkedIn, pojawi się brzydki, pusty link bez zdjęcia i opisu.',
      cta: 'Wdróż Open Graph',
      offerLink: '/web-development/corporate',
      priority: 'yellow',
    },
    NO_SCHEMA: {
      title: 'Brak Danych Strukturalnych',
      impact: '📉 Gorsza widoczność w Google',
      desc: 'Google nie rozumie kontekstu Twojej strony (nie wie, że to Firma Lokalna, Produkt czy Artykuł). Tracisz szansę na rozszerzone wyniki wyszukiwania (gwiazdki, ceny w Google).',
      cta: 'Wdróż Schema.org',
      offerLink: '/kontakt',
      articleLink: '/marketing/seo',
      priority: 'blue',
    },
    NO_FAVICON: {
      title: 'Brak Ikony (Favicon)',
      impact: '📉 Brak profesjonalizmu',
      desc: 'W pasku przeglądarki brakuje logo Twojej firmy. To drobiazg, który buduje zaufanie i rozpoznawalność marki.',
      cta: 'Dodaj Favicon',
      offerLink: '/design/branding',
      priority: 'blue',
    },
    NO_ALTS: {
      title: 'Ślepe Obrazki (Brak ALT)',
      impact: '📉 Gorsze SEO i Dostępność',
      desc: 'Wiele Twoich zdjęć nie ma opisu alternatywnego. Google nie wie, co na nich jest, a osoby niewidome nie mogą ich "zobaczyć".',
      cta: 'Uzupełnij atrybuty ALT',
      offerLink: '/web-development/corporate',
      articleLink: '/marketing/seo',
      priority: 'yellow',
    },
    BAD_H1: {
      title: 'Chaotyczne Nagłówki',
      impact: '📉 Google gubi wątek',
      desc: 'Na stronie powinien być dokładnie jeden nagłówek główny (H1). U Ciebie jest ich 0 lub więcej niż 1. To osłabia pozycjonowanie.',
      cta: 'Napraw Strukturę',
      offerLink: '/marketing/seo',
      priority: 'red',
    },
    THIN_CONTENT: {
      title: 'Zbyt Mało Treści',
      impact: '📉 Strona uznana za pustą',
      desc: 'Wykryliśmy mniej niż 200 słów treści. Google może uznać Twoją stronę za mało wartościową (tzw. Thin Content) i pominąć ją w wynikach.',
      cta: 'Rozbuduj Treści',
      offerLink: '/marketing/seo',
      articleLink: '/marketing/seo',
      priority: 'yellow',
    },
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-500 border-green-500 bg-green-50';
    if (s >= 50) return 'text-yellow-500 border-yellow-500 bg-yellow-50';
    return 'text-red-500 border-red-500 bg-red-50';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Stan Wzorowy - Świetna robota!';
    if (s >= 50) return 'Stan Ostrzegawczy - Tracisz potencjał.';
    return 'Stan Krytyczny - Wymaga natychmiastowej naprawy.';
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/audit/generate_pdf.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, email }),
      });
      if (res.ok) {
        alert(
          'Twój brief trafił do zespołu Mixture Marketing. Pełny raport PDF zostanie wysłany na Twój e-mail w ciągu kilku minut!',
        );
      }
    } catch (e) {
      alert('Wystąpił błąd podczas generowania raportu.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 w-full font-sans"
    >
      <div className="bg-dark text-white p-6 md:p-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold italic">
            Czy Twoja strona zarabia, czy tylko istnieje?
          </h2>
          <p className="text-blue-200 text-sm">Analiza dla: {client.url}</p>
        </div>
        <button
          onClick={onReset}
          className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* LEWA KOLUMNA (Sticky Sidebar) */}
        <div className="lg:col-span-3 bg-[#F9FAFB] p-8 border-r border-gray-100 flex flex-col items-center text-center lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto custom-scrollbar">
          <div className="lg:min-h-min flex flex-col items-center justify-center h-full">
            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xxs mb-8">
              Indeks Zdrowia Witryny
            </h3>

            <div className="relative mb-10 group">
              {/* Outer Glow */}
              <div
                className={`absolute inset-0 blur-3xl opacity-20 transition-all duration-1000 group-hover:opacity-40 ${
                  score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                }`}
              ></div>

              <div
                className={`relative w-56 h-56 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 transform group-hover:scale-105 ${
                  score >= 80
                    ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 shadow-green-200'
                    : score >= 50
                      ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-orange-200'
                      : 'bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 shadow-red-200'
                }`}
              >
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                    className={`text-7xl font-black tracking-tighter leading-none ${
                      score >= 80
                        ? 'text-emerald-600'
                        : score >= 50
                          ? 'text-orange-500'
                          : 'text-red-600'
                    }`}
                  >
                    {score}
                  </motion.span>
                  <span className="text-xs text-gray-400 font-black uppercase mt-1 tracking-widest">
                    PKT / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 w-full max-w-[280px]">
              <p className="font-bold text-dark text-lg mb-2 leading-tight">
                {getScoreLabel(score)}
              </p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                />
              </div>
            </div>

            {client.screenshot ? (
              <div className="relative w-[240px] h-[480px] bg-gray-900 rounded-[3rem] border-[10px] border-gray-900 shadow-2xl overflow-hidden group transform hover:-rotate-2 transition-all duration-700">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
                <img
                  src={client.screenshot}
                  alt="Mobile Screenshot"
                  className="w-full h-full object-cover opacity-95 transition-all duration-700 group-hover:scale-110 bg-white"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent pointer-events-none z-10"></div>
              </div>
            ) : (
              <div className="w-[220px] h-[440px] bg-gray-100 rounded-[3rem] flex items-center justify-center border-8 border-gray-200">
                <div className="text-center p-6">
                  <RefreshCw className="animate-spin mx-auto text-gray-400 mb-4" size={32} />
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Renderowanie...
                  </span>
                </div>
              </div>
            )}
            <p className="mt-8 text-xxs text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Mobile Preview
            </p>
          </div>
        </div>

        {/* PRAWA KOLUMNA */}
        <div className="lg:col-span-9 p-6 md:p-12 space-y-12 bg-white">
          {/* MODUŁ A: SZYBKOŚĆ I FINANSE */}
          <div className="rounded-[2.5rem] p-10 relative overflow-hidden bg-dark text-white shadow-3xl group transition-all duration-700">
            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,#3F3D91_0%,transparent_50%)]"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xxs font-black uppercase tracking-widest mb-6 border border-white/5">
                  <DollarSign size={12} className="text-emerald-400" /> Kalkulator Strat Biznesowych
                </div>
                <h2 className="text-4xl font-black mb-8 leading-[1.1]">
                  Twoje błędy mają <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300">
                    konkretną cenę.
                  </span>
                </h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">
                      Budżet Marketingowy
                    </span>
                    <span className="text-3xl font-black text-white leading-none tracking-tighter">
                      {budget.toLocaleString()} <span className="text-lg text-blue-300">PLN</span>
                    </span>
                  </div>
                  <div className="relative pt-4 pb-2">
                    <input
                      type="range"
                      min="500"
                      max="50000"
                      step="500"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                      className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all"
                    />
                    <div
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full pointer-events-none"
                      style={{ width: `${(budget / 50000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xxs font-black text-blue-300/40 uppercase tracking-widest">
                    <span>min. 500 PLN</span>
                    <span>max. 50 000 PLN</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group/box">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent"></div>

                <div className="text-center relative z-10">
                  <p className="text-xs font-black text-blue-200 uppercase tracking-[0.2em] mb-4">
                    Strata przychodów / msc
                  </p>
                  <div className="text-6xl font-black text-white mb-4 tracking-tighter flex items-center justify-center">
                    {monthlyLoss > 0 ? (
                      <motion.span
                        key={monthlyLoss}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-rose-400 mr-2"
                      >
                        -
                      </motion.span>
                    ) : null}
                    {monthlyLoss.toLocaleString()}
                    <span className="text-2xl text-blue-300 ml-3">PLN</span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                      delay > 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {delay > 0 ? (
                      <>
                        <AlertCircle size={16} /> Opóźnienie: {delay.toFixed(1)}s
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Optymalna szybkość
                      </>
                    )}
                  </div>

                  <p className="text-xxs text-blue-300/40 mt-6 font-medium italic leading-relaxed">
                    * Wyliczenia oparte na badaniach Google & Amazon: <br />
                    Każde 100ms opóźnienia to średnio 1% spadku konwersji.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SZCZEGÓŁY MODUŁÓW */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* 1. SZYBKOŚĆ */}
            <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-100 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <span
                    className={`text-xs font-black px-4 py-2 rounded-xl border-2 ${
                      lcp < 2.5
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}
                  >
                    LCP: {typeof lcp === 'number' ? lcp.toFixed(2) : lcp}s
                  </span>
                </div>
                <h4 className="text-xl font-black text-dark mb-3">Wydajność</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {lcp > 4.5
                    ? 'Klienci uciekają, zanim zobaczą ofertę. Twój serwer to hamulec ręczny Twojego biznesu.'
                    : lcp > 2.5
                      ? 'Wymaga poprawy. Konkurencja może Cię wyprzedzić w wyścigu o uwagę klienta.'
                      : 'Prędkość światła! Twoja strona działa błyskawicznie na urządzeniach mobilnych.'}
                </p>
              </div>
            </div>

            {/* 2. REPUTACJA */}
            <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-100 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <Star size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-dark leading-none">
                      {client.reputation.rating > 0 ? client.reputation.rating : '0.0'}
                    </span>
                    <span className="text-xxs text-gray-400 font-bold uppercase tracking-widest mt-1">
                      Ocena Google
                    </span>
                  </div>
                </div>
                <h4 className="text-xl font-black text-dark mb-3">Reputacja</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {client.reputation.reviews_count < 5
                    ? 'Brak dowodu społecznego. Klienci boją się zaufać firmie bez opinii.'
                    : client.reputation.reviews_count < 20
                      ? 'Solidna podstawa, ale brakuje Ci skali, aby zostać niekwestionowanym liderem rynku.'
                      : 'Lider Zaufania. Masz potężną przewagę, którą należy przekuć w większą sprzedaż.'}
                </p>
              </div>
            </div>

            {/* 2b. LOCAL SEO (NEW) */}
            <div className="group p-8 bg-white rounded-3xl border border-blue-50 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <MapPin size={24} />
                  </div>
                  {client.seo.local?.city && (
                    <span className="text-xxs font-black uppercase bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-sm">
                      {client.seo.local.city}
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-black text-dark mb-4">Lokalne SEO</h4>
                {client.seo.local?.city ? (
                  <ul className="space-y-2.5">
                    {[
                      { l: 'W Tytule', v: client.seo.local.in_title },
                      { l: 'W Nagłówku H1', v: client.seo.local.in_h1 },
                      { l: 'W Treści', v: client.seo.local.in_content },
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50"
                      >
                        <span className="text-xxs font-black text-gray-400 uppercase tracking-wider">
                          {item.l}
                        </span>
                        {item.v ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-rose-400" />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic leading-relaxed">
                    Nie wykryto miasta. Upewnij się, że Twoja wizytówka Google jest poprawnie
                    połączona.
                  </p>
                )}
              </div>
            </div>

            {/* 3. MARKETING */}
            <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <h4 className="text-xl font-black text-dark mb-4">Analityka</h4>
                <ul className="space-y-2.5">
                  <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-xxs font-black text-gray-400 uppercase tracking-wider">
                      Google Analytics 4
                    </span>
                    {client.tech.analytics ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="text-rose-400" />
                    )}
                  </li>
                  <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-xxs font-black text-gray-400 uppercase tracking-wider">
                      Meta Pixel
                    </span>
                    {client.tech.pixel ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="text-rose-400" />
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* 3b. TECHNOLOGIA & SOCIAL (NEW) */}
            <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-100 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                <h4 className="text-xl font-black text-dark mb-4">Technologia</h4>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {client.tech.cms?.map((c, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded-md"
                      >
                        {c}
                      </span>
                    ))}
                    {client.tech.ssl && (
                      <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                        SSL OK
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-50 rounded-xl border border-gray-100/50 text-center">
                      <div className="text-xxxs text-gray-400 font-black uppercase tracking-widest mb-1">
                        Dostępność
                      </div>
                      <div className="text-sm font-black text-dark">
                        {client.metrics.scores?.accessibility
                          ? `${Math.round(client.metrics.scores.accessibility)}/100`
                          : 'Brak danych'}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-xl border border-gray-100/50 text-center">
                      <div className="text-xxxs text-gray-400 font-black uppercase tracking-widest mb-1">
                        Social Media
                      </div>
                      <div className="text-sm font-black text-dark">
                        {Object.values(client.social || {}).filter(Boolean).length} linki
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. KONKURENCJA */}
            {competitor ? (
              <div className="group p-8 bg-dark text-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                    <BarChart3 className="text-blue-300" size={24} /> Wynik vs Konkurencja
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xxs font-black uppercase tracking-widest text-blue-200">
                          Twoja Strona
                        </span>
                        <span className="text-lg font-black">{score}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xxs font-black uppercase tracking-widest text-blue-200 truncate max-w-[150px]">
                          {competitor.url.replace('https://', '')}
                        </span>
                        <span className="text-lg font-black">
                          {Math.round(competitor.psi_score)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${competitor.psi_score}%` }}
                          className="h-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center text-center text-gray-400 text-sm italic group">
                <div className="group-hover:scale-105 transition-transform">
                  <Search className="mx-auto mb-2 opacity-20" size={32} />
                  Brak konkurenta do analizy porównawczej.
                </div>
              </div>
            )}

            {/* 5. CONTENT DNA (STATS WIDGETS) */}
            <div className="col-span-1 md:col-span-2 xl:col-span-3">
              <LazyHydrate minHeight="300px">
                <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner group transition-all duration-500">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <BarChart3 size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-dark">
                      Content DNA{' '}
                      <span className="text-gray-400 font-medium text-lg leading-none">
                        / Analiza Treści
                      </span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      {
                        label: 'Objętość Treści',
                        val: client.content.word_count,
                        unit: 'Słów',
                        sub: 'Zalecane: >600',
                        color: client.content.word_count < 300 ? 'rose' : 'emerald',
                      },
                      {
                        label: 'Struktura H1',
                        val: client.content.h1_count,
                        unit: 'Nagłówek',
                        sub: 'Zalecane: 1',
                        color: client.content.h1_count !== 1 ? 'rose' : 'emerald',
                      },
                      {
                        label: 'Multimedia',
                        val: client.content.images_count,
                        unit: 'Grafik',
                        sub: 'Wizualny przekaz',
                        color: 'blue',
                      },
                      {
                        label: 'Dostępność (ALT)',
                        val: client.content.images_no_alt,
                        unit: 'Brak opisu',
                        sub: 'Błędy SEO',
                        color: client.content.images_no_alt > 0 ? 'rose' : 'emerald',
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:scale-105 transition-transform group/card"
                      >
                        <div className="text-xxs text-gray-400 font-black uppercase tracking-[0.2em] mb-3 group-hover/card:text-secondary transition-colors">
                          {stat.label}
                        </div>
                        <div
                          className={`text-4xl font-black mb-1 tracking-tighter ${stat.color === 'rose' ? 'text-rose-500' : stat.color === 'emerald' ? 'text-emerald-500' : 'text-blue-500'}`}
                        >
                          {stat.val}{' '}
                          <span className="text-lg text-gray-300 font-bold">{stat.unit}</span>
                        </div>
                        <div className="text-xxs text-gray-400 font-bold italic">{stat.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </LazyHydrate>
            </div>
          </div>

          {/* LISTA BŁĘDÓW (ACCORDION) */}
          <LazyHydrate minHeight="400px">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-dark uppercase tracking-tight flex items-center gap-2">
                <AlertCircle className="text-red-500" /> Wykryte błędy (
                {Object.keys(client.audit_results).length})
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {Object.entries(client.audit_results).map(([key, active]) => {
                  if (!active || !errorDetails[key]) return null;
                  const error = errorDetails[key];
                  const isExpanded = expandedError === key;
                  const priorityColor =
                    error.priority === 'red'
                      ? 'red'
                      : error.priority === 'yellow'
                        ? 'yellow'
                        : 'blue';
                  const PriorityIcon =
                    error.priority === 'red'
                      ? XCircle
                      : error.priority === 'yellow'
                        ? AlertCircle
                        : Zap;

                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? 'bg-white shadow-lg border-gray-200'
                          : `bg-${priorityColor}-50 border-${priorityColor}-100 hover:bg-white hover:shadow-md cursor-pointer`
                      }`}
                    >
                      {/* Header (Always Visible) */}
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleError(key)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`mt-1 p-2 rounded-full ${
                              error.priority === 'red'
                                ? 'bg-red-100 text-red-600'
                                : error.priority === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            <PriorityIcon size={20} />
                          </div>
                          <div>
                            <div
                              className={`font-bold text-sm uppercase tracking-tight ${
                                error.priority === 'red'
                                  ? 'text-red-900'
                                  : error.priority === 'yellow'
                                    ? 'text-yellow-900'
                                    : 'text-blue-900'
                              }`}
                            >
                              {error.title}
                            </div>
                            <div className="text-xs font-semibold text-gray-500 mt-0.5">
                              {error.impact}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 7.5L10 12.5L15 7.5"
                              stroke="#9CA3AF"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Content (Expandable) */}
                      <div
                        className={`px-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="pt-2 pl-[52px] pr-4">
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">{error.desc}</p>

                          {error.dataValue && (
                            <div className="bg-gray-50 px-3 py-2 rounded-lg inline-block text-xs font-mono text-gray-500 mb-4 border border-gray-100">
                              🖥️ {error.dataValue}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 justify-start">
                            <a href={error.offerLink} target="_blank" rel="noopener noreferrer">
                              <Button variant="primary" size="sm" className="text-xs font-bold">
                                {error.cta} ➔
                              </Button>
                            </a>

                            {error.articleLink && (
                              <a
                                href={error.articleLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 text-xs font-bold text-gray-500 hover:text-secondary border border-transparent hover:border-gray-200 rounded-lg transition-all"
                              >
                                Dowiedz się więcej 📖
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </LazyHydrate>

          {/* ACTION PLAN (PLAN NAPRAWCZY) */}
          <LazyHydrate minHeight="400px">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg mt-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
              <h3 className="text-xl font-black text-dark mb-6 flex items-center gap-2">
                <ListTodo size={24} className="text-secondary" /> Twój Plan Naprawczy
              </h3>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* PRIORITY: CRITICAL */}
                {Object.entries(client.audit_results).filter(
                  ([k, v]) => v && errorDetails[k]?.priority === 'red',
                ).length > 0 && (
                  <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 h-full">
                    <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertCircle size={16} /> Priorytet: Krytyczny (Zrób to teraz)
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(client.audit_results)
                        .filter(([k, v]) => v && errorDetails[k]?.priority === 'red')
                        .map(([k]) => (
                          <div
                            key={k}
                            className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-red-50"
                          >
                            <div className="mt-1 min-w-[20px]">
                              <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-800 font-bold text-sm block">
                                {errorDetails[k]?.title}
                              </span>
                              <span className="text-gray-500 text-xs font-medium">
                                Działanie: {errorDetails[k]?.cta}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* PRIORITY: IMPORTANT */}
                {Object.entries(client.audit_results).filter(
                  ([k, v]) => v && errorDetails[k]?.priority === 'yellow',
                ).length > 0 && (
                  <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-100 h-full">
                    <h4 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap size={16} /> Priorytet: Wysoki (Zaplanuj w tym tygodniu)
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(client.audit_results)
                        .filter(([k, v]) => v && errorDetails[k]?.priority === 'yellow')
                        .map(([k]) => (
                          <div
                            key={k}
                            className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-yellow-50"
                          >
                            <div className="mt-1 min-w-[20px]">
                              <div className="w-5 h-5 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-800 font-bold text-sm block">
                                {errorDetails[k]?.title}
                              </span>
                              <span className="text-gray-500 text-xs font-medium">
                                Działanie: {errorDetails[k]?.cta}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm mb-4">Nie masz czasu na samodzielne naprawy?</p>
                <a
                  href="/kontakt"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-secondary font-bold hover:underline"
                >
                  Skorzystaj z pomocy ekspertów Mixture Marketing ➔
                </a>
              </div>
            </div>
          </LazyHydrate>

          {/* SZCZEGÓŁY TECHNICZNE (Dla Developerów) */}
          <LazyHydrate minHeight="400px">
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-black text-dark uppercase tracking-tight flex items-center gap-2">
                <FileCode className="text-gray-500" /> Szczegóły Techniczne (Raport V2)
              </h3>

              {/* 1. Struktura Nagłówków */}
              {client.content.details?.headings && client.content.details.headings.length > 0 && (
                <Accordion
                  title={`Struktura Treści (${client.content.details.headings.length} nagłówków)`}
                >
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar text-sm font-mono bg-gray-50 p-4 rounded-xl">
                    {client.content.details.headings.map((h, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 ${h.tag === 'h1' ? 'font-bold text-dark' : 'text-gray-600'}`}
                      >
                        <span className="uppercase w-8 shrink-0 text-gray-400 select-none">
                          {h.tag}
                        </span>
                        <span className="truncate" title={h.text}>
                          {h.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* 2. Brakujące ALT */}
              {client.content.details?.images_missing_alt &&
                client.content.details.images_missing_alt.length > 0 && (
                  <Accordion
                    title={`Obrazy bez opisu ALT (${client.content.details.images_missing_alt.length} przykładów)`}
                  >
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar text-sm bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2 italic">
                        Oto lista plików graficznych, które nie są widoczne dla Google (brak
                        atrybutu alt):
                      </p>
                      {client.content.details.images_missing_alt.map((src, i) => (
                        <div
                          key={i}
                          className="flex gap-2 items-center text-red-500 bg-white border border-red-100 p-2 rounded shadow-sm"
                        >
                          <ImageIcon size={14} className="shrink-0" />
                          <span className="truncate font-mono text-xs" title={src}>
                            {src}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

              {/* 3. Lighthouse Opportunities */}
              {client.metrics.opportunities && client.metrics.opportunities.length > 0 && (
                <Accordion title={`Top 5 Możliwości Przyspieszenia`}>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                    {client.metrics.opportunities.map((op) => (
                      <div
                        key={op.id}
                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Gauge size={16} className="text-yellow-600" />
                          <span className="font-bold text-gray-700 text-sm">{op.title}</span>
                        </div>
                        <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full whitespace-nowrap">
                          Oszczędź {Math.round(op.savings)}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}
            </div>
          </LazyHydrate>

          {/* QUICK WINS */}
          <div className="bg-[#E8F5E9] p-8 rounded-3xl border border-green-200 shadow-inner mt-8">
            <h3 className="font-black text-[#1B5E20] mb-6 flex items-center gap-3 text-lg">
              🎁 Co możesz zrobić dzisiaj (za darmo)?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-200 rounded-xl flex shrink-0 items-center justify-center text-green-800 font-black shadow-sm">
                  1
                </div>
                <p className="text-sm text-green-900 leading-relaxed italic">
                  <strong>Odchudź zdjęcia:</strong> Twoja strona jest za ciężka. Użyj{' '}
                  <u>TinyPNG.com</u>, aby zmniejszyć grafikę i zyskać 1s szybkości.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-200 rounded-xl flex shrink-0 items-center justify-center text-green-800 font-black shadow-sm">
                  2
                </div>
                <p className="text-sm text-green-900 leading-relaxed italic">
                  <strong>Odpisz na opinie:</strong> Masz opinie bez odpowiedzi. Google promuje
                  aktywne firmy. Odpisz im proste "Dziękujemy!".
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-6 bg-white border-t border-gray-100 mt-12">
            <Button
              variant="primary"
              size="lg"
              icon={
                isDownloading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Download size={20} />
                )
              }
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="h-16 px-12 text-xl font-black shadow-2xl shadow-secondary/30 hover:scale-105 transition-transform hover:shadow-secondary/50"
            >
              {isDownloading ? 'Generowanie...' : 'Odbierz Pełny Raport dla Zarządu'}
            </Button>
            <p className="text-xs text-gray-400 mt-6 font-bold uppercase tracking-widest">
              Wysyłamy raport techniczny z instrukcją krok-po-kroku
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditDashboard;
