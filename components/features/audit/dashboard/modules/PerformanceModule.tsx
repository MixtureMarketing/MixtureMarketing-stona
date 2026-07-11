import React from 'react';
import { Zap } from 'lucide-react';
import { cardCls, IconTile } from '../ui';

interface PerformanceModuleProps {
  lcp: number;
}

const PerformanceModule: React.FC<PerformanceModuleProps> = ({ lcp }) => {
  const ok = lcp < 2.5;
  const lcpLabel = typeof lcp === 'number' ? lcp.toFixed(2).replace('.', ',') : lcp;
  return (
    <div className={`${cardCls} h-full p-5`}>
      <div className="flex items-start justify-between mb-3.5">
        <IconTile tone="amber">
          <Zap size={20} />
        </IconTile>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-md tabular-nums ${
            ok ? 'bg-[#e7f8ee] text-[#027a34]' : 'bg-[#fff1f2] text-[#be123c]'
          }`}
        >
          LCP {lcpLabel} s
        </span>
      </div>
      <h4 className="text-[15px] font-bold text-dark mb-1.5">Wydajność</h4>
      <p className="text-[12.5px] text-gray-500 leading-relaxed">
        {lcp > 4.5
          ? 'Klienci uciekają, zanim zobaczą ofertę. Serwer to hamulec ręczny Twojego biznesu.'
          : lcp > 2.5
            ? 'Wymaga poprawy. Konkurencja może wyprzedzić Cię w wyścigu o uwagę klienta.'
            : 'Błyskawicznie. Twoja strona ładuje się szybciej niż większość konkurencji.'}
      </p>
    </div>
  );
};

export default PerformanceModule;
