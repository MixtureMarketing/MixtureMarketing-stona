/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Layout, Palette, ArrowRight, Zap } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { FRONTEND_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/frontend';
import {
  FrontendHeroVisual,
  FrontendArchitectureVisual,
  TechCardsVisual,
  FrontendComparisonTable,
  DecisionTreeVisual,
} from './visuals/FrontendVisuals';

const FrontendArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'frontend-kompendium-2025');
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
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] selection:bg-blue-500/20 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'React, Next.js, Vue czy Tailwind? Przewodnik po technologiach frontendowych. Dowiedz się, co wybrać dla e-commerce, a co dla MVP.'
        }
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-8 border border-blue-100">
              <Layout size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-[#0F172A] leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium italic border-l-4 border-blue-500 pl-6 py-2 bg-blue-50/30 rounded-r-xl">
              {CONTENT.header.quote}
            </p>
          </header>

          {/* HERO VISUAL */}
          <div className="mb-20">
            <FrontendHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-[#0F172A] prose-headings:font-bold prose-p:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:text-[#0F172A] prose-li:text-gray-600">
            <AnimateOnScroll>
              <p className="lead text-2xl text-[#334155] mb-12 font-medium leading-relaxed">
                {CONTENT.lead.text1}
              </p>
              <p>{CONTENT.lead.text2}</p>
            </AnimateOnScroll>

            {/* PART 1: FOUNDATIONS */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.part1.title}
                subtitle={CONTENT.part1.subtitle}
                align="left"
              />
              <p>{CONTENT.part1.text}</p>

              <div className="not-prose">
                <FrontendArchitectureVisual />
              </div>
            </div>

            {/* PART 2: TECH COMPARISON */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.part2.title}
                subtitle={CONTENT.part2.subtitle}
                align="left"
              />
              <p>{CONTENT.part2.text}</p>

              <div className="not-prose">
                <TechCardsVisual />
              </div>
            </div>

            {/* PART 3: TAILWIND */}
            <div className="my-24 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-8 rounded-[2rem] border border-cyan-100 not-prose relative overflow-hidden">
              <div className="absolute right-0 top-0 p-12 opacity-10">
                <Palette size={120} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <Palette className="text-cyan-500" /> {CONTENT.part3.title}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl">{CONTENT.part3.text}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CONTENT.part3.cards.map((card, i) => (
                  <div
                    key={i}
                    className="bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-white/20"
                  >
                    <h5 className="font-bold text-slate-700 text-sm mb-1">{card.title}</h5>
                    <p className="text-xs text-slate-500">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PART 4: MATRIX */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.part4.title}
                subtitle={CONTENT.part4.subtitle}
                align="left"
              />
              <div className="not-prose">
                <FrontendComparisonTable />
              </div>
            </div>

            {/* PART 5: DECISION PATH */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.part5.title}
                subtitle={CONTENT.part5.subtitle}
                align="left"
              />
              <p>{CONTENT.part5.text}</p>
              <div className="not-prose">
                <DecisionTreeVisual />
              </div>
            </div>

            {/* PART 6: WHY NEXT.JS */}
            <div className="my-24 bg-black text-white p-10 rounded-[2.5rem] relative overflow-hidden not-prose shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Zap className="text-yellow-400" /> {CONTENT.part6.title}
                </h3>
                <p
                  className="text-gray-300 mb-8 leading-relaxed max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: CONTENT.part6.text }}
                />
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-white/10 p-6 rounded-2xl border border-white/10">
                    <div className="text-xs font-mono text-gray-400 mb-2">
                      {CONTENT.part6.react.label}
                    </div>
                    <div className="text-xl font-bold text-[#61DAFB] mb-2">
                      {CONTENT.part6.react.title}
                    </div>
                    <p className="text-xs text-gray-400">{CONTENT.part6.react.desc}</p>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ArrowRight />
                  </div>
                  <div className="flex-1 bg-white p-6 rounded-2xl border border-white text-black">
                    <div className="text-xs font-mono text-gray-500 mb-2">
                      {CONTENT.part6.next.label}
                    </div>
                    <div className="text-xl font-bold mb-2">{CONTENT.part6.next.title}</div>
                    <p className="text-xs text-gray-600">{CONTENT.part6.next.desc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Palette size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">
                      {CONTENT.cta.title}
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-blue-500/20 !bg-blue-600 border-none text-white hover:!bg-blue-500"
                        onClick={() => (window.location.href = '/contact')}
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

            <RelatedArticles currentArticleId="frontend-kompendium-2025" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

export default FrontendArticle;
