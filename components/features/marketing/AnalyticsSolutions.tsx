import React from 'react';
import { BarChart3, Server, Eye, Target, ShieldCheck, Database } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { ANALYTICS_CONTENT as CONTENT } from '../../../data/content';

const AnalyticsSolutions: React.FC = () => {
  const solutions = CONTENT.solutions.items.map((item, i) => {
    const icons = [
      <BarChart3 key="chart" size={24} />,
      <Server key="server" size={24} />,
      <Eye key="eye" size={24} />,
      <Target key="target" size={24} />,
      <ShieldCheck key="shield" size={24} />,
      <Database key="db" size={24} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <SectionWrapper variant="light-gray">
      <SectionHeader
        title={CONTENT.solutions.title}
        description={CONTENT.solutions.description}
        className="mb-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {solutions.map((item, index) => (
          <AnimateOnScroll key={index} delay={index * 100} className="h-full">
            <GlassCard className="p-8 h-full flex flex-col items-start hover:border-primary hover:-translate-y-1 transition-all duration-300 group bg-white">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shadow-sm">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  {item.subtitle}
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm mt-auto">{item.desc}</p>
            </GlassCard>
          </AnimateOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default AnalyticsSolutions;
