import React from 'react';
import { Monitor, Share2, Printer, Briefcase, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import BaseCard from '../../common/BaseCard';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../../data/content';

const BrandTouchpoints: React.FC = () => {
  const touchpoints = CONTENT.touchpoints.items.map((item, i) => {
    const icons = [
      <Monitor key="monitor" size={24} />,
      <Share2 key="share" size={24} />,
      <Printer key="printer" size={24} />,
      <Briefcase key="brief" size={24} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <SectionWrapper variant="white" className="no-cursor-glow">
      <SectionHeader
        title={CONTENT.touchpoints.title}
        description={CONTENT.touchpoints.description}
        className="mb-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[240px]">
        <AnimateOnScroll className="md:col-span-2 md:row-span-2">
          <BaseCard
            variant="dark"
            hover="glow"
            rounded="3xl"
            padding="lg"
            className="h-full border-white/10 group"
          >
            <div className="absolute inset-0 bg-tech-grid opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-primary mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                {touchpoints[0].icon}
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">{touchpoints[0].title}</h3>
              <p className="text-gray-300 mb-8 max-w-sm">{touchpoints[0].desc}</p>

              <ul className="grid grid-cols-2 gap-4 mt-auto">
                {touchpoints[0].list?.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </BaseCard>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100} className="md:col-span-2">
          {/* variant="dark", nie solid+bg-dark: dwie klasy tła (bg-white z wariantu
              i doklejone bg-dark) walczą w CSS i wygrywała biała — biały tekst
              na białym tle (zgłoszone przez właściciela 2026-07-16). */}
          <BaseCard
            variant="dark"
            hover="zoom"
            rounded="3xl"
            padding="lg"
            className="h-full border-white/10 group"
          >
            <div className="absolute -bottom-10 -right-10 text-white/10 rotate-12 transition-transform group-hover:rotate-0 duration-700">
              <Share2 size={240} strokeWidth={1} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between h-full gap-8">
              <div className="max-w-xs">
                <h3 className="text-2xl font-bold text-white mb-2">{touchpoints[1].title}</h3>
                <p className="text-white/80 text-sm">{touchpoints[1].desc}</p>
              </div>
              <ul className="flex flex-wrap md:flex-col gap-3">
                {touchpoints[1].list?.map((item, i) => (
                  <li
                    key={i}
                    className="px-4 py-2 rounded-full bg-white/20 text-white text-xs font-bold border border-white/20 whitespace-nowrap"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </BaseCard>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <BaseCard
            variant="muted"
            hover="lift"
            rounded="3xl"
            padding="lg"
            className="h-full border-gray-100 group hover:bg-white"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-dark mb-6 group-hover:bg-dark group-hover:text-white transition-all">
                {touchpoints[2].icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-4">{touchpoints[2].title}</h3>
              <ul className="space-y-2">
                {touchpoints[2].list?.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs font-semibold text-gray-800 flex items-center gap-2"
                  >
                    <div className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-dark"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </BaseCard>
        </AnimateOnScroll>

        <AnimateOnScroll delay={300}>
          <BaseCard
            variant="solid"
            hover="glow"
            rounded="3xl"
            padding="lg"
            className="h-full border-2 border-gray-50 group"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {touchpoints[3].icon}
                </div>
                <span className="text-xxs font-bold text-gray-600 uppercase tracking-widest">
                  Premium
                </span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-4">{touchpoints[3].title}</h3>
              <ul className="space-y-2 mb-6">
                {touchpoints[3].list?.map((item, i) => (
                  <li key={i} className="text-xs font-semibold text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xxs font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Full Consistency</span>
                <CheckCircle2 size={12} />
              </div>
            </div>
          </BaseCard>
        </AnimateOnScroll>
      </div>
    </SectionWrapper>
  );
};

export default BrandTouchpoints;
