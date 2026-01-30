import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { WindowControls } from './atoms/WindowControls';

export const SeoHeroVisual: React.FC = () => {
  const [rankPosition, setRankPosition] = useState(6);

  useEffect(() => {
    const interval = setInterval(() => setRankPosition((prev) => (prev <= 1 ? 6 : prev - 1)), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative z-10 w-full max-w-sm md:max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-transform duration-700 mx-auto"
      style={{ transform: 'scale(var(--hero-scale)) rotateX(6deg) rotateY(6deg)' }}
    >
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <WindowControls />
        <div className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xxxs md:text-xxs text-gray-600 shadow-inner flex items-center">
          <Search size={10} className="mr-2" /> najlepsza firma w branży
        </div>
      </div>
      <div className="p-4 bg-white relative min-h-[320px] md:min-h-[380px] flex flex-col gap-3">
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
