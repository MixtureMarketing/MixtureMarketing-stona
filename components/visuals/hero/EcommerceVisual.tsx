import React, { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, FileText, Truck } from 'lucide-react';
import BaseCard from '../../common/BaseCard';

export const EcommerceHeroVisual: React.FC = () => {
  const [pipelineStep, setPipelineStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BaseCard
      variant="solid"
      padding="lg"
      rounded="2xl"
      className="relative z-10 shadow-2xl border border-gray-200 transform rotate-1 hover:rotate-0 transition-all duration-500"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Automatyzacja Zamówienia
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-xxs font-bold text-success">SYSTEM ACTIVE</span>
        </div>
      </div>

      <div className="relative flex justify-between items-center mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#00C853] to-[#3F3D91] -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${(pipelineStep / 3) * 100}%` }}
        ></div>

        {[
          { icon: <ShoppingCart size={18} />, label: 'Zakup' },
          { icon: <CreditCard size={18} />, label: 'Płatność' },
          { icon: <FileText size={18} />, label: 'Faktura' },
          { icon: <Truck size={18} />, label: 'Wysyłka' },
        ].map((step, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center group">
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10
                           ${
                             i <= pipelineStep
                               ? 'bg-success border-success text-white scale-110 shadow-[0_0_20px_rgba(0,200,83,0.4)]'
                               : 'bg-white border-gray-200 text-gray-300'
                           }
                       `}
            >
              {step.icon}
            </div>
            <div
              className={`absolute -bottom-8 text-xxs font-bold uppercase tracking-wider transition-colors whitespace-nowrap
                           ${i <= pipelineStep ? 'text-dark' : 'text-gray-300'}
                       `}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-light-gray rounded-xl p-4 font-mono text-xs text-gray-700 space-y-3 border border-gray-100 shadow-inner">
        <div
          className={`flex items-center gap-2 transition-opacity duration-500 ${pipelineStep >= 0 ? 'opacity-100' : 'opacity-20'}`}
        >
          <span className="text-success font-bold">[10:42:01]</span> Nowe zamówienie #12450 (249.00
          PLN)
        </div>
        <div
          className={`flex items-center gap-2 transition-opacity duration-500 ${pipelineStep >= 1 ? 'opacity-100' : 'opacity-20'}`}
        >
          <span className="text-success font-bold">[10:42:05]</span> Płatność BLIK zatwierdzona
          (PayU)
        </div>
        <div
          className={`flex items-center gap-2 transition-opacity duration-500 ${pipelineStep >= 2 ? 'opacity-100' : 'opacity-20'}`}
        >
          <span className="text-success font-bold">[10:42:06]</span> Faktura VAT_12450.pdf wysłana
        </div>
        <div
          className={`flex items-center gap-2 transition-opacity duration-500 ${pipelineStep >= 3 ? 'opacity-100' : 'opacity-20'}`}
        >
          <span className="text-success font-bold">[10:42:10]</span> Etykieta InPost wygenerowana
        </div>
      </div>
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-r from-[#00C853]/20 to-[#3F3D91]/20 blur-3xl rounded-full opacity-50"></div>
    </BaseCard>
  );
};
