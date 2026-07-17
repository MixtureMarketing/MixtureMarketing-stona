import React, { useState } from 'react';
import { BookOpen, Monitor, Clock, Zap, Move, Box } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../../data/content';
// Fonty pokazowe miksera DNA — tylko ten komponent ich używa, więc ładują się
// z tym lazy chunkiem (wcześniej globalnie w index.tsx = koszt na każdej stronie).
import '@fontsource/montserrat/latin-900.css';
import '@fontsource/montserrat/latin-ext-900.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-ext-400.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-ext-700.css';

const BrandDnaMixer: React.FC = () => {
  const [dna, setDna] = useState({ style: 50, energy: 50, weight: 50 });

  return (
    <SectionWrapper variant="light-gray" overflow={true}>
      <SectionHeader
        title={CONTENT.dna.title}
        description={CONTENT.dna.description}
        className="mb-16"
      />

      <div className="flex flex-col lg:flex-row gap-16 items-center">
        {/* Sliders */}
        <div className="lg:w-1/2 w-full space-y-10 bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-white/50 backdrop-blur-sm">
          {/* Slider 1: Style */}
          <div className="group">
            <div className="flex justify-between text-sm font-bold text-dark mb-4 uppercase tracking-wider">
              <span className="flex items-center gap-2 text-gray-600 group-hover:text-dark transition-colors">
                <BookOpen size={16} aria-hidden="true" /> {CONTENT.dna.labels.classic}
              </span>
              <span className="flex items-center gap-2 text-gray-600 group-hover:text-dark transition-colors">
                {CONTENT.dna.labels.modern} <Monitor size={16} aria-hidden="true" />
              </span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full shadow-inner">
              <input
                type="range"
                min="0"
                max="100"
                value={dna.style}
                onChange={(e) => setDna({ ...dna, style: parseInt(e.target.value) })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                aria-label="Dostosuj styl marki: od klasycznego do nowoczesnego"
              />
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                  className="absolute top-0 left-0 h-full bg-secondary rounded-full"
                  style={{ width: `${dna.style}%` }}
                ></div>
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-secondary rounded-full shadow-lg z-10"
                  style={{ left: `${dna.style}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center font-medium">
              {dna.style < 30
                ? CONTENT.dna.status.style[0]
                : dna.style > 70
                  ? CONTENT.dna.status.style[2]
                  : CONTENT.dna.status.style[1]}
            </p>
          </div>

          {/* Slider 2: Energy */}
          <div className="group">
            <div className="flex justify-between text-sm font-bold text-dark mb-4 uppercase tracking-wider">
              <span className="flex items-center gap-2 text-gray-600 group-hover:text-instagram transition-colors">
                <Clock size={16} aria-hidden="true" /> {CONTENT.dna.labels.calm}
              </span>
              <span className="flex items-center gap-2 text-gray-600 group-hover:text-instagram transition-colors">
                {CONTENT.dna.labels.energetic} <Zap size={16} aria-hidden="true" />
              </span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full shadow-inner">
              <input
                type="range"
                min="0"
                max="100"
                value={dna.energy}
                onChange={(e) => setDna({ ...dna, energy: parseInt(e.target.value) })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                aria-label="Dostosuj energię marki: od spokojnej do energicznej"
              />
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                  className="absolute top-0 left-0 h-full bg-instagram rounded-full"
                  style={{ width: `${dna.energy}%` }}
                ></div>
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-instagram rounded-full shadow-lg z-10"
                  style={{ left: `${dna.energy}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center font-medium">
              {dna.energy < 30
                ? CONTENT.dna.status.energy[0]
                : dna.energy > 70
                  ? CONTENT.dna.status.energy[2]
                  : CONTENT.dna.status.energy[1]}
            </p>
          </div>

          {/* Slider 3: Weight */}
          <div className="group">
            <div className="flex justify-between text-sm font-bold text-dark mb-4 uppercase tracking-wider">
              <span className="flex items-center gap-2 text-gray-600 group-hover:text-primary transition-colors">
                <Move size={16} aria-hidden="true" /> {CONTENT.dna.labels.subtle}
              </span>
              <span className="flex items-center gap-2 text-gray-600 group-hover:text-primary transition-colors">
                {CONTENT.dna.labels.expressive} <Box size={16} aria-hidden="true" />
              </span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full shadow-inner">
              <input
                type="range"
                min="0"
                max="100"
                value={dna.weight}
                onChange={(e) => setDna({ ...dna, weight: parseInt(e.target.value) })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                aria-label="Dostosuj ciężar marki: od subtelnego do wyrazistego"
              />
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full"
                  style={{ width: `${dna.weight}%` }}
                ></div>
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-primary rounded-full shadow-lg z-10"
                  style={{ left: `${dna.weight}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center font-medium">
              {dna.weight < 30
                ? CONTENT.dna.status.weight[0]
                : dna.weight > 70
                  ? CONTENT.dna.status.weight[2]
                  : CONTENT.dna.status.weight[1]}
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 w-full flex justify-center perspective-1000">
          <div className="relative w-full max-w-md aspect-square bg-white rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 border border-white/50">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(#213261 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            ></div>

            <div
              className="absolute transition-all duration-500 ease-in-out mix-blend-multiply opacity-80"
              style={{
                width: `${200 + dna.weight * 1.5}px`,
                height: `${200 + dna.weight * 1.5}px`,
                borderRadius:
                  dna.energy > 30
                    ? `${50 + dna.energy / 4}% ${50 - dna.energy / 4}% ${50 + dna.energy / 3}% ${50 - dna.energy / 3}% / ${50 - dna.energy / 5}% ${50 + dna.energy / 5}% ${50 - dna.energy / 4}% ${50 + dna.energy / 4}%`
                    : dna.style > 50
                      ? '50%'
                      : '10%',
                background: `linear-gradient(${dna.energy * 3.6}deg, #3F3D91, #61B6DE)`,
                filter: `blur(${Math.max(0, 40 - dna.weight / 2)}px)`,
                transform: `rotate(${dna.energy * 2}deg) scale(${0.8 + dna.weight / 300})`,
                animation:
                  dna.energy > 50
                    ? `brand-blob-pulse ${10 - dna.energy / 10}s infinite alternate`
                    : 'none',
              }}
            ></div>

            <div
              className="absolute transition-all duration-700 ease-in-out mix-blend-multiply opacity-60"
              style={{
                width: `${150 + dna.weight}px`,
                height: `${150 + dna.weight}px`,
                borderRadius: '50%',
                background: `linear-gradient(${dna.style * 3.6}deg, #E1306C, #61b6de)`,
                transform: `translate(${dna.energy / 2}px, -${dna.energy / 2}px)`,
                filter: `blur(${30}px)`,
              }}
            ></div>

            <div className="relative z-10 text-center select-none">
              <h3
                className="text-5xl md:text-6xl transition-all duration-300 mb-2"
                style={{
                  fontFamily:
                    dna.style < 40
                      ? '"Playfair Display", serif'
                      : dna.style > 60
                        ? '"Montserrat", sans-serif'
                        : '"Manrope", sans-serif',
                  fontWeight: dna.weight > 60 ? '900' : dna.weight < 40 ? '200' : '500',
                  color: '#213261',
                  letterSpacing: dna.style > 80 ? '0.2em' : '-0.05em',
                  fontStyle: dna.energy > 80 ? 'italic' : 'normal',
                  textShadow: dna.weight > 80 ? '0 10px 30px rgba(33, 50, 97, 0.3)' : 'none',
                }}
              >
                BRAND
              </h3>
              <p className="text-xs font-bold text-accent-dark uppercase tracking-[0.3em] bg-white/80 backdrop-blur-sm py-1 px-4 rounded-full inline-block shadow-sm">
                {dna.style < 30 ? 'Heritage' : dna.style > 70 ? 'Future' : 'Modern'}
                {' • '}
                {dna.energy < 30 ? 'Calm' : dna.energy > 70 ? 'Dynamic' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
          @keyframes brand-blob-pulse {
              0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
              50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
              100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          }
        `}</style>
    </SectionWrapper>
  );
};

export default BrandDnaMixer;
