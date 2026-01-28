/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface CalculatorStepMarketingProps {
  selectedMarketing: string[];
  onToggle: (option: string) => void;
}

const CalculatorStepMarketing: React.FC<CalculatorStepMarketingProps> = ({
  selectedMarketing,
  onToggle,
}) => {
  return (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-bold text-dark mb-8">Wsparcie na start</h3>
      <div className="space-y-4">
        {[
          {
            id: 'copywriting',
            label: 'Copywriting Specjalistyczny',
            desc: 'Przygotujemy teksty, które sprzedają za Ciebie.',
          },
          {
            id: 'seo',
            label: 'SEO Technical Audit',
            desc: 'Optymalizacja pod roboty Google na start.',
          },
          {
            id: 'social',
            label: 'Setup Analityki & Social',
            desc: 'Konfiguracja Pixel, GA4, GTM i linkowanie.',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-6 group ${
              selectedMarketing.includes(item.id)
                ? 'border-secondary bg-indigo-50/50 shadow-md'
                : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
            }`}
          >
            <div
              className={`p-4 rounded-xl transition-colors ${selectedMarketing.includes(item.id) ? 'bg-secondary text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-bold text-dark mb-1">{item.label}</h4>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            {selectedMarketing.includes(item.id) && (
              <CheckCircle2 className="ml-auto text-secondary" size={24} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorStepMarketing;
