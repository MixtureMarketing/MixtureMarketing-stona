import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Ship,
  Server,
  Layers,
  Feather,
  Anchor,
  Settings,
  Code2,
  Database,
  Cloud,
  Clock,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Scale,
  Rocket,
  ShieldCheck,
  Zap,
  Cpu,
  Workflow,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { DOCKER_ARTICLE_CONTENT } from '../../data/content/articles/docker';

const DockerArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'docker-konteneryzacja');
  const content = DOCKER_ARTICLE_CONTENT;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30 font-sans">
      <Seo
        title={
          articleData?.title ||
          content.header.title.line1 + ' ' + content.header.title.line2 + ' | Mixture Marketing'
        }
        description={articleData?.description || content.header.subtitle}
        image={articleData?.image}
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Container size={12} />
              <span>{content.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {content.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {content.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {content.header.subtitle}
            </p>
          </header>

          {/* Hero Visual */}
          <div className="mb-20">
            <DockerHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-600 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-600">
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
                Wyobraź sobie, że programista kończy pracę, prezentuje idealnie działającą aplikację
                na swoim laptopie, ale po wrzuceniu na serwer... wszystko się sypie.{' '}
                <strong>"Dziwne, u mnie działa"</strong> – to zdanie kosztowało firmy miliardy
                dolarów w opóźnieniach.
              </p>
              <p>
                <strong>Docker</strong> powstał, aby zakończyć tę erę niepewności. Zamiast wysyłać
                sam kod, wysyłamy całe "cyfrowe pudełko" (kontener), w którym znajduje się wszystko:
                od systemu operacyjnego, przez biblioteki, aż po konfigurację. To fundament, na
                którym budujemy{' '}
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
                Zanim wprowadzono standardowy kontener morski, załadunek towarów był chaotyczny i
                powolny. Docker zrobił z oprogramowaniem to samo – ustandaryzował sposób, w jaki
                pakujemy i uruchamiamy aplikacje, niezależnie od tego, czy korzystają z{' '}
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

              <div className="bg-blue-50 p-8 rounded-[2rem] border border-[#cce4ff] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Zap size={100} />
                </div>
                <p className="text-base m-0 font-medium text-dark leading-relaxed">
                  <strong>Gwarancja spójności:</strong> Jeśli kontener uruchomi się na MacBooku
                  dewelopera, masz 100% pewności, że zadziała identycznie na serwerze produkcyjnym w
                  chmurze AWS. To eliminuje "niespodzianki" podczas wdrożeń niemal do zera.
                </p>
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
                Maszyny wirtualne to "Domy Jednorodzinne" – każda potrzebuje własnej instalacji
                systemu operacyjnego. Docker to "Mieszkania w Bloku" – wszystkie korzystają ze
                wspólnej infrastruktury serwera, ale pozostają w pełni odizolowane. To pozwala na
                uruchomienie <strong>10x więcej aplikacji</strong> na tym samym sprzęcie.
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
                    Wdrożenie nowego programisty do projektu trwa minuty, a nie dni. Kod uruchamia
                    się jedną komendą, bez żmudnej konfiguracji środowiska.
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
                decyduje, gdzie je postawić, jak je rozmieścić na statku i co zrobić, gdy jedno z
                nich zacznie przeciekać. To mózg nowoczesnej infrastruktury IT.
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
                      Twoje wdrożenia trwają zbyt długo? Masz dość błędów konfiguracyjnych na
                      produkcji? Przenieśmy Twoją aplikację do nowoczesnych kontenerów Docker.
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

            <RelatedArticles currentArticleId="docker-konteneryzacja" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

// --- VISUAL COMPONENTS ---

const DockerHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-6 md:p-12 overflow-hidden shadow-2xl min-h-[600px] flex flex-col items-center border border-white/10 group">
      {/* Abstract background elements */}
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/10 via-transparent to-transparent"></div>

      {/* 1. Header Area - Fully separated from visual */}
      <div className="relative z-30 text-center mb-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xxs font-black uppercase tracking-[0.2em] mb-4">
          <ShieldCheck size={12} /> Standard Izolacji 2025
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Architektura <span className="text-blue-400">Niezawodności</span>
        </h3>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          Docker to nie tylko kontenery. To kompletny system, który izoluje Twoją aplikację od
          problemów serwerowych, gwarantując jej działanie w każdych warunkach.
        </p>
      </div>

      {/* 2. Visual Area - Layered approach */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        {/* Layer 3: Application Containers */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12 w-full max-w-xl relative z-20">
          {/* Container: Database */}
          <div
            className="flex flex-col items-center gap-3 animate-float-slow"
            style={{ animationDelay: '0s' }}
          >
            <div className="w-full aspect-square bg-indigo-600/20 rounded-2xl border-2 border-indigo-500/40 flex items-center justify-center shadow-lg group-hover:bg-indigo-600/30 transition-colors">
              <Database size={28} className="text-indigo-400" />
            </div>
            <span className="text-xxs font-black text-indigo-300 uppercase tracking-widest">
              Database
            </span>
          </div>

          {/* Container: App Core (Highlighted) */}
          <div
            className="flex flex-col items-center gap-3 animate-float-slow"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="w-full aspect-square bg-blue-500 rounded-2xl border-4 border-white shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
              <Code2 size={36} className="text-white drop-shadow-md" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
            </div>
            <span className="text-xxs font-black text-white uppercase tracking-widest bg-blue-600 px-3 py-1 rounded-full shadow-lg">
              App Core
            </span>
          </div>

          {/* Container: API */}
          <div
            className="flex flex-col items-center gap-3 animate-float-slow"
            style={{ animationDelay: '1s' }}
          >
            <div className="w-full aspect-square bg-cyan-600/20 rounded-2xl border-2 border-cyan-500/40 flex items-center justify-center shadow-lg group-hover:bg-cyan-600/30 transition-colors">
              <Zap size={28} className="text-cyan-400" />
            </div>
            <span className="text-xxs font-black text-cyan-300 uppercase tracking-widest">
              API Layer
            </span>
          </div>
        </div>

        {/* Layer 2: Docker Engine (The Mediator) */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 mb-8 relative group-hover:border-blue-500/30 transition-colors duration-700">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F172A] px-4 py-1 rounded-full border border-white/10 text-xxs font-black text-blue-400 uppercase tracking-[0.3em]">
            Docker Runtime Engine
          </div>
          <div className="flex items-center justify-around opacity-40">
            <Settings size={20} className="text-gray-400 animate-spin-slow" />
            <Layers size={20} className="text-gray-400" />
            <Cpu size={20} className="text-gray-400" />
            <ShieldCheck size={20} className="text-gray-400" />
          </div>
        </div>

        {/* Layer 1: Infrastructure */}
        <div className="w-full max-w-3xl h-16 bg-dark rounded-2xl border-b-4 border-blue-900 flex items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-xxs font-black text-white/40 uppercase tracking-[0.5em]">
              Physical Infrastructure / Cloud Host
            </span>
          </div>
        </div>
      </div>

      <style>{`
                @keyframes float-docker {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float-slow {
                    animation: float-docker 5s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin 10s linear infinite;
                }
             `}</style>
    </div>
  );
};

const DockerVsVmVisual = () => {
  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.02]"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x divide-gray-100 relative z-10">
        {/* VM Side */}
        <div className="flex flex-col items-center text-center p-4 group/vm">
          <div className="mb-8 relative">
            <div className="w-36 h-36 bg-gray-100 rounded-3xl flex items-center justify-center border-4 border-gray-200 shadow-inner group-hover/vm:bg-gray-200 transition-colors">
              <Server size={56} className="text-gray-400" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xxs font-black uppercase border border-red-200 shadow-sm flex items-center gap-2">
              <TrendingDown size={14} /> Heavy (GB)
            </div>
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">Maszyna Wirtualna</h3>
          <p className="text-xxs text-gray-400 font-black uppercase tracking-[0.2em] mb-8">
            Model Tradycyjny
          </p>

          <ul className="space-y-4 text-sm text-gray-600 text-left w-full max-w-xs mx-auto">
            <li className="flex items-center gap-3">
              <Clock size={18} className="text-red-400" /> Start: Kilka minut
            </li>
            <li className="flex items-center gap-3">
              <Settings size={18} className="text-red-400" /> Pełny system operacyjny w środku
            </li>
            <li className="flex items-center gap-3">
              <TrendingDown size={18} className="text-red-400" /> Wysokie zużycie zasobów (RAM/CPU)
            </li>
          </ul>
        </div>

        {/* Docker Side */}
        <div className="flex flex-col items-center text-center p-4 group/docker">
          <div className="mb-8 relative">
            <div className="w-36 h-36 bg-[#2496ED] rounded-3xl flex items-center justify-center border-4 border-white shadow-2xl group-hover/docker:scale-105 transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 bg-grid-white/[0.2]"></div>
              <Box size={56} className="text-white drop-shadow-md" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-xxs font-black uppercase border border-emerald-200 shadow-sm flex items-center gap-2">
              <Feather size={14} /> Light (MB)
            </div>
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">Kontener Docker</h3>
          <p className="text-xxs text-[#2496ED] font-black uppercase tracking-[0.2em] mb-8">
            Model Nowoczesny
          </p>

          <ul className="space-y-4 text-sm text-gray-600 text-left w-full max-w-xs mx-auto">
            <li className="flex items-center gap-3">
              <Zap size={18} className="text-emerald-500" /> Start: Milisekundy
            </li>
            <li className="flex items-center gap-3">
              <RefreshCw size={18} className="text-emerald-500" /> Współdzielone jądro systemu
            </li>
            <li className="flex items-center gap-3">
              <TrendingDown size={18} className="text-emerald-500 rotate-180" /> Ekstremalna
              wydajność
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const KubernetesVisual = () => {
  return (
    <div className="bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-2xl flex flex-col items-center group border border-white/5">
      {/* Tech Floor */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent opacity-50 blur-3xl"></div>

      {/* Control Plane (K8s) */}
      <div className="relative z-20 mb-16 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-[#326CE5]/20 blur-[40px] rounded-full animate-pulse"></div>
          <div className="w-28 h-28 bg-[#326CE5] rounded-[2rem] border-4 border-white/20 shadow-[0_0_50px_rgba(50,108,229,0.4)] flex items-center justify-center relative overflow-hidden group-hover:rotate-45 transition-transform duration-700">
            <Anchor size={48} className="text-white" />
            <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1 rounded-full text-blue-400 text-xxs font-black uppercase tracking-widest mb-2">
            Control Plane
          </div>
          <h4 className="text-white font-bold text-lg m-0 tracking-tight">K8s Cluster Master</h4>
        </div>
      </div>

      {/* Managed Nodes (The Fleet) */}
      <div className="relative z-10 w-full max-w-2xl flex flex-wrap justify-center gap-8 md:gap-12">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-4 animate-float-slow"
            style={{ animationDelay: `${i * 0.5}s` }}
          >
            <div className="relative group/node">
              <div className="absolute -inset-2 bg-emerald-500/0 border border-emerald-500/0 rounded-xl group-hover/node:bg-emerald-500/10 group-hover/node:border-emerald-500/30 transition-all"></div>
              <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center shadow-xl group-hover/node:scale-110 transition-transform">
                <Box size={24} className="text-primary" />
              </div>
              {/* Health Line */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F172A] animate-pulse shadow-[0_0_10px_#10b981]"></div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center relative z-20">
        <p className="text-white text-xl font-medium italic tracking-tight">
          "Gdy Docker dostarcza pudełka, Kubernetes buduje z nich imperium."
        </p>
        <p className="text-blue-300/50 text-xs mt-2 font-bold uppercase tracking-[0.2em]">
          Automatyczna skala, monitoring i samonaprawa systemu.
        </p>
      </div>

      <style>{`
                .animate-float-slow {
                    animation: float-k8s 6s ease-in-out infinite;
                }
                @keyframes float-k8s {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
             `}</style>
    </div>
  );
};

export default DockerArticle;
