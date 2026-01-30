import React, { useState, useRef } from 'react';

const ImageOptimizerComparison = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const rafRef = useRef<number | null>(null);
  const imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072';

  const handleMove = (clientX: number, rect: DOMRect) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const x = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(0, Math.min(100, x)));
      rafRef.current = null;
    });
  };

  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-4 gap-4">
        <div className="flex items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-xxs uppercase font-black text-gray-600 tracking-widest mb-1">
              Standard (JPG)
            </div>
            <div className="text-xl font-bold text-dark">4.8 MB</div>
          </div>
          <div className="h-8 w-px bg-gray-100 hidden md:block"></div>
          <div className="text-center md:text-left">
            <div className="text-xxs uppercase font-black text-[#10B981] tracking-widest mb-1">
              Optymalizacja CDN
            </div>
            <div className="text-xl font-bold text-emerald-500">180 KB</div>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100 uppercase tracking-tight">
          Ta sama jakość • 96% mniejszy transfer
        </div>
      </div>

      <div
        className="relative h-[400px] rounded-2xl overflow-hidden cursor-ew-resize group select-none shadow-inner"
        onMouseMove={(e) => {
          if (e.buttons === 1) handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onTouchMove={(e) => {
          handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        >
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xxs font-bold uppercase tracking-widest border border-white/10">
            Format JPG
          </div>
        </div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')`, clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <div className="absolute top-4 right-4 bg-[#10B981] text-white px-4 py-1.5 rounded-full text-xxs font-bold uppercase tracking-widest shadow-lg">
            Format WebP / AVIF
          </div>
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] z-30 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-[#10B981] text-dark">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 bg-gray-200 rounded-full"></div>
              <div className="w-1 h-4 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptimizerComparison;
