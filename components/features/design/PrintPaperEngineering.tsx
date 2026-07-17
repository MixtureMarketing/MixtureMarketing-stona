import React, { useState } from 'react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../../data/content';

const PrintPaperEngineering: React.FC = () => {
  const [paperWeight, setPaperWeight] = useState(2);

  return (
    <SectionWrapper variant="light-gray" overflow={true} containerClassName="max-w-screen-xl">
      <SectionHeader
        title={CONTENT.paper.title}
        description={CONTENT.paper.description}
        className="mb-16"
      />

      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2 w-full grid grid-cols-1 gap-4">
          {CONTENT.paper.items.map((type, index) => (
            <button
              key={index}
              onClick={() => setPaperWeight(index)}
              className={`group relative flex items-center justify-between p-6 rounded-2xl transition-all duration-300 border-2 text-left
                                ${
                                  paperWeight === index
                                    ? 'bg-white border-dark shadow-xl scale-[1.02]'
                                    : 'bg-white/50 border-transparent hover:bg-white hover:border-gray-200'
                                }
                            `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors
                                    ${paperWeight === index ? 'bg-dark text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white'}
                                `}
                >
                  {index + 1}
                </div>
                <div>
                  <h3
                    className={`text-xl font-black ${paperWeight === index ? 'text-dark' : 'text-gray-700'}`}
                  >
                    {type.weight}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    {type.name}
                  </p>
                </div>
              </div>
              <div
                className={`text-sm font-medium ${paperWeight === index ? 'text-secondary' : 'text-gray-600'}`}
              >
                {type.use.split(',')[0]}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:w-1/2 w-full flex justify-center perspective-[1200px]">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <div
              className="relative w-64 h-48 bg-white transition-all duration-700 ease-out [transform-style:preserve-3d]"
              style={{
                transform: `rotateX(55deg) rotateZ(-30deg) translateZ(${paperWeight * 10}px)`,
                boxShadow: `-20px 20px 50px rgba(0,0,0,0.15)`,
              }}
            >
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center border border-gray-100">
                <div className="text-center opacity-30 transform rotate-180">
                  <div className="text-4xl font-black text-dark">
                    {CONTENT.paper.items[paperWeight].weight}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.3em]">
                    {CONTENT.paper.items[paperWeight].name.split('/')[0]}
                  </div>
                </div>
              </div>

              {/* Krawędź arkusza: „rotateY(90deg)" jako klasa było martwym zapisem
                  (to nie jest klasa Tailwinda) — transform musi żyć w style. */}
              <div
                className="absolute top-0 right-0 h-full origin-right flex flex-col"
                style={{
                  width: `${Math.max(2, CONTENT.paper.items[paperWeight].thickness * 3)}px`,
                  transform: 'rotateY(-90deg)',
                }}
              >
                {CONTENT.paper.items[paperWeight].weight.includes('600g') ? (
                  <>
                    <div className="flex-1 bg-gray-100 border-r border-gray-200"></div>
                    <div className="h-[40%] bg-[#E1306C] border-r border-red-700"></div>
                    <div className="flex-1 bg-gray-100 border-r border-gray-200"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 border-r border-gray-300"></div>
                )}
              </div>

              <div
                className="absolute bottom-0 left-0 w-full origin-bottom flex flex-col"
                style={{
                  height: `${Math.max(2, CONTENT.paper.items[paperWeight].thickness * 3)}px`,
                  transform: 'rotateX(90deg)',
                }}
              >
                {CONTENT.paper.items[paperWeight].weight.includes('600g') ? (
                  <>
                    <div className="flex-1 bg-gray-200 border-b border-gray-300"></div>
                    <div className="h-[40%] bg-[#C1205C] border-b border-red-800"></div>
                    <div className="flex-1 bg-gray-200 border-b border-gray-300"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-300 border-b border-gray-400"></div>
                )}
              </div>
            </div>

            <div
              className="absolute top-1/2 left-1/2 w-64 h-48 bg-dark/20 blur-2xl transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
              style={{
                opacity: 0.5 - paperWeight * 0.1,
                transform: `translate(-50%, -50%) rotateX(55deg) rotateZ(-30deg) translateZ(-${50 + paperWeight * 10}px) scale(${1 - paperWeight * 0.05})`,
              }}
            ></div>
          </div>

          <div className="absolute bottom-0 right-0 p-8 text-right pointer-events-none">
            <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">
              Grubość (ok.)
            </div>
            <div className="text-3xl font-bold text-dark">
              {(CONTENT.paper.items[paperWeight].thickness * 0.1).toFixed(1)} mm
            </div>
            {CONTENT.paper.items[paperWeight].weight.includes('600g') && (
              <div className="text-xs font-bold text-pink-800 mt-2 bg-pink-50 inline-block px-2 py-1 rounded">
                + barwiony rdzeń
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PrintPaperEngineering;
