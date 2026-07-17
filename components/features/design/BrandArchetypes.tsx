import React, { useState } from 'react';
import { BookOpen, Zap, Award, CheckCircle2 } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../../data/content';

const BrandArchetypes: React.FC = () => {
  const [activeArchetype, setActiveArchetype] = useState<'sage' | 'rebel' | 'ruler'>('sage');

  const archetypes = {
    sage: {
      ...CONTENT.archetypes.items.sage,
      colors: ['#213261', '#61B6DE', '#FFFFFF'],
    },
    rebel: {
      ...CONTENT.archetypes.items.rebel,
      colors: ['#000000', '#FF3B30', '#F2F2F7'],
    },
    ruler: {
      ...CONTENT.archetypes.items.ruler,
      colors: ['#1A1A1A', '#D4AF37', '#111111'],
    },
  };

  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <SectionHeader
        title={CONTENT.archetypes.title}
        description={CONTENT.archetypes.description}
        lightMode
        className="mb-16"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-4">
          {(Object.keys(archetypes) as Array<keyof typeof archetypes>).map((key) => {
            const arch = archetypes[key];
            const isActive = activeArchetype === key;
            return (
              <button
                key={key}
                onClick={() => setActiveArchetype(key)}
                aria-label={`Wybierz archetyp: ${arch.label}`}
                aria-pressed={isActive}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group
                                ${isActive ? 'border-transparent bg-white/10 shadow-xl scale-105 z-10' : 'border-white/10 hover:bg-white/5'}
                            `}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {arch.label}
                  </h3>
                  {isActive && <CheckCircle2 className="text-primary" size={20} />}
                </div>
                <p
                  className={`text-sm leading-relaxed ${isActive ? 'text-white/80' : 'text-white/55'}`}
                >
                  {arch.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-8 flex justify-center items-center bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-md">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500"
            style={{
              boxShadow: `0 0 100px -20px ${archetypes[activeArchetype].colors[0]}`,
            }}
          >
            <div
              className="h-40 flex items-center justify-center transition-colors duration-500"
              style={{ backgroundColor: archetypes[activeArchetype].colors[0] }}
            >
              <div className="text-white text-center">
                <div className="text-5xl mb-2 transition-all duration-500 drop-shadow-lg">
                  {activeArchetype === 'sage' && <BookOpen size={64} />}
                  {activeArchetype === 'rebel' && <Zap size={64} />}
                  {activeArchetype === 'ruler' && <Award size={64} />}
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">
                  EST. 2020
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex gap-4 mb-6">
                {archetypes[activeArchetype].colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1 h-12 rounded-lg shadow-inner border border-black/5"
                    style={{ backgroundColor: c }}
                  ></div>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
                    Typografia
                  </div>
                  <div
                    className="text-xl text-dark"
                    style={{
                      fontFamily: activeArchetype === 'ruler' ? 'serif' : 'sans-serif',
                      fontWeight: activeArchetype === 'rebel' ? '900' : 'normal',
                    }}
                  >
                    {archetypes[activeArchetype].font}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
                    Mood & Vibe
                  </div>
                  <div className="text-base text-gray-600">{archetypes[activeArchetype].mood}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default BrandArchetypes;
