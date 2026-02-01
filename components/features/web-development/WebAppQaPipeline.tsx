import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, Server, Eye, Rocket } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

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
      <Eye key="eye" size={18} />,
      <CheckCircle2 key="check" size={18} />,
      <Server key="server" size={18} />,
      <Rocket key="rocket" size={18} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

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
    </SectionWrapper>
  );
};

export default WebAppQaPipeline;
