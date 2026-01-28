import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowRight,
  Layout,
  Layers,
  Database,
  Terminal,
  ChevronDown,
  Info,
  MousePointerClick,
  Filter,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { ARTICLES } from '../../data/articles';
import { ELASTICSEARCH_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/elasticsearch';
import {
  ElasticHeroSearch,
  BookIndexAnalogy,
  SearchArchitecture,
  KillerFeaturesInteractive,
} from './visuals/ElasticsearchVisuals';
import RelatedArticles from './RelatedArticles';

const ElasticsearchArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'elasticsearch-inteligentna-wyszukiwarka');
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
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-secondary/20 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Poznaj Elasticsearch. Dowiedz się, czym jest Full-Text Search, jak działa Fuzzy Matching i dlaczego SQL nie nadaje się do e-commerce.'
        }
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-dark via-secondary to-dark shadow-[0_0_10px_rgba(63,61,145,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Search size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* SMART SEARCH HERO VISUAL */}
          <div className="mb-20">
            <LazyHydrate whenVisible>
              <ElasticHeroSearch />
            </LazyHydrate>
          </div>

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
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
            </AnimateOnScroll>

            {/* WHAT IS ELASTICSEARCH */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.whatIs.title}
                subtitle={CONTENT.whatIs.subtitle}
                align="left"
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.whatIs.text }} />

              <div className="not-prose">
                <LazyHydrate whenVisible>
                  <BookIndexAnalogy />
                </LazyHydrate>
              </div>
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
                      <th className="p-4 text-xs font-black uppercase text-secondary">
                        {CONTENT.comparison.headers[2]}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {CONTENT.comparison.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="p-4 font-bold">{row.label}</td>
                        <td className={`p-4 ${i === 0 || i === 3 ? 'text-red-500' : ''}`}>
                          {row.v1}
                        </td>
                        <td className="p-4 text-emerald-600 font-bold">{row.v2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* KILLER FEATURES */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.killerFeatures.title}
                subtitle={CONTENT.killerFeatures.subtitle}
                align="left"
              />
              <p>{CONTENT.killerFeatures.text}</p>

              <div className="not-prose">
                <LazyHydrate whenVisible>
                  <KillerFeaturesInteractive />
                </LazyHydrate>
              </div>
            </div>

            {/* ARCHITECTURE */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.architecture.title}
                subtitle={CONTENT.architecture.subtitle}
                align="left"
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.architecture.text }} />
              <div className="not-prose">
                <LazyHydrate whenVisible>
                  <SearchArchitecture />
                </LazyHydrate>
              </div>
            </div>

            {/* ELK STACK BONUS */}
            <div className="my-24 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden not-prose">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BarChart3 size={150} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-widest text-xxs mb-4">
                  <Layers size={16} /> Bonus dla IT i Zarządu
                </div>
                <h3 className="text-2xl font-bold text-dark mb-6 mt-0">
                  {CONTENT.elkStack.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl">
                  {CONTENT.elkStack.text}
                </p>
                <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                  {CONTENT.elkStack.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-secondary relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-dark rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Search size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                    <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="white"
                        size="lg"
                        className="shadow-xl text-secondary hover:bg-gray-100"
                        onClick={() => (window.location.href = '/web-development/ecommerce/')}
                      >
                        {CONTENT.cta.primaryBtn}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                        size="lg"
                        onClick={() => (window.location.href = '/baza-wiedzy/')}
                      >
                        {CONTENT.cta.secondaryBtn}
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <RelatedArticles
              currentArticleId="elasticsearch-inteligentna-wyszukiwarka"
              category="tech"
            />
          </article>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
            animation: spin 30s linear infinite;
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

export default ElasticsearchArticle;
