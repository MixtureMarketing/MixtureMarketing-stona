import React from 'react';
import { Layout, PenTool, Box, Repeat, Wand2 } from 'lucide-react';
import LazyHydrate from '../../common/LazyHydrate';
import SectionWrapper from '../../common/SectionWrapper';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../../data/content';

const DesignToolkit: React.FC = () => {
  return (
    <SectionWrapper
      variant="white"
      containerClassName="max-w-screen-xl"
      className="border-b border-gray-100"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="text-left">
          <h3 className="text-lg font-bold text-dark">{CONTENT.toolkit.title}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            {CONTENT.toolkit.subtitle}
          </p>
        </div>
        <div className="h-px bg-gray-100 flex-1 mx-8 hidden md:block"></div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-[#F4B400]"></div>
        </div>
      </div>

      <LazyHydrate whenVisible>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {CONTENT.toolkit.tools.map((tool, i) => {
            const icons = [
              <Layout size={20} key="layout" />,
              <PenTool size={20} key="pentool" />,
              <Box size={20} key="box" />,
              <Repeat size={20} key="repeat" />,
              <Wand2 size={20} key="wand2" />,
            ];
            const hoverColors = [
              'hover:border-[#0ACF83] hover:text-[#0ACF83]',
              'hover:border-[#FF0000] hover:text-[#FF0000]',
              'hover:border-[#E87D0D] hover:text-[#E87D0D]',
              'hover:border-[#475569] hover:text-[#475569]',
              'hover:border-dark hover:text-dark',
            ];
            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 transition-all duration-300 group cursor-default hover:bg-white hover:shadow-md ${hoverColors[i]}`}
              >
                <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-current transition-colors">
                  {icons[i]}
                </div>
                <div>
                  <div className="font-bold text-dark text-sm leading-tight">{tool.name}</div>
                  <div className="text-xxs text-gray-500 uppercase tracking-tight">{tool.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </LazyHydrate>
    </SectionWrapper>
  );
};

export default DesignToolkit;
