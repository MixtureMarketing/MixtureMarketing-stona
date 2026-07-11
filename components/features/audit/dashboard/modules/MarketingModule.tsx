import React from 'react';
import { TrendingUp, Check, X } from 'lucide-react';
import { cardCls, IconTile } from '../ui';

interface MarketingModuleProps {
  analytics: boolean;
  pixel: boolean;
}

const Row: React.FC<{ label: string; on: boolean }> = ({ label, on }) => (
  <li className="flex items-center justify-between text-[12.5px] text-gray-600 px-3 py-2.5 bg-[#f8f9fb] border border-gray-100 rounded-lg">
    <span>{label}</span>
    {on ? (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#027a34]">
        <Check size={15} /> Wykryto
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-400">
        <X size={15} /> Brak
      </span>
    )}
  </li>
);

const MarketingModule: React.FC<MarketingModuleProps> = ({ analytics, pixel }) => {
  return (
    <div className={`${cardCls} h-full p-5`}>
      <div className="flex items-start justify-between mb-3.5">
        <IconTile tone="indigo">
          <TrendingUp size={20} />
        </IconTile>
      </div>
      <h4 className="text-[15px] font-bold text-dark mb-3">Analityka i śledzenie</h4>
      <ul className="flex flex-col gap-2">
        <Row label="Google Analytics 4" on={analytics} />
        <Row label="Meta Pixel" on={pixel} />
      </ul>
    </div>
  );
};

export default MarketingModule;
