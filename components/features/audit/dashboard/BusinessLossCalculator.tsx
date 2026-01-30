import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BusinessLossCalculatorProps {
  lcp: number;
}

const BusinessLossCalculator: React.FC<BusinessLossCalculatorProps> = ({ lcp }) => {
  const [budget, setBudget] = useState(2500);

  const delay = Math.max(0, lcp - 2.0);
  const conversionDropRate = 0.07;
  const lossPercentage = Math.min(delay * conversionDropRate, 0.5);
  const monthlyLoss = Math.round(budget * lossPercentage);

  return (
    <div className="rounded-[2.5rem] p-10 relative overflow-hidden bg-dark text-white shadow-3xl group transition-all duration-700">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,#3F3D91_0%,transparent_50%)]"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xxs font-black uppercase tracking-widest mb-6 border border-white/5">
            <DollarSign size={12} className="text-emerald-400" /> Kalkulator Strat Biznesowych
          </div>
          <h2 className="text-4xl font-black mb-8 leading-[1.1]">
            Twoje błędy mają <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300">
              konkretną cenę.
            </span>
          </h2>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">
                Budżet Marketingowy
              </span>
              <span className="text-3xl font-black text-white leading-none tracking-tighter">
                {budget.toLocaleString()} <span className="text-lg text-blue-300">PLN</span>
              </span>
            </div>
            <div className="relative pt-4 pb-2">
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all"
              />
              <div
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full pointer-events-none"
                style={{ width: `${(budget / 50000) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xxs font-black text-blue-300/40 uppercase tracking-widest">
              <span>min. 500 PLN</span>
              <span>max. 50 000 PLN</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group/box">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent"></div>

          <div className="text-center relative z-10">
            <p className="text-xs font-black text-blue-200 uppercase tracking-[0.2em] mb-4">
              Strata przychodów / msc
            </p>
            <div className="text-6xl font-black text-white mb-4 tracking-tighter flex items-center justify-center">
              {monthlyLoss > 0 ? (
                <motion.span
                  key={monthlyLoss}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-rose-400 mr-2"
                >
                  -
                </motion.span>
              ) : null}
              {monthlyLoss.toLocaleString()}
              <span className="text-2xl text-blue-300 ml-3">PLN</span>
            </div>

            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                delay > 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {delay > 0 ? (
                <>
                  <AlertCircle size={16} /> Opóźnienie: {delay.toFixed(1)}s
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Optymalna szybkość
                </>
              )}
            </div>

            <p className="text-xxs text-blue-300/40 mt-6 font-medium italic leading-relaxed">
              * Wyliczenia oparte na badaniach Google & Amazon: <br />
              Każde 100ms opóźnienia to średnio 1% spadku konwersji.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLossCalculator;
