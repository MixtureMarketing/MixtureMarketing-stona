import React, { useState, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  TrendingDown,
  ArrowDown,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Server,
  ZapOff,
  Bot,
  FileCode,
  Globe,
} from 'lucide-react';
import Button from '../../common/Button';
import GlassCard from '../../common/GlassCard';

// 1. DDOS SIMULATOR
export const DdosSimulator = () => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [wafEnabled, setWafEnabled] = useState(true);
  const [bots, setBots] = useState<{ id: number; top: number; startTime: number }[]>([]);

  useEffect(() => {
    if (!isAttacking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBots([]);
      return;
    }

    const interval = setInterval(() => {
      setBots((prev) => {
        const now = Date.now();
        const keep = prev.filter((b) => now - b.startTime < 1000);
        return [...keep, { id: now, top: Math.random() * 80 + 10, startTime: now }];
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAttacking]);

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl border border-gray-800 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 relative z-20">
        <div className="flex gap-4">
          <button
            onClick={() => setIsAttacking(!isAttacking)}
            aria-label={
              isAttacking
                ? 'Zatrzymaj symulację ataku DDoS'
                : 'Rozpocznij symulację ataku DDoS na serwer'
            }
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isAttacking ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/10 text-gray-600 hover:bg-white/20'}`}
          >
            {isAttacking ? <ZapOff size={18} /> : <Zap size={18} fill="currentColor" />}
            {isAttacking ? 'Zatrzymaj Atak' : 'Symuluj Atak DDoS'}
          </button>
          <button
            onClick={() => setWafEnabled(!wafEnabled)}
            aria-label={
              wafEnabled ? 'Wyłącz ochronę WAF w symulatorze' : 'Włącz ochronę WAF w symulatorze'
            }
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${wafEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'}`}
          >
            {wafEnabled ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            WAF: {wafEnabled ? 'WŁĄCZONY' : 'WYŁĄCZONY'}
          </button>
        </div>
        <div className="text-white font-mono text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isAttacking ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
            ></div>
            STATUS: {isAttacking ? 'UNDER ATTACK' : 'NORMAL TRAFFIC'}
          </div>
        </div>
      </div>

      <div className="relative h-64 bg-gray-900/50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-between px-12">
        {/* Attacker Area */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
            <Bot size={32} />
          </div>
          <span className="text-xxs font-bold text-gray-700 uppercase tracking-widest">Botnet</span>
        </div>

        {/* Shield / WAF Line */}
        <div
          className={`absolute left-1/2 top-0 bottom-0 w-1 transition-all duration-500 z-20 ${wafEnabled ? 'bg-emerald-500/50 shadow-[0_0_20px_#10B981]' : 'bg-rose-500/20 shadow-none'}`}
        >
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center ${wafEnabled ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-800 text-gray-700 opacity-50'}`}
          >
            {wafEnabled ? <ShieldCheck size={24} /> : <ZapOff size={24} />}
          </div>
        </div>

        {/* Server Area */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${!wafEnabled && isAttacking ? 'bg-rose-500 scale-110 animate-shake' : 'bg-primary text-white'}`}
          >
            <Server size={40} className={!wafEnabled && isAttacking ? 'animate-pulse' : ''} />
          </div>
          <span className="text-xxs font-bold text-gray-600 uppercase tracking-widest">
            Origin Server
          </span>
        </div>

        {/* BOT PACKETS */}
        {bots.map((bot) => (
          <div
            key={bot.id}
            className={`absolute w-2 h-2 rounded-full shadow-lg ${wafEnabled ? 'bg-rose-500 animate-packet-blocked' : 'bg-rose-500 animate-packet-success'}`}
            style={{ top: `${bot.top}%`, left: '10%' }}
          ></div>
        ))}
      </div>

      <style>{`
                @keyframes packet-success {
                    from { left: 15%; opacity: 1; }
                    to { left: 85%; opacity: 0; }
                }
                @keyframes packet-blocked {
                    0% { left: 15%; opacity: 1; }
                    50% { left: 50%; opacity: 1; }
                    100% { left: 50%; opacity: 0; transform: translateY(-20px); }
                }
                .animate-packet-success { animation: packet-success 0.8s linear forwards; }
                .animate-packet-blocked { animation: packet-blocked 0.8s linear forwards; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.1s linear infinite; }
            `}</style>
    </div>
  );
};

// 2. IMAGE OPTIMIZER SLIDER
export const ImageOptimizerComparison = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const rafRef = React.useRef<number | null>(null);
  const imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072';

  const handleMove = (clientX: number, rect: DOMRect) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const x = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(0, Math.min(100, x)));
      rafRef.current = null;
    });
  };

  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-4 gap-4">
        <div className="flex items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-xxs uppercase font-black text-gray-600 tracking-widest mb-1">
              Standard (JPG)
            </div>
            <div className="text-xl font-bold text-dark">4.8 MB</div>
          </div>
          <div className="h-8 w-px bg-gray-100 hidden md:block"></div>
          <div className="text-center md:text-left">
            <div className="text-xxs uppercase font-black text-[#10B981] tracking-widest mb-1">
              Optymalizacja CDN
            </div>
            <div className="text-xl font-bold text-emerald-500">180 KB</div>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100 uppercase tracking-tight">
          Ta sama jakość • 96% mniejszy transfer
        </div>
      </div>

      <div
        className="relative h-[400px] rounded-2xl overflow-hidden cursor-ew-resize group select-none shadow-inner"
        role="img"
        aria-label="Porównanie jakości obrazu przed i po optymalizacji CDN. Przesuń suwak, aby zobaczyć różnicę."
        onMouseMove={(e) => {
          if (e.buttons === 1) {
            handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
          }
        }}
        onTouchMove={(e) => {
          handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
        }}
      >
        {/* Left: Original Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        >
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xxs font-bold uppercase tracking-widest border border-white/10">
            Format JPG
          </div>
        </div>

        {/* Right: Optimized Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${imageUrl}')`,
            clipPath: `inset(0 0 0 ${sliderPos}%)`,
          }}
        >
          <div className="absolute top-4 right-4 bg-[#10B981] text-white px-4 py-1.5 rounded-full text-xxs font-bold uppercase tracking-widest shadow-lg">
            Format WebP / AVIF
          </div>
        </div>

        {/* Vertical Divider / Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] z-30 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-[#10B981] text-dark">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 bg-gray-200 rounded-full"></div>
              <div className="w-1 h-4 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Label Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-100 shadow-xl z-20 text-center pointer-events-none transition-opacity group-hover:opacity-0">
          <div className="text-xxs font-black text-dark uppercase tracking-widest mb-1">
            Przesuń suwak
          </div>
          <div className="text-xxs text-gray-700">Zauważ brak różnicy w ostrości obrazu</div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-600 mt-6 font-medium">
        CDN automatycznie serwuje nowoczesne formaty (WebP/AVIF), które oferują{' '}
        <strong>pixel-perfect quality</strong> przy ułamku wagi JPG.
      </p>
    </div>
  );
};

// 3. PING COUNTER
export const PingCounter = () => {
  const [ping, setPing] = useState(250);
  useEffect(() => {
    const interval = setInterval(() => {
      setPing((prev) => {
        if (prev <= 20) return 20;
        return Math.max(20, prev - Math.floor(Math.random() * 5 + 2));
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      className={`inline-flex items-center gap-3 px-6 py-2 rounded-xl border-2 transition-all duration-500 ${ping <= 50 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
    >
      <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Latency</span>
      <div className="flex items-center gap-1">
        <span
          className={`text-2xl font-black font-mono ${ping <= 50 ? 'text-emerald-600' : 'text-rose-500'}`}
        >
          {ping}ms
        </span>
        {ping > 20 && <ArrowDown size={16} className="text-gray-600 animate-bounce" />}
      </div>
    </div>
  );
};

// 4. GLOBAL TRAFFIC SIMULATION
export const GlobalTrafficSimulation = () => {
  const [mode, setMode] = useState<'direct' | 'cdn'>('direct');
  const [requests, setRequests] = useState<
    { id: number; fromEdgeId: string; duration: number; startTime: number }[]
  >([]);
  const NODES = {
    origin: { id: 'waw', x: 50, y: 35, label: 'Warszawa (Origin)' },
    edges: [
      { id: 'nyc', x: 20, y: 40, label: 'New York' },
      { id: 'syd', x: 85, y: 75, label: 'Sydney' },
      { id: 'tok', x: 80, y: 35, label: 'Tokyo' },
      { id: 'gru', x: 30, y: 75, label: 'São Paulo' },
    ],
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRequests((prev) => {
        const active = prev.filter((r) => now - r.startTime < r.duration + 500);
        if (active.length < 3) {
          const randomEdge = NODES.edges[Math.floor(Math.random() * NODES.edges.length)];
          return [
            ...active,
            {
              id: now,
              fromEdgeId: randomEdge.id,
              duration: mode === 'direct' ? 2000 : 600,
              startTime: now,
            },
          ];
        }
        return active;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [mode]);
  return (
    <div className="bg-[#0B1120] rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-gray-800 h-[550px] flex flex-col not-prose">
      <div className="flex flex-col md:flex-row justify-between items-center relative z-20 mb-8 gap-6 bg-[#0B1120]/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-800">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('direct')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${mode === 'direct' ? 'bg-rose-500/20 border-rose-500 text-white' : 'border-gray-700 text-gray-600 hover:bg-white/5'}`}
          >
            Bez CDN
          </button>
          <button
            onClick={() => setMode('cdn')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${mode === 'cdn' ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'border-gray-700 text-gray-600 hover:bg-white/5'}`}
          >
            Z CDN
          </button>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-gray-700 text-xxs uppercase font-bold tracking-wider">
              Avg Latency
            </div>
            <div
              className={`text-xl font-mono font-bold ${mode === 'direct' ? 'text-rose-500' : 'text-emerald-400'}`}
            >
              {mode === 'direct' ? '~850ms' : '~30ms'}
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex-grow w-full">
        <svg className="absolute inset-0 w-full h-full z-0 overflow-visible">
          {NODES.edges.map((edge) => (
            <line
              key={`b-${edge.id}`}
              x1={`${edge.x}%`}
              y1={`${edge.y}%`}
              x2={`${NODES.origin.x}%`}
              y2={`${NODES.origin.y}%`}
              stroke="#1E293B"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {requests.map((req) => {
            const edge = NODES.edges.find((e) => e.id === req.fromEdgeId)!;
            if (mode === 'direct') {
              return (
                <line
                  key={`l-${req.id}`}
                  x1={`${edge.x - 10}%`}
                  y1={`${edge.y + 5}%`}
                  x2={`${NODES.origin.x}%`}
                  y2={`${NODES.origin.y}%`}
                  stroke="#F43F5E"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  strokeDasharray="5 5"
                  className="animate-dash"
                />
              );
            } else {
              return (
                <line
                  key={`l-${req.id}`}
                  x1={`${edge.x - 10}%`}
                  y1={`${edge.y + 5}%`}
                  x2={`${edge.x}%`}
                  y2={`${edge.y}%`}
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />
              );
            }
          })}
        </svg>
        {NODES.edges.map((edge) => (
          <React.Fragment key={edge.id}>
            <div
              className="absolute flex flex-col items-center z-20"
              style={{ left: `${edge.x}%`, top: `${edge.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 border-[#0B1120] flex items-center justify-center transition-all ${mode === 'cdn' ? 'bg-emerald-500 shadow-[0_0_15px_#10B981]' : 'bg-gray-700'}`}
              >
                <Globe size={12} className="text-white" />
              </div>
              <span className="text-xxs font-bold mt-2 text-gray-700">{edge.label}</span>
            </div>
            <div
              className="absolute z-20 flex flex-col items-center"
              style={{
                left: `${edge.x - 10}%`,
                top: `${edge.y + 5}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </React.Fragment>
        ))}
        <div
          className="absolute flex flex-col items-center z-30"
          style={{
            left: `${NODES.origin.x}%`,
            top: `${NODES.origin.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className={`w-8 h-8 rounded-full border-4 border-[#0B1120] flex items-center justify-center shadow-[0_0_30px_#61B6DE] ${mode === 'direct' && requests.length > 0 ? 'bg-rose-500' : 'bg-primary'}`}
          >
            <Server size={14} className="text-white" />
          </div>
          <span className="text-xxs text-white font-bold bg-[#0B1120]/80 px-2 py-1 rounded mt-2 border border-gray-700">
            Origin (PL)
          </span>
        </div>
        {requests.map((req) => {
          const edge = NODES.edges.find((e) => e.id === req.fromEdgeId)!;
          const target = mode === 'direct' ? NODES.origin : edge;
          return (
            <div
              key={`p-${req.id}`}
              className={`absolute w-3 h-3 rounded-full shadow-lg z-40 ${mode === 'direct' ? 'bg-rose-500 shadow-rose-500' : 'bg-emerald-400 shadow-emerald-400'}`}
              style={
                {
                  left: `${edge.x - 10}%`,
                  top: `${edge.y + 5}%`,
                  '--target-x': `${target.x}%`,
                  '--target-y': `${target.y}%`,
                  animation: `travel ${req.duration}ms linear forwards`,
                } as React.CSSProperties
              }
            ></div>
          );
        })}
      </div>
      <style>{`
                @keyframes travel { from { transform: translate(-50%, -50%); } to { left: var(--target-x); top: var(--target-y); transform: translate(-50%, -50%); opacity: 0; } }
                @keyframes dash { to { stroke-dashoffset: -20; } }
                .animate-dash { animation: dash 1s linear infinite; }
                .animate-spin-slow { animation: spin 60s linear infinite; }
            `}</style>
    </div>
  );
};

// 5. EDGE COMPUTING VISUAL
export const EdgeComputingVisual = () => {
  return (
    <div className="bg-[#0B1120] rounded-3xl p-8 border border-gray-800 relative overflow-hidden h-64 flex items-center justify-center shadow-xl">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#61B6DE 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      <div className="relative flex gap-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative flex flex-col items-center group">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/5">
              <Server size={24} className="text-gray-700" />
              {/* Floating Code Icon */}
              <div
                className="absolute -top-4 bg-primary text-[#0B1120] p-2 rounded-lg shadow-[0_0_20px_rgba(97,182,222,0.4)] animate-bounce"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <FileCode size={16} />
              </div>
              {/* Pulse Ring */}
              <div className="absolute inset-0 border border-primary rounded-2xl animate-ping opacity-20"></div>
            </div>
            <span className="text-xxs font-black text-gray-700 uppercase mt-4 tracking-widest">
              Edge Node 0{i}
            </span>
          </div>
        ))}
      </div>

      {/* Connecting Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
    </div>
  );
};

// 6. CDN QUIZ
interface QuizQuestion {
  q: string;
  weight: number;
}

interface CdnQuizProps {
  content: {
    title: string;
    questions: QuizQuestion[];
    result: {
      high: string;
      low: string;
    };
  };
}

export const CdnQuiz = ({ content }: CdnQuizProps) => {
  const [step, setStep] = useState(0);
  const [score, setSetScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = content.questions;

  const handleAnswer = (yes: boolean) => {
    if (yes) setSetScore((prev) => prev + questions[step].weight);

    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <GlassCard className="max-w-xl mx-auto p-10 text-center animate-fade-in border-emerald-100 bg-white">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingDown size={40} />
        </div>
        <h3 className="text-2xl font-bold text-dark mb-4">
          {content.title} Potrzeby: {score}%
        </h3>
        <p className="text-gray-700 mb-8 leading-relaxed">
          {score > 50 ? content.result.high : content.result.low}
        </p>
        <Button
          onClick={() => {
            setStep(0);
            setSetScore(0);
            setFinished(false);
          }}
          variant="outline"
        >
          Rozpocznij od nowa
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="max-w-xl mx-auto p-10 bg-white border-gray-100 shadow-xl overflow-hidden relative">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / questions.length) * 100}%` }}
        ></div>
      </div>

      <span className="text-xxs font-black text-primary uppercase tracking-[0.2em] mb-4 block">
        Krok {step + 1} z {questions.length}
      </span>
      <h3 className="text-xl md:text-2xl font-bold text-dark mb-10 leading-tight">
        {questions[step].q}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswer(true)}
          aria-label="Odpowiedz: Tak"
          className="group py-4 px-6 rounded-2xl border-2 border-gray-100 hover:border-[#10B981] hover:bg-emerald-50 transition-all text-gray-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} className="text-gray-300 group-hover:text-emerald-500" /> TAK
        </button>
        <button
          onClick={() => handleAnswer(false)}
          aria-label="Odpowiedz: Nie"
          className="group py-4 px-6 rounded-2xl border-2 border-gray-100 hover:border-rose-400 hover:bg-rose-50 transition-all text-gray-600 hover:text-rose-700 font-bold flex items-center justify-center gap-2"
        >
          <XCircle size={20} className="text-gray-300 group-hover:text-rose-500" /> NIE
        </button>
      </div>
    </GlassCard>
  );
};
