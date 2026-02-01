import React from 'react';
import { ShieldCheck, Cloud, Building2, Zap, Activity, CheckCircle2 } from 'lucide-react';

import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { WAF_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/waf';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';
import LazyHydrate from '../common/LazyHydrate';
import {
  WafHeroVisual,
  AirportSecuritySimulator,
  AttackTypeCard,
  VirtualPatchingTimeline,
  SqliDemo,
  GdprPenaltyCalculator,
  AttackCounter,
} from './visuals/WafVisuals';

const WafArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'waf-bezpieczenstwo');

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData.image}
      icon={ShieldCheck}
      accentColor="#3F3D91"
      heroVisual={<WafHeroVisual />}
      slug="/baza-wiedzy/waf-bezpieczenstwo"
    >
      <div className="flex justify-center mb-16 not-prose">
        <AttackCounter />
      </div>

      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed italic border-l-4 border-secondary pl-6 py-2"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.quote }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      <div className="my-24">
        <SectionHeader
          title={CONTENT.howItWorks.title}
          subtitle={CONTENT.howItWorks.subtitle}
          align="left"
        />
        <p className="mb-8">{CONTENT.howItWorks.text}</p>
        <LazyHydrate minHeight="400px">
          <AirportSecuritySimulator />
        </LazyHydrate>
      </div>

      <h2 className="text-3xl font-bold text-dark mb-8">{CONTENT.technical.title}</h2>
      <p className="mb-8">{CONTENT.technical.text}</p>

      <AnimateOnScroll>
        <div className="mb-16 overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white not-prose">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                  <th className="p-5 border-b border-gray-200 font-bold">
                    {CONTENT.technical.headers[0]}
                  </th>
                  <th className="p-5 border-b border-gray-200 font-bold">
                    {CONTENT.technical.headers[1]}
                  </th>
                  <th className="p-5 border-b border-gray-200 font-bold text-secondary bg-blue-50/30">
                    {CONTENT.technical.headers[2]}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {CONTENT.technical.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <td className="p-5 font-bold text-dark">{row.label}</td>
                    <td className="p-5 text-gray-700">{row.v1}</td>
                    <td className="p-5 font-bold text-secondary bg-blue-50/10">{row.v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimateOnScroll>

      <SectionHeader title={CONTENT.blocks.title} subtitle={CONTENT.blocks.subtitle} align="left" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-12">
        {CONTENT.blocks.items.map((item, i) => (
          <AttackTypeCard key={i} title={item.title} desc={item.desc} impact={item.impact} />
        ))}
      </div>

      <SectionHeader
        title={CONTENT.patching.title}
        subtitle={CONTENT.patching.subtitle}
        align="left"
      />
      <p dangerouslySetInnerHTML={{ __html: CONTENT.patching.text }} />
      <AnimateOnScroll>
        <div className="my-12">
          <VirtualPatchingTimeline />
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="my-16">
          <LazyHydrate minHeight="300px">
            <SqliDemo />
          </LazyHydrate>
        </div>
      </AnimateOnScroll>

      <div className="my-24">
        <SectionHeader
          title="Cena zaniedbania"
          subtitle="Symulator Kar RODO / GDPR"
          centered={true}
        />
        <LazyHydrate minHeight="400px">
          <GdprPenaltyCalculator />
        </LazyHydrate>
      </div>

      <div className="mt-24">
        <SectionHeader title={CONTENT.value.title} subtitle={CONTENT.value.subtitle} align="left" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-12 mb-24">
          {CONTENT.value.items.map((item, i) => (
            <ValueCard
              key={i}
              icon={
                i === 0 ? (
                  <ShieldCheck className="text-emerald-500" />
                ) : i === 1 ? (
                  <Activity className="text-blue-500" />
                ) : (
                  <Zap className="text-amber-500" />
                )
              }
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>

      <h2 className="text-3xl font-bold text-dark mb-8">{CONTENT.implementation.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-24">
        <div className="bg-white p-8 rounded-3xl border-2 border-primary/20 shadow-xl relative overflow-hidden group hover:border-primary transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cloud size={80} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2 flex items-center gap-2">
            <Cloud className="text-primary" aria-hidden="true" />{' '}
            {CONTENT.implementation.cloud.title}
          </h3>
          <p className="text-sm text-gray-700 mb-6">{CONTENT.implementation.cloud.desc}</p>
          <ul className="text-sm space-y-3 mb-8">
            {CONTENT.implementation.cloud.items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
          <div className="text-xxs font-black uppercase text-primary">
            {CONTENT.implementation.cloud.label}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Building2 size={80} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2 flex items-center gap-2">
            <Building2 className="text-gray-600" aria-hidden="true" />{' '}
            {CONTENT.implementation.onPremise.title}
          </h3>
          <p className="text-sm text-gray-700 mb-6">{CONTENT.implementation.onPremise.desc}</p>
          <ul className="text-sm space-y-3 mb-8">
            {CONTENT.implementation.onPremise.items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2
                  size={14}
                  className={`${i === 2 ? 'text-rose-500' : 'text-emerald-500'}`}
                  aria-hidden="true"
                />{' '}
                {item}
              </li>
            ))}
          </ul>
          <div className="text-xxs font-black uppercase text-gray-600">
            {CONTENT.implementation.onPremise.label}
          </div>
        </div>
      </div>

      <BaseCta
        icon={ShieldCheck}
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.primaryBtn}
        buttonLink="/web-development/custom-app"
        secondaryButtonText={CONTENT.cta.secondaryBtn}
        secondaryButtonLink="/baza-wiedzy"
        accentColor="#E1306C"
        variant="dark"
      />
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
    <p className="text-sm text-gray-700 leading-relaxed m-0">{desc}</p>
  </div>
);

export default WafArticle;
