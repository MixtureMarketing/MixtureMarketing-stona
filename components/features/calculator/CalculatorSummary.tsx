import React, { memo } from 'react';
import { CheckCircle2, Clock, Zap, ShieldCheck } from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { CalculatorSelections } from '../../../hooks/useCalculator';

interface CalculatorSummaryProps {
  selections: CalculatorSelections;
  result: {
    minPrice: number;
    maxPrice: number;
    minTime: number;
    maxTime: number;
  };
}

const CalculatorSummary: React.FC<CalculatorSummaryProps> = memo(({ selections, result }) => {
  const projectLabels: Record<string, string> = {
    landingPage: 'Landing Page',
    corporate: 'Strona Firmowa',
    ecommerce: 'Sklep Online',
    webApp: 'Aplikacja / SaaS',
  };

  const designLabels: Record<string, string> = {
    template: 'Minimalistyczny',
    custom: 'Standard Custom',
    premium: 'Premium High-End',
  };

  const featureLabels: Record<string, string> = {
    cms: 'System CMS',
    blog: 'Moduł Bloga',
    i18n: 'Wielojęzyczność',
    integrations: 'Integracje API',
    payments: 'Płatności Online',
    auth: 'Konta Użytkowników',
    copywriting: 'Copywriting',
    seo: 'Audyt SEO',
    social: 'Analityka & Social',
  };

  return (
    <div className="lg:col-span-4 sticky top-32">
      <GlassCard className="p-8 border-secondary/10 bg-white/80 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-primary" /> Podsumowanie
        </h3>

        <div className="space-y-6 mb-8">
          <div>
            <p className="text-xxs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Typ Projektu
            </p>
            <p className="text-sm font-bold text-dark">{projectLabels[selections.projectType]}</p>
          </div>
          <div>
            <p className="text-xxs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Standard Designu
            </p>
            <p className="text-sm font-bold text-dark">{designLabels[selections.designLevel]}</p>
          </div>
          {(selections.features.length > 0 || selections.marketing.length > 0) && (
            <div>
              <p className="text-xxs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Wybrane Dodatki
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {[...selections.features, ...selections.marketing].map((f) => (
                  <span
                    key={f}
                    className="text-xxs bg-indigo-50 px-2 py-0.5 rounded text-secondary font-bold border border-indigo-100"
                  >
                    {featureLabels[f] || f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t-2 border-dashed border-gray-100 space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={16} />
              <span className="text-sm font-medium">Czas realizacji:</span>
            </div>
            <span className="text-lg font-black text-dark">
              {result.minTime}-{result.maxTime} tyg.
            </span>
          </div>
          <div className="bg-dark rounded-2xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={40} />
            </div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Szacowany Budżet
            </p>
            <div className="text-3xl font-black tracking-tight">
              {result.minPrice.toLocaleString()} - {result.maxPrice.toLocaleString()}{' '}
              <span className="text-sm text-white/40">PLN</span>
            </div>
            <p className="text-xxs text-white/40 mt-4 leading-tight">
              * Kwoty netto. Ostateczna wycena zależy od precyzyjnej specyfikacji projektu.
            </p>
          </div>
        </div>
      </GlassCard>

      <AnimateOnScroll delay={300} className="mt-6">
        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg text-secondary shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-dark mb-1">Gwarancja Jakości</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Każdy projekt obejmuje 6 miesięcy opieki technicznej i wsparcia po wdrożeniu.
            </p>
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
});

CalculatorSummary.displayName = 'CalculatorSummary';

export default CalculatorSummary;
