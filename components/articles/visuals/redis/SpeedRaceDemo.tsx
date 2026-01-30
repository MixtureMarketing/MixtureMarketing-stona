import React, { useState } from 'react';
import { Play, RefreshCw, Database, HardDrive } from 'lucide-react';
import Button from '../../../common/Button';

const SpeedRaceDemo = () => {
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
              className="h-full bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all duration-75 ease-out"
              style={{ width: `${redisProgress}%` }}
            ></div>
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
            <div className="h-full bg-gray-500" style={{ width: `${sqlProgress}%` }}></div>
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

export default SpeedRaceDemo;
