import React from 'react';
import { MousePointerClick } from 'lucide-react';
import { useTypewriter } from '../../../hooks/useTypewriter';
import { GOOGLE_ADS_CONTENT } from '../../../data/content';

export const GoogleAdsHeroVisual: React.FC = () => {
  const CONTENT = GOOGLE_ADS_CONTENT;
  const { displayText: typedText, isComplete: showResults } = useTypewriter(
    CONTENT.hero.simulator.placeholder,
    {
      speed: 60,
      delay: 600,
    },
  );

  return (
    <div className="relative z-10 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(66,133,244,0.2)] border border-gray-200 p-2 max-w-lg mx-auto transform rotate-1 hover:rotate-0 transition-all duration-500">
      <div className="bg-[#F1F3F4] rounded-t-xl px-4 py-3 flex items-center gap-4 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
        </div>
        <div className="flex-1 bg-white rounded-full h-8 px-4 flex items-center text-sm text-gray-600 shadow-sm relative overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
            alt="G"
            className="h-3 mr-3"
          />
          <span className="truncate">{typedText}</span>
          <span className="w-0.5 h-4 bg-[#4285F4] ml-0.5 animate-pulse"></span>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white rounded-b-xl min-h-[320px]">
        {showResults ? (
          <div className="animate-fade-in-up space-y-6">
            <div className="p-4 rounded-xl bg-white border border-[#4285F4] shadow-[0_4px_20px_-5px_rgba(66,133,244,0.15)] relative overflow-hidden group cursor-pointer transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#4285F4]"></div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-dark text-[11px]">
                  {CONTENT.hero.simulator.ad.label}
                </span>
                <span className="text-gray-600 text-xxs">•</span>
                <div className="flex items-center gap-1 text-gray-700 text-[11px]">
                  <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                  <span>twoja-firma.pl</span>
                </div>
              </div>
              <div className="text-[#1a0dab] text-lg font-medium group-hover:underline leading-snug mb-2">
                {CONTENT.hero.simulator.ad.title}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {CONTENT.hero.simulator.ad.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {CONTENT.hero.simulator.ad.links.map((link: string, i: number) => (
                  <span
                    key={i}
                    className="text-[#1a0dab] text-xs hover:underline cursor-pointer bg-[#F1F3F4] px-3 py-1.5 rounded-full font-medium hover:bg-[#E8F0FE]"
                  >
                    {link}
                  </span>
                ))}
              </div>

              <div className="absolute bottom-4 right-8 pointer-events-none animate-bounce hidden sm:block drop-shadow-xl">
                <MousePointerClick size={28} className="text-dark fill-white" />
              </div>
            </div>

            <div className="px-2 opacity-30 blur-[2px] grayscale select-none pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <div className="w-32 h-3 bg-gray-300 rounded"></div>
              </div>
              <div className="w-64 h-4 bg-gray-400 rounded mb-2"></div>
              <div className="w-full h-12 bg-gray-100 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 opacity-20">
            <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-[#4285F4] animate-spin mb-4"></div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              Wyszukiwanie...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
