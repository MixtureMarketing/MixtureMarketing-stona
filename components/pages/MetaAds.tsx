import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Megaphone,
  Target,
  Image as ImageIcon,
  Heart,
  Share2,
  MousePointerClick,
  MessageSquare,
  Globe,
  Play,
  Layers,
  Repeat,
  Zap,
  CheckCircle2,
  Eye,
  ChevronDown,
  ShoppingBag,
  ShoppingCart,
  Server,
  Lock,
  Database,
  Briefcase,
  Music,
  Linkedin,
  Terminal,
  Sparkles,
  FileText,
  ArrowRight,
  Users,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import Seo from '../common/Seo';
import { useModal } from '../../context/ModalContext';
import { META_ADS_CONTENT as CONTENT } from '../../data/content';
import PricingTable from '../common/PricingTable';
import { cmsService } from '../../services/cmsService';
import { PricingSectionData, PricingTier } from '../../types';

const MetaAds: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [strategyType, setStrategyType] = useState<'ecommerce' | 'b2b'>('ecommerce');
  const [funnelStep, setFunnelStep] = useState(0);
  const [pricingData, setPricingData] = useState<PricingSectionData | null>(null);

  // Random particles for funnel animation - moved outside or use stable seed
  const [particles] = useState(() =>
    [...Array(20)].map((_, i) => ({
      left: (i * 7) % 100, // Deterministic "random"
      top: (i * 13) % 100,
      delay: (i * 0.2) % 5,
      duration: 3 + ((i * 0.5) % 2),
    })),
  );

  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
    cmsService.getPricingSection('meta-ads').then((data) => {
      if (data) {
        const tiersWithActions = data.tiers.map((tier: PricingTier) => ({
          ...tier,
          onCtaClick: () =>
            openModal('marketing', {
              specificType: 'ads',
              package: tier.title,
            }),
        }));
        setPricingData({ ...data, tiers: tiersWithActions });
      }
    });
  }, [openModal]);

  // Funnel Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFunnelStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const funnelStages = CONTENT.funnel.stages.map((stage, i) => {
    const icons = [
      <Eye key="eye" size={20} />,
      <MousePointerClick key="click" size={20} />,
      <ShoppingCart key="cart" size={20} />,
      <Heart key="heart" size={20} />,
    ];
    const colors = ['#61B6DE', '#E1306C', '#00C853', '#833AB4'];
    return { ...stage, icon: icons[i], color: colors[i] };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-instagram/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image || '/assets/images/meta-ads.png'}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: CONTENT.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        }}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden">
        <AmbientBackground />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => navigate('/marketing/')}
            className="group flex items-center text-sm font-semibold text-gray-700 hover:text-secondary mb-8 transition-colors"
            aria-label="Wróć do menu marketingu"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Wróć do Marketingu
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 relative z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in shadow-lg">
                <Megaphone size={14} /> {CONTENT.hero.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-tight animate-fade-in-up">
                {CONTENT.hero.title.line1} <br />
                {CONTENT.hero.title.line2}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#833AB4] to-[#E1306C]">
                  {CONTENT.hero.title.accent}
                </span>
              </h1>

              <p
                className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
                dangerouslySetInnerHTML={{ __html: CONTENT.hero.description }}
              />

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <Button
                  onClick={() => openModal('marketing', { specificType: 'ads' })}
                  icon={<ArrowRight size={18} />}
                >
                  {CONTENT.hero.cta}
                </Button>
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-full border border-gray-100 text-sm font-bold text-gray-600 shadow-sm cursor-default">
                  <Users size={16} className="text-instagram" /> {CONTENT.hero.microCopy}
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full relative h-[500px] flex justify-center items-center overflow-hidden mask-fade-y">
              <div className="absolute inset-0 bg-gradient-to-t from-[#F9FAFB] via-transparent to-[#F9FAFB] z-10 pointer-events-none"></div>

              <div className="w-[320px] relative animate-infinite-scroll-y opacity-80 hover:opacity-100 transition-opacity duration-500">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full p-[2px]">
                        <div className="w-full h-full bg-white rounded-full border-2 border-transparent overflow-hidden">
                          <div className="w-full h-full bg-gray-200"></div>
                        </div>
                      </div>
                      <div>
                        <div className="h-2 w-24 bg-gray-800 rounded mb-1"></div>
                        <div className="h-1.5 w-12 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="h-48 bg-gray-100 relative">
                      {item === 2 ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-instagram/10 text-instagram font-bold">
                          REKLAMA WIDEO
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between mb-3 text-gray-600">
                        <div className="flex gap-3">
                          <Heart size={20} />
                          <MessageSquare size={20} />
                        </div>
                        <Share2 size={20} />
                      </div>
                      {item === 2 && (
                        <div className="bg-blue-50 text-secondary text-xs font-bold p-2 rounded-lg text-center mb-2">
                          Kup Teraz
                        </div>
                      )}
                      <div className="h-2 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FUNNEL ARCHITECTURE --- */}
      <section className="py-24 bg-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            title={CONTENT.funnel.title}
            description={CONTENT.funnel.description}
            className="mb-24"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7 relative">
              <div className="relative h-[700px] flex flex-col items-center justify-center perspective-[2500px]">
                <div className="absolute inset-0 z-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary/0 via-primary/20 to-[#00C853]/0 blur-sm"></div>
                  <div className="absolute inset-0 overflow-hidden">
                    {particles.map((p, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-white opacity-40 animate-funnel-particle"
                        style={{
                          left: `${p.left}%`,
                          top: `${p.top}%`,
                          animationDelay: `${p.delay}s`,
                          animationDuration: `${p.duration}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="relative w-full space-y-[-20px]">
                  {funnelStages.map((stage, i) => {
                    const isActive = i === funnelStep;
                    const scale = 1 - i * 0.15;
                    const rotation = 30;
                    return (
                      <div
                        key={i}
                        className="relative transition-all duration-1000 ease-spring"
                        style={{
                          transform: `scale(${isActive ? scale + 0.08 : scale}) rotateX(${rotation}deg) translateZ(${isActive ? '40px' : '0px'})`,
                          zIndex: 10 - i,
                          opacity: isActive ? 1 : 0.3 + i * 0.1,
                        }}
                      >
                        {i > 0 && (
                          <div
                            className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-24 border-x border-current opacity-10 pointer-events-none"
                            style={{
                              color: stage.color,
                              clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)',
                              background: `linear-gradient(to bottom, transparent, ${stage.color}20)`,
                            }}
                          ></div>
                        )}

                        <div
                          className={`relative w-full h-36 rounded-[3rem] border-2 transition-all duration-700 overflow-hidden group
                                                ${isActive ? 'bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-current' : 'bg-white/5 border-white/10 backdrop-blur-sm'}
                                            `}
                          style={{ color: stage.color }}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-current opacity-[0.03] animate-pulse"></div>
                          )}

                          <div className="absolute inset-0 flex items-center justify-between px-16 md:px-24">
                            <div className="flex items-center gap-8">
                              <div
                                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-700 ${isActive ? 'rotate-0 scale-110' : '-rotate-12 scale-90 opacity-50'}`}
                                style={{
                                  backgroundColor: stage.color,
                                  boxShadow: `0 20px 40px -10px ${stage.color}60`,
                                }}
                              >
                                {React.cloneElement(stage.icon as React.ReactElement<any>, {
                                  size: 36,
                                  strokeWidth: 2.5,
                                })}
                              </div>

                              <div className="transition-transform duration-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-xxs font-black uppercase tracking-[0.5em] opacity-40">
                                    {stage.step}
                                  </span>
                                  {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-current animate-ping"></div>
                                  )}
                                </div>
                                <h3
                                  className={`text-3xl font-black tracking-tighter ${isActive ? 'text-dark' : 'text-white/40'}`}
                                >
                                  {stage.label}
                                </h3>
                              </div>
                            </div>

                            <div
                              className={`hidden lg:flex gap-4 transition-all duration-700 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                            >
                              {i === 0 && (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
                                    <ImageIcon size={20} />
                                  </div>
                                  <span className="text-xxxs font-bold">ADS</span>
                                </div>
                              )}
                              {i === 1 && (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <Play size={20} />
                                  </div>
                                  <span className="text-xxxs font-bold">REELS</span>
                                </div>
                              )}
                              {i === 2 && (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                    <ShoppingCart size={20} />
                                  </div>
                                  <span className="text-xxxs font-bold">SHOP</span>
                                </div>
                              )}
                              {i === 3 && (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                    <Heart size={20} />
                                  </div>
                                  <span className="text-xxxs font-bold">LTV</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#0B1120] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Zap size={14} className="fill-current" />
                      <span className="text-xxs font-black uppercase tracking-widest">
                        System Operational
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">
                      {CONTENT.funnel.commandCenter.title}
                      <br />
                      {CONTENT.funnel.commandCenter.subtitle}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-success animate-ping"></div>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <h3 className="text-primary font-bold text-sm mb-4 flex items-center gap-2">
                      <Target size={16} /> {CONTENT.funnel.commandCenter.goalsLabel}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                      "{funnelStages[funnelStep].desc}"
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="text-xxs text-gray-300 uppercase block mb-1">
                          Key Metric
                        </span>
                        <span className="text-sm font-bold text-white">
                          {funnelStep === 0
                            ? 'CTR / CPM'
                            : funnelStep === 1
                              ? 'Video Views'
                              : funnelStep === 2
                                ? 'ROAS / CPA'
                                : 'Retention'}
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="text-xxs text-gray-300 uppercase block mb-1">
                          Priority
                        </span>
                        <span className="text-sm font-bold text-[#FFD700]">CRITICAL</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-300">
                      <span>{CONTENT.funnel.commandCenter.efficiencyLabel}</span>
                      <span className="text-success">98.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-[#00C853] transition-all duration-1000 ease-out"
                        style={{ width: `${85 + funnelStep * 4}%` }}
                      ></div>
                    </div>
                  </div>

                  <ul className="space-y-4 pt-4">
                    {CONTENT.funnel.commandCenter.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-primary" /> {feat}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => openModal('marketing', { specificType: 'ads' })}
                    variant="primary"
                    className="w-full justify-center !bg-white !text-[#0B1120] hover:!bg-primary hover:!text-white border-none py-6 text-lg shadow-xl shadow-primary/20"
                  >
                    {CONTENT.funnel.commandCenter.button}
                  </Button>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CAPI SECTION --- */}
      <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-success text-xs font-bold uppercase tracking-wider mb-6">
                  <Server size={14} /> {CONTENT.capi.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {CONTENT.capi.title.line1} <br />
                  <span className="text-success">{CONTENT.capi.title.line2}</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {CONTENT.capi.description}
                </p>

                <div className="space-y-4">
                  {CONTENT.capi.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-success/30 transition-colors"
                    >
                      {i === 0 ? (
                        <Database size={24} className="text-success" />
                      ) : (
                        <Target size={24} className="text-instagram" />
                      )}
                      <div>
                        <span className="text-white font-bold block">{feature.title}</span>
                        <span className="text-gray-300 text-sm">{feature.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            <div className="lg:w-1/2 flex justify-center">
              <AnimateOnScroll delay={200}>
                <div className="bg-[#1E293B] rounded-xl p-8 border border-gray-700 shadow-2xl relative w-full max-w-md font-mono text-xs">
                  <div className="flex justify-between items-center text-gray-600 mb-6 border-b border-gray-700 pb-4">
                    <div className="flex items-center gap-2">
                      <Globe size={14} /> Client Browser
                    </div>
                    <div className="text-red-400 font-bold flex items-center gap-1">
                      <Lock size={12} /> BLOCKED
                    </div>
                    <div className="flex items-center gap-2 text-[#405DE6]">
                      <Server size={14} /> Meta Graph API
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-gray-700">
                      {'>'} Initiating Pixel Event...{' '}
                      <span className="text-red-400">Failed (Cookie Blocked)</span>
                    </div>
                    <div className="text-gray-700">{'>'} Switching to Server-Side...</div>
                    <div className="text-white bg-[#0B1120] p-3 rounded border border-gray-700">
                      <span className="text-instagram">POST</span> /events <br />
                      {`{`} <br />
                      &nbsp;&nbsp;"event_name": "Purchase", <br />
                      &nbsp;&nbsp;"event_time": 169420000, <br />
                      &nbsp;&nbsp;"user_data": {`{ "em": "hash...", "ph": "hash..." }`}, <br />
                      &nbsp;&nbsp;"value": 249.00 <br />
                      {`}`}
                    </div>
                    <div className="text-success font-bold">{'>'} Success. Event ID: 849201</div>
                  </div>

                  <div className="absolute -top-3 -right-3 bg-success text-white px-3 py-1 rounded-full text-xxs font-bold shadow-lg animate-pulse">
                    CAPI CONNECTED
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* --- ECOSYSTEM --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.ecosystem.title}
            description={CONTENT.ecosystem.description}
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CONTENT.ecosystem.platforms.map((platform, i) => {
              const icons = [
                <Layers key="meta" size={28} />,
                <Music key="tt" size={28} />,
                <Linkedin key="li" size={28} />,
              ];
              const colors = ['#E1306C', 'black', '#0077B5'];
              return (
                <GlassCard
                  key={i}
                  className={`p-8 border-t-4 transition-transform hover:-translate-y-1`}
                  style={{ borderTopColor: colors[i] }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${colors[i]}15`, color: colors[i] }}
                    >
                      {icons[i]}
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xxs font-bold uppercase">
                      {platform.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{platform.name}</h3>
                  <p className="text-sm text-gray-600 mb-6">{platform.desc}</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {platform.features.map((feat, j) => (
                      <li key={j} className="flex gap-2">
                        <CheckCircle2 size={16} style={{ color: colors[i] }} /> {feat}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- STRATEGY --- */}
      <section className="py-24 bg-[#0B1120] relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-2/5">
              <SectionHeader
                align="left"
                lightMode
                title={CONTENT.strategySelector.title}
                description={CONTENT.strategySelector.description}
                className="mb-10"
              />

              <div className="space-y-4">
                <button
                  onClick={() => setStrategyType('ecommerce')}
                  aria-label="Pokaż strategię dla E-commerce"
                  aria-pressed={strategyType === 'ecommerce'}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                    strategyType === 'ecommerce'
                      ? 'bg-instagram/10 border-instagram shadow-[0_0_30px_rgba(225,48,108,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`p-3 rounded-full ${strategyType === 'ecommerce' ? 'bg-instagram text-white' : 'bg-white/10 text-gray-600'}`}
                  >
                    <ShoppingBag size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${strategyType === 'ecommerce' ? 'text-white' : 'text-gray-600'}`}
                    >
                      {CONTENT.strategySelector.ecommerce.label}
                    </h3>
                    <p className="text-xs text-gray-300">
                      {CONTENT.strategySelector.ecommerce.desc}
                    </p>
                  </div>
                  {strategyType === 'ecommerce' && (
                    <div className="ml-auto w-2 h-2 bg-instagram rounded-full animate-pulse"></div>
                  )}
                </button>

                <button
                  onClick={() => setStrategyType('b2b')}
                  aria-label="Pokaż strategię dla Usług i B2B"
                  aria-pressed={strategyType === 'b2b'}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                    strategyType === 'b2b'
                      ? 'bg-[#833AB4]/10 border-[#833AB4] shadow-[0_0_30px_rgba(131,58,180,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`p-3 rounded-full ${strategyType === 'b2b' ? 'bg-[#833AB4] text-white' : 'bg-white/10 text-gray-600'}`}
                  >
                    <Briefcase size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${strategyType === 'b2b' ? 'text-white' : 'text-gray-600'}`}
                    >
                      {CONTENT.strategySelector.b2b.label}
                    </h3>
                    <p className="text-xs text-gray-300">{CONTENT.strategySelector.b2b.desc}</p>
                  </div>
                  {strategyType === 'b2b' && (
                    <div className="ml-auto w-2 h-2 bg-[#833AB4] rounded-full animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:w-3/5 w-full">
              <div className="bg-[#1E293B] rounded-2xl border border-[#334155] overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
                <div className="bg-[#0F172A] px-4 py-3 flex justify-between items-center border-b border-[#334155]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xxs font-mono text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> Meta_Ads_Manager_v2.0
                  </div>
                  <div className="w-8"></div>
                </div>

                <div className="p-8 flex-1 relative">
                  {strategyType === 'ecommerce' ? (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-[#0B1120] p-4 rounded-xl border border-[#334155]">
                          <div className="text-xxs text-gray-300 uppercase font-bold">ROAS</div>
                          <div className="text-2xl font-black text-instagram">8.4x</div>
                        </div>
                        <div className="bg-[#0B1120] p-4 rounded-xl border border-[#334155]">
                          <div className="text-xxs text-gray-300 uppercase font-bold">
                            Purchases
                          </div>
                          <div className="text-2xl font-black text-white">428</div>
                        </div>
                        <div className="bg-[#0B1120] p-4 rounded-xl border border-[#334155]">
                          <div className="text-xxs text-gray-300 uppercase font-bold">CPR</div>
                          <div className="text-2xl font-black text-success">12zł</div>
                        </div>
                      </div>

                      <div className="bg-instagram/10 border border-instagram/30 p-6 rounded-xl relative overflow-hidden group hover:bg-instagram/20 transition-colors">
                        <div className="absolute top-0 right-0 bg-instagram text-white text-xxs font-bold px-2 py-1 rounded-bl-lg">
                          AI POWERED
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-instagram/20 rounded-lg text-instagram">
                            <Sparkles size={24} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold mb-1">
                              {CONTENT.strategySelector.ecommerce.advantage.title}
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {CONTENT.strategySelector.ecommerce.advantage.desc}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <span className="text-xxs bg-instagram/20 text-instagram px-2 py-1 rounded font-mono">
                                DPA
                              </span>
                              <span className="text-xxs bg-instagram/20 text-instagram px-2 py-1 rounded font-mono">
                                Catalog Sales
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0B1120] border border-[#334155] p-6 rounded-xl hover:border-[#405DE6] transition-colors group">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#1E293B] rounded-lg text-[#405DE6] group-hover:text-white group-hover:bg-[#405DE6] transition-colors">
                            <Repeat size={24} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold mb-1">
                              {CONTENT.strategySelector.ecommerce.remarketing.title}
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {CONTENT.strategySelector.ecommerce.remarketing.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-[#0B1120] p-4 rounded-xl border border-[#334155]">
                          <div className="text-xxs text-gray-300 uppercase font-bold">Leads</div>
                          <div className="text-2xl font-black text-[#833AB4]">142</div>
                        </div>
                        <div className="bg-[#0B1120] p-4 rounded-xl border border-[#334155]">
                          <div className="text-xxs text-gray-300 uppercase font-bold">CPL</div>
                          <div className="text-2xl font-black text-white">45zł</div>
                        </div>
                        <div className="bg-[#0B1120] p-4 rounded-xl border border-[#334155]">
                          <div className="text-xxs text-gray-300 uppercase font-bold">
                            Qual. Ratio
                          </div>
                          <div className="text-2xl font-black text-success">68%</div>
                        </div>
                      </div>

                      <div className="bg-[#833AB4]/10 border border-[#833AB4]/30 p-6 rounded-xl relative overflow-hidden group hover:bg-[#833AB4]/20 transition-colors">
                        <div className="absolute top-0 right-0 bg-[#833AB4] text-white text-xxs font-bold px-2 py-1 rounded-bl-lg">
                          HIGH VOLUME
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#833AB4]/20 rounded-lg text-[#833AB4]">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold mb-1">
                              {CONTENT.strategySelector.b2b.forms.title}
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {CONTENT.strategySelector.b2b.forms.desc}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <span className="text-xxs bg-[#833AB4]/20 text-[#833AB4] px-2 py-1 rounded font-mono">
                                Native
                              </span>
                              <span className="text-xxs bg-[#833AB4]/20 text-[#833AB4] px-2 py-1 rounded font-mono">
                                CRM Sync
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0B1120] border border-[#334155] p-6 rounded-xl hover:border-[#0084FF] transition-colors group">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#1E293B] rounded-lg text-[#0084FF] group-hover:text-white group-hover:bg-[#0084FF] transition-colors">
                            <MessageSquare size={24} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold mb-1">
                              {CONTENT.strategySelector.b2b.messenger.title}
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {CONTENT.strategySelector.b2b.messenger.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      {pricingData && (
        <PricingTable
          title={pricingData.title}
          description={pricingData.description}
          tiers={pricingData.tiers}
        />
      )}

      {/* --- FAQ --- */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Pytania o Social Ads" className="mb-12" />

          <div className="space-y-4">
            {CONTENT.faqs.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'bg-white border-instagram shadow-md' : 'bg-white border-gray-200 hover:border-instagram/50'}`}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span
                    className={`font-bold text-base md:text-lg pr-4 transition-colors ${openFaq === i ? 'text-secondary' : 'text-dark'}`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-instagram text-white rotate-180' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100/50 bg-gray-50/50">
                    <div className="flex gap-3">
                      <div className="w-0.5 min-h-full bg-instagram"></div>
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-instagram/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block p-4 rounded-full bg-white border border-instagram/20 mb-6 shadow-sm animate-pulse">
            <Video size={32} className="text-instagram" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
            {CONTENT.cta.title}
          </h2>
          <p className="text-xl text-gray-600 mb-10">{CONTENT.cta.description}</p>
          <Button
            onClick={() => openModal('marketing', { specificType: 'ads' })}
            variant="primary"
            size="lg"
            className="!bg-instagram hover:!bg-[#C13584] border-transparent"
          >
            {CONTENT.cta.button}
          </Button>
        </div>
      </section>

      <style>{`
        @keyframes scroll-y {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .animate-infinite-scroll-y {
            animation: scroll-y 20s linear infinite;
        }
        .mask-fade-y {
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};

export default MetaAds;
