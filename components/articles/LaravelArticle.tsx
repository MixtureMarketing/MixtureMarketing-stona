import React from 'react';
import {
  Timer,
  Rocket,
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowRight,
  CheckCircle2,
  Server,
  Cloud,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { ARTICLES } from '../../data/articles';
import { LARAVEL_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/laravel';
import {
  LaravelHeroVisual,
  LaravelEcosystemMap,
  EloquentComparison,
  LaravelPerformanceChart,
} from './visuals/LaravelVisuals';
import ArticleShell from './ArticleShell';

const LaravelArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'laravel-php-framework-szybkie-wdrozenie');

  return (
    <ArticleShell
      id="laravel-php-framework-szybkie-wdrozenie"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.quote}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/laravel.png'}
      icon={Timer}
      accentColor="#FF2D20"
      heroVisual={<LaravelHeroVisual />}
    >
      <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
        <Server className="text-secondary mt-1 shrink-0" size={20} />
        <div>
          <p
            className="text-sm text-secondary m-0 font-medium"
            dangerouslySetInnerHTML={{ __html: CONTENT.contextBox.text }}
          />
          <a
            href={CONTENT.contextBox.linkUrl}
            className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
          >
            {CONTENT.contextBox.linkText} <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
      </AnimateOnScroll>

      {/* MAGIC OF ECOSYSTEM */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.ecosystem.title}
          subtitle={CONTENT.ecosystem.subtitle}
          align="left"
        />
        <p>{CONTENT.ecosystem.text}</p>

        <div className="not-prose">
          <LaravelEcosystemMap />
        </div>

        <div className="bg-[#FFF0F0] text-[#D82015] p-6 rounded-2xl border border-[#FF2D20]/20 text-center font-bold text-sm not-prose">
          {CONTENT.ecosystem.verdict}
        </div>
      </div>

      {/* ELOQUENT ORM */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.eloquent.title}
          subtitle={CONTENT.eloquent.subtitle}
          align="left"
        />
        <p>{CONTENT.eloquent.text}</p>

        <div className="not-prose">
          <EloquentComparison />
        </div>
      </div>

      {/* SECURITY */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.security.title}
          subtitle={CONTENT.security.subtitle}
          align="left"
        />
        <p>{CONTENT.security.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 not-prose">
          {CONTENT.security.cards.map((card, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <ShieldCheck className="text-[#059669] mb-4" size={32} />
              <h4 className="font-bold text-dark mb-2">{card.title}</h4>
              <p className="text-xs text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PERFORMANCE: OCTANE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.performance.title}
          subtitle={CONTENT.performance.subtitle}
          align="left"
        />
        <p>{CONTENT.performance.text}</p>

        <div className="not-prose">
          <LaravelPerformanceChart />
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.comparison.title}
          subtitle={CONTENT.comparison.subtitle}
          align="left"
        />
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg mt-8 not-prose">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-black uppercase text-gray-500">
                  {CONTENT.comparison.headers[0]}
                </th>
                <th className="p-4 text-xs font-black uppercase text-[#FF2D20]">
                  {CONTENT.comparison.headers[1]}
                </th>
                <th className="p-4 text-xs font-black uppercase text-[#68A063]">
                  {CONTENT.comparison.headers[2]}
                </th>
                <th className="p-4 text-xs font-black uppercase text-[#306998]">
                  {CONTENT.comparison.headers[3]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {CONTENT.comparison.rows.map((row, i) => (
                <tr key={i}>
                  <td className="p-4 font-bold">{row.feature}</td>
                  <td className="p-4 text-[#D82015] font-bold">{row.v1}</td>
                  <td className="p-4">{row.v2}</td>
                  <td className="p-4">{row.v3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USE CASES */}
      <div className="my-24 bg-gray-50 p-8 md:p-12 rounded-[2rem] not-prose">
        <h3 className="text-2xl font-bold text-dark mb-8">{CONTENT.useCases.title}</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { ...CONTENT.useCases.items[0], icon: <Cloud size={20} /> },
            { ...CONTENT.useCases.items[1], icon: <Briefcase size={20} /> },
            { ...CONTENT.useCases.items[2], icon: <Layers size={20} /> },
            { ...CONTENT.useCases.items[3], icon: <CheckCircle2 size={20} /> },
          ].map((item, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-[#FF2D20]/10 rounded-lg flex items-center justify-center text-[#FF2D20] shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-dark">{item.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* SUMMARY & CTA */}
      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF2D20] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-900 rounded-full blur-[100px] opacity-30"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Rocket size={40} className="text-[#FF2D20]" />
              </div>
              <h2
                className="text-3xl font-bold mb-6 text-white"
                dangerouslySetInnerHTML={{ __html: CONTENT.cta.title }}
              />
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {CONTENT.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-[#FF2D20]/20 !bg-[#FF2D20] border-none text-white hover:!bg-[#D82015]"
                  onClick={() => (window.location.href = '/web-development/custom-app')}
                >
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

export default LaravelArticle;
