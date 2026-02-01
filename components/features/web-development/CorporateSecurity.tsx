import React from 'react';
import { ShieldCheck, Eye, Cloud, Server, Lock } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { CORPORATE_WEBSITE_CONTENT as CONTENT } from '../../../data/content';

const CorporateSecurity: React.FC = () => {
  const complianceFeatures = CONTENT.compliance.items.map((feat, i) => {
    const icons = [
      <Eye key="eye" size={20} />,
      <ShieldCheck key="shield" size={20} />,
      <Cloud key="cloud" size={20} />,
      <Server key="server" size={20} />,
    ];
    return { ...feat, icon: icons[i] };
  });

  return (
    <SectionWrapper variant="dark" padding="lg">
      <div className="bg-tech-grid absolute inset-0 opacity-10 pointer-events-none"></div>
      <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
        <div className="lg:w-1/2">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xxs font-black uppercase tracking-widest mb-6">
              <ShieldCheck size={14} /> Enterprise Ready
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
              {CONTENT.compliance.title.line1} <br />
              <span className="text-primary">{CONTENT.compliance.title.line2}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {complianceFeatures.map((feat, i) => (
                <div
                  key={i}
                  className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/30 transition-all group"
                >
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-base mb-2">{feat.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
        <div className="lg:w-1/2 w-full">
          <AnimateOnScroll delay={200}>
            <div className="relative max-w-md mx-auto aspect-square bg-blue-500/10 rounded-full flex items-center justify-center p-8 border border-white/5">
              <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-spin-slow"></div>
              <div className="relative z-10 text-center">
                <Lock size={64} className="text-primary mx-auto mb-6 animate-pulse" />
                <div className="text-2xl font-black tracking-tighter">DATA SECURED</div>
                <div className="text-xxs font-mono text-primary mt-2">AES-256 ENCRYPTION</div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CorporateSecurity;
