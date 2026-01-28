import React from 'react';
import {
  Shield,
  Globe,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Server,
  Database,
  Network,
  Cloud,
  Smartphone,
  Settings,
  Ghost,
  Cpu,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Image from '../common/Image';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import RelatedArticles from './RelatedArticles';
import { ARTICLES } from '../../data/articles';
import { SST_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/sst';

const ServerSideTrackingArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'server-side-tracking');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/30 font-sans">
      <Seo
        title={articleData?.title || CONTENT.header.title.line1 + ' ' + CONTENT.header.title.line2}
        description={
          articleData?.description ||
          'Twoje kampanie tracą skuteczność przez iOS i AdBlocki? Poznaj Server-Side Tracking (SST).'
        }
        image={articleData?.image}
        article={articleData}
      />

      <AmbientBackground />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes data-flow {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(400%); opacity: 0; }
        }
        @keyframes cookie-crumble {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(0.8) rotate(10deg); opacity: 0.5; }
          100% { transform: scale(0) rotate(20deg); opacity: 0; }
        }
      `}</style>

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
              <Database size={12} />
              <span>{CONTENT.header.badge}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {CONTENT.header.title.line1} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>
          </header>

          {/* Hero Image */}
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <Image
              src="/assets/images/server-side-tracking.png"
              alt="Server-Side Tracking and Data Privacy"
              className="w-full h-[400px] object-cover"
              priority
            />
          </div>

          {/* Hero Visual - Comparison Split */}
          <div className="mb-20">
            <HeroComparisonVisual />
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-600 prose-a:text-secondary hover:prose-a:text-primary prose-strong:text-dark prose-li:text-gray-600">
            <AnimateOnScroll>
              <p
                className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-amber-500 pl-6 py-2 bg-amber-50/30 rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
              />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
              <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
            </AnimateOnScroll>

            {/* WHY PIXEL BLIND */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.whyBlind.title}
                subtitle={CONTENT.whyBlind.subtitle}
                align="left"
              />
              <p>{CONTENT.whyBlind.text}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-12 not-prose">
                {CONTENT.whyBlind.items.map((item, i) => (
                  <div
                    key={i}
                    className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  >
                    <div className="w-12 h-12 bg-gray-50 text-secondary rounded-xl flex items-center justify-center mb-4">
                      {i === 0 ? <Smartphone /> : i === 1 ? <Shield /> : <Globe />}
                    </div>
                    <h3 className="font-bold text-dark mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* THE SOLUTION: SST */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.solution.title}
                subtitle={CONTENT.solution.subtitle}
                align="left"
              />
              <p>{CONTENT.solution.text}</p>

              <div className="my-12 not-prose">
                <ArchitectureVisual />
              </div>

              <div className="bg-dark text-white p-10 rounded-[2.5rem] my-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20"></div>
                <h3 className="text-2xl font-bold text-white mb-6 mt-0 flex items-center gap-3">
                  <Zap className="text-amber-400" /> {CONTENT.solution.bar.title}
                </h3>
                <p className="text-gray-300 text-lg mb-0 leading-relaxed">
                  <strong>Client-Side:</strong> {CONTENT.solution.bar.client} <br />
                  <br />
                  <strong>Server-Side:</strong> {CONTENT.solution.bar.server}
                </p>
              </div>
            </div>

            {/* KEY TECHS */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.techs.title}
                subtitle={CONTENT.techs.subtitle}
                align="left"
              />
              <p>{CONTENT.techs.text}</p>

              <div className="space-y-8 mt-12 not-prose">
                {CONTENT.techs.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center"
                  >
                    <div
                      className={`w-20 h-20 ${i === 0 ? 'bg-instagram/10 text-instagram' : 'bg-blue-50 text-[#4285F4]'} rounded-2xl flex items-center justify-center shrink-0`}
                    >
                      {i === 0 ? <Network size={40} /> : <Settings size={40} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-700 mb-4">{item.desc}</p>
                      <div className="flex gap-3">
                        {item.badges.map((badge, j) => (
                          <span
                            key={j}
                            className={`text-xxs font-bold ${j === 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'} px-2 py-1 rounded-full border uppercase tracking-widest`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CASE STUDY */}
            <div className="my-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden not-prose">
              <div className="bg-dark p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                    {CONTENT.caseStudy.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white m-0">{CONTENT.caseStudy.title}</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="font-bold text-dark mb-4">{CONTENT.caseStudy.before.title}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-700">Backend sklepu:</span>
                        <span className="font-bold">{CONTENT.caseStudy.before.backend}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-700">Menadżer Reklam Meta:</span>
                        <span className="font-bold text-red-500">
                          {CONTENT.caseStudy.before.meta}
                        </span>
                      </div>
                      <div className="p-4 bg-red-50 rounded-xl">
                        <div className="text-red-800 font-bold text-lg">
                          {CONTENT.caseStudy.before.gap}
                        </div>
                        <p className="text-xxs text-red-600 uppercase font-black m-0">
                          {CONTENT.caseStudy.before.label}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark mb-4">{CONTENT.caseStudy.after.title}</h3>
                    <div className="space-y-6">
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-green-800 uppercase">
                            Match Rate Meta
                          </span>
                          <span className="text-xl font-black text-green-600">
                            {CONTENT.caseStudy.after.matchRate}
                          </span>
                        </div>
                        <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-[90%]"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-black text-dark">
                            {CONTENT.caseStudy.after.attribution}
                          </div>
                          <div className="text-xxs text-gray-600 uppercase font-bold">
                            Atrybucja
                          </div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-xl text-center border border-primary/20">
                          <div className="text-2xl font-black text-secondary">
                            {CONTENT.caseStudy.after.roas}
                          </div>
                          <div className="text-xxs text-gray-600 uppercase font-bold">
                            Wzrost ROAS
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WHY SOFTWARE HOUSE */}
            <div className="my-24">
              <SectionHeader
                title={CONTENT.whySoftwareHouse.title}
                subtitle={CONTENT.whySoftwareHouse.subtitle}
                align="left"
              />
              <p>{CONTENT.whySoftwareHouse.text}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-12 not-prose">
                {CONTENT.whySoftwareHouse.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm"
                  >
                    {i === 0 ? (
                      <Cloud className="text-primary mb-4" size={32} />
                    ) : i === 1 ? (
                      <Globe className="text-primary mb-4" size={32} />
                    ) : (
                      <Cpu className="text-primary mb-4" size={32} />
                    )}
                    <h5 className="font-bold text-dark mb-2">{item.title}</h5>
                    <p className="text-xs text-gray-700">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="italic text-gray-700 border-l-4 border-gray-200 pl-6">
                {CONTENT.whySoftwareHouse.quote}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-32">
              <AnimateOnScroll>
                <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-40"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
                      <Server size={40} className="text-white animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
                    <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                      {CONTENT.cta.text}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-xl"
                        onClick={() => openModal('audit')}
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

            <RelatedArticles currentArticleId="server-side-tracking" category="analytics" />
          </article>
        </div>
      </div>
    </div>
  );
};

