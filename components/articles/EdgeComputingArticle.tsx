import React from 'react';
import {
  Zap,
  Timer,
  Wifi,
  ShieldCheck,
  Activity,
  Gamepad2,
  ShoppingCart,
  Factory,
  Globe,
  Cpu,
  Info,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Image from '../common/Image';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import LazyHydrate from '../common/LazyHydrate';
import { ARTICLES } from '../../data/articles';
import { EDGE_COMPUTING_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/edge-computing';
import {
  LatencySwitcher,
  ArchitectureDiagram,
  SafetySimulator,
  DataFunnel,
  FlipCard,
} from './visuals/EdgeVisuals';

const MarketGrowthChart = React.lazy(() => import('./visuals/charts/MarketGrowthChart'));

const EdgeComputingArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'edge-computing');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Czym jest Edge Computing i dlaczego przyszłość należy do przetwarzania brzegowego? Poznaj technologię, która eliminuje opóźnienia chmury.'
        }
        image={articleData?.image}
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Zap size={12} fill="currentColor" />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <div className="flex justify-center mb-8">
              <LatencySwitcher />
            </div>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* Hero Image */}
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/edge-computing.png"
              alt="Edge Computing and Local Data Processing"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-700">
            <AnimateOnScroll>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                  <span className="text-2xl">🍕</span> {CONTENT.analogy.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-secondary font-bold text-sm uppercase mb-2">
                      {CONTENT.analogy.cloud.title}
                    </h3>
                    <p className="text-sm m-0 leading-relaxed">{CONTENT.analogy.cloud.desc}</p>
                  </div>
                  <div>
                    <h3 className="text-primary font-bold text-sm uppercase mb-2">
                      {CONTENT.analogy.edge.title}
                    </h3>
                    <p className="text-sm m-0 leading-relaxed">{CONTENT.analogy.edge.desc}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            <SectionHeader
              title={CONTENT.whatIs.title}
              subtitle={CONTENT.whatIs.subtitle}
              level="h2"
              align="left"
            />
            <p dangerouslySetInnerHTML={{ __html: CONTENT.whatIs.text }} />

            {/* ARCHITECTURE SCHEMA */}
            <div className="my-24">
              <h3 className="text-2xl font-bold text-dark mb-10 text-center">
                {CONTENT.architecture.title}
              </h3>
              <AnimateOnScroll>
                <ArchitectureDiagram />
              </AnimateOnScroll>
            </div>

            {/* NEW SECTION: SAFETY SIMULATOR */}
            <SectionHeader
              title={CONTENT.safety.title}
              subtitle={CONTENT.safety.subtitle}
              level="h2"
              align="left"
            />
            <p>{CONTENT.safety.text}</p>
            <AnimateOnScroll>
              <div className="my-12">
                <SafetySimulator />
              </div>
            </AnimateOnScroll>

            <SectionHeader
              title={CONTENT.benefits.title}
              subtitle={CONTENT.benefits.subtitle}
              level="h2"
              align="left"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-12">
              {CONTENT.benefits.items.map((benefit, i) => (
                <BenefitCard
                  key={i}
                  icon={
                    i === 0 ? (
                      <Timer className="text-rose-500" />
                    ) : i === 1 ? (
                      <Wifi className="text-primary" />
                    ) : i === 2 ? (
                      <ShieldCheck className="text-emerald-500" />
                    ) : (
                      <Activity className="text-purple-500" />
                    )
                  }
                  title={benefit.title}
                  desc={benefit.desc}
                />
              ))}
            </div>

            {/* NEW SECTION: DATA FUNNEL */}
            <SectionHeader
              title={CONTENT.funnel.title}
              subtitle={CONTENT.funnel.subtitle}
              level="h2"
              align="left"
            />
            <p>{CONTENT.funnel.text}</p>
            <AnimateOnScroll>
              <div className="my-12">
                <DataFunnel />
              </div>
            </AnimateOnScroll>

            {/* USE CASES - FLIP CARDS */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.useCases.title}
                subtitle={CONTENT.useCases.subtitle}
                level="h2"
                centered={true}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 not-prose mt-12">
                {CONTENT.useCases.items.map((item, i) => (
                  <FlipCard
                    key={i}
                    icon={
                      i === 0 ? (
                        <Gamepad2 />
                      ) : i === 1 ? (
                        <ShoppingCart />
                      ) : i === 2 ? (
                        <Factory />
                      ) : (
                        <Globe />
                      )
                    }
                    title={item.title}
                    desc={item.desc}
                  />
                ))}
              </div>
            </div>

            {/* TECH CORNER */}
            <div className="mt-24">
              <SectionHeader
                title={CONTENT.tech.title}
                subtitle={CONTENT.tech.subtitle}
                level="h2"
                align="left"
              />
              <p className="mb-8">{CONTENT.tech.text}</p>
              <EdgeCodeBlock />
            </div>

            {/* MARKET GROWTH CHART */}
            <div className="mt-24 mb-16">
              <SectionHeader
                title={CONTENT.market.title}
                subtitle={CONTENT.market.subtitle}
                level="h2"
                centered={true}
              />
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl h-96 mt-12">
                <React.Suspense
                  fallback={<div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />}
                >
                  <LazyHydrate minHeight="300px">
                    <MarketGrowthChart />
                  </LazyHydrate>
                </React.Suspense>
              </div>
              <p className="text-center text-sm text-gray-600 mt-6 italic">{CONTENT.market.text}</p>
            </div>

            {/* SUMMARY */}
            <div className="bg-[#F1F5F9] p-10 rounded-3xl border border-gray-200 my-24">
              <h3 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
                <Info className="text-primary" aria-hidden="true" /> {CONTENT.summary.title}
              </h3>
              <p className="m-0" dangerouslySetInnerHTML={{ __html: CONTENT.summary.text }} />
            </div>

            {/* CTA */}
            <AnimateOnScroll>
              <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                    <Cpu size={40} className="text-primary animate-pulse" />
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

            <RelatedArticles currentArticleId="edge-computing" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

// HELPERS
const BenefitCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
    <div
      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-xl"
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
  </div>
);

const EdgeCodeBlock = () => {
  return (
    <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 not-prose">
      <div className="bg-[#252526] px-4 py-3 border-b border-[#333] flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <span className="text-gray-600 text-xxs font-bold uppercase tracking-widest">
          cloudflare-worker.js
        </span>
      </div>
      <div className="p-6 font-mono text-sm overflow-x-auto">
        <pre>
          <code className="text-gray-300">
            {`export default {
  async fetch(request, env) {
    // Ta funkcja uruchomi się w lokalizacji 
    // najbliższej użytkownika (np. w Warszawie).
    
    const country = request.cf.country;
    
    if (country === 'PL') {
      return new Response("Cześć! Witamy lokalnie!");
    }
    
    return new Response("Hello global user!");
  },
};`}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default EdgeComputingArticle;
