import React from 'react';
import { MousePointer2, Zap, Layout, Terminal } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../../data/content';

const HeuristicsGrid: React.FC = () => {
  return (
    <SectionWrapper variant="white" containerClassName="max-w-screen-xl">
      <SectionHeader
        title={CONTENT.heuristics.title}
        description={CONTENT.heuristics.description}
        className="mb-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CONTENT.heuristics.items.map((item, i) => {
          const icons = [
            <MousePointer2 key="mouse" size={24} />,
            <Zap key="zap" size={24} />,
            <Layout key="layout" size={24} />,
            <Terminal key="term" size={24} />,
          ];
          return (
            <AnimateOnScroll key={i} delay={i * 100}>
              <div className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:border-primary/30 transition-all duration-500">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    {icons[i]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{item.title}</h3>
                    <div className="text-xxs font-black text-primary uppercase tracking-widest">
                      Heuristic 0{i + 1}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </AnimateOnScroll>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

export default HeuristicsGrid;
