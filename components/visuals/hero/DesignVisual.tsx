import React from 'react';

export const DesignHeroVisual: React.FC = () => {
  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-secondary to-primary rounded-2xl shadow-2xl transform rotate-6 z-10 opacity-90 animate-float"></div>
      <div className="absolute bottom-0 left-10 w-40 h-40 bg-white border border-gray-200 rounded-2xl shadow-xl transform -rotate-3 z-20 flex items-center justify-center animate-float-delayed">
        <div className="text-dark font-black text-4xl tracking-tighter">Aa</div>
      </div>
      <div className="absolute top-20 left-0 w-32 h-32 bg-dark rounded-full z-0 opacity-10"></div>
      <div className="absolute inset-0 border-2 border-primary/20 rounded-full border-dashed animate-spin-slow"></div>
    </div>
  );
};
