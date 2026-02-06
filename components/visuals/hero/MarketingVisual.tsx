import React from 'react';
import { Megaphone, Search, TrendingUp, Target } from 'lucide-react';
import LazyHydrate from '../../common/LazyHydrate';
import BaseCard from '../../common/BaseCard';
import { useCounter } from '../../../hooks/useCounter';
import { MARKETING_CONTENT } from '../../../data/content';

export const MarketingHeroVisual: React.FC = () => {
  const revenue = useCounter(124500, {
    increment: 150,
    tickInterval: 3000,
  });

  return (
    <LazyHydrate>
      <div className="relative group">
        <BaseCard
          variant="dark"
          padding="lg"
          rounded="3xl"
          className="relative z-10 border-[#1E293B] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(63,61,145,0.25)] transition-all duration-500 overflow-hidden"
        >
          {/* Internal Grid Effect */}
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 relative z-10">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {MARKETING_CONTENT.hero.revenueLabel}
              </div>
              <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                {revenue.toLocaleString()} <span className="text-xl text-gray-500">PLN</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-400/20">
              <TrendingUp size={14} /> +12.5%
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {[
              {
                label: 'Google Ads (ROAS 8.5)',
                icon: <Search size={14} />,
                val: 80,
                col: 'from-blue-500 to-emerald-500',
              },
              {
                label: 'Meta Ads (CPA 12zł)',
                icon: <Megaphone size={14} />,
                val: 65,
                col: 'from-pink-500 to-purple-600',
              },
              {
                label: 'SEO Visibility',
                icon: <TrendingUp size={14} />,
                val: 45,
                col: 'from-emerald-400 to-emerald-600',
              },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-gray-400">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xxs font-black text-white/40">{item.val}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <div
                    className={`h-full bg-gradient-to-r ${item.col} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Scanner Effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-scan"></div>
        </BaseCard>

        {/* Floating Secondary Badge - Scale Index */}
        <div
          className="absolute -top-4 right-2 sm:-top-6 sm:right-4 hidden sm:block animate-float z-20"
          style={{ animationDelay: '0.5s' }}
        >
          <BaseCard
            variant="solid"
            padding="sm"
            rounded="2xl"
            className="shadow-2xl border-white/50 bg-white/95 backdrop-blur-md px-4 py-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Target size={20} />
              </div>
              <div className="pr-1">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 whitespace-nowrap">
                  Scale Index
                </div>
                <div className="text-base font-black text-dark tracking-tighter">9.8/10</div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </LazyHydrate>
  );
};
