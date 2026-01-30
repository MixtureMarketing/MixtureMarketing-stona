import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, MousePointer2 } from 'lucide-react';

const InpSimulator = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [mode, setMode] = useState<'good' | 'bad'>('bad');

  const handleInteraction = () => {
    setStatus('loading');
    setTimeout(
      () => {
        setStatus('done');
        setTimeout(() => setStatus('idle'), 1500);
      },
      mode === 'bad' ? 800 : 50,
    );
  };

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl border border-gray-800 text-white overflow-hidden relative">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setMode('bad')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'bad' ? 'bg-rose-500' : 'text-gray-600'}`}
          >
            Wysokie INP (Złe)
          </button>
          <button
            onClick={() => setMode('good')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'good' ? 'bg-emerald-500' : 'text-gray-600'}`}
          >
            Niskie INP (Dobre)
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-12 bg-gray-900 rounded-2xl border border-white/5">
        <button
          onClick={handleInteraction}
          disabled={status !== 'idle'}
          className={`px-10 py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center gap-3 ${status === 'loading' ? 'bg-gray-700' : status === 'done' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}
        >
          {status === 'loading' ? (
            <RefreshCw className="animate-spin" />
          ) : status === 'done' ? (
            <CheckCircle2 />
          ) : (
            <MousePointer2 />
          )}
          {status === 'loading'
            ? 'Przetwarzanie...'
            : status === 'done'
              ? 'Sukces!'
              : 'Kliknij mnie'}
        </button>
        <div className="mt-8 text-center min-h-[40px]">
          {status === 'loading' && (
            <p className="text-xs text-rose-400 animate-pulse font-mono">
              Główny wątek zablokowany przez 2MB JavaScript...
            </p>
          )}
          {status === 'done' && (
            <p
              className={`text-xs font-bold uppercase tracking-widest ${mode === 'bad' ? 'text-rose-500' : 'text-emerald-400'}`}
            >
              Reakcja po: {mode === 'bad' ? '800ms' : '50ms'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InpSimulator;
