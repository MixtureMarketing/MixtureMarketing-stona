/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Terminal,
  ChevronDown,
  CheckCircle2,
  Rocket,
  Info,
  Layers,
  Database,
  Globe,
  Cpu,
  Layout,
  ArrowRight,
  Briefcase,
  Lock,
  Battery,
  Bot,
  Server, // DODANO BRAKUJĄCY IMPORT
  Key,
  FileCode,
  Search,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { PYTHON_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/python';

// Główny komponent artykułu
const PythonArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'python-django-framework-fintech');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Obsługa paska postępu czytania
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
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#00684A]/20 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Dowiedz się, dlaczego Fintechy i Startupy kochają Django. Bezpieczeństwo klasy bankowej i błyskawiczne wdrożenia MVP.'
        }
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] pointer-events-none bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-[#092e20] via-[#00684A] to-[#00ED64] shadow-[0_0_15px_rgba(0,237,100,0.5)] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-20 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5E9] text-[#00684A] text-xs font-bold uppercase tracking-wider mb-8 border border-[#00684A]/20 shadow-sm">
              <ShieldCheck size={14} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#092e20] via-[#00684A] to-[#00ED64]">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <div className="max-w-2xl mx-auto">
              <p className="text-xl text-gray-600 leading-relaxed font-medium italic border-l-4 border-[#00684A] pl-6 py-4 bg-white shadow-sm rounded-r-xl">
                {CONTENT.header.quote}
              </p>
            </div>
          </header>

          {/* HERO VISUAL */}
          <div className="mb-24">
            <PythonHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-600 prose-a:text-[#00684A] hover:prose-a:text-[#092e20] prose-strong:text-dark prose-li:text-gray-600">
            {/* Context Link */}
            <div className="mb-16 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start gap-5 not-prose hover:shadow-md transition-shadow">
              <div className="bg-blue-50 p-3 rounded-full shrink-0">
                <Server className="text-secondary" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  Szerszy Kontekst
                </p>
                <h4 className="text-lg font-bold text-dark mb-2">{CONTENT.contextBox.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{CONTENT.contextBox.text}</p>
                <a
                  href={CONTENT.contextBox.linkUrl}
                  className="text-sm text-[#00684A] hover:text-[#00ED64] font-bold inline-flex items-center gap-2 group"
                >
                  {CONTENT.contextBox.linkText}{' '}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            </div>

            <AnimateOnScroll>
              <p
                className="lead text-2xl text-dark mb-12 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
            </AnimateOnScroll>

            {/* BATTERIES INCLUDED SECTION */}
            <div className="my-32">
              <SectionHeader
                title={CONTENT.batteries.title}
                subtitle={CONTENT.batteries.subtitle}
                align="left"
              />
              <p>{CONTENT.batteries.text}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-12 not-prose">
                {[
                  {
                    ...CONTENT.batteries.cards[0],
                    icon: <Key size={24} />,
                  },
                  {
                    ...CONTENT.batteries.cards[1],
                    icon: <Database size={24} />,
                  },
                  {
                    ...CONTENT.batteries.cards[2],
                    icon: <Layout size={24} />,
                  },
                  {
                    ...CONTENT.batteries.cards[3],
                    icon: <ShieldCheck size={24} />,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-5 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm group hover:border-[#00684A]/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-emerald-50 text-[#00684A] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#00684A] group-hover:text-white transition-colors duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-dark text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 m-0 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#092e20] text-white p-8 md:p-10 rounded-[2.5rem] border border-[#00684A]/30 flex flex-col md:flex-row items-center justify-between gap-8 not-prose shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-[#00ED64] uppercase tracking-widest mb-2">
                    Werdykt Biznesowy
                  </p>
                  <p
                    className="m-0 font-medium text-xl text-gray-100"
                    dangerouslySetInnerHTML={{ __html: CONTENT.batteries.verdict }}
                  />
                </div>
                <Zap className="text-[#00ED64] animate-pulse shrink-0 relative z-10" size={48} />
              </div>
            </div>

            {/* SECURITY FIRST */}
            <div className="my-32">
              <SectionHeader
                title={CONTENT.security.title}
                subtitle={CONTENT.security.subtitle}
                align="center"
              />
              <p className="text-center max-w-2xl mx-auto mb-16">{CONTENT.security.text}</p>

              <div className="not-prose my-12">
                <SecurityShieldVisual content={CONTENT.security} />
              </div>
            </div>

            {/* ADMIN PANEL */}
            <div className="my-32">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <SectionHeader
                    title={CONTENT.admin.title}
                    subtitle={CONTENT.admin.subtitle}
                    align="left"
                  />
                  <p>{CONTENT.admin.text1}</p>
                  <p dangerouslySetInnerHTML={{ __html: CONTENT.admin.text2 }} />
                </div>
                <div className="flex-1 not-prose w-full">
                  <DjangoAdminPreview />
                </div>
              </div>
            </div>

            {/* SCALABILITY MIT */}
            <div className="my-32">
              <SectionHeader
                title={CONTENT.scalability.title}
                subtitle={CONTENT.scalability.subtitle}
                align="left"
              />
              <p>{CONTENT.scalability.text}</p>

              <div className="not-prose mt-12">
                <ScalabilityVisual content={CONTENT.scalability} />
              </div>
            </div>

            {/* AI PARTNER */}
            <div className="my-32 bg-gradient-to-br from-white to-indigo-50/50 p-8 md:p-16 rounded-[3rem] border border-indigo-100 shadow-xl relative overflow-hidden not-prose group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                <Bot size={200} className="text-indigo-600" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                  <Cpu size={14} />
                  <span>{CONTENT.ai.subtitle}</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-dark mb-6">
                  {CONTENT.ai.title}
                </h2>

                <p
                  className="text-gray-600 mb-10 max-w-2xl leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: CONTENT.ai.text }}
                />

                <div className="flex flex-wrap gap-4">
                  <div className="bg-white px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> {CONTENT.ai.tags[0]}
                  </div>
                  <div className="bg-white px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div> {CONTENT.ai.tags[1]}
                  </div>
                  <div className="bg-white px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> {CONTENT.ai.tags[2]}
                  </div>
                </div>
              </div>
            </div>

            {/* NODE VS PYTHON TABLE */}
            <div className="my-32">
              <SectionHeader
                title={CONTENT.comparison.title}
                subtitle={CONTENT.comparison.subtitle}
                align="center"
              />
              <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-2xl mt-12 not-prose bg-white">
                <table className="w-full text-left">
                  <thead className="bg-[#092e20] text-white">
                    <tr>
                      <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                        {CONTENT.comparison.headers[0]}
                      </th>
                      <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                        {CONTENT.comparison.headers[1]}
                      </th>
                      <th className="p-6 text-xs font-black uppercase tracking-wider text-[#00ED64]">
                        {CONTENT.comparison.headers[2]}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {CONTENT.comparison.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-6 font-bold text-gray-900">{row.feature}</td>
                        <td className="p-6 text-gray-600">{row.node}</td>
                        <td className="p-6 text-[#00684A] font-bold bg-[#E8F5E9]/50">
                          {row.python}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-[#092e20] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#00684A] rounded-full blur-[100px] opacity-30 group-hover:opacity-40 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-20"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(0,237,100,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <Lock size={40} className="text-[#00ED64]" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                      {CONTENT.cta.title}
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-[#00ED64]/20 !bg-[#00ED64] border-none text-[#092e20] font-black hover:!bg-white hover:text-[#00684A] px-10 py-4"
                        onClick={() => (window.location.href = '/web-development/custom-app')}
                      >
                        {CONTENT.cta.primaryBtn}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10 py-4"
                        size="lg"
                        onClick={() => (window.location.href = '/baza-wiedzy')}
                      >
                        {CONTENT.cta.secondaryBtn}
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <RelatedArticles currentArticleId="python-django-framework-fintech" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VISUAL COMPONENTS (EMBEDDED FOR PORTABILITY)
// ==========================================

const PythonHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#092e20] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-[#00684A]/30 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#092e20] via-transparent to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo & Rings */}
        <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border border-[#00ED64]/20 animate-ping-slow"></div>
          <div className="absolute inset-4 rounded-full border border-[#00ED64]/40 animate-spin-slow-reverse border-dashed"></div>

          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#00684A] rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(0,237,100,0.3)] relative z-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Terminal size={64} className="text-white" />
          </div>

          {/* Orbiting Elements */}
          <div className="absolute w-full h-full animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark p-3 rounded-xl shadow-lg border border-blue-400/30">
              <Database size={20} className="text-blue-400" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-dark p-3 rounded-xl shadow-lg border border-yellow-400/30">
              <Lock size={20} className="text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Backendowy <span className="text-[#00ED64]">Tytan</span>
          </h2>
          <p className="text-[#00ED64]/70 font-mono text-sm uppercase tracking-[0.3em]">
            Security • Stability • Scale
          </p>
        </div>
      </div>

      <style>{`
                .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animate-spin-slow { animation: spin 15s linear infinite; }
                .animate-spin-slow-reverse { animation: spin 20s linear infinite reverse; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
};

interface SecurityShieldVisualProps {
  content: {
    title: string;
    items: {
      title: string;
      desc: string;
    }[];
  };
}

const SecurityShieldVisual = ({ content }: SecurityShieldVisualProps) => {
  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 md:p-12 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20"></div>

      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xxs font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={12} /> Ochrona 24/7
          </div>
          <h3 className="text-2xl font-bold text-dark mb-4">{content.title}?</h3>
          <ul className="space-y-4">
            {content.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <CheckCircle2 className="text-[#00684A] shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="text-dark block">{item.title}</strong>
                  <span className="text-sm text-gray-500">{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual Representation */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-dark rounded-3xl rotate-6 opacity-10"></div>
            <div className="absolute inset-0 bg-[#00684A] rounded-3xl -rotate-6 opacity-10"></div>
            <div className="absolute inset-0 bg-white rounded-3xl border border-gray-100 shadow-2xl flex items-center justify-center z-10">
              <ShieldCheck size={100} className="text-[#00684A] drop-shadow-2xl" />

              {/* Floating particles */}
              <div className="absolute top-4 right-4 text-red-400 text-xs font-mono bg-red-50 px-2 py-1 rounded animate-bounce">
                XSS Blocked
              </div>
              <div
                className="absolute bottom-4 left-4 text-blue-400 text-xs font-mono bg-blue-50 px-2 py-1 rounded animate-bounce"
                style={{ animationDelay: '0.5s' }}
              >
                SQLi Blocked
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DjangoAdminPreview = () => {
  return (
    <div className="w-full bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden border border-gray-700 font-mono text-sm">
      {/* Fake Browser Bar */}
      <div className="bg-[#0f172a] px-4 py-3 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 px-3 py-1 bg-[#1e293b] rounded text-gray-400 text-xs flex-1 text-center">
          admin.twoja-firma.com/dashboard
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 bg-[#1e293b] border-r border-gray-700 p-4 hidden sm:block">
          <div className="text-[#00ED64] font-bold mb-6 uppercase tracking-wider text-xs">
            Django Admin
          </div>
          <div className="space-y-3">
            <div className="text-gray-400 text-xs uppercase mb-1">Aplikacja</div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Briefcase size={14} /> Produkty
            </div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Globe size={14} /> Zamówienia
            </div>
            <div className="text-gray-400 text-xs uppercase mt-4 mb-1">Auth</div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Lock size={14} /> Users
            </div>
            <div className="text-white hover:bg-[#334155] p-2 rounded cursor-pointer flex items-center gap-2">
              <Key size={14} /> Groups
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#0f172a] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-lg font-bold">Ostatnie Zamówienia</h3>
            <button className="bg-[#00684A] text-white px-3 py-1 rounded text-xs hover:bg-[#00503a]">
              Dodaj +
            </button>
          </div>

          <div className="space-y-2">
            {[
              {
                id: '#2049',
                user: 'jan.kowalski@gmail.com',
                status: 'Opłacone',
                amount: '2499 PLN',
                color: 'text-green-400',
              },
              {
                id: '#2048',
                user: 'firma@tech.pl',
                status: 'W trakcie',
                amount: '12500 PLN',
                color: 'text-yellow-400',
              },
              {
                id: '#2047',
                user: 'anna.nowak@onet.pl',
                status: 'Anulowane',
                amount: '150 PLN',
                color: 'text-red-400',
              },
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#1e293b] p-3 rounded border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
              >
                <div className="w-16 text-gray-400">{row.id}</div>
                <div className="flex-1 text-white font-medium">{row.user}</div>
                <div className={`w-24 ${row.color} text-xs uppercase font-bold`}>{row.status}</div>
                <div className="w-24 text-right text-gray-300">{row.amount}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-500 text-xs">
            * Ten panel został wygenerowany automatycznie w 3 minuty.
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScalabilityVisualProps {
  content: {
    items: {
      name: string;
      desc: string;
    }[];
    tips: string[];
  };
}

const ScalabilityVisual = ({ content }: ScalabilityVisualProps) => {
  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Rocket size={24} />
            </div>
            <div>
              <div className="font-bold text-dark">{content.items[0].name}</div>
              <div className="text-xs text-gray-500">{content.items[0].desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <Globe size={24} />
            </div>
            <div>
              <div className="font-bold text-dark">{content.items[1].name}</div>
              <div className="text-xs text-gray-500">{content.items[1].desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <Layers size={24} />
            </div>
            <div>
              <div className="font-bold text-dark">{content.items[2].name}</div>
              <div className="text-xs text-gray-500">{content.items[2].desc}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-dark p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ED64] rounded-full blur-[60px] opacity-20"></div>
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Info size={16} className="text-[#00ED64]" /> Jak to skalować?
          </h4>
          <ul className="text-sm space-y-2 text-gray-300">
            {content.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PythonArticle;
