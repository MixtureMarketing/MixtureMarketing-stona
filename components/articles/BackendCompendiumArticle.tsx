import React from 'react';
import {
  Server,
  Zap,
  ShieldCheck,
  Rocket,
  Box,
  Workflow,
  Star,
  ArrowRight,
  Database,
  Layers,
  AlertTriangle,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import { useModal } from '../../context/ModalContext';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { BACKEND_COMPENDIUM_CONTENT } from '../../data/content/articles/backend-compendium';
import {
  BackendIcebergHero,
  RestaurantAnalogyVisual,
  TechnologyStarsTable,
  ArchitectureComparisonVisual,
  BackendDecisionTree,
} from './visuals/BackendVisuals';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';

const BackendCompendiumArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'backend-compendium');
  const content = BACKEND_COMPENDIUM_CONTENT;

  return (
    <ArticleShell
      id="backend-compendium"
      title={`${content.header.title.line1}: ${content.header.title.line2}`}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData?.image || '/assets/images/backend.png'}
      icon={Server}
      accentColor="#3B82F6"
      heroVisual={<BackendIcebergHero />}
      slug="/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto"
    >
      <AnimateOnScroll>
        <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl">
          {content.lead.highlight}
        </p>
        <p dangerouslySetInnerHTML={{ __html: content.lead.text1 }}></p>
        <p dangerouslySetInnerHTML={{ __html: content.lead.text2 }}></p>
        <div className="mt-6 p-6 bg-secondary/5 border-l-4 border-secondary rounded-r-2xl">
          <p className="text-sm m-0" dangerouslySetInnerHTML={{ __html: content.lead.cta }}></p>
        </div>
      </AnimateOnScroll>

      {/* PART 1: ARCHITECTURE */}
      <div className="my-24">
        <SectionHeader title={content.part1.title} subtitle={content.part1.subtitle} align="left" />
        <p>{content.part1.text}</p>

        <div className="my-12">
          <RestaurantAnalogyVisual />
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
          <AlertTriangle className="text-secondary shrink-0 mt-1" size={20} />
          <p
            className="text-sm m-0 leading-relaxed font-medium text-secondary"
            dangerouslySetInnerHTML={{ __html: content.part1.conclusion }}
          ></p>
        </div>
      </div>

      {/* PART 2: THE BIG FOUR */}
      <div className="my-24">
        <SectionHeader title={content.part2.title} subtitle={content.part2.subtitle} align="left" />
        <p>{content.part2.text}</p>

        <div className="my-12 overflow-x-auto not-prose">
          <TechnologyStarsTable content={content.part2} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 not-prose">
          {content.part2.technologies.map((tech, i) => {
            const icons = [
              <Zap key="zap" size={24} />,
              <ShieldCheck key="shield" size={24} />,
              <Rocket key="rocket" size={24} />,
              <Box key="box" size={24} />,
            ];
            const colors = ['green', 'blue', 'cyan', 'red'];
            return (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-${colors[i]}-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>
                <div
                  className={`w-12 h-12 bg-${colors[i]}-50 text-${colors[i]}-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  {icons[i]}
                </div>
                <h3 className="text-xl font-bold text-dark mb-4">{tech.title}</h3>
                <p className="text-sm text-gray-600 mb-6">{tech.desc}</p>
                <div
                  className={`text-xxs font-bold uppercase tracking-widest text-${colors[i]}-600 bg-${colors[i]}-50 px-3 py-1 rounded-full inline-block mb-6`}
                >
                  Dla kogo: {tech.for}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <a
                    href={tech.linkUrl}
                    className="text-sm font-bold text-dark hover:text-primary flex items-center gap-2 group-hover:gap-3 transition-all"
                  >
                    {tech.linkText} <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PART 3: DATABASES */}
      <div className="my-24">
        <SectionHeader title={content.part3.title} subtitle={content.part3.subtitle} align="left" />
        <p>{content.part3.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 not-prose">
          <div className="bg-dark p-8 rounded-3xl text-white shadow-xl group border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[100px] opacity-10"></div>
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-primary" size={32} />
              <h3 className="text-xl font-bold m-0 text-white">{content.part3.postgres.title}</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6">{content.part3.postgres.text}</p>
            <div className="bg-white/10 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-xxs font-black uppercase text-primary">
                  Werdykt Architekta:
                </span>
              </div>
              <p className="text-xs m-0 text-gray-200">{content.part3.postgres.verdict}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm group hover:border-primary transition-all">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="text-green-500" size={32} />
              <h3 className="text-xl font-bold m-0 text-dark">{content.part3.mongo.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{content.part3.mongo.text}</p>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-green-600" />
                <span className="text-xxs font-black uppercase text-green-600">
                  Werdykt Architekta:
                </span>
              </div>
              <p className="text-xs m-0 text-gray-700">{content.part3.mongo.verdict}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <a
            href={content.part3.linkUrl}
            className="text-secondary font-bold hover:underline flex items-center justify-center gap-2"
          >
            {content.part3.linkText} <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* PART 4: MONOLITH VS MICROSERVICES */}
      <div className="my-24">
        <SectionHeader title={content.part4.title} subtitle={content.part4.subtitle} align="left" />
        <p dangerouslySetInnerHTML={{ __html: content.part4.text }}></p>

        <div className="my-12">
          <ArchitectureComparisonVisual />
        </div>

        <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex flex-col md:flex-row gap-6 items-center shadow-inner">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <Star size={32} className="fill-current" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-dark mb-2">{content.part4.advice.title}</h4>
            <p
              className="text-sm text-gray-700 m-0 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.part4.advice.text }}
            ></p>
          </div>
        </div>
      </div>

      {/* PART 5: DECISION TREE */}
      <div className="my-24">
        <SectionHeader title={content.part5.title} subtitle={content.part5.subtitle} align="left" />
        <p>{content.part5.text}</p>

        <div className="mt-12">
          <BackendDecisionTree content={content.part5} />
        </div>
      </div>

      <BaseCta
        icon={Workflow}
        title={content.cta.title}
        description={content.cta.text}
        buttonText={content.cta.primaryBtn}
        onClick={() => openModal('consultation')}
        secondaryButtonText={content.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default BackendCompendiumArticle;
