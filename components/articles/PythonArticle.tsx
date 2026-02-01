import React from 'react';
import { ShieldCheck, Zap, Server, Key, Database, Layout, Bot, Cpu, Lock } from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import ArticleShell from './ArticleShell';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { PYTHON_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/python';
import {
  PythonHeroVisual,
  SecurityShieldVisual,
  DjangoAdminPreview,
  ScalabilityVisual,
} from './visuals/PythonVisuals';
import ArticleContextBox from './shared/ArticleContextBox';
import ArticleUseCases from './shared/ArticleUseCases';
import BaseCta from '../common/BaseCta';

const PythonArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'python-django-framework-fintech');

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description="Dowiedz się, dlaczego Fintechy i Startupy kochają Django. Bezpieczeństwo klasy bankowej i błyskawiczne wdrożenia MVP."
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData.image}
      icon={ShieldCheck}
      accentColor="#00684A"
      heroVisual={<PythonHeroVisual />}
      slug="/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp"
    >
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <p className="text-xl text-gray-600 leading-relaxed font-medium italic border-l-4 border-[#00684A] pl-6 py-4 bg-white shadow-sm rounded-r-xl not-prose">
          {CONTENT.header.quote}
        </p>
      </div>

      <ArticleContextBox
        icon={Server}
        text={`<p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Szerszy Kontekst</p><h4 className="text-lg font-bold text-dark mb-2">${CONTENT.contextBox.title}</h4><p className="text-sm text-gray-600 mb-3">${CONTENT.contextBox.text}</p>`}
        linkUrl={CONTENT.contextBox.linkUrl}
        linkText={CONTENT.contextBox.linkText}
      />

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-dark mb-12 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      <ArticleUseCases
        title={CONTENT.batteries.title}
        accentColor="#00684A"
        items={[
          { ...CONTENT.batteries.cards[0], icon: <Key size={24} /> },
          { ...CONTENT.batteries.cards[1], icon: <Database size={24} /> },
          { ...CONTENT.batteries.cards[2], icon: <Layout size={24} /> },
          { ...CONTENT.batteries.cards[3], icon: <ShieldCheck size={24} /> },
        ]}
      />

      <div className="bg-[#092e20] text-white p-8 md:p-10 rounded-[2.5rem] border border-[#00684A]/30 flex flex-col md:flex-row items-center justify-between gap-8 not-prose shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10">
          <p className="text-xs font-bold text-[#00ED64] uppercase tracking-widest mb-2">
            Werdykt Biznesowy
          </p>
          <p
            className="m-0 font-medium text-xl text-gray-100"
            dangerouslySetInnerHTML={{ __html: CONTENT.batteries.verdict }}
          />
        </div>
        <Zap className="text-[#00ED64] animate-pulse shrink-0 relative z-10" size={48} />
      </div>

      <div className="my-32">
        <SectionHeader
          title={CONTENT.security.title}
          subtitle={CONTENT.security.subtitle}
          align="center"
        />
        <p className="text-center max-w-2xl mx-auto mb-16">{CONTENT.security.text}</p>
        <div className="not-prose my-12">
          <SecurityShieldVisual content={CONTENT.security} />
        </div>
      </div>

      <div className="my-32">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <SectionHeader
              title={CONTENT.admin.title}
              subtitle={CONTENT.admin.subtitle}
              align="left"
            />
            <p>{CONTENT.admin.text1}</p>
            <p dangerouslySetInnerHTML={{ __html: CONTENT.admin.text2 }} />
          </div>
          <div className="flex-1 not-prose w-full">
            <DjangoAdminPreview />
          </div>
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={CONTENT.scalability.title}
          subtitle={CONTENT.scalability.subtitle}
          align="left"
        />
        <p>{CONTENT.scalability.text}</p>
        <div className="not-prose mt-12">
          <ScalabilityVisual content={CONTENT.scalability} />
        </div>
      </div>

      <div className="my-32 bg-gradient-to-br from-white to-indigo-50/50 p-8 md:p-16 rounded-[3rem] border border-indigo-100 shadow-xl relative overflow-hidden not-prose group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <Bot size={200} className="text-indigo-600" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <Cpu size={14} />
            <span>{CONTENT.ai.subtitle}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-6">{CONTENT.ai.title}</h2>
          <p
            className="text-gray-600 mb-10 max-w-2xl leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: CONTENT.ai.text }}
          />
          <div className="flex flex-wrap gap-4">
            {CONTENT.ai.tags.map((tag, i) => (
              <div
                key={i}
                className="bg-white px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest border border-gray-200 shadow-sm flex items-center gap-3"
              >
                <div
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}
                ></div>{' '}
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={CONTENT.comparison.title}
          subtitle={CONTENT.comparison.subtitle}
          align="center"
        />
        <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-2xl mt-12 not-prose bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#092e20] text-white">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {CONTENT.comparison.headers[0]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {CONTENT.comparison.headers[1]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-[#00ED64]">
                  {CONTENT.comparison.headers[2]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {CONTENT.comparison.rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold text-gray-900">{row.feature}</td>
                  <td className="p-6 text-gray-600">{row.node}</td>
                  <td className="p-6 text-[#00684A] font-bold bg-[#E8F5E9]/50">{row.python}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BaseCta
        icon={Lock}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development/custom-app"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#00ED64"
        variant="dark"
      />
    </ArticleShell>
  );
};

export default PythonArticle;
