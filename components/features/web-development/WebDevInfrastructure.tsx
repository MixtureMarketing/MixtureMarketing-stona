import React, { useState } from 'react';
import { ShieldCheck, Server } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import LazyHydrate from '../../common/LazyHydrate';
import SectionWrapper from '../../common/SectionWrapper';
import { useAnimationFrameInterval } from '../../../hooks/useAnimationFrameInterval';
import { WEB_DEV_CONTENT } from '../../../data/content';

const WebDevInfrastructure: React.FC = () => {
  const [securityScanAngle, setSecurityScanAngle] = useState(0);
  const [blockedCount, setBlockedCount] = useState(1420);

  // Security Radar Animation using RAF
  useAnimationFrameInterval(
    () => {
      setSecurityScanAngle((prev) => (prev + 5) % 360);
      if (Math.random() > 0.95) {
        setBlockedCount((prev) => prev + 1);
      }
    },
    100,
    true,
  );

  return (
    <SectionWrapper variant="dark" overflow={true}>
      <SectionHeader
        title={WEB_DEV_CONTENT.infrastructure.title}
        subtitle={WEB_DEV_CONTENT.infrastructure.subtitle}
        description={WEB_DEV_CONTENT.infrastructure.description}
        lightMode
        className="mb-16"
      />
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xxs font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
            <ShieldCheck size={12} /> {WEB_DEV_CONTENT.infrastructure.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {WEB_DEV_CONTENT.infrastructure.title} <br />
            <span className="text-primary">{WEB_DEV_CONTENT.infrastructure.titleAccent}</span>
          </h2>
          <p className="text-gray-200 text-lg mb-8 leading-relaxed">
            {WEB_DEV_CONTENT.infrastructure.description}
          </p>
          <div className="grid grid-cols-2 gap-6">
            {WEB_DEV_CONTENT.infrastructure.stats.map((stat, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <div className="text-2xl font-bold text-white">{stat.val}</div>
                <div className="text-xs text-gray-300 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <LazyHydrate whenVisible>
            <AnimateOnScroll delay={200}>
              <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6 shadow-[0_0_50px_rgba(0,200,83,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
                <div className="flex justify-between items-center mb-8 border-b border-[#334155] pb-4 relative z-10">
                  <div className="flex items-center gap-2 text-white font-mono text-sm">
                    <Server size={16} className="text-primary" /> SECURITY_CENTER
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xxs text-emerald-400 font-bold uppercase tracking-wide">
                      System Secure
                    </span>
                  </div>
                </div>
                <div className="flex gap-6 relative z-10">
                  <div className="w-1/3 flex flex-col items-center justify-center border-r border-[#334155] pr-6">
                    <div className="relative w-24 h-24 mb-4">
                      <div className="absolute inset-0 border-2 border-[#1E293B] rounded-full"></div>
                      <div
                        className="absolute inset-0 rounded-full border-t-2 border-success opacity-50"
                        style={{
                          transform: `rotate(${securityScanAngle}deg)`,
                          transition: 'transform 0.05s linear',
                        }}
                      ></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-success">
                        <ShieldCheck size={32} />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xxs text-gray-300 uppercase font-bold">Blocked</div>
                      <div className="text-xl font-mono text-white">{blockedCount}</div>
                    </div>
                  </div>
                  <div className="w-2/3 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-gray-300 text-xxs uppercase font-bold border-b border-[#334155] pb-1">
                      <span>Event</span>
                      <span>Status</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">SQL Injection</span>
                      <span className="text-red-400 font-bold">BLOCKED</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Bot crawler</span>
                      <span className="text-orange-400 font-bold">DENIED</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">SSL Handshake</span>
                      <span className="text-success font-bold">SUCCESS</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </LazyHydrate>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WebDevInfrastructure;
