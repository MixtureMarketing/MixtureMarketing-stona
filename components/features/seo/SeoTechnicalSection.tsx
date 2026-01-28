/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Code2, Gauge, Globe, Terminal } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionHeader from '../../common/SectionHeader';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

const SeoTechnicalSection: React.FC = () => {
  const [optStep, setOptStep] = useState(0);
  const [optLogs, setOptLogs] = useState<string[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Run once
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const logs = [
      'Initializing Core Web Vitals Audit...',
      'Detecting render-blocking resources...',
      'Compressing images (Convert to WebP)...',
      'Minifying CSS & JS bundles...',
      'Deferring off-screen images...',
      'Eliminating layout shifts (CLS)...',
      'Optimizing Server Response Time (TTFB)...',
      'Audit Complete. Score: 98/100',
    ];

    const simInterval = setInterval(() => {
      setOptStep((prev) => {
        const next = prev >= 100 ? 100 : prev + 1; // Stop at 100

        // Update logs based on progress
        const logIndex = Math.floor((next / 100) * logs.length);
        if (logs[logIndex]) {
          const newLog = `> ${logs[logIndex]}`;
          setOptLogs((currentLogs) => {
            if (currentLogs[currentLogs.length - 1] !== newLog) {
              return [...currentLogs, newLog].slice(-5);
            }
            return currentLogs;
          });
        }

        if (next >= 100) {
          clearInterval(simInterval);
        }
        return next;
      });
    }, 50); // Faster simulation

    return () => {
      clearInterval(simInterval);
    };
  }, [isVisible]);

  const lcpValue = optStep < 50 ? (2.5 - optStep * 0.02).toFixed(1) : '0.7';
  const lcpColor =
    optStep < 50 ? 'text-red-400' : optStep < 80 ? 'text-yellow-400' : 'text-success';

  const clsValue = optStep < 60 ? (0.25 - optStep * 0.003).toFixed(2) : '0.00';
  const clsColor = optStep < 60 ? 'text-red-400' : 'text-success';

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-[#0B1120] text-white relative z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00C853] to-transparent opacity-30"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title={CONTENT.technicalSeo.title}
          subtitle={CONTENT.technicalSeo.subtitle}
          description={CONTENT.technicalSeo.description}
          lightMode
          className="mb-16"
        />

        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="lg:w-1/2 flex flex-col justify-center">
            <AnimateOnScroll>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Gauge className="text-success" />
                Wpływ szybkości na biznes
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-3xl font-black text-success mb-1">
                    {CONTENT.technicalSeo.impact.conversion}
                  </div>
                  <div className="text-xs text-gray-300">Konwersji za każdą sekundę opóźnienia</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-3xl font-black text-red-400 mb-1">
                    {CONTENT.technicalSeo.impact.bounce}
                  </div>
                  <div className="text-xs text-gray-300">
                    Współczynnik odrzuceń przy ładowaniu 3s+
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Code2 size={16} /> Stack Technologiczny
              </h3>
              <ul className="space-y-3">
                {CONTENT.technicalSeo.stack.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-success/50 transition-colors group"
                  >
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-mono">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>

          <div className="lg:w-1/2">
            <AnimateOnScroll delay={200} className="h-full">
              <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-6 shadow-2xl relative overflow-hidden h-full flex flex-col group hover:shadow-[0_0_40px_rgba(0,200,83,0.1)] transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00C853] to-transparent animate-scan opacity-50"></div>

                <div className="flex justify-between items-center mb-8 border-b border-[#334155] pb-4">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-primary" />
                    <span className="text-xs font-mono text-gray-300">
                      https://twoja-firma.pl/audit
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-xxs font-bold text-success uppercase tracking-wider">
                      Live Optimization
                    </span>
                  </div>
                </div>

                <div className="flex justify-center mb-8 relative">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill="none"
                      stroke={optStep > 80 ? '#00C853' : optStep > 50 ? '#F4B400' : '#EF4444'}
                      strokeWidth="12"
                      strokeDasharray={528}
                      strokeDashoffset={528 - (528 * optStep) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-5xl font-black tabular-nums tracking-tighter leading-none ${optStep > 80 ? 'text-success' : optStep > 50 ? 'text-[#F4B400]' : 'text-[#EF4444]'}`}
                    >
                      {optStep}
                    </span>
                    <span className="text-xxs font-bold text-gray-700 uppercase mt-2 tracking-widest">
                      Performance
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xxs text-gray-400 font-bold uppercase mb-1">
                      LCP (Load)
                    </div>
                    <div className={`text-lg font-bold font-mono ${lcpColor}`}>{lcpValue}s</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xxs text-gray-400 font-bold uppercase mb-1">
                      INP (Input)
                    </div>
                    <div className="text-lg font-bold text-success font-mono">24ms</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xxs text-gray-400 font-bold uppercase mb-1">
                      CLS (Shift)
                    </div>
                    <div className={`text-lg font-bold font-mono ${clsColor}`}>{clsValue}</div>
                  </div>
                </div>

                <div className="mt-auto bg-black/80 rounded-lg p-4 font-mono text-xxs h-32 overflow-hidden border border-white/10 relative shadow-inner">
                  <div className="absolute top-2 right-2 text-gray-600">
                    <Terminal size={12} />
                  </div>
                  <div className="flex flex-col justify-end h-full space-y-1.5">
                    {optLogs.map((log, i) => (
                      <div key={i} className="text-gray-300 animate-fade-in flex gap-2">
                        <span className="text-primary">$</span>
                        {log.includes('Complete') ? (
                          <span className="text-success font-bold">{log}</span>
                        ) : (
                          log.replace('> ', '')
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <span className="text-primary">$</span>
                      <div className="w-2 h-4 bg-success animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoTechnicalSection;
