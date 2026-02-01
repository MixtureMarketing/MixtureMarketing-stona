import React from 'react';
import { ImageIcon, Zap, TrendingUp, Smartphone, Scale } from 'lucide-react';

import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { IMAGE_FORMATS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/image-formats';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import LazyHydrate from '../common/LazyHydrate';
import {
  ImageComparisonDuel,
  BrowserSupportChart,
  CodeBlockImplementation,
  LoadingSimulator,
  ImageSeoChecklist,
  ImageFormatsHero,
  ValueCard,
} from './visuals/ImageFormatsVisuals';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';

const ImageFormatsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'optymalizacja-obrazow-webp-avif');

  return (
    <ArticleShell
      id="optymalizacja-obrazow-webp-avif"
      title={articleData?.title || `${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={
        articleData?.description ||
        'Poznaj WebP i AVIF – nowoczesne formaty graficzne, które zmniejszą wagę Twojej strony o 80% bez utraty jakości.'
      }
      category="design"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/frontend.png'}
      icon={ImageIcon}
      accentColor="#61B6DE"
      slug="/baza-wiedzy/optymalizacja-obrazow-webp-avif"
      heroVisual={<ImageFormatsHero />}
    >
      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
      </AnimateOnScroll>

      <SectionHeader
        title={CONTENT.definitions.title}
        subtitle={CONTENT.definitions.subtitle}
        centered={false}
        align="left"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-16">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-dark mb-4">{CONTENT.definitions.webp.title}</h3>
          <p className="text-sm text-gray-700 mb-6">{CONTENT.definitions.webp.desc}</p>
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 inline-block">
            {CONTENT.definitions.webp.badge}
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
          <h3 className="text-xl font-bold text-dark mb-4">{CONTENT.definitions.avif.title}</h3>
          <p className="text-sm text-gray-700 mb-6">{CONTENT.definitions.avif.desc}</p>
          <div className="bg-blue-50 text-secondary px-4 py-2 rounded-xl text-xs font-bold border border-[#cce4ff] inline-block">
            {CONTENT.definitions.avif.badge}
          </div>
        </div>
      </div>

      <div className="my-24">
        <SectionHeader
          title={CONTENT.duel.title}
          subtitle={CONTENT.duel.subtitle}
          centered={false}
          align="left"
        />
        <p className="mb-8">{CONTENT.duel.text}</p>
        <ImageComparisonDuel />
      </div>

      <SectionHeader
        title={CONTENT.simulator.title}
        subtitle={CONTENT.simulator.subtitle}
        centered={false}
        align="left"
      />
      <p>{CONTENT.simulator.text}</p>
      <AnimateOnScroll>
        <div className="my-12">
          <LoadingSimulator />
        </div>
      </AnimateOnScroll>

      <SectionHeader
        title={CONTENT.value.title}
        subtitle={CONTENT.value.subtitle}
        centered={false}
        align="left"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-12 mb-24">
        {CONTENT.value.items.map((item, i) => (
          <ValueCard
            key={i}
            icon={
              i === 0 ? (
                <TrendingUp className="text-emerald-500" />
              ) : i === 1 ? (
                <Smartphone className="text-blue-500" />
              ) : (
                <Zap className="text-amber-500" />
              )
            }
            title={item.title}
            desc={item.desc}
          />
        ))}
      </div>

      <div className="my-24">
        <SectionHeader
          title={CONTENT.checklist.title}
          subtitle={CONTENT.checklist.subtitle}
          centered={true}
        />
        <ImageSeoChecklist />
      </div>

      <SectionHeader
        title={CONTENT.support.title}
        subtitle={CONTENT.support.subtitle}
        centered={false}
        align="left"
      />
      <p dangerouslySetInnerHTML={{ __html: CONTENT.support.text }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-16">
        <LazyHydrate minHeight="250px">
          <BrowserSupportChart title="Wsparcie WebP" percent={96.8} color="#10B981" />
        </LazyHydrate>
        <LazyHydrate minHeight="250px">
          <BrowserSupportChart title="Wsparcie AVIF" percent={91.2} color="#61B6DE" />
        </LazyHydrate>
      </div>

      <div className="mt-24">
        <SectionHeader
          title={CONTENT.implementation.title}
          subtitle={CONTENT.implementation.subtitle}
          centered={false}
          align="left"
        />
        <p className="mb-8" dangerouslySetInnerHTML={{ __html: CONTENT.implementation.text }} />
        <CodeBlockImplementation />
      </div>

      <BaseCta
        icon={Scale}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default ImageFormatsArticle;
