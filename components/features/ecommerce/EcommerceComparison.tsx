import React from 'react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';

const EcommerceComparison: React.FC = () => {
  return (
    <SectionWrapper variant="white">
      <SectionHeader
        title={CONTENT.ownership.title}
        description={CONTENT.ownership.description}
        className="mb-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* SaaS - Rent */}
        <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50 flex flex-col">
          <div className="text-xxs font-black text-gray-400 uppercase tracking-widest mb-4">
            {CONTENT.ownership.saas.badge}
          </div>
          <h3 className="text-2xl font-bold text-dark mb-1">{CONTENT.ownership.saas.title}</h3>
          <p className="text-sm text-gray-500 mb-8">{CONTENT.ownership.saas.subtitle}</p>

          <div className="space-y-4 mb-8 flex-grow">
            {CONTENT.ownership.saas.rows.map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-3 border-b border-gray-200/50"
              >
                <span className="text-sm font-medium text-gray-600">{row.label}</span>
                <span className="text-sm font-bold text-red-500">{row.val}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
            {CONTENT.ownership.saas.risk}
          </div>
        </div>

        {/* Our Standard - Ownership */}
        <div className="p-8 rounded-3xl border-2 border-secondary bg-white shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest">
            Rekomendowane
          </div>
          <div className="text-xxs font-black text-secondary uppercase tracking-widest mb-4">
            {CONTENT.ownership.woo.badge}
          </div>
          <h3 className="text-2xl font-bold text-dark mb-1">{CONTENT.ownership.woo.title}</h3>
          <p className="text-sm text-gray-500 mb-8">{CONTENT.ownership.woo.subtitle}</p>

          <div className="space-y-4 mb-8 flex-grow">
            {CONTENT.ownership.woo.rows.map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span className="text-sm font-medium text-gray-600">{row.label}</span>
                <span className="text-sm font-bold text-success">{row.val}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-600 font-medium">
            {CONTENT.ownership.woo.safety}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default EcommerceComparison;
