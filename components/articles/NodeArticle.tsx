import React from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Globe,
  CheckCircle2,
  ArrowRight,
  Code2,
  Users,
  Radio,
  Video,
  Layout,
  Hexagon,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { NodeHeroVisual, RestaurantAnalogyVisual, NodeWarningTable } from './visuals/NodeVisuals';
import { NODE_ARTICLE_CONTENT } from '../../data/content/articles/node';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';

const NodeArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'nodejs-jeden-jezyk');
  const content = NODE_ARTICLE_CONTENT;

  return (
    <ArticleShell
      id="nodejs-jeden-jezyk"
      title={`${content.header.title.line1}: ${content.header.title.line2}`}
      description={content.header.quote}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData?.image || '/assets/images/nodejs.png'}
      icon={Hexagon}
      accentColor="#339933"
      heroVisual={<NodeHeroVisual />}
      slug="/baza-wiedzy/nodejs-jeden-jezyk"
    >
      <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
        <Server className="text-secondary mt-1 shrink-0" size={20} />
        <div>
          <p className="text-sm text-secondary m-0 font-medium">{content.contextBox.text}</p>
          <Link
            to={content.contextBox.linkUrl}
            className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
          >
            {content.contextBox.linkText} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <AnimateOnScroll>
        <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed">
          {content.lead.text1}
        </p>
        <p dangerouslySetInnerHTML={{ __html: content.lead.text2 }}></p>
      </AnimateOnScroll>

      {/* RESTAURANT ANALOGY */}
      <div className="my-24">
        <SectionHeader
          title={content.eventLoop.title}
          subtitle={content.eventLoop.subtitle}
          align="left"
        />
        <p>{content.eventLoop.text}</p>

        <div className="not-prose">
          <RestaurantAnalogyVisual />
        </div>

        <div className="bg-[#E8F5E9] text-[#2E8B57] p-6 rounded-2xl border border-[#339933]/20 text-center font-bold text-sm not-prose">
          {content.eventLoop.conclusion}
        </div>
      </div>

      {/* BUSINESS ARGUMENT: JS EVERYWHERE */}
      <div className="my-24">
        <SectionHeader
          title={content.jsEverywhere.title}
          subtitle={content.jsEverywhere.subtitle}
          align="left"
        />
        <p className="mb-8" dangerouslySetInnerHTML={{ __html: content.jsEverywhere.text }}></p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
          {content.jsEverywhere.cards.map((card, i) => {
            const icons = [
              <Users key="users" size={24} />,
              <Code2 key="code" size={24} />,
              <Globe key="globe" size={24} />,
            ];
            const bgColors = ['bg-yellow-100', 'bg-blue-100', 'bg-green-100'];
            const textColors = ['text-yellow-600', 'text-blue-600', 'text-green-600'];
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 ${bgColors[i]} rounded-xl flex items-center justify-center ${textColors[i]} mb-4 group-hover:scale-110 transition-transform`}
                >
                  {icons[i]}
                </div>
                <h4 className="font-bold text-dark mb-2">{card.title}</h4>
                <p className="text-xs text-gray-600">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* USE CASES */}
      <div className="my-24">
        <SectionHeader
          title={content.useCases.title}
          subtitle={content.useCases.subtitle}
          align="left"
        />

        <div className="space-y-6 not-prose mt-8">
          {content.useCases.cards.map((card, i) => {
            const icons = [
              <Radio key="radio" size={24} />,
              <Video key="video" size={24} />,
              <Server key="server" size={24} />,
            ];
            const bgColors = ['bg-purple-100', 'bg-red-100', 'bg-orange-100'];
            const textColors = ['text-purple-600', 'text-red-600', 'text-orange-600'];
            return (
              <div
                key={i}
                className="flex gap-6 items-start p-6 bg-white rounded-3xl border border-gray-100"
              >
                <div
                  className={`w-12 h-12 ${bgColors[i]} rounded-full flex items-center justify-center ${textColors[i]} shrink-0`}
                >
                  {icons[i]}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-dark">{card.title}</h4>
                  <p
                    className="text-sm text-gray-600 mt-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: card.desc }}
                  ></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NESTJS */}
      <div className="my-24 bg-[#E0234E]/5 p-8 md:p-12 rounded-[2.5rem] border border-[#E0234E]/10 relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Layout size={150} />
        </div>
        <SectionHeader
          title={content.nestjs.title}
          subtitle={content.nestjs.subtitle}
          align="left"
        />
        <p
          className="text-gray-700 mb-8 max-w-2xl leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.nestjs.text }}
        ></p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E0234E] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#E0234E]/20">
          <CheckCircle2 size={16} /> {content.nestjs.badge}
        </div>
      </div>

      {/* WARNING TABLE */}
      <div className="my-24">
        <SectionHeader
          title={content.warning.title}
          subtitle={content.warning.subtitle}
          align="left"
        />
        <div className="not-prose">
          <NodeWarningTable />
        </div>
      </div>

      <BaseCta
        icon={Hexagon}
        title={content.cta.title}
        description={content.cta.text}
        buttonText={content.cta.primaryBtn}
        buttonLink="/web-development/custom-app/"
        secondaryButtonText={content.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy/"
        accentColor="#339933"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default NodeArticle;
