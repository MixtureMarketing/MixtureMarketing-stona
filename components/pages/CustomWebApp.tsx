import React, { useEffect, useState } from 'react';
import {
  Table,
  Cpu,
  Monitor,
  CheckCircle2,
  Workflow,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Globe,
  Database,
  BarChart3,
  Plug,
  Zap,
  Code2,
  Table2,
  FileCode,
  Settings,
  Layers,
  Clock,
  ArrowLeft,
  Activity,
  ArrowUpRight,
  Unlock,
  BookOpen,
  Terminal,
  Server,
  Calculator,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import LazyHydrate from '../common/LazyHydrate';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';

const CustomWebApp: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [pipelineStep, setPipelineStep] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '> Initializing build sequence...',
  ]);
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  // Generate stable deterministic "random" heights for the monitor chart
  const [randomHeights] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ((i * 17) % 80) + 10),
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('custom-web-app').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'custom',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  // CI/CD Pipeline Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Terminal Simulation Loop
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

  const useCases = CONTENT.useCases.items.map((item, i) => {
    const icons = [
      <Layers key="layers" size={24} />,
      <Clock key="clock" size={24} />,
      <Database key="db" size={24} />,
      <Globe key="globe" size={24} />,
    ];
    return { ...item, icon: icons[i] };
  });

  const qualityProcess = CONTENT.qa.steps.map((item, i) => {
    const icons = [
      <EyeIcon key="eye" size={18} />,
      <CheckCircle2 key="check" size={18} />,
      <Server key="server" size={18} />,
      <RocketIcon key="rocket" size={18} />,
    ];
    return { ...item, icon: icons[i] };
  });

  const techLinks: Record<string, string> = {
    PostgreSQL: '/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu',
    Redis: '/baza-wiedzy/redis-optymalizacja',
    MongoDB: '/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji',
    ElasticSearch: '/baza-wiedzy/elasticsearch-inteligentna-wyszukiwarka-ecommerce',
    'Next.js': '/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych',
    'Tailwind CSS': '/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania',
    TypeScript: '/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu',
    'Python (Django)': '/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp',
    'React.js': '/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu',
    'Vue.js': '/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular',
    Laravel: '/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie',
    Go: '/baza-wiedzy/go-golang-jezyk-chmury',
    'Node.js': '/baza-wiedzy/nodejs-jeden-jezyk',
    Docker: '/baza-wiedzy/docker-konteneryzacja-przewodnik',
    'CI/CD': '/baza-wiedzy/ci-cd-automatyzacja-wdrozen',
    Kubernetes: '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
    AWS: '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
  };

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        lcpImage={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-28 bg-[#0B1120] text-white overflow-hidden">
        <AmbientBackground />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => navigate('/web-development')}
            className="group flex items-center text-sm font-semibold text-gray-600 hover:text-primary mb-8 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Web Development
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in font-mono">
                <Code2 size={14} /> {CONTENT.hero.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
                {CONTENT.hero.title.line1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {CONTENT.hero.title.line2}
                </span>
              </h1>

              <p
                className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                {CONTENT.hero.description}
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <Button
                  onClick={() => openModal('web', { specificType: 'custom' })}
                  icon={<ArrowRight size={18} />}
                >
                  Umów się na konsultację
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/offers#calculator?type=custom')}
                  icon={<Calculator size={18} />}
                >
                  Wyceń aplikację
                </Button>
              </div>
            </div>

            <div
              className="lg:w-1/2 w-full relative animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative z-10 bg-[#0F172A] rounded-xl border border-[#334155] p-6 shadow-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(97,182,222,0.15)] transition-shadow duration-500">
                <div className="flex justify-between items-center mb-6 border-b border-[#334155] pb-4">
                  <div className="text-xs font-mono text-primary flex items-center gap-2">
                    <Activity size={14} className="animate-pulse" /> SYSTEM_MONITOR_V2
                  </div>
                  <div className="flex gap-2 text-xxs font-mono text-green-400">
                    <span>UPTIME: 99.99%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155]">
                    <div className="text-xxs text-gray-300 mb-2 font-mono">ACTIVE USERS</div>
                    <div className="text-2xl font-bold text-white mb-2">12,450</div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[75%] animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155]">
                    <div className="text-xxs text-gray-200 mb-2 font-mono">SERVER LOAD</div>
                    <div className="text-2xl font-bold text-white mb-2">34%</div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[34%]"></div>
                    </div>
                  </div>
                  <div className="col-span-2 bg-[#1E293B] p-4 rounded-lg border border-[#334155] relative overflow-hidden h-32 flex items-end">
                    <div className="absolute top-3 left-4 text-xxs text-gray-200 font-mono">
                      TRANSACTIONS / SEC
                    </div>
                    <div className="flex items-end justify-between w-full h-20 gap-1">
                      {randomHeights.map((height, i) => (
                        <div
                          key={i}
                          className="bg-secondary w-full rounded-t opacity-80 transition-all duration-500"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- USE CASES --- */}
      <LazyHydrate minHeight="600px">
        <section className="py-24 bg-white relative z-10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title={CONTENT.useCases.title}
              description={CONTENT.useCases.description}
              className="mb-16"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => (
                <AnimateOnScroll key={index} delay={index * 100} className="h-full">
                  <GlassCard className="p-8 h-full flex flex-col items-start hover:border-primary hover:shadow-xl transition-all group bg-[#F9FAFB] hover:bg-white border-t-4 border-t-transparent hover:border-t-[#61B6DE]">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-dark mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-gray-100">
                      {useCase.icon}
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-3">{useCase.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm mb-6 flex-grow">
                      {useCase.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 w-full pt-4 border-t border-gray-100">
                      {useCase.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xxs bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold uppercase tracking-wide group-hover:bg-blue-50 group-hover:text-secondary transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      </LazyHydrate>

      {/* --- TECH STACK --- */}
      <LazyHydrate minHeight="800px">
        <section className="py-24 bg-[#0B1120] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xxs font-black uppercase tracking-[0.2em] mb-6">
                  <Cpu size={12} /> {CONTENT.techStack.badge}
                </div>
                <h3 className="text-white font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter mb-6 uppercase">
                  {CONTENT.techStack.title.line1}
                  <br />
                  {CONTENT.techStack.title.line2} <span className="text-primary">ufamy.</span>
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed max-w-xl">
                  {CONTENT.techStack.description}
                </p>
              </div>
              <div className="hidden lg:flex gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-xxs font-black text-gray-300 uppercase tracking-widest mb-2">
                    Performance
                  </div>
                  <div className="text-2xl font-black text-success">99.9%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CONTENT.techStack.items.map((stack, i) => (
                <AnimateOnScroll key={i} delay={i * 100} className="h-full">
                  <div className="group relative h-full bg-gradient-to-b from-white/[0.07] to-transparent border border-white/10 p-8 rounded-[2.5rem] transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_rgba(97,182,222,0.2)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative z-10">
                      <div className="mb-8 flex items-center gap-3">
                        <span className="w-8 h-px bg-primary opacity-30"></span>
                        {stack.link ? (
                          <a
                            href={stack.link}
                            className="text-xxs font-black text-primary uppercase tracking-[0.3em] hover:underline flex items-center gap-2"
                          >
                            {stack.cat} <ArrowUpRight size={10} />
                          </a>
                        ) : (
                          <span className="text-xxs font-black text-primary uppercase tracking-[0.3em]">
                            {stack.cat}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 flex-grow">
                        {stack.items.map((item, j) => (
                          <div key={j} className="flex items-center justify-between group/item">
                            {techLinks[item] ? (
                              <a
                                href={techLinks[item]}
                                className="text-gray-300 text-sm font-bold group-hover/item:text-primary transition-colors flex items-center gap-1.5"
                              >
                                {item}
                                <ArrowUpRight
                                  size={10}
                                  className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                                />
                              </a>
                            ) : (
                              <span className="text-gray-300 text-sm font-bold group-hover/item:text-white transition-colors">
                                {item}
                              </span>
                            )}
                            <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-20 group-hover/item:opacity-100 transition-all shadow-[0_0_10px_#61B6DE]"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute -bottom-6 -right-4 text-7xl font-black text-white/[0.02] select-none pointer-events-none group-hover:text-white/[0.04] transition-colors">
                      {stack.cat.charAt(0)}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      </LazyHydrate>

      {/* --- TRUST & SECURITY --- */}
      <LazyHydrate minHeight="600px">
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <SectionHeader
                  align="left"
                  title={CONTENT.trust.title}
                  description={CONTENT.trust.description}
                />
                <ul className="space-y-6 mt-8">
                  {CONTENT.trust.items.map((item, i) => {
                    const icons = [
                      <Unlock key="unlock" size={20} />,
                      <BookOpen key="book" size={20} />,
                      <FileCode key="code" size={20} />,
                    ];
                    return (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-blue-50 rounded-lg text-secondary">
                          {icons[i]}
                        </div>
                        <div>
                          <h3 className="font-bold text-dark">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="lg:w-1/2 flex justify-center">
                <AnimateOnScroll delay={200}>
                  <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-md transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <ShieldCheck size={28} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                          Status Umowy
                        </div>
                        <div className="text-lg font-bold text-dark">IP Transfer Complete</div>
                      </div>
                    </div>
                    <div className="space-y-3 font-mono text-xs text-gray-700">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>Source Code Ownership</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>Database Schema</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>API Documentation</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>NDA Signed</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                    </div>
                    <div className="mt-6 pt-4 text-center">
                      <div className="inline-block border-2 border-dark px-4 py-2 text-dark font-bold text-sm uppercase tracking-widest rounded opacity-20 transform -rotate-12">
                        CONFIDENTIAL
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              </div>
            </div>
          </div>
        </section>
      </LazyHydrate>

      {/* --- QA PIPELINE --- */}
      <LazyHydrate minHeight="600px">
        <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
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
      </LazyHydrate>

      {/* --- PRICING --- */}
      {pricingData && (
        <LazyHydrate minHeight="600px">
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      {/* --- CTA --- */}
      <LazyHydrate minHeight="400px">
        <section className="py-24 bg-[#F9FAFB] relative overflow-hidden text-center border-t border-gray-100">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="inline-block p-4 rounded-full bg-white border border-gray-200 mb-6 shadow-sm animate-pulse">
              <Settings size={32} className="text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
              {CONTENT.cta.title}
            </h2>
            <p className="text-xl text-gray-600 mb-10 font-medium">{CONTENT.cta.description}</p>
            <Button
              onClick={() => openModal('consultation', { specificType: 'custom' })}
              variant="primary"
              size="lg"
              className="!bg-dark border-none hover:!bg-secondary shadow-xl shadow-[#213261]/20"
            >
              {CONTENT.cta.button}
            </Button>
          </div>
        </section>
      </LazyHydrate>

      {/* --- CTA --- */}
      <section className="py-24 bg-[#F9FAFB] relative overflow-hidden text-center border-t border-gray-100">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-block p-4 rounded-full bg-white border border-gray-200 mb-6 shadow-sm animate-pulse">
            <Settings size={32} className="text-secondary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
            {CONTENT.cta.title}
          </h2>
          <p className="text-xl text-gray-600 mb-10 font-medium">{CONTENT.cta.description}</p>
          <Button
            onClick={() => openModal('consultation', { specificType: 'custom' })}
            variant="primary"
            size="lg"
            className="!bg-dark border-none hover:!bg-secondary shadow-xl shadow-[#213261]/20"
          >
            {CONTENT.cta.button}
          </Button>
        </div>
      </section>
    </div>
  );
};

// Simple Icon Helpers
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

export default CustomWebApp;
