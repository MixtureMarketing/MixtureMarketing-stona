import React from 'react';
import { Zap, CheckCircle2, Code2, Layout, Globe, Heart, Box } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { VUE_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/vue';
import ArticleUseCases from './shared/ArticleUseCases';
import ArticleShell from './ArticleShell';
import ArticleContextBox from './shared/ArticleContextBox';
import ArticleComparisonTable from './shared/ArticleComparisonTable';
import {
  VueHeroVisual,
  FrameworkSpectrum,
  ProgressiveScalingVisual,
  VueSfcPreview,
} from './visuals/VueVisuals';
import BaseCta from '../common/BaseCta';

const VueArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'vue-js-harmonijny-kompromis');
  const content = CONTENT;

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData.image}
      icon={Heart}
      accentColor="#42B883"
      heroVisual={<VueHeroVisual />}
      slug="/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular"
    >
      <ArticleContextBox
        icon={Layout}
        text={`<p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">${content.contextBox.title}</p><h4 className="text-lg font-bold text-dark mb-2">${content.contextBox.subtitle}</h4><p className="text-sm text-gray-600 mb-3">${content.contextBox.text}</p>`}
        linkUrl={content.contextBox.linkUrl}
        linkText={content.contextBox.linkText}
      />

      <AnimateOnScroll>
        <p className="lead text-2xl text-[#35495E] mb-12 font-medium leading-relaxed border-l-4 border-[#42B883] pl-6 py-2 bg-emerald-50/30 rounded-r-xl">
          {content.lead.highlight}
        </p>
        <p>{content.lead.text}</p>
      </AnimateOnScroll>

      <div className="my-32">
        <SectionHeader
          title={content.spectrum.title}
          subtitle={content.spectrum.subtitle}
          align="center"
        />
        <p className="text-center max-w-2xl mx-auto mb-12">{content.spectrum.text}</p>
        <div className="not-prose">
          <FrameworkSpectrum />
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={content.progressive.title}
          subtitle={content.progressive.subtitle}
          align="left"
        />
        <p>{content.progressive.text}</p>
        <div className="not-prose mt-12">
          <ProgressiveScalingVisual />
        </div>
      </div>

      <ArticleUseCases
        title={content.businessReasons.title}
        accentColor="#42B883"
        items={[
          { ...content.businessReasons.cards[0], icon: <Box size={32} /> },
          { ...content.businessReasons.cards[1], icon: <Zap size={32} /> },
          { ...content.businessReasons.cards[2], icon: <Box size={32} /> },
        ]}
      />

      <div className="my-32">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <SectionHeader
              title={content.techCorner.title}
              subtitle={content.techCorner.subtitle}
              align="left"
            />
            {content.techCorner.text.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }}></p>
            ))}
          </div>
          <div className="flex-1 w-full not-prose">
            <VueSfcPreview />
          </div>
        </div>
      </div>

      <div className="my-32 bg-white p-8 md:p-16 rounded-[3rem] border border-emerald-100 shadow-xl relative overflow-hidden not-prose group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Globe size={200} className="text-emerald-900" />
        </div>
        <div className="relative z-10">
          <SectionHeader title={content.nuxt.title} subtitle={content.nuxt.subtitle} align="left" />
          <p
            className="text-gray-600 mb-8 max-w-2xl leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: content.nuxt.text }}
          ></p>
          <div className="flex wrap gap-4">
            {content.nuxt.badges.map((badge, i) => (
              <div
                key={i}
                className="bg-emerald-50 text-emerald-800 px-5 py-3 rounded-2xl text-sm font-bold border border-emerald-200 flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 size={18} className="text-[#42B883]" /> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ArticleComparisonTable
        title={content.comparison.title}
        subtitle={content.comparison.subtitle}
        headers={content.comparison.headers}
        rows={content.comparison.rows}
      />

      <BaseCta
        icon={Code2}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development/custom-app"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#42B883"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default VueArticle;
