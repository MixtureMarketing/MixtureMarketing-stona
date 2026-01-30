import React, { useState, useEffect } from 'react';
import { Lock, TrendingUp } from 'lucide-react';

export const AnalyticsHeroVisual: React.FC = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCounter((prev) => prev + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative z-10 w-full max-w-[480px] bg-slate-dark/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(97,182,222,0.15)] border border-slate-border transform rotate-1 hover:rotate-0 transition-all duration-700 group overflow-hidden mx-auto"
      style={{ transform: 'scale(var(--hero-scale)) rotate(1deg)' }}
    >
      <div className="bg-slate-border px-4 py-3 flex items-center justify-between border-b border-slate-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xxxs md:text-xxs font-mono text-gray-400 flex items-center gap-2">
          <Lock size={10} /> looker.studio.google.com
        </div>
      </div>

      <div className="p-5 md:p-6 bg-deep-dark">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-xxs md:text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">
              Miesięczny Przychód
            </div>
            <div className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              {(124500 + counter * 125).toLocaleString()} PLN
              <span className="text-[10px] md:text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
                +12%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-success/10 px-2 py-1 rounded-full border border-success/20">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-[8px] md:text-xxs font-bold text-success uppercase">NA ŻYWO</span>
          </div>
        </div>

        <div className="relative h-24 md:h-32 w-full mb-6 overflow-hidden rounded-lg bg-slate-border/30 border border-[#334155]/50">
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

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            { l: 'ROAS', v: '4.2x' },
            { l: 'Konw.', v: '3.8%' },
            { l: 'CPC', v: '1.20' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-border p-2 md:p-3 rounded-lg border border-[#334155]">
              <div className="text-[10px] md:text-xxs text-gray-300 uppercase mb-1 font-bold">
                {s.l}
              </div>
              <div className="text-xs md:text-sm font-bold text-white flex items-center gap-1">
                {s.v} <TrendingUp size={10} className="text-success" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
