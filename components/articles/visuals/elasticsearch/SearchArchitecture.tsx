import React from 'react';
import { Database, Shuffle, Zap } from 'lucide-react';

const SearchArchitecture = () => {
  return (
    <div className="my-24 p-8 md:p-12 bg-[#0B1120] rounded-[3rem] border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-5"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 items-center w-full max-w-4xl">
          <div className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 group-hover:border-secondary transition-all">
              <Database size={32} />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white mb-1">Baza Główna</div>
              <div className="text-xxxs text-gray-600 uppercase tracking-widest font-mono">
                PostgreSQL / SQL
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 relative">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent absolute top-10 hidden md:block"></div>
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-2xl relative z-10">
              <Shuffle size={20} className="text-white" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-primary mb-1">Synchronizator</div>
              <div className="text-xxxs text-gray-600 uppercase tracking-widest font-mono">
                Real-time Pipeline
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 bg-secondary/20 rounded-2xl border-2 border-secondary flex items-center justify-center text-primary shadow-[0_0_30px_rgba(63,61,145,0.3)] group-hover:scale-105 transition-all">
              <Zap size={32} fill="currentColor" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white mb-1">Elasticsearch</div>
              <div className="text-xxxs text-primary uppercase tracking-widest font-mono font-black">
                Search Engine
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 max-w-2xl">
          <p className="text-xs text-gray-400 leading-relaxed text-center m-0">
            <strong>Elasticsearch nie zastępuje Twojej bazy danych.</strong> On z nią współpracuje.
            Główna baza trzyma stany magazynowe i ceny, a Elastic trzyma "kopię" tych danych
            zoptymalizowaną wyłącznie pod błyskawiczne wyszukiwanie i filtrowanie.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchArchitecture;
