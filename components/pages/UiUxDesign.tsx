/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Zap,
  Grid,
  ArrowRight,
  Layers,
  Monitor,
  Figma,
  Component,
  Palette,
  Code2,
  Move,
  Tablet,
  Laptop,
  Fingerprint,
  Sparkles,
  ChevronDown,
  Sliders,
  Box,
  Layout,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import { useParallax } from '../../hooks/useParallax';
import Seo from '../common/Seo';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../data/content';

import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import { UiUxHeroVisual } from '../visuals/HeroVisuals';

const UiUxDesign: React.FC = () => {
  const [viewMode, setViewMode] = useState<'lofi' | 'hifi'>('hifi');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Design System Configurator State
  const [sysColor, setSysColor] = useState('#61B6DE');
  const [sysRadius, setSysRadius] = useState(12);
  const [sysDark, setSysDark] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- HERO SECTION WITH PARALLAX --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Fingerprint}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('design', { specificType: 'uiux' })}
        ctaSecondaryText={`${CONTENT.hero.microCopy.label}: ${CONTENT.hero.microCopy.value}`}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={Figma}
        backLinkPath="/"
        backLinkLabel="Back to Mixtured"
        visual={<UiUxHeroVisual />}
      />

      {/* --- DESIGN SYSTEM PLAYGROUND (REFINED) --- */}
      <section className="py-24 bg-[#0B1120] text-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            {/* Left: Controls */}
            <div className="lg:w-[35%] w-full bg-white/[0.03] backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                  <Sliders size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight">
                    {CONTENT.designTokens.title}
                  </h3>
                  <p className="text-xxs text-gray-700 uppercase font-bold tracking-[0.2em]">
                    {CONTENT.designTokens.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xxs font-black text-gray-600 uppercase tracking-widest">
                      {CONTENT.designTokens.labels.color}
                    </label>
                    <span className="text-xxs font-mono text-gray-700">{sysColor}</span>
                  </div>
                  <div className="flex gap-4">
                    {['#61B6DE', '#E1306C', '#00C853', '#F4B400'].map((c) => (
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
                      className="text-xxs font-black text-gray-600 uppercase tracking-widest"
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
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#61B6DE]"
                    aria-labelledby="sys-radius-label"
                  />
                </div>

                <div>
                  <label className="text-xxs font-black text-gray-600 uppercase tracking-widest mb-4 block">
                    {CONTENT.designTokens.labels.theme}
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setSysDark(false)}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${!sysDark ? 'bg-white text-[#0B1120] shadow-xl' : 'text-gray-700 hover:text-gray-300'}`}
                    >
                      LIGHT
                    </button>
                    <button
                      onClick={() => setSysDark(true)}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${sysDark ? 'bg-white text-[#0B1120] shadow-xl' : 'text-gray-700 hover:text-gray-300'}`}
                    >
                      DARK
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview Area */}
            <div className="lg:w-[65%] w-full relative">
              {/* Technical Annotations */}
              <div className="absolute -top-10 left-0 flex gap-4 pointer-events-none opacity-40">
                <div className="w-px h-20 bg-white/20"></div>
                <span className="text-xxxs font-mono text-gray-700 transform rotate-90">
                  VIEWPORT_VAR
                </span>
              </div>

              <AnimateOnScroll delay={200}>
                <div
                  className="w-full aspect-auto min-h-[600px] lg:aspect-[16/10] rounded-[3rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] p-10 md:p-16 transition-all duration-700 overflow-hidden relative border border-white/5"
                  style={{ backgroundColor: sysDark ? '#0F172A' : '#F9FAFB' }}
                >
                  {/* Grid inside preview */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>

                  <div className="relative z-10 flex justify-between items-center mb-12">
                    <div>
                      <h3
                        className={`text-3xl font-black mb-2 tracking-tight ${sysDark ? 'text-white' : 'text-dark'}`}
                      >
                        {CONTENT.preview.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                        {CONTENT.preview.subtitle}
                      </p>
                    </div>
                    <div
                      className="w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500"
                      style={{
                        backgroundColor: sysColor,
                        boxShadow: `0 20px 40px -10px ${sysColor}60`,
                      }}
                    >
                      <Zap size={28} fill="currentColor" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div
                      className={`p-8 border-2 transition-all duration-500 ${sysDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}
                      style={{ borderRadius: `${sysRadius}px` }}
                    >
                      <div className="text-gray-600 text-xxs uppercase font-black tracking-[0.2em] mb-4 text-center">
                        {CONTENT.preview.stats.conversion}
                      </div>
                      <div
                        className={`text-5xl font-black text-center ${sysDark ? 'text-white' : 'text-dark'}`}
                      >
                        24.8%
                      </div>
                    </div>
                    <div
                      className={`p-8 border-2 transition-all duration-500 ${sysDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}
                      style={{ borderRadius: `${sysRadius}px` }}
                    >
                      <div className="text-gray-600 text-xxs uppercase font-black tracking-[0.2em] mb-4 text-center">
                        {CONTENT.preview.stats.bounce}
                      </div>
                      <div
                        className={`text-5xl font-black text-center ${sysDark ? 'text-white' : 'text-dark'}`}
                      >
                        12.4%
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-8 border-2 transition-all duration-500 ${sysDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}
                    style={{ borderRadius: `${sysRadius}px` }}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className="w-16 h-16 bg-gray-200/20 animate-pulse transition-all duration-500"
                        style={{ borderRadius: `${sysRadius * 0.8}px` }}
                      ></div>
                      <div className="space-y-3 flex-1">
                        <div className="h-4 w-3/4 bg-gray-200/20 rounded-full animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-gray-200/10 rounded-full animate-pulse"></div>
                      </div>
                      <button
                        className="px-10 py-4 text-white font-black text-xs uppercase tracking-widest transition-all duration-500 hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: sysColor,
                          borderRadius: `${sysRadius}px`,
                          boxShadow: `0 15px 30px -5px ${sysColor}66`,
                        }}
                      >
                        {CONTENT.preview.button}
                      </button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* --- RWD SHOWCASE (MOBILE FIRST) --- */}
      <section className="py-24 bg-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title={CONTENT.rwd.title}
            description={CONTENT.rwd.description}
            className="mb-20"
          />

          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end gap-16 lg:gap-20 relative">
            {/* Connecting Line - Only on desktop */}
            <div className="hidden lg:block absolute bottom-12 left-[20%] right-[20%] h-[2px] bg-gray-50 z-0"></div>

            {/* Phone */}
            <AnimateOnScroll delay={100} className="relative z-10">
              <div className="group flex flex-col items-center">
                <div className="w-[140px] h-[280px] bg-[#0B1120] rounded-[2.5rem] border-[6px] border-[#1E293B] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:-translate-y-6 hover:shadow-primary/30">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-[#1E293B] rounded-b-2xl z-20"></div>
                  <div className="w-full h-full bg-white pt-8 px-2.5 pb-2.5 flex flex-col gap-2.5">
                    <div className="w-full h-10 bg-dark rounded-xl mb-1 shrink-0 shadow-sm"></div>
                    <div className="w-full h-28 bg-blue-50 rounded-2xl shrink-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/50 animate-pulse"></div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      <div className="bg-gray-50 rounded-xl h-12 w-full border border-gray-100"></div>
                      <div className="bg-gray-50 rounded-xl h-12 w-full border border-gray-100"></div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none"></div>
                </div>
                <div className="mt-8 flex items-center gap-2 px-5 py-2 bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-sm">
                  <Smartphone size={14} className="text-primary" />
                  <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
                    {CONTENT.rwd.labels.compact}
                  </span>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Tablet */}
            <AnimateOnScroll delay={200} className="relative z-10">
              <div className="group flex flex-col items-center">
                <div className="w-[220px] h-[320px] bg-white rounded-[2rem] border-[6px] border-[#1E293B] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:-translate-y-6 hover:shadow-primary/30">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1E293B] rounded-full z-20"></div>
                  <div className="w-full h-full bg-white pt-7 px-4 pb-4 flex flex-col gap-3">
                    <div className="w-full h-10 bg-dark rounded-xl flex items-center px-3 gap-3">
                      <div className="w-3 h-3 rounded-full bg-white/20"></div>
                      <div className="w-12 h-2 rounded-full bg-white/20"></div>
                    </div>
                    <div className="flex gap-3 h-full">
                      <div className="w-1/4 h-full bg-gray-50 rounded-xl border border-gray-100"></div>
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="w-full h-36 bg-blue-50 rounded-2xl flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/50 animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="bg-gray-50 rounded-xl h-16 w-full border border-gray-100"
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2 px-5 py-2 bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-sm">
                  <Tablet size={14} className="text-primary" />
                  <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
                    {CONTENT.rwd.labels.adaptive}
                  </span>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Desktop */}
            <AnimateOnScroll delay={300} className="relative z-10">
              <div className="group flex flex-col items-center">
                <div className="w-[420px] h-[360px] bg-gray-800 rounded-t-[2.5rem] border-t-[6px] border-l-[6px] border-r-[6px] border-[#1E293B] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:-translate-y-6 hover:shadow-primary/30">
                  <div className="w-full h-10 bg-[#1E293B] flex items-center px-5 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                    </div>
                    <div className="ml-6 flex-1 h-6 bg-[#0B1120] rounded-lg flex items-center px-3 text-xxs text-gray-700 font-mono tracking-tighter">
                      mixture-design-system.v3
                    </div>
                  </div>
                  <div className="w-full h-full bg-white p-6 overflow-hidden">
                    <div className="w-full h-12 bg-white border-b border-gray-100 mb-6 flex items-center justify-between px-2">
                      <div className="w-28 h-6 bg-dark rounded-lg"></div>
                      <div className="flex gap-4">
                        <div className="w-14 h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-14 h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-14 h-2 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                    <div className="w-full h-44 bg-blue-50 rounded-3xl mb-6 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="w-20 h-20 rounded-full bg-white/50 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-2xl h-36 w-full border border-gray-100"></div>
                      <div className="bg-gray-50 rounded-2xl h-36 w-full border border-gray-100"></div>
                      <div className="bg-gray-50 rounded-2xl h-36 w-full border border-gray-100"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2 px-5 py-2 bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-sm">
                  <Laptop size={14} className="text-primary" />
                  <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
                    {CONTENT.rwd.labels.full}
                  </span>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* --- THE TRANSFORMATION (Interactive Toggle) --- */}
      <section className="py-24 bg-gray-50 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.transformation.title}
            description={CONTENT.transformation.description}
            className="mb-16"
          />

          <div className="flex justify-center mb-16">
            <div className="bg-white p-2 rounded-3xl border border-gray-200 inline-flex shadow-xl">
              <button
                onClick={() => setViewMode('lofi')}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${viewMode === 'lofi' ? 'bg-dark text-white shadow-xl scale-105' : 'text-gray-600 hover:text-dark'}`}
              >
                <Grid size={18} /> {CONTENT.transformation.labels.lofi}
              </button>
              <button
                onClick={() => setViewMode('hifi')}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${viewMode === 'hifi' ? 'bg-dark text-white shadow-xl scale-105' : 'text-gray-600 hover:text-dark'}`}
              >
                <Palette size={18} /> {CONTENT.transformation.labels.hifi}
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto perspective-[2000px]">
            <div
              className={`relative bg-white rounded-[3rem] overflow-hidden shadow-[0_80px_150px_-30px_rgba(0,0,0,0.3)] border transition-all duration-1000 ${viewMode === 'lofi' ? 'border-gray-200 grayscale' : 'border-primary/30 ring-[12px] ring-[#E0EFFF]/50'}`}
            >
              {/* Browser Bar */}
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
                </div>
                <div className="flex-1 bg-white h-8 rounded-xl border border-gray-200 flex items-center px-4 text-xxs font-mono text-gray-300">
                  https://interface-audit.mixturemarketing.pl
                </div>
              </div>

              {/* Content Container */}
              <div className="p-12 md:p-20 transition-all duration-1000">
                {/* Navigation */}
                <div className="flex justify-between items-center mb-16">
                  <div
                    className={`w-40 h-10 rounded-xl ${viewMode === 'lofi' ? 'bg-gray-100 border-2 border-dashed border-gray-200' : 'bg-dark'}`}
                  ></div>
                  <div className="flex gap-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-20 h-2 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-200'}`}
                      ></div>
                    ))}
                    <div
                      className={`w-32 h-10 rounded-xl ${viewMode === 'lofi' ? 'border-2 border-dashed border-gray-300' : 'bg-primary shadow-xl shadow-primary/30'}`}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-20 items-center">
                  <div className="w-full md:w-1/2 space-y-8">
                    <div
                      className={`w-full h-16 rounded-2xl ${viewMode === 'lofi' ? 'bg-gray-100 border-2 border-dashed border-gray-200' : 'bg-gradient-to-r from-dark to-secondary'}`}
                    ></div>
                    <div className="space-y-4">
                      <div
                        className={`w-full h-3 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-100'}`}
                      ></div>
                      <div
                        className={`w-full h-3 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-100'}`}
                      ></div>
                      <div
                        className={`w-2/3 h-3 rounded-full ${viewMode === 'lofi' ? 'bg-gray-100' : 'bg-gray-100'}`}
                      ></div>
                    </div>
                    <div className="pt-6 flex gap-6">
                      <div
                        className={`w-48 h-14 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'lofi' ? 'bg-gray-50 border-2 border-dashed border-gray-300 text-gray-300' : 'bg-dark text-white shadow-2xl hover:scale-105 cursor-pointer'}`}
                      >
                        {viewMode === 'hifi'
                          ? CONTENT.transformation.hifi.cta
                          : CONTENT.transformation.lofi.cta}
                      </div>
                      <div
                        className={`w-48 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'lofi' ? 'border-dashed border-gray-200 text-gray-200' : 'border-dark text-dark hover:bg-gray-50 cursor-pointer'}`}
                      >
                        {viewMode === 'hifi'
                          ? CONTENT.transformation.hifi.secondary
                          : CONTENT.transformation.lofi.secondary}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div
                      className={`w-full aspect-square rounded-[3rem] transition-all duration-1000 ${viewMode === 'lofi' ? 'bg-gray-50 border-4 border-dashed border-gray-200 flex items-center justify-center' : 'bg-gradient-to-br from-[#E0EFFF] to-white shadow-inner flex items-center justify-center relative overflow-hidden'}`}
                    >
                      {viewMode === 'lofi' ? (
                        <div className="text-gray-200 font-black text-4xl tracking-tighter transform -rotate-12">
                          IMAGE_SLOT
                        </div>
                      ) : (
                        <div className="relative z-10 w-64 h-64 bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] flex items-center justify-center rotate-6 hover:rotate-0 transition-all duration-700 group/img">
                          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover/img:scale-110 transition-transform">
                            <Zap size={40} fill="currentColor" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ATOMIC DESIGN (ENGINEERING APPROACH) --- */}
      <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Explanation */}
            <div className="lg:w-1/2">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                  <Component size={14} /> {CONTENT.atomic.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {CONTENT.atomic.title.line1} <br />
                  <span className="text-primary">{CONTENT.atomic.title.line2}</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {CONTENT.atomic.description}
                </p>

                <div className="space-y-4">
                  {CONTENT.atomic.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                    >
                      <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        {i === 0 ? (
                          <Layers size={20} aria-hidden="true" />
                        ) : (
                          <Box size={20} aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                        <p className="text-xs text-gray-300">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: Visual (System Architecture) */}
            <div className="lg:w-1/2 w-full">
              <AnimateOnScroll delay={200}>
                <div className="relative rounded-3xl bg-[#0F172A] border border-[#1E293B] shadow-2xl overflow-hidden group">
                  {/* Background Tech Mesh */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>

                  {/* Header of the System Panel */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-md relative z-10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#334155]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#334155]"></div>
                    </div>
                    <div className="text-xxs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Code2 size={12} /> mixture_system.config.js
                    </div>
                  </div>

                  {/* Main Blueprint Content */}
                  <div className="p-8 relative z-10">
                    <div className="flex flex-col gap-8 relative">
                      {/* Vertical connecting line (Circuit) */}
                      <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary to-secondary opacity-30"></div>

                      {/* Row 1: ATOMS (Variables) */}
                      <div className="flex items-center gap-6 group/item">
                        <div className="w-16 h-16 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-primary shadow-lg relative z-10 group-hover/item:border-primary group-hover/item:scale-105 transition-all duration-300">
                          <Palette size={24} />
                          <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155] backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-white">Atoms</span>
                            <span className="text-xxs font-mono text-gray-500">
                              const primary = '#61B6DE'
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded bg-primary shadow-sm"></div>
                            <div className="w-6 h-6 rounded bg-secondary shadow-sm"></div>
                            <div className="px-2 py-1 bg-black rounded text-xxs text-white font-serif flex items-center">
                              Aa
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: MOLECULES (Components) */}
                      <div className="flex items-center gap-6 group/item">
                        <div className="w-16 h-16 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-white shadow-lg relative z-10 group-hover/item:border-primary group-hover/item:scale-105 transition-all duration-300">
                          <Component size={24} />
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155] backdrop-blur-sm relative overflow-hidden">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-white">Molecules</span>
                            <span className="text-xxs font-mono text-gray-500">
                              {'<Button icon={Zap} />'}
                            </span>
                          </div>
                          {/* Visualizing the "Build" */}
                          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-[#0B1120] rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 transform group-hover/item:translate-x-2 transition-transform">
                            <Zap size={14} fill="currentColor" /> Action
                          </button>
                        </div>
                      </div>

                      {/* Row 3: ORGANISMS (Layouts) */}
                      <div className="flex items-center gap-6 group/item">
                        <div className="w-16 h-16 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-white shadow-lg relative z-10 group-hover/item:border-primary group-hover/item:scale-105 transition-all duration-300">
                          <Layout size={24} />
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155] backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-white">Organisms</span>
                            <span className="text-xxs font-mono text-gray-500">
                              {'<ProductCard />'}
                            </span>
                          </div>
                          {/* Mini UI Card */}
                          <div className="bg-white p-3 rounded-lg w-full flex gap-3 items-center shadow-sm opacity-90 group-hover/item:opacity-100 transition-opacity">
                            <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-2 w-2/3 bg-gray-200 rounded-full"></div>
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-primary text-[#0B1120] text-xxxs font-black rounded uppercase">
                                  Action
                                </div>
                                <div className="h-1.5 w-1/3 bg-gray-100 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Status Bar */}
                  <div className="px-6 py-3 bg-[#0F172A]/80 border-t border-[#1E293B] flex justify-between items-center text-xxs text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                      System Status: Stable
                    </div>
                    <div>v2.4.0</div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* --- MICRO-INTERACTIONS PLAYGROUND --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <SectionHeader
                align="left"
                title={CONTENT.interactions.title}
                description={CONTENT.interactions.description}
              />
              <ul className="space-y-6 mt-10">
                {CONTENT.interactions.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-secondary flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <span className="text-dark font-black text-sm uppercase tracking-wide block mb-1">
                        {item.title}
                      </span>
                      <span className="text-gray-700 text-sm">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-6">
              <GlassCard className="p-10 flex flex-col items-center justify-center h-56 hover:shadow-2xl transition-all cursor-pointer group bg-white border-gray-100">
                <button className="relative overflow-hidden px-8 py-4 bg-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all w-full group-hover:bg-secondary">
                  Press Me
                  <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-[2.5] transition-transform duration-500 rounded-full"></div>
                </button>
                <span className="text-xxs text-gray-600 mt-6 font-black uppercase tracking-widest">
                  {CONTENT.interactions.labels.ripple}
                </span>
              </GlassCard>

              <GlassCard className="p-10 flex flex-col items-center justify-center h-56 hover:shadow-2xl transition-all bg-white border-gray-100">
                <label className="relative inline-flex items-center cursor-pointer transform scale-125">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    aria-label="Przełącz logikę interakcji"
                  />
                  <div className="w-16 h-9 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-success shadow-inner"></div>
                </label>
                <span className="text-xxs text-gray-600 mt-6 font-black uppercase tracking-widest">
                  {CONTENT.interactions.labels.logic}
                </span>
              </GlassCard>

              <div className="col-span-2 h-36 perspective-[1000px] group">
                <div className="w-full h-full bg-gradient-to-r from-primary to-secondary rounded-3xl flex items-center justify-center text-white font-black text-sm uppercase tracking-[0.3em] shadow-2xl transform transition-all duration-500 group-hover:rotate-x-12 group-hover:-translate-y-3 cursor-pointer overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="flex items-center gap-4 relative z-10">
                    <Move size={24} /> {CONTENT.interactions.labels.perspective}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-[#F9FAFB] relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title="Pytania o UI/UX" className="mb-12" />

          <div className="space-y-4">
            {CONTENT.faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-primary/50 transition-colors shadow-sm sm:shadow-none"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-5 md:p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-dark text-base md:text-lg pr-4">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-primary transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-5 md:p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100/50 text-sm md:text-base">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <StandardCta
        title={`${CONTENT.cta.title.line1} ${CONTENT.cta.title.line2}`}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Smartphone}
        onClick={() => openModal('design')}
        bgClassName="bg-[#F9FAFB] border-t border-gray-100"
      />
    </div>
  );
};

export default UiUxDesign;
