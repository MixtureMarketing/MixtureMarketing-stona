import React from 'react';
import { Fingerprint, Monitor, Package } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import LazyHydrate from '../../common/LazyHydrate';
import SectionWrapper from '../../common/SectionWrapper';
import BaseCard from '../../common/BaseCard';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../../data/content';

const DesignEcosystem: React.FC = () => {
  return (
    <SectionWrapper variant="light-gray" overflow={true} containerClassName="max-w-screen-xl">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

      <SectionHeader
        title={CONTENT.ecosystem.title}
        description={CONTENT.ecosystem.description}
        className="mb-20 pb-4"
      />

      <LazyHydrate whenVisible>
        <div className="relative">
          <div className="hidden md:block absolute top-[80px] left-0 w-full h-[2px] bg-gradient-to-r from-secondary/20 via-primary/40 to-[#F4B400]/20 -z-10 rounded-full"></div>
          <div className="md:hidden absolute top-0 bottom-0 left-[2.25rem] w-[2px] bg-gradient-to-b from-secondary/20 via-primary/40 to-[#F4B400]/20 -z-10 rounded-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {CONTENT.ecosystem.items.map((item, i) => {
              const icons = [
                <Fingerprint size={28} key="fingerprint" />,
                <Monitor size={28} key="monitor" />,
                <Package size={28} key="package" />,
              ];
              const colors = ['#3F3D91', '#61B6DE', '#F4B400'];
              const gradients = [
                'from-secondary/10 to-transparent',
                'from-primary/10 to-transparent',
                'from-[#F4B400]/10 to-transparent',
              ];
              return (
                <AnimateOnScroll key={i} delay={i * 200}>
                  <div className="group relative flex flex-col h-full pl-20 md:pl-0 md:pt-20">
                    <div
                      className="absolute left-6 md:left-1/2 top-8 md:top-0 w-6 h-6 md:w-8 md:h-8 -ml-3 md:-ml-4 rounded-full bg-white border-4 shadow-lg z-20 transition-transform duration-500 group-hover:scale-125"
                      style={{ borderColor: colors[i] }}
                    >
                      <div
                        className="absolute inset-0 m-auto w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                        style={{ backgroundColor: colors[i] }}
                      ></div>
                    </div>

                    <BaseCard
                      variant="solid"
                      hover="lift"
                      padding="lg"
                      className="flex-grow group-hover:-translate-y-1 overflow-hidden"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[i].replace('/10', '')}`}
                      ></div>
                      <div
                        className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradients[i]} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                      ></div>

                      <div className="mb-6 flex justify-between items-start">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                          style={{ backgroundColor: colors[i] }}
                        >
                          {icons[i]}
                        </div>
                        <span className="text-4xl font-black text-gray-100 select-none absolute top-6 right-8 pointer-events-none group-hover:text-gray-50 transition-colors">
                          {item.step}
                        </span>
                      </div>

                      <h3 className="font-bold text-xl text-dark mb-3 group-hover:text-secondary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
                        {item.desc}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-gray-50">
                        {item.tags.map((tag, t) => (
                          <span
                            key={t}
                            className="text-xxs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-1 rounded group-hover:bg-blue-50 group-hover:text-secondary transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </BaseCard>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </LazyHydrate>
    </SectionWrapper>
  );
};

export default DesignEcosystem;
