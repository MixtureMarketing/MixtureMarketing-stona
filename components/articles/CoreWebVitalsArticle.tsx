import React from 'react';
import { BarChart3, CheckCircle2, Gauge } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Image from '../common/Image';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { CWV_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/cwv';
import {
  LighthouseGauge,
  ConversionBoost,
  InpSimulator,
  ClsSimulator,
  MainThreadVisualizer,
  RevenueLossCalculator,
  IcebergDiagram,
  CwvChecklist,
} from './visuals/PerformanceVisuals';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';

const CoreWebVitalsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'core-web-vitals-2025');

  return (
    <ArticleShell
      id="core-web-vitals-2025"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="analytics"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/core-web-vitals.png'}
      icon={BarChart3}
      accentColor="#10B981"
      slug="/baza-wiedzy/core-web-vitals-2025"
      heroVisual={
        <>
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/core-web-vitals.png"
              alt="Core Web Vitals Optimization"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <LighthouseGauge score={98} />
            <ConversionBoost start={1.5} end={3.2} />
          </div>
        </>
      }
    >
      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
      </AnimateOnScroll>

      <SectionHeader
        title={CONTENT.metrics.title}
        subtitle={CONTENT.metrics.subtitle}
        level="h2"
        align="left"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-16">
        <MetricIntroCard
          title={CONTENT.metrics.items[0].title}
          subtitle={CONTENT.metrics.items[0].subtitle}
          desc={CONTENT.metrics.items[0].desc}
          target={CONTENT.metrics.items[0].target}
          color="text-emerald-500"
        />
        <MetricIntroCard
          title={CONTENT.metrics.items[1].title}
          subtitle={CONTENT.metrics.items[1].subtitle}
          desc={CONTENT.metrics.items[1].desc}
          target={CONTENT.metrics.items[1].target}
          color="text-blue-500"
        />
        <MetricIntroCard
          title={CONTENT.metrics.items[2].title}
          subtitle={CONTENT.metrics.items[2].subtitle}
          desc={CONTENT.metrics.items[2].desc}
          target={CONTENT.metrics.items[2].target}
          color="text-purple-500"
        />
      </div>

      {/* SECTION 1: LCP */}
      <h2 className="text-3xl font-bold text-dark mb-6">{CONTENT.lcp.title}</h2>
      <p>{CONTENT.lcp.text}</p>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-12 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle2 size={24} />
        </div>
        <p
          className="text-sm m-0 italic text-gray-700"
          dangerouslySetInnerHTML={{ __html: CONTENT.lcp.solution }}
        />
      </div>

      {/* SECTION 2: CLS SIMULATOR */}
      <h2 className="text-3xl font-bold text-dark mb-6">{CONTENT.cls.title}</h2>
      <p>{CONTENT.cls.text}</p>
      <AnimateOnScroll>
        <div className="my-12">
          <ClsSimulator />
        </div>
      </AnimateOnScroll>

      {/* SECTION 3: INP SIMULATOR */}
      <h2 className="text-3xl font-bold text-dark mb-6">{CONTENT.inp.title}</h2>
      <p dangerouslySetInnerHTML={{ __html: CONTENT.inp.text }} />
      <AnimateOnScroll>
        <div className="my-12">
          <InpSimulator />
        </div>
      </AnimateOnScroll>

      {/* NEW SECTION: MAIN THREAD VISUALIZER */}
      <SectionHeader
        title={CONTENT.mainThread.title}
        subtitle={CONTENT.mainThread.subtitle}
        level="h2"
        align="left"
      />
      <p dangerouslySetInnerHTML={{ __html: CONTENT.mainThread.text }} />
      <AnimateOnScroll>
        <div className="my-12">
          <MainThreadVisualizer />
        </div>
      </AnimateOnScroll>

      {/* BUSINESS VALUE */}
      <SectionHeader
        title={CONTENT.money.title}
        subtitle={CONTENT.money.subtitle}
        level="h2"
        align="left"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose my-12">
        {CONTENT.money.items.map((item, i) => (
          <CaseStudyCard key={i} brand={item.brand} metric={item.metric} result={item.result} />
        ))}
      </div>

      {/* NEW SECTION: REVENUE LOSS CALCULATOR */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.roi.title}
          subtitle={CONTENT.roi.subtitle}
          level="h2"
          centered={true}
        />
        <RevenueLossCalculator />
      </div>

      {/* LAB VS FIELD DATA */}
      <SectionHeader
        title={CONTENT.data.title}
        subtitle={CONTENT.data.subtitle}
        level="h2"
        align="left"
      />
      <p>{CONTENT.data.text}</p>
      <AnimateOnScroll>
        <div className="my-12">
          <IcebergDiagram />
        </div>
      </AnimateOnScroll>

      {/* CHECKLIST */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.checklist.title}
          subtitle={CONTENT.checklist.subtitle}
          level="h2"
          centered={true}
        />
        <CwvChecklist />
      </div>

      <BaseCta
        icon={Gauge}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        variant="dark"
      />
    </ArticleShell>
  );
};

// HELPERS
interface MetricIntroCardProps {
  title: string;
  subtitle: string;
  desc: string;
  target: string;
  color: string;
}

const MetricIntroCard = ({ title, subtitle, desc, target, color }: MetricIntroCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
    <h3 className={`text-2xl font-black mb-1 ${color}`}>{title}</h3>
    <div className="text-xxs font-black text-gray-600 uppercase tracking-widest mb-4">
      {subtitle}
    </div>
    <p className="text-xs text-gray-700 leading-relaxed mb-4">{desc}</p>
    <div className="bg-gray-50 rounded-xl py-2 border border-gray-100">
      <span className="text-xxs font-black text-gray-600 uppercase block mb-1">Target</span>
      <span className="text-sm font-bold text-dark">{target}</span>
    </div>
  </div>
);

interface CaseStudyCardProps {
  brand: string;
  metric: string;
  result: string;
}

const CaseStudyCard = ({ brand, metric, result }: CaseStudyCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center group hover:border-primary transition-all">
    <div className="text-xxs font-black text-primary uppercase tracking-widest mb-2">{brand}</div>
    <div className="text-xl font-bold text-dark mb-1">{metric}</div>
    <div className="text-sm font-bold text-emerald-500">{result}</div>
  </div>
);

export default CoreWebVitalsArticle;
