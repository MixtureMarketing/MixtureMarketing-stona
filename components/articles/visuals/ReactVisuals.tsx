/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Globe,
  Cpu,
  Smartphone,
  Layout,
  Zap,
  CheckCircle2,
  Layers,
  Users,
  Code2,
  PieChart,
  TrendingUp,
  DollarSign,
  Monitor,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO: GLOBAL NETWORK ---
export const ReactHeroNetwork: React.FC = () => {
  return (
    <div className="relative w-full bg-[#0B1120] rounded-[3rem] p-12 overflow-hidden border border-white/5 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      {/* Background Logos (faded) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] flex flex-wrap justify-center items-center gap-24 p-20">
        <span className="text-6xl font-black text-white">FACEBOOK</span>
        <span className="text-6xl font-black text-white italic">Netflix</span>
        <span className="text-6xl font-black text-white tracking-tighter">Airbnb</span>
        <span className="text-6xl font-black text-white">Uber</span>
        <span className="text-6xl font-black text-white">Instagram</span>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Earth/Atom Hybrid */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#61DAFB] rounded-full blur-[100px] opacity-20 animate-pulse"></div>

          {/* Atom Rings */}
          <div className="absolute inset-0 border-2 border-[#61DAFB]/30 rounded-[100%] rotate-[30deg] animate-spin-slow"></div>
          <div
            className="absolute inset-0 border-2 border-[#61DAFB]/30 rounded-[100%] rotate-[150deg] animate-spin-slow"
            style={{ animationDirection: 'reverse' }}
          ></div>
          <div
            className="absolute inset-0 border-2 border-[#61DAFB]/30 rounded-[100%] rotate-[270deg] animate-spin-slow"
            style={{ animationDuration: '15s' }}
          ></div>

          {/* Central Globe */}
          <div className="relative bg-[#0F172A] p-8 rounded-full border-2 border-[#61DAFB] shadow-[0_0_50px_rgba(97,218,251,0.3)]">
            <Globe size={80} className="text-[#61DAFB] animate-pulse" />
          </div>
        </div>

        {/* Stats / Counter */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-center shadow-2xl">
          <div className="text-3xl font-black text-white mb-1">40% +</div>
          <div className="text-xxs font-black uppercase tracking-[0.2em] text-[#61DAFB]">
            Top 10,000 Internet Sites
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xxs font-bold">
            <CheckCircle2 size={12} className="text-success" /> Industrial Standard Verified
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
            animation: spin 20s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// --- INTERFACE ASSEMBLY ANIMATION ---
export const InterfaceAssembly: React.FC = () => {
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setAssembled((prev) => !prev), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="my-16 bg-gray-50 rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-inner flex flex-col items-center">
      <div className="text-center mb-12">
        <h3 className="text-xl font-bold text-dark">Architektura Komponentowa</h3>
        <p className="text-sm text-gray-500 mt-2">"Build once, use everywhere"</p>
      </div>

      <div className="relative w-full max-w-lg aspect-[16/10] bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4 shadow-2xl overflow-hidden">
        {/* Header Component */}
        <div
          className={`h-12 bg-dark rounded-lg mb-4 transition-all duration-1000 flex items-center justify-between px-4 ${assembled ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}
        >
          <div className="w-8 h-8 bg-[#61DAFB] rounded-md"></div>
          <div className="flex gap-4">
            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-4 h-40">
          {/* Product Card Component */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`flex-1 bg-gray-50 rounded-xl border border-gray-100 p-4 transition-all duration-1000 ${assembled ? 'translate-x-0 opacity-100' : i === 1 ? '-translate-x-40 opacity-0' : 'translate-x-40 opacity-0'}`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div className="w-full h-20 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-2 w-3/4 bg-gray-300 rounded-full mb-2"></div>
              <div className="h-2 w-1/2 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Footer Component */}
        <div
          className={`mt-4 h-16 bg-gray-100 rounded-lg transition-all duration-1000 flex items-center justify-center gap-4 ${assembled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
          style={{ transitionDelay: '800ms' }}
        >
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        </div>

        {/* Overlay Grid lines when not assembled */}
        {!assembled && (
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        )}
      </div>

      <div className="mt-12 flex gap-4">
        <div
          className={`px-4 py-2 rounded-full text-xxs font-black uppercase transition-all ${assembled ? 'bg-success text-white' : 'bg-gray-200 text-gray-400'}`}
        >
          Assembled
        </div>
        <div
          className={`px-4 py-2 rounded-full text-xxs font-black uppercase transition-all ${!assembled ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-400'}`}
        >
          Modular
        </div>
      </div>
    </div>
  );
};

// --- REACT VENN DIAGRAM ---
export const ReactVennDiagram: React.FC = () => {
  return (
    <div className="my-24 flex flex-col items-center">
      <div className="relative w-full max-w-2xl h-80 flex items-center justify-center">
        {/* Circle 1: Web */}
        <div className="absolute left-[10%] md:left-[20%] w-64 h-64 bg-[#61DAFB]/10 border-4 border-[#61DAFB] rounded-full flex flex-col items-center justify-center p-8 transition-transform hover:scale-105 group">
          <Monitor size={32} className="text-[#61DAFB] mb-2" />
          <span className="text-xs font-black uppercase tracking-widest text-dark">Web App</span>
          <span className="text-xxs text-gray-500 mt-1">React.js</span>
        </div>

        {/* Circle 2: Mobile */}
        <div className="absolute right-[10%] md:right-[20%] w-64 h-64 bg-purple-500/10 border-4 border-purple-500 rounded-full flex flex-col items-center justify-center p-8 transition-transform hover:scale-105 group">
          <Smartphone size={32} className="text-purple-500 mb-2" />
          <span className="text-xs font-black uppercase tracking-widest text-dark">Mobile App</span>
          <span className="text-xxs text-gray-500 mt-1">React Native</span>
        </div>

        {/* Intersection Info */}
        <div className="absolute z-10 w-40 h-40 bg-white/80 backdrop-blur-md rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4 shadow-xl">
          <Zap size={24} className="text-amber-500 mb-1" />
          <span className="text-xxs font-black uppercase text-dark leading-tight">
            Shared Logic
          </span>
          <span className="text-xxs font-bold text-success mt-1">70-90% REUSE</span>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl max-w-2xl">
        <p className="text-sm m-0 text-blue-900 font-medium">
          <strong>Zasada "Learn once, write anywhere":</strong> Ten sam zespół deweloperski może
          dostarczyć produkt na przeglądarkę, iPhone'a i Androida, współdzieląc większość kodu
          biznesowego. To drastyczna oszczędność budżetu.
        </p>
      </div>
    </div>
  );
};

// --- TREND CHART ---
export const ReactTrendChart: React.FC = () => {
  return (
    <div className="my-16 bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
      <h3 className="text-xl font-bold text-dark mb-12 text-center">
        Popularność Frameworków (Stack Overflow)
      </h3>

      <div className="relative h-64 w-full max-w-3xl mx-auto flex items-end px-4 border-b border-l border-gray-100">
        {/* Legend */}
        <div className="absolute top-0 right-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xxs font-bold text-[#61DAFB]">
            <div className="w-3 h-0.5 bg-[#61DAFB]"></div> React
          </div>
          <div className="flex items-center gap-2 text-xxs font-bold text-gray-300">
            <div className="w-3 h-0.5 bg-gray-300"></div> Inne (Angular/Vue)
          </div>
        </div>

        {/* Chart SVG */}
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          {/* React Line */}
          <path
            d="M 0 180 Q 100 160 200 80 T 400 20"
            fill="none"
            stroke="#61DAFB"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-draw"
          />
          {/* Other Line */}
          <path
            d="M 0 180 Q 100 170 200 150 T 400 160"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Years */}
        <div className="absolute -bottom-8 w-full flex justify-between px-2 text-xxs font-bold text-gray-400">
          <span>2015</span>
          <span>2018</span>
          <span>2021</span>
          <span>2024</span>
        </div>
      </div>

      <div className="mt-16 text-center">
        <span className="inline-flex items-center gap-2 bg-[#E0F7FF] text-[#00A3CC] px-4 py-2 rounded-full text-xs font-bold border border-[#61DAFB]/30">
          <TrendingUp size={14} /> React dominuje jako wybór nr 1 od ponad 5 lat
        </span>
      </div>

      <style>{`
            .animate-draw {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: draw 3s ease-out forwards;
            }
            @keyframes draw {
                to { stroke-dashoffset: 0; }
            }
        `}</style>
    </div>
  );
};
