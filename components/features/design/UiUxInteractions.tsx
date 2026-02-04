import React from 'react';
import { CheckCircle2, Move } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import SectionWrapper from '../../common/SectionWrapper';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../../data/content/services/design/ui-ux';

const UiUxInteractions: React.FC = () => {
  return (
    <SectionWrapper variant="white" overflow={true} containerClassName="max-w-screen-xl">
      <div className="flex flex-col lg:flex-row gap-20 items-center">
        <div className="lg:w-1/2">
          <SectionHeader
            align="left"
            title={CONTENT.interactions.title}
            description={CONTENT.interactions.description}
          />
          <ul className="space-y-6 mt-10">
            {CONTENT.interactions.items.map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-secondary flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <span className="text-dark font-black text-sm uppercase tracking-wide block mb-1">
                    {item.title}
                  </span>
                  <span className="text-gray-700 text-sm">{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:w-1/2 grid grid-cols-2 gap-6">
          <GlassCard className="p-10 flex flex-col items-center justify-center h-56 hover:shadow-2xl transition-all cursor-pointer group bg-white border-gray-100">
            <button className="relative overflow-hidden px-8 py-4 bg-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all w-full group-hover:bg-secondary">
              Press Me
              <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-[2.5] transition-transform duration-500 rounded-full"></div>
            </button>
            <span className="text-xxs text-gray-600 mt-6 font-black uppercase tracking-widest">
              {CONTENT.interactions.labels.ripple}
            </span>
          </GlassCard>

          <GlassCard className="p-10 flex flex-col items-center justify-center h-56 hover:shadow-2xl transition-all bg-white border-gray-100">
            <label className="relative inline-flex items-center cursor-pointer transform scale-125">
              <input
                type="checkbox"
                className="sr-only peer"
                aria-label="Przełącz logikę interakcji"
              />
              <div className="w-16 h-9 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-success shadow-inner"></div>
            </label>
            <span className="text-xxs text-gray-600 mt-6 font-black uppercase tracking-widest">
              {CONTENT.interactions.labels.logic}
            </span>
          </GlassCard>

          <div className="col-span-2 h-36 perspective-[1000px] group">
            <div className="w-full h-full bg-gradient-to-r from-primary to-secondary rounded-3xl flex items-center justify-center text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl transform transition-all duration-500 group-hover:rotate-x-12 group-hover:-translate-y-3 cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="flex items-center gap-4 relative z-10">
                <Move size={24} /> {CONTENT.interactions.labels.perspective}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default UiUxInteractions;
