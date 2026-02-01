import React from 'react';
import { Rocket, Clock, ShieldCheck, Bot, Workflow, Zap, Check, Truck } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { CICD_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/cicd';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';
import { CiCdHeroVisual, PipelineVisual } from './visuals/CiCdVisuals';

const CiCdArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'ci-cd-automatyzacja');

  return (
    <ArticleShell
      id="ci-cd-automatyzacja"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/CICD.png'}
      icon={Workflow}
      accentColor="#10B981"
      heroVisual={<CiCdHeroVisual />}
      slug="/baza-wiedzy/ci-cd-automatyzacja-wdrozen"
    >
      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
      </AnimateOnScroll>

      {/* WHAT IS THIS ACRONYM */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.definitions.title}
          subtitle={CONTENT.definitions.subtitle}
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 not-prose">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">
                {CONTENT.definitions.items[0].title}
              </h3>
              <div className="text-xs font-bold uppercase text-blue-500 tracking-widest mb-4">
                {CONTENT.definitions.items[0].label}
              </div>
              <p className="text-sm text-gray-600 mb-4">{CONTENT.definitions.items[0].desc}</p>
              <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <Check size={14} /> {CONTENT.definitions.items[0].guarantee}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Truck size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">
                {CONTENT.definitions.items[1].title}
              </h3>
              <div className="text-xs font-bold uppercase text-green-500 tracking-widest mb-4">
                {CONTENT.definitions.items[1].label}
              </div>
              <p className="text-sm text-gray-600 mb-4">{CONTENT.definitions.items[1].desc}</p>
              <div className="bg-blue-50 text-blue-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <Zap size={14} /> {CONTENT.definitions.items[1].guarantee}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VISUALIZATION: PIPELINE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.visualization.title}
          subtitle={CONTENT.visualization.subtitle}
          align="left"
        />
        <p>{CONTENT.visualization.text}</p>

        <div className="my-12">
          <PipelineVisual />
        </div>
      </div>

      {/* 4 BUSINESS REASONS */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.reasons.title}
          subtitle={CONTENT.reasons.subtitle}
          align="left"
        />

        <div className="space-y-6 mt-12 not-prose">
          {CONTENT.reasons.items.map((reason, i) => (
            <div
              key={i}
              className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start group transition-colors`}
            >
              <div
                className={`w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors`}
              >
                {i === 0 ? (
                  <Clock size={24} />
                ) : i === 1 ? (
                  <ShieldCheck size={24} />
                ) : (
                  <Zap size={24} />
                )}
              </div>
              <div>
                <h4 className="font-bold text-dark text-lg mb-2">{reason.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANUAL VS AUTOMATED COMPARISON */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.comparison.title}
          subtitle={CONTENT.comparison.subtitle}
          align="left"
        />

        <div className="my-12 p-4 not-prose overflow-visible">
          <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-2xl">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-dark text-white">
                  <th className="p-6 font-bold uppercase tracking-wider text-xs">
                    {CONTENT.comparison.headers[0]}
                  </th>
                  <th className="p-6 font-bold uppercase tracking-wider text-xs text-center border-x border-white/10">
                    {CONTENT.comparison.headers[1]}
                  </th>
                  <th className="p-6 font-bold uppercase tracking-wider text-xs text-center">
                    {CONTENT.comparison.headers[2]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {CONTENT.comparison.rows.map((row, i) => (
                  <tr key={i}>
                    <td className="p-6 font-bold text-dark bg-gray-50/50">{row.label}</td>
                    <td
                      className={`p-6 text-center text-sm ${i === 1 || i === 3 ? 'text-red-600 font-bold' : 'text-gray-500 italic'}`}
                    >
                      {row.v1}
                    </td>
                    <td className="p-6 text-center text-sm text-emerald-600 font-black bg-emerald-50/30">
                      {row.v2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MYTH BUSTER */}
      <div className="my-24 bg-gradient-to-br from-[#E0EFFF] to-white rounded-[3rem] p-10 border border-[#cce4ff] relative overflow-hidden">
        <div className="absolute right-0 bottom-0 p-12 opacity-10">
          <Bot size={150} />
        </div>
        <div className="relative z-10">
          <SectionHeader title={CONTENT.myth.title} subtitle={CONTENT.myth.subtitle} align="left" />
          <p
            className="text-gray-700 leading-relaxed max-w-2xl"
            dangerouslySetInnerHTML={{ __html: CONTENT.myth.text }}
          />
        </div>
      </div>

      <BaseCta
        icon={Rocket}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#10B981"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default CiCdArticle;
