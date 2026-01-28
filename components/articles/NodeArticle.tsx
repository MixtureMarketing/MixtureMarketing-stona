/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Zap,
  Globe,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Code2,
  Database,
  Users,
  Radio,
  Video,
  Layout,
  Hexagon,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import { ARTICLES } from '../../data/articles';
import RelatedArticles from './RelatedArticles';
import { NodeHeroVisual, RestaurantAnalogyVisual, NodeWarningTable } from './visuals/NodeVisuals';
import { NODE_ARTICLE_CONTENT } from '../../data/content/articles/node';

const NodeArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'nodejs-jeden-jezyk');
  const [scrollProgress, setScrollProgress] = useState(0);
  const content = NODE_ARTICLE_CONTENT;

  // Handle scroll progress
  React.useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-[#339933]/20 font-sans">
      <Seo
        title={
          articleData?.title ||
          `${content.header.title.line1} ${content.header.title.line2} ${content.header.quote}`
        }
        description={articleData?.description || content.lead.text1}
        image={articleData?.image}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-dark via-[#339933] to-dark shadow-[0_0_10px_rgba(51,153,51,0.5)] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E8B57] text-xs font-bold uppercase tracking-wider mb-8 border border-[#339933]/20">
              <Hexagon size={12} fill="currentColor" />
              <span>{content.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {content.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark via-[#339933] to-dark">
                {content.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium italic border-l-4 border-[#339933] pl-6 py-2 bg-green-50/30 rounded-r-xl">
              {content.header.quote}
            </p>
          </header>

          {/* HERO VISUAL */}
          <div className="mb-20">
            <NodeHeroVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#339933] hover:prose-a:text-[#2E8B57] prose-strong:text-dark prose-li:text-gray-700">
            <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
              <Server className="text-secondary mt-1 shrink-0" size={20} />
              <div>
                <p className="text-sm text-secondary m-0 font-medium">{content.contextBox.text}</p>
                <Link
                  to={content.contextBox.linkUrl}
                  className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
                >
                  {content.contextBox.linkText} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <AnimateOnScroll>
              <p className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed">
                {content.lead.text1}
              </p>
              <p dangerouslySetInnerHTML={{ __html: content.lead.text2 }}></p>
            </AnimateOnScroll>

            {/* RESTAURANT ANALOGY */}
            <div className="my-24">
              <SectionHeader
                title={content.eventLoop.title}
                subtitle={content.eventLoop.subtitle}
                align="left"
              />
              <p>{content.eventLoop.text}</p>

              <div className="not-prose">
                <RestaurantAnalogyVisual />
              </div>

              <div className="bg-[#E8F5E9] text-[#2E8B57] p-6 rounded-2xl border border-[#339933]/20 text-center font-bold text-sm not-prose">
                {content.eventLoop.conclusion}
              </div>
            </div>

            {/* BUSINESS ARGUMENT: JS EVERYWHERE */}
            <div className="my-24">
              <SectionHeader
                title={content.jsEverywhere.title}
                subtitle={content.jsEverywhere.subtitle}
                align="left"
              />
              <p
                className="mb-8"
                dangerouslySetInnerHTML={{ __html: content.jsEverywhere.text }}
              ></p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
                {content.jsEverywhere.cards.map((card, i) => {
                  const icons = [
                    <Users key="users" size={24} />,
                    <Code2 key="code" size={24} />,
                    <Globe key="globe" size={24} />,
                  ];
                  const bgColors = ['bg-yellow-100', 'bg-blue-100', 'bg-green-100'];
                  const textColors = ['text-yellow-600', 'text-blue-600', 'text-green-600'];
                  return (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                    >
                      <div
                        className={`w-12 h-12 ${bgColors[i]} rounded-xl flex items-center justify-center ${textColors[i]} mb-4 group-hover:scale-110 transition-transform`}
                      >
                        {icons[i]}
                      </div>
                      <h4 className="font-bold text-dark mb-2">{card.title}</h4>
                      <p className="text-xs text-gray-600">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* USE CASES */}
            <div className="my-24">
              <SectionHeader
                title={content.useCases.title}
                subtitle={content.useCases.subtitle}
                align="left"
              />

              <div className="space-y-6 not-prose mt-8">
                {content.useCases.cards.map((card, i) => {
                  const icons = [
                    <Radio key="radio" size={24} />,
                    <Video key="video" size={24} />,
                    <Server key="server" size={24} />,
                  ];
                  const bgColors = ['bg-purple-100', 'bg-red-100', 'bg-orange-100'];
                  const textColors = ['text-purple-600', 'text-red-600', 'text-orange-600'];
                  return (
                    <div
                      key={i}
                      className="flex gap-6 items-start p-6 bg-white rounded-3xl border border-gray-100"
                    >
                      <div
                        className={`w-12 h-12 ${bgColors[i]} rounded-full flex items-center justify-center ${textColors[i]} shrink-0`}
                      >
                        {icons[i]}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-dark">{card.title}</h4>
                        <p
                          className="text-sm text-gray-600 mt-2 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: card.desc }}
                        ></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NESTJS */}
            <div className="my-24 bg-[#E0234E]/5 p-8 md:p-12 rounded-[2.5rem] border border-[#E0234E]/10 relative overflow-hidden not-prose">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Layout size={150} />
              </div>
              <SectionHeader
                title={content.nestjs.title}
                subtitle={content.nestjs.subtitle}
                align="left"
              />
              <p
                className="text-gray-700 mb-8 max-w-2xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.nestjs.text }}
              ></p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E0234E] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#E0234E]/20">
                <CheckCircle2 size={16} /> {content.nestjs.badge}
              </div>
            </div>

            {/* WARNING TABLE */}
            <div className="my-24">
              <SectionHeader
                title={content.warning.title}
                subtitle={content.warning.subtitle}
                align="left"
              />
              <div className="not-prose">
                <NodeWarningTable />
              </div>
            </div>

            {/* SUMMARY & CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#339933] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F7DF1E] rounded-full blur-[100px] opacity-10"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Hexagon
                        size={40}
                        className="text-[#339933]"
                        fill="currentColor"
                        fillOpacity={0.2}
                      />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{content.cta.title}</h2>
                    <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {content.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl shadow-[#339933]/20 !bg-[#339933] border-none text-white hover:!bg-[#2E8B57]"
                        onClick={() => (window.location.href = '/web-development/custom-app/')}
                      >
                        {content.cta.primaryBtn}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                        size="lg"
                        onClick={() => (window.location.href = '/baza-wiedzy/')}
                      >
                        {content.cta.secondaryBtn}
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <RelatedArticles currentArticleId="nodejs-jeden-jezyk" category="tech" />
          </article>
        </div>
      </div>
    </div>
  );
};

export default NodeArticle;
