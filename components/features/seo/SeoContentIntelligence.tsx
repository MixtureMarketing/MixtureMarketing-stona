import React from 'react';
import { Anchor, Brain, CheckCircle2, PenTool, ShieldCheck } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

const SeoContentIntelligence: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 bg-[#E8F5E9] text-success p-4 rounded-full shadow-inner transform group-hover:scale-110 transition-transform">
              <Brain size={32} />
            </div>

            <h3 className="text-2xl font-bold text-dark mb-6">Filozofia E-E-A-T</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              W dobie zalewu internetu tekstami z AI, Google premiuje unikalną wiedzę i
              doświadczenie. Nasz proces tworzenia treści opieramy na 4 filarach autorytetu:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CONTENT.contentIntelligence.pillars.map((pill, i) => {
                const icons = [
                  <PenTool key="p" size={14} />,
                  <CheckCircle2 key="c" size={14} />,
                  <Anchor key="a" size={14} />,
                  <ShieldCheck key="s" size={14} />,
                ];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xxs font-black uppercase text-gray-700 tracking-wider"
                  >
                    <span className="text-success">{icons[i]}</span> {pill.label}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm font-bold text-success">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                Human-Generated Content
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionHeader
              align="left"
              title={CONTENT.contentIntelligence.title}
              description={CONTENT.contentIntelligence.description}
            />

            <div className="mt-10 relative h-80 bg-white rounded-[2.5rem] border border-gray-100 shadow-inner overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5E9] to-transparent opacity-30"></div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <circle
                  cx="50%"
                  cy="50%"
                  r="80"
                  fill="none"
                  stroke="#00C853"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="animate-spin-slow"
                  style={{ animationDuration: '30s' }}
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="130"
                  fill="none"
                  stroke="#00C853"
                  strokeWidth="0.5"
                  strokeDasharray="8 8"
                  className="animate-spin-slow"
                  style={{ animationDuration: '60s' }}
                />
              </svg>

              <div className="relative z-20 group cursor-default">
                <div className="bg-dark text-white px-6 py-3 rounded-2xl shadow-[0_20px_40px_rgba(33,50,97,0.3)] font-black text-sm flex items-center gap-3 border-2 border-white/10 group-hover:scale-105 transition-transform duration-500">
                  <Anchor size={18} className="text-success" />
                  <span>CORE PILLAR PAGE</span>
                </div>
                <div className="absolute inset-0 bg-success blur-2xl opacity-20 animate-pulse"></div>
              </div>

              <div className="absolute inset-0 pointer-events-none">
                {[
                  { label: 'Case Study', angle: 0, r: 110, delay: '0s' },
                  { label: 'User Guide', angle: 90, r: 110, delay: '1s' },
                  { label: 'Expert FAQ', angle: 180, r: 110, delay: '2s' },
                  { label: 'Tech Deep-dive', angle: 270, r: 110, delay: '3s' },
                  { label: 'Checklist', angle: 45, r: 150, delay: '0.5s' },
                  { label: 'Comparison', angle: 225, r: 150, delay: '1.5s' },
                ].map((cluster, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit"
                    style={
                      {
                        '--radius': `${cluster.r}px`,
                        '--angle': `${cluster.angle}deg`,
                        '--speed': cluster.r > 120 ? '40s' : '25s',
                        animationDelay: `-${cluster.delay}`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="bg-white border border-success/30 text-dark px-3 py-1.5 rounded-full shadow-lg text-xxs font-black uppercase tracking-widest backdrop-blur-sm pointer-events-auto hover:border-success hover:scale-110 transition-all cursor-default">
                      {cluster.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoContentIntelligence;
