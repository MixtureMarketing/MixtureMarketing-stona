import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Layout,
  Smartphone,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import ArticleShell from './ArticleShell';
import { ARTICLES } from '../../data/articles';
import { REACT_ARTICLE_CONTENT } from '../../data/content/articles/react';
import {
  ReactHeroNetwork,
  InterfaceAssembly,
  ReactVennDiagram,
  ReactTrendChart,
} from './visuals/ReactVisuals';

const ReactJsArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'react-js-krol-frontendu');
  const content = REACT_ARTICLE_CONTENT;

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData.image}
      icon={Code2}
      accentColor="#61DAFB"
      heroVisual={<ReactHeroNetwork />}
      slug="/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu"
    >
      <div className="mb-16 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start gap-5 not-prose hover:shadow-md transition-shadow">
        <div className="bg-blue-50 p-3 rounded-full shrink-0 text-secondary">
          <Layout size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
            {content.contextBox.title}
          </p>
          <h4 className="text-lg font-bold text-dark mb-2">{content.contextBox.subtitle}</h4>
          <p className="text-sm text-gray-600 mb-3">{content.contextBox.text}</p>
          <Link
            to={content.contextBox.linkUrl}
            className="text-sm text-[#00A3CC] hover:text-[#61DAFB] font-bold inline-flex items-center gap-2 group"
          >
            {content.contextBox.linkText}{' '}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <AnimateOnScroll>
        <p className="lead text-2xl text-dark mb-12 font-medium leading-relaxed border-l-4 border-[#61DAFB] pl-6 py-2 bg-blue-50/30 rounded-r-xl">
          {content.lead.highlight}
        </p>
        <p>{content.lead.text}</p>
      </AnimateOnScroll>

      <div className="my-32">
        <SectionHeader
          title={content.componentRevolution.title}
          subtitle={content.componentRevolution.subtitle}
          align="center"
        />
        <p className="text-center max-w-2xl mx-auto mb-12">{content.componentRevolution.text}</p>
        <div className="not-prose mb-16">
          <InterfaceAssembly />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
          {content.componentRevolution.cards.map((card, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#61DAFB]/30 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#0088AA] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {i === 0 ? (
                  <Zap size={24} />
                ) : i === 1 ? (
                  <ShieldCheck size={24} />
                ) : (
                  <Layout size={24} />
                )}
              </div>
              <h4 className="font-bold text-dark mb-2">{card.title}</h4>
              <p className="text-sm text-gray-600 m-0 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-32 bg-[#0F172A] rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden not-prose shadow-2xl group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#61DAFB] rounded-full blur-[150px] opacity-10 group-hover:opacity-15 transition-opacity duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[120px] opacity-10"></div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#61DAFB] text-xs font-bold uppercase tracking-wider mb-6">
              <Users size={14} /> {content.busFactor.badge}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 mt-0 tracking-tight">
              {content.busFactor.title}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">{content.busFactor.text}</p>
            <ul className="space-y-4">
              {content.busFactor.list.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5"
                >
                  <div className="bg-green-500/20 p-1.5 rounded-full text-green-400">
                    <CheckCircle2 size={16} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 w-full flex justify-center">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md text-center relative overflow-hidden w-full max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-[#61DAFB]/10 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2">
                  {content.busFactor.stats.rank}
                </div>
                <div className="text-xs font-bold text-[#61DAFB] uppercase tracking-[0.3em] mb-8">
                  {content.busFactor.stats.rankLabel}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0F172A]/50 rounded-2xl border border-white/5">
                    <div className="text-2xl font-bold text-white">
                      {content.busFactor.stats.jobs}
                    </div>
                    <div className="text-xxs text-gray-500 uppercase tracking-wide mt-1">
                      {content.busFactor.stats.jobsLabel}
                    </div>
                  </div>
                  <div className="p-4 bg-[#0F172A]/50 rounded-2xl border border-white/5">
                    <div className="text-2xl font-bold text-[#059669]">
                      {content.busFactor.stats.market}
                    </div>
                    <div className="text-xxs text-gray-500 uppercase tracking-wide mt-1">
                      {content.busFactor.stats.marketLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={content.synergy.title}
          subtitle={content.synergy.subtitle}
          align="left"
        />
        <p dangerouslySetInnerHTML={{ __html: content.synergy.text }}></p>
        <div className="not-prose mt-12">
          <ReactVennDiagram />
        </div>
      </div>

      <div className="my-32 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden not-prose">
        <SectionHeader
          title={content.nextJs.title}
          subtitle={content.nextJs.subtitle}
          align="left"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 group hover:border-[#61DAFB] transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#61DAFB] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">
                R
              </div>
              <div>
                <span className="font-bold text-dark block text-lg">
                  {content.nextJs.reactCard.title}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  {content.nextJs.reactCard.subtitle}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{content.nextJs.reactCard.text}</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-black transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg">
                N
              </div>
              <div>
                <span className="font-bold text-dark block text-lg">
                  {content.nextJs.nextCard.title}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  {content.nextJs.nextCard.subtitle}
                </span>
              </div>
            </div>
            <p
              className="text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.nextJs.nextCard.text }}
            ></p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
            <CheckCircle2 size={14} /> {content.nextJs.conclusion}
          </div>
        </div>
      </div>

      <div className="my-32">
        <SectionHeader
          title={content.trends.title}
          subtitle={content.trends.subtitle}
          align="center"
        />
        <p className="text-center mb-12 max-w-2xl mx-auto">{content.trends.text}</p>
        <div className="not-prose">
          <ReactTrendChart />
        </div>
      </div>

      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-gradient-to-br from-[#0B1120] to-[#1e293b] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#61DAFB] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(97,218,251,0.2)] border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Zap size={48} className="text-[#61DAFB]" fill="currentColor" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                {content.cta.title}
              </h2>
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {content.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-[#61DAFB]/20 !bg-[#61DAFB] border-none text-[#0B1120] font-black hover:!bg-[#00D8FF] px-10 py-4"
                  onClick={() => (window.location.href = '/web-development/custom-app/')}
                >
                  {content.cta.primaryBtn}
                </Button>
                <Button
                  variant="white"
                  className="text-white border-white/20 hover:bg-white/10 px-10 py-4"
                  size="lg"
                  onClick={() => (window.location.href = '/contact/')}
                >
                  {content.cta.secondaryBtn}
                </Button>
              </div>
              <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60">
                {content.cta.badges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest"
                  >
                    {i === 0 ? (
                      <ShieldCheck size={16} className="text-[#61DAFB]" />
                    ) : i === 1 ? (
                      <Globe size={16} className="text-[#61DAFB]" />
                    ) : (
                      <Smartphone size={16} className="text-[#61DAFB]" />
                    )}
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </ArticleShell>
  );
};

export default ReactJsArticle;
