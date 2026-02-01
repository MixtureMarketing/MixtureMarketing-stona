/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Rocket,
  ShieldCheck,
  Zap,
  Terminal,
  ChevronDown,
  Layout,
  Layers,
  Globe,
  Star,
  CheckCircle2,
  ArrowRight,
  Play,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { LEGACY_ARTICLES as ARTICLES } from '../../services/cms/legacyArticles';
import { Article } from '../../types';
import {
  NextHeroRace,
  GoogleVisionDiagram,
  AppWeightVisual,
  NextJsQuiz,
} from './visuals/NextVisuals';

import { NEXTJS_ARTICLE_CONTENT } from '../../data/content/articles/nextjs';
import ArticleShell from './ArticleShell';
import BaseCta from '../common/BaseCta';
import ArticleComparisonTable from './shared/ArticleComparisonTable';

const NextJsArticle = () => {
  const articleData = (ARTICLES.find((a) => a.id === 'nextjs-zloty-standard') ||
    {}) as Partial<Article>;
  const [showCode, setShowCode] = useState(false);
  const content = NEXTJS_ARTICLE_CONTENT;

  return (
    <ArticleShell
      id="nextjs-zloty-standard"
      title={`${content.header.title.line1}: ${content.header.title.line2} ${content.header.title.suffix}`}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData?.image || '/assets/images/nextjs.png'}
      icon={Code2}
      accentColor="#000000"
      heroVisual={<NextHeroRace />}
      slug="/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych"
    >
      <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
        <Layout className="text-secondary mt-1 shrink-0" size={20} />
        <div>
          <p className="text-sm text-secondary m-0 font-medium">
            {content.contextBox.text} <strong>{content.contextBox.subtitle}</strong>.
          </p>
          <Link
            to={content.contextBox.linkUrl}
            className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
          >
            {content.contextBox.linkText} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <AnimateOnScroll>
        <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl">
          {content.lead.highlight}
        </p>
        <p>{content.lead.text}</p>
      </AnimateOnScroll>

      {/* ENGINE VS CAR ANALOGY */}
      <div className="my-24 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Rocket size={150} />
        </div>
        <SectionHeader
          title={content.engineVsCar.title}
          subtitle={content.engineVsCar.subtitle}
          align="left"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark">{content.engineVsCar.reactCard.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {content.engineVsCar.reactCard.text}
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-secondary border border-[#cce4ff]">
              <Rocket size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark">{content.engineVsCar.nextCard.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {content.engineVsCar.nextCard.text}
            </p>
          </div>
        </div>
      </div>

      {/* RENDERING MAGIC */}
      <div className="my-24">
        <SectionHeader
          title={content.rendering.title}
          subtitle={content.rendering.subtitle}
          align="left"
        />
        <p>{content.rendering.text}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-12 not-prose">
          <div className="bg-[#F0F7FF] p-6 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest mb-3">
              <Star size={14} /> {content.rendering.cards[0].badge}
            </div>
            <p
              className="text-sm text-dark m-0 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.rendering.cards[0].text }}
            ></p>
          </div>
          <div className="bg-[#0B1120] p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-3">
              <Code2 size={14} /> {content.rendering.cards[1].badge}
            </div>
            <p
              className="text-sm text-gray-400 m-0 leading-relaxed font-mono"
              dangerouslySetInnerHTML={{ __html: content.rendering.cards[1].text }}
            ></p>
          </div>
        </div>

        <div className="my-12 not-prose">
          <GoogleVisionDiagram />
        </div>
      </div>

      {/* APP ROUTER & WEIGHT */}
      <div className="my-24">
        <SectionHeader
          title={content.appRouter.title}
          subtitle={content.appRouter.subtitle}
          align="left"
        />
        <p>{content.appRouter.text}</p>

        <div className="not-prose">
          <AppWeightVisual />
        </div>

        <div className="bg-[#F0F7FF] p-6 rounded-2xl border border-[#E0EFFF] mt-8 flex items-start gap-4">
          <div className="mt-1 text-secondary">
            <Zap size={20} />
          </div>
          <p className="text-sm m-0 font-medium text-dark">{content.appRouter.benefit}</p>
        </div>
      </div>

      {/* INFRASTRUCTURE & VERCEL */}
      <div className="my-24">
        <SectionHeader
          title={content.infrastructure.title}
          subtitle={content.infrastructure.subtitle}
          align="left"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose my-12">
          {content.infrastructure.cards.map((item, i) => {
            const icons = [
              <Rocket key="rocket" size={20} />,
              <ShieldCheck key="shield" size={20} />,
              <Globe key="globe" size={20} />,
            ];
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-secondary mb-4">{icons[i]}</div>
                <h4 className="font-bold text-dark mb-2">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <ArticleComparisonTable
        title={content.comparison.title}
        headers={content.comparison.headers}
        rows={content.comparison.rows}
      />

      {/* BRAND GIANTS */}
      <div className="my-24 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xxs font-black uppercase tracking-[0.2em] mb-8">
          {content.giants.badge}
        </div>
        <h3 className="text-2xl font-bold text-dark mb-12">{content.giants.title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
          <div className="flex justify-center">
            <span className="font-black text-2xl tracking-tighter">NETFLIX</span>
          </div>
          <div className="flex justify-center">
            <span className="font-black text-2xl tracking-tighter italic">TikTok</span>
          </div>
          <div className="flex justify-center">
            <span className="font-black text-2xl tracking-tighter">TWITCH</span>
          </div>
          <div className="flex justify-center">
            <span className="font-black text-2xl tracking-tighter">Hulu</span>
          </div>
          <div className="flex justify-center">
            <span className="font-black text-2xl tracking-tighter uppercase">Nike</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-12 italic">{content.giants.text}</p>
      </div>

      {/* DEVELOPER SECTION: CODE COLLAPSIBLE */}
      <div className="my-24 bg-[#0B1120] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden not-prose">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10"></div>
        <div className="relative z-10">
          <SectionHeader
            title={content.developer.title}
            subtitle={content.developer.subtitle}
            lightMode
            align="left"
          />
          <p className="text-gray-400 mb-8 max-w-2xl">{content.developer.text}</p>

          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all border border-white/10 mb-6"
          >
            <Terminal size={18} className="text-primary" />
            <span className="font-bold text-sm">
              {showCode ? 'Ukryj kod' : 'Pokaż przykład Server Component'}
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${showCode ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className={`transition-all duration-500 overflow-hidden ${showCode ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="bg-black/40 rounded-xl p-6 font-mono text-xs text-[#A6ACCD] border border-white/5 shadow-inner">
              <div className="flex gap-2 mb-4 opacity-40">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <pre className="overflow-x-auto">
                <code>{`// app/products/page.tsx - To jest Server Component!
import { db } from '@/lib/db';

async function getData() {
  // Pobieramy dane bezpośrednio z bazy na serwerze
  // Zero API calls z przeglądarki! Bezpiecznie i szybko.
  return await db.query('SELECT * FROM products');
}

export default async function Page() {
  const products = await getData();

  return (
    <main>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
              <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
                <Play className="text-primary fill-current" size={24} /> Czytaj dalej: Eksploruj
                Backend
              </h2>
      <ProductGrid items={products} />
    </main>
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE QUIZ */}
      <div className="my-24">
        <NextJsQuiz />
      </div>

      <BaseCta
        title={content.cta.title}
        description={content.cta.text}
        buttonText={content.cta.primaryBtn}
        buttonLink="/web-development/custom-app/"
        secondaryButtonText={content.cta.secondaryBtn}
        secondaryButtonLink="/contact/"
        badges={content.cta.badges}
        variant="gradient"
        icon={Rocket}
      />
    </ArticleShell>
  );
};

export default NextJsArticle;
