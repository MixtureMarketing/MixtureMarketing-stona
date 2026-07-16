import React from 'react';
import { ShieldCheck, Eye, Cloud, Server } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { CORPORATE_WEBSITE_CONTENT as CONTENT } from '../../../data/content/services/web-development/corporate';

/**
 * Sekcja compliance bez atrap (2026-07-16): wirująca kłódka „DATA SECURED /
 * AES-256 ENCRYPTION" skasowana (niczego nie szyfrowała — fałszywa telemetria
 * bezpieczeństwa na stronie o compliance). Karty bez preparowanych statusów
 * (Verified/Compliant/Active/Monitored); treść w siatce 12 ze sticky
 * nagłówkiem, kontrast opisów naprawiony (gray-400 po remapie dawał ~2.4:1).
 */
const CorporateSecurity: React.FC = () => {
  const complianceFeatures = CONTENT.compliance.items.map((feat, i) => {
    const icons = [
      <Eye key="eye" size={20} aria-hidden="true" />,
      <ShieldCheck key="shield" size={20} aria-hidden="true" />,
      <Cloud key="cloud" size={20} aria-hidden="true" />,
      <Server key="server" size={20} aria-hidden="true" />,
    ];
    return { ...feat, icon: icons[i] };
  });

  return (
    <SectionWrapper variant="dark" padding="lg" overflow={false}>
      <div className="bg-tech-grid absolute inset-0 opacity-10 pointer-events-none"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">
                {CONTENT.compliance.title.line1} <br />
                <span className="text-primary">{CONTENT.compliance.title.line2}</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {CONTENT.compliance.description}
              </p>
            </AnimateOnScroll>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {complianceFeatures.map((feat, i) => (
            <AnimateOnScroll key={i} delay={Math.min(i, 3) * 80}>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/30 transition-all group h-full">
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-base mb-2 text-white">{feat.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{feat.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CorporateSecurity;
