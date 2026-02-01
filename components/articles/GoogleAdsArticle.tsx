import React from 'react';
import { Target, TrendingUp, AlertTriangle, Bot, Info } from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { GOOGLE_ADS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/google-ads';
import {
  RoasProfitCalculator,
  AiFunnelDiagram,
  ScalingChecklist,
  GoogleAdsHero,
  ScalingTypeCard,
} from './visuals/MarketingVisuals';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';

const GoogleAdsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'google-ads-skalowanie-budzetu');

  return (
    <ArticleShell
      id="google-ads-skalowanie-budzetu"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="marketing"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/google-ads.png'}
      icon={TrendingUp}
      accentColor="#10B981"
      heroVisual={<GoogleAdsHero />}
      slug="/baza-wiedzy/google-ads-skalowanie-budzetu"
    >
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
              type={item.type as 'vertical' | 'horizontal'}
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
            <AlertTriangle className="text-amber-400" aria-hidden="true" /> {CONTENT.trap.title}
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

      <BaseCta
        icon={Target}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/marketing/google-ads/"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy/"
        accentColor="#10B981"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default GoogleAdsArticle;
