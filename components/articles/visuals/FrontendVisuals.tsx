/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Layers,
  Layout,
  Palette,
  Code2,
  Smartphone,
  Globe,
  Zap,
  ShieldCheck,
  Users,
  Box,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

// --- HERO VISUAL ---
export const FrontendHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-12 overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex flex-col md:flex-row items-center justify-center group">
      {/* Background with abstract grid/lines */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>

      {/* Central Visual: Transformation */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-3xl">
        {/* Wireframe Side */}
        <div className="w-1/2 h-64 border-r border-white/10 relative p-8 flex flex-col gap-4 opacity-50 group-hover:opacity-30 transition-opacity">
          <div className="w-full h-8 bg-white/10 rounded animate-pulse"></div>
          <div className="flex gap-4">
            <div className="w-1/3 h-32 bg-white/10 rounded animate-pulse delay-75"></div>
            <div className="w-2/3 h-32 bg-white/5 rounded border border-white/10 border-dashed"></div>
          </div>
          <div className="absolute top-4 left-4 text-xs font-mono text-gray-500">
            WIREFRAME_MODE
          </div>
        </div>

        {/* Interactive UI Side */}
        <div className="w-1/2 h-80 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl relative p-6 -ml-4 z-20 flex flex-col gap-4 transform group-hover:scale-105 transition-transform duration-500">
          <div className="flex justify-between items-center">
            <div className="w-24 h-6 bg-blue-500/20 rounded-full flex items-center px-2 gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="w-12 h-2 bg-blue-400/50 rounded-full"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-bold animate-bounce">
                UI
              </div>
            </div>
            {/* Particles */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300"></div>
          </div>

          <div className="h-10 bg-white/10 rounded-lg flex items-center justify-between px-4">
            <div className="w-24 h-2 bg-white/20 rounded-full"></div>
            <div className="w-8 h-4 bg-green-500/20 rounded text-xxxs text-green-400 flex items-center justify-center">
              98%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ARCHITECTURE HOUSE ---
export const FrontendArchitectureVisual: React.FC = () => {
  return (
    <div className="my-16 p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
      <h3 className="text-center font-bold text-slate-700 mb-12">
        Architektura Nowoczesnego Frontendu
      </h3>
      <div className="max-w-2xl mx-auto flex flex-col-reverse gap-2">
        {/* 1. Foundation */}
        <div className="bg-white p-6 rounded-xl border-b-4 border-blue-500 shadow-sm flex items-center gap-6 relative group hover:-translate-y-1 transition-transform">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Box size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">1. Fundament (Biblioteki)</h4>
            <p className="text-xs text-slate-500">React.js / Vue.js - Cegły i logika interakcji</p>
          </div>
          <div className="absolute right-4 text-6xl font-black text-slate-100 -z-10 group-hover:text-blue-50 transition-colors">
            LIB
          </div>
        </div>

        {/* 2. Structure */}
        <div className="bg-white p-6 rounded-xl border-b-4 border-black shadow-sm flex items-center gap-6 relative group hover:-translate-y-1 transition-transform mx-4">
          <div className="bg-gray-100 p-3 rounded-lg text-gray-800">
            <Layout size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">2. Konstrukcja (Frameworki)</h4>
            <p className="text-xs text-slate-500">
              Next.js / Nuxt - Routing, SSR, SEO (Dach i ściany)
            </p>
          </div>
          <div className="absolute right-4 text-6xl font-black text-slate-100 -z-10 group-hover:text-gray-100 transition-colors">
            FW
          </div>
        </div>

        {/* 3. Facade */}
        <div className="bg-white p-6 rounded-xl border-b-4 border-cyan-400 shadow-sm flex items-center gap-6 relative group hover:-translate-y-1 transition-transform mx-8">
          <div className="bg-cyan-100 p-3 rounded-lg text-cyan-600">
            <Palette size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">3. Fasada (Style)</h4>
            <p className="text-xs text-slate-500">Tailwind CSS - Wygląd i Design System</p>
          </div>
          <div className="absolute right-4 text-6xl font-black text-slate-100 -z-10 group-hover:text-cyan-50 transition-colors">
            CSS
          </div>
        </div>
      </div>
    </div>
  );
};

// --- TECH CARDS ---
export const TechCardsVisual: React.FC = () => {
  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* REACT */}
      <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-lg relative overflow-hidden group hover:border-blue-300 transition-all">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#61DAFB] flex items-center justify-center text-white font-bold text-xs">
            R
          </div>
          <h4 className="font-bold text-slate-800">React.js</h4>
        </div>
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="text-sm font-bold text-blue-600">Król Rynku</div>
        </div>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex gap-2">
            <CheckCircle2 size={14} className="text-green-500" /> Ogromny ekosystem
          </li>
          <li className="flex gap-2">
            <CheckCircle2 size={14} className="text-green-500" /> Łatwość rekrutacji
          </li>
        </ul>
      </div>

      {/* NEXT.JS */}
      <div className="p-6 rounded-3xl bg-black text-white border border-gray-800 shadow-xl relative overflow-hidden transform md:-translate-y-4 hover:scale-105 transition-transform duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs">
            N
          </div>
          <h4 className="font-bold">Next.js</h4>
        </div>
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</div>
          <div className="text-sm font-bold text-white bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent">
            Złoty Standard 2025
          </div>
        </div>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex gap-2">
            <Zap size={14} className="text-yellow-400" /> Idealne SEO (SSR)
          </li>
          <li className="flex gap-2">
            <Zap size={14} className="text-yellow-400" /> Niesamowita wydajność
          </li>
        </ul>
      </div>

      {/* VUE */}
      <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-lg relative overflow-hidden group hover:border-emerald-300 transition-all">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#42B883] flex items-center justify-center text-white font-bold text-xs">
            V
          </div>
          <h4 className="font-bold text-slate-800">Vue.js</h4>
        </div>
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</div>
          <div className="text-sm font-bold text-emerald-600">Ulubieniec Devów</div>
        </div>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex gap-2">
            <CheckCircle2 size={14} className="text-green-500" /> Prostota i lekkość
          </li>
          <li className="flex gap-2">
            <CheckCircle2 size={14} className="text-green-500" /> Szybki start MVP
          </li>
        </ul>
      </div>
    </div>
  );
};

// --- COMPARISON TABLE ---
export const FrontendComparisonTable: React.FC = () => {
  const stars = (count: number) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Zap
          key={i}
          size={12}
          fill={i < count ? 'currentColor' : 'none'}
          className={i >= count ? 'text-gray-200' : ''}
        />
      ))}
    </div>
  );

  return (
    <div className="my-16 overflow-x-auto rounded-2xl border border-slate-200 shadow-xl">
      <table className="w-full text-left bg-white text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="p-4">Cecha</th>
            <th className="p-4 text-blue-600 font-bold">React.js</th>
            <th className="p-4 text-black font-bold">Next.js</th>
            <th className="p-4 text-emerald-600 font-bold">Vue.js</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="p-4 font-bold text-slate-700">SEO (Google)</td>
            <td className="p-4">
              <div className="mb-1">{stars(2)}</div>
              <span className="text-xxs text-slate-400">Słabe (CSR)</span>
            </td>
            <td className="p-4 bg-yellow-50/50">
              <div className="mb-1">{stars(5)}</div>
              <span className="text-xxs text-green-600 font-bold">Idealne (SSR)</span>
            </td>
            <td className="p-4">
              <div className="mb-1">{stars(3)}</div>
              <span className="text-xxs text-slate-400">Średnie (chyba że Nuxt)</span>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-bold text-slate-700">Szybkość ładowania</td>
            <td className="p-4">
              <div className="mb-1">{stars(3)}</div>
              <span className="text-xxs text-slate-400">Spinner przy starcie</span>
            </td>
            <td className="p-4 bg-yellow-50/50">
              <div className="mb-1">{stars(5)}</div>
              <span className="text-xxs text-green-600 font-bold">Instant</span>
            </td>
            <td className="p-4">
              <div className="mb-1">{stars(4)}</div>
              <span className="text-xxs text-slate-400">Bardzo szybki</span>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-bold text-slate-700">Dostępność Talentów</td>
            <td className="p-4 bg-blue-50/20">
              <div className="mb-1">{stars(5)}</div>
              <span className="text-xxs text-blue-600 font-bold">Ogromna</span>
            </td>
            <td className="p-4">
              <div className="mb-1">{stars(4)}</div>
              <span className="text-xxs text-slate-400">Rosnąca</span>
            </td>
            <td className="p-4">
              <div className="mb-1">{stars(3)}</div>
              <span className="text-xxs text-slate-400">Średnia</span>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-bold text-slate-700">Skala Enterprise</td>
            <td className="p-4">
              <div className="mb-1">{stars(5)}</div>
            </td>
            <td className="p-4">
              <div className="mb-1">{stars(5)}</div>
            </td>
            <td className="p-4">
              <div className="mb-1">{stars(4)}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// --- DECISION TREE ---
export const DecisionTreeVisual: React.FC = () => {
  return (
    <div className="my-16 bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="relative z-10 flex flex-col gap-8 items-center text-center">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full max-w-md shadow-lg">
          <p className="font-bold text-sm">Czy aplikacja musi być widoczna w Google (SEO)?</p>
          <div className="mt-4 flex justify-center gap-4">
            <span className="text-xs font-mono text-green-400">TAK ↓</span>
            <span className="text-xs font-mono text-red-400">NIE ↓</span>
          </div>
        </div>

        <div className="flex w-full max-w-3xl justify-between gap-4 text-xs">
          {/* Left Path (SEO YES) */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <ArrowRight className="rotate-90 text-green-400" />
            <div className="bg-black border border-green-500 p-6 rounded-2xl w-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <h4 className="font-black text-xl mb-2">Next.js</h4>
              <p className="text-gray-400">E-commerce, Portal, Blog</p>
            </div>
          </div>

          {/* Right Path (SEO NO) */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <ArrowRight className="rotate-90 text-red-400" />
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full">
              <p className="font-bold mb-2">Budżet / Czas?</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-emerald-900/50 p-3 rounded-lg border border-emerald-500/30">
                  <span className="block font-bold text-emerald-400 mb-1">Mały / Szybko</span>
                  <span className="font-black text-lg">Vue.js</span>
                </div>
                <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-500/30">
                  <span className="block font-bold text-blue-400 mb-1">Duży / Skala</span>
                  <span className="font-black text-lg">React.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
