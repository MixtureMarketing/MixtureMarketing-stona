/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Rocket,
  ShieldCheck,
  Zap,
  Layers,
  Users,
  Smartphone,
  Globe,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Layout,
  Box,
  Cpu,
  Repeat,
  Server,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import { ARTICLES, Article } from '../../data/articles';
import { REACT_ARTICLE_CONTENT } from '../../data/content/articles/react';
import RelatedArticles from './RelatedArticles';

const ReactJsArticle = () => {
  // Zabezpieczenie na wypadek braku artykułu w danych
  const articleData = (ARTICLES.find((a) => a.id === 'react-js-krol-frontendu') ||
    {}) as Partial<Article>;
  const [scrollProgress, setScrollProgress] = useState(0);
  const content = REACT_ARTICLE_CONTENT;

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#61DAFB]/20 font-sans">
      <Seo
        title={articleData.title || content.header.title.line1 + ' ' + content.header.title.line2}
        description={articleData.description || content.header.subtitle}
        image={articleData.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] pointer-events-none bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-dark via-[#61DAFB] to-[#00D8FF] shadow-[0_0_15px_rgba(97,218,251,0.6)] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-20 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F7FF] text-[#0088AA] text-xs font-bold uppercase tracking-wider mb-8 border border-[#61DAFB]/30 shadow-sm">
              <Code2 size={14} />
              <span>{content.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {content.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark via-[#61DAFB] to-dark">
                {content.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {content.header.subtitle}
            </p>
          </header>

          {/* GLOBAL NETWORK HERO VISUAL */}
          <div className="mb-24">
            <ReactHeroNetwork />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#00A3CC] hover:prose-a:text-[#61DAFB] prose-strong:text-dark prose-li:text-gray-700">
            {/* Context Box */}
            <div className="mb-16 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start gap-5 not-prose hover:shadow-md transition-shadow">
              <div className="bg-blue-50 p-3 rounded-full shrink-0 text-secondary">
                <Layout size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  {content.contextBox.title}
                </p>
                <h4 className="text-lg font-bold text-dark mb-2">{content.contextBox.subtitle}</h4>
                <p className="text-sm text-gray-600 mb-3">{content.contextBox.text}</p>
                <Link
                  to={content.contextBox.linkUrl}
                  className="text-sm text-[#00A3CC] hover:text-[#61DAFB] font-bold inline-flex items-center gap-2 group"
                >
                  {content.contextBox.linkText}{' '}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>

            <AnimateOnScroll>
              <p className="lead text-2xl text-dark mb-12 font-medium leading-relaxed border-l-4 border-[#61DAFB] pl-6 py-2 bg-blue-50/30 rounded-r-xl">
                {content.lead.highlight}
              </p>
              <p>{content.lead.text}</p>
            </AnimateOnScroll>

            {/* COMPONENT REVOLUTION (LEGO) */}
            <div className="my-32">
              <SectionHeader
                title={content.componentRevolution.title}
                subtitle={content.componentRevolution.subtitle}
                align="center"
              />
              <p className="text-center max-w-2xl mx-auto mb-12">
                {content.componentRevolution.text}
              </p>

              <div className="not-prose mb-16">
                <InterfaceAssembly />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
                {content.componentRevolution.cards.map((card, i) => {
                  const icons = [
                    <Zap key="zap" size={24} />,
                    <ShieldCheck key="shield" size={24} />,
                    <Layers key="layers" size={24} />,
                  ];
                  return (
                    <div
                      key={i}
                      className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#61DAFB]/30 transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-50 text-[#0088AA] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {icons[i]}
                      </div>
                      <h4 className="font-bold text-dark mb-2">{card.title}</h4>
                      <p className="text-sm text-gray-600 m-0 leading-relaxed">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BUS FACTOR & TALENT */}
            <div className="my-32 bg-[#0F172A] rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden not-prose shadow-2xl group">
              {/* Background Effects */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#61DAFB] rounded-full blur-[150px] opacity-10 group-hover:opacity-15 transition-opacity duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[120px] opacity-10"></div>

              <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#61DAFB] text-xs font-bold uppercase tracking-wider mb-6">
                    <Users size={14} /> {content.busFactor.badge}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 mt-0 tracking-tight">
                    {content.busFactor.title}
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    {content.busFactor.text}
                  </p>
                  <ul className="space-y-4">
                    {content.busFactor.list.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5"
                      >
                        <div className="bg-green-500/20 p-1.5 rounded-full text-green-400">
                          <CheckCircle2 size={16} />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:w-1/2 w-full flex justify-center">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md text-center relative overflow-hidden w-full max-w-sm">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#61DAFB]/10 to-transparent opacity-50"></div>
                    <div className="relative z-10">
                      <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2">
                        {content.busFactor.stats.rank}
                      </div>
                      <div className="text-xs font-bold text-[#61DAFB] uppercase tracking-[0.3em] mb-8">
                        {content.busFactor.stats.rankLabel}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0F172A]/50 rounded-2xl border border-white/5">
                          <div className="text-2xl font-bold text-white">
                            {content.busFactor.stats.jobs}
                          </div>
                          <div className="text-xxs text-gray-500 uppercase tracking-wide mt-1">
                            {content.busFactor.stats.jobsLabel}
                          </div>
                        </div>
                        <div className="p-4 bg-[#0F172A]/50 rounded-2xl border border-white/5">
                          <div className="text-2xl font-bold text-[#059669]">
                            {content.busFactor.stats.market}
                          </div>
                          <div className="text-xxs text-gray-500 uppercase tracking-wide mt-1">
                            {content.busFactor.stats.marketLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SYNERGY: REACT NATIVE */}
            <div className="my-32">
              <SectionHeader
                title={content.synergy.title}
                subtitle={content.synergy.subtitle}
                align="left"
              />
              <p dangerouslySetInnerHTML={{ __html: content.synergy.text }}></p>

              <div className="not-prose mt-12">
                <ReactVennDiagram />
              </div>
            </div>

            {/* REACT VS NEXT.JS */}
            <div className="my-32 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden not-prose">
              <SectionHeader
                title={content.nextJs.title}
                subtitle={content.nextJs.subtitle}
                align="left"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 group hover:border-[#61DAFB] transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#61DAFB] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">
                      R
                    </div>
                    <div>
                      <span className="font-bold text-dark block text-lg">
                        {content.nextJs.reactCard.title}
                      </span>
                      <span className="text-xs text-gray-500 uppercase tracking-widest">
                        {content.nextJs.reactCard.subtitle}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {content.nextJs.reactCard.text}
                  </p>
                </div>

                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-black transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg">
                      N
                    </div>
                    <div>
                      <span className="font-bold text-dark block text-lg">
                        {content.nextJs.nextCard.title}
                      </span>
                      <span className="text-xs text-gray-500 uppercase tracking-widest">
                        {content.nextJs.nextCard.subtitle}
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content.nextJs.nextCard.text }}
                  ></p>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                  <CheckCircle2 size={14} /> {content.nextJs.conclusion}
                </div>
              </div>
            </div>

            {/* TREND CHART */}
            <div className="my-32">
              <SectionHeader
                title={content.trends.title}
                subtitle={content.trends.subtitle}
                align="center"
              />
              <p className="text-center mb-12 max-w-2xl mx-auto">{content.trends.text}</p>
              <div className="not-prose">
                <ReactTrendChart />
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-gradient-to-br from-[#0B1120] to-[#1e293b] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#61DAFB] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-10"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(97,218,251,0.2)] border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <div className="relative">
                        <Zap size={48} className="text-[#61DAFB]" fill="currentColor" />
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                      {content.cta.title}
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {content.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-[#61DAFB]/20 !bg-[#61DAFB] border-none text-[#0B1120] font-black hover:!bg-[#00D8FF] px-10 py-4"
                        onClick={() => (window.location.href = '/web-development/custom-app/')}
                      >
                        {content.cta.primaryBtn}
                      </Button>
                      <Button
                        variant="white"
                        className="text-white border-white/20 hover:bg-white/10 px-10 py-4"
                        size="lg"
                        onClick={() => (window.location.href = '/contact/')}
                      >
                        {content.cta.secondaryBtn}
                      </Button>
                    </div>

                    <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60">
                      {content.cta.badges.map((badge, i) => {
                        const icons = [
                          <ShieldCheck key="shield" size={16} className="text-[#61DAFB]" />,
                          <Globe key="globe" size={16} className="text-[#61DAFB]" />,
                          <Smartphone key="mobile" size={16} className="text-[#61DAFB]" />,
                        ];
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest"
                          >
                            {icons[i]} {badge}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <RelatedArticles currentArticleId="react-js-krol-frontendu" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VISUAL COMPONENTS (POPRAWIONE)
// ==========================================

const ReactHeroNetwork = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-[#61DAFB]/20 shadow-2xl min-h-[600px] flex items-center justify-center group">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] to-[#0F172A]"></div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#61DAFB 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
        {/* Central React Atom */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center animate-float z-20">
          {/* Core */}
          <div className="w-20 h-20 bg-[#61DAFB] rounded-full shadow-[0_0_80px_rgba(97,218,251,0.8)] relative z-20 flex items-center justify-center border-4 border-[#0F172A]">
            <Code2 size={40} className="text-[#0F172A]" />
          </div>

          {/* Electrons (Ellipses) */}
          <div
            className="absolute w-full h-20 border-[3px] border-[#61DAFB]/60 rounded-[100%] animate-spin-slow"
            style={{ animationDuration: '8s' }}
          ></div>
          <div
            className="absolute w-full h-20 border-[3px] border-[#61DAFB]/60 rounded-[100%] animate-spin-slow"
            style={{ animationDuration: '8s', transform: 'rotate(60deg)' }}
          ></div>
          <div
            className="absolute w-full h-20 border-[3px] border-[#61DAFB]/60 rounded-[100%] animate-spin-slow"
            style={{ animationDuration: '8s', transform: 'rotate(-60deg)' }}
          ></div>
        </div>

        {/* Orbiting Satellites - ROZUNIĘTE DO ROGÓW */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Mobile - Top Left Corner */}
          <div className="absolute top-8 left-4 md:top-12 md:left-12 flex flex-col items-center gap-2 animate-bounce-slow z-30">
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#61DAFB] shadow-[0_0_20px_rgba(97,218,251,0.3)]">
              <Smartphone size={24} className="text-[#61DAFB]" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-[#0F172A]/80 px-2 rounded">
              Mobile
            </span>
            {/* Connecting Line */}
            <div className="absolute top-full left-1/2 w-px h-32 bg-gradient-to-b from-[#61DAFB]/50 to-transparent -z-10 rotate-[-45deg] origin-top"></div>
          </div>

          {/* Web - Bottom Right Corner */}
          <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 flex flex-col-reverse items-center gap-2 animate-bounce-slow delay-700 z-30">
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#61DAFB] shadow-[0_0_20px_rgba(97,218,251,0.3)]">
              <Globe size={24} className="text-[#61DAFB]" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-[#0F172A]/80 px-2 rounded">
              Web App
            </span>
            {/* Connecting Line */}
            <div className="absolute bottom-full left-1/2 w-px h-32 bg-gradient-to-t from-[#61DAFB]/50 to-transparent -z-10 rotate-[-45deg] origin-bottom"></div>
          </div>

          {/* Desktop - Top Right Corner */}
          <div className="absolute top-8 right-4 md:top-12 md:right-12 flex flex-col items-center gap-2 animate-bounce-slow delay-300 z-30">
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#61DAFB] shadow-[0_0_20px_rgba(97,218,251,0.3)]">
              <Layout size={24} className="text-[#61DAFB]" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-[#0F172A]/80 px-2 rounded">
              Desktop
            </span>
            {/* Connecting Line */}
            <div className="absolute top-full left-1/2 w-px h-32 bg-gradient-to-b from-[#61DAFB]/50 to-transparent -z-10 rotate-[45deg] origin-top"></div>
          </div>
        </div>

        <div className="text-center absolute bottom-12 z-50 p-4 rounded-xl backdrop-blur-sm bg-[#0F172A]/30">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            The <span className="text-[#61DAFB]">Universal</span> UI
          </h2>
          <p className="text-[#61DAFB]/70 font-mono text-sm uppercase tracking-[0.3em]">
            Learn Once • Write Anywhere
          </p>
        </div>
      </div>

      <style>{`
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-spin-slow { animation: spin 10s linear infinite; }
                .animate-bounce-slow { animation: bounceSlow 4s infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
};

const InterfaceAssembly = () => {
  return (
    <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-200 shadow-inner relative overflow-hidden group">
      <div className="flex flex-col items-center relative z-10">
        {/* The "Browser" */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-4">
            {/* Header Component */}
            <div className="col-span-3 h-16 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center text-blue-600 font-mono text-xs relative group/item">
              <span className="absolute -top-3 left-4 bg-blue-100 px-2 text-xxs font-bold">
                Header.jsx
              </span>
              Logo | Menu | Auth
            </div>

            {/* Sidebar Component */}
            <div className="col-span-1 h-48 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 flex items-center justify-center text-purple-600 font-mono text-xs relative group/item">
              <span className="absolute -top-3 left-4 bg-purple-100 px-2 text-xxs font-bold">
                Sidebar.jsx
              </span>
              Nav
            </div>

            {/* Content Component */}
            <div className="col-span-2 h-48 rounded-lg border-2 border-dashed border-green-300 bg-green-50 flex flex-col gap-3 p-3 relative group/item">
              <span className="absolute -top-3 left-4 bg-green-100 px-2 text-xxs font-bold text-green-700">
                Feed.jsx
              </span>

              {/* Nested Components (Cards) */}
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded border border-green-200 bg-white flex items-center justify-center text-green-500 font-mono text-xxs"
                >
                  Card.jsx (Instance {i})
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-2">
          <div className="w-1 h-12 bg-gray-300 rounded-full"></div>
          <div className="w-1 h-12 bg-gray-300 rounded-full mx-1"></div>
          <div className="w-1 h-12 bg-gray-300 rounded-full"></div>
        </div>

        <div className="mt-4 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest">
          Zasada atomowa
        </div>
      </div>
    </div>
  );
};

const ReactVennDiagram = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-gray-100 shadow-xl relative overflow-hidden flex justify-center">
      <div className="relative w-[300px] h-[200px] md:w-[500px] md:h-[300px]">
        {/* Circle 1: Web */}
        <div className="absolute left-0 top-0 w-48 h-48 md:w-72 md:h-72 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mix-blend-multiply hover:scale-105 transition-transform duration-500">
          <div className="text-center -ml-12 mt-12 md:-ml-20">
            <Globe className="mx-auto text-blue-500 mb-2" size={32} />
            <span className="font-bold text-blue-900 block">React DOM</span>
            <span className="text-xs text-blue-700">Aplikacje Webowe</span>
          </div>
        </div>

        {/* Circle 2: Mobile */}
        <div className="absolute right-0 top-0 w-48 h-48 md:w-72 md:h-72 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center mix-blend-multiply hover:scale-105 transition-transform duration-500">
          <div className="text-center -mr-12 mt-12 md:-mr-20">
            <Smartphone className="mx-auto text-purple-500 mb-2" size={32} />
            <span className="font-bold text-purple-900 block">React Native</span>
            <span className="text-xs text-purple-700">iOS & Android</span>
          </div>
        </div>

        {/* Intersection */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-[#61DAFB] mb-1 flex justify-center">
              <Repeat size={24} />
            </div>
            <span className="font-black text-dark text-sm md:text-base whitespace-nowrap">
              SHARED LOGIC
            </span>
            <div className="text-xxs text-gray-500 uppercase tracking-wide mt-1">
              State, Hooks, Utils,
              <br />
              API Calls
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReactTrendChart = () => {
  // Dane do wykresu: React (niebieski) vs Reszta (szary)
  const data = [
    { year: '2018', react: 45, others: 40 },
    { year: '2019', react: 55, others: 35 },
    { year: '2020', react: 65, others: 30 },
    { year: '2021', react: 72, others: 25 },
    { year: '2022', react: 80, others: 20 },
    { year: '2023', react: 88, others: 15 },
    { year: '2024', react: 92, others: 10 },
    { year: '2025', react: 96, others: 8 },
  ];

  return (
    <div className="bg-[#1e293b] p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-end gap-12">
        {/* CHART AREA */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#61DAFB]/20 p-2 rounded-lg">
                <TrendingUp className="text-[#61DAFB]" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Dominacja Rynkowa</h3>
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  Udział w nowych projektach Enterprise
                </p>
              </div>
            </div>
            {/* Legend */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#61DAFB] rounded-full"></div>
                <span className="text-white text-xs font-bold">React</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-gray-400 text-xs">Starsze technologie</span>
              </div>
            </div>
          </div>

          {/* The Bar Chart */}
          <div className="h-64 w-full flex items-end justify-between gap-2 relative border-b border-gray-700 pb-2 px-2">
            {data.map((item, i) => (
              <div key={i} className="flex-1 flex flex-row items-end justify-center gap-1 h-full">
                {/* React Bar (Blue) - Side by Side layout */}
                <div
                  className="w-1/2 bg-gradient-to-t from-[#61DAFB] to-[#00D8FF] rounded-t-sm shadow-[0_0_20px_rgba(97,218,251,0.3)] transition-all duration-700 group/bar relative hover:opacity-90"
                  style={{ height: `${item.react}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#0F172A] text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {item.react}%
                  </div>
                </div>

                {/* Others Bar (Gray) */}
                <div
                  className="w-1/2 bg-gray-700 rounded-t-sm opacity-50 transition-all duration-700 hover:opacity-80"
                  style={{ height: `${item.others}%` }}
                ></div>
              </div>
            ))}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between text-gray-500 text-xs mt-4 font-mono uppercase">
            {data.map((item) => (
              <span key={item.year} className="flex-1 text-center">
                {item.year}
              </span>
            ))}
          </div>
        </div>

        {/* STATS SIDEBAR */}
        <div className="lg:w-1/3 w-full bg-[#0F172A] p-6 rounded-3xl border border-gray-700 shadow-xl">
          <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-6 border-b border-gray-700 pb-2">
            Statystyki 2025
          </h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-white text-sm font-bold mb-2">
                <span>React Ecosystem</span>
                <span className="text-[#61DAFB]">Dominujący</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#61DAFB] h-full w-[85%] shadow-[0_0_10px_#61DAFB]"></div>
              </div>
              <p className="text-gray-500 text-xxs mt-1">Największy wybór bibliotek i narzędzi.</p>
            </div>

            <div>
              <div className="flex justify-between text-white text-sm font-bold mb-2">
                <span>Konkurencja</span>
                <span className="text-gray-400">Malejąca</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-600 h-full w-[35%]"></div>
              </div>
              <p className="text-gray-500 text-xxs mt-1">
                Starsze frameworki tracą udział w rynku.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-green-900/30 p-2 rounded-lg text-green-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">+124%</div>
                  <div className="text-gray-500 text-xs">Wzrost wdrożeń Enterprise</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactJsArticle;
