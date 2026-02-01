import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Settings,
  Terminal,
  Lock,
  Scale,
  Server,
  CheckCircle2,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { useAnimationFrameInterval } from '../../../hooks/useAnimationFrameInterval';
import { ANALYTICS_CONTENT as CONTENT } from '../../../data/content';

const AnalyticsCompliance: React.FC = () => {
  const [scanProgress, setScanProgress] = useState(0);
  const [isCompliant, setIsCompliant] = useState(false);

  useAnimationFrameInterval(
    () => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setIsCompliant(true);
          return 0;
        }
        if (prev === 0) setIsCompliant(false);
        return prev + 1;
      });
    },
    50,
    true,
  );

  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
            <AlertTriangle size={14} /> {CONTENT.compliance.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {CONTENT.compliance.title.line1} <br />
            <span className="text-red-400">{CONTENT.compliance.title.line2}</span>
          </h2>
          <p
            className="text-gray-200 text-lg mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: CONTENT.compliance.description }}
          />

          <div className="space-y-4">
            {CONTENT.compliance.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
              >
                <div className="mt-1 p-2 bg-primary/10 rounded-lg text-primary">
                  {i === 0 ? <ShieldCheck size={20} /> : <Settings size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 w-full flex justify-center">
          <AnimateOnScroll delay={200}>
            <div className="relative w-full max-w-md bg-[#1E293B] rounded-2xl border border-[#334155] shadow-2xl p-8 overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_#61B6DE] z-20 transition-all duration-300"
                style={{ top: `${scanProgress}%` }}
              ></div>

              <div className="flex justify-between items-center mb-8 border-b border-[#334155] pb-4">
                <div className="text-xs font-mono text-gray-300 uppercase flex items-center gap-2">
                  <Terminal size={12} /> Security Scan
                </div>
                <div
                  className={`px-2 py-1 rounded text-xxs font-bold uppercase transition-colors flex items-center gap-1 ${isCompliant ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-400'}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isCompliant ? 'bg-success' : 'bg-red-500 animate-pulse'}`}
                  ></div>
                  {isCompliant ? 'COMPLIANT' : 'SCANNING...'}
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-3 bg-deep-dark rounded border border-[#334155]">
                  <span className="text-gray-200 flex items-center gap-2">
                    <Lock size={12} /> GDPR Consent
                  </span>
                  {scanProgress > 30 ? (
                    <CheckCircle2 size={14} className="text-success" />
                  ) : (
                    <span className="text-gray-400 font-bold animate-pulse">Pending...</span>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 bg-deep-dark rounded border border-[#334155]">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Scale size={12} /> Omnibus Directive
                  </span>
                  {scanProgress > 60 ? (
                    <CheckCircle2 size={14} className="text-success" />
                  ) : (
                    <span className="text-gray-600">Pending...</span>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 bg-deep-dark rounded border border-[#334155]">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Server size={12} /> Google Consent v2
                  </span>
                  {scanProgress > 90 ? (
                    <CheckCircle2 size={14} className="text-success" />
                  ) : (
                    <span className="text-gray-600">Pending...</span>
                  )}
                </div>
              </div>

              {isCompliant && (
                <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-xl text-center animate-fade-in-up">
                  <ShieldCheck size={32} className="text-success mx-auto mb-2" />
                  <div className="text-white font-bold text-sm">
                    {CONTENT.compliance.status.safe}
                  </div>
                  <div className="text-xxs text-success">{CONTENT.compliance.status.desc}</div>
                </div>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default AnalyticsCompliance;
