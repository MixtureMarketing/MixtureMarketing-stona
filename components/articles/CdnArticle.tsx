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

import { useModal } from '../../context/ModalContext';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { CDN_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/cdn';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import TopicLink from '../common/TopicLink';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';
import LazyHydrate from '../common/LazyHydrate';
import Image from '../common/Image';
import BenefitCard from '../common/BenefitCard';
import Accordion from '../common/Accordion';

import {
  PingCounter,
  GlobalTrafficSimulation,
  DdosSimulator,
  ImageOptimizerComparison,
  EdgeComputingVisual,
  CdnQuiz,
} from './visuals/CdnVisuals';

const ServerLoadChart = React.lazy(() => import('./visuals/charts/ServerLoadChart'));

const CdnArticle = () => {
  const { openModal } = useModal(); // Added useModal hook as it was missing in original but used in CTA
  const articleData = ARTICLES.find((a) => a.id === 'cdn-globalna-wydajnosc');

  return (
    <ArticleShell
      id="cdn-globalna-wydajnosc"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/CDN.png'}
      icon={Globe}
      accentColor="#0EA5E9"
      heroVisual={
        <>
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/CDN.png"
              alt="Global Content Delivery Network Infrastructure"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>
          <div className="mb-20">
            <CdnHeroVisual />
          </div>
        </>
      }
      slug="/baza-wiedzy/cdn-globalna-wydajnosc"
    >
      <div className="flex justify-center mb-8 not-prose">
        <LazyHydrate whenVisible>
          <PingCounter />
        </LazyHydrate>
      </div>

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
        <SectionHeader title={CONTENT.faq.title} subtitle={CONTENT.faq.subtitle} centered={true} />
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

      <BaseCta
        icon={Rocket}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        onClick={() => openModal('consultation')}
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        variant="dark"
      />
    </ArticleShell>
  );
};

const CdnHeroVisual = () => (
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
);

export default CdnArticle;
