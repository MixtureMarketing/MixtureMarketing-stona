/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FileText, Flag, Search, TrendingUp } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionHeader from '../../common/SectionHeader';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

const SeoRoadmap: React.FC = () => {
  const roadmapSteps = CONTENT.roadmap.steps.map((step, i) => {
    const icons = [
      <Search key="search" size={20} />,
      <FileText key="file" size={20} />,
      <TrendingUp key="trend" size={20} />,
      <Flag key="flag" size={20} />,
    ];
    return { ...step, icon: icons[i] };
  });

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={CONTENT.roadmap.title}
          description={CONTENT.roadmap.description}
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roadmapSteps.map((step, i) => (
            <AnimateOnScroll key={i} delay={i * 150} className="h-full">
              <div className="relative h-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                {i < roadmapSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-200 -ml-4 z-0"></div>
                )}

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-success mb-6 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-success uppercase tracking-wider mb-2">
                    {step.month}
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>

                {i === 0 && (
                  <div className="absolute top-4 right-4 bg-[#F4B400] text-white text-xxs font-bold px-2 py-1 rounded-full animate-pulse">
                    Quick Wins
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeoRoadmap;
