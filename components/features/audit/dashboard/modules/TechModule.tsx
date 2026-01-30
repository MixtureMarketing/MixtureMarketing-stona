import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface TechModuleProps {
  cms: string[];
  ssl: boolean;
  accessibility?: number;
  socialCount: number;
}

const TechModule: React.FC<TechModuleProps> = ({ cms, ssl, accessibility, socialCount }) => {
  return (
    <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-100 transition-colors"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
        </div>
        <h4 className="text-xl font-black text-dark mb-4">Technologia</h4>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {cms?.map((c, i) => (
              <span
                key={i}
                className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded-md"
              >
                {c}
              </span>
            ))}
            {ssl && (
              <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                SSL OK
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100/50 text-center">
              <div className="text-xxxs text-gray-400 font-black uppercase tracking-widest mb-1">
                Dostępność
              </div>
              <div className="text-sm font-black text-dark">
                {accessibility ? `${Math.round(accessibility)}/100` : 'Brak danych'}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100/50 text-center">
              <div className="text-xxxs text-gray-400 font-black uppercase tracking-widest mb-1">
                Social Media
              </div>
              <div className="text-sm font-black text-dark">{socialCount} linki</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechModule;
