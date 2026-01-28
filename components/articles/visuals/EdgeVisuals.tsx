import React, { useState } from 'react';
import {
  Globe,
  Cloud,
  Wifi,
  Layers,
  Smartphone,
  Factory,
  Gamepad2,
  Box,
  ArrowRight,
  Activity,
} from 'lucide-react';
import Button from '../../common/Button';

// 1. LATENCY SWITCHER
export const LatencySwitcher = () => {
  const [mode, setMode] = useState<'cloud' | 'edge'>('cloud');

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200 flex shadow-sm">
        <button
          onClick={() => setMode('cloud')}
          aria-label="Pokaż opóźnienia dla standardowej chmury centralnej"
          aria-pressed={mode === 'cloud'}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'cloud' ? 'bg-secondary text-white shadow-md' : 'text-gray-600 hover:text-gray-600'}`}
        >
          Standard Cloud
        </button>
        <button
          onClick={() => setMode('edge')}
          aria-label="Pokaż opóźnienia dla przetwarzania brzegowego (Edge)"
          aria-pressed={mode === 'edge'}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'edge' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-gray-600'}`}
        >
          Edge Przetwarzanie
        </button>
      </div>

      <div
        className={`px-8 py-4 rounded-3xl border-2 transition-all duration-500 flex items-center gap-6 ${mode === 'edge' ? 'border-emerald-500 bg-emerald-50' : 'border-rose-100 bg-white'}`}
      >
        <div className="text-center">
          <div className="text-xxs font-black text-gray-600 uppercase mb-1">Latency</div>
          <div
            className={`text-3xl font-black font-mono transition-colors ${mode === 'edge' ? 'text-emerald-600' : 'text-rose-500'}`}
          >
            {mode === 'cloud' ? '150ms' : '5ms'}
          </div>
        </div>
        <div className="h-10 w-px bg-gray-200"></div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <Globe size={14} aria-hidden="true" />{' '}
            {mode === 'cloud' ? 'USA (Virginia)' : 'Lokalny Węzeł (Twój region)'}
          </div>
          <div
            className={`text-xxs font-bold uppercase ${mode === 'edge' ? 'text-emerald-500' : 'text-rose-400'}`}
          >
            {mode === 'cloud' ? 'Długa droga przez oceany' : 'Prędkość niemal natychmiastowa'}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. ARCHITECTURE DIAGRAM
