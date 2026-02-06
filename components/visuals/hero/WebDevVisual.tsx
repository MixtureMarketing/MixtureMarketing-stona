import React from 'react';
import { Activity, CheckCircle2, Gauge } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import BaseCard from '../../common/BaseCard';
import { useCounter } from '../../../hooks/useCounter';
import WindowControls from '../../common/WindowControls';

export const WebDevHeroVisual: React.FC = () => {
  const perfScore = useCounter(98, { duration: 1500, delay: 500 });

  return (
    <AnimateOnScroll className="relative z-10 flex justify-center lg:justify-end">
      <BaseCard
        variant="solid"
        padding="lg"
        rounded="3xl"
        className="w-full max-w-[320px] md:max-w-none relative overflow-hidden group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_-20px_rgba(63,61,145,0.15)] transition-all duration-500 border-white/50"
      >
        {/* Subtle internal grid for tech feel */}
        <div className="absolute inset-0 bg-grid-slate-100 opacity-[0.03] pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 md:mb-10 relative z-10">
          <WindowControls />
          <div className="px-3 py-1 bg-gray-50/80 backdrop-blur-sm rounded-full text-xxxs md:text-xxs font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2 border border-gray-100">
            <Activity size={10} className="text-emerald-600 animate-pulse" /> Core Web Vitals
          </div>
        </div>

        <div className="flex justify-center mb-6 md:mb-10 relative z-10">
          <svg
            className="w-40 h-40 md:w-52 md:h-52 transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,200,83,0.1)]"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="88" fill="none" stroke="#F3F4F6" strokeWidth="10" />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={perfScore > 90 ? '#00C853' : '#F4B400'}
              strokeWidth={10}
              strokeDasharray={552}
              strokeDashoffset={552 - (552 * perfScore) / 100}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-5xl md:text-7xl font-black tracking-tighter leading-none ${perfScore > 90 ? 'text-dark' : 'text-[#F4B400]'}`}
            >
              {perfScore}
            </span>
            <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase mt-1 md:mt-2 tracking-widest md:tracking-[0.3em]">
              Wydajność
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-10">
          <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center group-hover:bg-white transition-colors duration-500">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              SEO Ready
            </div>
            <div className="text-base md:text-xl font-black text-dark flex items-center gap-1.5">
              100% <CheckCircle2 size={14} className="text-success" />
            </div>
          </div>
          <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center group-hover:bg-white transition-colors duration-500">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Accessibility
            </div>
            <div className="text-base md:text-xl font-black text-dark tracking-tighter">
              WCAG AA+
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-scan"></div>
      </BaseCard>

      <div className="absolute -bottom-2 -left-4 md:-bottom-4 md:-left-8 z-20 animate-float">
        <BaseCard
          variant="solid"
          padding="none"
          rounded="2xl"
          className="w-fit shadow-2xl border border-white/50 bg-white/95 backdrop-blur-md px-3 py-2"
        >
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-success shrink-0 border border-emerald-100/50">
              <Gauge size={16} />
            </div>
            <div className="flex flex-col pr-1">
              <span className="text-[9px] font-black text-gray-400 uppercase leading-none tracking-tighter mb-0.5">
                LCP Speed
              </span>
              <span className="text-sm font-black text-dark leading-none">0.7s</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </AnimateOnScroll>
  );
};
