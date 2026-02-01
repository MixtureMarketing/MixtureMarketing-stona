import React from 'react';
import {
  Timer,
  Rocket,
  ShieldCheck,
  Briefcase,
  Layers,
  CheckCircle2,
  Server,
  Cloud,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { LARAVEL_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/laravel';
import {
  LaravelHeroVisual,
  LaravelEcosystemMap,
  EloquentComparison,
  LaravelPerformanceChart,
} from './visuals/LaravelVisuals';
import ArticleShell from './ArticleShell';
import ArticleContextBox from './shared/ArticleContextBox';
import ArticleComparisonTable from './shared/ArticleComparisonTable';
import ArticleUseCases from './shared/ArticleUseCases';
import BaseCta from '../common/BaseCta';

const LaravelArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'laravel-php-framework-szybkie-wdrozenie');

  return (
    <ArticleShell
      id="laravel-php-framework-szybkie-wdrozenie"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.quote}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/laravel.png'}
      icon={Timer}
      accentColor="#FF2D20"
      heroVisual={<LaravelHeroVisual />}
      slug="/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie"
    >
      <ArticleContextBox
        icon={Server}
        text={CONTENT.contextBox.text}
        linkUrl={CONTENT.contextBox.linkUrl}
        linkText={CONTENT.contextBox.linkText}
      />

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
      </AnimateOnScroll>

      {/* MAGIC OF ECOSYSTEM */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.ecosystem.title}
          subtitle={CONTENT.ecosystem.subtitle}
          align="left"
        />
        <p>{CONTENT.ecosystem.text}</p>

        <div className="not-prose">
          <LaravelEcosystemMap />
        </div>

        <div className="bg-[#FFF0F0] text-[#D82015] p-6 rounded-2xl border border-[#FF2D20]/20 text-center font-bold text-sm not-prose">
          {CONTENT.ecosystem.verdict}
        </div>
      </div>

      {/* ELOQUENT ORM */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.eloquent.title}
          subtitle={CONTENT.eloquent.subtitle}
          align="left"
        />
        <p>{CONTENT.eloquent.text}</p>

        <div className="not-prose">
          <EloquentComparison />
        </div>
      </div>

      {/* SECURITY */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.security.title}
          subtitle={CONTENT.security.subtitle}
          align="left"
        />
        <p>{CONTENT.security.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 not-prose">
          {CONTENT.security.cards.map((card, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <ShieldCheck className="text-[#059669] mb-4" size={32} />
              <h4 className="font-bold text-dark mb-2">{card.title}</h4>
              <p className="text-xs text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PERFORMANCE: OCTANE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.performance.title}
          subtitle={CONTENT.performance.subtitle}
          align="left"
        />
        <p>{CONTENT.performance.text}</p>

        <div className="not-prose">
          <LaravelPerformanceChart />
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <ArticleComparisonTable
        title={CONTENT.comparison.title}
        subtitle={CONTENT.comparison.subtitle}
        headers={CONTENT.comparison.headers}
        rows={CONTENT.comparison.rows}
      />

      {/* USE CASES */}
      <ArticleUseCases
        title={CONTENT.useCases.title}
        accentColor="#FF2D20"
        items={[
          { ...CONTENT.useCases.items[0], icon: <Cloud size={20} /> },
          { ...CONTENT.useCases.items[1], icon: <Briefcase size={20} /> },
          { ...CONTENT.useCases.items[2], icon: <Layers size={20} /> },
          { ...CONTENT.useCases.items[3], icon: <CheckCircle2 size={20} /> },
        ]}
      />

      <BaseCta
        icon={Rocket}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development/custom-app"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#FF2D20"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default LaravelArticle;
