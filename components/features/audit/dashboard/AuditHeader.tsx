import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AuditHeaderProps {
  url: string;
  onReset: () => void;
}

const AuditHeader: React.FC<AuditHeaderProps> = ({ url, onReset }) => (
  <div className="bg-dark text-white p-6 md:p-8 flex justify-between items-center">
    <div>
      <h2 className="text-xl md:text-2xl font-bold italic">
        Czy Twoja strona zarabia, czy tylko istnieje?
      </h2>
      <p className="text-blue-200 text-sm">Analiza dla: {url}</p>
    </div>
    <button
      onClick={onReset}
      className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
    >
      <RefreshCw size={20} />
    </button>
  </div>
);

export default AuditHeader;
