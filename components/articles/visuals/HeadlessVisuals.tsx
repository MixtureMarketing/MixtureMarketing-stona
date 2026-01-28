/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Database,
  Smartphone,
  Monitor,
  Watch,
  Layout,
  Cpu,
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Split,
  Layers,
  Infinity as InfinityIcon,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO: BRAIN IN A JAR (WordPress as Headless Brain) ---
export const HeadlessHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full bg-[#0B1120] rounded-[3rem] p-12 overflow-hidden border border-white/5 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      {/* Central Brain (WordPress) */}
      <div className="relative z-20">
        <div className="w-48 h-64 bg-white/5 backdrop-blur-xl rounded-t-[4rem] rounded-b-2xl border-4 border-white/10 relative flex flex-col items-center justify-center shadow-[0_0_50px_rgba(97,182,222,0.2)]">
          {/* The Jar "Liquid" */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-t-[3.5rem] mt-2 mx-2"></div>

          {/* The Brain SVG */}
          <div className="relative animate-float">
            <Cpu size={80} className="text-primary drop-shadow-[0_0_15px_#61B6DE]" />
            <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse"></div>
          </div>

          {/* Label */}
          <div className="absolute -bottom-4 bg-white text-dark px-4 py-1 rounded-full text-xxs font-black uppercase tracking-widest shadow-xl border-2 border-primary">
            WordPress Brain
          </div>
        </div>
      </div>

      {/* Cables & Devices */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 500">
          <defs>
            <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#61B6DE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3F3D91" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Cable to Laptop (Top Left) */}
          <path
            d="M 320 200 Q 200 150 150 100"
            stroke="url(#cableGrad)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5 5"
            className="animate-dash"
          />
          <circle r="3" fill="#61B6DE" className="animate-pulse">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 320 200 Q 200 150 150 100" />
          </circle>

          {/* Cable to Smartphone (Mid Left) */}
          <path
            d="M 320 250 Q 200 250 120 300"
            stroke="url(#cableGrad)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5 5"
            className="animate-dash"
          />
          <circle r="3" fill="#61B6DE" className="animate-pulse">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 320 250 Q 200 250 120 300" />
          </circle>

          {/* Cable to Watch (Top Right) */}
          <path
            d="M 480 200 Q 600 150 650 100"
            stroke="url(#cableGrad)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5 5"
            className="animate-dash"
          />
          <circle r="3" fill="#61B6DE" className="animate-pulse">
            <animateMotion dur="3.5s" repeatCount="indefinite" path="M 480 200 Q 600 150 650 100" />
          </circle>

          {/* Cable to Kiosk (Mid Right) */}
          <path
            d="M 480 250 Q 600 250 680 350"
            stroke="url(#cableGrad)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5 5"
            className="animate-dash"
          />
          <circle r="3" fill="#61B6DE" className="animate-pulse">
            <animateMotion dur="5s" repeatCount="indefinite" path="M 480 250 Q 600 250 680 350" />
          </circle>
        </svg>
      </div>

      {/* Device Icons */}
      <div className="absolute top-12 left-12 animate-fade-in delay-300">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center gap-2">
          <Monitor size={32} className="text-gray-400" />
          <span className="text-xxxs font-bold text-gray-500 uppercase tracking-tighter">
            Web / Next.js
          </span>
        </div>
      </div>

      <div className="absolute bottom-24 left-8 animate-fade-in delay-500">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center gap-2">
          <Smartphone size={32} className="text-gray-400" />
          <span className="text-xxxs font-bold text-gray-500 uppercase tracking-tighter">
            Mobile App
          </span>
        </div>
      </div>

      <div className="absolute top-12 right-12 animate-fade-in delay-700">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center gap-2">
          <Watch size={32} className="text-gray-400" />
          <span className="text-xxxs font-bold text-gray-500 uppercase tracking-tighter">
            Smartwatch
          </span>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 animate-fade-in delay-1000">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center gap-2">
          <Layout size={32} className="text-gray-400" />
          <span className="text-xxxs font-bold text-gray-500 uppercase tracking-tighter">
            IoT Kiosk
          </span>
        </div>
      </div>

      <style>{`
        @keyframes dash {
            to { stroke-dashoffset: -100; }
        }
        .animate-dash {
            animation: dash 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- ARCHITECTURE DIAGRAM ---
export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 my-16">
      {/* Traditional Monolith */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
          <Split size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xxs font-black uppercase tracking-wider mb-8">
          Tradycyjny Monolit
        </div>

        <div className="space-y-4 relative z-10">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
            <Database size={32} className="text-gray-400 mb-2" />
            <span className="text-xs font-bold text-gray-700">Baza Danych & Pliki</span>
          </div>
          <div className="flex justify-center py-2">
            <ArrowRight className="rotate-90 text-gray-300" size={20} />
          </div>
          <div className="p-6 bg-[#21759B]/10 rounded-2xl border-2 border-[#21759B] flex flex-col items-center text-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/98/WordPress_blue_logo.svg"
              className="h-8 mb-2 grayscale opacity-50"
              alt="WP"
            />
            <span className="text-xs font-bold text-[#21759B]">Silnik PHP + Szablon (Theme)</span>
            <p className="text-xxs text-gray-500 mt-2">Wszystko spięte w jedną całość</p>
          </div>
          <div className="flex justify-center py-2">
            <ArrowRight className="rotate-90 text-gray-300" size={20} />
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col items-center text-center shadow-inner">
            <Globe size={32} className="text-gray-400 mb-2" />
            <span className="text-xs font-bold text-gray-700">Użytkownik</span>
          </div>
        </div>
      </div>

      {/* Headless Next.js */}
      <div className="bg-[#0B1120] p-8 rounded-3xl border border-white/5 shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:translate-y-[-10px] transition-transform text-primary">
          <Zap size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xxs font-black uppercase tracking-wider mb-8 border border-primary/20">
          Modern Headless
        </div>

        <div className="space-y-4 relative z-10">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            <Database size={32} className="text-gray-400 mb-2" />
            <span className="text-xs font-bold text-gray-400">WordPress Backend (API)</span>
          </div>
          <div className="flex justify-center py-2 relative">
            <ArrowRight className="rotate-90 text-primary" size={20} />
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-primary text-black text-xxs font-black px-3 py-1 rounded shadow-[0_0_15px_rgba(97,182,222,0.5)] uppercase z-10">
              GraphQL
            </div>
          </div>
          <div className="p-6 bg-primary/10 rounded-2xl border-2 border-primary flex flex-col items-center text-center shadow-[0_0_30px_rgba(97,182,222,0.2)]">
            <Zap size={32} className="text-primary mb-2" />
            <span className="text-xs font-bold text-white">Next.js Frontend</span>
            <p className="text-xxs text-primary mt-2 font-mono uppercase">Decoupled Architecture</p>
          </div>
          <div className="flex justify-center py-2">
            <ArrowRight className="rotate-90 text-primary" size={20} />
          </div>
          <div className="p-6 bg-white/10 rounded-2xl border border-white/5 flex flex-col items-center text-center">
            <Globe size={32} className="text-white mb-2" />
            <span className="text-xs font-bold text-white">Użytkownik (Instant Load)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- OMNICHANNEL VISUAL ---
export const OmnichannelVisual: React.FC = () => {
  return (
    <div className="my-24 py-12 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col items-center">
      <h3 className="text-xl font-bold text-dark mb-12">Napisz raz, publikuj wszędzie.</h3>

      <div className="flex flex-wrap justify-center gap-12 md:gap-24 relative">
        {/* The Source */}
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-[#21759B]/20 relative">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/98/WordPress_blue_logo.svg"
              className="h-10"
              alt="WP"
            />
            <div className="absolute -top-2 -right-2 bg-success text-white p-1 rounded-full shadow-lg">
              <Zap size={14} fill="currentColor" />
            </div>
          </div>
          <span className="text-xxs font-black uppercase tracking-widest text-dark">
            Single Data Source
          </span>
        </div>

        {/* Connecting Rays */}
        <div className="hidden lg:block absolute left-1/2 top-10 -translate-x-1/2 w-[400px] h-[2px]">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        </div>

        {/* Destinations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <Monitor />, label: 'WWW / Desktop' },
            { icon: <Smartphone />, label: 'Mobile App' },
            { icon: <Watch />, label: 'Smartwatch' },
            { icon: <Globe />, label: 'Digital Signage' },
          ].map((dest, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:border-primary/30 transition-all group-hover:scale-110">
                {dest.icon}
              </div>
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-tighter">
                {dest.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
