import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import SectionWrapper from '../../common/SectionWrapper';
import { CORPORATE_WEBSITE_CONTENT as CONTENT } from '../../../data/content/services/web-development/corporate';

const CorporateCmsComparison: React.FC = () => {
  const [activeCms, setActiveCms] = useState<'wordpress' | 'headless'>('wordpress');

  return (
    <SectionWrapper variant="white">
      <div className="text-center mb-16">
        <SectionHeader title={CONTENT.cms.title} description={CONTENT.cms.description} />
        <div
          className="inline-flex bg-[#F1F5F9] p-1.5 rounded-full mt-8 border border-gray-200 shadow-inner relative"
          role="group"
          aria-label="Wybór silnika CMS"
        >
          <div
            className={`absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm border border-gray-200 transition-all duration-300 ease-in-out z-0`}
            style={{
              left: activeCms === 'wordpress' ? '6px' : 'calc(50% + 3px)',
              width: 'calc(50% - 9px)',
            }}
          ></div>
          <button
            onClick={() => setActiveCms('wordpress')}
            aria-pressed={activeCms === 'wordpress'}
            className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full text-xs md:text-sm font-black transition-colors duration-300 flex items-center gap-2 ${activeCms === 'wordpress' ? 'text-dark' : 'text-gray-500 hover:text-dark'}`}
          >
            {CONTENT.cms.wordpress.label}
          </button>
          <button
            onClick={() => setActiveCms('headless')}
            aria-pressed={activeCms === 'headless'}
            className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full text-xs md:text-sm font-black transition-colors duration-300 flex items-center gap-2 ${activeCms === 'headless' ? 'text-dark' : 'text-gray-500 hover:text-dark'}`}
          >
            {CONTENT.cms.headless.label}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-dark">
            {activeCms === 'wordpress' ? CONTENT.cms.wordpress.title : CONTENT.cms.headless.title}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">
            {activeCms === 'wordpress' ? CONTENT.cms.wordpress.desc : CONTENT.cms.headless.desc}
          </p>
          <ul className="space-y-3">
            {(activeCms === 'wordpress'
              ? CONTENT.cms.wordpress.features
              : CONTENT.cms.headless.features
            ).map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700 font-bold">
                <CheckCircle2 size={18} className="text-success shrink-0" /> {feat}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative order-first lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-2xl transform rotate-2"></div>
          <GlassCard className="relative bg-white shadow-xl overflow-hidden aspect-[16/10] flex flex-col p-0 border border-gray-200">
            <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
            </div>
            <div className="p-6 flex flex-col gap-4 h-full animate-fade-in bg-gray-50/50 overflow-hidden">
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 w-full bg-white rounded border border-gray-100 shadow-sm"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CorporateCmsComparison;
