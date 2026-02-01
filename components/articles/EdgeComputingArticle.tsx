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
import Image from '../common/Image';
import { useModal } from '../../context/ModalContext';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { EDGE_COMPUTING_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/edge-computing';
import {
  LatencySwitcher,
  ArchitectureDiagram,
  SafetySimulator,
  DataFunnel,
  FlipCard,
} from './visuals/EdgeVisuals';
import { BenefitCard, EdgeCodeBlock } from './visuals/EdgeVisualsHelper';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';
import LazyHydrate from '../common/LazyHydrate';

const MarketGrowthChart = React.lazy(() => import('./visuals/charts/MarketGrowthChart'));

const EdgeComputingArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'edge-computing');

  return (
    <ArticleShell
      id="edge-computing"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/edge-computing.png'}
      icon={Zap}
      accentColor="#F59E0B"
      slug="/baza-wiedzy/edge-computing"
      heroVisual={
        <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
          <Image
            src="/assets/images/edge-computing.png"
            alt="Edge Computing and Local Data Processing"
            className="w-full h-[400px] object-cover"
            priority
          />
        </div>
      }
    >
      <div className="flex justify-center mb-8">
        <LatencySwitcher />
      </div>

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

      <BaseCta
        icon={Cpu}
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

export default EdgeComputingArticle;
