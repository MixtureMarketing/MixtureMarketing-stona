import React from 'react';
import { Users, PenTool, MessageSquare, FileBox, Sparkles } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../../data/content';

const BrandProcess: React.FC = () => {
  const processSteps = CONTENT.process.steps.map((step, i) => {
    const icons = [
      <Users key="users" size={20} />,
      <PenTool key="pen" size={20} />,
      <MessageSquare key="msg" size={20} />,
      <FileBox key="file" size={20} />,
    ];
    return { ...step, icon: icons[i] };
  });

  return (
    <section className="py-24 bg-white relative z-10 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          title={CONTENT.process.title}
          description={CONTENT.process.description}
          className="mb-20"
        />

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {processSteps.map((step, i) => (
              <AnimateOnScroll key={i} delay={i * 150} className="h-full">
                <div className="relative group h-full">
                  <div className="absolute -top-10 -left-4 text-8xl font-black text-gray-50 group-hover:text-primary/10 transition-colors select-none pointer-events-none z-0">
                    0{i + 1}
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-secondary/30 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative z-10">
                    <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 -left-6 w-4 h-4 rounded-full bg-white border-4 border-gray-200 group-hover:border-primary group-hover:scale-125 transition-all duration-500 z-20"></div>

                    <div className="w-14 h-14 rounded-2xl bg-[#F5F9FF] flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-sm">
                      {step.icon}
                    </div>

                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xxs font-bold uppercase tracking-widest mb-3">
                        {step.time}
                      </span>
                      <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-secondary transition-colors">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{step.desc}</p>

                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-xxs font-black uppercase tracking-tighter text-gray-300">
                        Phase 0{i + 1}
                      </span>
                      <Sparkles size={14} className="text-primary" />
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandProcess;
