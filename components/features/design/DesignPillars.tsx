import React from 'react';
import { Fingerprint, Layout, Package, ScanEye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import LazyHydrate from '../../common/LazyHydrate';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../../data/content';

const DesignPillars: React.FC = () => {
  const navigate = useNavigate();

  const serviceBlocks = CONTENT.pillars.items.map((block, index) => {
    const icons = [
      <Fingerprint size={32} key="fingerprint" />,
      <Layout size={32} key="layout" />,
      <Package size={32} key="package" />,
      <ScanEye size={32} key="scaneye" />,
    ];
    const colors = ['#3F3D91', '#61B6DE', '#F4B400', '#E1306C'];
    return {
      ...block,
      icon: icons[index],
      color: colors[index],
      action: () => navigate(block.path),
    };
  });

  return (
    <section className="py-24 bg-white relative z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={CONTENT.pillars.title}
          description={CONTENT.pillars.description}
          className="mb-16"
        />

        <LazyHydrate whenVisible>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceBlocks.map((block, index) => (
              <AnimateOnScroll key={index} delay={index * 100} className="h-full">
                <div
                  onClick={block.action}
                  className="group relative h-full bg-white rounded-2xl border border-gray-200 hover:border-transparent transition-all duration-300 cursor-pointer flex flex-col overflow-hidden hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-current opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                    style={{ color: block.color }}
                  ></div>

                  <div className="p-8 flex-grow relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: block.color }}
                      >
                        {block.icon}
                      </div>
                      <span className="text-4xl font-black text-gray-100 group-hover:text-gray-100 transition-colors select-none">
                        {block.id}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-600 block mb-1">
                        {block.role}
                      </span>
                      <h3 className="text-2xl font-bold text-dark group-hover:text-primary transition-colors">
                        {block.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8 text-sm">{block.desc}</p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {block.features.map((feat, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 group-hover:bg-white group-hover:border-gray-200 transition-colors"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center group-hover:bg-white transition-colors relative z-10">
                    <span
                      className="text-sm font-bold flex items-center gap-2"
                      style={{ color: block.color }}
                    >
                      Zobacz proces{' '}
                      <ArrowRight
                        size={16}
                        className="transform group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </LazyHydrate>
      </div>
    </section>
  );
};

export default DesignPillars;
