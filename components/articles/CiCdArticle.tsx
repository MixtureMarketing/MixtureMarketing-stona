import React from 'react';
import {
  Server,
  Rocket,
  Settings,
  Clock,
  ShieldCheck,
  Bot,
  Workflow,
  ArrowRight,
  Truck,
  Zap,
  Check,
  Code2,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { useModal } from '../../context/ModalContext';
import { ARTICLES } from '../../data/articles';
import { CICD_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/cicd';
import ArticleShell from './ArticleShell';

const CiCdArticle = () => {
  const { openModal } = useModal();
  const articleData = ARTICLES.find((a) => a.id === 'ci-cd-automatyzacja');

  return (
    <ArticleShell
      id="ci-cd-automatyzacja"
      title={`${CONTENT.header.title.line1}: ${CONTENT.header.title.line2}`}
      description={CONTENT.header.subtitle}
      category="tech"
      categoryLabel={CONTENT.header.badge}
      image={articleData?.image || '/assets/images/CICD.png'}
      icon={Workflow}
      accentColor="#10B981"
      heroVisual={<CiCdHeroVisual />}
    >
      <AnimateOnScroll>
        <p
          className="lead text-2xl text-secondary mb-12 font-medium leading-relaxed border-l-4 border-primary pl-6 py-2 bg-blue-50/30 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: CONTENT.lead.highlight }}
        />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text1 }} />
        <p dangerouslySetInnerHTML={{ __html: CONTENT.lead.text2 }} />
      </AnimateOnScroll>

      {/* WHAT IS THIS ACRONYM */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.definitions.title}
          subtitle={CONTENT.definitions.subtitle}
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 not-prose">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">
                {CONTENT.definitions.items[0].title}
              </h3>
              <div className="text-xs font-bold uppercase text-blue-500 tracking-widest mb-4">
                {CONTENT.definitions.items[0].label}
              </div>
              <p className="text-sm text-gray-600 mb-4">{CONTENT.definitions.items[0].desc}</p>
              <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <Check size={14} /> {CONTENT.definitions.items[0].guarantee}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Truck size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">
                {CONTENT.definitions.items[1].title}
              </h3>
              <div className="text-xs font-bold uppercase text-green-500 tracking-widest mb-4">
                {CONTENT.definitions.items[1].label}
              </div>
              <p className="text-sm text-gray-600 mb-4">{CONTENT.definitions.items[1].desc}</p>
              <div className="bg-blue-50 text-blue-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <Zap size={14} /> {CONTENT.definitions.items[1].guarantee}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VISUALIZATION: PIPELINE */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.visualization.title}
          subtitle={CONTENT.visualization.subtitle}
          align="left"
        />
        <p>{CONTENT.visualization.text}</p>

        <div className="my-12">
          <PipelineVisual />
        </div>
      </div>

      {/* 4 BUSINESS REASONS */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.reasons.title}
          subtitle={CONTENT.reasons.subtitle}
          align="left"
        />

        <div className="space-y-6 mt-12 not-prose">
          {CONTENT.reasons.items.map((reason, i) => (
            <div
              key={i}
              className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start group transition-colors`}
            >
              <div
                className={`w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors`}
              >
                {i === 0 ? (
                  <Clock size={24} />
                ) : i === 1 ? (
                  <ShieldCheck size={24} />
                ) : (
                  <Zap size={24} />
                )}
              </div>
              <div>
                <h4 className="font-bold text-dark text-lg mb-2">{reason.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANUAL VS AUTOMATED COMPARISON */}
      <div className="my-24">
        <SectionHeader
          title={CONTENT.comparison.title}
          subtitle={CONTENT.comparison.subtitle}
          align="left"
        />

        <div className="my-12 p-4 not-prose overflow-visible">
          <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-2xl">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-dark text-white">
                  <th className="p-6 font-bold uppercase tracking-wider text-xs">
                    {CONTENT.comparison.headers[0]}
                  </th>
                  <th className="p-6 font-bold uppercase tracking-wider text-xs text-center border-x border-white/10">
                    {CONTENT.comparison.headers[1]}
                  </th>
                  <th className="p-6 font-bold uppercase tracking-wider text-xs text-center">
                    {CONTENT.comparison.headers[2]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {CONTENT.comparison.rows.map((row, i) => (
                  <tr key={i}>
                    <td className="p-6 font-bold text-dark bg-gray-50/50">{row.label}</td>
                    <td
                      className={`p-6 text-center text-sm ${i === 1 || i === 3 ? 'text-red-600 font-bold' : 'text-gray-500 italic'}`}
                    >
                      {row.v1}
                    </td>
                    <td className="p-6 text-center text-sm text-emerald-600 font-black bg-emerald-50/30">
                      {row.v2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MYTH BUSTER */}
      <div className="my-24 bg-gradient-to-br from-[#E0EFFF] to-white rounded-[3rem] p-10 border border-[#cce4ff] relative overflow-hidden">
        <div className="absolute right-0 bottom-0 p-12 opacity-10">
          <Bot size={150} />
        </div>
        <div className="relative z-10">
          <SectionHeader title={CONTENT.myth.title} subtitle={CONTENT.myth.subtitle} align="left" />
          <p
            className="text-gray-700 leading-relaxed max-w-2xl"
            dangerouslySetInnerHTML={{ __html: CONTENT.myth.text }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                <Rocket size={40} className="text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">
                {CONTENT.cta.title}
              </h2>
              <p className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                {CONTENT.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-xl shadow-primary/20 px-10"
                  onClick={() => openModal('consultation')}
                >
                  {CONTENT.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10"
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

// --- VISUAL COMPONENTS ---

const CiCdHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[450px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.08] transform scale-150 rotate-12"></div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-scan-line"></div>
        <div
          className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-scan-line"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-scan-line"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      <div className="relative z-20 flex flex-col items-center">
        <div className="relative w-56 h-56 md:w-64 md:h-56 flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping opacity-20"></div>
          <div
            className="absolute inset-4 bg-blue-500/5 rounded-full animate-ping opacity-10"
            style={{ animationDelay: '0.5s' }}
          ></div>

          <div className="relative w-48 h-48 bg-gray-800 rounded-[2.5rem] border-8 border-gray-700 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center justify-center group/panel cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/panel:opacity-100 transition-opacity duration-500"></div>

            <div className="w-32 h-32 bg-green-500 rounded-full shadow-[0_0_40px_rgba(34,197,94,0.4),inset_0_4px_10px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center relative active:scale-90 transition-transform duration-100 group-hover/panel:bg-green-400 group-hover/panel:shadow-[0_0_60px_rgba(34,197,94,0.6)]">
              <Rocket size={40} className="text-white mb-1 drop-shadow-lg animate-bounce-gentle" />
              <span className="text-white font-black text-xl uppercase tracking-widest">
                Deploy
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-3 items-center">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500/40 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500/20 rounded-full"></div>
          </div>
          <span className="text-green-400 font-mono text-xxs uppercase tracking-[0.3em] font-bold">
            Pipeline Ready
          </span>
        </div>
      </div>

      <style>{`
                 @keyframes scan-line {
                     0% { transform: translateX(-100%) skewX(-45deg); opacity: 0; }
                     50% { opacity: 1; }
                     100% { transform: translateX(100%) skewX(-45deg); opacity: 0; }
                 }
                 .animate-scan-line {
                     animation: scan-line 6s linear infinite;
                 }
                 @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                 }
                 .animate-bounce-gentle {
                    animation: bounce-gentle 3s ease-in-out infinite;
                 }
             `}</style>
    </div>
  );
};

const PipelineVisual = () => {
  return (
    <div className="bg-[#1E293B] rounded-[3rem] p-8 md:p-12 border border-gray-700 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03]"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4 py-8">
        <div className="absolute top-[40px] left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 hidden md:block"></div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-3 relative z-10">
            <Code2 size={32} />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              1. Code
            </div>
            <div className="text-xxs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase font-bold">
              Git Push
            </div>
          </div>
        </div>

        <div className="text-blue-500/30 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 group-hover/item:-rotate-3 relative z-10 animate-pulse">
            <Settings size={32} className="animate-spin-slow" />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              2. Build (CI)
            </div>
            <div className="text-xxs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase font-bold">
              Compilation
            </div>
          </div>
        </div>

        <div className="text-blue-500/30 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 relative z-10">
            <ShieldCheck size={32} />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              3. Test (CI)
            </div>
            <div className="text-xxs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase font-bold">
              Unit & Integration
            </div>
          </div>
        </div>

        <div className="text-blue-500/30 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-6 relative z-10">
            <Server size={32} />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              4. Prod (CD)
            </div>
            <div className="text-xxs text-white bg-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter animate-pulse shadow-lg">
              System Live
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .animate-spin-slow {
                    animation: spin 4s linear infinite;
                }
            `}</style>
    </div>
  );
};

export default CiCdArticle;
