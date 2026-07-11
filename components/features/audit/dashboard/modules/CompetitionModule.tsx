import React from 'react';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuditResult } from '../../../../../services/auditService';
import { EASE } from '../ui';

interface CompetitionModuleProps {
  competitor?: AuditResult['competitor'];
  score: number;
}

const Bar: React.FC<{ label: string; value: number; accent: string }> = ({
  label,
  value,
  accent,
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-end">
      <span className="text-[12px] font-medium text-blue-200/80 truncate max-w-[200px]">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums">{Math.round(value)}%</span>
    </div>
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        className={`h-full rounded-full ${accent}`}
      />
    </div>
  </div>
);

const CompetitionModule: React.FC<CompetitionModuleProps> = ({ competitor, score }) => {
  if (!competitor) return null;
  return (
    <div className="bg-dark text-white rounded-2xl p-6">
      <h4 className="text-[15px] font-bold mb-5 flex items-center gap-2.5">
        <BarChart3 className="text-blue-300" size={18} /> Wynik vs konkurencja
      </h4>
      <div className="grid sm:grid-cols-2 gap-5">
        <Bar label="Twoja strona" value={score} accent="bg-success" />
        <Bar
          label={competitor.url.replace(/^https?:\/\//, '')}
          value={competitor.psi_score}
          accent="bg-blue-400"
        />
      </div>
    </div>
  );
};

export default CompetitionModule;
