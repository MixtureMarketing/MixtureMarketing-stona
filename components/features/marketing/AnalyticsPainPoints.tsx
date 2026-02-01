import React from 'react';
import { FileWarning, Filter, GitMerge } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { ANALYTICS_CONTENT as CONTENT } from '../../../data/content';

const AnalyticsPainPoints: React.FC = () => {
  const commonErrors = CONTENT.painPoints.items.map((error, i) => ({
    ...error,
    icon:
      i === 0 ? (
        <FileWarning size={24} className="text-red-500" />
      ) : i === 1 ? (
        <Filter size={24} className="text-red-500" />
      ) : (
        <GitMerge size={24} className="text-red-500" />
      ),
  }));

  return (
    <SectionWrapper variant="white" containerClassName="max-w-screen-xl">
      <SectionHeader
        title={CONTENT.painPoints.title}
        description={CONTENT.painPoints.description}
        className="mb-12"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {commonErrors.map((error, i) => (
          <AnimateOnScroll key={i} delay={i * 100} className="h-full">
            <div className="h-full p-8 rounded-2xl bg-[#FFF5F5] border border-red-100 flex flex-col items-start hover:shadow-lg transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-white text-red-500 flex items-center justify-center mb-6 shadow-sm border border-red-50 group-hover:scale-110 transition-transform">
                {error.icon}
              </div>
              <h3 className="text-lg font-bold text-dark mb-3">{error.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{error.desc}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default AnalyticsPainPoints;
