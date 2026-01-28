import React from 'react';
import { Cpu, ShieldCheck, RefreshCw, Zap, Target, BarChart3 } from 'lucide-react';
import { COLORS } from '../../types';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import GlassCard from '../common/GlassCard';

import { WHY_US_CONTENT as CONTENT } from '../../data/content';

const WhyUs: React.FC = () => {
  const icons = [
    <Zap key="zap" size={32} />,
    <Target key="target" size={32} />,
    <BarChart3 key="chart" size={32} />,
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03] pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-20 text-center">
          <SectionHeader
            subtitle={CONTENT.subtitle}
            title={CONTENT.title}
            description={CONTENT.description}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {CONTENT.items.map((item, index) => (
            <AnimateOnScroll
              key={index}
              delay={index * 150}
              className={index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <div className="h-full group relative">
                {/* Subtle Glow Effect on Hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>

                <GlassCard className="p-8 md:p-10 flex flex-col items-center text-center h-full relative z-10 bg-white/80 border-gray-100 hover:border-primary/30 transition-all duration-500 rounded-[2rem] shadow-sm hover:shadow-xl">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-6 md:mb-8 relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br from-[#F9FAFB] to-white shadow-inner border border-gray-100">
                    <div className="text-secondary group-hover:text-primary transition-colors duration-300 transform group-hover:scale-110">
                      {React.cloneElement(icons[index] as React.ReactElement<any>, { size: 28 })}
                    </div>

                    {/* Decorative Dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white scale-0 group-hover:scale-100 transition-transform duration-500 delay-100"></div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-dark tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                </GlassCard>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
