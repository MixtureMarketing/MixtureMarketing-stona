import React, { useState } from 'react';
import {
  Cloud,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Server,
  DollarSign,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { GO_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/go';
import {
  GoHeroVisual,
  ResourceEfficiencyVisual,
  GoCodeBlock,
  GoPerformanceComparison,
} from './visuals/GoVisuals';

const GoArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'go-golang-jezyk-chmury');
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
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#00ADD8]/20 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Poznaj język stworzony przez Google. Dowiedz się, jak Goroutines obniżają koszty chmury i dlaczego Go jest idealny do systemów High-Load.'
        }
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-dark via-[#00ADD8] to-dark shadow-[0_0_10px_rgba(0,173,216,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FA] text-[#0088AA] text-xs font-bold uppercase tracking-wider mb-8 border border-[#00ADD8]/20">
              <Cloud size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark via-[#00ADD8] to-dark">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium italic border-l-4 border-[#00ADD8] pl-6 py-2 bg-sky-50/30 rounded-r-xl">
              {CONTENT.header.quote}
            </p>
          </header>

          {/* HERO VISUAL */}
          <div className="mb-20">
            <GoHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#00ADD8] hover:prose-a:text-[#0088AA] prose-strong:text-dark prose-li:text-gray-700">
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
              <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed">
                {CONTENT.lead.text1}
              </p>
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
              <p>{CONTENT.lead.text3}</p>
            </AnimateOnScroll>

            {/* GOROUTINES */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.goroutines.title}
                subtitle={CONTENT.goroutines.subtitle}
                align="left"
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.goroutines.text }} />

              <div className="not-prose">
                <ResourceEfficiencyVisual />
              </div>
            </div>

            {/* BUSINESS ARGUMENTS */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.business.title}
                subtitle={CONTENT.business.subtitle}
                align="left"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 not-prose">
                {CONTENT.business.cards.map((card, i) => (
                  <div
                    key={i}
                    className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:scale-105 transition-transform duration-300"
                  >
                    <div
                      className={`w-12 h-12 ${i === 0 ? 'bg-green-100 text-green-600' : i === 1 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} rounded-xl flex items-center justify-center mb-6`}
                    >
                      {i === 0 ? (
                        <DollarSign size={24} />
                      ) : i === 1 ? (
                        <Zap size={24} />
                      ) : (
                        <CheckCircle2 size={24} />
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-dark mb-2">{card.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* USE CASES */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.useCases.title}
                subtitle={CONTENT.useCases.subtitle}
                align="left"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                  <h3 className="flex items-center gap-3 font-bold text-emerald-800 text-xl mb-6">
                    <CheckCircle2 size={24} /> {CONTENT.useCases.good.title}
                  </h3>
                  <ul className="space-y-4">
                    {CONTENT.useCases.good.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-emerald-900">
                        <span className="font-bold">{i + 1}.</span>
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100">
                  <h3 className="flex items-center gap-3 font-bold text-red-800 text-xl mb-6">
                    <XCircle size={24} /> {CONTENT.useCases.bad.title}
                  </h3>
                  <ul className="space-y-4">
                    {CONTENT.useCases.bad.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-red-900">
                        <span className="font-bold">{i + 1}.</span>
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* COMPARISON TABLE */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.comparison.title}
                subtitle={CONTENT.comparison.subtitle}
                align="left"
              />
              <div className="not-prose">
                <GoPerformanceComparison />
              </div>
            </div>

            {/* TECH CORNER */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.techCorner.title}
                subtitle={CONTENT.techCorner.subtitle}
                align="left"
              />
              <p>{CONTENT.techCorner.text}</p>
              <div className="not-prose">
                <GoCodeBlock />
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-[#00ADD8] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-dark rounded-full blur-[100px] opacity-10"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <TrendingUp size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                    <p className="text-white/90 mb-10 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-[#213261]/20 !bg-dark border-none text-white hover:!bg-white hover:!text-dark"
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

            <RelatedArticles currentArticleId="go-golang-jezyk-chmury" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

export default GoArticle;
