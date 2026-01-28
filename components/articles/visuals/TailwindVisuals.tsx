import React, { useState, useEffect } from 'react';
import {
  Zap,
  Layers,
  Palette,
  Smartphone,
  Layout,
  CheckCircle2,
  XCircle,
  Code2,
  Box,
  Puzzle,
  MousePointer2,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO: BUTTON BUILDER ANIMATION ---
export const TailwindButtonBuilder: React.FC = () => {
  const [step, setStep] = useState(0);
  const classes = [
    'bg-blue-500',
    'text-white',
    'rounded-xl',
    'shadow-2xl',
    'px-8',
    'py-4',
    'font-bold',
    'hover:bg-blue-600',
    'transition-all',
    'scale-110',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < classes.length ? prev + 1 : 0));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-gray-50 rounded-[3rem] p-12 md:p-20 overflow-hidden border border-gray-100 shadow-inner flex flex-col items-center justify-center min-h-[400px]">
      {/* Code Stream */}
      <div className="absolute top-10 left-0 w-full flex flex-wrap justify-center gap-2 px-4 opacity-20 pointer-events-none">
        {classes.map((c, i) => (
          <span
            key={i}
            className={`text-xs font-mono font-bold transition-all duration-500 ${i < step ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            .{c}
          </span>
        ))}
      </div>

      {/* The Button */}
      <div className="relative z-10 transition-all duration-700 ease-out">
        <button
          className={`
                transition-all duration-500 ease-in-out
                ${step > 0 ? 'bg-blue-500' : 'bg-gray-300'}
                ${step > 1 ? 'text-white' : 'text-transparent'}
                ${step > 2 ? 'rounded-xl' : 'rounded-none'}
                ${step > 3 ? 'shadow-[0_20px_50px_rgba(59,130,246,0.4)]' : 'shadow-none'}
                ${step > 4 ? 'px-8' : 'px-4'}
                ${step > 5 ? 'py-4' : 'py-2'}
                ${step > 6 ? 'font-bold' : 'font-normal'}
                ${step > 9 ? 'scale-110' : 'scale-100'}
                border-0 outline-none cursor-default
            `}
        >
          {step > 1 ? 'Start Project' : 'Button'}
        </button>

        {/* Cursor Indicator */}
        {step > 7 && (
          <div className="absolute -bottom-8 -right-8 animate-bounce">
            <MousePointer2 className="text-blue-600 fill-blue-600" size={32} />
          </div>
        )}
      </div>

      {/* Code Snippet Box */}
      <div className="mt-16 bg-[#0F172A] rounded-2xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-mono text-xs md:text-sm text-blue-400 w-full max-w-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50"></div>
        <div className="flex gap-1.5 mb-4 opacity-30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500">{'<'}button</span>
          <div className="pl-4">
            <span className="text-purple-400">class</span>
            <span className="text-gray-500">="</span>
            <span className="text-emerald-400 break-words">
              {classes.slice(0, step).join(' ')}
              {step < classes.length && (
                <span className="animate-pulse inline-block w-2 h-4 bg-emerald-400 ml-1"></span>
              )}
            </span>
            <span className="text-gray-500">"</span>
          </div>
          <span className="text-gray-500">{'>'}</span>
          <div className="pl-4 text-white">Start Project</div>
          <span className="text-gray-500">
            {'</'}button{'>'}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- LEGO VS PLAYMOBIL ANALOGY ---
export const LegoVsPlaymobil: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
      {/* Playmobil (Bootstrap) */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
          <Box size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xxs font-black uppercase tracking-wider mb-8">
          Podejście Tradycyjne (Bootstrap)
        </div>

        <div className="space-y-6 relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200 shadow-inner">
            <Box size={48} className="text-gray-300" />
          </div>
          <h4 className="text-xl font-bold text-dark">"Gotowe Odlewy"</h4>
          <p className="text-sm text-gray-600 max-w-xs">
            Dostajesz gotowy domek. Możesz go pomalować, ale trudno zmienić układ okien czy kształt
            dachu. Wszystko wygląda podobnie.
          </p>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-md"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-md"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* LEGO (Tailwind) */}
      <div className="bg-blue-50/30 p-8 rounded-3xl border-2 border-blue-100 shadow-md relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform text-blue-600">
          <Puzzle size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xxs font-black uppercase tracking-wider mb-8">
          Podejście Utility-First (Tailwind)
        </div>

        <div className="space-y-6 relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center border border-blue-200 shadow-xl">
            <Puzzle size={48} className="text-blue-500 animate-pulse" />
          </div>
          <h4 className="text-xl font-bold text-dark">"Wiadro Klocków"</h4>
          <p className="text-sm text-gray-600 max-w-xs">
            Dostajesz setki małych klocków (kolor, zaokrąglenie, cień). Budujesz dokładnie to, co
            chcesz. Od zamku po prom kosmiczny.
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-[120px]">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-blue-500 rounded-sm shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PREVIEW COMPARISON ---
export const BootstrapVsTailwindPreview: React.FC = () => {
  return (
    <div className="my-24 bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Bootstrap Side */}
        <div className="p-8 md:p-12 bg-gray-50/50">
          <div className="text-center mb-8">
            <span className="text-xxs font-black uppercase text-gray-400 tracking-widest">
              Generic "Bootstrap" Style
            </span>
          </div>
          <div className="space-y-6 opacity-60">
            <div className="h-10 bg-blue-600 rounded flex items-center px-4 text-white font-bold text-sm">
              Navbar
            </div>
            <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4">
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-2 w-full bg-gray-100 rounded"></div>
              <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
              <div className="h-10 w-32 bg-blue-600 rounded text-white flex items-center justify-center text-xs">
                Button Primary
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white border border-gray-200 rounded shadow-sm"
                ></div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold">
            <XCircle size={16} /> Szablonowe i powtarzalne
          </div>
        </div>

        {/* Tailwind Side */}
        <div className="p-8 md:p-12 relative overflow-hidden group">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity"></div>

          <div className="text-center mb-8 relative z-10">
            <span className="text-xxs font-black uppercase text-blue-600 tracking-widest">
              Custom "Tailwind" UI
            </span>
          </div>
          <div className="space-y-6 relative z-10">
            <div className="h-14 bg-white/80 backdrop-blur shadow-lg rounded-2xl flex items-center justify-between px-6 border border-blue-50">
              <div className="w-8 h-8 bg-blue-600 rounded-xl"></div>
              <div className="flex gap-4">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2rem] shadow-2xl shadow-blue-200 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="h-6 w-3/4 bg-white/20 rounded-full"></div>
              <div className="h-2 w-full bg-white/10 rounded-full"></div>
              <div className="h-14 w-full bg-white text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest shadow-xl">
                Start Growth
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-[#0F172A] rounded-[1.5rem] p-4 flex flex-col justify-end border border-white/5 shadow-xl">
                <div className="h-1.5 w-1/2 bg-blue-500 rounded-full mb-2"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-32 bg-white border border-gray-100 rounded-[1.5rem] p-4 flex items-center justify-center shadow-lg">
                <Zap size={32} className="text-blue-500 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-blue-600 text-xs font-bold relative z-10">
            <CheckCircle2 size={16} /> Unikalne i dopasowane
          </div>
        </div>
      </div>
    </div>
  );
};
