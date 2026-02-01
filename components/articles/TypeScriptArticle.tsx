import React from 'react';
import {
  ShieldCheck,
  Zap,
  Code2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Rocket,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { TypeScriptScanner, CostFixChart, CodeDuel } from './visuals/TypeScriptVisuals';
import { TYPESCRIPT_ARTICLE_CONTENT } from '../../data/content/articles/typescript';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';

const TypeScriptArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'typescript-polisa-ubezpieczeniowa');
  const content = TYPESCRIPT_ARTICLE_CONTENT;

  return (
    <ArticleShell
      id="typescript-polisa-ubezpieczeniowa"
      title={`${content.header.title.line1} ${content.header.title.line2}`}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData?.image || '/assets/images/typescript.png'}
      icon={ShieldCheck}
      accentColor="#3178C6"
      heroVisual={<TypeScriptScanner />}
      slug="/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu"
    >
      <AnimateOnScroll>
        <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-[#3178C6] pl-6 py-2 bg-blue-50/30 rounded-r-xl">
          {content.lead.highlight}
        </p>
        <p dangerouslySetInnerHTML={{ __html: content.lead.text }}></p>
      </AnimateOnScroll>

      {/* WHAT IS TS */}
      <div className="my-24">
        <SectionHeader
          title={content.definition.title}
          subtitle={content.definition.subtitle}
          align="left"
        />
        <p dangerouslySetInnerHTML={{ __html: content.definition.text }}></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Code2 size={120} />
            </div>
            <h4 className="text-xl font-bold text-dark mb-4">
              {content.definition.cards[0].title}
            </h4>
            <p
              className="text-sm text-gray-600 leading-relaxed mb-6"
              dangerouslySetInnerHTML={{ __html: content.definition.cards[0].text }}
            ></p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </div>
              <span className="text-xxs font-black uppercase tracking-wider text-gray-500">
                {content.definition.cards[0].badge}
              </span>
            </div>
          </div>

          <div className="bg-[#3178C6] p-8 rounded-3xl shadow-xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck size={120} />
            </div>
            <h4 className="text-xl font-bold mb-4">{content.definition.cards[1].title}</h4>
            <p
              className="text-sm text-blue-100 leading-relaxed mb-6"
              dangerouslySetInnerHTML={{ __html: content.definition.cards[1].text }}
            ></p>
            <div className="p-4 bg-white/10 rounded-xl border border-white/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-[#3178C6] flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-xxs font-black uppercase tracking-wider text-blue-100">
                {content.definition.cards[1].badge}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MATHEMATICS OF ERRORS */}
      <div className="my-24">
        <SectionHeader title={content.math.title} subtitle={content.math.subtitle} align="left" />
        <p dangerouslySetInnerHTML={{ __html: content.math.text }}></p>

        <div className="not-prose">
          <CostFixChart />
        </div>
      </div>

      {/* CODE DUEL */}
      <div className="my-24">
        <SectionHeader title={content.duel.title} subtitle={content.duel.subtitle} align="left" />
        <p>{content.duel.text}</p>

        <div className="not-prose">
          <CodeDuel />
        </div>
      </div>

      {/* 3 BUSINESS REASONS */}
      <div className="my-24">
        <SectionHeader
          title={content.reasons.title}
          subtitle={content.reasons.subtitle}
          align="left"
        />

        <div className="space-y-8 mt-12 not-prose">
          {content.reasons.cards.map((reason, i) => {
            const icons = [
              <TrendingUp key="trend" className="text-blue-500" />,
              <Users key="users" className="text-emerald-500" />,
              <Rocket key="rocket" className="text-purple-500" />,
            ];
            return (
              <div
                key={i}
                className="flex gap-6 items-start p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#3178C6]/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  {React.cloneElement(icons[i] as React.ReactElement<{ size?: number }>, {
                    size: 24,
                  })}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-dark mb-2">{reason.title}</h4>
                  {typeof reason.desc === 'string' ? (
                    <p
                      className="text-sm text-gray-600 leading-relaxed m-0"
                      dangerouslySetInnerHTML={{ __html: reason.desc }}
                    />
                  ) : (
                    <div className="text-sm text-gray-600 leading-relaxed m-0">{reason.desc}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MIT SECTION */}
      <div className="bg-[#F9FAFB] border border-gray-200 rounded-3xl p-8 md:p-12 my-24 not-prose text-center">
        <div className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-6">
          <Zap className="text-[#3178C6]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-dark mb-6 mt-0">{content.myth.title}</h2>
        <p
          className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-8"
          dangerouslySetInnerHTML={{ __html: content.myth.text }}
        ></p>
        <div className="bg-white px-6 py-4 rounded-full border border-blue-100 shadow-sm inline-block">
          <p className="m-0 text-sm font-bold text-dark">{content.myth.conclusion}</p>
        </div>
      </div>

      <BaseCta
        icon={ShieldCheck}
        title={content.cta.title}
        description={content.cta.text}
        buttonText={content.cta.primaryBtn}
        buttonLink="/web-development/custom-app/"
        secondaryButtonText={content.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy/"
        accentColor="#3178C6"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default TypeScriptArticle;
