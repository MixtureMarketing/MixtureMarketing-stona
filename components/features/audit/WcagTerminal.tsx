import React, { useState } from 'react';
import { Terminal, Palette, ShieldAlert } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import Container from '../../common/Container';
import { useAnimationFrameInterval } from '../../../hooks/useAnimationFrameInterval';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../../data/content';

const WcagTerminal: React.FC = () => {
  const [wcagLog, setWcagLog] = useState<string[]>([]);
  const [currentLog, setCurrentLog] = useState(0);

  const logs = [
    { text: 'Scanning DOM structure...', color: 'text-gray-600' },
    { text: 'Analyzing contrast ratios (AA standard)...', color: 'text-gray-600' },
    {
      text: 'WARNING: Button #cta-primary contrast is 2.1:1 (Required 4.5:1)',
      color: 'text-red-400',
    },
    { text: 'Checking alt attributes on images...', color: 'text-gray-600' },
    { text: 'ERROR: Missing alt text on hero-banner.jpg', color: 'text-red-400' },
    { text: 'Verifying keyboard navigation focus states...', color: 'text-gray-600' },
    { text: 'SUCCESS: Navigation flow is logical', color: 'text-success' },
    { text: 'Audit Finalized. Score: 64/100', color: 'text-instagram' },
  ];

  useAnimationFrameInterval(
    () => {
      if (currentLog < logs.length) {
        const log = logs[currentLog];
        setWcagLog((prev) => [...prev.slice(-6), `<span class="${log.color}">${log.text}</span>`]);
        setCurrentLog((prev) => prev + 1);
      } else {
        setCurrentLog(0);
        setWcagLog([]);
      }
    },
    1500,
    true,
  );

  return (
    <Container className="relative z-10">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldAlert size={14} /> {CONTENT.wcag.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {CONTENT.wcag.title.line1}
            <br />
            {CONTENT.wcag.title.line2}
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">{CONTENT.wcag.description}</p>

          <div className="space-y-4">
            {CONTENT.wcag.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="mt-1">
                  {i === 0 ? (
                    <Terminal size={20} className="text-success" />
                  ) : (
                    <Palette size={20} className="text-instagram" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <AnimateOnScroll delay={200}>
            <div className="bg-[#1E293B] rounded-xl shadow-2xl border border-[#334155] overflow-hidden font-mono text-xs">
              <div className="bg-[#0F172A] px-4 py-2 flex items-center gap-2 border-b border-[#334155]">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-2 text-gray-700">wcag-scanner --verbose</div>
              </div>

              <div className="p-6 h-80 overflow-hidden relative">
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  {wcagLog.map((line, i) => (
                    <div
                      key={i}
                      className="mb-1 break-words"
                      dangerouslySetInnerHTML={{ __html: `> ${line}` }}
                    ></div>
                  ))}
                  <div className="animate-pulse text-instagram">_</div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </Container>
  );
};

export default WcagTerminal;
