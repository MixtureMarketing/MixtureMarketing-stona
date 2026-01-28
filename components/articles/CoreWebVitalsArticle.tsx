/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { BarChart3, CheckCircle2, Gauge } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Image from '../common/Image';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
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

const CoreWebVitalsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'core-web-vitals-2025');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'LCP, CLS i INP – poznaj aktualne wskaźniki Core Web Vitals na rok 2025. Dowiedz się, jak UX wpływa na Twoje pozycjonowanie w Google.'
        }
        image={articleData?.image}
        lcpImage="/assets/images/core-web-vitals.png"
        article={articleData}
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <BarChart3 size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
              <LighthouseGauge score={98} />
              <ConversionBoost start={1.5} end={3.2} />
            </div>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* Hero Image */}
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/core-web-vitals.png"
              alt="Core Web Vitals Optimization"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-700">
            <AnimateOnScroll>
              <p
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 bg-gradient-to-r from-[#E0EFFF]/50 to-transparent py-2 rounded-r-xl"
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
                <CaseStudyCard
                  key={i}
                  brand={item.brand}
                  metric={item.metric}
                  result={item.result}
                />
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

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                      <Gauge size={40} className="text-white animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="white"
                        size="lg"
                        className="shadow-xl text-dark hover:bg-gray-100"
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

            <RelatedArticles currentArticleId="core-web-vitals-2025" category="analytics" />
          </article>
        </div>
      </div>
    </div>
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
