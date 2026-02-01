import React from 'react';
import {
  Infinity as InfinityIcon,
  Cloud,
  Container,
  Anchor,
  Workflow,
  CheckCircle2,
  Settings,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { DEVOPS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/devops';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';
import { DevOpsMetropolisVisual, DevOpsProcessVisual } from './visuals/DevOpsVisuals';

const DevOpsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'devops-fundament-biznesu');

  return (
    <ArticleShell
      id="devops-fundament-biznesu"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/devops.png'}
      icon={InfinityIcon}
      accentColor="#3B82F6"
      heroVisual={<DevOpsMetropolisVisual />}
      slug="/baza-wiedzy/devops-fundament-nowoczesnego-biznesu"
    >
      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
      </AnimateOnScroll>

      {/* THE 4 PILLARS */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.pillars.title}
          subtitle={CONTENT.pillars.subtitle}
          align="left"
        />

        <div className="space-y-12 mt-12 not-prose">
          {CONTENT.pillars.items.map((pillar, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div
                  className={`w-16 h-16 ${i === 0 ? 'bg-blue-100 text-blue-600' : i === 1 ? 'bg-indigo-100 text-indigo-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'} rounded-2xl flex items-center justify-center flex-shrink-0`}
                >
                  {i === 0 ? (
                    <Container size={32} />
                  ) : i === 1 ? (
                    <Anchor size={32} />
                  ) : i === 2 ? (
                    <Cloud size={32} />
                  ) : (
                    <Workflow size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-dark mb-2">{pillar.title}</h3>
                  <p
                    className="text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{ __html: pillar.text }}
                  />
                  <div
                    className={`bg-${i === 0 ? 'blue' : i === 1 ? 'indigo' : i === 2 ? 'orange' : 'green'}-50 text-${i === 0 ? 'blue' : i === 1 ? 'indigo' : i === 2 ? 'orange' : 'green'}-700 px-4 py-2 rounded-lg text-sm font-bold inline-block`}
                  >
                    {pillar.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOWCHART: THE SYNTHESIS */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.process.title}
          subtitle={CONTENT.process.subtitle}
          align="left"
        />
        <p>{CONTENT.process.text}</p>

        <div className="my-12">
          <DevOpsProcessVisual />
        </div>
      </div>

      {/* MATURITY MODEL */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.maturity.title}
          subtitle={CONTENT.maturity.subtitle}
          align="left"
        />
        <p>{CONTENT.maturity.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 not-prose">
          {CONTENT.maturity.levels.map((level, i) => (
            <div
              key={i}
              className={`bg-white p-6 rounded-2xl border ${i === 1 ? 'border-primary shadow-xl transform md:-translate-y-4' : 'border-gray-100 shadow-sm hover:border-primary'} transition-colors relative overflow-hidden group`}
            >
              {i === 1 && (
                <div className="absolute right-4 top-4 bg-primary text-white text-xxxs font-black px-2 py-1 rounded uppercase tracking-widest">
                  Polecane
                </div>
              )}
              <div
                className={`text-xs font-black uppercase ${i === 1 ? 'text-primary' : 'text-gray-400'} mb-2`}
              >
                {level.lvl}
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{level.title}</h3>
              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{level.desc}</p>
              <ul className="space-y-2 text-sm">
                {level.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ROI */}
      <div className="my-24 bg-blue-50 rounded-[3rem] p-10 border border-[#cce4ff] relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/30 rounded-full blur-[60px]"></div>
        <SectionHeader title={CONTENT.roi.title} subtitle={CONTENT.roi.subtitle} align="left" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8 not-prose">
          {CONTENT.roi.items.map((item, i) => (
            <div key={i} className="flex gap-4 bg-white/50 p-6 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold shadow-sm shrink-0">
                {i + 1}
              </div>
              <div>
                <h4 className="font-bold text-dark">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BaseCta
        icon={Settings}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#3B82F6"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default DevOpsArticle;
