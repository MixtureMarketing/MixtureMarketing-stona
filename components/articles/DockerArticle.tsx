import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Ship,
  Layers,
  Settings,
  Code2,
  Database,
  Cloud,
  ArrowRight,
  Scale,
  Rocket,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { useModal } from '../../context/ModalContext';
import { ARTICLES } from '../../data/articles';
import { DOCKER_ARTICLE_CONTENT } from '../../data/content/articles/docker';
import ArticleShell from './ArticleShell';
import { DockerHeroVisual, DockerVsVmVisual, KubernetesVisual } from './visuals/DockerVisuals';

const DockerArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'docker-konteneryzacja');
  const content = DOCKER_ARTICLE_CONTENT;

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
      <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
        <Workflow className="text-secondary mt-1 shrink-0" size={20} />
        <div>
          <p className="text-sm text-secondary m-0 font-medium">
            Ten artykuł jest częścią serii <strong>Infrastruktura DevOps</strong>.
          </p>
          <Link
            to="/baza-wiedzy/devops-fundament-nowoczesnego-biznesu/"
            className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
          >
            Zobacz pełny przewodnik: Docker, K8s, AWS, CI/CD <ArrowRight size={14} />
          </Link>
        </div>
      </div>

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
      <div className="my-24">
        <SectionHeader
          title="4 Powody, dla których Twój biznes potrzebuje Dockera"
          subtitle="Zalety Ekonomiczne"
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 not-prose">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Rocket size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">1. Błyskawiczny Start</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Wdrożenie nowego programisty do projektu trwa minuty, a nie dni. Kod uruchamia się
              jedną komendą, bez żmudnej konfiguracji środowiska.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">2. Bezpieczeństwo Izolacji</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Awarie wewnątrz jednego kontenera nie wpływają na pozostałe części systemu. To
              kluczowe w architekturze mikroserwisów.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Scale size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">3. Łatwe Skalowanie</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Obsługa nagłych skoków ruchu (np. Black Friday) staje się prosta – system
              automatycznie dokłada kopie kontenerów tam, gdzie są potrzebne.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cloud size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">4. Niezależność od Chmury</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Docker chroni Cię przed tzw. "Vendor Lock-in". Przeniesienie kontenerów z AWS do
              Google Cloud lub na własny serwer jest szybkie i bezbolesne.
            </p>
          </div>
        </div>
      </div>

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
      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-gradient-to-br from-dark to-[#0F172A] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Ship size={48} className="text-white drop-shadow-lg" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">
                Uporządkujmy Twoją infrastrukturę raz na zawsze.
              </h2>
              <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                Twoje wdrożenia trwają zbyt długo? Masz dość błędów konfiguracyjnych na produkcji?
                Przenieśmy Twoją aplikację do nowoczesnych kontenerów Docker.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-primary/20 px-10"
                  onClick={() => openModal('consultation')}
                >
                  Zamów Audyt Infrastruktury
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10"
                  size="lg"
                  onClick={() => (window.location.href = '/baza-wiedzy/')}
                >
                  Wróć do Bazy Wiedzy
                </Button>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </ArticleShell>
  );
};

export default DockerArticle;
