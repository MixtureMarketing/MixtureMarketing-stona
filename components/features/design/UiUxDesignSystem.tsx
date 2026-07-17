import React, { useState } from 'react';
import { Sliders, Zap } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../../data/content/services/design/ui-ux';

/**
 * Playground design tokens — jedyna sekcja, w której odwiedzający „projektuje"
 * razem z nami: zmiana tokenu przemalowuje cały podgląd obok. Podgląd pokazuje
 * UCZCIWE wzorniki komponentów (formularz, stany przycisku, karta) — atrapa
 * dashboardu z wymyślonymi metrykami usunięta 2026-07-16 (zakaz atrap).
 */

/** Token „on-color": tekst na kolorze marki wybierany z luminancji (WCAG),
 *  jak w prawdziwym design systemie — system sam pilnuje kontrastu. */
const onColor = (hex: string): string => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.35 ? '#0F172A' : '#FFFFFF';
};

const UiUxDesignSystem: React.FC = () => {
  const [sysColor, setSysColor] = useState('#61B6DE');
  const [sysRadius, setSysRadius] = useState(12);
  const [sysDark, setSysDark] = useState(false);
  const sysInk = onColor(sysColor);

  const inkMain = sysDark ? 'text-white' : 'text-dark';
  const inkMuted = sysDark ? 'text-gray-300' : 'text-gray-700';
  const specimenCard = sysDark
    ? 'bg-white/5 border-white/10'
    : 'bg-white border-gray-200 shadow-sm';

  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        {/* Left: Controls */}
        <div className="lg:w-[35%] w-full bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
              <Sliders size={24} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight text-white">
                {CONTENT.designTokens.title}
              </h3>
              <p className="text-xxs text-white/60 uppercase font-bold tracking-[0.2em]">
                {CONTENT.designTokens.subtitle}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed mb-10">
            {CONTENT.designTokens.description}
          </p>

          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xxs font-black text-white/70 uppercase tracking-widest">
                  {CONTENT.designTokens.labels.color}
                </label>
                <span className="text-xxs font-mono text-white/60">{sysColor}</span>
              </div>
              <div className="flex gap-4">
                {['#61B6DE', '#C2185B', '#00C853', '#F4B400'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSysColor(c)}
                    aria-label={`Zmień kolor systemu na ${c}`}
                    aria-pressed={sysColor === c}
                    className={`w-10 h-10 rounded-2xl border-4 transition-all hover:scale-110 ${sysColor === c ? 'border-white shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label
                  id="sys-radius-label"
                  className="text-xxs font-black text-white/70 uppercase tracking-widest"
                >
                  {CONTENT.designTokens.labels.radius}
                </label>
                <span className="text-xs font-bold text-primary">{sysRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={sysRadius}
                onChange={(e) => setSysRadius(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#61b6de]"
                aria-labelledby="sys-radius-label"
              />
            </div>

            <div>
              <label className="text-xxs font-black text-white/70 uppercase tracking-widest mb-4 block">
                {CONTENT.designTokens.labels.theme}
              </label>
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setSysDark(false)}
                  aria-pressed={!sysDark}
                  className={`py-3 rounded-xl text-xs font-black transition-all ${!sysDark ? 'bg-white text-deep-dark shadow-xl' : 'text-white/60 hover:text-white'}`}
                >
                  JASNY
                </button>
                <button
                  onClick={() => setSysDark(true)}
                  aria-pressed={sysDark}
                  className={`py-3 rounded-xl text-xs font-black transition-all ${sysDark ? 'bg-white text-deep-dark shadow-xl' : 'text-white/60 hover:text-white'}`}
                >
                  CIEMNY
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: żywy podgląd wzorników — same divy, żadnych martwych przycisków */}
        <div className="lg:w-[65%] w-full">
          <AnimateOnScroll delay={200}>
            <div
              className="w-full rounded-[3rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] p-8 md:p-14 transition-colors duration-700 overflow-hidden relative border border-white/5"
              style={{ backgroundColor: sysDark ? '#0F172A' : '#F9FAFB' }}
            >
              <div className="relative z-10 flex justify-between items-center mb-10">
                <div>
                  <h3 className={`text-3xl font-black mb-2 tracking-tight ${inkMain}`}>
                    {CONTENT.preview.title}
                  </h3>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${sysDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    {CONTENT.preview.subtitle}
                  </p>
                </div>
                <div
                  className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500"
                  style={{
                    backgroundColor: sysColor,
                    color: sysInk,
                    borderRadius: `${Math.max(sysRadius, 8)}px`,
                    boxShadow: `0 20px 40px -10px ${sysColor}60`,
                  }}
                >
                  <Zap size={28} fill="currentColor" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Wzornik: formularz */}
                <div
                  className={`p-8 border transition-all duration-500 ${specimenCard}`}
                  style={{ borderRadius: `${sysRadius}px` }}
                >
                  <div
                    className={`text-xxs uppercase font-black tracking-[0.2em] mb-5 ${inkMuted}`}
                  >
                    {CONTENT.preview.specimens.form}
                  </div>
                  <div className={`text-xs font-bold mb-2 ${inkMain}`}>
                    {CONTENT.preview.specimens.emailLabel}
                  </div>
                  <div
                    className={`px-4 py-3 text-sm border-2 mb-4 transition-all duration-500 ${sysDark ? 'bg-black/30 text-gray-300' : 'bg-white text-gray-600'}`}
                    style={{ borderRadius: `${sysRadius * 0.7}px`, borderColor: sysColor }}
                  >
                    {CONTENT.preview.specimens.emailPlaceholder}
                  </div>
                  <div
                    className="inline-block px-8 py-3 font-black text-xs uppercase tracking-widest transition-all duration-500"
                    style={{
                      backgroundColor: sysColor,
                      color: sysInk,
                      borderRadius: `${sysRadius}px`,
                      boxShadow: `0 15px 30px -5px ${sysColor}66`,
                    }}
                  >
                    {CONTENT.preview.specimens.submit}
                  </div>
                </div>

                {/* Wzornik: stany przycisku */}
                <div
                  className={`p-8 border transition-all duration-500 ${specimenCard}`}
                  style={{ borderRadius: `${sysRadius}px` }}
                >
                  <div
                    className={`text-xxs uppercase font-black tracking-[0.2em] mb-5 ${inkMuted}`}
                  >
                    {CONTENT.preview.specimens.buttons}
                  </div>
                  <div className="flex flex-col items-start gap-4">
                    <div
                      className="px-8 py-3 font-black text-xs uppercase tracking-widest transition-all duration-500"
                      style={{
                        backgroundColor: sysColor,
                        color: sysInk,
                        borderRadius: `${sysRadius}px`,
                      }}
                    >
                      {CONTENT.preview.specimens.primary}
                    </div>
                    <div
                      className="px-8 py-3 font-black text-xs uppercase tracking-widest border-2 transition-all duration-500"
                      style={{
                        color: sysDark ? '#fff' : '#111827',
                        borderColor: sysColor,
                        borderRadius: `${sysRadius}px`,
                      }}
                    >
                      {CONTENT.preview.specimens.secondary}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wzornik: karta z treścią (szkielet — celowo bez tekstu, to makieta układu) */}
              <div
                className={`p-8 border transition-all duration-500 ${specimenCard}`}
                style={{ borderRadius: `${sysRadius}px` }}
              >
                <div className={`text-xxs uppercase font-black tracking-[0.2em] mb-5 ${inkMuted}`}>
                  {CONTENT.preview.specimens.card}
                </div>
                <div className="flex items-center gap-6">
                  <div
                    className={`w-16 h-16 transition-all duration-500 ${sysDark ? 'bg-white/10' : 'bg-gray-200'}`}
                    style={{ borderRadius: `${sysRadius * 0.8}px` }}
                  ></div>
                  <div className="space-y-3 flex-1">
                    <div
                      className={`h-4 w-3/4 rounded-full ${sysDark ? 'bg-white/10' : 'bg-gray-200'}`}
                    ></div>
                    <div
                      className={`h-3 w-1/2 rounded-full ${sysDark ? 'bg-white/5' : 'bg-gray-100'}`}
                    ></div>
                  </div>
                  <div
                    className="hidden sm:block w-24 h-10 transition-all duration-500"
                    style={{ backgroundColor: sysColor, borderRadius: `${sysRadius}px` }}
                  ></div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default UiUxDesignSystem;
