import React from 'react';
import { Layers, Clock, Database, Globe } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

const WebAppUseCases: React.FC = () => {
  const useCases = CONTENT.useCases.items.map((item, i) => {
    const icons = [
      <Layers key="layers" size={24} />,
      <Clock key="clock" size={24} />,
      <Database key="db" size={24} />,
      <Globe key="globe" size={24} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <section className="py-24 bg-white relative z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={CONTENT.useCases.title}
          description={CONTENT.useCases.description}
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <AnimateOnScroll key={index} delay={index * 100} className="h-full">
              <GlassCard className="p-8 h-full flex flex-col items-start hover:border-primary hover:shadow-xl transition-all group bg-light-gray hover:bg-white border-t-4 border-t-transparent hover:border-t-[#61B6DE]">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-dark mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-gray-100">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{useCase.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-6 flex-grow">
                  {useCase.desc}
                </p>
                <div className="flex flex-wrap gap-2 w-full pt-4 border-t border-gray-100">
                  {useCase.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xxs bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold uppercase tracking-wide group-hover:bg-blue-50 group-hover:text-secondary transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WebAppUseCases;
