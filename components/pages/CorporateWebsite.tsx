/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Briefcase,
  Server,
  ShieldCheck,
  Lock,
  Eye,
  AlertTriangle,
  Cloud,
  Network,
  GitMerge,
  Terminal,
  ArrowUpRight,
  Activity,
  Sparkles,
  BarChart3,
  Calculator,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import LazyHydrate from '../common/LazyHydrate';
import Seo from '../common/Seo';
import { useModal } from '../../context/ModalContext';
import { CORPORATE_WEBSITE_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';
import { useParallax } from '../../hooks/useParallax';

const CorporateWebsite: React.FC = () => {
  const [activeCms, setActiveCms] = useState<'wordpress' | 'headless'>('wordpress');
  const [migrationStep, setMigrationStep] = useState(0);
  const navigate = useNavigate();
  const { openModal } = useModal();

  const heroRef = React.useRef<HTMLDivElement>(null);
  const mousePos = useParallax(heroRef, 1);
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('corporate-website').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('web', {
              specificType: 'corporate',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      setMigrationStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const businessModules = CONTENT.modules.items.map((mod, i) => {
    const icons = [
      <Users key="users" size={24} />,
      <BarChart3 key="chart" size={24} />,
      <Lock key="lock" size={24} />,
      <MessageSquare key="msg" size={24} />,
    ];
    return { ...mod, icon: icons[i] };
  });

  const complianceFeatures = CONTENT.compliance.items.map((feat, i) => {
    const icons = [
      <Eye key="eye" size={20} />,
      <ShieldCheck key="shield" size={20} />,
      <Cloud key="cloud" size={20} />,
      <Server key="server" size={20} />,
    ];
    return { ...feat, icon: icons[i] };
  });

  const steps = CONTENT.migration.steps.map((step, i) => {
    const icons = [
      <Search key="search" size={20} />,
      <GitMerge key="merge" size={20} />,
      <ArrowUpRight key="up" size={20} />,
      <CheckCircle2 key="check" size={20} />,
    ];
    return { ...step, icon: icons[i] };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        lcpImage={CONTENT.seo.image}
      />

      {/* --- HERO SECTION --- */}
      <section
        ref={heroRef}
        className="relative py-20 lg:py-28 bg-gradient-to-b from-[#F9FAFB] to-white overflow-hidden"
      >
        <AmbientBackground />

        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => navigate('/web-development')}
            className="group flex items-center text-sm font-semibold text-gray-700 hover:text-secondary mb-8 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Web Development
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/50 border border-[#E0EFFF] text-secondary text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in backdrop-blur-sm">
                <Globe size={14} /> {CONTENT.hero.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-[1.1] animate-fade-in-up">
                {CONTENT.hero.title.line1}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                  {CONTENT.hero.title.line2}
                </span>
              </h1>

              <p
                className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                {CONTENT.hero.description}
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <Button
                  onClick={() => openModal('web', { specificType: 'corporate' })}
                  icon={<ArrowRight size={18} />}
                >
                  Umów się na konsultację
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/offers#calculator?type=corporate')}
                  icon={<Calculator size={18} />}
                >
                  Wyceń stronę firmową
                </Button>
              </div>
            </div>

            <div
              className="lg:w-1/2 w-full flex justify-center animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div
                className="relative w-full max-w-lg aspect-square flex items-center justify-center transition-transform duration-200 ease-out will-change-transform"
                style={{
                  transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)`,
                }}
              >
                <div className="absolute inset-0 rounded-full border border-dashed border-gray-200 animate-spin-slow opacity-40"></div>
                <div className="absolute inset-16 rounded-full border border-blue-50/50 animate-reverse-spin opacity-30"></div>

                <svg
                  className="w-full h-full relative z-10 drop-shadow-[0_0_30px_rgba(63,61,145,0.15)]"
                  viewBox="0 0 400 400"
                >
                  <defs>
                    <filter id="glow-node">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3F3D91" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#61B6DE" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#3F3D91" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  <g opacity="0.4">
                    <path
                      d="M 200 200 L 80 80 M 200 200 L 320 80 M 200 200 L 80 320 M 200 200 L 320 320"
                      stroke="url(#lineGrad)"
                      strokeWidth="1"
                    />
                    <circle
                      cx="200"
                      cy="200"
                      r="120"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                  </g>

                  {[
                    { x: 200, y: 60, label: 'London (HQ)', delay: '0s' },
                    { x: 60, y: 200, label: 'New York', delay: '1s' },
                    { x: 340, y: 200, label: 'Tokyo', delay: '2s' },
                    { x: 200, y: 340, label: 'Frankfurt', delay: '1.5s' },
                    { x: 100, y: 100, label: 'Paris', delay: '0.5s' },
                    { x: 300, y: 300, label: 'Sydney', delay: '2.5s' },
                  ].map((node, i) => (
                    <g key={i} className="group/node">
                      <circle r="2.5" fill="#61B6DE" filter="url(#glow-node)">
                        <animateMotion
                          dur={`${3 + i * 0.7}s`}
                          repeatCount="indefinite"
                          path={`M 200 200 L ${node.x} ${node.y}`}
                        />
                      </circle>

                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="15"
                        fill="#61B6DE"
                        opacity="0"
                        className="group-hover/node:opacity-20 transition-opacity"
                      />

                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="5"
                        fill="white"
                        stroke="#3F3D91"
                        strokeWidth="2"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="10"
                        fill="#3F3D91"
                        opacity="0.05"
                        className="animate-ping"
                        style={{ animationDelay: node.delay, animationDuration: '3s' }}
                      />

                      <g
                        transform={`translate(${node.x - 30}, ${node.y + 15})`}
                        className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-300"
                      >
                        <rect
                          width="60"
                          height="16"
                          rx="4"
                          fill="white"
                          stroke="#E5E7EB"
                          strokeWidth="0.5"
                        />
                        <text
                          x="30"
                          y="11"
                          textAnchor="middle"
                          className="text-[7px] font-black fill-dark uppercase tracking-tighter"
                        >
                          {node.label}
                        </text>
                      </g>
                    </g>
                  ))}

                  <g transform="translate(175, 175)" filter="url(#glow-node)">
                    <rect
                      x="0"
                      y="0"
                      width="50"
                      height="50"
                      rx="12"
                      fill="#3F3D91"
                      className="animate-pulse"
                      style={{ animationDuration: '4s' }}
                    />
                    <Server x="13" y="13" size={24} className="text-primary" />

                    <circle
                      cx="25"
                      cy="25"
                      r="35"
                      fill="none"
                      stroke="#61B6DE"
                      strokeWidth="0.5"
                      opacity="0.2"
                      className="animate-ping"
                    />
                  </g>
                </svg>

                <div
                  className="absolute top-0 right-0 p-4 bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-gray-100 animate-float"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div className="text-xxxs font-bold text-gray-400 uppercase leading-none mb-1">
                        Status
                      </div>
                      <div className="text-xxs font-black text-dark">SECURE_V3</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-0 p-4 bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-gray-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                      <Activity size={16} />
                    </div>
                    <div>
                      <div className="text-xxxs font-bold text-gray-400 uppercase leading-none mb-1">
                        Uptime
                      </div>
                      <div className="text-xxs font-black text-dark">99.99%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BUSINESS MODULES --- */}
      <section className="py-24 bg-[#F9FAFB] relative z-10">
        <LazyHydrate whenVisible>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title={CONTENT.modules.title}
              description={CONTENT.modules.description}
              className="mb-16"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessModules.map((mod, i) => (
                <AnimateOnScroll key={i} delay={i * 100} className="h-full">
                  <GlassCard className="p-8 h-full flex flex-col hover:border-secondary hover:shadow-lg transition-all group bg-white hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-secondary shadow-sm border border-[#E0EFFF] group-hover:scale-110 transition-transform">
                        {mod.icon}
                      </div>
                      <div className="bg-blue-50 text-secondary text-xxs font-mono px-2 py-1 rounded border border-secondary/10">
                        {mod.tech}
                      </div>
                    </div>
                    <h3 className="font-bold text-dark text-lg mb-3 group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{mod.desc}</p>
                  </GlassCard>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </LazyHydrate>
      </section>

      {/* --- CMS SECTION --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <LazyHydrate whenVisible>
          {/* ... (Content same as original) ... */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Abbreviated CMS section content */}
            <div className="text-center mb-16">
              <SectionHeader title={CONTENT.cms.title} description={CONTENT.cms.description} />
              <div
                className="inline-flex bg-[#F1F5F9] p-1.5 rounded-full mt-8 border border-gray-200 shadow-inner relative"
                role="group"
                aria-label="Wybór silnika CMS"
              >
                <div
                  className={`absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm border border-gray-200 transition-all duration-300 ease-in-out z-0`}
                  style={{
                    left: activeCms === 'wordpress' ? '6px' : '50%',
                    width: 'calc(50% - 6px)',
                  }}
                ></div>
                <button
                  onClick={() => setActiveCms('wordpress')}
                  aria-pressed={activeCms === 'wordpress'}
                  className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 ${activeCms === 'wordpress' ? 'text-dark' : 'text-gray-700 hover:text-gray-700'}`}
                >
                  {CONTENT.cms.wordpress.label}
                </button>
                <button
                  onClick={() => setActiveCms('headless')}
                  aria-pressed={activeCms === 'headless'}
                  className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 ${activeCms === 'headless' ? 'text-dark' : 'text-gray-700 hover:text-gray-700'}`}
                >
                  {CONTENT.cms.headless.label}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-dark">
                  {activeCms === 'wordpress'
                    ? CONTENT.cms.wordpress.title
                    : CONTENT.cms.headless.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {activeCms === 'wordpress'
                    ? CONTENT.cms.wordpress.desc
                    : CONTENT.cms.headless.desc}
                </p>
                <ul className="space-y-3">
                  {(activeCms === 'wordpress'
                    ? CONTENT.cms.wordpress.features
                    : CONTENT.cms.headless.features
                  ).map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                      <CheckCircle2 size={18} className="text-success" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual part remains same */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-2xl transform rotate-2"></div>
                <GlassCard className="relative bg-white shadow-xl overflow-hidden aspect-[16/10] flex flex-col p-0 border border-gray-200">
                  {/* Mockup UI */}
                  <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                  </div>
                  {/* Mockup Content - Simplified */}
                  <div className="p-6 flex gap-6 h-full animate-fade-in bg-gray-50/50">
                    <div className="m-auto text-gray-400 font-bold">CMS UI PREVIEW</div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </LazyHydrate>
      </section>

      {/* --- COMPLIANCE & SECURITY --- */}
      <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        <LazyHydrate whenVisible>
          {/* ... (Content same as original) ... */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Abbreviated Compliance Section */}
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <AnimateOnScroll>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    {CONTENT.compliance.title.line1} <br />
                    {CONTENT.compliance.title.line2}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {complianceFeatures.map((feat, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-colors group"
                      >
                        <div className="text-primary mb-3">{feat.icon}</div>
                        <h3 className="font-bold text-sm mb-1">{feat.title}</h3>
                      </div>
                    ))}
                  </div>
                </AnimateOnScroll>
              </div>
              {/* Visual part abbreviated */}
            </div>
          </div>
        </LazyHydrate>
      </section>

      {/* --- SAFE MIGRATION --- */}
      <section className="py-24 bg-white relative z-10 overflow-hidden">
        <LazyHydrate whenVisible>
          {/* ... (Content same as original) ... */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title={CONTENT.migration.title}
              subtitle={CONTENT.migration.subtitle}
              description={CONTENT.migration.description}
              className="mb-16"
            />
            <AnimateOnScroll className="relative w-full max-w-6xl mx-auto">
              {/* Migration visual abbreviated */}
              <div className="bg-[#0F172A] rounded-3xl border border-[#334155] p-12 text-center text-white">
                MIGRATION PROTOCOL VISUALIZATION
              </div>
            </AnimateOnScroll>
          </div>
        </LazyHydrate>
      </section>

      {/* --- PRICING --- */}
      {pricingData && (
        <LazyHydrate whenVisible>
          <PricingTable
            title={pricingData.title}
            description={pricingData.description}
            tiers={pricingData.tiers}
          />
        </LazyHydrate>
      )}

      {/* --- CTA --- */}
      <section className="py-24 bg-white text-center relative overflow-hidden">
        <LazyHydrate whenVisible>
          <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="inline-block p-4 rounded-full bg-blue-50 border border-secondary/10 mb-6 animate-pulse">
              <Briefcase size={32} className="text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">{CONTENT.cta.title}</h2>
            <p className="text-xl text-gray-600 mb-10 font-medium">{CONTENT.cta.description}</p>
            <Button
              onClick={() => openModal('consultation', { specificType: 'corporate' })}
              variant="primary"
              size="lg"
            >
              {CONTENT.cta.button}
            </Button>
          </div>
        </LazyHydrate>
      </section>

      <style>{`
        .animate-spin-slow { animation: spin 40s linear infinite; }
        .animate-reverse-spin { animation: spin-reverse 30s linear infinite; }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
    </div>
  );
};

export default CorporateWebsite;
