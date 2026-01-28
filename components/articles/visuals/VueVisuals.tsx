/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Heart,
  TrendingUp,
  Layout,
  Box,
  Zap,
  CheckCircle2,
  Smartphone,
  Users,
  ChevronRight,
  Code2,
  LineChart,
  Home,
  Armchair,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO: LEARNING CURVE CHART ---
export const LearningCurveChart: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full bg-white rounded-[3rem] p-8 md:p-12 overflow-hidden border border-gray-100 shadow-xl min-h-[450px] flex flex-col items-center justify-center group">
      <div className="text-center mb-12">
        <h3 className="text-xl font-bold text-dark">Krzywa Uczenia się (Learning Curve)</h3>
        <p className="text-xxs font-black uppercase tracking-widest text-gray-400 mt-2">
          Complexity vs Time
        </p>
      </div>

      <div className="relative w-full max-w-2xl h-64 border-b-2 border-l-2 border-gray-100 flex items-end px-4">
        {/* Axis Labels */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xxs font-bold text-gray-400 uppercase tracking-widest">
          Trudność
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xxs font-bold text-gray-400 uppercase tracking-widest">
          Czas nauki
        </div>

        {/* Lines Container */}
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          {/* Angular (Red) - Very Steep */}
          <path
            d="M 0 190 Q 20 180 40 20"
            fill="none"
            stroke="#DD0031"
            strokeWidth="3"
            strokeLinecap="round"
            className={`transition-all duration-[2000ms] ${isVisible ? 'stroke-dash-0' : 'stroke-dash-full'}`}
            style={{ strokeDasharray: 500, strokeDashoffset: isVisible ? 0 : 500 }}
          />
          {/* React (Blue) - Flat then Stairs */}
          <path
            d="M 0 190 L 100 180 L 150 140 L 200 130 L 250 80 L 300 70 L 400 20"
            fill="none"
            stroke="#61DAFB"
            strokeWidth="3"
            strokeLinecap="round"
            className={`transition-all duration-[2000ms] delay-500 ${isVisible ? 'stroke-dash-0' : 'stroke-dash-full'}`}
            style={{ strokeDasharray: 600, strokeDashoffset: isVisible ? 0 : 600 }}
          />
          {/* Vue (Green) - Smooth curve */}
          <path
            d="M 0 190 Q 150 180 400 100"
            fill="none"
            stroke="#42B883"
            strokeWidth="5"
            strokeLinecap="round"
            className={`transition-all duration-[2500ms] delay-1000 ${isVisible ? 'stroke-dash-0' : 'stroke-dash-full'}`}
            style={{ strokeDasharray: 500, strokeDashoffset: isVisible ? 0 : 500 }}
          />
        </svg>

        {/* Legend */}
        <div className="absolute top-0 right-0 space-y-2">
          <div className="flex items-center gap-2 text-xxs font-bold text-[#DD0031]">
            <div className="w-3 h-0.5 bg-[#DD0031]"></div> Angular
          </div>
          <div className="flex items-center gap-2 text-xxs font-bold text-[#61DAFB]">
            <div className="w-3 h-0.5 bg-[#61DAFB]"></div> React
          </div>
          <div className="flex items-center gap-2 text-xxs font-bold text-[#42B883] bg-[#42B883]/10 px-2 py-1 rounded-full">
            <div className="w-3 h-1 bg-[#42B883]"></div> Vue.js
          </div>
        </div>
      </div>

      <p className="mt-16 text-sm text-gray-500 font-medium italic">
        "Technologia, która nie rzuca kłód pod nogi."
      </p>
    </div>
  );
};

