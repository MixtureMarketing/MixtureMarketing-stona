import React from 'react';
import { Smartphone, Tablet, Laptop } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../../data/content';

const UiUxRwdShowcase: React.FC = () => {
  return (
    <SectionWrapper variant="white" overflow={true}>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

      <SectionHeader
        title={CONTENT.rwd.title}
        description={CONTENT.rwd.description}
        className="mb-20"
      />

      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end gap-16 lg:gap-20 relative">
        <div className="hidden lg:block absolute bottom-12 left-[20%] right-[20%] h-[2px] bg-gray-50 z-0"></div>

        <AnimateOnScroll delay={100} className="relative z-10">
          <div className="group flex flex-col items-center">
            <div className="w-[140px] h-[280px] bg-deep-dark rounded-[2.5rem] border-[6px] border-[#1E293B] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:-translate-y-6 hover:shadow-primary/30">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-[#1E293B] rounded-b-2xl z-20"></div>
              <div className="w-full h-full bg-white pt-8 px-2.5 pb-2.5 flex flex-col gap-2.5">
                <div className="w-full h-10 bg-dark rounded-xl mb-1 shrink-0 shadow-sm"></div>
                <div className="w-full h-28 bg-blue-50 rounded-2xl shrink-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/50 animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-2.5">
                  <div className="bg-gray-50 rounded-xl h-12 w-full border border-gray-100"></div>
                  <div className="bg-gray-50 rounded-xl h-12 w-full border border-gray-100"></div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none"></div>
            </div>
            <div className="mt-8 flex items-center gap-2 px-5 py-2 bg-light-gray rounded-2xl border border-gray-100 shadow-sm">
              <Smartphone size={14} className="text-primary" />
              <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
                {CONTENT.rwd.labels.compact}
              </span>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200} className="relative z-10">
          <div className="group flex flex-col items-center">
            <div className="w-[220px] h-[320px] bg-white rounded-[2rem] border-[6px] border-[#1E293B] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:-translate-y-6 hover:shadow-primary/30">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1E293B] rounded-full z-20"></div>
              <div className="w-full h-full bg-white pt-7 px-4 pb-4 flex flex-col gap-3">
                <div className="w-full h-10 bg-dark rounded-xl flex items-center px-3 gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/20"></div>
                  <div className="w-12 h-2 rounded-full bg-white/20"></div>
                </div>
                <div className="flex gap-3 h-full">
                  <div className="w-1/4 h-full bg-gray-50 rounded-xl border border-gray-100"></div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="w-full h-36 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/50 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-gray-50 rounded-xl h-16 w-full border border-gray-100"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 px-5 py-2 bg-light-gray rounded-2xl border border-gray-100 shadow-sm">
              <Tablet size={14} className="text-primary" />
              <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
                {CONTENT.rwd.labels.adaptive}
              </span>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={300} className="relative z-10">
          <div className="group flex flex-col items-center">
            <div className="w-[420px] h-[360px] bg-gray-800 rounded-t-[2.5rem] border-t-[6px] border-l-[6px] border-r-[6px] border-[#1E293B] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:-translate-y-6 hover:shadow-primary/30">
              <div className="w-full h-10 bg-[#1E293B] flex items-center px-5 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                </div>
                <div className="ml-6 flex-1 h-6 bg-deep-dark rounded-lg flex items-center px-3 text-xxs text-gray-700 font-mono tracking-tighter">
                  mixture-design-system.v3
                </div>
              </div>
              <div className="w-full h-full bg-white p-6 overflow-hidden">
                <div className="w-full h-12 bg-white border-b border-gray-100 mb-6 flex items-center justify-between px-2">
                  <div className="w-28 h-6 bg-dark rounded-lg"></div>
                  <div className="flex gap-4">
                    <div className="w-14 h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-14 h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-14 h-2 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full h-44 bg-blue-50 rounded-3xl mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="w-20 h-20 rounded-full bg-white/50 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-2xl h-36 w-full border border-gray-100"></div>
                  <div className="bg-gray-50 rounded-2xl h-36 w-full border border-gray-100"></div>
                  <div className="bg-gray-50 rounded-2xl h-36 w-full border border-gray-100"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 px-5 py-2 bg-light-gray rounded-2xl border border-gray-100 shadow-sm">
              <Laptop size={14} className="text-primary" />
              <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
                {CONTENT.rwd.labels.full}
              </span>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </SectionWrapper>
  );
};

export default UiUxRwdShowcase;
