import React from 'react';
import { Layout, Building2, ShoppingCart, Code2 } from 'lucide-react';
import { ProjectType } from '../../../hooks/useCalculator';

interface CalculatorStepTypeProps {
  currentType: ProjectType;
  onSelect: (type: ProjectType) => void;
}

const CalculatorStepType: React.FC<CalculatorStepTypeProps> = ({ currentType, onSelect }) => {
  return (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-bold text-dark mb-8">Co budujemy?</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            id: 'landingPage',
            label: 'Landing Page',
            icon: Layout,
            desc: 'Jednostronicowa witryna sprzedażowa.',
          },
          {
            id: 'corporate',
            label: 'Strona Firmowa',
            icon: Building2,
            desc: 'Wizerunkowy serwis z wieloma podstronami.',
          },
          {
            id: 'ecommerce',
            label: 'Sklep Online',
            icon: ShoppingCart,
            desc: 'System sprzedażowy z płatnościami.',
          },
          {
            id: 'webApp',
            label: 'Aplikacja / SaaS',
            icon: Code2,
            desc: 'Dedykowany system z logiką biznesową.',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as ProjectType)}
            className={`text-left p-6 rounded-2xl border-2 transition-all group ${
              currentType === item.id
                ? 'border-secondary bg-indigo-50/50 shadow-md'
                : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
            }`}
          >
            <item.icon
              className={`mb-4 transition-colors ${currentType === item.id ? 'text-secondary' : 'text-gray-400'}`}
              size={32}
            />
            <h4 className="font-bold text-dark mb-1">{item.label}</h4>
            <p className="text-sm text-gray-500 leading-snug">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorStepType;
