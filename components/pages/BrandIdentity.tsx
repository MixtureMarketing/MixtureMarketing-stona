import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  PenTool,
  BookOpen,
  Target,
  Fingerprint,
  Award,
  CheckCircle2,
  ArrowRight,
  Grid,
  Zap,
  Move,
  Monitor,
  Printer,
  Share2,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  FileBox,
  Users,
  MessageSquare,
  Sparkles,
  Clock,
  Box,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { BRAND_IDENTITY_CONTENT as CONTENT } from '../../data/content';

import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import { UiUxHeroVisual } from '../visuals/HeroVisuals';

const BrandIdentity: React.FC = () => {
  const [activeArchetype, setActiveArchetype] = useState<'sage' | 'rebel' | 'ruler'>('sage');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // SEO Schema
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Brand Identity Design',
    provider: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
    },
    description: CONTENT.seo.description,
    areaServed: 'Poland',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Pakiety Brandingowe',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Logo Design' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Brand Book' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rebranding' } },
      ],
    },
  };

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

  const deliverables = CONTENT.deliverables.items.map((item, i) => {
    const icons = [
      <PenTool key="pen" size={20} />,
      <BookOpen key="book" size={20} />,
      <Monitor key="monitor" size={20} />,
      <Printer key="printer" size={20} />,
    ];
    return { ...item, icon: icons[i] };
  });

  const touchpoints = CONTENT.touchpoints.items.map((item, i) => {
    const icons = [
      <Monitor key="monitor" size={24} />,
      <Share2 key="share" size={24} />,
      <Printer key="printer" size={24} />,
      <Briefcase key="brief" size={24} />,
    ];
    return { ...item, icon: icons[i] };
  });

  const processSteps = CONTENT.process.steps.map((step, i) => {
    const icons = [
      <Users key="users" size={20} />,
      <PenTool key="pen" size={20} />,
      <MessageSquare key="msg" size={20} />,
      <FileBox key="file" size={20} />,
    ];
    return { ...step, icon: icons[i] };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        jsonLd={structuredData}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Fingerprint}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('design', { specificType: 'branding' })}
        ctaSecondaryText={CONTENT.hero.microCopy}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={Grid}
        backLinkPath="/design"
        backLinkLabel="Wróć do Designu"
        visual={<UiUxHeroVisual />}
      />

      {/* --- PROCESS TIMELINE (REFINED) --- */}
      <section className="py-24 bg-white relative z-10 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            title={CONTENT.process.title}
            description={CONTENT.process.description}
            className="mb-20"
          />

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
              {processSteps.map((step, i) => (
                <AnimateOnScroll key={i} delay={i * 150} className="h-full">
                  <div className="relative group h-full">
                    {/* Giant Background Number */}
                    <div className="absolute -top-10 -left-4 text-8xl font-black text-gray-50 group-hover:text-primary/10 transition-colors select-none pointer-events-none z-0">
                      0{i + 1}
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-secondary/30 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative z-10">
                      {/* Node on the line (Desktop only) */}
                      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 -left-6 w-4 h-4 rounded-full bg-white border-4 border-gray-200 group-hover:border-primary group-hover:scale-125 transition-all duration-500 z-20"></div>

                      <div className="w-14 h-14 rounded-2xl bg-[#F5F9FF] flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-sm">
                        {step.icon}
                      </div>

                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xxs font-bold uppercase tracking-widest mb-3">
                          {step.time}
                        </span>
                        <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-secondary transition-colors">
                          {step.title}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {step.desc}
                      </p>

                      {/* Bottom Decorative Element */}
                      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-xxs font-black uppercase tracking-tighter text-gray-300">
                          Phase 0{i + 1}
                        </span>
                        <Sparkles size={14} className="text-primary" />
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- DNA MIXER (INTERACTIVE) --- */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

            {/* Dynamic Visual Result */}
            <div className="lg:w-1/2 w-full flex justify-center perspective-1000">
              <div className="relative w-full max-w-md aspect-square bg-white rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 border border-white/50">
                {/* Grid Background inside the preview */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(#213261 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                ></div>

                {/* Dynamic Shape (Blob) */}
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
                        ? `blob-pulse ${10 - dna.energy / 10}s infinite alternate`
                        : 'none',
                  }}
                ></div>

                {/* Secondary Blob for complexity */}
                <div
                  className="absolute transition-all duration-700 ease-in-out mix-blend-multiply opacity-60"
                  style={{
                    width: `${150 + dna.weight}px`,
                    height: `${150 + dna.weight}px`,
                    borderRadius: '50%',
                    background: `linear-gradient(${dna.style * 3.6}deg, #E1306C, #FFD700)`,
                    transform: `translate(${dna.energy / 2}px, -${dna.energy / 2}px)`,
                    filter: `blur(${30}px)`,
                  }}
                ></div>

                {/* Typography Preview */}
                <div className="relative z-10 text-center select-none">
                  <h3
                    className="text-5xl md:text-6xl transition-all duration-300 mb-2"
                    style={{
                      fontFamily:
                        dna.style < 40
                          ? '"Playfair Display", serif'
                          : dna.style > 60
                            ? '"Montserrat", sans-serif'
                            : '"Inter", sans-serif',
                      fontWeight: dna.weight > 60 ? '900' : dna.weight < 40 ? '200' : '500',
                      color: '#213261',
                      letterSpacing: dna.style > 80 ? '0.2em' : '-0.05em',
                      fontStyle: dna.energy > 80 ? 'italic' : 'normal',
                      textShadow: dna.weight > 80 ? '0 10px 30px rgba(33, 50, 97, 0.3)' : 'none',
                    }}
                  >
                    BRAND
                  </h3>
                  <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] bg-white/80 backdrop-blur-sm py-1 px-4 rounded-full inline-block shadow-sm">
                    {dna.style < 30 ? 'Heritage' : dna.style > 70 ? 'Future' : 'Modern'}
                    {' • '}
                    {dna.energy < 30 ? 'Calm' : dna.energy > 70 ? 'Dynamic' : 'Active'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
            @keyframes blob-pulse {
                0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            }
          `}</style>
      </section>

      {/* --- ARCHETYPE EXPLORER --- */}
      <section className="py-24 bg-[#0B1120] text-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                      <h3
                        className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}
                      >
                        {arch.label}
                      </h3>
                      {isActive && <CheckCircle2 className="text-primary" size={20} />}
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${isActive ? 'text-gray-300' : 'text-gray-700'}`}
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
                {/* Mock Brand Identity Card */}
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
                      EST. 2024
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
                      <div className="text-base text-gray-600">
                        {archetypes[activeArchetype].mood}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BRAND TOUCHPOINTS (OMNICHANNEL) --- */}
      <section className="py-24 bg-white relative z-10 overflow-hidden no-cursor-glow">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title={CONTENT.touchpoints.title}
            description={CONTENT.touchpoints.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[240px]">
            {/* DIGITAL - LARGE FEATURE CARD */}
            <AnimateOnScroll className="md:col-span-2 md:row-span-2">
              <div className="group relative h-full bg-[#0B1120] rounded-[2.5rem] p-10 overflow-hidden border border-white/10 transition-all duration-500 hover:shadow-2xl hover:border-primary/50">
                <div className="absolute inset-0 bg-tech-grid opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-primary mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                    {touchpoints[0].icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{touchpoints[0].title}</h3>
                  <p className="text-gray-300 mb-8 max-w-sm">{touchpoints[0].desc}</p>

                  <ul className="grid grid-cols-2 gap-4 mt-auto">
                    {touchpoints[0].list?.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>

            {/* SOCIAL - GRADIENT GLASS CARD */}
            <AnimateOnScroll delay={100} className="md:col-span-2">
              <div className="group relative h-full bg-gradient-to-br from-[#E1306C] to-secondary rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-50"></div>
                <div className="absolute -bottom-10 -right-10 text-white/10 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                  <Share2 size={240} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between h-full gap-8">
                  <div className="max-w-xs">
                    <h3 className="text-2xl font-bold text-white mb-2">{touchpoints[1].title}</h3>
                    <p className="text-white/80 text-sm">{touchpoints[1].desc}</p>
                  </div>
                  <ul className="flex flex-wrap md:flex-col gap-3">
                    {touchpoints[1].list?.map((item, i) => (
                      <li
                        key={i}
                        className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 whitespace-nowrap"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>

            {/* PRINT - CLEAN MINIMAL CARD */}
            <AnimateOnScroll delay={200}>
              <div className="group relative h-full bg-[#F9FAFB] rounded-[2.5rem] p-8 overflow-hidden border border-gray-100 transition-all duration-500 hover:bg-white hover:shadow-xl hover:border-dark/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-5"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-dark mb-6 group-hover:bg-dark group-hover:text-white transition-all">
                    {touchpoints[2].icon}
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-4">{touchpoints[2].title}</h3>
                  <ul className="space-y-2">
                    {touchpoints[2].list?.map((item, i) => (
                      <li
                        key={i}
                        className="text-xs font-medium text-gray-700 flex items-center gap-2"
                      >
                        <div className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-dark"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>

            {/* OFFICE - PROFESSIONAL CARD */}
            <AnimateOnScroll delay={300}>
              <div className="group relative h-full bg-white rounded-[2.5rem] p-8 overflow-hidden border-2 border-gray-50 transition-all duration-500 hover:shadow-xl hover:border-primary/30">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      {touchpoints[3].icon}
                    </div>
                    <span className="text-xxs font-bold text-gray-300 uppercase tracking-widest">
                      Premium
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-4">{touchpoints[3].title}</h3>
                  <ul className="space-y-2 mb-6">
                    {touchpoints[3].list?.map((item, i) => (
                      <li key={i} className="text-xs font-medium text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xxs font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Full Consistency</span>
                    <CheckCircle2 size={12} />
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* --- ASSET DELIVERY (TECH STACK) --- */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <SectionHeader
                align="left"
                title={CONTENT.deliverables.title}
                description={CONTENT.deliverables.description}
              />
              <div className="grid grid-cols-2 gap-4 mt-8">
                {deliverables.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-gray-100 bg-white hover:border-primary transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg shadow-sm text-secondary group-hover:text-primary">
                        {item.icon}
                      </div>
                      <span className="font-bold text-dark text-sm">{item.ext}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              {/* Visual: Folder Structure / Zip File */}
              <div className="bg-dark p-8 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20"></div>
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <FileBox size={24} className="text-primary" />
                  <span className="font-mono text-sm">brand_kit_v1.0.zip</span>
                </div>
                <div className="space-y-3 font-mono text-xs opacity-80">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-white/30 rounded"></div> /logo_vectors/
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-white/30 rounded"></div>{' '}
                    /social_media_templates/
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-white/30 rounded"></div>{' '}
                    /brand_book_guidelines.pdf
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-white/30 rounded"></div> /fonts_licenses/
                  </div>
                </div>
                <div className="mt-8 flex justify-between items-end">
                  <div>
                    <div className="text-xxs uppercase text-gray-600 mb-1">Prawa Autorskie</div>
                    <div className="font-bold flex items-center gap-2 text-success">
                      <ShieldCheck size={16} /> Pełne Przekazanie Praw (IP)
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
                    <Download size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title="Pytania o Branding" className="mb-12" />

          <div className="space-y-4">
            {CONTENT.faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl overflow-hidden bg-[#F9FAFB]"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-dark text-lg pr-4">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-primary transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100/50">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.description}
        buttonText={CONTENT.cta.button}
        icon={Briefcase}
        onClick={() => openModal('branding')}
        bgClassName="bg-[#F9FAFB] border-t border-gray-100"
      />
    </div>
  );
};

export default BrandIdentity;
