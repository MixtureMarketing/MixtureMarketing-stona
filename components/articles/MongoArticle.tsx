/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileJson,
  Rocket,
  Layers,
  Zap,
  Terminal,
  ChevronDown,
  CheckCircle2,
  XCircle,
  BarChart3,
  Infinity as InfinityIcon,
  Search,
  ShoppingCart,
  Database,
  Globe,
  Cpu,
  Palette,
  ArrowRight,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { MONGO_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/mongo';
import { MongoHeroVisual, CarGarageAnalogy, ShardingSimulator } from './visuals/MongoVisuals';

const MongoArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'mongodb-przyszlosc-big-data');
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
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#00ED64]/20 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Poznaj zalety MongoDB i elastycznej struktury dokumentowej. Dowiedz się, dlaczego NoSQL to przyszłość Big Data i dynamicznych aplikacji.'
        }
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#00684A] via-[#00ED64] to-[#00684A] shadow-[0_0_10px_rgba(0,237,100,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#00684A] text-xs font-bold uppercase tracking-wider mb-8 border border-[#C8E6C9]">
              <Database size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00684A] via-[#00ED64] to-[#00684A]">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* COSMIC HERO VISUAL */}
          <div className="mb-20">
            <MongoHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#00684A] hover:prose-a:text-[#00ED64] prose-strong:text-dark prose-li:text-gray-700">
            <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
              <Database className="text-secondary mt-1 shrink-0" size={20} />
              <div>
                <p
                  className="text-sm text-secondary m-0 font-medium"
                  dangerouslySetInnerHTML={{ __html: CONTENT.contextBox.text }}
                />
                <a
                  href={CONTENT.contextBox.linkUrl}
                  className="text-sm text-[#00684A] hover:text-[#00ED64] font-bold mt-1 inline-flex items-center gap-1"
                >
                  {CONTENT.contextBox.linkText} <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <AnimateOnScroll>
              <p
                className="lead text-2xl text-[#00684A] mb-12 font-medium leading-relaxed border-l-4 border-[#00ED64] pl-6 py-2 bg-emerald-50/30 rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
            </AnimateOnScroll>

            {/* DOCUMENTS VS ROWS */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.documents.title}
                subtitle={CONTENT.documents.subtitle}
                align="left"
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.documents.text }} />

              <div className="not-prose">
                <CarGarageAnalogy />
              </div>
            </div>

            {/* CODE PREVIEW */}
            <div className="my-24 bg-[#0B1120] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden not-prose">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ED64] rounded-full blur-[100px] opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-[#00ED64] font-bold uppercase tracking-widest text-xxs mb-6">
                  <FileJson size={16} /> {CONTENT.code.title}
                </div>
                <div className="bg-black/40 rounded-xl p-6 font-mono text-xs md:text-sm text-[#A6ACCD] border border-white/5 shadow-inner">
                  <pre className="overflow-x-auto text-emerald-400">
                    <code>{`// MongoDB: Wszystko w jednym miejscu
{
  "_id": "user_123",
  "name": "Jan Kowalski",
  "contact": {
    "email": "jan@example.com",
    "phone": "+48 123 456 789"
  },
  "orders": [
    { "order_id": "A1", "total": 150 },
    { "order_id": "B2", "total": 300 }
  ]
}`}</code>
                  </pre>
                </div>
                <p className="mt-6 text-gray-400 text-sm italic">{CONTENT.code.text}</p>
              </div>
            </div>

            {/* 3 BUSINESS REASONS */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.reasons.title}
                subtitle={CONTENT.reasons.subtitle}
                align="left"
              />

              <div className="space-y-12 mt-12 not-prose">
                {CONTENT.reasons.items.map((reason, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row gap-8 items-start p-8 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-[#00ED64] group-hover:text-white transition-colors">
                      {i === 0 ? (
                        <Zap size={24} />
                      ) : i === 1 ? (
                        <Layers size={24} />
                      ) : (
                        <InfinityIcon size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark mb-2">{reason.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed m-0">{reason.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SHARDING SIMULATOR */}
            <div className="my-24">
              <ShardingSimulator />
            </div>

            {/* COMPARISON TABLE */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.comparison.title}
                subtitle={CONTENT.comparison.subtitle}
                align="left"
              />
              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg mt-8 not-prose">
                <table className="w-full text-left bg-white">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-xs font-black uppercase text-gray-500">
                        {CONTENT.comparison.headers[0]}
                      </th>
                      <th className="p-4 text-xs font-black uppercase text-gray-500">
                        {CONTENT.comparison.headers[1]}
                      </th>
                      <th className="p-4 text-xs font-black uppercase text-[#00684A]">
                        {CONTENT.comparison.headers[2]}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {CONTENT.comparison.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="p-4 font-bold">{row.label}</td>
                        <td className="p-4">{row.v1}</td>
                        <td className="p-4 text-emerald-600 font-bold">{row.v2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CASE STUDY: E-COMMERCE */}
            <div className="my-24 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden not-prose">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShoppingCart size={150} />
              </div>
              <SectionHeader
                title={CONTENT.caseStudy.title}
                subtitle={CONTENT.caseStudy.subtitle}
                align="left"
              />
              <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
                {CONTENT.caseStudy.text}
              </p>
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                <p
                  className="m-0 text-emerald-900 font-medium"
                  dangerouslySetInnerHTML={{ __html: CONTENT.caseStudy.verdict }}
                />
              </div>
            </div>

            {/* MERN STACK */}
            <div className="my-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-dark mb-6">{CONTENT.mern.title}</h2>
                  <p
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: CONTENT.mern.text1 }}
                  />
                  <p
                    className="text-gray-600 leading-relaxed mt-4"
                    dangerouslySetInnerHTML={{ __html: CONTENT.mern.text2 }}
                  />
                </div>
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 bg-[#0F172A] rounded-full flex items-center justify-center border-4 border-[#00ED64]/30 shadow-2xl">
                    <div className="text-center">
                      <div className="text-[#00ED64] text-5xl font-black mb-1">M</div>
                      <div className="text-white text-xxs font-bold tracking-widest uppercase">
                        MERN STACK
                      </div>
                    </div>
                    {/* Rotating Orbit */}
                    <div className="absolute inset-[-20px] border-2 border-dashed border-gray-200 rounded-full animate-spin-slow opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-gradient-to-br from-[#00684A] to-[#00ED64] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-[100px] opacity-20"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform group-hover:scale-110 transition-all duration-500">
                      <Database size={48} className="text-[#00684A] animate-pulse" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#001E2B]">
                      {CONTENT.cta.title}
                    </h2>
                    <p className="text-emerald-900 mb-10 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl !bg-[#001E2B] border-none hover:!bg-black text-white"
                        onClick={() => (window.location.href = '/web-development/custom-app')}
                      >
                        {CONTENT.cta.primaryBtn}
                      </Button>
                      <Button
                        variant="white"
                        className="text-[#00684A] hover:bg-gray-100"
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

            <RelatedArticles currentArticleId="mongodb-przyszlosc-big-data" category="tech" />
          </article>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
            animation: spin 20s linear infinite;
        }
        .animate-shimmer {
            animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default MongoArticle;
