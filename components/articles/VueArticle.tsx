import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Zap,
  CheckCircle2,
  ArrowRight,
  Layout,
  Code2,
  Layers,
  Globe,
  Box,
  Users,
  FileCode,
  Settings,
  Cpu,
} from 'lucide-react';

import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import ArticleShell from './ArticleShell';
import { ARTICLES } from '../../data/articles';
import { VUE_ARTICLE_CONTENT } from '../../data/content/articles/vue';

const VueArticle = () => {
  const articleData = ARTICLES.find((a) => a.id === 'vue-js-harmonijny-kompromis');
  const content = VUE_ARTICLE_CONTENT;

  if (!articleData) return null;

  return (
    <ArticleShell
      id={articleData.id}
      title={articleData.title}
      description={content.header.subtitle}
      category="tech"
      categoryLabel={content.header.badge}
      image={articleData.image}
      icon={Heart}
      accentColor="#42B883"
      heroVisual={<VueHeroVisual />}
    >
      {/* Context Link */}
      <div className="mb-16 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start gap-5 not-prose hover:shadow-md transition-shadow">
        <div className="bg-blue-50 p-3 rounded-full shrink-0">
          <Layout className="text-secondary" size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
            {content.contextBox.title}
          </p>
          <h4 className="text-lg font-bold text-dark mb-2">{content.contextBox.subtitle}</h4>
          <p className="text-sm text-gray-600 mb-3">{content.contextBox.text}</p>
          <Link
            to={content.contextBox.linkUrl}
            className="text-sm text-[#42B883] hover:text-[#35495E] font-bold inline-flex items-center gap-2 group"
          >
            {content.contextBox.linkText}{' '}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <AnimateOnScroll>
        <p className="lead text-2xl text-[#35495E] mb-12 font-medium leading-relaxed border-l-4 border-[#42B883] pl-6 py-2 bg-emerald-50/30 rounded-r-xl">
          {content.lead.highlight}
        </p>
        <p>{content.lead.text}</p>
      </AnimateOnScroll>

      {/* THE SPECTRUM VISUAL */}
      <div className="my-32">
        <SectionHeader
          title={content.spectrum.title}
          subtitle={content.spectrum.subtitle}
          align="center"
        />
        <p className="text-center max-w-2xl mx-auto mb-12">{content.spectrum.text}</p>
        <div className="not-prose">
          <FrameworkSpectrum />
        </div>
      </div>

      {/* WHAT IS PROGRESSIVE FRAMEWORK */}
      <div className="my-32">
        <SectionHeader
          title={content.progressive.title}
          subtitle={content.progressive.subtitle}
          align="left"
        />
        <p>{content.progressive.text}</p>

        <div className="not-prose mt-12">
          <ProgressiveScalingVisual />
        </div>
      </div>

      {/* 3 BUSINESS REASONS */}
      <div className="my-32">
        <SectionHeader
          title={content.businessReasons.title}
          subtitle={content.businessReasons.subtitle}
          align="left"
        />

        <div className="space-y-8 mt-12 not-prose">
          {content.businessReasons.cards.map((reason, i) => {
            const icons = [
              <Users key="users" className="text-[#42B883]" />,
              <Zap key="zap" className="text-amber-500" />,
              <Box key="box" className="text-blue-500" />,
            ];
            return (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-6 items-start p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#42B883]/30 transition-all group"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-[#42B883] group-hover:text-white transition-colors duration-300">
                  {React.cloneElement(icons[i] as React.ReactElement<{ size?: number }>, {
                    size: 32,
                  })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-[#42B883] transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed m-0">{reason.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TECH CORNER: SFC */}
      <div className="my-32">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <SectionHeader
              title={content.techCorner.title}
              subtitle={content.techCorner.subtitle}
              align="left"
            />
            {content.techCorner.text.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }}></p>
            ))}
          </div>
          <div className="flex-1 w-full not-prose">
            <VueSfcPreview />
          </div>
        </div>
      </div>

      {/* NUXT.JS & SEO */}
      <div className="my-32 bg-white p-8 md:p-16 rounded-[3rem] border border-emerald-100 shadow-xl relative overflow-hidden not-prose group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Globe size={200} className="text-emerald-900" />
        </div>
        <div className="relative z-10">
          <SectionHeader title={content.nuxt.title} subtitle={content.nuxt.subtitle} align="left" />
          <p
            className="text-gray-600 mb-8 max-w-2xl leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: content.nuxt.text }}
          ></p>
          <div className="flex wrap gap-4">
            {content.nuxt.badges.map((badge, i) => (
              <div
                key={i}
                className="bg-emerald-50 text-emerald-800 px-5 py-3 rounded-2xl text-sm font-bold border border-emerald-200 flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 size={18} className="text-[#42B883]" /> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BIG COMPARISON TABLE */}
      <div className="my-32">
        <SectionHeader
          title={content.comparison.title}
          subtitle={content.comparison.subtitle}
          align="center"
        />
        <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-2xl mt-12 not-prose bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#35495E] text-white">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {content.comparison.headers[0]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-[#42B883]">
                  {content.comparison.headers[1]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {content.comparison.headers[2]}
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-wider opacity-80">
                  {content.comparison.headers[3]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {content.comparison.rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/50">{row.feature}</td>
                  <td className="p-6 text-[#00684A] font-bold bg-emerald-50/30">{row.vue}</td>
                  <td className="p-6 text-gray-600">{row.react}</td>
                  <td className="p-6 text-gray-600">{row.angular}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY & CTA */}
      <div className="mt-32">
        <AnimateOnScroll>
          <div className="rounded-[3rem] p-12 text-center shadow-2xl bg-dark relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#42B883] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#35495E] rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Heart size={48} className="text-[#42B883]" fill="currentColor" />
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
                  className="shadow-xl shadow-[#42B883]/20 !bg-[#42B883] border-none text-dark font-black hover:!bg-[#3AA675] px-10 py-4"
                  onClick={() => (window.location.href = '/web-development/custom-app/')}
                >
                  {content.cta.primaryBtn}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10 py-4"
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
    </ArticleShell>
  );
};

// ==========================================
// VISUAL COMPONENTS (EMBEDDED FOR PORTABILITY)
// ==========================================

const VueHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#1B2430] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-[#42B883]/20 shadow-2xl min-h-[500px] flex items-center justify-center group">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(66,184,131,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(66,184,131,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1B2430] via-transparent to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* 3D Floating Logo Concept */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-8 animate-float">
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-[#42B883] rounded-full blur-[80px] opacity-20 animate-pulse"></div>

          {/* Glass Shield */}
          <div className="relative w-full h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-45 group-hover:rotate-[40deg] transition-all duration-700">
            {/* Inner Vue Logo Construction */}
            <div className="w-2/3 h-2/3 relative transform -rotate-45">
              {/* V Shape Green */}
              <div className="absolute top-0 left-0 w-full h-full text-[#42B883] drop-shadow-[0_0_15px_rgba(66,184,131,0.5)]">
                <svg viewBox="0 0 261.76 226.69" fill="currentColor">
                  <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" />
                </svg>
              </div>
              {/* V Shape Blue */}
              <div className="absolute top-0 left-0 w-full h-full text-[#35495E] scale-50 translate-y-[-10%] drop-shadow-lg">
                <svg viewBox="0 0 261.76 226.69" fill="currentColor">
                  <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Orbiting Elements */}
          <div className="absolute -right-8 top-0 animate-bounce-slow">
            <div className="bg-[#35495E] text-white p-3 rounded-xl shadow-lg border border-[#42B883]/30 text-xs font-bold font-mono">
              .vue
            </div>
          </div>
          <div className="absolute -left-8 bottom-0 animate-bounce-slow delay-700">
            <div className="bg-[#42B883] text-[#1B2430] p-3 rounded-xl shadow-lg text-xs font-bold font-mono">
              Composition API
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            The <span className="text-[#42B883]">Progressive</span> Framework
          </h2>
          <p className="text-[#42B883]/80 font-mono text-sm uppercase tracking-[0.3em]">
            Versatile • Performant • Approachable
          </p>
        </div>
      </div>

      <style>{`
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounceSlow 4s infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
    </div>
  );
};

const FrameworkSpectrum = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-[2.5rem] p-8 md:p-12 border border-gray-200 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#61DAFB] via-[#42B883] to-[#DD0031]"></div>

      <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
        {/* React */}
        <div className="flex-1 text-center opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 mx-auto bg-[#61DAFB]/10 rounded-full flex items-center justify-center mb-4">
            <Box className="text-[#61DAFB]" size={32} />
          </div>
          <h4 className="font-bold text-dark">React</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Totalna Swoboda</p>
          <p className="text-xs text-gray-400 mt-2">Wymaga wielu decyzji</p>
        </div>

        {/* Vue - The Sweet Spot */}
        <div className="flex-1 text-center transform scale-110">
          <div className="relative">
            <div className="absolute inset-0 bg-[#42B883] blur-[40px] opacity-20 rounded-full"></div>
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4 border-4 border-[#42B883] shadow-xl relative z-10">
              <Heart className="text-[#42B883]" size={40} fill="currentColor" />
            </div>
          </div>
          <h4 className="text-2xl font-black text-dark">Vue.js</h4>
          <div className="inline-block bg-[#42B883] text-white text-xxs font-bold px-3 py-1 rounded-full uppercase tracking-widest mt-2 mb-2">
            Harmonijny Kompromis
          </div>
          <p className="text-sm text-gray-600 font-medium">Struktura + Elastyczność</p>
        </div>

        {/* Angular */}
        <div className="flex-1 text-center opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 mx-auto bg-[#DD0031]/10 rounded-full flex items-center justify-center mb-4">
            <Layers className="text-[#DD0031]" size={32} />
          </div>
          <h4 className="font-bold text-dark">Angular</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Pełna Struktura</p>
          <p className="text-xs text-gray-400 mt-2">Sztywne ramy</p>
        </div>
      </div>

      {/* Connecting Line */}
      <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-200 -z-0 hidden md:block"></div>
    </div>
  );
};

const ProgressiveScalingVisual = () => {
  return (
    <div className="bg-[#1e293b] p-8 rounded-[2.5rem] shadow-2xl border border-gray-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#42B883] rounded-full blur-[100px] opacity-10"></div>

      <div className="flex flex-col items-center justify-center gap-6 relative z-10">
        {/* Core */}
        <div className="w-32 h-32 bg-[#42B883] rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(66,184,131,0.4)] z-30 border-4 border-[#1e293b]">
          <span className="text-white font-black text-lg">Vue Core</span>
          <span className="text-[#1e293b] text-xxs font-bold uppercase mt-1">The Library</span>
        </div>

        {/* Layers */}
        <div className="absolute w-64 h-64 border-2 border-dashed border-[#42B883]/30 rounded-full flex items-center justify-center z-20 animate-spin-slow">
          <div className="absolute top-4 bg-[#1e293b] px-2 text-[#42B883] text-xs font-mono">
            Components
          </div>
          <div className="absolute bottom-4 bg-[#1e293b] px-2 text-[#42B883] text-xs font-mono">
            Directives
          </div>
        </div>

        <div className="absolute w-96 h-96 border border-[#42B883]/20 rounded-full flex items-center justify-center z-10">
          <div className="absolute -top-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Settings size={12} /> Vue Router
          </div>
          <div className="absolute -bottom-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Layers size={12} /> Pinia (State)
          </div>
          <div className="absolute -right-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Code2 size={12} /> TypeScript
          </div>
          <div className="absolute -left-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Cpu size={12} /> Test Utils
          </div>
        </div>
      </div>

      <div className="text-center mt-32 md:mt-40">
        <p className="text-gray-400 text-sm">
          Zaczynasz od "Core". Resztę dokładasz tylko wtedy, gdy potrzebujesz.
        </p>
      </div>

      <style>{`
                .animate-spin-slow { animation: spin 20s linear infinite; }
            `}</style>
    </div>
  );
};

const VueSfcPreview = () => {
  return (
    <div className="bg-[#0f172a] rounded-2xl shadow-xl overflow-hidden border border-gray-700 font-mono text-sm max-w-2xl mx-auto">
      <div className="bg-[#1e293b] px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-[#42B883]" />
          <span className="text-gray-300">UserProfile.vue</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Template */}
        <div className="relative group">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-blue-500 opacity-50"></div>
          <div className="text-blue-400 mb-1 opacity-50 text-xs uppercase tracking-widest font-bold">
            1. Struktura (HTML)
          </div>
          <code className="block text-gray-300">
            <span className="text-blue-400">&lt;template&gt;</span>
            <br />
            &nbsp;&nbsp;<span className="text-emerald-400">&lt;div class="card"&gt;</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-white">Hello, {'{{ userName }}'}!</span>
            <br />
            &nbsp;&nbsp;<span className="text-emerald-400">&lt;/div&gt;</span>
            <br />
            <span className="text-blue-400">&lt;/template&gt;</span>
          </code>
        </div>

        {/* Script */}
        <div className="relative group">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-yellow-500 opacity-50"></div>
          <div className="text-yellow-500 mb-1 opacity-50 text-xs uppercase tracking-widest font-bold">
            2. Logika (JS/TS)
          </div>
          <code className="block text-gray-300">
            <span className="text-blue-400">&lt;script setup&gt;</span>
            <br />
            &nbsp;&nbsp;<span className="text-purple-400">import</span> {'{ ref }'}{' '}
            <span className="text-purple-400">from</span>{' '}
            <span className="text-green-300">'vue'</span>;<br />
            &nbsp;&nbsp;<span className="text-purple-400">const</span> userName ={' '}
            <span className="text-blue-300">ref</span>(
            <span className="text-green-300">'Maciej'</span>);
            <br />
            <span className="text-blue-400">&lt;/script&gt;</span>
          </code>
        </div>

        {/* Style */}
        <div className="relative group">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-purple-500 opacity-50"></div>
          <div className="text-purple-400 mb-1 opacity-50 text-xs uppercase tracking-widest font-bold">
            3. Wygląd (CSS)
          </div>
          <code className="block text-gray-300">
            <span className="text-blue-400">&lt;style scoped&gt;</span>
            <br />
            &nbsp;&nbsp;<span className="text-yellow-300">.card</span> {'{'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">padding</span>:{' '}
            <span className="text-orange-300">2rem</span>;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">background</span>:{' '}
            <span className="text-green-300">#42B883</span>;<br />
            &nbsp;&nbsp;{'}'}
            <br />
            <span className="text-blue-400">&lt;/style&gt;</span>
          </code>
        </div>
      </div>
    </div>
  );
};

export default VueArticle;
