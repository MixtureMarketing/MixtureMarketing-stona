import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface FooterTrustBoxProps {
  badge: string;
  text: string;
  cta: string;
}

const FooterTrustBox: React.FC<FooterTrustBoxProps> = ({ badge, text, cta }) => {
  return (
    <div className="p-6 rounded-[2rem] bg-gradient-to-br from-dark to-secondary border border-white/10 relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-primary text-xxs font-black uppercase tracking-widest mb-2">
          <ShieldCheck size={12} /> {badge}
        </div>
        <p className="text-xs text-white/80 leading-relaxed mb-4">{text}</p>
        <Link
          to="/contact/"
          className="inline-flex items-center gap-2 text-sm font-bold text-white hover:underline underline-offset-4 transition-all"
        >
          {cta} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
    </div>
  );
};

export default FooterTrustBox;
