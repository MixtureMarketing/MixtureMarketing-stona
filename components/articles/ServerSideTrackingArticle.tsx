import React from 'react';
import { ShieldCheck, Zap, Server, Database, Cloud, Activity } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import ArticleShell from './ArticleShell';
import { ARTICLES } from '../../data/articles';
import { SST_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/sst';
import { SstHeroVisual, TrackingComparisonVisual, CapiVisual } from './visuals/SstVisuals';

const ServerSideTrackingArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'server-side-tracking');

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData.image}
      icon={Server}
      accentColor="#61B6DE"
      heroVisual={<SstHeroVisual />}
      slug="/baza-wiedzy/server-side-tracking-koniec-cookies"
    >
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <p className="text-xl text-gray-600 leading-relaxed font-medium italic border-l-4 border-primary pl-6 py-4 bg-white shadow-sm rounded-r-xl not-prose">
          {CONTENT.whySoftwareHouse.quote}
        </p>
      </div>

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-dark mb-12 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
      </AnimateOnScroll>

      <div className="my-24">
        <SectionHeader
          title={CONTENT.whyBlind.title}
          subtitle={CONTENT.whyBlind.subtitle}
          align="left"
        />
        <p>{CONTENT.whyBlind.text}</p>
        <div className="my-12">
          <TrackingComparisonVisual />
        </div>
      </div>

      <div className="my-24">
        <SectionHeader
          title={CONTENT.solution.title}
          subtitle={CONTENT.solution.subtitle}
          align="left"
        />
        <p>{CONTENT.solution.text}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-12">
          {CONTENT.whyBlind.items.map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 text-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {i === 0 ? (
                  <ShieldCheck size={24} />
                ) : i === 1 ? (
                  <Zap size={24} />
                ) : (
                  <Database size={24} />
                )}
              </div>
              <h3 className="font-bold text-dark text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 m-0">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-24">
        <CapiVisual />
      </div>

      <div className="my-24 bg-blue-50 rounded-[3rem] p-10 md:p-16 relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 p-12 opacity-10 hidden md:block">
          <Cloud size={150} className="text-secondary" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <SectionHeader
            title={CONTENT.whySoftwareHouse.title}
            subtitle={CONTENT.whySoftwareHouse.subtitle}
            align="left"
            className="mb-8"
          />
          <div className="space-y-6">
            {CONTENT.whySoftwareHouse.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-6 items-center bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50"
              >
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-black shrink-0 shadow-lg">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-dark mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 m-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <Activity size={40} className="text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                {CONTENT.cta.title}
              </h2>
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {CONTENT.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-primary/20 px-10 py-4"
                  onClick={() => (window.location.href = '/contact/')}
                >
                  {CONTENT.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10 py-4"
                  size="lg"
                  onClick={() => (window.location.href = '/baza-wiedzy/')}
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

export default ServerSideTrackingArticle;
