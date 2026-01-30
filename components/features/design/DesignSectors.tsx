import React from 'react';
import { Cpu, ShoppingBag, Scale, Sparkles, ArrowRight } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import LazyHydrate from '../../common/LazyHydrate';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../../data/content';

const DesignSectors: React.FC = () => {
  return (
    <section className="py-24 bg-white relative z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={CONTENT.sectors.title}
          description={CONTENT.sectors.description}
          className="mb-16 pb-4"
        />

        <LazyHydrate whenVisible>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTENT.sectors.items.map((sector, i) => {
              const icons = [
                <Cpu size={24} key="cpu" />,
                <ShoppingBag size={24} key="shoppingbag" />,
                <Scale size={24} key="scale" />,
                <Sparkles size={24} key="sparkles" />,
              ];
              const colors = [
                'from-blue-500 to-indigo-600',
                'from-emerald-400 to-teal-600',
                'from-slate-700 to-slate-900',
                'from-rose-400 to-pink-600',
              ];
              const bgs = ['bg-blue-50', 'bg-emerald-50', 'bg-slate-50', 'bg-rose-50'];
              return (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 p-6 h-full hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors[i]} opacity-0 group-hover:opacity-5 transition-opacity`}
                    ></div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div
                        className={`w-12 h-12 rounded-xl ${bgs[i]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div className="text-gray-700 group-hover:text-black transition-colors">
                          {icons[i]}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-dark mb-2 group-hover:translate-x-1 transition-transform">
                        {sector.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
                        {sector.desc}
                      </p>

                      <div className="flex justify-end mt-auto">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-dark group-hover:bg-white group-hover:shadow-md transition-all">
                          <ArrowRight
                            size={14}
                            className="group-hover:-rotate-45 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </LazyHydrate>
      </div>
    </section>
  );
};

export default DesignSectors;
