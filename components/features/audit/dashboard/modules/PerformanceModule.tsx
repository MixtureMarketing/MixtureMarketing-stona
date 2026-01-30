import React from 'react';
import { Zap } from 'lucide-react';

interface PerformanceModuleProps {
  lcp: number;
}

const PerformanceModule: React.FC<PerformanceModuleProps> = ({ lcp }) => {
  return (
    <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-100 transition-colors"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <span
            className={`text-xs font-black px-4 py-2 rounded-xl border-2 ${
              lcp < 2.5
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                : 'bg-rose-50 border-rose-100 text-rose-600'
            }`}
          >
            LCP: {typeof lcp === 'number' ? lcp.toFixed(2) : lcp}s
          </span>
        </div>
        <h4 className="text-xl font-black text-dark mb-3">Wydajność</h4>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">
          {lcp > 4.5
            ? 'Klienci uciekają, zanim zobaczą ofertę. Twój serwer to hamulec ręczny Twojego biznesu.'
            : lcp > 2.5
              ? 'Wymaga poprawy. Konkurencja może Cię wyprzedzić w wyścigu o uwagę klienta.'
              : 'Prędkość światła! Twoja strona działa błyskawicznie na urządzeniach mobilnych.'}
        </p>
      </div>
    </div>
  );
};

export default PerformanceModule;
