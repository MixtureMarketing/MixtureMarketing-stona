import React from 'react';
import { Megaphone, Search, TrendingUp } from 'lucide-react';
import LazyHydrate from '../../common/LazyHydrate';
import { useCounter } from '../../../hooks/useCounter';
import { MARKETING_CONTENT } from '../../../data/content';

export const MarketingHeroVisual: React.FC = () => {
  const revenue = useCounter(124500, {
    increment: 150,
    tickInterval: 3000,
  });

  return (
    <LazyHydrate>
      <div className="relative z-10 bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-2xl p-5 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="text-xxs text-gray-300 uppercase font-bold tracking-widest mb-1">
              {MARKETING_CONTENT.hero.revenueLabel}
            </div>
            <div className="text-3xl md:text-4xl font-black text-white">
              {revenue.toLocaleString()} PLN
            </div>
          </div>
          <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full text-xs font-bold">
            <TrendingUp size={14} /> +12.5%
          </div>
        </div>

        <div className="space-y-5">
          {[
            {
              label: 'Google Ads (ROAS 8.5)',
              icon: <Search size={14} />,
              val: 80,
              col: 'from-[#4285F4] to-[#34A853]',
            },
            {
              label: 'Meta Ads (CPA 12zł)',
              icon: <Megaphone size={14} />,
              val: 65,
              col: 'from-[#E1306C] to-[#833AB4]',
            },
            {
              label: 'SEO Organic',
              icon: <TrendingUp size={14} />,
              val: 45,
              col: 'from-[#00C853] to-[#00C853]',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center text-gray-600 shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xxs font-bold text-gray-300 uppercase tracking-tight">
                    {item.label}
                  </span>
                </div>
                <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.col} animate-pulse`}
                    style={{ width: `${item.val}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LazyHydrate>
  );
};
