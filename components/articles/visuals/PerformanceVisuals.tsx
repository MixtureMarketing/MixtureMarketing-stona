import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useCounter } from '../../../hooks/useCounter';

// Refactored sub-visuals
import LighthouseGauge from './performance/LighthouseGauge';
import InpSimulator from './performance/InpSimulator';
import ClsSimulator from './performance/ClsSimulator';
import MainThreadVisualizer from './performance/MainThreadVisualizer';
import RevenueLossCalculator from './performance/RevenueLossCalculator';
import IcebergDiagram from './performance/IcebergDiagram';
import CwvChecklist from './performance/CwvChecklist';

export {
  LighthouseGauge,
  InpSimulator,
  ClsSimulator,
  MainThreadVisualizer,
  RevenueLossCalculator,
  IcebergDiagram,
  CwvChecklist,
};

export const ConversionBoost = ({ end }: { start: number; end: number }) => {
  const val = useCounter(end * 10, { duration: 1000, delay: 1000 }) / 10;
  return (
    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
      <span className="text-xxs font-black text-gray-600 uppercase mb-1">Conversion Rate</span>
      <div className="flex items-center gap-2">
        <TrendingUp className="text-emerald-500" size={16} />
        <span className="text-2xl font-black text-dark font-mono transition-all duration-1000">
          {val.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
