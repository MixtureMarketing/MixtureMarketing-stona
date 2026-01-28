/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  Database,
  HardDrive,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Terminal,
  Activity,
  RotateCcw,
  AlertTriangle,
  Share2,
  MessageSquare,
  Send,
} from 'lucide-react';
import Button from '../../common/Button';
import SectionHeader from '../../common/SectionHeader';

// 1. SYSTEM FLOW ARCHITECTURE
export const SystemFlowArchitecture = () => {
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
          aria-label="Symuluj scenariusz: Trafienie w pamięć podręczną (Cache Hit)"
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${mode === 'hit' && status !== 'idle' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${mode === 'hit' && status !== 'idle' ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}
          ></div>
          Scenariusz A: Cache Hit
        </button>
        <button
          onClick={() => playAnimation('miss')}
          disabled={status !== 'idle'}
          aria-label="Symuluj scenariusz: Brak trafienia w pamięć podręczną (Cache Miss)"
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${mode === 'miss' && status !== 'idle' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${mode === 'miss' && status !== 'idle' ? 'bg-white animate-pulse' : 'bg-rose-500'}`}
          ></div>
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
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <span className="text-xxs font-black uppercase tracking-widest text-gray-600 whitespace-nowrap">
            User
          </span>
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
          <span className="text-xxs font-black uppercase tracking-widest text-dark whitespace-nowrap">
            Backend App
          </span>
        </div>

        <div className="absolute left-[85%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 w-32">
          <div className="relative group">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${status === 'hit' ? 'bg-emerald-500 scale-110 shadow-emerald-200' : status === 'miss' ? 'bg-rose-500 scale-95 opacity-50' : 'bg-red-600'}`}
            >
              <Database size={24} className="text-white" />

              {status === 'hit' && (
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-600 px-2 py-1 rounded md:text-xs text-xxs font-black border border-emerald-200 animate-fade-in-right whitespace-nowrap z-20">
                  HIT! 0.5ms
                </div>
              )}
              {status === 'miss' && (
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 bg-rose-100 text-rose-600 px-2 py-1 rounded md:text-xs text-xxs font-black border border-rose-200 animate-fade-in-right whitespace-nowrap z-20">
                  MISS!
                </div>
              )}
            </div>
          </div>
          <span
            className={`text-xxs font-black uppercase tracking-widest transition-colors whitespace-nowrap ${status === 'hit' ? 'text-emerald-500' : 'text-red-600'}`}
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
            {status === 'fetching' && (
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-black border border-orange-200 whitespace-nowrap z-20">
                ~50ms
              </div>
            )}
          </div>
          <span className="text-xxs font-black uppercase tracking-widest text-gray-600 whitespace-nowrap">
            SQL DB
          </span>
        </div>

        <div className="absolute inset-0 pointer-events-none z-0">
          {status === 'checking' && (
            <div className="absolute w-4 h-4 bg-primary rounded-full animate-user-to-app shadow-[0_0_10px_#61B6DE]"></div>
          )}

          {(status === 'hit' || status === 'miss') && (
            <div className="absolute w-4 h-4 bg-primary rounded-full animate-app-to-redis shadow-[0_0_10px_#61B6DE]"></div>
          )}

          {status === 'hit' && (
            <div className="absolute w-4 h-4 bg-emerald-400 rounded-full animate-redis-to-app shadow-[0_0_15px_#10B981] delay-600"></div>
          )}

          {status === 'fetching' && (
            <div className="absolute w-4 h-4 bg-orange-400 rounded-full animate-app-to-sql shadow-[0_0_10px_#F97316]"></div>
          )}

          {status === 'fetching' && (
            <div className="absolute w-4 h-4 bg-orange-400 rounded-full animate-sql-to-app shadow-[0_0_10px_#F97316] delay-600"></div>
          )}

          {status === 'saving' && (
            <div className="absolute w-4 h-4 bg-orange-400 rounded-full animate-app-to-redis shadow-[0_0_10px_#F97316]"></div>
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

      <div className="mt-8 flex justify-center gap-8 text-[11px] font-bold uppercase tracking-wider text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div> Zapytanie
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Cache
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div> SQL
        </div>
      </div>

      <style>{`
                @keyframes user-to-app { from { left: 15%; top: 50%; opacity: 0; transform: scale(0.5); } 20% { opacity: 1; transform: scale(1); } 90% { opacity: 1; } to { left: 50%; top: 50%; opacity: 0; transform: scale(0.8); } }
                @keyframes app-to-user { from { left: 50%; top: 50%; opacity: 0; transform: scale(1); } 20% { opacity: 1; } 90% { opacity: 1; } to { left: 15%; top: 50%; opacity: 0; transform: scale(0.5); } }
                
                @keyframes app-to-redis { from { left: 50%; top: 50%; opacity: 0; } 20% { opacity: 1; } 90% { opacity: 1; } to { left: 85%; top: 25%; opacity: 0; } }
                @keyframes redis-to-app { from { left: 85%; top: 25%; opacity: 0; } 20% { opacity: 1; } 90% { opacity: 1; } to { left: 50%; top: 50%; opacity: 0; } }
                
                @keyframes app-to-sql { from { left: 50%; top: 50%; opacity: 0; } 20% { opacity: 1; } 90% { opacity: 1; } to { left: 85%; top: 75%; opacity: 0; } }
                @keyframes sql-to-app { from { left: 85%; top: 75%; opacity: 0; } 20% { opacity: 1; } 90% { opacity: 1; } to { left: 50%; top: 50%; opacity: 0; } }

                .animate-user-to-app { animation: user-to-app 0.6s ease-in forwards; transform: translate(-50%, -50%); }
                .animate-app-to-user { animation: app-to-user 0.6s ease-out forwards; transform: translate(-50%, -50%); }
                .animate-app-to-redis { animation: app-to-redis 0.6s ease-in forwards; transform: translate(-50%, -50%); }
                .animate-redis-to-app { animation: redis-to-app 0.6s ease-out forwards; transform: translate(-50%, -50%); }
                .animate-app-to-sql { animation: app-to-sql 0.6s ease-in forwards; transform: translate(-50%, -50%); }
                .animate-sql-to-app { animation: sql-to-app 0.6s ease-out forwards; transform: translate(-50%, -50%); }
                
                .animate-fade-in-right { animation: fadeInRight 0.3s ease-out forwards; }
                @keyframes fadeInRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
             `}</style>
    </div>
  );
};

// 2. SPEED RACE DEMO
export const SpeedRaceDemo = () => {
  const [racing, setRacing] = useState(false);
  const [redisProgress, setRedisProgress] = useState(0);
  const [sqlProgress, setSqlProgress] = useState(0);
  const [redisTime, setRedisTime] = useState(0);
  const [sqlTime, setSqlTime] = useState(0);

  const startRace = () => {
    setRacing(true);
    setRedisProgress(0);
    setSqlProgress(0);
    setRedisTime(0);
    setSqlTime(0);

    let rProgress = 0;
    const rInterval = setInterval(() => {
      rProgress += 10;
      if (rProgress >= 100) {
        rProgress = 100;
        clearInterval(rInterval);
        setRedisTime(0.5);
      }
      setRedisProgress(rProgress);
    }, 20);

    let sProgress = 0;
    const sInterval = setInterval(() => {
      sProgress += 1;
      if (sProgress >= 100) {
        sProgress = 100;
        clearInterval(sInterval);
        setSqlTime(58);
      }
      setSqlProgress(sProgress);
      setSqlTime((prev) => Math.min(prev + 0.8, 58));
    }, 50);
  };

  return (
    <div className="bg-[#0F172A] rounded-2xl p-8 shadow-2xl relative overflow-hidden text-white border border-gray-800">
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Symulacja Czasu Odpowiedzi</h3>
          <p className="text-gray-600 text-sm">Porównanie czasu pobrania 10,000 rekordów</p>
        </div>
        <Button
          onClick={startRace}
          disabled={racing && sqlProgress < 100}
          aria-label="Uruchom symulację prędkości: RAM (Redis) kontra Dysk (Standardowy SQL)"
          className="bg-primary hover:bg-secondary text-white border-none shadow-[0_0_20px_rgba(97,182,222,0.4)]"
        >
          {racing && sqlProgress < 100 ? (
            <RefreshCw className="animate-spin mr-2" size={18} />
          ) : (
            <Play className="mr-2" size={18} fill="currentColor" />
          )}
          {racing && sqlProgress < 100 ? 'Testowanie...' : 'Rozpocznij Test'}
        </Button>
      </div>

      <div className="space-y-8 relative z-10">
        <div>
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-[#EF4444] flex items-center gap-2">
              <Database size={14} /> Redis (In-Memory)
            </span>
            <span className="font-mono text-[#EF4444]">
              {redisTime > 0 ? `${redisTime} ms` : '0 ms'}
            </span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all duration-75 ease-out relative"
              style={{ width: `${redisProgress}%` }}
            >
              {redisProgress === 100 && (
                <div className="absolute right-0 top-0 h-full w-2 bg-white animate-ping"></div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-gray-600 flex items-center gap-2">
              <HardDrive size={14} /> Standard SQL (SSD)
            </span>
            <span className="font-mono text-gray-600">{sqlTime.toFixed(1)} ms</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500 transition-all duration-75 ease-linear"
              style={{ width: `${sqlProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800 text-center relative z-10">
        {sqlProgress === 100 && (
          <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-bold animate-fade-in">
            🚀 Redis okazał się {Math.round(sqlTime / redisTime)}x szybszy!
          </div>
        )}
      </div>
    </div>
  );
};

// 3. REDIS TERMINAL
export const RedisTerminal = () => {
  const [lines, setLines] = useState([
    { type: 'info', text: 'Redis CLI v7.0.5' },
    { type: 'info', text: 'Podłączono do 127.0.0.1:6379' },
    { type: 'info', text: "Wpisz 'SET klucz wartosc' lub 'GET klucz' aby przetestować." },
  ]);
  const [input, setInput] = useState('');
  const [db, setDb] = useState<{ [key: string]: string }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const parts = cmd.split(/\s+/);
    const op = parts[0].toUpperCase();
    const newLines = [...lines, { type: 'input', text: `> ${cmd}` }];

    let response = '';

    if (op === 'SET') {
      if (parts.length >= 3) {
        const key = parts[1];
        const val = parts.slice(2).join(' ');
        setDb((prev) => ({ ...prev, [key]: val }));
        response = 'OK';
      } else {
        response = "(error) ERR wrong number of arguments for 'set' command";
      }
    } else if (op === 'GET') {
      if (parts.length === 2) {
        const val = db[parts[1]];
        response = val ? `"${val}"` : '(nil)';
      } else {
        response = "(error) ERR wrong number of arguments for 'get' command";
      }
    } else if (op === 'KEYS') {
      const keys = Object.keys(db);
      response = keys.length ? keys.map((k) => `${k}`).join('\n') : '(empty list or set)';
    } else if (op === 'DEL' && parts.length === 2) {
      const key = parts[1];
      if (db[key]) {
        const newDb = { ...db };
        delete newDb[key];
        setDb(newDb);
        response = '(integer) 1';
      } else {
        response = '(integer) 0';
      }
    } else if (op === 'FLUSHALL') {
      setDb({});
      response = 'OK';
    } else {
      response = `(error) ERR unknown command '${parts[0]}'
`;
    }

    newLines.push({ type: 'output', text: response });
    setLines(newLines);
    setInput('');
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-800 font-mono text-sm overflow-hidden h-[400px] flex flex-col">
      <div className="bg-[#252526] px-4 py-2 border-b border-[#333] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <span className="text-gray-600 text-xs ml-2">redis-cli</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto space-y-2 scroll-smooth"
        onClick={() => document.getElementById('cli-input')?.focus()}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${line.type === 'input' ? 'text-white font-bold' : line.type === 'info' ? 'text-gray-700' : 'text-[#A6E22E]'}`}
          >
            <pre className="whitespace-pre-wrap font-mono">{line.text}</pre>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="p-4 bg-[#252526] border-t border-[#333] flex gap-2">
        <span className="text-primary font-bold">127.0.0.1:6379&gt;</span>
        <input
          id="cli-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-white font-mono"
          autoComplete="off"
          aria-label="Wpisz komendę Redis (np. SET lub GET)"
          placeholder="Wpisz komendę..."
        />
      </form>
    </div>
  );
};

// 4. SENTINEL DEMO
const SentinelNode = ({
  id,
  label,
  isMaster,
  isDown,
}: {
  id: number;
  label: string;
  isMaster: boolean;
  isDown: boolean;
}) => (
  <div
    className={`
        relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500
        ${isDown ? 'bg-red-100 border-red-500 opacity-50' : isMaster ? 'bg-emerald-50 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-blue-50 border-blue-200'}
     `}
  >
    <Server
      size={32}
      className={isDown ? 'text-red-500' : isMaster ? 'text-emerald-600' : 'text-blue-400'}
    />
    <span className="text-xs font-bold mt-2 text-gray-600">{label}</span>
    {isMaster && !isDown && (
      <div className="absolute -top-3 bg-emerald-500 text-white text-xxs px-2 py-0.5 rounded-full font-bold uppercase">
        Master
      </div>
    )}
    {isDown && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
        <XCircle className="text-red-600" size={40} />
      </div>
    )}
  </div>
);

export const SentinelDemo = () => {
  const [masterAlive, setMasterAlive] = useState(true);
  const [activeMaster, setActiveMaster] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] Cluster Healthy. Master: Node-0']);

  const killMaster = () => {
    if (!masterAlive) return;
    setMasterAlive(false);
    addLog('[Alert] Master Node-0 Down!');
    addLog('[Sentinel] Detecting failure...');

    setTimeout(() => {
      addLog('[Sentinel] Quorum reached. Failover started.');
      setTimeout(() => {
        const newMaster = 1;
        setActiveMaster(newMaster);
        addLog(`[Sentinel] Elected Node-${newMaster} as new Master.`);
        addLog(`[System] Reconfiguration complete.`);
      }, 1500);
    }, 1000);
  };

  const reset = () => {
    setMasterAlive(true);
    setActiveMaster(0);
    setLogs(['[System] Cluster Reset. Master: Node-0']);
  };

  const addLog = (msg: string) => setLogs((prev) => [...prev.slice(-4), msg]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4">
          <Button
            onClick={killMaster}
            disabled={!masterAlive}
            variant="outline"
            aria-label="Symuluj awarię głównego węzła (Master) serwera Redis"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <AlertTriangle size={16} className="mr-2" /> Symuluj Awarię
          </Button>
          <Button
            onClick={reset}
            disabled={masterAlive}
            variant="outline"
            aria-label="Resetuj klaster Redis do stanu początkowego"
          >
            <RotateCcw size={16} className="mr-2" /> Reset
          </Button>
        </div>
        <div className="text-xs font-mono text-gray-600">Redis Sentinel Mode</div>
      </div>

      <div className="flex justify-center gap-8 md:gap-16 mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>

        <SentinelNode
          id={0}
          label="Node-0"
          isMaster={activeMaster === 0}
          isDown={!masterAlive && activeMaster !== 0}
        />
        <SentinelNode id={1} label="Node-1" isMaster={activeMaster === 1} isDown={false} />
        <SentinelNode id={2} label="Node-2" isMaster={activeMaster === 2} isDown={false} />
      </div>

      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. PUB/SUB DEMO
export const PubSubDemo = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    const newMsg = input;
    setInput('');
    setSending(true);

    setTimeout(() => {
      setMessages((prev) => [newMsg, ...prev.slice(0, 5)]);
      setSending(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Publisher Panel (Left) */}
      <div className="flex-1 p-8 bg-gray-50 border-r border-gray-100 flex flex-col">
        <div className="flex items-center gap-3 mb-6 text-dark">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <Share2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Publisher</h3>
            <p className="text-xs text-gray-600">Nadawca wiadomości</p>
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center">
          <form onSubmit={publish} className="relative">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
              Payload (Channel: 'news')
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Wpisz wiadomość np. 'Promocja!'"
              aria-label="Wpisz wiadomość do opublikowania w kanale news"
              className="w-full px-4 py-4 rounded-xl border border-gray-200 mb-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white shadow-sm transition-all"
            />
            <Button type="submit" className="w-full justify-center py-4" disabled={!input}>
              {sending ? 'Wysyłanie...' : 'Opublikuj (Publish)'} <Send size={16} className="ml-2" />
            </Button>
          </form>
        </div>
      </div>

      {/* Subscriber Panel (Right) */}
      <div className="flex-1 p-8 bg-[#1e293b] text-white flex flex-col relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-white/10 rounded-lg border border-white/10">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Subscriber</h3>
            <p className="text-xs text-gray-600">Odbiorca (Real-time)</p>
          </div>
        </div>

        <div className="flex-grow bg-[#0F172A]/50 rounded-xl p-4 border border-white/5 relative overflow-y-auto h-64 shadow-inner">
          {messages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 gap-2 opacity-50">
              <Activity size={32} />
              <span className="text-sm">Nasłuchiwanie kanału 'news'...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-3 items-start animate-fade-in-up">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xxs font-bold text-white shadow-lg shadow-emerald-500/20 shrink-0 mt-1">
                    MSG
                  </div>
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 text-sm backdrop-blur-sm">
                    {msg}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
