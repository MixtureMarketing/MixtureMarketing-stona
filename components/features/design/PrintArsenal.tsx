import React from 'react';
import { Box, Sheet, Recycle, Package, Printer } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import GlassCard from '../../common/GlassCard';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../../data/content';

const PrintArsenal: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={CONTENT.arsenal.title} className="mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CONTENT.arsenal.items.map((item, i) => {
            const icons = [
              <Box key="box" />,
              <Sheet key="sheet" />,
              <Recycle key="recycle" />,
              <Package key="pkg" />,
            ];
            return (
              <GlassCard
                key={i}
                className="p-6 flex flex-col items-center justify-center text-center hover:border-[#F4B400] bg-light-gray group cursor-default h-48"
              >
                {i < 4 ? (
                  <div
                    className={`bg-white border border-gray-200 shadow-sm mb-4 ${item.shape} group-hover:shadow-md group-hover:scale-105 transition-all relative`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Printer size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 group-hover:text-[#F4B400] transition-colors shadow-sm">
                    {icons[i - 4]}
                  </div>
                )}
                <span className="font-bold text-dark text-lg group-hover:text-[#F4B400] transition-colors">
                  {item.label}
                </span>
                <span className="text-xs text-gray-600 mt-1 uppercase tracking-wide">
                  {item.sub}
                </span>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PrintArsenal;
