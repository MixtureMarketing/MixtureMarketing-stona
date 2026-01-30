import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

const IcebergDiagram = () => {
  return (
    <div className="bg-gradient-to-b from-[#E0EFFF] to-secondary rounded-3xl p-12 overflow-hidden shadow-2xl relative min-h-[400px] flex flex-col items-center justify-center text-white not-prose">
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white opacity-20 border-t border-dashed border-white/50"></div>
      <div className="relative z-10 flex flex-col items-center mb-24">
        <div className="bg-white/90 backdrop-blur-md text-dark px-6 py-2 rounded-full font-black text-sm shadow-xl flex items-center gap-2">
          <Zap size={16} className="text-emerald-500" /> Lab Data: 100/100
        </div>
        <div className="mt-4 text-xxs uppercase font-black tracking-[0.2em] opacity-60 text-center">
          To co widzisz na swoim <br />
          mocnym komputerze
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-rose-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-xl flex items-center gap-2">
          <AlertTriangle size={16} /> Field Data: 45/100
        </div>
        <div className="mt-4 text-xxs uppercase font-black tracking-[0.2em] text-blue-100 text-center">
          Rzeczywistość Twoich klientów <br />
          (Słabe WiFi, stare telefony)
        </div>
      </div>
    </div>
  );
};

export default IcebergDiagram;