// --- VISUAL COMPONENTS ---

const HeroComparisonVisual = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[350px] overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-2xl not-prose">
      {/* Left: Past (Client-Side) */}
      <div className="relative bg-gray-50 p-8 flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 relative group">
            <div className="text-amber-700 relative overflow-hidden flex items-center justify-center">
              <div className="text-4xl animate-cookie-crumble origin-center">🍪</div>
            </div>
            <XCircle
              className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full"
              size={20}
            />
          </div>
          <h3 className="text-lg font-bold text-gray-600 uppercase tracking-widest mb-2">
            Przeszłość
          </h3>
          <p className="text-gray-600 text-sm font-medium">Client-Side Tracking</p>
          <div className="mt-4 flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
            <Ghost size={14} className="animate-bounce" /> Dane zablokowane
          </div>
        </div>
      </div>

      {/* Right: Future (Server-Side) */}
      <div className="relative bg-dark p-8 flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-primary rounded-2xl shadow-[0_0_30px_rgba(97,182,222,0.4)] flex items-center justify-center text-white border border-white/20">
              <Server size={40} />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-primary to-emerald-400 animate-pulse"></div>
          </div>
          <h3 className="text-lg font-bold text-primary uppercase tracking-widest mb-2">
            Przyszłość
          </h3>
          <p className="text-white text-sm font-medium">Server-Side Tracking</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <Shield size={14} /> Pełna Kontrola & ROI
          </div>
        </div>
      </div>
    </div>
  );
};

const ArchitectureVisual = () => {
  return (
    <div className="bg-[#0B1120] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-5"></div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
        {/* 1. Browser */}
        <div className="flex flex-col items-center gap-3 w-32">
          <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white">
            <Globe size={32} />
          </div>
          <span className="text-xxs font-bold text-gray-600 uppercase tracking-wider text-center">
            Użytkownik / Przeglądarka
          </span>
        </div>

        {/* Arrow 1 */}
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-primary to-white/10 relative overflow-hidden min-w-[40px] hidden md:block">
          <div className="absolute inset-0 bg-blue-400 w-4 h-full animate-data-flow"></div>
        </div>
        <div className="md:hidden text-white/20 rotate-90">
          <ArrowRight />
        </div>

        {/* 2. Your Server (GTM) */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary rounded-full blur-[30px] opacity-20 animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-secondary to-dark rounded-3xl border border-white/20 flex items-center justify-center text-primary shadow-2xl relative z-10 group hover:scale-105 transition-transform">
              <Server size={48} />
              <div className="absolute -top-2 -right-2 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#0B1120] animate-ping"></div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs font-black text-white uppercase tracking-widest block">
              Twój Serwer
            </span>
            <span className="text-xxs text-primary font-bold uppercase">(GTM Server-Side)</span>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-primary to-white/10 relative overflow-hidden min-w-[40px] hidden md:block">
          <div
            className="absolute inset-0 bg-blue-400 w-4 h-full animate-data-flow"
            style={{ animationDelay: '0.5s' }}
          ></div>
        </div>
        <div className="md:hidden text-white/20 rotate-90">
          <ArrowRight />
        </div>

        {/* 3. API Logos */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <div className="text-xs font-black text-white uppercase tracking-tighter">Meta</div>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <div className="text-xs font-black text-white uppercase tracking-tighter">Google</div>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
        <Shield size={12} className="text-emerald-500" />
        <span className="text-xxs font-bold text-emerald-400 uppercase tracking-widest">
          Omijanie AdBlockerów & iOS Tracking Protection
        </span>
      </div>
    </div>
  );
};

export default ServerSideTrackingArticle;
