import React, { useState } from 'react';
import { Cpu, MousePointer2 } from 'lucide-react';
import Button from '../../../common/Button';

const MainThreadVisualizer = () => {
  const [isBusy, setIsBusy] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);

  const runHeavyScript = () => {
    setIsBusy(true);
    setQueue(['Parsing JS...', 'Executing Tracker...', 'Rendering Chatbot...']);
    setTimeout(() => {
      setIsBusy(false);
      setQueue([]);
    }, 3000);
  };

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl border border-gray-800 text-white not-prose">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-bold text-lg">Symulator Głównego Wątku</h3>
          <p className="text-gray-600 text-xs uppercase tracking-widest">Main Thread Status</p>
        </div>
        <Button
          onClick={runHeavyScript}
          disabled={isBusy}
          className="bg-rose-500 hover:bg-rose-600 border-none shadow-lg shadow-rose-500/20"
        >
          Wstrzyknij ciężki skrypt
        </Button>
      </div>
      <div className="relative bg-gray-900 rounded-2xl p-6 border border-white/5 min-h-[200px] flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isBusy ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
          >
            <Cpu size={24} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">
              Przeglądarka: {isBusy ? 'PRZECIĄŻONA' : 'GOTOWA'}
            </div>
            <div className="text-xxs text-gray-700 uppercase font-black">
              {isBusy ? 'Mielenie JavaScriptu...' : 'Oczekiwanie na akcję'}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {isBusy ? (
            queue.map((item, i) => (
              <div
                key={i}
                className="h-8 bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center px-4 animate-fade-in-right"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <span className="text-xxs font-mono text-rose-400">{item}</span>
              </div>
            ))
          ) : (
            <div className="h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center px-4 text-xxs font-mono text-emerald-400 italic">
              Wątek wolny. Reakcja na kliknięcie &lt; 50ms.
            </div>
          )}
        </div>
        {isBusy && (
          <div className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col items-center animate-bounce">
            <MousePointer2 className="text-white" />
            <span className="text-xxxs font-bold uppercase mt-1 text-rose-500">
              Kliknięcie zablokowane
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainThreadVisualizer;