// --- PROGRESSIVE SCALING VISUAL ---
export const ProgressiveScalingVisual: React.FC = () => {
  const [scale, setScale] = useState<'module' | 'app'>('module');

  return (
    <div className="my-16 bg-[#F9FAFB] rounded-[3rem] p-8 md:p-16 border border-gray-100 flex flex-col items-center">
      <div className="text-center mb-12">
        <h3 className="text-xl font-bold text-dark">Vue skaluje się razem z problemem</h3>
        <p className="text-sm text-gray-500 mt-2">Od widgetu po system Enterprise</p>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 mb-12 shadow-sm">
        <button
          onClick={() => setScale('module')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${scale === 'module' ? 'bg-[#42B883] text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Prosty Widget
        </button>
        <button
          onClick={() => setScale('app')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${scale === 'app' ? 'bg-[#42B883] text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Pełna Aplikacja
        </button>
      </div>

      <div className="relative w-full max-w-2xl min-h-[300px] flex items-center justify-center">
        {scale === 'module' ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl border-2 border-[#42B883]/20 flex items-center justify-center relative">
              <Armchair size={48} className="text-[#42B883]" />
              <div className="absolute -top-2 -right-2 bg-[#42B883] text-white text-xxxs font-black px-2 py-1 rounded-full">
                20KB
              </div>
            </div>
            <span className="mt-6 text-sm font-bold text-gray-600">
              Interaktywny Formularz w PHP
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full animate-fade-in">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl shadow-md border border-[#42B883]/10 flex flex-col items-center gap-2 group hover:border-[#42B883] transition-colors"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#42B883]">
                  {i === 0 ? (
                    <Layout size={20} />
                  ) : i === 1 ? (
                    <Smartphone size={20} />
                  ) : (
                    <Box size={20} />
                  )}
                </div>
                <div className="h-1.5 w-12 bg-gray-100 rounded-full"></div>
              </div>
            ))}
            <div className="col-span-2 md:col-span-3 bg-dark p-6 rounded-2xl flex items-center justify-between text-white mt-4">
              <div className="flex items-center gap-4">
                <Home size={24} className="text-[#42B883]" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest">SPA System</div>
                  <div className="text-xxs text-gray-400">Enterprise Ready Architecture</div>
                </div>
              </div>
              <Zap size={20} className="text-amber-400 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SINGLE FILE COMPONENT (SFC) PREVIEW ---
export const VueSfcPreview: React.FC = () => {
  return (
    <div className="my-16 bg-[#0B1120] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
        </div>
        <div className="flex items-center gap-2 bg-[#42B883]/10 px-3 py-1 rounded-lg border border-[#42B883]/20">
          <Code2 size={12} className="text-[#42B883]" />
          <span className="text-xxs font-black text-[#42B883] uppercase tracking-widest">
            Button.vue
          </span>
        </div>
      </div>

      <div className="p-8 font-mono text-xs md:text-sm">
        <div className="space-y-6">
          <div>
            <span className="text-[#42B883]">&lt;template&gt;</span>
            <div className="pl-4 text-gray-400">
              &lt;button <span className="text-amber-400">class</span>="btn"{' '}
              <span className="text-amber-400">@click</span>="count++"&gt;
              <br />
              <span className="pl-4">Kliknięto mnie &#123;&#123; count &#125;&#125; razy</span>
              <br />
              &lt;/button&gt;
            </div>
            <span className="text-[#42B883]">&lt;/template&gt;</span>
          </div>

          <div>
            <span className="text-[#42B883]">&lt;script setup&gt;</span>
            <div className="pl-4">
              <span className="text-purple-400">import</span> &#123; ref &#125;{' '}
              <span className="text-purple-400">from</span>{' '}
              <span className="text-emerald-400">'vue'</span>;<br />
              <span className="text-purple-400">const</span> count ={' '}
              <span className="text-blue-400">ref</span>(<span className="text-orange-400">0</span>
              );
            </div>
            <span className="text-[#42B883]">&lt;/script&gt;</span>
          </div>

          <div>
            <span className="text-[#42B883]">&lt;style scoped&gt;</span>
            <div className="pl-4">
              <span className="text-amber-400">.btn</span> &#123;
              <br />
              <span className="pl-4 text-gray-400">
                background-color: <span className="text-[#42B883]">#42b883</span>;
              </span>
              <br />
              <span className="pl-4 text-gray-400">
                color: <span className="text-white">white</span>;
              </span>
              <br />
              &#125;
            </div>
            <span className="text-[#42B883]">&lt;/style&gt;</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5 text-center">
        <p className="text-xxs text-gray-500 italic m-0">
          "Wszystko co dotyczy komponentu w jednym, czytelnym pliku."
        </p>
      </div>
    </div>
  );
};
