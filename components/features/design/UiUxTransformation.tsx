import React, { useState } from 'react';
import { Grid, Palette, Zap } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import BaseCard from '../../common/BaseCard';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../../data/content/services/design/ui-ux';

const UiUxTransformation: React.FC = () => {
  const [viewMode, setViewMode] = useState<'lofi' | 'hifi'>('hifi');

  return (
    <SectionWrapper variant="light-gray">
      <SectionHeader
        title={CONTENT.transformation.title}
        description={CONTENT.transformation.description}
        className="mb-16"
      />

      <div className="flex justify-center mb-16">
        <div className="bg-white p-2 rounded-3xl border border-gray-200 inline-flex shadow-xl">
          <button
            onClick={() => setViewMode('lofi')}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${viewMode === 'lofi' ? 'bg-dark text-white shadow-xl scale-105' : 'text-gray-600 hover:text-dark'}`}
          >
            <Grid size={18} /> {CONTENT.transformation.labels.lofi}
          </button>
          <button
            onClick={() => setViewMode('hifi')}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${viewMode === 'hifi' ? 'bg-dark text-white shadow-xl scale-105' : 'text-gray-600 hover:text-dark'}`}
          >
            <Palette size={18} /> {CONTENT.transformation.labels.hifi}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto perspective-[2000px]">
        <BaseCard
          variant="solid"
          padding="none"
          rounded="3xl"
          className={`relative overflow-hidden transition-all duration-1000 ${viewMode === 'lofi' ? 'border-gray-200 grayscale' : 'border-primary/30 ring-[12px] ring-[#E0EFFF]/50 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.3)]'}`}
        >
          {/* Browser Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
            </div>
            <div className="flex-1 bg-white h-8 rounded-xl border border-gray-200 flex items-center px-4 text-xxs font-mono text-gray-300">
              https://interface-audit.mixturemarketing.pl
            </div>
          </div>

          {/* Content Container */}
          <div className="p-12 md:p-20 transition-all duration-1000">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-16">
              <div
                className={`w-40 h-10 rounded-xl ${viewMode === 'lofi' ? 'bg-gray-100 border-2 border-dashed border-gray-200' : 'bg-dark'}`}
              ></div>
              <div className="flex gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-20 h-2 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-200'}`}
                  ></div>
                ))}
                <div
                  className={`w-32 h-10 rounded-xl ${viewMode === 'lofi' ? 'border-2 border-dashed border-gray-300' : 'bg-primary shadow-xl shadow-primary/30'}`}
                ></div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-20 items-center">
              <div className="w-full md:w-1/2 space-y-8">
                <div
                  className={`w-full h-16 rounded-2xl ${viewMode === 'lofi' ? 'bg-gray-100 border-2 border-dashed border-gray-200' : 'bg-gradient-to-r from-dark to-secondary'}`}
                ></div>
                <div className="space-y-4">
                  <div
                    className={`w-full h-3 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-100'}`}
                  ></div>
                  <div
                    className={`w-full h-3 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-100'}`}
                  ></div>
                  <div
                    className={`w-2/3 h-3 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-100'}`}
                  ></div>
                </div>
                <div className="pt-6 flex gap-6">
                  <div
                    className={`w-48 h-14 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'lofi' ? 'bg-gray-50 border-2 border-dashed border-gray-300 text-gray-300' : 'bg-dark text-white shadow-2xl hover:scale-105 cursor-pointer'}`}
                  >
                    {viewMode === 'hifi'
                      ? CONTENT.transformation.hifi.cta
                      : CONTENT.transformation.lofi.cta}
                  </div>
                  <div
                    className={`w-48 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'lofi' ? 'border-dashed border-gray-200 text-gray-200' : 'border-dark text-dark hover:bg-gray-50 cursor-pointer'}`}
                  >
                    {viewMode === 'hifi'
                      ? CONTENT.transformation.hifi.secondary
                      : CONTENT.transformation.lofi.secondary}
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div
                  className={`w-full aspect-square rounded-[3rem] transition-all duration-1000 ${viewMode === 'lofi' ? 'bg-gray-50 border-4 border-dashed border-gray-200 flex items-center justify-center' : 'bg-gradient-to-br from-[#E0EFFF] to-white shadow-inner flex items-center justify-center relative overflow-hidden'}`}
                >
                  {viewMode === 'lofi' ? (
                    <div className="text-gray-200 font-black text-4xl tracking-tighter transform -rotate-12">
                      IMAGE_SLOT
                    </div>
                  ) : (
                    <div className="relative z-10 w-64 h-64 bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] flex items-center justify-center rotate-6 hover:rotate-0 transition-all duration-700 group/img">
                      <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover/img:scale-110 transition-transform">
                        <Zap size={40} fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </SectionWrapper>
  );
};

export default UiUxTransformation;