export const ArchitectureDiagram = () => {
  return (
    <div className="bg-[#0F172A] rounded-[3rem] p-12 border border-gray-800 shadow-2xl relative overflow-hidden not-prose min-h-[600px] flex flex-col justify-center">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(#61B6DE 1px, transparent 1px), linear-gradient(90deg, #61B6DE 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 flex flex-col gap-16">
        <div className="relative group">
          <div className="absolute -inset-4 bg-secondary rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary to-dark rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20 shrink-0">
              <Cloud size={40} className="text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-xl mb-1">Central Cloud (Inteligencja)</h3>
              <p className="text-gray-600 text-sm m-0">
                Analityka Big Data, Trenowanie AI, Magazynowanie długoterminowe.
              </p>
            </div>
            <div className="ml-auto bg-primary/10 border border-primary/20 px-4 py-1 rounded-full hidden lg:block">
              <span className="text-primary text-xxs font-black uppercase tracking-widest">
                Decision Level
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-8 h-16 relative">
          <div className="w-px h-full bg-gradient-to-b from-primary to-transparent opacity-30"></div>
          <div className="absolute top-0 w-1.5 h-1.5 bg-primary rounded-full animate-flow-down shadow-[0_0_10px_#61B6DE]"></div>
        </div>

        <div className="relative group px-0 md:px-12">
          <div className="absolute -inset-4 bg-emerald-500 rounded-[2rem] blur-2xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative flex flex-col md:flex-row gap-6 justify-center">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-b from-white/10 to-transparent border border-white/10 p-6 rounded-3xl backdrop-blur-md flex items-center gap-4 group/node hover:border-emerald-500/30 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 group-hover/node:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Edge Node 0{i}</h3>
                  <p className="text-xxs text-gray-700 uppercase font-black m-0 tracking-tighter">
                    Real-time Processing
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-around -my-8 h-16 relative px-24">
          <div className="w-px h-full bg-gradient-to-b from-emerald-500 to-transparent opacity-30"></div>
          <div className="w-px h-full bg-gradient-to-b from-emerald-500 to-transparent opacity-30"></div>
          <div className="absolute top-0 left-[25%] w-1.5 h-1.5 bg-emerald-400 rounded-full animate-flow-down shadow-[0_0_10px_#10B981] delay-300"></div>
          <div className="absolute top-0 right-[25%] w-1.5 h-1.5 bg-emerald-400 rounded-full animate-flow-down shadow-[0_0_10px_#10B981] delay-700"></div>
        </div>

        <div className="relative bg-white/5 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Smartphone />, label: 'Mobile', color: 'text-blue-400' },
              { icon: <Factory />, label: 'Factory', color: 'text-rose-400' },
              { icon: <Gamepad2 />, label: 'Gaming', color: 'text-purple-400' },
              { icon: <Box />, label: 'IoT Sensor', color: 'text-amber-400' },
            ].map((dev, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group/dev">
                <div
                  className={`w-16 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover/dev:bg-white/10 group-hover/dev:scale-110 ${dev.color}`}
                >
                  {dev.icon}
                </div>
                <span className="text-xxs font-black text-gray-700 uppercase tracking-widest group-hover/dev:text-white transition-colors">
                  {dev.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
                @keyframes flow-down {
                    0% { transform: translateY(0); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(60px); opacity: 0; }
                }
                .animate-flow-down {
                    animation: flow-down 1.5s linear infinite;
                }
            `}</style>
    </div>
  );
};

// 3. FLIP CARD
export const FlipCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => {
  return (
    <div className="group h-64 w-full [perspective:1000px]">
      <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-dark mb-4">
            {icon}
          </div>
          <h3 className="font-bold text-lg text-dark">{title}</h3>
          <div className="mt-4 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
            Zobacz detale <ArrowRight size={12} aria-hidden="true" />
          </div>
        </div>
        <div className="absolute inset-0 bg-dark p-8 rounded-3xl text-white flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-sm leading-relaxed m-0">{desc}</p>
        </div>
      </div>
    </div>
  );
};

// 4. (Removed MarketGrowthChart - moved to lazy-loaded component)

// 5. SAFETY SIMULATOR
export const SafetySimulator = () => {
  const [mode, setMode] = useState<'cloud' | 'edge'>('cloud');
  const [status, setStatus] = useState<'idle' | 'running' | 'result'>('idle');
  const [isCollision, setIsCollision] = useState(false);

  const startTest = () => {
    setIsCollision(false);
    setStatus('running');
    const lag = mode === 'cloud' ? 2000 : 400;
    setTimeout(() => {
      if (mode === 'cloud') {
        setIsCollision(true);
      }
      setStatus('result');
    }, lag);
  };

  const reset = () => {
    setStatus('idle');
    setIsCollision(false);
  };

  return (
    <div
      className={`bg-[#0F172A] rounded-[3rem] p-8 md:p-12 shadow-2xl border transition-all duration-500 relative overflow-hidden not-prose ${isCollision ? 'border-rose-500/50' : 'border-gray-800'}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 relative z-30">
        <div>
          <h3 className="text-white font-bold text-xl mb-1 flex items-center gap-2">
            <Activity
              className={isCollision ? 'text-rose-500' : 'text-primary'}
              aria-hidden="true"
            />
            Symulator Reakcji Systemu AI
          </h3>
          <p className="text-gray-600 text-sm">Wykrywanie przeszkody i czas decyzyjny sieci</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => {
                setMode('cloud');
                reset();
              }}
              aria-label="Ustaw tryb symulacji na Chmurę"
              aria-pressed={mode === 'cloud'}
              className={`px-4 py-2 rounded-lg text-xxs font-black uppercase tracking-widest transition-all ${mode === 'cloud' ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-600 hover:text-white'}`}
            >
              Chmura
            </button>
            <button
              onClick={() => {
                setMode('edge');
                reset();
              }}
              aria-label="Ustaw tryb symulacji na Edge"
              aria-pressed={mode === 'edge'}
              className={`px-4 py-2 rounded-lg text-xxs font-black uppercase tracking-widest transition-all ${mode === 'edge' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 hover:text-white'}`}
            >
              Edge
            </button>
          </div>
          <Button
            onClick={status === 'result' ? reset : startTest}
            disabled={status === 'running'}
            className="shadow-lg"
          >
            {status === 'result' ? 'Resetuj' : 'Rozpocznij Test'}
          </Button>
        </div>
      </div>

      <div className="relative h-80 bg-[#0B1120] rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div
            className={`absolute top-6 transition-all duration-500 flex flex-col items-center ${mode === 'cloud' ? 'opacity-100 scale-100' : 'opacity-20 scale-75 grayscale'}`}
          >
            <Cloud size={40} className="text-primary" />
            <span className="text-xxxs font-bold text-primary uppercase">Central Cloud (USA)</span>
          </div>
          <div
            className={`absolute top-24 left-[40%] transition-all duration-500 flex flex-col items-center ${mode === 'edge' ? 'opacity-100 scale-100' : 'opacity-20 scale-75 grayscale'}`}
          >
            <Wifi size={24} className="text-emerald-400" />
            <span className="text-xxxs font-bold text-emerald-400 uppercase">Edge Node</span>
          </div>
        </div>
        <div
          className={`absolute bottom-16 left-0 right-0 h-1 bg-gray-800 border-t border-dashed border-gray-700 ${status !== 'result' ? 'animate-road-move' : ''}`}
        ></div>
        <div
          className="absolute bottom-12 z-20 transition-all flex flex-col items-center"
          style={{
            left:
              status === 'idle'
                ? '10%'
                : status === 'running'
                  ? mode === 'cloud'
                    ? '75%'
                    : '45%'
                  : isCollision
                    ? '75%'
                    : '50%',
            transitionDuration:
              status === 'running' ? (mode === 'cloud' ? '1.2s' : '0.4s') : '0.5s',
            transitionTimingFunction:
              status === 'result' && !isCollision ? 'cubic-bezier(0.1, 0.7, 0.1, 1)' : 'linear',
          }}
        >
          <div
            className={`relative p-3 rounded-lg border-2 shadow-2xl transition-all duration-300 ${isCollision ? 'bg-rose-900 border-rose-500 rotate-12 scale-110 shadow-rose-900/50' : 'bg-[#1E293B] border-primary'}`}
          >
            <Smartphone size={24} className="text-white" />
          </div>
        </div>
        <div className="absolute right-[15%] bottom-12 z-10 text-center">
          <div
            className={`w-6 h-20 bg-gradient-to-b from-rose-500/20 to-rose-500/40 border-2 border-rose-500/50 rounded-full ${isCollision ? 'bg-rose-500 shadow-[0_0_40px_#F43F5E] scale-110' : 'animate-pulse'}`}
          ></div>
        </div>
      </div>
      <style>{`
                @keyframes road-slide { from { background-position: 0 0; } to { background-position: -40px 0; } }
                .animate-road-move { background-image: linear-gradient(90deg, #334155 50%, transparent 50%); background-size: 40px 1px; animation: road-slide 0.3s linear infinite; }
            `}</style>
    </div>
  );
};

// 6. DATA FUNNEL
export const DataFunnel = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl not-prose">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center">
          <Activity size={48} className="text-rose-500 mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-dark mt-4">Surowe Dane</h3>
          <p className="text-xs text-gray-600 uppercase font-black tracking-widest">
            100 GB / Dzień
          </p>
        </div>
        <div className="flex items-center justify-center text-gray-200">
          <ArrowRight size={32} className="rotate-90 md:rotate-0" aria-hidden="true" />
        </div>
        <div className="flex-1 bg-dark p-6 rounded-[2rem] text-white text-center shadow-2xl relative overflow-hidden">
          <Layers size={32} className="mx-auto mb-2 text-primary" aria-hidden="true" />
          <h3 className="font-bold text-sm">Edge Intelligence</h3>
          <p className="text-xxs text-gray-600 leading-relaxed mt-2">
            Filtrowanie szumu, kompresja i lokalna analityka.
          </p>
          <div className="mt-4 bg-white/10 rounded-full py-1 text-xxs font-black uppercase">
            Oszczędność: 98%
          </div>
        </div>
        <div className="flex items-center justify-center text-gray-200">
          <ArrowRight size={32} className="rotate-90 md:rotate-0" aria-hidden="true" />
        </div>
        <div className="flex-1 text-center">
          <Cloud size={48} className="text-primary mx-auto" aria-hidden="true" />
          <h3 className="font-bold text-dark mt-4">Analityka Cloud</h3>
          <p className="text-xs text-emerald-500 uppercase font-black tracking-widest">
            2 GB / Dzień
          </p>
        </div>
      </div>
    </div>
  );
};
