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
        className="w-full max-w-[320px] md:max-w-none relative overflow-hidden group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_-20px_rgba(63,61,145,0.15)] transition-all duration-500"
      >
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
      </BaseCard>

      <BaseCard
        variant="solid"
        padding="sm"
        rounded="2xl"
        className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 shadow-xl animate-float z-20"
      >
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
      </BaseCard>
    </AnimateOnScroll>
  );
};
