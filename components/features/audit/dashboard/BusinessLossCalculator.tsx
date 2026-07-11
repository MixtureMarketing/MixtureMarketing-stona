import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BusinessLossCalculatorProps {
  lcp: number;
}

const BusinessLossCalculator: React.FC<BusinessLossCalculatorProps> = ({ lcp }) => {
  const [budget, setBudget] = useState(2500);

  const delay = Math.max(0, lcp - 2.0);
  const lossPercentage = Math.min(delay * 0.07, 0.5);
  const monthlyLoss = Math.round(budget * lossPercentage);

  return (
    <div className="rounded-2xl p-6 md:p-8 bg-dark text-white grid grid-cols-1 md:grid-cols-[1fr_320px] gap-7 items-center">
      <div>
        <h3 className="text-[26px] font-bold leading-[1.15] tracking-tight mb-5">
          Twoje błędy mają <span className="text-[#ff9db0]">konkretną cenę.</span>
        </h3>

        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold text-blue-200/70 uppercase tracking-[0.03em]">
            Budżet marketingowy
          </span>
          <span className="text-2xl font-bold text-white tabular-nums">
            {budget.toLocaleString('pl-PL')} <span className="text-sm text-blue-300">PLN</span>
          </span>
        </div>
        <div className="relative py-2">
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value))}
            aria-label="Budżet marketingowy"
            className="w-full h-1.5 bg-white/12 rounded-full appearance-none cursor-pointer accent-success relative z-10"
          />
        </div>
        <div className="flex justify-between text-[11px] font-medium text-blue-300/40 tabular-nums">
          <span>500 PLN</span>
          <span>50 000 PLN</span>
        </div>
      </div>

      <div className="bg-white/[0.04] rounded-xl p-6 border border-white/10 text-center">
        <p className="text-[11px] font-bold text-blue-200/70 uppercase tracking-[0.1em] mb-1.5">
          Strata przychodu / mies.
        </p>
        <div className="text-[46px] font-extrabold text-[#ff8fa3] leading-none tabular-nums tracking-tight mb-3">
          {monthlyLoss > 0 ? '−' : ''}
          {monthlyLoss.toLocaleString('pl-PL')}
          <span className="text-lg text-blue-300 ml-1.5">PLN</span>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11.5px] font-bold uppercase tracking-[0.04em] tabular-nums ${
            delay > 0
              ? 'bg-[rgba(255,80,110,0.14)] text-[#ff9db0] border border-[rgba(255,80,110,0.24)]'
              : 'bg-success/15 text-success border border-success/25'
          }`}
        >
          {delay > 0 ? (
            <>
              <AlertCircle size={14} /> Opóźnienie {delay.toFixed(1).replace('.', ',')} s
            </>
          ) : (
            <>
              <CheckCircle2 size={14} /> Optymalna szybkość
            </>
          )}
        </div>
        <p className="text-[10.5px] text-blue-300/45 mt-4 leading-relaxed">
          Wg badań Google &amp; Amazon: każde 100 ms opóźnienia to ~1% spadku konwersji.
        </p>
      </div>
    </div>
  );
};

export default BusinessLossCalculator;
