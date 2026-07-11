import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AuditHeaderProps {
  url: string;
  onReset: () => void;
}

const AuditHeader: React.FC<AuditHeaderProps> = ({ url, onReset }) => {
  const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <div className="bg-dark text-white px-6 md:px-8 py-5 flex justify-between items-center">
      <div>
        <h2 className="text-base md:text-lg font-semibold tracking-tight">
          Audyt 360 — raport gotowy
        </h2>
        <div className="flex items-center gap-2 mt-1 text-[13px] text-blue-200/80 tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(0,200,83,0.18)]" />
          {host} · analiza mobilna
        </div>
      </div>
      <button
        onClick={onReset}
        aria-label="Nowy audyt"
        className="w-9 h-9 grid place-items-center rounded-[10px] border border-white/15 text-white/60 hover:bg-white/10 hover:text-white transition-colors active:scale-[0.96]"
      >
        <RefreshCw size={18} />
      </button>
    </div>
  );
};

export default AuditHeader;
