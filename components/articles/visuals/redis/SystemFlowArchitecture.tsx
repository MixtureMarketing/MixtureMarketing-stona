import React, { useState } from 'react';
import { Server, Database, HardDrive } from 'lucide-react';

const SystemFlowArchitecture = () => {
  const [mode, setMode] = useState<'hit' | 'miss'>('hit');
  const [status, setStatus] = useState<
    'idle' | 'checking' | 'hit' | 'miss' | 'fetching' | 'saving' | 'delivering'
  >('idle');

  const playAnimation = (newMode: 'hit' | 'miss') => {
    setMode(newMode);
    setStatus('checking');
    setTimeout(() => {
      if (newMode === 'hit') {
        setStatus('hit');
        setTimeout(() => setStatus('delivering'), 1200);
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('miss');
        setTimeout(() => setStatus('fetching'), 1200);
        setTimeout(() => setStatus('saving'), 2400);
        setTimeout(() => setStatus('delivering'), 3000);
        setTimeout(() => setStatus('idle'), 3800);
      }
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#213261 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>
      <div className="flex flex-wrap justify-center gap-4 mb-10 relative z-10">
        <button
          onClick={() => playAnimation('hit')}
          disabled={status !== 'idle'}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${mode === 'hit' && status !== 'idle' ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${mode === 'hit' && status !== 'idle' ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}
          ></div>{' '}
          Scenariusz A: Cache Hit
        </button>
        <button
          onClick={() => playAnimation('miss')}
          disabled={status !== 'idle'}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${mode === 'miss' && status !== 'idle' ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${mode === 'miss' && status !== 'idle' ? 'bg-white animate-pulse' : 'bg-rose-500'}`}
          ></div>{' '}
          Scenariusz B: Cache Miss
        </button>
      </div>

      <div className="relative h-[400px] w-full bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <line
            x1="15%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="#E5E7EB"
            strokeWidth="3"
            strokeDasharray="8 8"
          />
          <line
            x1="50%"
            y1="50%"
            x2="85%"
            y2="25%"
            stroke="#E5E7EB"
            strokeWidth="3"
            strokeDasharray="8 8"
          />
          <line
            x1="50%"
            y1="50%"
            x2="85%"
            y2="75%"
            stroke="#E5E7EB"
            strokeWidth="3"
            strokeDasharray="8 8"
          />
        </svg>

        <div className="absolute left-[15%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 w-24">
          <div
            className={`w-16 h-16 bg-white border-2 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${status === 'delivering' ? 'border-emerald-400 scale-110 shadow-emerald-100' : 'border-gray-100'}`}
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
              <Server size={24} />
            </div>
          </div>
          <span className="text-xxs font-black uppercase tracking-widest text-gray-600">User</span>
        </div>

        <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 w-32">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl text-white transition-all duration-500 relative ${status !== 'idle' ? 'bg-secondary scale-105' : 'bg-dark'}`}
          >
            <Server size={32} className={status !== 'idle' ? 'animate-pulse' : ''} />
            {status !== 'idle' && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-dark px-3 py-1.5 rounded-lg shadow-xl border border-gray-100 text-xxs font-black whitespace-nowrap animate-bounce uppercase z-20">
                {status === 'checking'
                  ? 'Sprawdzam Cache...'
                  : status === 'hit'
                    ? 'Cache Hit!'
                    : status === 'miss'
                      ? 'Cache Miss...'
                      : status === 'fetching'
                        ? 'Pobieram z SQL'
                        : status === 'saving'
                          ? 'Zapisuję Cache'
                          : 'Wysyłam'}
              </div>
            )}
          </div>
          <span className="text-xxs font-black uppercase tracking-widest text-dark">
            Backend App
          </span>
        </div>

        <div className="absolute left-[85%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 w-32">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${status === 'hit' ? 'bg-emerald-500 scale-110' : status === 'miss' ? 'bg-rose-500 scale-95 opacity-50' : 'bg-red-600'}`}
          >
            <Database size={24} className="text-white" />
          </div>
          <span
            className={`text-xxs font-black uppercase tracking-widest whitespace-nowrap ${status === 'hit' ? 'text-emerald-500' : 'text-red-600'}`}
          >
            Redis (RAM)
          </span>
        </div>

        <div className="absolute left-[85%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 w-32">
          <div
            className={`w-16 h-16 bg-white border-2 rounded-2xl flex items-center justify-center transition-all duration-500 ${status === 'fetching' ? 'border-orange-400 bg-orange-50 scale-110 shadow-lg' : 'border-gray-200 opacity-60'}`}
          >
            <HardDrive
              size={24}
              className={status === 'fetching' ? 'text-orange-500' : 'text-gray-300'}
            />
          </div>
          <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
            SQL DB
          </span>
        </div>

        <div className="absolute inset-0 pointer-events-none z-0">
          {status === 'checking' && (
            <div className="absolute w-4 h-4 bg-primary rounded-full animate-user-to-app"></div>
          )}
          {(status === 'hit' || status === 'miss') && (
            <div className="absolute w-4 h-4 bg-primary rounded-full animate-app-to-redis"></div>
          )}
          {status === 'hit' && (
            <div className="absolute w-4 h-4 bg-emerald-400 rounded-full animate-redis-to-app delay-600"></div>
          )}
          {status === 'fetching' && (
            <div className="absolute w-4 h-4 bg-orange-400 rounded-full animate-app-to-sql"></div>
          )}
          {status === 'fetching' && (
            <div className="absolute w-4 h-4 bg-orange-400 rounded-full animate-sql-to-app delay-600"></div>
          )}
          {status === 'saving' && (
            <div className="absolute w-4 h-4 bg-orange-400 rounded-full animate-app-to-redis"></div>
          )}
          {status === 'delivering' && (
            <div
              className={`absolute w-5 h-5 rounded-full animate-app-to-user flex items-center justify-center ${mode === 'hit' ? 'bg-emerald-500 shadow-[0_0_20px_#10B981]' : 'bg-orange-500 shadow-[0_0_20px_#F97316]'}`}
            >
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes user-to-app { from { left: 15%; top: 50%; opacity: 0; } 20% { opacity: 1; } to { left: 50%; top: 50%; opacity: 0; } }
        @keyframes app-to-user { from { left: 50%; top: 50%; opacity: 0; } 20% { opacity: 1; } to { left: 15%; top: 50%; opacity: 0; } }
        @keyframes app-to-redis { from { left: 50%; top: 50%; opacity: 0; } 20% { opacity: 1; } to { left: 85%; top: 25%; opacity: 0; } }
        @keyframes redis-to-app { from { left: 85%; top: 25%; opacity: 0; } 20% { opacity: 1; } to { left: 50%; top: 50%; opacity: 0; } }
        @keyframes app-to-sql { from { left: 50%; top: 50%; opacity: 0; } 20% { opacity: 1; } to { left: 85%; top: 75%; opacity: 0; } }
        @keyframes sql-to-app { from { left: 85%; top: 75%; opacity: 0; } 20% { opacity: 1; } to { left: 50%; top: 50%; opacity: 0; } }
        .animate-user-to-app { animation: user-to-app 0.6s ease-in forwards; transform: translate(-50%, -50%); }
        .animate-app-to-user { animation: app-to-user 0.6s ease-out forwards; transform: translate(-50%, -50%); }
        .animate-app-to-redis { animation: app-to-redis 0.6s ease-in forwards; transform: translate(-50%, -50%); }
        .animate-redis-to-app { animation: redis-to-app 0.6s ease-out forwards; transform: translate(-50%, -50%); }
        .animate-app-to-sql { animation: app-to-sql 0.6s ease-in forwards; transform: translate(-50%, -50%); }
        .animate-sql-to-app { animation: sql-to-app 0.6s ease-out forwards; transform: translate(-50%, -50%); }
      `}</style>
    </div>
  );
};

export default SystemFlowArchitecture;
