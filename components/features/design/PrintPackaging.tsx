import React from 'react';
import { Ruler, Scissors, Box } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../../data/content';

const PrintPackaging: React.FC = () => {
  return (
    <section className="py-24 bg-deep-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F4B400] text-xs font-bold uppercase tracking-wider mb-6">
                <Ruler size={14} /> {CONTENT.packaging.badge}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {CONTENT.packaging.title.line1}
                <br />
                <span className="text-[#F4B400]">{CONTENT.packaging.title.line2}</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {CONTENT.packaging.description}
              </p>

              <ul className="space-y-4">
                {CONTENT.packaging.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 p-1 rounded bg-[#F4B400]/20 text-[#F4B400]">
                      {i === 0 ? <Scissors size={16} /> : <Box size={16} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{feat.title}</h3>
                      <p className="text-gray-300 text-xs">{feat.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>

          <div className="lg:w-1/2 w-full flex justify-center">
            <AnimateOnScroll delay={200}>
              <div className="relative w-full max-w-md aspect-square bg-[#0F172A] border border-[#1E293B] rounded-xl p-8 shadow-2xl">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <path
                    d="M 50 50 L 150 50 L 150 150 L 50 150 Z"
                    fill="none"
                    stroke="#E1306C"
                    strokeWidth="1"
                    className="animate-draw"
                  />
                  <path
                    d="M 50 50 L 20 20 M 150 50 L 180 20 M 150 150 L 180 180 M 50 150 L 20 180"
                    fill="none"
                    stroke="#E1306C"
                    strokeWidth="1"
                    className="animate-draw"
                    style={{ animationDelay: '1s' }}
                  />

                  <path
                    d="M 50 50 L 150 150 M 150 50 L 50 150"
                    fill="none"
                    stroke="#00C853"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="opacity-50"
                  />

                  <g className="text-[6px] fill-[#F4B400] font-mono">
                    <text x="90" y="45">
                      100mm
                    </text>
                    <text x="155" y="100">
                      100mm
                    </text>
                  </g>
                </svg>

                <div className="absolute bottom-4 left-4 bg-white/10 px-2 py-1 rounded text-xxs text-[#F4B400] font-mono">
                  Die_Cut_v3.ai
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
      <style>{`
            @keyframes draw {
                from { stroke-dasharray: 0, 1000; }
                to { stroke-dasharray: 1000, 0; }
            }
            .animate-draw {
                animation: draw 3s ease-out forwards;
            }
          `}</style>
    </section>
  );
};

export default PrintPackaging;
