import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import TiltCard from './TiltCard';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../../data/content';

const PrintFinishes: React.FC = () => {
  const [activeFinish, setActiveFinish] = useState<'none' | 'gold' | 'uv' | 'emboss'>('none');

  return (
    <section className="py-24 bg-white relative z-10 overflow-hidden no-cursor-glow">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={CONTENT.finishes.title}
          description={CONTENT.finishes.description}
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-4 space-y-4">
            {CONTENT.finishes.items.map((finish) => (
              <button
                key={finish.id}
                onClick={() => setActiveFinish(finish.id as 'none' | 'gold' | 'uv' | 'emboss')}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-start gap-4 group
                              ${
                                activeFinish === finish.id
                                  ? 'border-[#F4B400] bg-[#FFFBF0] shadow-md scale-105 ring-1 ring-[#F4B400]'
                                  : 'border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50'
                              }
                          `}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors
                              ${activeFinish === finish.id ? 'border-[#F4B400] bg-[#F4B400] text-white' : 'border-gray-300 group-hover:border-gray-400'}
                          `}
                >
                  {activeFinish === finish.id && <CheckCircle2 size={14} />}
                </div>
                <div>
                  <h3
                    className={`font-bold text-lg mb-1 transition-colors ${activeFinish === finish.id ? 'text-deep-dark' : 'text-gray-600'}`}
                  >
                    {finish.label}
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">{finish.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 flex justify-center perspective-1000">
            <TiltCard activeFinish={activeFinish} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrintFinishes;
