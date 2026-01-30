import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, Server } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

const EyeIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RocketIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const WebAppQaPipeline: React.FC = () => {
  const [pipelineStep, setPipelineStep] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '> Initializing build sequence...',
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const commands = [
      { text: '> Running Unit Tests...', delay: 800 },
      { text: '✔ AuthModule verified (12ms)', delay: 1400, color: 'text-green-400' },
      { text: '✔ PaymentGateway connected', delay: 2000, color: 'text-green-400' },
      { text: '> Security Scan (OWASP Top 10)...', delay: 2800 },
      { text: '✔ No vulnerabilities found', delay: 3500, color: 'text-green-400' },
      { text: '> Deploying to Staging...', delay: 4200 },
      { text: '🚀 Build Successful. Ready.', delay: 5000, color: 'text-primary' },
    ];

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const runSequence = () => {
      setTerminalLines(['> Initializing build sequence...']);
      commands.forEach(({ text, delay, color }) => {
        const timeout = setTimeout(() => {
          setTerminalLines((prev) => [
            ...prev,
            `<span class="${color || 'text-gray-300'}">${text}</span>`,
          ]);
        }, delay);
        timeouts.push(timeout);
      });
    };

    runSequence();
    const loop = setInterval(runSequence, 8000);

    return () => {
      clearInterval(loop);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const qualityProcess = CONTENT.qa.steps.map((item, i) => {
    const icons = [
      <EyeIcon key="eye" size={18} />,
      <CheckCircle2 key="check" size={18} />,
      <Server key="server" size={18} />,
      <RocketIcon key="rocket" size={18} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <section className="py-24 bg-deep-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title={CONTENT.qa.title}
          subtitle={CONTENT.qa.subtitle}
          description={CONTENT.qa.description}
          lightMode
          className="mb-16"
        />

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {qualityProcess.map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-all duration-300 ${i <= pipelineStep ? 'bg-white/10 border-primary/50' : 'bg-transparent border-[#334155] opacity-50'}`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= pipelineStep ? 'bg-primary text-white' : 'bg-[#1E293B] text-gray-300'}`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-white">{item.step}</h3>
                </div>
                <p className="text-xs text-gray-200 pl-14">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-[#0F172A] rounded-xl border border-[#334155] shadow-2xl overflow-hidden font-mono text-xs">
              <div className="bg-[#1E293B] px-4 py-2 flex items-center gap-2 border-b border-[#334155]">
                <Terminal size={14} className="text-primary" />
                <span className="text-gray-400">CI/CD Runner</span>
              </div>
              <div className="p-6 h-64 overflow-y-auto space-y-2">
                {terminalLines.map((line, i) => (
                  <div
                    key={i}
                    dangerouslySetInnerHTML={{ __html: line }}
                    className="animate-fade-in"
                  />
                ))}
                <div className="w-2 h-4 bg-primary animate-pulse inline-block"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebAppQaPipeline;
