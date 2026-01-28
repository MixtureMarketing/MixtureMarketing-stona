import React from 'react';
import { Zap, Palette, Award, CheckCircle2 } from 'lucide-react';
import { DesignLevel } from '../../../hooks/useCalculator';

interface CalculatorStepDesignProps {
  currentLevel: DesignLevel;
  onSelect: (level: DesignLevel) => void;
}

const CalculatorStepDesign: React.FC<CalculatorStepDesignProps> = ({ currentLevel, onSelect }) => {
  return (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-bold text-dark mb-8">Poziom Designu</h3>
      <div className="space-y-4">
        {[
          {
            id: 'template',
            label: 'Minimalistyczny / Clean',
            icon: Zap,
            desc: 'Skupienie na szybkości i treści. Prosta, ale estetyczna forma.',
          },
          {
            id: 'custom',
            label: 'Custom Standard',
            icon: Palette,
            desc: 'Unikalny projekt dopasowany do brandingu Twojej firmy.',
          },
          {
            id: 'premium',
            label: 'Premium / High-End',
            icon: Award,
            desc: 'Efekt WOW, animacje, zaawansowany UX i dbałość o detale.',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as DesignLevel)}
            className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-6 group ${
              currentLevel === item.id
                ? 'border-secondary bg-indigo-50/50 shadow-md'
                : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
            }`}
          >
            <div
              className={`p-4 rounded-xl transition-colors ${currentLevel === item.id ? 'bg-secondary text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              <item.icon size={24} />
            </div>
            <div>
              <h4 className="font-bold text-dark mb-1">{item.label}</h4>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            {currentLevel === item.id && (
              <CheckCircle2 className="ml-auto text-secondary" size={24} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorStepDesign;
