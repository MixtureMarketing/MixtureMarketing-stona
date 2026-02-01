import React from 'react';
import BaseCard from '../../common/BaseCard';

export const VisualAuditHeroVisual: React.FC = () => {
  return (
    <div className="w-full relative h-[500px] flex justify-center items-center overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <BaseCard
        variant="solid"
        padding="none"
        rounded="3xl"
        className="relative z-10 w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700"
      >
        <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="ml-4 bg-gray-900/50 h-6 flex-1 rounded-lg"></div>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="w-32 h-8 bg-gray-100 rounded"></div>
            <div className="flex gap-4">
              <div className="w-12 h-4 bg-gray-50 rounded"></div>
              <div className="w-12 h-4 bg-gray-50 rounded"></div>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div className="w-full h-12 bg-gray-800 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
              </div>
              <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
              <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
            </div>
            <div className="w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"></div>
          </div>
          <div className="pt-6 border-t border-gray-100 flex justify-between">
            <div className="w-20 h-4 bg-emerald-50 rounded text-emerald-600 text-[10px] font-bold text-center leading-4">
              PASSED
            </div>
            <div className="w-20 h-4 bg-rose-50 rounded text-rose-600 text-[10px] font-bold text-center leading-4">
              FAILED
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  );
};
