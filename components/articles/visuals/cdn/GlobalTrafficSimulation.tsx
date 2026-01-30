import React, { useState, useEffect } from 'react';
import { Globe, Server } from 'lucide-react';

const NODES = {
  origin: { id: 'waw', x: 50, y: 35, label: 'Warszawa (Origin)' },
  edges: [
    { id: 'nyc', x: 20, y: 40, label: 'New York' },
    { id: 'syd', x: 85, y: 75, label: 'Sydney' },
    { id: 'tok', x: 80, y: 35, label: 'Tokyo' },
    { id: 'gru', x: 30, y: 75, label: 'São Paulo' },
  ],
};

const GlobalTrafficSimulation = () => {
  const [mode, setMode] = useState<'direct' | 'cdn'>('direct');
  const [requests, setRequests] = useState<
    { id: number; fromEdgeId: string; duration: number; startTime: number }[]
  >([]);

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
            return mode === 'direct' ? (
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
            ) : (
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
      `}</style>
    </div>
  );
};

export default GlobalTrafficSimulation;
