/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Timer,
  Rocket,
  ShieldCheck,
  Zap,
  Briefcase,
  Layers,
  Database,
  ArrowRight,
  Code2,
  CheckCircle2,
  Server,
  Cloud,
  DollarSign,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { LARAVEL_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/laravel';
import {
  LaravelHeroVisual,
  LaravelEcosystemMap,
  EloquentComparison,
  LaravelPerformanceChart,
} from './visuals/LaravelVisuals';

const LaravelArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'laravel-php-framework-szybkie-wdrozenie');
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
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#FF2D20]/20 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Czy warto wybrać Laravel w 2025? Obalamy mity o PHP. Poznaj framework, który oferuje najszybszy Time-to-Market i gotowe moduły.'
        }
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-dark via-[#FF2D20] to-dark shadow-[0_0_10px_rgba(255,45,32,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F0] text-[#D82015] text-xs font-bold uppercase tracking-wider mb-8 border border-[#FF2D20]/20">
              <Timer size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark via-[#FF2D20] to-dark">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium italic border-l-4 border-[#FF2D20] pl-6 py-2 bg-red-50/30 rounded-r-xl">
              {CONTENT.header.quote}
            </p>
          </header>

          {/* TIME TO MARKET HERO VISUAL */}
          <div className="mb-20">
            <LaravelHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#FF2D20] hover:prose-a:text-[#D82015] prose-strong:text-dark prose-li:text-gray-700">
            <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
              <Server className="text-secondary mt-1 shrink-0" size={20} />
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
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
            </AnimateOnScroll>

            {/* MAGIC OF ECOSYSTEM */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.ecosystem.title}
                subtitle={CONTENT.ecosystem.subtitle}
                align="left"
              />
              <p>{CONTENT.ecosystem.text}</p>

              <div className="not-prose">
                <LaravelEcosystemMap />
              </div>

              <div className="bg-[#FFF0F0] text-[#D82015] p-6 rounded-2xl border border-[#FF2D20]/20 text-center font-bold text-sm not-prose">
                {CONTENT.ecosystem.verdict}
              </div>
            </div>

            {/* ELOQUENT ORM */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.eloquent.title}
                subtitle={CONTENT.eloquent.subtitle}
                align="left"
              />
              <p>{CONTENT.eloquent.text}</p>

              <div className="not-prose">
                <EloquentComparison />
              </div>
            </div>

            {/* SECURITY */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.security.title}
                subtitle={CONTENT.security.subtitle}
                align="left"
              />
              <p>{CONTENT.security.text}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 not-prose">
                {CONTENT.security.cards.map((card, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <ShieldCheck className="text-[#059669] mb-4" size={32} />
                    <h4 className="font-bold text-dark mb-2">{card.title}</h4>
                    <p className="text-xs text-gray-600">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PERFORMANCE: OCTANE */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.performance.title}
                subtitle={CONTENT.performance.subtitle}
                align="left"
              />
              <p>{CONTENT.performance.text}</p>

              <div className="not-prose">
                <LaravelPerformanceChart />
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
                      <th className="p-4 text-xs font-black uppercase text-[#FF2D20]">
                        {CONTENT.comparison.headers[1]}
                      </th>
                      <th className="p-4 text-xs font-black uppercase text-[#68A063]">
                        {CONTENT.comparison.headers[2]}
                      </th>
                      <th className="p-4 text-xs font-black uppercase text-[#306998]">
                        {CONTENT.comparison.headers[3]}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {CONTENT.comparison.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="p-4 font-bold">{row.feature}</td>
                        <td className="p-4 text-[#D82015] font-bold">{row.v1}</td>
                        <td className="p-4">{row.v2}</td>
                        <td className="p-4">{row.v3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* USE CASES */}
            <div className="my-24 bg-gray-50 p-8 md:p-12 rounded-[2rem] not-prose">
              <h3 className="text-2xl font-bold text-dark mb-8">{CONTENT.useCases.title}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { ...CONTENT.useCases.items[0], icon: <Cloud size={20} /> },
                  { ...CONTENT.useCases.items[1], icon: <Briefcase size={20} /> },
                  { ...CONTENT.useCases.items[2], icon: <Layers size={20} /> },
                  { ...CONTENT.useCases.items[3], icon: <CheckCircle2 size={20} /> },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#FF2D20]/10 rounded-lg flex items-center justify-center text-[#FF2D20] shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF2D20] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-900 rounded-full blur-[100px] opacity-30"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Rocket size={40} className="text-[#FF2D20]" />
                    </div>
                    <h2
                      className="text-3xl font-bold mb-6 text-white"
                      dangerouslySetInnerHTML={{ __html: CONTENT.cta.title }}
                    />
                    <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-[#FF2D20]/20 !bg-[#FF2D20] border-none text-white hover:!bg-[#D82015]"
                        onClick={() => (window.location.href = '/web-development/custom-app')}
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
            </div>

            <RelatedArticles
              currentArticleId="laravel-php-framework-szybkie-wdrozenie"
              category="tech"
            />
          </article>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
            animation: spin 10s linear infinite;
        }
        .animate-shimmer {
            animation: shimmer 1.5s infinite linear;
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LaravelArticle;
