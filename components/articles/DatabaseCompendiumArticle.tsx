import React from 'react';
import {
  Database,
  ShieldCheck,
  Box,
  Rocket,
  SearchCode,
  AlertTriangle,
  XCircle,
  Workflow,
  SearchCheck,
  Check,
  CheckCircle2,
  Zap,
  Search,
  Layers,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import BaseCta from '../common/BaseCta';
import ArticleShell from './ArticleShell';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { DATABASE_COMPENDIUM_CONTENT } from '../../data/content/articles/database-compendium';
import ArticleComparisonTable from './shared/ArticleComparisonTable';
import { DatabaseHeroVisual, DatabaseArchitectureVisual } from './visuals/DatabaseVisuals';

interface DatabasePlayer {
  name: string;
  type: string;
  role: string;
  power: string;
  desc: string;
  for: string[];
}

interface DecisionStep {
  step: number;
  q: string;
  desc: string;
  ans: string;
}

const DatabaseCompendiumArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'databases-compendium');
  const content = DATABASE_COMPENDIUM_CONTENT;

  return (
    <ArticleShell
      id="databases-compendium"
      title={`${content.header.title.line1}: ${content.header.title.line2}`}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData?.image || '/assets/images/database.png'}
      icon={Database}
      accentColor="#336791"
      heroVisual={<DatabaseHeroVisual />}
      slug="/baza-wiedzy/bazy-danych-kompendium-architekta"
    >
      <AnimateOnScroll>
        <div className="bg-white rounded-3xl p-8 border-l-8 border-secondary shadow-xl mb-12">
          <p className="lead text-2xl text-secondary font-medium leading-relaxed m-0">
            {content.lead.highlight}
          </p>
        </div>

        <p dangerouslySetInnerHTML={{ __html: content.lead.text1 }}></p>
        <p dangerouslySetInnerHTML={{ __html: content.lead.text2 }}></p>

        <div className="mt-8 p-6 bg-gradient-to-r from-secondary/5 to-primary/10 border border-secondary/10 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm text-secondary">
            <SearchCheck size={24} />
          </div>
          <div className="text-sm m-0" dangerouslySetInnerHTML={{ __html: content.lead.cta }}></div>
        </div>
      </AnimateOnScroll>

      {/* PART 1: THE PLAYERS */}
      <div className="my-32">
        <SectionHeader
          title={content.players.title}
          subtitle={content.players.subtitle}
          align="center"
        />
        <p className="text-center max-w-2xl mx-auto mb-16">{content.players.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
          {(content.players.items as DatabasePlayer[]).map((item, i) => {
            const icons = [
              <ShieldCheck
                key="shield"
                className="text-[#336791] group-hover:text-white"
                size={32}
              />,
              <Box key="box" className="text-[#47a248] group-hover:text-white" size={32} />,
              <Rocket key="rocket" className="text-[#dc382d] group-hover:text-white" size={32} />,
              <SearchCode
                key="search"
                className="text-[#f1c40f] group-hover:text-white"
                size={32}
              />,
            ];
            const bgColors = ['#336791', '#47a248', '#dc382d', '#f1c40f'];
            return (
              <div
                key={i}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16"
                  style={{ backgroundColor: `${bgColors[i]}10` }}
                ></div>
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${bgColors[i]}10` }}
                  >
                    {React.cloneElement(
                      icons[i] as React.ReactElement<{
                        style?: React.CSSProperties;
                        className?: string;
                      }>,
                      {
                        style: { color: i === 3 ? '#f1c40f' : bgColors[i] },
                        className: 'group-hover:text-white',
                      },
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-2 flex items-center gap-3">
                    {item.name}{' '}
                    <span
                      className="text-xxs px-3 py-1 rounded-full uppercase tracking-wider font-extrabold"
                      style={{ backgroundColor: `${bgColors[i]}20`, color: bgColors[i] }}
                    >
                      {item.type}
                    </span>
                  </h3>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                    {item.role}
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check
                        style={{ color: bgColors[i] }}
                        className="flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <span dangerouslySetInnerHTML={{ __html: item.power }}></span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check
                        style={{ color: bgColors[i] }}
                        className="flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <span>{item.desc}</span>
                    </li>
                  </ul>

                  <div className="pt-6 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase">Idealny do:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.for.map((f, j) => (
                        <span
                          key={j}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PART 2: DECISION MATRIX */}
      <ArticleComparisonTable
        title={content.matrix.title}
        subtitle={content.matrix.text}
        headers={content.matrix.headers}
        rows={content.matrix.rows}
      />

      {/* PART 3: ARCHITECTURE */}
      <div className="my-32">
        <SectionHeader
          title={content.architecture.title}
          subtitle={content.architecture.subtitle}
          description={content.architecture.text}
          align="center"
        />
        <div className="my-12">
          <DatabaseArchitectureVisual />
        </div>
      </div>

      {/* PART 4: DECISION TREE */}
      <div className="my-32">
        <SectionHeader
          title={content.decisionTree.title}
          subtitle={content.decisionTree.subtitle}
          description={content.decisionTree.text}
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 not-prose">
          {(content.decisionTree.steps as DecisionStep[]).map((step, i) => {
            const icons = [
              <ShieldCheck key="shield" size={16} />,
              <Rocket key="rocket" size={16} />,
              <SearchCode key="search" size={16} />,
              <Box key="box" size={16} />,
            ];
            const colors = ['blue', 'red', 'yellow', 'green'];
            const UI_Icons = [
              <CheckCircle2 key="check" size={32} />,
              <Zap key="zap" size={32} />,
              <Search key="search" size={32} />,
              <Layers key="layers" size={32} />,
            ];
            return (
              <div
                key={i}
                className={`bg-gradient-to-br from-white to-${colors[i]}-50 p-8 rounded-[2rem] border border-${colors[i]}-100 shadow-sm relative group hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${colors[i]}-100 text-${colors[i]}-600 rounded-xl flex items-center justify-center font-bold text-xl`}
                  >
                    {step.step}
                  </div>
                  {React.cloneElement(UI_Icons[i] as React.ReactElement<{ className?: string }>, {
                    className: `text-${colors[i]}-200 group-hover:text-${colors[i]}-500 transition-colors`,
                  })}
                </div>
                <h4 className="text-xl font-bold text-dark mb-2">{step.q}</h4>
                <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{step.desc}</p>
                <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 bg-${colors[i]}-600 rounded-lg flex items-center justify-center text-white`}
                  >
                    {icons[i]}
                  </div>
                  <div className="text-sm font-bold text-dark">{step.ans}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PART 5: COMMON MISTAKES */}
      <div className="my-24 bg-[#FFF5F5] rounded-[3rem] p-10 md:p-16 border border-red-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 hidden md:block">
          <AlertTriangle size={200} className="text-red-500" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <SectionHeader
            title={content.mistakes.title}
            subtitle={content.mistakes.subtitle}
            align="left"
            className="mb-12"
          />
          <div className="space-y-6 not-prose">
            {content.mistakes.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-6 items-start bg-white p-6 rounded-2xl border border-red-100 shadow-sm"
              >
                <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                  <XCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="font-bold text-dark text-lg mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BaseCta
        icon={Workflow}
        title={content.cta.title}
        description={content.cta.text}
        buttonText={content.cta.primaryBtn}
        buttonLink="/contact"
        secondaryButtonText={content.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#336791"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default DatabaseCompendiumArticle;
