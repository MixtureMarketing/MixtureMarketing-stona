import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Target,
  Eye,
  ArrowRight,
  Activity,
  Database,
  Filter,
  Server,
  Lock,
  TrendingUp,
  ShoppingCart,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  FileSpreadsheet,
  GripVertical,
  Scale,
  FileWarning,
  GitMerge,
  Settings,
  Cpu,
  Terminal,
  Store,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { ANALYTICS_CONTENT as CONTENT } from '../../data/content';

import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import { AnalyticsHeroVisual } from '../visuals/HeroVisuals';

const Analytics: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Compliance Scan State
  const [scanProgress, setScanProgress] = useState(0);
  const [isCompliant, setIsCompliant] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [randomData, setRandomData] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandomData(
      Array.from({ length: 120 }).map((_, i) =>
        i < 6
          ? ['Date', 'Source', 'Medium', 'Camp.', 'Click', 'Cost'][i]
          : Math.floor(Math.random() * 1000).toString()
      )
    );
  }, []);

  // Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Compliance Simulator Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setIsCompliant(true);
          return 0; // Reset for loop effect
        }
        if (prev === 0) setIsCompliant(false);
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSliderChange = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(pos, 0), 100));
  };

  const commonErrors = CONTENT.painPoints.items.map((error, i) => ({
    ...error,
    icon:
      i === 0 ? (
        <FileWarning size={24} className="text-red-500" />
      ) : i === 1 ? (
        <Filter size={24} className="text-red-500" />
      ) : (
        <GitMerge size={24} className="text-red-500" />
      ),
  }));

  const solutions = CONTENT.solutions.items.map((item, i) => {
    const icons = [
      <BarChart3 key="chart" size={24} />,
      <Server key="server" size={24} />,
      <Eye key="eye" size={24} />,
      <Target key="target" size={24} />,
      <ShieldCheck key="shield" size={24} />,
      <Database key="db" size={24} />,
    ];
    return {
      ...item,
      icon: icons[i],
    };
  });

  const faqs = CONTENT.faq.items;

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-[#F4B400]/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Activity}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('marketing')}
        ctaSecondaryText={CONTENT.hero.trustBadge}
        ctaSecondaryOnClick={() => {}}
        ctaSecondaryIcon={CheckCircle2}
        backLinkPath="/marketing"
        backLinkLabel="Wróć do Marketingu"
        accentGradientFrom="primary"
        accentGradientTo="secondary"
        visual={<AnalyticsHeroVisual />}
      />

      {/* --- RED FLAGS (PAIN POINTS) --- */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.painPoints.title}
            description={CONTENT.painPoints.description}
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {commonErrors.map((error, i) => (
              <AnimateOnScroll key={i} delay={i * 100} className="h-full">
                <div className="h-full p-8 rounded-2xl bg-[#FFF5F5] border border-red-100 flex flex-col items-start hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-white text-red-500 flex items-center justify-center mb-6 shadow-sm border border-red-50 group-hover:scale-110 transition-transform">
                    {error.icon}
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-3">{error.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{error.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- LEGAL & COMPLIANCE (DARK SECTION) --- */}
      <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Text Content */}
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

            {/* Visual: System Scanner */}
            <div className="lg:w-1/2 w-full flex justify-center">
              <AnimateOnScroll delay={200}>
                <div className="relative w-full max-w-md bg-[#1E293B] rounded-2xl border border-[#334155] shadow-2xl p-8 overflow-hidden">
                  {/* Scan Beam */}
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
                    <div className="flex justify-between items-center p-3 bg-[#0B1120] rounded border border-[#334155]">
                      <span className="text-gray-200 flex items-center gap-2">
                        <Lock size={12} /> GDPR Consent
                      </span>
                      {scanProgress > 30 ? (
                        <CheckCircle2 size={14} className="text-success" />
                      ) : (
                        <span className="text-gray-400 font-bold animate-pulse">Pending...</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#0B1120] rounded border border-[#334155]">
                      <span className="text-gray-300 flex items-center gap-2">
                        <Scale size={12} /> Omnibus Directive
                      </span>
                      {scanProgress > 60 ? (
                        <CheckCircle2 size={14} className="text-success" />
                      ) : (
                        <span className="text-gray-600">Pending...</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#0B1120] rounded border border-[#334155]">
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
        </div>
      </section>

      {/* --- SLIDER COMPARISON (BEFORE / AFTER) --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.slider.title}
            description={CONTENT.slider.description}
            className="mb-16"
          />

          <AnimateOnScroll>
            <div
              ref={sliderRef}
              className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#334155] cursor-col-resize select-none group"
              onMouseMove={handleSliderChange}
              onTouchMove={handleSliderChange}
            >
              {/* Hidden Range Input for Keyboard Accessibility */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                className="sr-only"
                aria-label="Przesuń suwak, aby porównać Excel z nowoczesnym dashboardem"
              />

              {/* RIGHT IMAGE (AFTER - DASHBOARD) */}
              <div className="absolute inset-0 bg-[#0B1120] flex flex-col p-6 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-white font-bold text-lg flex items-center gap-2">
                    <BarChart3 className="text-primary" /> Executive Dashboard
                  </div>
                  <div className="px-3 py-1 bg-[#1E293B] rounded text-xs text-gray-600 border border-[#334155]">
                    Last 30 Days
                  </div>
                </div>
                {/* Charts */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#1E293B] p-4 rounded-xl border border-[#334155]">
                      <div className="text-xxs text-gray-600 mb-1 uppercase font-bold">
                        Metric {i}
                      </div>
                      <div className="text-lg font-bold text-white mb-2">$12,450</div>
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-success w-[70%]"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-[#1E293B] rounded-xl p-4 flex items-end gap-2 relative border border-[#334155] overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
                  {/* Graph Bars */}
                  {[40, 60, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t opacity-80"
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                  <div className="absolute top-4 right-4 text-primary font-bold text-sm bg-[#0B1120]/80 px-2 py-1 rounded backdrop-blur-sm">
                    Conversion Rate: 3.8%
                  </div>
                </div>
              </div>

              {/* LEFT IMAGE (BEFORE - EXCEL) - CLIPPED */}
              <div
                className="absolute inset-0 bg-white border-r-4 border-secondary overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <div
                  className="w-full h-full bg-white text-black p-4 font-mono text-xs overflow-hidden"
                  style={{ minWidth: '100vw' }}
                >
                  <div className="flex items-center gap-2 mb-4 text-[#1d6f42] font-bold border-b pb-2">
                    <FileSpreadsheet /> Raport_Lipiec_v2_FINAL.xlsx
                  </div>
                  <div className="grid grid-cols-6 gap-0 border-t border-l border-gray-300">
                    {randomData.map((val, i) => (
                      <div
                        key={i}
                        className="border-b border-r border-gray-300 p-2 truncate bg-gray-50/50"
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlay Gradient to make it look 'boring' */}
                <div className="absolute inset-0 bg-gray-50/20 mix-blend-multiply"></div>
              </div>

              {/* HANDLER */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-transparent cursor-col-resize z-20 flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-10 h-10 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center -ml-1 text-secondary group-hover:scale-110 transition-transform border-4 border-secondary">
                  <GripVertical size={20} />
                </div>
              </div>

              {/* LABELS */}
              <div className="absolute top-4 left-4 bg-white/90 text-black px-3 py-1 rounded font-bold text-xs shadow-md pointer-events-none border border-gray-200">
                {CONTENT.slider.labels.before}
              </div>
              <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded font-bold text-xs shadow-md pointer-events-none">
                {CONTENT.slider.labels.after}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* --- SERVICES GRID (SOLUTIONS) --- */}
      <section className="py-24 bg-gray-50 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.solutions.title}
            description={CONTENT.solutions.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((item, index) => (
              <AnimateOnScroll key={index} delay={index * 100} className="h-full">
                <GlassCard className="p-8 h-full flex flex-col items-start hover:border-primary hover:-translate-y-1 transition-all duration-300 group bg-white">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm mt-auto">{item.desc}</p>
                </GlassCard>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- ENTERPRISE DATA WAREHOUSE (NEW DESIGN) --- */}
      <section className="py-24 bg-[#0B1120] relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Content */}
            <div className="lg:w-1/2">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-6">
                  <Database size={14} /> {CONTENT.warehouse.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {CONTENT.warehouse.title.line1} <br />
                  <span className="text-primary">{CONTENT.warehouse.title.line2}</span>
                </h2>
                <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                  {CONTENT.warehouse.description}
                </p>

                <div className="space-y-6">
                  {CONTENT.warehouse.features.map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 p-2 bg-primary/10 rounded-lg text-primary h-fit border border-primary/20">
                        {i === 0 ? (
                          <Target size={20} />
                        ) : i === 1 ? (
                          <Users size={20} />
                        ) : (
                          <Cpu size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                        <p className="text-sm text-gray-300 mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: Data Reactor Visual - Percentage-based for perfect alignment */}
            <div className="lg:w-1/2 w-full flex justify-center items-center min-h-[450px]">
              <div className="relative w-full max-w-xl aspect-[16/10] bg-[#0F172A] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                {/* Ambient Backgrounds */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/10 via-transparent to-[#E1306C]/10 pointer-events-none"></div>

                {/* Data Flow SVG - Using 100x100 grid for direct mapping to percentages */}
                <svg
                  className="absolute inset-0 w-full h-full z-0"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <filter id="packetGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Connection Paths - Start at X=28 (Right edge of left blocks), End at X=50 (Center) */}
                  <path
                    d="M 28 20 C 38 20, 42 50, 50 50"
                    stroke="#61B6DE"
                    strokeWidth="0.5"
                    fill="none"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M 28 50 L 50 50"
                    stroke="#E1306C"
                    strokeWidth="0.5"
                    fill="none"
                    strokeOpacity="0.8"
                  />
                  <path
                    d="M 28 80 C 38 80, 42 50, 50 50"
                    stroke="#00C853"
                    strokeWidth="0.5"
                    fill="none"
                    strokeOpacity="0.6"
                  />

                  {/* Output Path - Start at X=50 (Center), End at X=72 (Left edge of Looker) */}
                  <path
                    d="M 50 50 L 72 50"
                    stroke="white"
                    strokeWidth="0.3"
                    fill="none"
                    strokeOpacity="0.3"
                    strokeDasharray="2 1"
                  />

                  {/* Moving Data Packets */}
                  <circle r="1.2" fill="#61B6DE" filter="url(#packetGlow)">
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      path="M 28 20 C 38 20, 42 50, 50 50"
                    />
                  </circle>
                  <circle r="1.2" fill="#E1306C" filter="url(#packetGlow)">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M 28 50 L 50 50" />
                  </circle>
                  <circle r="1.2" fill="#00C853" filter="url(#packetGlow)">
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path="M 28 80 C 38 80, 42 50, 50 50"
                    />
                  </circle>
                  <circle r="1.5" fill="white" filter="url(#packetGlow)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M 50 50 L 72 50" />
                  </circle>
                </svg>

                {/* UI Nodes Layer */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Left Source Nodes - Precisely mapped to Y=20%, 50%, 80% */}
                  <div className="absolute left-[6%] top-[20%] -translate-y-1/2 w-[22%] pointer-events-auto">
                    <button
                      className="w-full bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 p-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 shadow-2xl hover:border-primary/50 transition-colors group"
                      aria-label="Źródło danych: Sklep (Store)"
                    >
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <ShoppingCart size={14} aria-hidden="true" />
                      </div>
                      <span className="text-xxxs md:text-xxs font-black text-gray-200 tracking-wider uppercase">
                        Store
                      </span>
                    </button>
                  </div>

                  <div className="absolute left-[6%] top-[50%] -translate-y-1/2 w-[22%] pointer-events-auto">
                    <button
                      className="w-full bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 p-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 shadow-2xl hover:border-instagram/50 transition-colors group"
                      aria-label="Źródło danych: CRM"
                    >
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-instagram/20 flex items-center justify-center text-instagram group-hover:bg-instagram group-hover:text-white transition-all">
                        <Users size={14} aria-hidden="true" />
                      </div>
                      <span className="text-xxxs md:text-xxs font-black text-gray-200 tracking-wider uppercase">
                        CRM
                      </span>
                    </button>
                  </div>

                  <div className="absolute left-[6%] top-[80%] -translate-y-1/2 w-[22%] pointer-events-auto">
                    <button
                      className="w-full bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 p-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 shadow-2xl hover:border-success/50 transition-colors group"
                      aria-label="Źródło danych: POS"
                    >
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-success/20 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all">
                        <Store size={14} aria-hidden="true" />
                      </div>
                      <span className="text-xxxs md:text-xxs font-black text-gray-200 tracking-wider uppercase">
                        POS
                      </span>
                    </button>
                  </div>

                  {/* Center Engine Reactor - Perfectly at 50/50 */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#4285F4]/20 rounded-full blur-[40px] animate-pulse"></div>
                      <div className="absolute -inset-2 border-2 border-[#4285F4]/30 rounded-full animate-spin-slow border-dashed"></div>
                      <div className="relative z-20 w-16 h-16 md:w-24 md:h-24 bg-[#0F172A] rounded-3xl border-2 border-[#4285F4] flex flex-col items-center justify-center shadow-[0_0_40px_rgba(66,133,244,0.3)]">
                        <Database size={28} className="text-white mb-1" />
                        <div className="text-[7px] md:text-xxxs font-black text-[#4285F4] uppercase tracking-tighter text-center leading-none">
                          Engine
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Output Dashboard - Positioned at 72% Left */}
                  <div className="absolute left-[72%] top-1/2 -translate-y-1/2 w-[24%] pointer-events-auto">
                    <div className="bg-gradient-to-br from-secondary to-dark border border-white/20 p-2 md:p-4 rounded-2xl flex items-center gap-2 md:gap-3 shadow-2xl shadow-black/50 hover:-translate-y-1 transition-transform group">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        <BarChart3 size={18} />
                      </div>
                      <div>
                        <div className="text-[7px] md:text-xxxs text-blue-300 uppercase font-black mb-0.5 tracking-widest leading-none">
                          Dashboard
                        </div>
                        <span className="text-xxs md:text-sm font-black text-white uppercase tracking-tighter">
                          Looker
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
            @keyframes flow-dash {
                to { stroke-dashoffset: -20; }
            }
            .animate-flow-dash {
                animation: flow-dash 1s linear infinite;
            }
            .animate-spin-slow {
                animation: spin 10s linear infinite;
            }
          `}</style>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-[#F9FAFB] relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={CONTENT.faq.title} className="mb-12" />

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-primary/50 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-dark text-lg pr-4">{faq.q}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-primary text-white rotate-180' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100/50">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <StandardCta
        title={CONTENT.cta.title}
        description={CONTENT.cta.text}
        buttonText={CONTENT.cta.button}
        icon={Activity}
        onClick={() => openModal('audit')}
        bgClassName="bg-white border-t border-gray-100"
      />
    </div>
  );
};

export default Analytics;
