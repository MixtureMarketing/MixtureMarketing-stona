import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Sparkles,
  Lock,
  Server,
  Activity,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import { useCounter } from '../../hooks/useCounter';
import { useParallax } from '../../hooks/useParallax';

// --- SHARED ATOMS ---
const WindowControls: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex gap-1.5 ${className}`}>
    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F57]"></div>
    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]"></div>
    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#28C840]"></div>
  </div>
);

// --- WEB DEVELOPMENT HERO VISUAL ---
export const WebDevHeroVisual: React.FC = () => {
  const perfScore = useCounter(98, { duration: 1500, delay: 500 });

  return (
    <AnimateOnScroll className="relative z-10 flex justify-center lg:justify-end">
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:p-10 w-full max-w-[320px] md:max-w-none relative overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(63,61,145,0.15)] transition-all duration-500">
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <WindowControls />
          <div className="px-2 py-1 bg-gray-50 rounded-lg text-xxxs md:text-xxs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 border border-gray-100">
            <Activity size={10} className="text-emerald-600" /> Core Web Vitals
          </div>
        </div>

        <div className="flex justify-center mb-6 md:mb-10 relative">
          <svg className="w-32 h-32 md:w-52 md:h-52 transform -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#F3F4F6" strokeWidth="8" />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={perfScore > 90 ? '#00C853' : '#F4B400'}
              strokeWidth="8"
              strokeDasharray={552}
              strokeDashoffset={552 - (552 * perfScore) / 100}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl md:text-6xl font-black tracking-tighter leading-none ${perfScore > 90 ? 'text-dark' : 'text-[#F4B400]'}`}
            >
              {perfScore}
            </span>
            <span className="text-xs md:text-xxs font-bold text-gray-600 uppercase mt-1 md:mt-2 tracking-widest">
              Wydajność
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="text-xxxs md:text-xxs font-bold text-gray-600 uppercase mb-1">
              Gotowość SEO
            </div>
            <div className="text-sm md:text-lg font-black text-dark flex items-center gap-1">
              100% <CheckCircle2 size={12} className="text-success" />
            </div>
          </div>
          <div className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="text-xxxs md:text-xxs font-bold text-gray-600 uppercase mb-1">
              Dostępność
            </div>
            <div className="text-sm md:text-lg font-black text-dark">AA+</div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan"></div>
      </div>

      <div className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl border border-gray-100 animate-float z-20">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-success">
            <Gauge size={16} />
          </div>
          <div>
            <div className="text-xxxs md:text-xxs font-bold text-gray-600 uppercase leading-none mb-1">
              Szybkość LCP
            </div>
            <div className="text-xs md:text-sm font-black text-dark">0.7s</div>
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
};

// --- UI/UX DESIGN HERO VISUAL ---
export const UiUxHeroVisual: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mousePos = useParallax(containerRef, 1);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] flex items-center justify-center perspective-[2000px]"
    >
      <div
        className="absolute top-1/2 left-1/2 w-[400px] h-72 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `translate(-50%, -50%) translate(${mousePos.x * -25}px, ${mousePos.y * -25}px) rotateX(${mousePos.y * 8}deg) rotateY(${mousePos.x * 8}deg)`,
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/20"></div>
          </div>
          <div className="w-24 h-2 bg-gray-100 rounded-full"></div>
        </div>
        <div className="flex gap-6">
          <div className="w-1/3 h-32 bg-gradient-to-br from-light-gray to-[#E0EFFF] rounded-2xl border border-gray-50 shadow-inner"></div>
          <div className="w-2/3 space-y-4 pt-2">
            <div className="w-full h-3 bg-gray-100 rounded-full"></div>
            <div className="w-full h-3 bg-gray-100 rounded-full"></div>
            <div className="w-2/3 h-3 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-1/2 left-[60%] w-56 h-[420px] bg-deep-dark rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[6px] border-slate-border p-6 transition-transform duration-100 ease-out flex flex-col justify-between overflow-hidden will-change-transform"
        style={{
          transform: `translate(-50%, -40%) translate(${mousePos.x * 50}px, ${mousePos.y * 50}px) rotateX(${mousePos.y * 12}deg) rotateY(${mousePos.x * 12}deg)`,
        }}
      >
        <div className="space-y-6 pt-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-[1.5rem] mx-auto shadow-2xl shadow-primary/40 flex items-center justify-center text-white">
            <Sparkles size={32} />
          </div>
          <div className="space-y-2 text-center">
            <div className="w-28 h-2.5 bg-white/20 rounded-full mx-auto"></div>
            <div className="w-20 h-2 bg-white/10 rounded-full mx-auto"></div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-md border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-full"></div>
              <div className="w-16 h-2 bg-white/20 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-white/5 rounded-xl"></div>
              <div className="h-12 bg-primary/20 rounded-xl"></div>
            </div>
          </div>
        </div>
        <button className="w-full py-4 bg-white text-deep-dark font-black rounded-2xl text-xxs uppercase tracking-widest shadow-xl transform hover:scale-105 transition-all">
          Zacznij teraz
        </button>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-[60px]"></div>
      </div>
    </div>
  );
};

