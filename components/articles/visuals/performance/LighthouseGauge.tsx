import React from 'react';
import { useCounter } from '../../../../hooks/useCounter';

const LighthouseGauge = ({ score }: { score: number }) => {
  const current = useCounter(score, { duration: 1000, delay: 500 });
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (current / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="45" stroke="#f3f4f6" strokeWidth="8" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#10B981"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-dark">{current}</span>
        </div>
      </div>
      <span className="text-xxs font-black text-emerald-500 uppercase mt-2 tracking-widest">
        Performance
      </span>
    </div>
  );
};

export default LighthouseGauge;
