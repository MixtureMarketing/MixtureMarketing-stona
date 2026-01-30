import React from 'react';
import { Heart, Box, Layers, Settings, Code2, Cpu, FileCode } from 'lucide-react';

export const VueHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#1B2430] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-[#42B883]/20 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(66,184,131,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(66,184,131,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1B2430] via-transparent to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-8 animate-float">
          <div className="absolute inset-0 bg-[#42B883] rounded-full blur-[80px] opacity-20 animate-pulse"></div>
          <div className="relative w-full h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-45 group-hover:rotate-[40deg] transition-all duration-700">
            <div className="w-2/3 h-2/3 relative transform -rotate-45">
              <div className="absolute top-0 left-0 w-full h-full text-[#42B883] drop-shadow-[0_0_15px_rgba(66,184,131,0.5)]">
                <svg viewBox="0 0 261.76 226.69" fill="currentColor">
                  <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" />
                </svg>
              </div>
              <div className="absolute top-0 left-0 w-full h-full text-[#35495E] scale-50 translate-y-[-10%] drop-shadow-lg">
                <svg viewBox="0 0 261.76 226.69" fill="currentColor">
                  <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="absolute -right-8 top-0 animate-bounce-slow">
            <div className="bg-[#35495E] text-white p-3 rounded-xl shadow-lg border border-[#42B883]/30 text-xs font-bold font-mono">
              .vue
            </div>
          </div>
          <div className="absolute -left-8 bottom-0 animate-bounce-slow delay-700">
            <div className="bg-[#42B883] text-[#1B2430] p-3 rounded-xl shadow-lg text-xs font-bold font-mono">
              Composition API
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            The <span className="text-[#42B883]">Progressive</span> Framework
          </h2>
          <p className="text-[#42B883]/80 font-mono text-sm uppercase tracking-[0.3em]">
            Versatile • Performant • Approachable
          </p>
        </div>
      </div>

      <style>{`
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounceSlow 4s infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
    </div>
  );
};

export const FrameworkSpectrum = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-[2.5rem] p-8 md:p-12 border border-gray-200 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#61DAFB] via-[#42B883] to-[#DD0031]"></div>

      <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
        <div className="flex-1 text-center opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 mx-auto bg-[#61DAFB]/10 rounded-full flex items-center justify-center mb-4">
            <Box className="text-[#61DAFB]" size={32} />
          </div>
          <h4 className="font-bold text-dark">React</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Totalna Swoboda</p>
          <p className="text-xs text-gray-400 mt-2">Wymaga wielu decyzji</p>
        </div>

        <div className="flex-1 text-center transform scale-110">
          <div className="relative">
            <div className="absolute inset-0 bg-[#42B883] blur-[40px] opacity-20 rounded-full"></div>
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4 border-4 border-[#42B883] shadow-xl relative z-10">
              <Heart className="text-[#42B883]" size={40} fill="currentColor" />
            </div>
          </div>
          <h4 className="text-2xl font-black text-dark">Vue.js</h4>
          <div className="inline-block bg-[#42B883] text-white text-xxs font-bold px-3 py-1 rounded-full uppercase tracking-widest mt-2 mb-2">
            Harmonijny Kompromis
          </div>
          <p className="text-sm text-gray-600 font-medium">Struktura + Elastyczność</p>
        </div>

        <div className="flex-1 text-center opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 mx-auto bg-[#DD0031]/10 rounded-full flex items-center justify-center mb-4">
            <Layers className="text-[#DD0031]" size={32} />
          </div>
          <h4 className="font-bold text-dark">Angular</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Pełna Struktura</p>
          <p className="text-xs text-gray-400 mt-2">Sztywne ramy</p>
        </div>
      </div>

      <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-200 -z-0 hidden md:block"></div>
    </div>
  );
};

export const ProgressiveScalingVisual = () => {
  return (
    <div className="bg-[#1e293b] p-8 rounded-[2.5rem] shadow-2xl border border-gray-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#42B883] rounded-full blur-[100px] opacity-10"></div>

      <div className="flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="w-32 h-32 bg-[#42B883] rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(66,184,131,0.4)] z-30 border-4 border-[#1e293b]">
          <span className="text-white font-black text-lg">Vue Core</span>
          <span className="text-[#1e293b] text-xxs font-bold uppercase mt-1">The Library</span>
        </div>

        <div className="absolute w-64 h-64 border-2 border-dashed border-[#42B883]/30 rounded-full flex items-center justify-center z-20 animate-spin-slow">
          <div className="absolute top-4 bg-[#1e293b] px-2 text-[#42B883] text-xs font-mono">
            Components
          </div>
          <div className="absolute bottom-4 bg-[#1e293b] px-2 text-[#42B883] text-xs font-mono">
            Directives
          </div>
        </div>

        <div className="absolute w-96 h-96 border border-[#42B883]/20 rounded-full flex items-center justify-center z-10">
          <div className="absolute -top-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Settings size={12} /> Vue Router
          </div>
          <div className="absolute -bottom-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Layers size={12} /> Pinia (State)
          </div>
          <div className="absolute -right-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Code2 size={12} /> TypeScript
          </div>
          <div className="absolute -left-3 bg-[#35495E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Cpu size={12} /> Test Utils
          </div>
        </div>
      </div>

      <div className="text-center mt-32 md:mt-40">
        <p className="text-gray-400 text-sm">
          Zaczynasz od "Core". Resztę dokładasz tylko wtedy, gdy potrzebujesz.
        </p>
      </div>

      <style>{`
                .animate-spin-slow { animation: spin 20s linear infinite; }
            `}</style>
    </div>
  );
};

export const VueSfcPreview = () => {
  return (
    <div className="bg-[#0f172a] rounded-2xl shadow-xl overflow-hidden border border-gray-700 font-mono text-sm max-w-2xl mx-auto">
      <div className="bg-[#1e293b] px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-[#42B883]" />
          <span className="text-gray-300">UserProfile.vue</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative group">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-blue-500 opacity-50"></div>
          <div className="text-blue-400 mb-1 opacity-50 text-xs uppercase tracking-widest font-bold">
            1. Struktura (HTML)
          </div>
          <code className="block text-gray-300">
            <span className="text-blue-400">&lt;template&gt;</span>
            <br />
            &nbsp;&nbsp;<span className="text-emerald-400">&lt;div class="card"&gt;</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-white">Hello, {'{{ userName }}'}!</span>
            <br />
            &nbsp;&nbsp;<span className="text-emerald-400">&lt;/div&gt;</span>
            <br />
            <span className="text-blue-400">&lt;/template&gt;</span>
          </code>
        </div>

        <div className="relative group">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-yellow-500 opacity-50"></div>
          <div className="text-yellow-500 mb-1 opacity-50 text-xs uppercase tracking-widest font-bold">
            2. Logika (JS/TS)
          </div>
          <code className="block text-gray-300">
            <span className="text-blue-400">&lt;script setup&gt;</span>
            <br />
            &nbsp;&nbsp;<span className="text-purple-400">import</span> {'{ ref }'}{' '}
            <span className="text-purple-400">from</span>{' '}
            <span className="text-green-300">'vue'</span>;<br />
            &nbsp;&nbsp;<span className="text-purple-400">const</span> userName ={' '}
            <span className="text-blue-300">ref</span>(
            <span className="text-green-300">'Maciej'</span>);
            <br />
            <span className="text-blue-400">&lt;/script&gt;</span>
          </code>
        </div>

        <div className="relative group">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-purple-500 opacity-50"></div>
          <div className="text-purple-400 mb-1 opacity-50 text-xs uppercase tracking-widest font-bold">
            3. Wygląd (CSS)
          </div>
          <code className="block text-gray-300">
            <span className="text-blue-400">&lt;style scoped&gt;</span>
            <br />
            &nbsp;&nbsp;<span className="text-yellow-300">.card</span> {'{'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">padding</span>:{' '}
            <span className="text-orange-300">2rem</span>;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">background</span>:{' '}
            <span className="text-green-300">#42B883</span>;<br />
            &nbsp;&nbsp;{'}'}
            <br />
            <span className="text-blue-400">&lt;/style&gt;</span>
          </code>
        </div>
      </div>
    </div>
  );
};
