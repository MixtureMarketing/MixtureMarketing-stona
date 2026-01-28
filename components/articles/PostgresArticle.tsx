/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Lock,
  Coins,
  Undo2,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Zap,
  Globe,
  MapPin,
  TrendingUp,
  FileCode,
  Terminal,
  ChevronDown,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { PostgresHeroVisual, AcidSimulator, TcoCostChart } from './visuals/PostgresVisuals';

const PostgresArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'postgresql-krol-baz-danych');
  const [showCode, setShowCode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll progress
  React.useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#336791]/20 font-sans">
      <Seo
        title={
          articleData?.title ||
          'PostgreSQL: Król Baz Danych. Dlaczego giganci porzucają płatne rozwiązania?'
        }
        description={
          articleData?.description ||
          'Poznaj zalety najpotężniejszej bazy Open Source. Dowiedz się, jak zaoszczędzić na licencjach i zyskać wydajność klasy Enterprise.'
        }
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-dark via-[#336791] to-dark shadow-[0_0_10px_rgba(51,103,145,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Database size={12} />
              <span>Baza Wiedzy: Backend & Data</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              PostgreSQL: Król <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark via-[#336791] to-dark">
                Baz Danych.
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              Twoje dane zasługują na bankowy poziom bezpieczeństwa. Bez bankowych opłat. Dowiedz
              się, dlaczego NASA i Apple wybierają Open Source.
            </p>
          </header>

          {/* DATA VAULT HERO VISUAL */}
          <div className="mb-20">
            <PostgresHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#336791] hover:prose-a:text-dark prose-strong:text-dark prose-li:text-gray-700">
            <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
              <Database className="text-secondary mt-1 shrink-0" size={20} />
              <div>
                <p className="text-sm text-secondary m-0 font-medium">
                  Ten artykuł jest częścią serii <strong>Architektura Danych</strong>.
                </p>
                <a
                  href="/baza-wiedzy/bazy-danych-kompendium-architekta"
                  className="text-sm text-[#336791] hover:text-dark font-bold mt-1 inline-flex items-center gap-1"
                >
                  Zobacz pełne porównanie: PostgreSQL vs MongoDB vs Redis vs Elasticsearch{' '}
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <AnimateOnScroll>
              <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-[#336791] pl-6 py-2 bg-blue-50/30 rounded-r-xl">
                Dane to "ropa naftowa" XXI wieku. Ale ropa potrzebuje solidnego zbiornika. Jeśli
                wybierzesz źle, czeka Cię wyciek, niespójność danych lub... bankructwo przez koszty
                licencji.
              </p>
              <p>
                Dziś <strong>PostgreSQL</strong> (często nazywany po prostu Postgres) jest
                standardem dla Apple, Instagrama, Spotify i NASA. W tym artykule wyjaśnimy, dlaczego
                ta darmowa baza danych jest fundamentem nowoczesnego biznesu.
              </p>
            </AnimateOnScroll>

            {/* WHAT IS POSTGRES */}
            <div className="my-24">
              <SectionHeader
                title="Co to jest PostgreSQL? (Więcej niż SQL)"
                subtitle="Definicja"
                align="left"
              />
              <p>
                PostgreSQL to obiektowo-relacyjny system zarządzania bazą danych (ORDBMS). Brzmi
                skomplikowanie? Uprośćmy to do dwóch kluczowych funkcji:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 text-[#336791] rounded-xl flex items-center justify-center mb-6">
                    <BarChart3 size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-dark mb-2">Relacyjny (SQL)</h4>
                  <p className="text-sm text-gray-600">
                    Idealny do tabel, faktur i użytkowników. Porządek jak w Excelu, tylko miliard
                    razy szybszy.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-50 text-[#059669] rounded-xl flex items-center justify-center mb-6">
                    <Zap size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-dark mb-2">Obiektowy / NoSQL</h4>
                  <p className="text-sm text-gray-600">
                    Idealny do elastycznych danych JSON i złożonych struktur. Elastyczność znana z
                    MongoDB.
                  </p>
                </div>
              </div>
            </div>

            {/* ARGUMENT 1: COSTS */}
            <div className="my-24">
              <SectionHeader
                title="Argument nr 1: Koszty (Oracle vs Postgres)"
                subtitle="Efektywność Finansowa"
                align="left"
              />
              <p>
                Wiele korporacyjnych baz danych operuje na modelu licencyjnym "per core" (płacisz za
                każdy rdzeń procesora). PostgreSQL jest w{' '}
                <strong>100% darmowy (Open Source)</strong>. Koszt licencji wynosi zawsze 0 PLN.
              </p>

              <div className="not-prose">
                <TcoCostChart />
              </div>
            </div>

            {/* ARGUMENT 2: RELIABILITY (ACID) */}
            <div className="my-24">
              <SectionHeader
                title="Argument nr 2: Niezawodność (ACID)"
                subtitle="Bezpieczeństwo Transakcji"
                align="left"
              />
              <p>
                W świecie baz danych istnieje termin <strong>ACID</strong>. Oznacza on, że każda
                operacja finansowa lub zmiana danych albo uda się w całości, albo w ogóle nie
                zostanie zapisana. Nie ma stanów pośrednich (błędnych).
              </p>

              <div className="not-prose">
                <AcidSimulator />
              </div>
            </div>

            {/* COMPARISON TABLE */}
            <div className="my-24">
              <SectionHeader
                title="Wielka Bitwa: PostgreSQL vs Reszta Świata"
                subtitle="Porównanie Techniczne"
                align="left"
              />
              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg mt-8 not-prose">
                <table className="w-full text-left bg-white">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-black uppercase text-gray-500">Cecha</th>
                      <th className="p-4 text-xs font-black uppercase text-[#336791]">
                        PostgreSQL
                      </th>
                      <th className="p-4 text-xs font-black uppercase text-gray-500">MySQL</th>
                      <th className="p-4 text-xs font-black uppercase text-gray-500">MongoDB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    <tr>
                      <td className="p-4 font-bold">Zastosowanie</td>
                      <td className="p-4 text-[#336791] font-bold">Złożone systemy B2B</td>
                      <td className="p-4">Proste strony WWW</td>
                      <td className="p-4">Dane niestrukturalne</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold">Złożone zapytania</td>
                      <td className="p-4 text-emerald-600 font-bold">Król (Wydajny JOIN)</td>
                      <td className="p-4">Dobre, ale słabnie</td>
                      <td className="p-4 text-red-500">Słabe (Brak relacji)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold">Obsługa JSON</td>
                      <td className="p-4 text-emerald-600 font-bold">Doskonała (JSONB)</td>
                      <td className="p-4 text-orange-500">Podstawowa</td>
                      <td className="p-4">Natywna</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold">Dane GIS (Mapy)</td>
                      <td className="p-4 text-emerald-600 font-bold">Najlepszy (PostGIS)</td>
                      <td className="p-4 text-orange-500">Podstawowa</td>
                      <td className="p-4 text-orange-500">Podstawowa</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* KILLER FEATURE: JSONB */}
            <div className="my-24 bg-[#0B1120] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden not-prose">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#336791] rounded-full blur-[100px] opacity-10"></div>
              <div className="relative z-10">
                <SectionHeader
                  title="Killer Feature: JSONB"
                  subtitle="NoSQL wewnątrz SQL"
                  lightMode
                  align="left"
                />
                <p className="text-gray-400 mb-8 max-w-2xl">
                  To funkcja, która zmienia zasady gry. Możesz przeszukiwać miliony dokumentów JSON
                  z prędkością bazy SQL, bez utrzymywania osobnej bazy NoSQL.
                </p>

                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all border border-white/10 mb-6"
                >
                  <Terminal size={18} className="text-primary" />
                  <span className="font-bold text-sm">
                    {showCode ? 'Ukryj zapytanie' : 'Zobacz zapytanie JSONB'}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${showCode ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  className={`transition-all duration-500 overflow-hidden ${showCode ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="bg-black/40 rounded-xl p-6 font-mono text-xxs md:text-xs text-[#A6ACCD] border border-white/5">
                    <pre className="overflow-x-auto text-blue-300">
                      <code>{`-- Tak, to jest SQL!
-- Znajdź użytkowników z newsletterem w polu JSON
SELECT * FROM users
WHERE settings @> '{"newsletter": true}';

-- Czas zapytania na 1 mln rekordów: 0.04ms`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* CLOUD NATIVE & LOCK-IN */}
            <div className="my-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <SectionHeader
                    title="Brak Vendor Lock-in"
                    subtitle="Wolność wyboru"
                    align="left"
                  />
                  <p className="text-sm leading-relaxed">
                    Jeśli pokłócisz się ze swoim dostawcą chmury (AWS/Google), możesz przenieść bazę
                    Postgres na własny serwer bez zmieniania ani jednej linijki kodu aplikacji. W
                    przypadku baz komercyjnych jesteś "uwiązany" do jednego dostawcy.
                  </p>
                </div>
                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex flex-wrap justify-center gap-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                    className="h-6"
                    alt="AWS"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg"
                    className="h-6"
                    alt="Google Cloud"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg"
                    className="h-6"
                    alt="Azure"
                  />
                </div>
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#336791] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">
                      Przestań płacić za licencje. Zacznij inwestować w produkt.
                    </h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      Pomożemy Ci zmigrować Twoje dane z drogich, komercyjnych rozwiązań do
                      wydajnego PostgreSQL. Zróbmy analizę oszczędności dla Twojego biznesu.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="white"
                        size="lg"
                        className="shadow-xl text-dark hover:bg-gray-100"
                        onClick={() => (window.location.href = '/web-development/custom-app')}
                      >
                        Oblicz oszczędności z migracji
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                        size="lg"
                        onClick={() => (window.location.href = '/baza-wiedzy')}
                      >
                        Wróć do Bazy Wiedzy
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <RelatedArticles currentArticleId="postgresql-krol-baz-danych" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

export default PostgresArticle;
