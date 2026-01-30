import React from 'react';
import { BarChart3, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuditResult } from '../../../../../services/auditService';

interface CompetitionModuleProps {
  competitor?: AuditResult['competitor'];
  score: number;
}

const CompetitionModule: React.FC<CompetitionModuleProps> = ({ competitor, score }) => {
  if (!competitor) {
    return (
      <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center text-center text-gray-400 text-sm italic group">
        <div className="group-hover:scale-105 transition-transform">
          <Search className="mx-auto mb-2 opacity-20" size={32} />
          Brak konkurenta do analizy porównawczej.
        </div>
      </div>
    );
  }

  return (
    <div className="group p-8 bg-dark text-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative z-10">
        <h4 className="text-xl font-black mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-300" size={24} /> Wynik vs Konkurencja
        </h4>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xxs font-black uppercase tracking-widest text-blue-200">
                Twoja Strona
              </span>
              <span className="text-lg font-black">{score}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xxs font-black uppercase tracking-widest text-blue-200 truncate max-w-[150px]">
                {competitor.url.replace('https://', '')}
              </span>
              <span className="text-lg font-black">{Math.round(competitor.psi_score)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${competitor.psi_score}%` }}
                className="h-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionModule;
