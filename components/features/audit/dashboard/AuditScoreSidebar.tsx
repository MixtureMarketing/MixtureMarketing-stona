import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface AuditScoreSidebarProps {
  score: number;
  screenshot?: string;
}

const AuditScoreSidebar: React.FC<AuditScoreSidebarProps> = ({ score, screenshot }) => {
  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Stan Wzorowy - Świetna robota!';
    if (s >= 50) return 'Stan Ostrzegawczy - Tracisz potencjał.';
    return 'Stan Krytyczny - Wymaga natychmiastowej naprawy.';
  };

  return (
    <div className="lg:col-span-3 bg-[#F9FAFB] p-8 border-r border-gray-100 flex flex-col items-center text-center lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto custom-scrollbar">
      <div className="lg:min-h-min flex flex-col items-center justify-center h-full">
        <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xxs mb-8">
          Indeks Zdrowia Witryny
        </h3>

        <div className="relative mb-10 group">
          <div
            className={`absolute inset-0 blur-3xl opacity-20 transition-all duration-1000 group-hover:opacity-40 ${
              score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500'
            }`}
          ></div>

          <div
            className={`relative w-56 h-56 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 transform group-hover:scale-105 ${
              score >= 80
                ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 shadow-green-200'
                : score >= 50
                  ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-orange-200'
                  : 'bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 shadow-red-200'
            }`}
          >
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                className={`text-7xl font-black tracking-tighter leading-none ${
                  score >= 80
                    ? 'text-emerald-600'
                    : score >= 50
                      ? 'text-orange-500'
                      : 'text-red-600'
                }`}
              >
                {score}
              </motion.span>
              <span className="text-xs text-gray-400 font-black uppercase mt-1 tracking-widest">
                PKT / 100
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 w-full max-w-[280px]">
          <p className="font-bold text-dark text-lg mb-2 leading-tight">{getScoreLabel(score)}</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
            />
          </div>
        </div>

        {screenshot ? (
          <div className="relative w-[240px] h-[480px] bg-gray-900 rounded-[3rem] border-[10px] border-gray-900 shadow-2xl overflow-hidden group transform hover:-rotate-2 transition-all duration-700">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
            <img
              src={screenshot}
              alt="Mobile Screenshot"
              className="w-full h-full object-cover opacity-95 transition-all duration-700 group-hover:scale-110 bg-white"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent pointer-events-none z-10"></div>
          </div>
        ) : (
          <div className="w-[220px] h-[440px] bg-gray-100 rounded-[3rem] flex items-center justify-center border-8 border-gray-200">
            <div className="text-center p-6">
              <RefreshCw className="animate-spin mx-auto text-gray-400 mb-4" size={32} />
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                Renderowanie...
              </span>
            </div>
          </div>
        )}
        <p className="mt-8 text-xxs text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Mobile Preview
        </p>
      </div>
    </div>
  );
};

export default AuditScoreSidebar;
