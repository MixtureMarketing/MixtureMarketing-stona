import React from 'react';
import { ImageIcon, Zap, TrendingUp, Smartphone, Monitor, Tablet, Scale } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import LazyHydrate from '../common/LazyHydrate';
import { ARTICLES } from '../../data/articles';
import { IMAGE_FORMATS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/image-formats';
import ArticleShell from './ArticleShell';
import {
  ImageComparisonDuel,
  BrowserSupportChart,
  CodeBlockImplementation,
  LoadingSimulator,
  ImageSeoChecklist,
} from './visuals/ImageFormatsVisuals';

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
      heroVisual={
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative bg-gray-200 rounded-3xl p-8 overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-gray-300">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"></div>
              <Monitor size={80} className="text-gray-600 mb-4" />
              <div className="bg-gray-800 text-white px-4 py-1 rounded-md font-mono text-sm mb-4">
                FORMAT: JPG (1992)
              </div>
              <div className="flex items-center gap-2 text-gray-700 font-bold">
                <Scale size={20} /> 10.0 kg (Ciężkie)
              </div>
            </div>
            <div className="relative bg-white rounded-3xl p-8 overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-primary/30 shadow-xl shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E0EFFF] to-white opacity-50"></div>
              <Tablet size={80} className="text-primary mb-4 relative z-10 animate-float" />
              <div className="bg-primary text-white px-4 py-1 rounded-md font-mono text-sm mb-4 relative z-10">
                FORMAT: AVIF (2025)
              </div>
              <div className="flex items-center gap-2 text-secondary font-bold relative z-10">
                <Zap size={20} className="fill-current" /> 0.5 kg (Lekkie)
              </div>
            </div>
          </div>
        </div>
      }
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

      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                <Scale size={40} className="text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
              <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {CONTENT.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="white" size="lg" className="shadow-xl text-dark hover:bg-gray-100">
                  {CONTENT.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                  size="lg"
                  onClick={() => (window.location.href = '/baza-wiedzy')}
                >
                  {CONTENT.cta.secondaryBtn}
                </Button>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </ArticleShell>
  );
};

const ValueCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
    <div
      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4"
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default ImageFormatsArticle;
