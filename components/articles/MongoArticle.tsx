import React from 'react';
import {
  FileJson,
  Layers,
  Zap,
  Infinity as InfinityIcon,
  ShoppingCart,
  Database,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { MONGO_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/mongo';
import { MongoHeroVisual, CarGarageAnalogy, ShardingSimulator } from './visuals/MongoVisuals';
import ArticleShell from './ArticleShell';
import ArticleContextBox from './shared/ArticleContextBox';
import ArticleComparisonTable from './shared/ArticleComparisonTable';
import ArticleUseCases from './shared/ArticleUseCases';
import BaseCta from '../common/BaseCta';

const MongoArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'mongodb-przyszlosc-big-data');

  return (
    <ArticleShell
      id="mongodb-przyszlosc-big-data"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/mongodb.png'}
      icon={Database}
      accentColor="#00ED64"
      heroVisual={<MongoHeroVisual />}
      slug="/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji"
    >
      <ArticleContextBox
        icon={Database}
        text={CONTENT.contextBox.text}
        linkUrl={CONTENT.contextBox.linkUrl}
        linkText={CONTENT.contextBox.linkText}
      />

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-[#00684A] mb-12 font-medium leading-relaxed border-l-4 border-[#00ED64] pl-6 py-2 bg-emerald-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      {/* DOCUMENTS VS ROWS */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.documents.title}
          subtitle={CONTENT.documents.subtitle}
          align="left"
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.documents.text }} />

        <div className="not-prose">
          <CarGarageAnalogy />
        </div>
      </div>

      {/* CODE PREVIEW */}
      <div className="my-24 bg-[#0B1120] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ED64] rounded-full blur-[100px] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-[#00ED64] font-bold uppercase tracking-widest text-xxs mb-6">
            <FileJson size={16} /> {CONTENT.code.title}
          </div>
          <div className="bg-black/40 rounded-xl p-6 font-mono text-xs md:text-sm text-[#A6ACCD] border border-white/5 shadow-inner">
            <pre className="overflow-x-auto text-emerald-400">
              <code>{`// MongoDB: Wszystko w jednym miejscu
{
  "_id": "user_123",
  "name": "Jan Kowalski",
  "contact": {
    "email": "jan@example.com",
    "phone": "+48 123 456 789"
  },
  "orders": [
    { "order_id": "A1", "total": 150 },
    { "order_id": "B2", "total": 300 }
  ]
}`}</code>
            </pre>
          </div>
          <p className="mt-6 text-gray-400 text-sm italic">{CONTENT.code.text}</p>
        </div>
      </div>

      {/* 3 BUSINESS REASONS */}
      <ArticleUseCases
        title={CONTENT.reasons.title}
        accentColor="#00ED64"
        items={[
          { ...CONTENT.reasons.items[0], icon: <Zap size={24} /> },
          { ...CONTENT.reasons.items[1], icon: <Layers size={24} /> },
          { ...CONTENT.reasons.items[2], icon: <InfinityIcon size={24} /> },
        ]}
      />

      {/* SHARDING SIMULATOR */}
      <div className="my-24">
        <ShardingSimulator />
      </div>

      {/* COMPARISON TABLE */}
      <ArticleComparisonTable
        title={CONTENT.comparison.title}
        subtitle={CONTENT.comparison.subtitle}
        headers={CONTENT.comparison.headers}
        rows={CONTENT.comparison.rows}
      />

      {/* CASE STUDY: E-COMMERCE */}
      <div className="my-24 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShoppingCart size={150} />
        </div>
        <SectionHeader
          title={CONTENT.caseStudy.title}
          subtitle={CONTENT.caseStudy.subtitle}
          align="left"
        />
        <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">{CONTENT.caseStudy.text}</p>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
          <p
            className="m-0 text-emerald-900 font-medium"
            dangerouslySetInnerHTML={{ __html: CONTENT.caseStudy.verdict }}
          />
        </div>
      </div>

      {/* MERN STACK */}
      <div className="my-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-6">{CONTENT.mern.title}</h2>
            <p
              className="text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: CONTENT.mern.text1 }}
            />
            <p
              className="text-gray-600 leading-relaxed mt-4"
              dangerouslySetInnerHTML={{ __html: CONTENT.mern.text2 }}
            />
          </div>
          <div className="flex justify-center">
            <div className="relative w-48 h-48 bg-[#0F172A] rounded-full flex items-center justify-center border-4 border-[#00ED64]/30 shadow-2xl">
              <div className="text-center">
                <div className="text-[#00ED64] text-5xl font-black mb-1">M</div>
                <div className="text-white text-xxs font-bold tracking-widest uppercase">
                  MERN STACK
                </div>
              </div>
              {/* Rotating Orbit */}
              <div className="absolute inset-[-20px] border-2 border-dashed border-gray-200 rounded-full animate-spin-slow opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      <BaseCta
        icon={Database}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development/custom-app"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#001E2B"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default MongoArticle;
