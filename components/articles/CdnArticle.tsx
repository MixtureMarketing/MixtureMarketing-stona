import React from 'react';
import {
  Globe,
  Zap,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Play,
  CheckCircle2,
  Rocket,
  ShieldAlert,
  Image as ImageIcon,
  FileCode,
  Layout,
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
import { CDN_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/cdn';
import {
  DdosSimulator,
  ImageOptimizerComparison,
  PingCounter,
  GlobalTrafficSimulation,
  EdgeComputingVisual,
  CdnQuiz,
} from './visuals/CdnVisuals';
import Accordion from '../common/Accordion';
import BenefitCard from '../common/BenefitCard';
import TopicLink from '../common/TopicLink';

const ServerLoadChart = React.lazy(() => import('./visuals/charts/ServerLoadChart'));

const CdnArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'cdn-globalna-wydajnosc');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Czym jest CDN i jak przyspiesza ładowanie stron? Dowiedz się, jak Cloudflare i AWS CloudFront poprawiają SEO i chronią przed DDoS.'
        }
        image={articleData?.image}
        article={articleData}
      />

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header & Ping Counter */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Globe size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <div className="flex justify-center mb-8">
              <LazyHydrate whenVisible>
                <PingCounter />
              </LazyHydrate>
            </div>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* Hero Image */}
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/CDN.png"
              alt="Global Content Delivery Network Infrastructure"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>

          {/* Hero Visual */}
          <div className="mb-20">
            <div className="relative bg-[#0F172A] rounded-3xl p-1 border border-gray-800 shadow-2xl overflow-hidden aspect-[21/9] flex items-center justify-center group">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(#61B6DE 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Globe size={400} strokeWidth={0.5} className="text-white animate-spin-slow" />
              </div>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34D399]"></div>
                  <span className="text-white font-mono text-sm tracking-widest">
                    SYSTEM ONLINE: GLOBAL EDGE NETWORK
                  </span>
                </div>
              </div>
            </div>
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-700">
            <AnimateOnScroll>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-12">
                <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                  <span className="text-2xl">🍩</span> {CONTENT.donut.title}
                </h3>
                <p className="mb-4">{CONTENT.donut.text1}</p>
                <p className="mb-0" dangerouslySetInnerHTML={{ __html: CONTENT.donut.text2 }} />
              </div>
            </AnimateOnScroll>

            <SectionHeader
              title={CONTENT.lastMile.title}
              subtitle={CONTENT.lastMile.subtitle}
              centered={false}
              align="left"
            />
            <p>{CONTENT.lastMile.text}</p>

            <div className="mt-12 mb-24">
              <LazyHydrate whenVisible>
                <GlobalTrafficSimulation />
              </LazyHydrate>
            </div>

            {/* NEW SECTION: DDoS & WAF */}
            <SectionHeader
              title={CONTENT.shield.title}
              subtitle={CONTENT.shield.subtitle}
              centered={false}
              align="left"
            />
            <p dangerouslySetInnerHTML={{ __html: CONTENT.shield.text }} />

            <AnimateOnScroll>
              <div className="my-12">
                <LazyHydrate whenVisible>
                  <DdosSimulator />
                </LazyHydrate>
              </div>
            </AnimateOnScroll>

            {/* NEW SECTION: Image Optimization */}
            <SectionHeader
              title={CONTENT.imageOpt.title}
              subtitle={CONTENT.imageOpt.subtitle}
              centered={false}
              align="left"
            />
            <p dangerouslySetInnerHTML={{ __html: CONTENT.imageOpt.text }} />

            <AnimateOnScroll>
              <div className="my-12">
                <LazyHydrate whenVisible>
                  <ImageOptimizerComparison />
                </LazyHydrate>
              </div>
            </AnimateOnScroll>

            {/* NEW SECTION: Edge Computing */}
            <SectionHeader
              title={CONTENT.edge.title}
              subtitle={CONTENT.edge.subtitle}
              centered={false}
              align="left"
            />
            <div className="flex flex-col md:flex-row gap-8 items-center my-12">
              <div className="flex-1">
                <p className="mb-6" dangerouslySetInnerHTML={{ __html: CONTENT.edge.text }} />
                <ul className="space-y-3 not-prose">
                  {CONTENT.edge.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 size={18} className="text-primary" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <LazyHydrate whenVisible>
                  <EdgeComputingVisual />
                </LazyHydrate>
              </div>
            </div>

            {/* NEW SECTION: Interactive Quiz */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.quiz.title}
                subtitle={CONTENT.quiz.subtitle}
                centered={true}
              />
              <LazyHydrate whenVisible>
                <CdnQuiz content={CONTENT.quiz} />
              </LazyHydrate>
            </div>

            {/* BUSINESS REASONS */}
            <div className="mt-24">
              <SectionHeader
                title={CONTENT.business.title}
                subtitle={CONTENT.business.subtitle}
                centered={false}
                align="left"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mt-12">
                {CONTENT.business.items.map((benefit, i) => (
                  <BenefitCard
                    key={i}
                    icon={
                      i === 0 ? (
                        <Zap className="text-amber-500" />
                      ) : i === 1 ? (
                        <TrendingDown className="text-emerald-500" />
                      ) : i === 2 ? (
                        <DollarSign className="text-blue-500" />
                      ) : (
                        <ShieldCheck className="text-purple-500" />
                      )
                    }
                    title={benefit.title}
                    desc={benefit.desc}
                  />
                ))}
              </div>
            </div>

            {/* SERVER LOAD CHART */}
            <div className="mt-24 mb-16">
              <h3 className="text-2xl font-bold text-dark mb-6 text-center">Odciążenie Serwera</h3>
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-lg h-96">
                <React.Suspense
                  fallback={<div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />}
                >
                  <LazyHydrate minHeight="300px">
                    <ServerLoadChart />
                  </LazyHydrate>
                </React.Suspense>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-24">
              <SectionHeader
                title={CONTENT.faq.title}
                subtitle={CONTENT.faq.subtitle}
                centered={true}
              />
              <div className="max-w-3xl mx-auto mb-16 not-prose space-y-4">
                {CONTENT.faq.items.map((item, i) => (
                  <Accordion key={i} title={item.q}>
                    {item.a}
                  </Accordion>
                ))}
              </div>
            </div>

            {/* NEXT STEPS / RELATED TOPICS */}
            <div className="mt-32 not-prose">
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl">
                <h3 className="text-2xl font-bold text-dark mb-8 flex items-center gap-3">
                  <Play className="text-primary fill-current" size={24} /> Czytaj dalej: Eksploruj
                  Infrastrukturę
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TopicLink
                    icon={<ShieldAlert className="text-rose-500" />}
                    title="WAF: Twoja tarcza w Internecie"
                    desc="Jak skutecznie blokować ataki SQL Injection i złośliwe boty?"
                    target="/baza-wiedzy/waf-bezpieczenstwo"
                    status="ready"
                  />
                  <TopicLink
                    icon={<FileCode className="text-blue-500" />}
                    title="Edge Computing: Kod na krańcu"
                    desc="Serverless bez opóźnień. Poznaj Cloudflare Workers i Lambda@Edge."
                    target="/baza-wiedzy/edge-computing"
                    status="ready"
                  />
                  <TopicLink
                    icon={<Layout className="text-emerald-500" />}
                    title="Core Web Vitals in 2025"
                    desc="Kompletna strategia optymalizacji LCP, FID i CLS dla Google."
                    target="/baza-wiedzy/core-web-vitals-2025"
                    status="ready"
                  />
                  <TopicLink
                    icon={<ImageIcon className="text-purple-500" />}
                    title="Formaty jutra: WebP i AVIF"
                    desc="Dlaczego Twoja strona wciąż używa ciężkich plików JPEG?"
                    target="/baza-wiedzy/optymalizacja-obrazow-webp-avif"
                    status="ready"
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-3xl p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                      <Rocket size={40} className="text-white animate-pulse" />
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

            <RelatedArticles currentArticleId="cdn-globalna-wydajnosc" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

export default CdnArticle;
