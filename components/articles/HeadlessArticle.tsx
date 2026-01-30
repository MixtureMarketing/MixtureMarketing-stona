import React, { useState } from 'react';
import {
  Terminal,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Globe,
  Info,
  Layers,
  Scissors,
  ArrowRight,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { ARTICLES } from '../../data/articles';
import { HEADLESS_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/headless';
import {
  HeadlessHeroVisual,
  ArchitectureDiagram,
  OmnichannelVisual,
} from './visuals/HeadlessVisuals';
import ArticleShell from './ArticleShell';

const HeadlessArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'headless-wordpress');
  const [showCode, setShowCode] = useState(false);

  return (
    <ArticleShell
      id="headless-wordpress"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/headless-wordpress.png'}
      icon={Layers}
      accentColor="#3B82F6"
      heroVisual={<HeadlessHeroVisual />}
    >
      <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
        <Info className="text-secondary mt-1 shrink-0" size={20} />
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
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text }} />
      </AnimateOnScroll>

      {/* WHAT IS HEADLESS SECTION */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.whatIs.title}
          subtitle={CONTENT.whatIs.subtitle}
          align="left"
        />
        <p>{CONTENT.whatIs.text}</p>

        <div className="my-12 not-prose">
          <ArchitectureDiagram />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 not-prose">
          {CONTENT.whatIs.items.map((item, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xxs font-black text-primary uppercase mb-2">{item.label}</div>
              <p className="text-xs m-0" dangerouslySetInnerHTML={{ __html: item.desc }} />
            </div>
          ))}
        </div>
      </div>

      {/* BUSINESS BENEFITS */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.benefits.title}
          subtitle={CONTENT.benefits.subtitle}
          align="left"
        />

        <div className="space-y-12 mt-12 not-prose">
          {CONTENT.benefits.items.map((benefit, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start">
              <div
                className={`w-12 h-12 ${i === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : i === 1 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'} rounded-xl flex items-center justify-center shrink-0 border shadow-sm`}
              >
                {i === 0 ? (
                  <Zap size={24} />
                ) : i === 1 ? (
                  <ShieldCheck size={24} />
                ) : (
                  <Globe size={24} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark mb-2">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="not-prose">
          <OmnichannelVisual />
        </div>
      </div>

      {/* FOR DEVELOPERS: GRAPHQL */}
      <div className="my-24 bg-[#0B1120] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden not-prose border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10"></div>
        <div className="relative z-10">
          <SectionHeader
            title={CONTENT.developers.title}
            subtitle={CONTENT.developers.subtitle}
            lightMode
            align="left"
          />
          <p
            className="text-gray-400 mb-8 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: CONTENT.developers.text }}
          />

          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all border border-white/10 mb-6"
          >
            <Terminal size={18} className="text-primary" />
            <span className="font-bold text-sm">
              {showCode ? CONTENT.developers.btnHide : CONTENT.developers.btnShow}
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${showCode ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className={`transition-all duration-500 overflow-hidden ${showCode ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="bg-black/40 rounded-xl p-6 font-mono text-xs text-[#A6ACCD] border border-white/5">
              <pre className="overflow-x-auto">
                <code>{`query GetPosts {
  posts {
    nodes {
      title
      content
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* SHOULD YOU USE IT? */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.analysis.title}
          subtitle={CONTENT.analysis.subtitle}
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 not-prose">
          <div className="p-8 bg-red-50/30 rounded-[2rem] border border-red-100">
            <div className="flex items-center gap-2 text-red-600 font-black uppercase text-xs tracking-widest mb-6">
              <XCircle size={16} /> {CONTENT.analysis.bad.title}
            </div>
            <ul className="space-y-4">
              {CONTENT.analysis.bad.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-red-400 mt-1 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 bg-emerald-50/30 rounded-[2rem] border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-xs tracking-widest mb-6">
              <CheckCircle2 size={16} /> {CONTENT.analysis.good.title}
            </div>
            <ul className="space-y-4">
              {CONTENT.analysis.good.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-1 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SUMMARY & CTA */}
      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Scissors size={40} className="text-white -rotate-45" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
              <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {CONTENT.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-primary/20"
                  onClick={() => (window.location.href = '/web-development/corporate/')}
                >
                  {CONTENT.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white"
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

export default HeadlessArticle;
