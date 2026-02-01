import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const CountUp = ({ value, label }: { value: string; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white/50 backdrop-blur-sm border border-white/50 p-6 rounded-2xl text-center relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="text-4xl md:text-5xl font-black text-dark mb-2 bg-clip-text text-transparent bg-gradient-to-r from-dark to-secondary">
          {value}
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</div>
      </div>
    </motion.div>
  );
};

interface CaseStudyStatsProps {
  stats: { value: string; label: string }[];
}

const CaseStudyStats: React.FC<CaseStudyStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, i) => (
        <CountUp key={i} value={stat.value} label={stat.label} />
      ))}
    </div>
  );
};

export default CaseStudyStats;
