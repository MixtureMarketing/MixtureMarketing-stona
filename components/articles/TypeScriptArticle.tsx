/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Code2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Rocket,
  ArrowRight,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import { ARTICLES } from '../../data/articles';
import { TypeScriptScanner, CostFixChart, CodeDuel } from './visuals/TypeScriptVisuals';
import RelatedArticles from './RelatedArticles';
import { TYPESCRIPT_ARTICLE_CONTENT } from '../../data/content/articles/typescript';

const TypeScriptArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'typescript-polisa-ubezpieczeniowa');
  const [scrollProgress, setScrollProgress] = useState(0);
  const content = TYPESCRIPT_ARTICLE_CONTENT;

  // Handle scroll progress
  React.useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#3178C6]/20 font-sans">
      <Seo
        title={articleData?.title || `${content.header.title.line1} ${content.header.title.line2}`}
        description={articleData?.description || content.header.subtitle}
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-dark via-[#3178C6] to-dark shadow-[0_0_10px_rgba(49,120,198,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <ShieldCheck size={12} />
              <span>{content.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {content.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark via-[#3178C6] to-dark">
                {content.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {content.header.subtitle}
            </p>
          </header>

          {/* INTERACTIVE SCANNER VISUAL */}
          <div className="mb-20">
            <TypeScriptScanner />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#3178C6] hover:prose-a:text-dark prose-strong:text-dark prose-li:text-gray-700">
            <AnimateOnScroll>
              <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-[#3178C6] pl-6 py-2 bg-blue-50/30 rounded-r-xl">
                {content.lead.highlight}
              </p>
              <p dangerouslySetInnerHTML={{ __html: content.lead.text }}></p>
            </AnimateOnScroll>

            {/* WHAT IS TS */}
            <div className="my-24">
              <SectionHeader
                title={content.definition.title}
                subtitle={content.definition.subtitle}
                align="left"
              />
              <p dangerouslySetInnerHTML={{ __html: content.definition.text }}></p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    <Code2 size={120} />
                  </div>
                  <h4 className="text-xl font-bold text-dark mb-4">
                    {content.definition.cards[0].title}
                  </h4>
                  <p
                    className="text-sm text-gray-600 leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: content.definition.cards[0].text }}
                  ></p>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <span className="text-xxs font-black uppercase tracking-wider text-gray-500">
                      {content.definition.cards[0].badge}
                    </span>
                  </div>
                </div>

                <div className="bg-[#3178C6] p-8 rounded-3xl shadow-xl relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={120} />
                  </div>
                  <h4 className="text-xl font-bold mb-4">{content.definition.cards[1].title}</h4>
                  <p
                    className="text-sm text-blue-100 leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: content.definition.cards[1].text }}
                  ></p>
                  <div className="p-4 bg-white/10 rounded-xl border border-white/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#3178C6] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-xxs font-black uppercase tracking-wider text-blue-100">
                      {content.definition.cards[1].badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MATHEMATICS OF ERRORS */}
            <div className="my-24">
              <SectionHeader
                title={content.math.title}
                subtitle={content.math.subtitle}
                align="left"
              />
              <p dangerouslySetInnerHTML={{ __html: content.math.text }}></p>

              <div className="not-prose">
                <CostFixChart />
              </div>
            </div>

            {/* CODE DUEL */}
            <div className="my-24">
              <SectionHeader
                title={content.duel.title}
                subtitle={content.duel.subtitle}
                align="left"
              />
              <p>{content.duel.text}</p>

              <div className="not-prose">
                <CodeDuel />
              </div>
            </div>

            {/* 3 BUSINESS REASONS */}
            <div className="my-24">
              <SectionHeader
                title={content.reasons.title}
                subtitle={content.reasons.subtitle}
                align="left"
              />

              <div className="space-y-8 mt-12 not-prose">
                {content.reasons.cards.map((reason, i) => {
                  const icons = [
                    <TrendingUp key="trend" className="text-blue-500" />,
                    <Users key="users" className="text-emerald-500" />,
                    <Rocket key="rocket" className="text-purple-500" />,
                  ];
                  return (
                    <div
                      key={i}
                      className="flex gap-6 items-start p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#3178C6]/30 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        {React.cloneElement(icons[i] as React.ReactElement<{ size?: number }>, {
                          size: 24,
                        })}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-dark mb-2">{reason.title}</h4>
                        {typeof reason.desc === 'string' ? (
                          <p
                            className="text-sm text-gray-600 leading-relaxed m-0"
                            dangerouslySetInnerHTML={{ __html: reason.desc }}
                          />
                        ) : (
                          <div className="text-sm text-gray-600 leading-relaxed m-0">
                            {reason.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MIT SECTION */}
            <div className="bg-[#F9FAFB] border border-gray-200 rounded-3xl p-8 md:p-12 my-24 not-prose text-center">
              <div className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-6">
                <Zap className="text-[#3178C6]" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-dark mb-6 mt-0">{content.myth.title}</h2>
              <p
                className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-8"
                dangerouslySetInnerHTML={{ __html: content.myth.text }}
              ></p>
              <div className="bg-white px-6 py-4 rounded-full border border-blue-100 shadow-sm inline-block">
                <p className="m-0 text-sm font-bold text-dark">{content.myth.conclusion}</p>
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#3178C6] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{content.cta.title}</h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {content.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-[#3178C6]/20 !bg-[#3178C6] border-none hover:!bg-dark"
                        onClick={() => (window.location.href = '/web-development/custom-app/')}
                      >
                        {content.cta.primaryBtn}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                        size="lg"
                        onClick={() => (window.location.href = '/baza-wiedzy/')}
                      >
                        {content.cta.secondaryBtn}
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <RelatedArticles currentArticleId="typescript-polisa-ubezpieczeniowa" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

export default TypeScriptArticle;
