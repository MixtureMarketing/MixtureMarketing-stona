import React from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  Container,
  Cloud,
  Workflow,
  ArrowRight,
  Code2,
  Settings,
  Database,
  Layers,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { DOCKER_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/docker';
import ArticleShell from './ArticleShell';
import { DockerHeroVisual, DockerVsVmVisual, KubernetesVisual } from './visuals/DockerVisuals';
import ArticleContextBox from './shared/ArticleContextBox';
import ArticleUseCases from './shared/ArticleUseCases';
import BaseCta from '../common/BaseCta';

const DockerArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'docker-konteneryzacja');
  const content = CONTENT;

  return (
    <ArticleShell
      id="docker-konteneryzacja"
      title={`${content.header.title.line1}: ${content.header.title.line2}`}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData?.image || '/assets/images/docker.png'}
      icon={Container}
      accentColor="#2496ED"
      heroVisual={<DockerHeroVisual />}
      slug="/baza-wiedzy/docker-konteneryzacja-przewodnik"
    >
      <ArticleContextBox
        icon={Workflow}
        text={`<p className="text-sm text-secondary m-0 font-medium">Ten artykuł jest częścią serii <strong>Infrastruktura DevOps</strong>.</p>`}
      >
        <Link
          to="/baza-wiedzy/devops-fundament-nowoczesnego-biznesu/"
          className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
        >
          Zobacz pełny przewodnik: Docker, K8s, AWS, CI/CD <ArrowRight size={14} />
        </Link>
      </ArticleContextBox>

      <AnimateOnScroll>
        <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl">
          Wyobraź sobie, że programista kończy pracę, prezentuje idealnie działającą aplikację na
          swoim laptopie, ale po wrzuceniu na serwer... wszystko się sypie.{' '}
          <strong>"Dziwne, u mnie działa"</strong> – to zdanie kosztowało firmy miliardy dolarów w
          opóźnieniach.
        </p>
        <p>
          <strong>Docker</strong> powstał, aby zakończyć tę erę niepewności. Zamiast wysyłać sam
          kod, wysyłamy całe "cyfrowe pudełko" (kontener), w którym znajduje się wszystko: od
          systemu operacyjnego, przez biblioteki, aż po konfigurację. To fundament, na którym
          budujemy{' '}
          <Link
            to="/web-development/custom-app/"
            className="text-secondary font-bold hover:underline"
          >
            skalowalne aplikacje dedykowane
          </Link>{' '}
          w Mixture Marketing.
        </p>
      </AnimateOnScroll>

      {/* WHAT IS DOCKER */}
      <div className="my-24">
        <SectionHeader
          title="Czym jest Docker? (Standard Kontenerowy)"
          subtitle="Rewolucja w logistyce kodu"
          align="left"
        />
        <p>
          Zanim wprowadzono standardowy kontener morski, załadunek towarów był chaotyczny i powolny.
          Docker zrobił z oprogramowaniem to samo – ustandaryzował sposób, w jaki pakujemy i
          uruchamiamy aplikacje, niezależnie od tego, czy korzystają z{' '}
          <Link
            to="/baza-wiedzy/nodejs-jeden-jezyk/"
            className="text-secondary font-bold hover:underline"
          >
            Node.js
          </Link>
          ,{' '}
          <Link
            to="/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp/"
            className="text-secondary font-bold hover:underline"
          >
            Pythona
          </Link>{' '}
          czy{' '}
          <Link
            to="/baza-wiedzy/go-golang-jezyk-chmury/"
            className="text-secondary font-bold hover:underline"
          >
            Go
          </Link>
          .
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-12">
          {[
            { icon: <Code2 />, label: 'Kod źródłowy' },
            { icon: <Settings />, label: 'Zależności systemowe' },
            { icon: <Database />, label: 'Zasoby danych' },
            { icon: <Layers />, label: 'Konfiguracja runtime' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group"
            >
              <div className="text-blue-500 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="font-bold text-dark">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DOCKER VS VM */}
      <div className="my-24">
        <SectionHeader
          title="Docker vs. Maszyny Wirtualne (VM)"
          subtitle="Lekkość przekłada się na zysk"
          align="left"
        />
        <p>
          Maszyny wirtualne to "Domy Jednorodzinne" – każda potrzebuje własnej instalacji systemu
          operacyjnego. Docker to "Mieszkania w Bloku" – wszystkie korzystają ze wspólnej
          infrastruktury serwera, ale pozostają w pełni odizolowane. To pozwala na uruchomienie{' '}
          <strong>10x więcej aplikacji</strong> na tym samym sprzęcie.
        </p>

        <div className="my-12">
          <DockerVsVmVisual />
        </div>
      </div>

      {/* 4 BUSINESS BENEFITS */}
      <ArticleUseCases
        title="4 Powody, dla których Twój biznes potrzebuje Dockera"
        accentColor="#2496ED"
        items={[
          {
            title: '1. Błyskawiczny Start',
            desc: 'Wdrożenie nowego programisty do projektu trwa minuty, a nie dni. Kod uruchamia się jedną komendą, bez żmudnej konfiguracji środowiska.',
            icon: <Rocket size={24} />,
          },
          {
            title: '2. Bezpieczeństwo Izolacji',
            desc: 'Awarie wewnątrz jednego kontenera nie wpływają na pozostałe części systemu. To kluczowe w architekturze mikroserwisów.',
            icon: <ShieldCheck size={24} />,
          },
          {
            title: '3. Łatwe Skalowanie',
            desc: 'Obsługa nagłych skoków ruchu (np. Black Friday) staje się prosta – system automatycznie dokłada kopie kontenerów tam, gdzie są potrzebne.',
            icon: <Scale size={24} />,
          },
          {
            title: '4. Niezależność od Chmury',
            desc: 'Docker chroni Cię przed tzw. "Vendor Lock-in". Przeniesienie kontenerów z AWS do Google Cloud lub na własny serwer jest szybkie i bezbolesne.',
            icon: <Cloud size={24} />,
          },
        ]}
      />

      {/* KUBERNETES */}
      <div className="my-24">
        <SectionHeader
          title="Kubernetes (K8s) – Kapitan Twojej Floty"
          subtitle="Orkiestracja w skali Enterprise"
          align="left"
        />
        <p>
          Docker dostarcza "pudełka", ale <strong>Kubernetes</strong> jest kapitanem, który
          decyduje, gdzie je postawić, jak je rozmieścić na statku i co zrobić, gdy jedno z nich
          zacznie przeciekać. To mózg nowoczesnej infrastruktury IT.
        </p>

        <div className="my-12">
          <KubernetesVisual />
        </div>
      </div>

      {/* SUMMARY CTA */}
      <BaseCta
        icon={Rocket}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#2496ED"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default DockerArticle;
