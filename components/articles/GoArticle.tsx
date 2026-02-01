import React from 'react';
import {
  Cloud,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Server,
  DollarSign,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { GO_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/go';
import {
  GoHeroVisual,
  ResourceEfficiencyVisual,
  GoCodeBlock,
  GoPerformanceComparison,
} from './visuals/GoVisuals';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';

const GoArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'go-golang-jezyk-chmury');

  return (
    <ArticleShell
      id="go-golang-jezyk-chmury"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.quote}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/go.png'}
      icon={Cloud}
      accentColor="#00ADD8"
      heroVisual={<GoHeroVisual />}
      slug="/baza-wiedzy/go-golang-jezyk-chmury"
    >
      <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
        <Server className="text-secondary mt-1 shrink-0" size={20} />
        <div>
          <p
            className="text-sm text-secondary m-0 font-medium"
            dangerouslySetInnerHTML={{ __html: CONTENT.contextBox.text }}
          />
          <a
            href={CONTENT.contextBox.linkUrl}
            className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
          >
            {CONTENT.contextBox.linkText} <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <AnimateOnScroll>
        <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed">
          {CONTENT.lead.text1}
        </p>
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
        <p>{CONTENT.lead.text3}</p>
      </AnimateOnScroll>

      {/* GOROUTINES */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.goroutines.title}
          subtitle={CONTENT.goroutines.subtitle}
          align="left"
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.goroutines.text }} />

        <div className="not-prose">
          <ResourceEfficiencyVisual />
        </div>
      </div>

      {/* BUSINESS ARGUMENTS */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.business.title}
          subtitle={CONTENT.business.subtitle}
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 not-prose">
          {CONTENT.business.cards.map((card, i) => (
            <div
              key={i}
              className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:scale-105 transition-transform duration-300"
            >
              <div
                className={`w-12 h-12 ${i === 0 ? 'bg-green-100 text-green-600' : i === 1 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} rounded-xl flex items-center justify-center mb-6`}
              >
                {i === 0 ? (
                  <DollarSign size={24} />
                ) : i === 1 ? (
                  <Zap size={24} />
                ) : (
                  <CheckCircle2 size={24} />
                )}
              </div>
              <h4 className="font-bold text-lg text-dark mb-2">{card.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* USE CASES */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.useCases.title}
          subtitle={CONTENT.useCases.subtitle}
          align="left"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
          <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
            <h3 className="flex items-center gap-3 font-bold text-emerald-800 text-xl mb-6">
              <CheckCircle2 size={24} /> {CONTENT.useCases.good.title}
            </h3>
            <ul className="space-y-4">
              {CONTENT.useCases.good.items.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-emerald-900">
                  <span className="font-bold">{i + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100">
            <h3 className="flex items-center gap-3 font-bold text-red-800 text-xl mb-6">
              <XCircle size={24} /> {CONTENT.useCases.bad.title}
            </h3>
            <ul className="space-y-4">
              {CONTENT.useCases.bad.items.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-red-900">
                  <span className="font-bold">{i + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.comparison.title}
          subtitle={CONTENT.comparison.subtitle}
          align="left"
        />
        <div className="not-prose">
          <GoPerformanceComparison />
        </div>
      </div>

      {/* TECH CORNER */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.techCorner.title}
          subtitle={CONTENT.techCorner.subtitle}
          align="left"
        />
        <p>{CONTENT.techCorner.text}</p>
        <div className="not-prose">
          <GoCodeBlock />
        </div>
      </div>

      <BaseCta
        icon={TrendingUp}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development/custom-app"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        variant="gradient"
      />
    </ArticleShell>
  );
};

export default GoArticle;
