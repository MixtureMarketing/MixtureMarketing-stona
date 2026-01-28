/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  TrendingUp,
  Target,
  AlertTriangle,
  Bot,
  Settings,
  DollarSign,
  Info,
  Search,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import { ARTICLES } from '../../data/articles';
import { GOOGLE_ADS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/google-ads';
import {
  RoasProfitCalculator,
  AiFunnelDiagram,
  ScalingChecklist,
} from './visuals/MarketingVisuals';

import RelatedArticles from './RelatedArticles';

const GoogleAdsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'google-ads-skalowanie-budzetu');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Poznaj strategię Smart Scaling w Google Ads. Dowiedz się, jak zwiększać budżet, utrzymać rentowność i wykorzystać AI.'
        }
        image={articleData?.image}
        lcpImage="/assets/images/google-ads.png"
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <TrendingUp size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p
              className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: CONTENT.header.subtitle }}
            />
          </header>

          {/* Hero Visual - Engine Analogy */}
          <div className="mb-20">
            <div className="relative bg-[#0F172A] rounded-[2.5rem] p-12 overflow-hidden aspect-[21/9] flex items-center justify-center border border-gray-800 shadow-2xl group">
              <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

              <div className="relative z-10 flex items-center gap-12">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-secondary to-dark rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="absolute inset-0 bg-primary opacity-20 blur-xl animate-pulse"></div>
                    <Settings size={48} className="text-white relative z-10 animate-spin-slow" />
                  </div>
                  <span className="text-xxs font-black uppercase text-gray-700 mt-4 tracking-widest">
                    Twoja Kampania
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="h-1 w-32 bg-gray-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer"></div>
                  </div>
                  <div className="h-1 w-32 bg-gray-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-shimmer delay-500"></div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <DollarSign size={48} className="text-emerald-500" />
                  </div>
                  <span className="text-xxs font-black uppercase text-emerald-500 mt-4 tracking-widest">
                    Skalowanie Zysku
                  </span>
                </div>
              </div>
            </div>
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-700">
            <AnimateOnScroll>
              <p
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-emerald-500 pl-6 py-2 bg-emerald-50/30 rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
            </AnimateOnScroll>

            {/* TWO WAYS SECTION */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.twoWays.title}
                subtitle={CONTENT.twoWays.subtitle}
                level="h2"
                align="left"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-12">
                {CONTENT.twoWays.items.map((item, i) => (
                  <ScalingTypeCard
                    key={i}
                    type={item.type}
                    title={item.title}
                    desc={item.desc}
                    risk={item.risk}
                    suitability={item.suitability}
                  />
                ))}
              </div>
            </div>

            {/* ROAS VS PROFIT CALCULATOR */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.roasVsProfit.title}
                subtitle={CONTENT.roasVsProfit.subtitle}
                level="h2"
                centered={true}
              />
              <p className="text-center mb-12 text-gray-700">{CONTENT.roasVsProfit.text}</p>
              <RoasProfitCalculator />
            </div>

            {/* ALGORITHM TRAP */}
            <div className="bg-dark text-white p-10 rounded-[2.5rem] my-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 mt-0">
                  <AlertTriangle className="text-amber-400" aria-hidden="true" />{' '}
                  {CONTENT.trap.title}
                </h2>
                <p
                  className="text-gray-300 text-lg mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: CONTENT.trap.text }}
                />
                <div className="bg-white/10 border border-white/20 p-6 rounded-2xl">
                  <div className="text-primary font-black uppercase text-xs tracking-widest mb-2">
                    Złota Zasada
                  </div>
                  <p className="m-0 text-white font-bold">{CONTENT.trap.rule}</p>
                </div>
              </div>
            </div>

            {/* BROAD MATCH + AI FUNNEL */}
            <SectionHeader
              title={CONTENT.strategy.title}
              subtitle={CONTENT.strategy.subtitle}
              level="h2"
              align="left"
            />
            <p>{CONTENT.strategy.text}</p>
            <AnimateOnScroll>
              <div className="my-12">
                <AiFunnelDiagram />
              </div>
            </AnimateOnScroll>

            {/* PERFORMANCE MAX SECTION */}
            <div className="mt-24">
              <h2 className="text-3xl font-bold text-dark mb-6 flex items-center gap-3">
                <Bot className="text-primary" aria-hidden="true" /> {CONTENT.pmax.title}
              </h2>
              <p dangerouslySetInnerHTML={{ __html: CONTENT.pmax.text }} />
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Info size={20} aria-hidden="true" />
                </div>
                <p
                  className="text-sm m-0 italic text-gray-700"
                  dangerouslySetInnerHTML={{ __html: CONTENT.pmax.tip }}
                />
              </div>
            </div>

            {/* READINESS CHECKLIST */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.checklist.title}
                subtitle={CONTENT.checklist.subtitle}
                level="h2"
                centered={true}
              />
              <ScalingChecklist />
            </div>

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
                      <Target size={40} className="text-white animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                      <Button
                        variant="white"
                        size="lg"
                        className="shadow-xl text-dark hover:bg-gray-100"
                        onClick={() => (window.location.href = '/marketing/google-ads/')}
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

            {/* RELATED ARTICLES */}
            <RelatedArticles
              currentArticleId="google-ads-skalowanie-budzetu"
              category="marketing"
            />
          </article>
        </div>
      </div>
    </div>
  );
};

interface ScalingTypeCardProps {
  type: 'vertical' | 'horizontal';
  title: string;
  desc: string;
  risk: string;
  suitability: string;
}

const ScalingTypeCard = ({ type, title, desc, risk, suitability }: ScalingTypeCardProps) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${type === 'vertical' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
    >
      {type === 'vertical' ? <Target size={24} /> : <Search size={24} />}
    </div>
    <h3 className="text-xl font-bold text-dark mb-3">{title}</h3>
    <p className="text-sm text-gray-700 mb-6 flex-grow">{desc}</p>
    <div className="space-y-4">
      <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
        <div className="text-xxs font-black uppercase text-rose-600 mb-1">Ryzyko</div>
        <p className="text-xs text-rose-800 m-0 leading-snug">{risk}</p>
      </div>
      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
        <div className="text-xxs font-black uppercase text-emerald-600 mb-1">Kiedy stosować?</div>
        <p className="text-xs text-emerald-800 m-0 leading-snug">{suitability}</p>
      </div>
    </div>
  </div>
);

export default GoogleAdsArticle;
