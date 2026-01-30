import React, { useState, useEffect } from 'react';
import { Search, XCircle, CheckCircle2 } from 'lucide-react';

const ElasticHeroSearch = () => {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const target = 'Samung';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < target.length) {
        setQuery(target.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex flex-col items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
      <div className="relative z-10 w-full max-w-2xl space-y-12">
        <div className="bg-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border-b-4 border-gray-200">
          <Search className="text-gray-400" size={24} />
          <div className="flex-1 text-2xl font-bold text-dark flex items-center">
            {query}
            <span className="w-1 h-8 bg-secondary ml-1 animate-pulse"></span>
          </div>
          <div className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest">
            Szukaj
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-48">
          <div
            className={`p-6 rounded-2xl border transition-all duration-500 ${!isTyping ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5 opacity-40'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xxs font-black uppercase tracking-widest text-gray-500">
                Zwykła Baza (SQL)
              </span>
              {!isTyping && <XCircle className="text-red-500" size={20} />}
            </div>
            {!isTyping ? (
              <div className="animate-fade-in">
                <p className="text-sm font-bold text-white mb-2 italic">
                  "Nie znaleziono produktów."
                </p>
                <p className="text-xxs text-gray-500 leading-relaxed">
                  SQL szuka dokładnie: <code>WHERE name LIKE '%Samung%'</code>. Brak elastyczności.
                </p>
              </div>
            ) : (
              <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse"></div>
            )}
          </div>
          <div
            className={`p-6 rounded-2xl border transition-all duration-500 ${!isTyping ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-105' : 'bg-white/5 border-white/5 opacity-40'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xxs font-black uppercase tracking-widest text-[#00ED64]">
                Elasticsearch
              </span>
              {!isTyping && <CheckCircle2 className="text-[#00ED64]" size={20} />}
            </div>
            {!isTyping ? (
              <div className="animate-fade-in">
                <p className="text-sm font-bold text-white mb-2">
                  Czy chodziło Ci o:{' '}
                  <span className="text-[#00ED64] underline underline-offset-4 decoration-2">
                    Samsung
                  </span>
                  ?
                </p>
                <p className="text-xs text-[#00ED64] font-black mb-2">(Znaleziono 143 produkty)</p>
                <p className="text-xxs text-gray-500 leading-relaxed">
                  Fuzzy Matching automatycznie koryguje literówki klienta.
                </p>
              </div>
            ) : (
              <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 text-xxs font-bold text-gray-600 uppercase tracking-[0.2em] animate-pulse">
        Klient nie kupi tego, czego nie może znaleźć.
      </div>
    </div>
  );
};

export default ElasticHeroSearch;
