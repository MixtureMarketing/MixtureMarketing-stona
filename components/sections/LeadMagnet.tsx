/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle2, ShieldAlert, Zap, BarChart3 } from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import Button from '../common/Button';
import { LEAD_MAGNET_CONTENT as CONTENT } from '../../data/content';
import { AuditVisual } from '../visuals/LeadMagnetVisuals';

const LeadMagnet: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden bg-dark">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden relative group">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xxs font-bold uppercase tracking-widest mb-6 border border-primary/20">
                <Zap size={12} fill="currentColor" /> {CONTENT.badge}
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                {CONTENT.title.line1} <br className="hidden md:block" />
                <span className="text-primary">{CONTENT.title.line2}</span>
              </h2>

              <p className="text-gray-300 text-base md:text-lg mb-8 md:mb-10 leading-relaxed max-w-xl">
                {CONTENT.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-10">
                {CONTENT.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-200">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto justify-center shadow-xl shadow-primary/20 text-sm sm:text-lg px-4 sm:px-8 h-12 sm:h-16"
                onClick={() => navigate('/audyt-360/')}
                icon={<ArrowRight size={18} className="sm:w-5 sm:h-5" />}
              >
                {CONTENT.button}
              </Button>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300} className="relative hidden lg:block">
              <AuditVisual />
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
