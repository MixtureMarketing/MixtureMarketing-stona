import React, { useState } from 'react';
import { Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LANDING_PAGE_CONTENT } from '../../../data/content';
import BaseCard from '../../common/BaseCard';

export const LandingPageHeroVisual: React.FC = () => {
  const [loadTime, setLoadTime] = useState(0.8);
  const CONTENT = LANDING_PAGE_CONTENT;

  const { score, conversionDrop } = React.useMemo(() => {
    let s = 98;
    let drop = 0;

    if (loadTime <= 1) {
      drop = 0;
      s = Math.max(90, 100 - loadTime * 5);
    } else {
      drop = Math.min((loadTime - 1) * 7, 100);
      drop = Math.round(drop * 10) / 10;
      s = Math.max(0, 90 - (loadTime - 1) * 20);
    }

    return { score: Math.round(s), conversionDrop: drop };
  }, [loadTime]);

  const getScoreColor = (s: number) => {
    if (s >= 90) return '#00C853';
    if (s >= 50) return '#FFA000';
    return '#FF5252';
  };

  return (
    <BaseCard
      variant="solid"
      padding="lg"
      rounded="3xl"
      className="relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 max-w-lg mx-auto transform transition-all hover:scale-[1.01] duration-500"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="font-bold text-dark flex items-center gap-2">
          <Gauge size={20} className="text-instagram" />
          {CONTENT.hero.simulator.title}
        </div>
        <div className="flex items-center gap-2 text-xxs font-bold uppercase tracking-wider text-gray-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live Check
        </div>
      </div>

      <div className="flex justify-center mb-10 relative">
        <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#F3F4F6" strokeWidth="12" />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="12"
            strokeDasharray={552}
            strokeDashoffset={552 - (552 * score) / 100}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-black tracking-tighter leading-none transition-colors duration-300"
            style={{ color: getScoreColor(score) }}
          >
            {score}
          </span>
          <span className="text-xs font-bold text-gray-600 uppercase mt-2 tracking-widest">
            {CONTENT.hero.simulator.labels.score}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <div className="text-xxs text-gray-600 uppercase font-bold mb-1">
            {CONTENT.hero.simulator.labels.loadTime}
          </div>
          <div className="text-xl font-black text-dark">{loadTime.toFixed(1)}s</div>
        </div>
        <div
          className={`p-4 rounded-2xl border text-center transition-colors duration-300 ${conversionDrop > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
        >
          <div className="text-xxs uppercase font-bold mb-1 flex items-center justify-center gap-1">
            {conversionDrop > 0 ? (
              <AlertTriangle size={12} className="text-red-500" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={12} className="text-green-500" aria-hidden="true" />
            )}
            <span className={conversionDrop > 0 ? 'text-red-600' : 'text-green-700'}>
              {CONTENT.hero.simulator.labels.conversionLoss}
            </span>
          </div>
          <div
            className={`text-xl font-black ${conversionDrop > 0 ? 'text-red-500' : 'text-green-700'}`}
          >
            {conversionDrop > 0 ? `-${conversionDrop}%` : '0%'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold text-gray-600">
          <span>{CONTENT.hero.simulator.labels.fast}</span>
          <span>{CONTENT.hero.simulator.labels.slow}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5.0"
          step="0.1"
          value={loadTime}
          onChange={(e) => setLoadTime(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#213261]"
          aria-label="Symulacja: Dostosuj czas ładowania strony"
        />
      </div>
    </BaseCard>
  );
};
