import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../../data/content';
import SectionWrapper from '../../common/SectionWrapper';

const PrintGuarantee: React.FC = () => {
  return (
    <SectionWrapper variant="white">
      {/* Paleta marki zamiast złota/kremu — złoto na tej stronie zostaje tylko
          na wizytówce jako treść uszlachetnienia (2026-07-16). */}
      <div className="bg-blue-50 border border-secondary/15 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6 text-secondary">
          <ShieldCheck size={48} aria-hidden="true" />
        </div>

        <h3 className="text-3xl font-bold text-dark mb-4">{CONTENT.guarantee.title}</h3>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          {CONTENT.guarantee.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-bold text-dark">
          {CONTENT.guarantee.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-xl border border-secondary/15"
            >
              <CheckCircle2 size={18} className="text-secondary" aria-hidden="true" /> {item}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PrintGuarantee;
