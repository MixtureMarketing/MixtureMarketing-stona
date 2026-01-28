/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Database,
  Server,
  Save,
  Activity,
  CheckCircle2,
  XCircle,
  Bot,
  ArrowRight,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Image from '../common/Image';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import Accordion from '../common/Accordion';
import LazyHydrate from '../common/LazyHydrate';
import { ARTICLES } from '../../data/articles';
import { REDIS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/redis';
import {
  SystemFlowArchitecture,
  SpeedRaceDemo,
  RedisTerminal,
  SentinelDemo,
  PubSubDemo,
} from './visuals/RedisVisuals';

const RedisUsageChart = React.lazy(() => import('./visuals/charts/RedisUsageChart'));

const RedisArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'redis-optymalizacja');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Kompletny przewodnik po Redis. Symulacje, interaktywne demo, architektura High-Availability i zastosowania w AI.'
        }
        image={articleData?.image}
        lcpImage="/assets/images/redis.png"
        article={articleData}
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Database size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                {CONTENT.header.title.line2}
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* Hero Visual */}
          <div className="mb-20">
            <div className="relative bg-white rounded-3xl p-2 border border-gray-100 shadow-[0_20px_50px_-10px_rgba(63,61,145,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E0EFFF] to-white opacity-50 rounded-3xl pointer-events-none"></div>
              <div className="relative aspect-[21/9] bg-[#0F172A] rounded-2xl overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(#61B6DE 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                ></div>

                <div className="flex items-center gap-8 md:gap-16 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1E293B] border border-[#334155] rounded-2xl flex items-center justify-center shadow-2xl">
                      <Server className="text-gray-600" size={32} />
                    </div>
                    <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                      App Server
                    </span>
                  </div>

                  <div className="relative w-16 md:w-32 h-[2px] bg-[#334155]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer"></div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#DC2626] to-[#991B1B] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-[#EF4444]">
                      <Database className="text-white" size={32} />
                      <div className="absolute -top-2 -right-2 bg-white text-[#DC2626] text-xxs font-bold px-2 py-0.5 rounded-full shadow-lg">
                        RAM
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#EF4444] uppercase tracking-widest font-bold">
                      Redis
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-700">
            <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
              <Database className="text-secondary mt-1 shrink-0" size={20} />
              <div>
                <p
                  className="text-sm text-secondary m-0 font-medium"
                  dangerouslySetInnerHTML={{ __html: CONTENT.contextBox.text }}
                />
                <a
                  href={CONTENT.contextBox.linkUrl}
                  className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
                >
                  {CONTENT.contextBox.linkText} <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <AnimateOnScroll>
              <p
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 bg-gradient-to-r from-[#E0EFFF]/50 to-transparent py-2 rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
            </AnimateOnScroll>

            <SectionHeader
              title={CONTENT.howItWorks.title}
              subtitle={CONTENT.howItWorks.subtitle}
              level="h2"
              align="left"
            />

            <p className="mb-8">{CONTENT.howItWorks.text}</p>

            <AnimateOnScroll>
              <div className="my-12">
                <LazyHydrate minHeight="400px">
                  <SystemFlowArchitecture />
                </LazyHydrate>
              </div>
            </AnimateOnScroll>

            {/* SPEED DEMO */}
            <div className="mt-20">
              <SectionHeader
                title={CONTENT.speed.title}
                subtitle={CONTENT.speed.subtitle}
                level="h2"
                align="left"
              />

              <p className="mb-8">{CONTENT.speed.text}</p>

              <AnimateOnScroll>
                <LazyHydrate minHeight="300px">
                  <SpeedRaceDemo />
                </LazyHydrate>
              </AnimateOnScroll>
            </div>

            {/* INTERACTIVE TERMINAL */}
            <div className="mt-24">
              <SectionHeader
                title={CONTENT.cli.title}
                subtitle={CONTENT.cli.subtitle}
                level="h2"
                align="left"
              />
              <p className="mb-8">{CONTENT.cli.text}</p>
              <AnimateOnScroll>
                <LazyHydrate minHeight="400px">
                  <RedisTerminal />
                </LazyHydrate>
              </AnimateOnScroll>
            </div>

            {/* PERSISTENCE */}
            <div className="mt-24">
              <h2 className="text-3xl font-bold text-dark mb-8">{CONTENT.persistence.title}</h2>
              <p className="mb-8">{CONTENT.persistence.text}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Save size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {CONTENT.persistence.rdb.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">{CONTENT.persistence.rdb.desc}</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={14} /> {CONTENT.persistence.rdb.pros[0]}
                    </li>
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={14} /> {CONTENT.persistence.rdb.pros[1]}
                    </li>
                    <li className="flex items-center gap-2 text-red-500">
                      <XCircle size={14} /> {CONTENT.persistence.rdb.cons[0]}
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {CONTENT.persistence.aof.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">{CONTENT.persistence.aof.desc}</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={14} /> {CONTENT.persistence.aof.pros[0]}
                    </li>
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={14} /> {CONTENT.persistence.aof.pros[1]}
                    </li>
                    <li className="flex items-center gap-2 text-red-500">
                      <XCircle size={14} /> {CONTENT.persistence.aof.cons[0]}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HIGH AVAILABILITY */}
            <div className="mt-24">
              <SectionHeader
                title={CONTENT.ha.title}
                subtitle={CONTENT.ha.subtitle}
                level="h2"
                align="left"
              />
              <p className="mb-8" dangerouslySetInnerHTML={{ __html: CONTENT.ha.text }} />
              <AnimateOnScroll>
                <LazyHydrate minHeight="400px">
                  <SentinelDemo />
                </LazyHydrate>
              </AnimateOnScroll>
            </div>

            {/* PUB/SUB (Redesigned) */}
            <div className="mt-24">
              <h2 className="text-3xl font-bold text-dark mb-6">{CONTENT.pubsub.title}</h2>
              <p className="mb-8">{CONTENT.pubsub.text}</p>
              <AnimateOnScroll>
                <PubSubDemo />
              </AnimateOnScroll>
            </div>

            {/* AI & VECTOR SEARCH */}
            <div className="mt-24 mb-16">
              <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-xs mb-4">
                    <Bot size={16} /> {CONTENT.ai.badge}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-6 mt-0">{CONTENT.ai.title}</h2>
                  <p className="text-gray-300 mb-8 text-lg">{CONTENT.ai.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {CONTENT.ai.cards.map((card, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="font-bold text-white mb-1">{card.title}</div>
                        <div className="text-xs text-gray-600">{card.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* COMPARISON TABLE */}
            <h2 className="text-3xl font-bold text-dark mb-8">{CONTENT.comparison.title}</h2>
            <AnimateOnScroll>
              <div className="mb-16 overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                        <th className="p-5 border-b border-gray-200 font-bold sticky left-0 bg-gray-50 z-10">
                          {CONTENT.comparison.headers[0]}
                        </th>
                        <th className="p-5 border-b border-gray-200 font-bold text-secondary bg-blue-50">
                          {CONTENT.comparison.headers[1]}
                        </th>
                        <th className="p-5 border-b border-gray-200 font-bold">
                          {CONTENT.comparison.headers[2]}
                        </th>
                        <th className="p-5 border-b border-gray-200 font-bold">
                          {CONTENT.comparison.headers[3]}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {CONTENT.comparison.rows.map((row, i) => (
                        <tr
                          key={i}
                          className={`hover:bg-gray-50 transition-colors ${i < CONTENT.comparison.rows.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          <td className="p-5 font-bold text-dark sticky left-0 bg-white z-10 border-r border-gray-100 sm:border-none">
                            {row.label}
                          </td>
                          <td
                            className={`p-5 font-bold bg-blue-50/30 ${i === 2 || i === 3 ? 'text-emerald-600' : 'text-secondary'}`}
                          >
                            {row.v1}
                          </td>
                          <td
                            className={`p-5 ${i === 2 || i === 3 ? 'text-emerald-600 font-bold' : 'text-gray-700'}`}
                          >
                            {row.v2}
                          </td>
                          <td
                            className={`p-5 ${i === 2 || i === 3 ? 'text-red-500 font-bold' : 'text-gray-700'}`}
                          >
                            {row.v3}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimateOnScroll>

            {/* CHART */}
            <AnimateOnScroll>
              <div className="mb-16 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-bold mb-8 text-center text-dark">
                  {CONTENT.chart.title}
                </h3>
                <div className="h-80 w-full">
                  <React.Suspense
                    fallback={<div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />}
                  >
                    <LazyHydrate minHeight="300px">
                      <RedisUsageChart />
                    </LazyHydrate>
                  </React.Suspense>
                </div>
              </div>
            </AnimateOnScroll>

            {/* FAQ */}
            <SectionHeader
              title={CONTENT.faq.title}
              subtitle={CONTENT.faq.subtitle}
              level="h2"
              centered={true}
            />

            <div className="max-w-3xl mx-auto mb-16 not-prose space-y-4">
              {CONTENT.faq.items.map((item, i) => (
                <Accordion key={i} title={item.q}>
                  {item.a}
                </Accordion>
              ))}
            </div>

            {/* CTA */}
            <AnimateOnScroll>
              <div className="rounded-3xl p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                  <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                    {CONTENT.cta.text}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      variant="white"
                      size="lg"
                      className="shadow-xl text-dark hover:bg-gray-100"
                      onClick={() => (window.location.href = '/web-development')}
                    >
                      {CONTENT.cta.primaryBtn}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                      size="lg"
                      onClick={() => (window.location.href = '/baza-wiedzy')}
                    >
                      {CONTENT.cta.secondaryBtn}
                    </Button>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            <RelatedArticles currentArticleId="redis-optymalizacja" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

export default RedisArticle;
