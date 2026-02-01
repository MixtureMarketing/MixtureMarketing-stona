import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  Zap,
  Terminal,
  ChevronDown,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';
import ArticleComparisonTable from './shared/ArticleComparisonTable';
import { PostgresHeroVisual, TcoCostChart, AcidSimulator } from './visuals/PostgresVisuals';

const PostgresArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'postgresql-krol-baz-danych');
  const [showCode, setShowCode] = useState(false);

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description="Twoje dane zasługują na bankowy poziom bezpieczeństwa. Bez bankowych opłat. Dowiedz się, dlaczego NASA i Apple wybierają Open Source."
      category="tech"
      categoryLabel="Baza Wiedzy: Backend & Data"
      image={articleData.image}
      icon={Database}
      accentColor="#336791"
      heroVisual={<PostgresHeroVisual />}
      slug="/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu"
    >
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
          Dziś <strong>PostgreSQL</strong> (często nazywany po prostu Postgres) jest standardem dla
          Apple, Instagrama, Spotify i NASA. W tym artykule wyjaśnimy, dlaczego ta darmowa baza
          danych jest fundamentem nowoczesnego biznesu.
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
              Idealny do tabel, faktur i użytkowników. Porządek jak w Excelu, tylko miliard razy
              szybszy.
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
          Wiele korporacyjnych baz danych operuje na modelu licencyjnym "per core" (płacisz za każdy
          rdzeń procesora). PostgreSQL jest w <strong>100% darmowy (Open Source)</strong>. Koszt
          licencji wynosi zawsze 0 PLN.
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
          W świecie baz danych istnieje termin <strong>ACID</strong>. Oznacza on, że każda operacja
          finansowa lub zmiana danych albo uda się w całości, albo w ogóle nie zostanie zapisana.
          Nie ma stanów pośrednich (błędnych).
        </p>

        <div className="not-prose">
          <AcidSimulator />
        </div>
      </div>

      <ArticleComparisonTable
        title="Wielka Bitwa: PostgreSQL vs Reszta Świata"
        subtitle="Porównanie Techniczne"
        headers={['Cecha', 'PostgreSQL', 'MySQL', 'MongoDB']}
        rows={[
          {
            feature: 'Zastosowanie',
            postgres: 'Złożone systemy B2B',
            mysql: 'Proste strony WWW',
            mongo: 'Dane niestrukturalne',
          },
          {
            feature: 'Złożone zapytania',
            postgres: 'Król (Wydajny JOIN)',
            mysql: 'Dobre, ale słabnie',
            mongo: 'Słabe (Brak relacji)',
          },
          {
            feature: 'Obsługa JSON',
            postgres: 'Doskonała (JSONB)',
            mysql: 'Podstawowa',
            mongo: 'Natywna',
          },
          {
            feature: 'Dane GIS (Mapy)',
            postgres: 'Najlepszy (PostGIS)',
            mysql: 'Podstawowa',
            mongo: 'Podstawowa',
          },
        ]}
      />

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
            To funkcja, która zmienia zasady gry. Możesz przeszukiwać miliony dokumentów JSON z
            prędkością bazy SQL, bez utrzymywania osobnej bazy NoSQL.
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
            <SectionHeader title="Brak Vendor Lock-in" subtitle="Wolność wyboru" align="left" />
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

      <BaseCta
        icon={ShieldCheck}
        title="Przestań płacić za licencje. Zacznij inwestować w produkt."
        description="Pomożemy Ci zmigrować Twoje dane z drogich, komercyjnych rozwiązań do wydajnego PostgreSQL. Zróbmy analizę oszczędności dla Twojego biznesu."
        buttonText="Oblicz oszczędności z migracji"
        buttonLink="/web-development/custom-app"
        secondaryButtonText="Wróć do Bazy Wiedzy"
        secondaryButtonLink="/baza-wiedzy"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default PostgresArticle;
