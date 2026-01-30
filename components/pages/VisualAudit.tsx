/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  Search,
  ArrowRight,
  ScanEye,
  Microscope,
  Activity,
  ChevronDown,
  Palette,
  Terminal,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import StandardFaq from '../common/StandardFaq';
import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import { VisualAuditHeroVisual } from '../visuals/hero/VisualAuditVisual';

import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../data/content';

const VisualAudit: React.FC = () => {
  const [blurActive, setBlurActive] = useState(true);
  const [timer, setTimer] = useState(5.0);
  const [wcagLog, setWcagLog] = useState<string[]>([]);

  // Hooks
  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 5-Second Test Timer
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (!blurActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => Math.max(0, prev - 0.1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [blurActive, timer]);

  // WCAG Simulation Loop
  useEffect(() => {
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

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logs.length) {
        const log = logs[currentLog];
        if (log) {
          setWcagLog((prev) => [
            ...prev.slice(-6),
            `<span class="${log.color}">${log.text}</span>`,
          ]);
        }
        currentLog++;
      } else {
        currentLog = 0; // Loop for visual effect
        setWcagLog([]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-instagram/30">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={CONTENT.hero.badge}
        badgeIcon={Microscope}
        title={{ line1: CONTENT.hero.title.line1, line2: CONTENT.hero.title.line2 }}
        description={CONTENT.hero.description}
        ctaPrimaryText={CONTENT.hero.cta}
        ctaPrimaryOnClick={() => openModal('audit', { specificType: 'visual_audit' })}
        ctaSecondaryNode={
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-gray-300 backdrop-blur-sm">
            <ScanEye size={16} className="text-instagram" /> {CONTENT.hero.microCopy}
          </div>
        }
        backLinkPath="/design/"
        backLinkLabel="Design"
        accentGradientFrom="#E1306C"
        accentGradientTo="#833AB4"
        visual={<VisualAuditHeroVisual />}
      />

      {/* --- 5-SECOND TEST SIMULATOR (INTERACTIVE) --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.test5s.title}
            description={CONTENT.test5s.description}
            className="mb-12"
          />

          <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-900 group cursor-crosshair">
            {/* The "Website" Underneath */}
            <div className="absolute inset-0 bg-light-gray flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-6">
                {CONTENT.test5s.mock.title}
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">{CONTENT.test5s.mock.desc}</p>
              <button className="bg-success text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-transform">
                {CONTENT.test5s.mock.button}
              </button>
              <div className="absolute top-8 left-8 font-bold text-2xl text-dark flex items-center gap-2">
                <div className="w-8 h-8 bg-dark rounded-lg"></div> MIXTURE
              </div>
            </div>

            {/* Blur Layer */}
            <div
              className={`absolute inset-0 bg-white/10 backdrop-blur-xl transition-all duration-300 flex flex-col items-center justify-center z-10 ${blurActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onMouseEnter={() => setBlurActive(false)}
            >
              <div className="bg-black/80 text-white px-6 py-3 rounded-full font-bold flex items-center gap-3 backdrop-blur-md shadow-2xl border border-white/20 animate-pulse">
                <Eye size={20} /> {CONTENT.test5s.labels.cta}
              </div>
            </div>

            {/* Timer UI */}
            <div
              className={`absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-xl font-bold border border-red-500 z-20 transition-opacity ${!blurActive ? 'opacity-100' : 'opacity-0'}`}
              onMouseLeave={() => {
                setBlurActive(true);
                setTimer(5.0);
              }}
            >
              <span className="text-red-500 mr-2">REC</span>
              {timer.toFixed(1)}s
            </div>

            {/* Overlay when time is up */}
            {timer === 0 && !blurActive && (
              <div className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in">
                <h3 className="text-3xl font-bold mb-4 text-instagram">
                  {CONTENT.test5s.labels.timeUp}
                </h3>
                <p className="text-lg text-gray-300 mb-8 max-w-md">
                  {CONTENT.test5s.labels.summary}
                </p>
                <Button
                  onClick={() => {
                    setBlurActive(true);
                    setTimer(5.0);
                  }}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  {CONTENT.test5s.labels.retry}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- WCAG & ACCESSIBILITY SCANNER (TECH) --- */}
      <section className="py-24 bg-deep-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Explanation */}
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldAlert size={14} /> {CONTENT.wcag.badge}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {CONTENT.wcag.title.line1}
                <br />
                {CONTENT.wcag.title.line2}
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {CONTENT.wcag.description}
              </p>

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

            {/* Right: Terminal Simulator */}
            <div className="lg:w-1/2 w-full">
              <AnimateOnScroll delay={200}>
                <div className="bg-[#1E293B] rounded-xl shadow-2xl border border-[#334155] overflow-hidden font-mono text-xs">
                  {/* Terminal Header */}
                  <div className="bg-[#0F172A] px-4 py-2 flex items-center gap-2 border-b border-[#334155]">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-gray-700">wcag-scanner --verbose</div>
                  </div>

                  {/* Terminal Body */}
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
        </div>
      </section>

      {/* --- HEURISTIC ANALYSIS (RADAR) --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.heuristics.title}
            description={CONTENT.heuristics.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTENT.heuristics.items.map((item, i) => (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="p-6 rounded-2xl bg-light-gray border border-gray-100 hover:border-instagram transition-all group h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-dark">{item.label}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${item.score > 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {item.score}/100
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${item.score > 70 ? 'bg-success' : 'bg-instagram'}`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-gray-700 mt-auto">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}

            <AnimateOnScroll delay={500}>
              <div className="p-6 rounded-2xl bg-dark text-white h-full flex flex-col justify-center items-center text-center shadow-lg">
                <Activity size={32} className="text-instagram mb-4" />
                <h3 className="font-bold text-lg mb-2">{CONTENT.heuristics.summary.title}</h3>
                <p className="text-sm text-gray-300 mb-6">{CONTENT.heuristics.summary.desc}</p>
                <Button
                  onClick={() => openModal('audit')}
                  variant="primary"
                  size="sm"
                  className="!bg-instagram hover:!bg-[#C2185B] border-none"
                >
                  {CONTENT.heuristics.summary.button}
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-light-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Pytania o Audyt" className="mb-12" />
          <StandardFaq items={CONTENT.faqs} />
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-dark text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-block p-4 rounded-full bg-instagram/20 mb-6 backdrop-blur-sm animate-pulse">
            <Fingerprint size={32} className="text-instagram" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{CONTENT.cta.title}</h2>
          <p className="text-xl text-gray-300 mb-10">{CONTENT.cta.description}</p>
          <Button
            onClick={() => openModal('audit')}
            variant="white"
            size="lg"
            className="text-dark"
          >
            {CONTENT.cta.button}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default VisualAudit;
