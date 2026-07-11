import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cardCls, IconTile } from '../ui';

interface TechModuleProps {
  cms?: string[];
  ssl: boolean;
  accessibility?: number;
  socialCount: number;
}

const TechModule: React.FC<TechModuleProps> = ({ cms, ssl, accessibility, socialCount }) => {
  return (
    <div className={`${cardCls} h-full p-5`}>
      <div className="flex items-start justify-between mb-3.5">
        <IconTile tone="blue">
          <ShieldCheck size={20} />
        </IconTile>
      </div>
      <h4 className="text-[15px] font-bold text-dark mb-3">Technologia</h4>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cms?.map((c, i) => (
          <span
            key={i}
            className="text-[11px] font-semibold bg-[#eaf4fb] text-dark px-2 py-1 rounded-md"
          >
            {c}
          </span>
        ))}
        {ssl && (
          <span className="text-[11px] font-semibold bg-[#e7f8ee] text-[#027a34] px-2 py-1 rounded-md">
            SSL OK
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="px-3 py-2.5 bg-[#f8f9fb] border border-gray-100 rounded-lg">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.06em] mb-1">
            Dostępność
          </div>
          <div className="text-sm font-extrabold text-dark tabular-nums">
            {accessibility ? `${Math.round(accessibility)}/100` : 'Brak danych'}
          </div>
        </div>
        <div className="px-3 py-2.5 bg-[#f8f9fb] border border-gray-100 rounded-lg">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.06em] mb-1">
            Social media
          </div>
          <div className="text-sm font-extrabold text-dark tabular-nums">{socialCount} linki</div>
        </div>
      </div>
    </div>
  );
};

export default TechModule;
