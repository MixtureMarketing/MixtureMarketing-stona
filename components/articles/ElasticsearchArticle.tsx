import React from 'react';
import { Search, BarChart3, Layers, Database } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import LazyHydrate from '../common/LazyHydrate';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { ELASTICSEARCH_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/elasticsearch';
import {
  ElasticHeroSearch,
  BookIndexAnalogy,
  SearchArchitecture,
  KillerFeaturesInteractive,
} from './visuals/ElasticsearchVisuals';
import ArticleShell from './ArticleShell';
import ArticleContextBox from './shared/ArticleContextBox';
import ArticleComparisonTable from './shared/ArticleComparisonTable';
import BaseCta from '../common/BaseCta';

const ElasticsearchArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'elasticsearch-inteligentna-wyszukiwarka');

  return (
    <ArticleShell
      id="elasticsearch-inteligentna-wyszukiwarka"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/elasticsearch.png'}
      icon={Search}
      accentColor="#F4B400"
      heroVisual={
        <LazyHydrate whenVisible>
          <ElasticHeroSearch />
        </LazyHydrate>
      }
      slug="/baza-wiedzy/elasticsearch-inteligentna-wyszukiwarka-ecommerce"
    >
      <ArticleContextBox
        icon={Database}
        text={CONTENT.contextBox.text}
        linkUrl={CONTENT.contextBox.linkUrl}
        linkText={CONTENT.contextBox.linkText}
      />

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      {/* WHAT IS ELASTICSEARCH */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.whatIs.title}
          subtitle={CONTENT.whatIs.subtitle}
          align="left"
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.whatIs.text }} />

        <div className="not-prose">
          <LazyHydrate whenVisible>
            <BookIndexAnalogy />
          </LazyHydrate>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <ArticleComparisonTable
        title={CONTENT.comparison.title}
        subtitle={CONTENT.comparison.subtitle}
        headers={CONTENT.comparison.headers}
        rows={CONTENT.comparison.rows}
      />

      {/* KILLER FEATURES */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.killerFeatures.title}
          subtitle={CONTENT.killerFeatures.subtitle}
          align="left"
        />
        <p>{CONTENT.killerFeatures.text}</p>

        <div className="not-prose">
          <LazyHydrate whenVisible>
            <KillerFeaturesInteractive />
          </LazyHydrate>
        </div>
      </div>

      {/* ARCHITECTURE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.architecture.title}
          subtitle={CONTENT.architecture.subtitle}
          align="left"
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.architecture.text }} />
        <div className="not-prose">
          <LazyHydrate whenVisible>
            <SearchArchitecture />
          </LazyHydrate>
        </div>
      </div>

      {/* ELK STACK BONUS */}
      <div className="my-24 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BarChart3 size={150} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-widest text-xxs mb-4">
            <Layers size={16} /> Bonus dla IT i Zarządu
          </div>
          <h3 className="text-2xl font-bold text-dark mb-6 mt-0">{CONTENT.elkStack.title}</h3>
          <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl">{CONTENT.elkStack.text}</p>
          <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            {CONTENT.elkStack.badges.map((badge, i) => (
              <span
                key={i}
                className="bg-gray-100 px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <BaseCta
        icon={Search}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development/ecommerce/"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy/"
        accentColor="#F4B400"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default ElasticsearchArticle;
