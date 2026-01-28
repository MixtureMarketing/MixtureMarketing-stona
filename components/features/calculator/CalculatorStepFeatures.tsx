import React, { memo, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ProjectType } from '../../../hooks/useCalculator';

interface CalculatorStepFeaturesProps {
  projectType: ProjectType;
  selectedFeatures: string[];
  onToggle: (feature: string) => void;
}

const ALL_FEATURES = [
  {
    id: 'cms',
    label: 'System CMS',
    desc: 'Samodzielna edycja treści.',
    types: ['landingPage', 'corporate', 'ecommerce', 'webApp'],
  },
  {
    id: 'blog',
    label: 'Moduł Bloga',
    desc: 'Artykuły i aktualności.',
    types: ['corporate', 'ecommerce', 'webApp'],
  },
  {
    id: 'i18n',
    label: 'Wielojęzyczność',
    desc: 'Wersje EN, DE, etc.',
    types: ['corporate', 'ecommerce', 'webApp'],
  },
  {
    id: 'integrations',
    label: 'Integracje API',
    desc: 'CRM, ERP, zewnętrzne bazy.',
    types: ['ecommerce', 'webApp'],
  },
  {
    id: 'payments',
    label: 'Płatności Online',
    desc: 'Bramki płatnicze.',
    types: ['landingPage', 'ecommerce', 'webApp'],
  },
  {
    id: 'auth',
    label: 'Konta Użytkowników',
    desc: 'Logowanie i panele klienta.',
    types: ['webApp', 'ecommerce'],
  },
];

const CalculatorStepFeatures: React.FC<CalculatorStepFeaturesProps> = memo(
  ({ projectType, selectedFeatures, onToggle }) => {
    const visibleFeatures = useMemo(
      () => ALL_FEATURES.filter((item) => item.types.includes(projectType)),
      [projectType],
    );

    return (
      <div className="animate-fade-in">
        <h3 className="text-2xl font-bold text-dark mb-8">Funkcjonalności</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {visibleFeatures.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all group relative ${
                selectedFeatures.includes(item.id)
                  ? 'border-secondary bg-indigo-50/50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-dark">{item.label}</h4>
                <div
                  className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${selectedFeatures.includes(item.id) ? 'bg-secondary border-secondary' : 'bg-white border-gray-300'}`}
                >
                  {selectedFeatures.includes(item.id) && (
                    <CheckCircle2 className="text-white" size={14} />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  },
);

CalculatorStepFeatures.displayName = 'CalculatorStepFeatures';

export default CalculatorStepFeatures;
