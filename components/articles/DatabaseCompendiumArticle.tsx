/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Database,
  Zap,
  Search,
  ShieldCheck,
  Layers,
  Box,
  Rocket,
  SearchCode,
  AlertTriangle,
  XCircle,
  Server,
  Workflow,
  MousePointer2,
  FileText,
  SearchCheck,
  Check,
  CheckCircle2,
  Layout,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { DATABASE_COMPENDIUM_CONTENT } from '../../data/content/articles/database-compendium';

interface DatabasePlayer {
  name: string;
  type: string;
  role: string;
  power: string;
  desc: string;
  for: string[];
}

interface DecisionStep {
  step: number;
  q: string;
  desc: string;
  ans: string;
}

const DatabaseCompendiumArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'databases-compendium');
  const content = DATABASE_COMPENDIUM_CONTENT;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30 font-sans">
      <Seo
        title={
          articleData?.title ||
          content.header.title.line1 +
            ' ' +
            content.header.title.line2 +
            ' ' +
            content.header.subtitle
        }
        description={articleData?.description || content.lead.text1}
        image={articleData?.image}
        article={articleData}
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Database size={12} />
              <span>{content.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
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
          <div className="mb-24">
            <DatabaseHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-600 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-600">
            <AnimateOnScroll>
              <div className="bg-white rounded-3xl p-8 border-l-8 border-secondary shadow-xl mb-12">
                <p className="lead text-2xl text-secondary font-medium leading-relaxed m-0">
                  {content.lead.highlight}
                </p>
              </div>

              <p dangerouslySetInnerHTML={{ __html: content.lead.text1 }}></p>
              <p dangerouslySetInnerHTML={{ __html: content.lead.text2 }}></p>

              <div className="mt-8 p-6 bg-gradient-to-r from-secondary/5 to-primary/10 border border-secondary/10 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-secondary">
                  <SearchCheck size={24} />
                </div>
                <div
                  className="text-sm m-0"
                  dangerouslySetInnerHTML={{ __html: content.lead.cta }}
                ></div>
              </div>
            </AnimateOnScroll>

            {/* PART 1: THE PLAYERS */}
            <div className="my-32">
              <SectionHeader
                title={content.players.title}
                subtitle={content.players.subtitle}
                align="center"
              />
              <p className="text-center max-w-2xl mx-auto mb-16">{content.players.text}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
                {(content.players.items as DatabasePlayer[]).map((item, i) => {
                  const icons = [
                    <ShieldCheck
                      key="shield"
                      className="text-[#336791] group-hover:text-white"
                      size={32}
                    />,
                    <Box key="box" className="text-[#47a248] group-hover:text-white" size={32} />,
                    <Rocket
                      key="rocket"
                      className="text-[#dc382d] group-hover:text-white"
                      size={32}
                    />,
                    <SearchCode
                      key="search"
                      className="text-[#f1c40f] group-hover:text-white"
                      size={32}
                    />,
                  ];
                  const bgColors = ['#336791', '#47a248', '#dc382d', '#f1c40f'];
                  return (
                    <div
                      key={i}
                      className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                    >
                      <div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16"
                        style={{ backgroundColor: `${bgColors[i]}10` }}
                      ></div>
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                          style={{ backgroundColor: `${bgColors[i]}10` }}
                        >
                          {React.cloneElement(icons[i] as React.ReactElement, {
                            style: { color: i === 3 ? '#f1c40f' : bgColors[i] },
                            className: 'group-hover:text-white',
                          })}
                        </div>
                        <h3 className="text-2xl font-bold text-dark mb-2 flex items-center gap-3">
                          {item.name}{' '}
                          <span
                            className="text-xxs px-3 py-1 rounded-full uppercase tracking-wider font-extrabold"
                            style={{ backgroundColor: `${bgColors[i]}20`, color: bgColors[i] }}
                          >
                            {item.type}
                          </span>
                        </h3>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                          {item.role}
                        </div>

                        <ul className="space-y-4 mb-8">
                          <li className="flex items-start gap-3 text-sm text-gray-600">
                            <Check
                              style={{ color: bgColors[i] }}
                              className="flex-shrink-0 mt-0.5"
                              size={16}
                            />
                            <span dangerouslySetInnerHTML={{ __html: item.power }}></span>
                          </li>
                          <li className="flex items-start gap-3 text-sm text-gray-600">
                            <Check
                              style={{ color: bgColors[i] }}
                              className="flex-shrink-0 mt-0.5"
                              size={16}
                            />
                            <span>{item.desc}</span>
                          </li>
                        </ul>

                        <div className="pt-6 border-t border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            Idealny do:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.for.map((f, j) => (
                              <span
                                key={j}
                                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PART 2: DECISION MATRIX */}
            <div className="my-32">
              <SectionHeader
                title={content.matrix.title}
                subtitle={content.matrix.subtitle}
                align="left"
              />
              <p>{content.matrix.text}</p>

              <div className="my-12 overflow-x-auto not-prose rounded-3xl shadow-2xl border border-gray-100">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-dark text-white">
                      <th className="p-6 font-bold uppercase tracking-wider text-xs">
                        {content.matrix.headers[0]}
                      </th>
                      <th className="p-6 font-bold uppercase tracking-wider text-xs text-center bg-[#336791]/20 border-r border-white/10">
                        {content.matrix.headers[1]}
                      </th>
                      <th className="p-6 font-bold uppercase tracking-wider text-xs text-center bg-[#47a248]/20 border-r border-white/10">
                        {content.matrix.headers[2]}
                      </th>
                      <th className="p-6 font-bold uppercase tracking-wider text-xs text-center bg-[#dc382d]/20 border-r border-white/10">
                        {content.matrix.headers[3]}
                      </th>
                      <th className="p-6 font-bold uppercase tracking-wider text-xs text-center bg-[#f1c40f]/20">
                        {content.matrix.headers[4]}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {content.matrix.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="p-6 font-bold text-gray-900 bg-gray-50/50">{row.label}</td>
                        <td
                          className={`p-6 text-center text-sm ${row.label === 'Relacje (JOIN)' ? 'text-[#336791] font-bold bg-blue-50' : 'text-gray-600'}`}
                        >
                          {row.v1}
                        </td>
                        <td className="p-6 text-center text-sm text-gray-600">{row.v2}</td>
                        <td
                          className={`p-6 text-center text-sm ${row.label === 'Magazyn' ? 'font-bold text-[#dc382d]' : 'text-gray-600'}`}
                        >
                          {row.v3}
                        </td>
                        <td className="p-6 text-center text-sm text-gray-600">{row.v4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PART 3: ARCHITECTURE */}
            <div className="my-32">
              <SectionHeader
                title={content.architecture.title}
                subtitle={content.architecture.subtitle}
                align="center"
              />
              <p className="text-center max-w-3xl mx-auto mb-16">{content.architecture.text}</p>

              <div className="my-12">
                <ArchitectureVisual />
              </div>
            </div>

            {/* PART 4: DECISION TREE */}
            <div className="my-32">
              <SectionHeader
                title={content.decisionTree.title}
                subtitle={content.decisionTree.subtitle}
                align="left"
              />
              <p>{content.decisionTree.text}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 not-prose">
                {(content.decisionTree.steps as DecisionStep[]).map((step, i) => {
                  const icons = [
                    <ShieldCheck key="shield" size={16} />,
                    <Rocket key="rocket" size={16} />,
                    <SearchCode key="search" size={16} />,
                    <Box key="box" size={16} />,
                  ];
                  const colors = ['blue', 'red', 'yellow', 'green'];
                  const UI_Icons = [
                    <CheckCircle2 key="check" size={32} />,
                    <Zap key="zap" size={32} />,
                    <Search key="search" size={32} />,
                    <Layers key="layers" size={32} />,
                  ];
                  return (
                    <div
                      key={i}
                      className={`bg-gradient-to-br from-white to-${colors[i]}-50 p-8 rounded-[2rem] border border-${colors[i]}-100 shadow-sm relative group hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-${colors[i]}-100 text-${colors[i]}-600 rounded-xl flex items-center justify-center font-bold text-xl`}
                        >
                          {step.step}
                        </div>
                        {React.cloneElement(UI_Icons[i] as React.ReactElement, {
                          className: `text-${colors[i]}-200 group-hover:text-${colors[i]}-500 transition-colors`,
                        })}
                      </div>
                      <h4 className="text-xl font-bold text-dark mb-2">{step.q}</h4>
                      <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{step.desc}</p>
                      <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 bg-${colors[i]}-600 rounded-lg flex items-center justify-center text-white`}
                        >
                          {icons[i]}
                        </div>
                        <div className="text-sm font-bold text-dark">{step.ans}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PART 5: COMMON MISTAKES */}
            <div className="my-24 bg-[#FFF5F5] rounded-[3rem] p-10 md:p-16 border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 hidden md:block">
                <AlertTriangle size={200} className="text-red-500" />
              </div>
              <div className="relative z-10 max-w-3xl">
                <SectionHeader
                  title={content.mistakes.title}
                  subtitle={content.mistakes.subtitle}
                  align="left"
                  className="mb-12"
                />
                <div className="space-y-6 not-prose">
                  {content.mistakes.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-6 items-start bg-white p-6 rounded-2xl border border-red-100 shadow-sm"
                    >
                      <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                        <XCircle className="text-red-600" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-dark text-lg mb-1">{item.title}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <Workflow size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                      {content.cta.title}
                    </h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                      {content.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-primary/20 px-10 py-4 text-lg"
                        onClick={() => openModal('consultation')}
                      >
                        {content.cta.primaryBtn}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10 py-4 text-lg"
                        size="lg"
                        onClick={() => (window.location.href = '/baza-wiedzy')}
                      >
                        {content.cta.secondaryBtn}
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <RelatedArticles currentArticleId="databases-compendium" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

// --- VISUAL COMPONENTS ---

const DatabaseHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#0B1120] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[600px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>

      <div className="flex flex-col gap-8 relative z-10 max-w-4xl mx-auto">
        {/* 1. TOP: User & App */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6 mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                <MousePointer2 size={24} className="text-gray-500" />
              </div>
              <span className="text-xxs font-bold uppercase text-gray-400 tracking-widest">
                Użytkownik
              </span>
            </div>

            {/* Flow Line */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-gray-300 to-blue-500 relative">
              <div className="absolute right-0 -top-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="px-8 py-4 bg-dark rounded-2xl shadow-xl flex items-center gap-3 border border-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                <Server size={24} className="text-white" />
                <span className="text-white font-bold text-sm">Backend API</span>
              </div>
              <span className="text-xxs font-bold uppercase text-blue-800 tracking-widest">
                Logic Layer
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Connector */}
        <div className="h-12 w-0.5 bg-gray-300 mx-auto relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>

        {/* 2. BOTTOM: Database Grid */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-100 px-4 py-1 rounded-full border border-gray-200 text-xxs font-black uppercase text-gray-500 tracking-widest">
            Data Persistence Layer
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Redis Card */}
            <div className="relative p-5 rounded-2xl border border-red-100 bg-red-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              {/* Connector Line Mockup */}
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-red-200/50 hidden md:block"></div>

              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 text-red-600">
                <Rocket size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-red-500 uppercase tracking-wide mb-1">
                  1. Hot Data (Cache)
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Redis</h4>
                <p className="text-xs text-gray-500 mt-1">Sesja, Koszyk, Tokeny</p>
              </div>
            </div>

            {/* Elastic Card */}
            <div className="relative p-5 rounded-2xl border border-yellow-100 bg-yellow-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-yellow-200/50 hidden md:block"></div>

              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 text-yellow-600">
                <Search size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-yellow-500 uppercase tracking-wide mb-1">
                  2. Search Engine
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Elasticsearch</h4>
                <p className="text-xs text-gray-500 mt-1">Katalog, Filtry, Autocomplete</p>
              </div>
            </div>

            {/* Postgres Card */}
            <div className="relative p-5 rounded-2xl border border-blue-100 bg-blue-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-blue-200/50 hidden md:block"></div>

              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                <Database size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-blue-500 uppercase tracking-wide mb-1">
                  3. Core Data (SQL)
                </div>
                <h4 className="font-bold text-gray-800 text-sm">PostgreSQL</h4>
                <p className="text-xs text-gray-500 mt-1">Zamówienia, Płatności, Faktury</p>
              </div>
            </div>

            {/* Mongo Card */}
            <div className="relative p-5 rounded-2xl border border-green-100 bg-green-50/30 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-green-200/50 hidden md:block"></div>

              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-green-600">
                <FileText size={20} />
              </div>
              <div>
                <div className="text-xxs font-black text-green-500 uppercase tracking-wide mb-1">
                  4. Big Data (NoSQL)
                </div>
                <h4 className="font-bold text-gray-800 text-sm">MongoDB</h4>
                <p className="text-xs text-gray-500 mt-1">Logi, Analityka, Rekomendacje</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
    </div>
  );
};

const ArchitectureVisual = () => {
  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden not-prose">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
        <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
            <Layout size={24} />
          </div>
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-widest text-blue-800">
              Frontend
            </div>
            <div className="text-xxs text-blue-600 font-bold">Next.js / React</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-full h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-blue-100 text-xxs font-bold text-blue-600">
              API Requests
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600">
            <Server size={24} />
          </div>
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-widest text-slate-800">
              Backend
            </div>
            <div className="text-xxs text-slate-600 font-bold">Node.js / Python</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Redis', label: 'Cache', color: 'red' },
          { name: 'Postgres', label: 'SQL', color: 'blue' },
          { name: 'Mongo', label: 'NoSQL', color: 'green' },
          { name: 'Elastic', label: 'Search', color: 'yellow' },
        ].map((db, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border border-${db.color}-100 bg-${db.color}-50/30 text-center`}
          >
            <div className={`text-xxs font-black text-${db.color}-600 uppercase`}>{db.label}</div>
            <div className="font-bold text-gray-800 text-sm">{db.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseCompendiumArticle;
