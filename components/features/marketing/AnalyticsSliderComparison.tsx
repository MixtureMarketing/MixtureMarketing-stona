import React, { useState, useRef } from 'react';
import { BarChart3, FileSpreadsheet, GripVertical } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { ANALYTICS_CONTENT as CONTENT } from '../../../data/content';

const AnalyticsSliderComparison: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [randomData] = useState<string[]>(() =>
    Array.from({ length: 120 }).map((_, i) =>
      i < 6
        ? ['Date', 'Source', 'Medium', 'Camp.', 'Click', 'Cost'][i]
        : Math.floor(Math.random() * 1000).toString(),
    ),
  );

  const handleSliderChange = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(pos, 0), 100));
  };

  return (
    <SectionWrapper variant="white" overflow={true} containerClassName="max-w-5xl">
      <SectionHeader
        title={CONTENT.slider.title}
        description={CONTENT.slider.description}
        className="mb-16"
      />

      <AnimateOnScroll>
        <div
          ref={sliderRef}
          className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#334155] cursor-col-resize select-none group"
          onMouseMove={handleSliderChange}
          onTouchMove={handleSliderChange}
        >
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(parseInt(e.target.value))}
            className="sr-only"
            aria-label="Przesuń suwak, aby porównać Excel z nowoczesnym dashboardem"
          />

          <div className="absolute inset-0 bg-deep-dark flex flex-col p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="text-white font-bold text-lg flex items-center gap-2">
                <BarChart3 className="text-primary" /> Executive Dashboard
              </div>
              <div className="px-3 py-1 bg-[#1E293B] rounded text-xs text-gray-600 border border-[#334155]">
                Last 30 Days
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#1E293B] p-4 rounded-xl border border-[#334155]">
                  <div className="text-xxs text-gray-600 mb-1 uppercase font-bold">Metric {i}</div>
                  <div className="text-lg font-bold text-white mb-2">$12,450</div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[70%]"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 bg-[#1E293B] rounded-xl p-4 flex items-end gap-2 relative border border-[#334155] overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
              {[40, 60, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t opacity-80"
                  style={{ height: `${h}%` }}
                ></div>
              ))}
              <div className="absolute top-4 right-4 text-primary font-bold text-sm bg-deep-dark/80 px-2 py-1 rounded backdrop-blur-sm">
                Conversion Rate: 3.8%
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-white border-r-4 border-secondary overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div
              className="w-full h-full bg-white text-black p-4 font-mono text-xs overflow-hidden"
              style={{ minWidth: '100vw' }}
            >
              <div className="flex items-center gap-2 mb-4 text-[#1d6f42] font-bold border-b pb-2">
                <FileSpreadsheet /> Raport_Lipiec_v2_FINAL.xlsx
              </div>
              <div className="grid grid-cols-6 gap-0 border-t border-l border-gray-300">
                {randomData.map((val, i) => (
                  <div
                    key={i}
                    className="border-b border-r border-gray-300 p-2 truncate bg-gray-50/50"
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gray-50/20 mix-blend-multiply"></div>
          </div>

          <div
            className="absolute top-0 bottom-0 w-1 bg-transparent cursor-col-resize z-20 flex items-center justify-center"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center -ml-1 text-secondary group-hover:scale-110 transition-transform border-4 border-secondary">
              <GripVertical size={20} />
            </div>
          </div>

          <div className="absolute top-4 left-4 bg-white/90 text-black px-3 py-1 rounded font-bold text-xs shadow-md pointer-events-none border border-gray-200">
            {CONTENT.slider.labels.before}
          </div>
          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded font-bold text-xs shadow-md pointer-events-none">
            {CONTENT.slider.labels.after}
          </div>
        </div>
      </AnimateOnScroll>
    </SectionWrapper>
  );
};

export default AnalyticsSliderComparison;