// --- ANALYTICS HERO VISUAL ---
export const AnalyticsHeroVisual: React.FC = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCounter((prev) => prev + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 bg-slate-dark/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(97,182,222,0.15)] border border-slate-border transform rotate-1 hover:rotate-0 transition-all duration-700 group overflow-hidden">
      <div className="bg-slate-border px-4 py-3 flex items-center justify-between border-b border-slate-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xxs font-mono text-gray-400 flex items-center gap-2">
          <Lock size={10} /> looker.studio.google.com
        </div>
      </div>

      <div className="p-6 bg-deep-dark">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">
              Miesięczny Przychód
            </div>
            <div className="text-3xl font-black text-white flex items-center gap-2">
              {(124500 + counter * 125).toLocaleString()} PLN
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
                +12%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-success/10 px-2 py-1 rounded-full border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xxs font-bold text-success">NA ŻYWO</span>
          </div>
        </div>

        <div className="relative h-32 w-full mb-6 overflow-hidden rounded-lg bg-slate-border/30 border border-[#334155]/50">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path
              d={`M0,${60 + Math.sin(counter / 5) * 10} Q20,${50 + Math.cos(counter / 5) * 10} 40,55 T80,40 T120,45 T160,20 T200,10 V100 H0 Z`}
              fill="url(#chartGrad)"
              className="opacity-50 transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#61B6DE" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#61B6DE" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-0 bottom-0 w-px bg-white/50 animate-scan-line"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { l: 'ROAS', v: '4.2x' },
            { l: 'Konw.', v: '3.8%' },
            { l: 'CPC', v: '1.20' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-border p-3 rounded-lg border border-[#334155]">
              <div className="text-xxs text-gray-300 uppercase mb-1 font-bold">{s.l}</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                {s.v} <TrendingUp size={10} className="text-success" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- CORPORATE WEBSITE HERO VISUAL ---
export const CorporateHeroVisual: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mousePos = useParallax(containerRef, 1);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg aspect-square flex items-center justify-center transition-transform duration-200 ease-out will-change-transform"
      style={{
        transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)`,
      }}
    >
      <div className="absolute inset-0 rounded-full border border-dashed border-gray-200 animate-spin-slow-corp opacity-40"></div>
      <svg
        className="w-full h-full relative z-10 drop-shadow-[0_0_30px_rgba(63,61,145,0.15)]"
        viewBox="0 0 400 400"
      >
        <g opacity="0.4">
          <path
            d="M 200 200 L 80 80 M 200 200 L 320 80 M 200 200 L 80 320 M 200 200 L 320 320"
            stroke="#61B6DE"
            strokeWidth="1"
            fill="none"
          />
        </g>
        {[
          { x: 200, y: 60 },
          { x: 60, y: 200 },
          { x: 340, y: 200 },
          { x: 200, y: 340 },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="5" fill="white" stroke="#3F3D91" strokeWidth="2" />
            <circle
              cx={node.x}
              cy={node.y}
              r="10"
              fill="#3F3D91"
              opacity="0.05"
              className="animate-ping"
            />
          </g>
        ))}
        <rect
          x="175"
          y="175"
          width="50"
          height="50"
          rx="12"
          fill="#3F3D91"
          className="animate-pulse"
        />
        <Server x="188" y="188" size={24} className="text-primary" />
      </svg>
      <div className="absolute top-0 right-0 p-4 bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-gray-100 animate-float">
        <ShieldCheck size={16} className="text-emerald-500" />
      </div>
    </div>
  );
};

// --- DESIGN HERO VISUAL ---
export const DesignHeroVisual: React.FC = () => {
  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-secondary to-primary rounded-2xl shadow-2xl transform rotate-6 z-10 opacity-90 animate-float"></div>
      <div className="absolute bottom-0 left-10 w-40 h-40 bg-white border border-gray-200 rounded-2xl shadow-xl transform -rotate-3 z-20 flex items-center justify-center animate-float-delayed">
        <div className="text-dark font-black text-4xl tracking-tighter">Aa</div>
      </div>
      <div className="absolute top-20 left-0 w-32 h-32 bg-dark rounded-full z-0 opacity-10"></div>
      <div className="absolute inset-0 border-2 border-primary/20 rounded-full border-dashed animate-spin-slow-design"></div>
    </div>
  );
};

// --- WEB APP HERO VISUAL ---
export const WebAppHeroVisual: React.FC = () => {
  const [randomHeights] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ((i * 17) % 80) + 10),
  );

  return (
    <div className="relative z-10 bg-slate-dark rounded-xl border border-[#334155] p-6 shadow-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(97,182,222,0.15)] transition-shadow duration-500">
      <div className="flex justify-between items-center mb-6 border-b border-[#334155] pb-4">
        <div className="text-xs font-mono text-primary flex items-center gap-2">
          <Activity size={14} className="animate-pulse" /> SYSTEM_MONITOR_V2
        </div>
        <div className="text-xxs font-mono text-green-400">UPTIME: 99.99%</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-border p-4 rounded-lg border border-[#334155]">
          <div className="text-xxs text-gray-300 mb-2 font-mono">AKTYWNI UŻYTKOWNICY</div>
          <div className="text-2xl font-bold text-white mb-2">12,450</div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[75%] animate-pulse"></div>
          </div>
        </div>
        <div className="bg-slate-border p-4 rounded-lg border border-[#334155]">
          <div className="text-xxs text-gray-200 mb-2 font-mono">OBCIĄŻENIE SERWERA</div>
          <div className="text-2xl font-bold text-white mb-2">34%</div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-success w-[34%]"></div>
          </div>
        </div>
        <div className="col-span-2 bg-slate-border p-4 rounded-lg border border-[#334155] relative overflow-hidden h-32 flex items-end">
          <div className="flex items-end justify-between w-full h-20 gap-1">
            {randomHeights.map((h, i) => (
              <div
                key={i}
                className="bg-secondary w-full rounded-t opacity-80 transition-all duration-500"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SEO HERO VISUAL ---
export const SeoHeroVisual: React.FC = () => {
  const [rankPosition, setRankPosition] = useState(6);

  useEffect(() => {
    const interval = setInterval(() => setRankPosition((prev) => (prev <= 1 ? 6 : prev - 1)), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-transform duration-700">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <WindowControls />
        <div className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xxs text-gray-600 shadow-inner flex items-center">
          <Search size={10} className="mr-2" /> najlepsza firma w branży
        </div>
      </div>
      <div className="p-4 bg-white relative min-h-[380px] flex flex-col gap-3">
        {[1, 2, 3, 4, 5, 6].map((pos) => {
          const isHero = pos === rankPosition;
          return (
            <div
              key={pos}
              className={`p-2 transition-all duration-500 ${isHero ? 'bg-success/10 border border-success rounded-xl scale-105 shadow-lg' : 'opacity-40 border-b border-gray-50 last:border-0'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-6 h-4 rounded text-[10px] font-bold flex items-center justify-center ${isHero ? 'bg-success text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  #{pos}
                </div>
                {isHero && <CheckCircle2 size={12} className="text-success" />}
              </div>
              <div
                className={`h-2 rounded mb-1 ${isHero ? 'w-32 bg-secondary' : 'w-24 bg-gray-200'}`}
              ></div>
              <div
                className={`h-3 rounded ${isHero ? 'w-full bg-primary/20' : 'w-2/3 bg-gray-100'}`}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- PRINT HERO VISUAL ---
export const PrintHeroVisual: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mousePos = useParallax(containerRef, 1);
  const [activeLayer, setActiveLayer] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => setActiveLayer((prev) => (prev === 4 ? 0 : prev + 1)), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative w-80 h-[400px] perspective-1000 group">
      {['cyan', 'magenta', 'yellow', 'black'].map((color, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-white rounded-xl shadow-lg border border-white/10 transition-all duration-1000 ease-in-out flex items-center justify-center overflow-hidden will-change-transform"
          style={{
            transform:
              activeLayer >= i
                ? `translateZ(${-i * 20}px) translateY(${i * 10}px) rotateY(-15deg) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
                : `translateZ(${-i * 100}px) translateY(${i * 100}px) rotateY(-15deg) opacity(0)`,
            opacity: activeLayer >= i ? 1 : 0,
            zIndex: 10 - i,
          }}
        >
          <div className="absolute top-4 left-4 text-xs font-bold font-mono opacity-50 uppercase">
            {color[0]} Channel
          </div>
          <div
            className="w-48 h-48 rounded-full border-[20px]"
            style={{
              borderColor:
                color === 'black'
                  ? '#000'
                  : color === 'yellow'
                    ? '#FF0'
                    : color === 'magenta'
                      ? '#F0F'
                      : '#0FF',
              opacity: 0.5,
            }}
          ></div>
        </div>
      ))}
      <div
        className="absolute inset-0 bg-brand-yellow rounded-xl shadow-[0_0_50px_rgba(244,180,0,0.3)] flex items-center justify-center overflow-hidden transition-all duration-1000 will-change-transform"
        style={{
          transform: `translateZ(30px) translateX(40px) rotateY(-15deg) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
          opacity: activeLayer === 4 ? 1 : 0,
          zIndex: 20,
        }}
      >
        <div className="text-deep-dark text-center">
          <ShoppingCart size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold uppercase tracking-widest">Premium</h3>
        </div>
      </div>
    </div>
  );
};
