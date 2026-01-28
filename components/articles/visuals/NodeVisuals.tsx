import React from 'react';
import {
  Cloud,
  Server,
  Zap,
  Cpu,
  CheckCircle2,
  XCircle,
  Database,
  ArrowRight,
  Code2,
  Globe,
  Radio,
  Search,
  Code,
} from 'lucide-react';

// --- HERO: UNIFIED LANGUAGE VISUAL ---
export const NodeHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full bg-[#0B1120] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/5 shadow-2xl min-h-[550px] flex items-center justify-center group font-sans">
      {/* High-Tech Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#339933 1px, transparent 1px), linear-gradient(90deg, #339933 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-[#339933]/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Client Side */}
        <div className="flex-1 flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative">
            <div className="absolute -inset-4 bg-[#61DAFB]/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="w-24 h-24 bg-white/5 border border-[#61DAFB]/30 rounded-[2rem] flex items-center justify-center backdrop-blur-xl shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
              <Globe size={48} className="text-[#61DAFB]" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-white font-black text-xl uppercase tracking-tighter">Frontend</h2>
            <p className="text-xxs text-gray-500 font-mono mt-1">Browser / Mobile</p>
          </div>
        </div>

        {/* Central Core: Node.js */}
        <div className="flex-[1.5] relative h-64 flex flex-col items-center justify-center">
          {/* Connecting Lines with Particles */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Left to Core */}
              <path
                d="M 0 100 L 150 100"
                stroke="#339933"
                strokeWidth="1"
                fill="none"
                opacity="0.2"
              />
              <circle r="3" fill="#61DAFB" className="animate-particle-left">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 0 100 L 150 100" />
              </circle>
              {/* Core to Right */}
              <path
                d="M 250 100 L 400 100"
                stroke="#339933"
                strokeWidth="1"
                fill="none"
                opacity="0.2"
              />
              <circle r="3" fill="#F7DF1E" className="animate-particle-right">
                <animateMotion dur="2.5s" repeatCount="indefinite" path="M 250 100 L 400 100" />
              </circle>
            </svg>
          </div>

          {/* The Engine Core */}
          <div className="relative z-20">
            <div className="absolute -inset-12 bg-[#339933]/20 rounded-full blur-[60px] animate-pulse"></div>
            <div className="w-32 h-32 bg-[#339933] rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(51,153,51,0.4)] border-4 border-[#6CC24A] relative overflow-hidden group-hover:rotate-12 transition-transform duration-700">
              <Code2 size={56} className="text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <div className="text-white font-black text-2xl tracking-tighter">Node.js</div>
              <div className="text-xxs text-[#6CC24A] font-bold uppercase tracking-[0.3em]">
                One Language
              </div>
            </div>
          </div>
        </div>

        {/* Server Side */}
        <div className="flex-1 flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative">
            <div className="absolute -inset-4 bg-[#F7DF1E]/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="w-24 h-24 bg-white/5 border border-[#F7DF1E]/30 rounded-[2rem] flex items-center justify-center backdrop-blur-xl shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
              <Database size={48} className="text-[#F7DF1E]" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-white font-black text-xl uppercase tracking-tighter">Backend</h2>
            <p className="text-xxs text-gray-500 font-mono mt-1">API / Database</p>
          </div>
        </div>
      </div>

      {/* Floating Labels */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-30">
        <div className="flex items-center gap-2 text-white text-xxxs font-bold uppercase tracking-widest">
          <Code size={12} /> JavaScript
        </div>
        <div className="flex items-center gap-2 text-white text-xxxs font-bold uppercase tracking-widest">
          <CheckCircle2 size={12} /> TypeScript
        </div>
        <div className="flex items-center gap-2 text-white text-xxxs font-bold uppercase tracking-widest">
          <Zap size={12} /> V8 Engine
        </div>
      </div>

      <style>{`
        @keyframes particle-left {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(0.5); }
        }
        @keyframes particle-right {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
    </div>
  );
};

// --- RESTAURANT ANALOGY ---
export const RestaurantAnalogyVisual: React.FC = () => {
  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Scenario A: Traditional */}
      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-widest">
          Blocking I/O
        </div>
        <h3 className="font-bold text-slate-700 text-lg mb-6 flex items-center gap-2">
          <Server size={20} className="text-slate-400" /> Tradycyjny Serwer
        </h3>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              👤
            </div>
            <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              🍳
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              👤
            </div>
            <div className="h-1 flex-1 bg-red-400 rounded-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xxs px-2 py-0.5 rounded">
                WAITING...
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              🍳
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              👤
            </div>
            <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              🍳
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-500 leading-relaxed italic border-l-2 border-red-300 pl-3">
          "Kelner (Wątek) stoi w kuchni i czeka na kotleta. Nie obsługuje innych."
        </p>
      </div>

      {/* Scenario B: Node.js */}
      <div className="bg-[#339933]/5 p-8 rounded-[2rem] border border-[#339933]/20 relative overflow-hidden group hover:border-[#339933]/50 transition-colors">
        <div className="absolute top-4 right-4 bg-[#339933] text-white px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-widest shadow-md">
          Non-blocking I/O
        </div>
        <h3 className="font-bold text-[#339933] text-lg mb-6 flex items-center gap-2">
          <Zap size={20} /> Node.js (Event Loop)
        </h3>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#339933]/10 flex items-center justify-center text-[#339933]">
              ⚡
            </div>
            <div className="flex-1 relative h-10">
              {/* Animated "orders" flying */}
              <div className="absolute top-1/2 left-0 w-3 h-3 bg-[#339933] rounded-full -translate-y-1/2 animate-[ping_1s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-[#339933] rounded-full -translate-y-1/2 animate-[ping_1.5s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-[#339933] rounded-full -translate-y-1/2 animate-[ping_0.8s_linear_infinite]"></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#339933]/10 flex items-center justify-center">
              🍳
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-[#339933] leading-relaxed italic border-l-2 border-[#339933] pl-3">
          "Kelner rzuca zamówienie do kuchni i biegnie do kolejnego stolika. Jeden wątek obsługuje
          tysiące."
        </p>
      </div>
    </div>
  );
};

// --- WARNING TABLE ---
export const NodeWarningTable: React.FC = () => {
  return (
    <div className="my-16 overflow-hidden rounded-[2rem] border border-gray-200 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* IDEAL */}
        <div className="bg-emerald-50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <h3 className="font-black text-emerald-900 text-xl">Do czego Node jest IDEALNY</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-emerald-800 text-sm font-medium">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              Obsługa tysięcy zapytań I/O (API, Baza danych)
            </li>
            <li className="flex items-start gap-3 text-emerald-800 text-sm font-medium">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              Streaming wideo/audio (Netflix style)
            </li>
            <li className="flex items-start gap-3 text-emerald-800 text-sm font-medium">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              Real-time (Chaty, Uber, Gry online)
            </li>
            <li className="flex items-start gap-3 text-emerald-800 text-sm font-medium">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              Mikroserwisy (Serverless / AWS Lambda)
            </li>
          </ul>
        </div>

        {/* BAD */}
        <div className="bg-red-50 p-8 border-t md:border-t-0 md:border-l border-red-100">
          <div className="flex items-center gap-3 mb-6">
            <XCircle size={32} className="text-red-600" />
            <h3 className="font-black text-red-900 text-xl">Do czego Node jest SŁABY</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-red-800 text-sm font-medium">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              Ciężkie obliczenia matematyczne (AI, Data Science)
            </li>
            <li className="flex items-start gap-3 text-red-800 text-sm font-medium">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              Przetwarzanie grafiki 3D / Renderowanie wideo
            </li>
            <li className="flex items-start gap-3 text-red-800 text-sm font-medium">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              Systemy wymagające absolutnie stałego czasu reakcji (RTOS)
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-gray-800 p-4 text-center text-gray-400 text-xs italic">
        "Wybierz narzędzie do problemu. Nie wbijaj gwoździa śrubokrętem."
      </div>
    </div>
  );
};
