import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Printer,
  Box,
  Scissors,
  CheckCircle2,
  ArrowRight,
  Package,
  FileText,
  Ruler,
  Droplet,
  Scan,
  Scale,
  Palette,
  Recycle,
  Sheet,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import { useModal } from '../../context/ModalContext';
import { useParallax } from '../../hooks/useParallax';
import Seo from '../common/Seo';
import { PRINT_DESIGN_CONTENT as CONTENT } from '../../data/content';

const TiltCard = ({ activeFinish }: { activeFinish: 'none' | 'gold' | 'uv' | 'emboss' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const shadowX = Math.max(-3, Math.min(3, -rotation.y / 6));
  const shadowY = Math.max(-3, Math.min(3, rotation.x / 6));
  const cardColor = '#213261';

  const goldStyle = {
    background: 'linear-gradient(110deg, #BF953F 20%, #FCF6BA 40%, #B38728 60%, #FBF5B7 80%)',
    backgroundSize: '200% 200%',
    backgroundPosition: `${glare.x}% ${glare.y}%`,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  };

  const goldTextStyle = {
    ...goldStyle,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const embossImgStyle = {
    filter: `drop-shadow(${shadowX}px ${shadowY}px 1px rgba(255,255,255,0.2)) drop-shadow(${-shadowX}px ${-shadowY}px 2px rgba(0,0,0,0.9)) opacity(0.15)`,
  };

  const embossTextStyle = {
    textShadow: `${shadowX}px ${shadowY}px 0.5px rgba(255,255,255,0.2), ${-shadowX}px ${-shadowY}px 2px rgba(0,0,0,0.9)`,
  };

  const uvStyle = (xPos: number) => ({
    maskImage: 'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskImage: 'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    background: `linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) ${xPos}%, rgba(255,255,255,0) 100%)`,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2)) brightness(1.2)',
  });

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-xl mx-auto">
      <div
        className="w-full aspect-[1.75/1] cursor-pointer"
        style={{ perspective: '2500px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          ref={cardRef}
          className="w-full h-full relative transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
          }}
        >
          <div
            className="w-full h-full relative transition-transform duration-1000 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2rem]"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
            }}
          >
            <div
              className="absolute inset-0 rounded-[2rem] overflow-hidden border border-white/10 p-6 md:p-10 flex flex-col justify-between"
              style={{
                backgroundColor: cardColor,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.1), transparent 60%)`,
                  mixBlendMode: 'overlay',
                }}
              ></div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
                    <img
                      src="/assets/images/sygnet-mixture-marketing-fioletowe.svg"
                      alt="Logo"
                      className={`w-full h-full object-contain ${activeFinish === 'emboss' || activeFinish === 'gold' ? 'opacity-0' : 'opacity-100'}`}
                    />

                    {activeFinish === 'gold' && (
                      <div
                        className="absolute inset-0"
                        style={{
                          ...goldStyle,
                          maskImage: 'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
                          maskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center',
                          WebkitMaskImage:
                            'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
                          WebkitMaskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                        }}
                      ></div>
                    )}
                    {activeFinish === 'emboss' && (
                      <img
                        src="/assets/images/sygnet-mixture-marketing-fioletowe.svg"
                        alt="Logo"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={embossImgStyle}
                      />
                    )}
                    {activeFinish === 'uv' && (
                      <div className="absolute inset-0" style={uvStyle(glare.x)}></div>
                    )}
                  </div>
                  <div className="w-px h-8 md:h-10 bg-white/20"></div>
                  <h3
                    className={`text-lg md:text-2xl font-bold tracking-widest uppercase ${activeFinish === 'emboss' ? 'text-dark' : 'text-white'}`}
                    style={
                      activeFinish === 'gold'
                        ? goldTextStyle
                        : activeFinish === 'emboss'
                          ? embossTextStyle
                          : {}
                    }
                  >
                    Mixture Marketing
                  </h3>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end mt-4 md:mt-6">
                <div className="text-xl md:text-2xl font-medium text-white mb-1 tracking-tight">
                  Jakub Niedziela
                </div>
                <div className="text-xxxs md:text-xxs uppercase tracking-[0.4em] text-primary font-black">
                  CEO & Founder
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4 md:pt-6">
                <div className="space-y-1 md:space-y-1.5 text-white">
                  <div className="text-xxs md:text-xs font-mono opacity-80 flex items-center gap-2 md:gap-3">
                    <span className="text-primary font-bold">T:</span> 794 443 551
                  </div>
                  <div className="text-xxs md:text-xs font-mono opacity-80 flex items-center gap-2 md:gap-3">
                    <span className="text-primary font-bold">E:</span> info@mixturemarketing.pl
                  </div>
                  <div className="text-xxs md:text-xs font-mono opacity-80 flex items-center gap-3 md:gap-4">
                    <span className="text-primary font-bold">W:</span> mixturemarketing.pl
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 rounded-[2.5rem] overflow-hidden border border-white/10 flex flex-col items-center justify-center p-6 md:p-10"
              style={{
                backgroundColor: cardColor,
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${100 - glare.x}% ${glare.y}%, rgba(255,255,255,0.1), transparent 60%)`,
                  mixBlendMode: 'overlay',
                }}
              ></div>

              <div className="relative w-20 h-20 md:w-32 md:h-32 flex items-center justify-center mb-4 md:mb-8">
                <img
                  src="/assets/images/sygnet-mixture-marketing-fioletowe.svg"
                  alt="Logo Back"
                  className={`w-full h-full object-contain ${activeFinish === 'emboss' || activeFinish === 'gold' ? 'opacity-0' : 'opacity-100'}`}
                />

                {activeFinish === 'gold' && (
                  <div
                    className="absolute inset-0"
                    style={{
                      ...goldStyle,
                      maskImage: 'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskImage:
                        'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                    }}
                  ></div>
                )}
                {activeFinish === 'emboss' && (
                  <img
                    src="/assets/images/sygnet-mixture-marketing-fioletowe.svg"
                    alt="Logo Back Emboss"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={embossImgStyle}
                  />
                )}
                {activeFinish === 'uv' && (
                  <div className="absolute inset-0" style={uvStyle(100 - glare.x)}></div>
                )}
              </div>

              <h2
                className={`text-2xl md:text-3xl font-bold tracking-[0.4em] uppercase ${activeFinish === 'emboss' ? 'text-dark' : 'text-white'}`}
                style={
                  activeFinish === 'gold'
                    ? goldTextStyle
                    : activeFinish === 'emboss'
                      ? embossTextStyle
                      : {}
                }
              >
                Mixture
              </h2>
              <div className="h-px w-16 md:w-24 bg-primary my-2 md:my-4 opacity-50"></div>
              <span
                className={`text-sm md:text-base tracking-[0.6em] uppercase ${activeFinish === 'emboss' ? 'text-dark' : 'text-primary'} font-light`}
                style={activeFinish === 'emboss' ? embossTextStyle : {}}
              >
                Marketing
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
        className="flex items-center gap-4 px-10 py-4 rounded-full bg-dark text-white shadow-2xl text-base font-black hover:bg-secondary hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="group-hover:rotate-180 transition-transform duration-1000">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </div>
        ZOBACZ DRUGĄ STRONĘ
      </button>
    </div>
  );
};

const PrintDesign: React.FC = () => {
  const [activeFinish, setActiveFinish] = useState<'none' | 'gold' | 'uv' | 'emboss'>('none');
  const [activeLayer, setActiveLayer] = useState<number>(4);
  const [paperWeight, setPaperWeight] = useState(2);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navigate = useNavigate();
  const { openModal } = useModal();

  const heroRef = useRef<HTMLDivElement>(null);
  const mousePos = useParallax(heroRef, 1);

  useEffect(() => {
    window.scrollTo(0, 0);
    const interval = setInterval(() => {
      if (document.hidden) return;
      setActiveLayer((prev) => (prev === 4 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleCheck = (index: number) => {
    if (checkedItems.includes(index)) {
      setCheckedItems((prev) => prev.filter((i) => i !== index));
    } else {
      setCheckedItems((prev) => [...prev, index]);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const preflightChecklist = CONTENT.preflight.items.map((item, i) => {
    const icons = [
      <Scan key="scan" size={20} />,
      <Palette key="palette" size={20} />,
      <Ruler key="ruler" size={20} />,
      <FileText key="file" size={20} />,
    ];
    return { ...item, icon: icons[i] };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      <Seo title={CONTENT.seo.title} description={CONTENT.seo.description} />

      {/* --- HERO SECTION: CMYK FUSION --- */}
      <section
        ref={heroRef}
        className="relative py-20 lg:py-24 bg-[#0B1120] text-white overflow-hidden"
      >
        <AmbientBackground />

        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-4 h-4 border-l border-t border-white"></div>
          <div className="absolute top-10 right-10 w-4 h-4 border-r border-t border-white"></div>
          <div className="absolute bottom-10 left-10 w-4 h-4 border-l border-b border-white"></div>
          <div className="absolute bottom-10 right-10 w-4 h-4 border-r border-b border-white"></div>
          <div className="absolute top-1/2 left-4 w-2 h-2 rounded-full border border-white"></div>
          <div className="absolute top-1/2 right-4 w-2 h-2 rounded-full border border-white"></div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => navigate('/design/')}
            className="group flex items-center text-sm font-semibold text-gray-600 hover:text-[#F4B400] mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Wróć do Designu
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4B400]/10 text-[#F4B400] border border-[#F4B400]/20 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
                <Printer size={14} /> {CONTENT.hero.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
                {CONTENT.hero.title.line1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4B400] to-[#FFD700]">
                  {CONTENT.hero.title.line2}
                </span>
              </h1>

              <p
                className="text-xl text-gray-300 mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                {CONTENT.hero.description}
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <Button
                  onClick={() => openModal('design', { specificType: 'print' })}
                  icon={<ArrowRight size={18} />}
                  className="!bg-[#F4B400] hover:!bg-[#E65100] text-[#0B1120] border-none"
                >
                  {CONTENT.hero.cta}
                </Button>
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-gray-300 backdrop-blur-sm">
                  <Droplet size={16} className="text-cyan-400" /> {CONTENT.hero.microCopy}
                </div>
              </div>
            </div>

            <div
              className="lg:w-1/2 w-full flex justify-center animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative w-80 h-[400px] perspective-1000 group">
                {[
                  { color: 'cyan', mix: 'multiply', label: 'C' },
                  { color: 'magenta', mix: 'multiply', label: 'M' },
                  { color: 'yellow', mix: 'multiply', label: 'Y' },
                  { color: 'black', mix: 'multiply', label: 'K' },
                ].map((layer, index) => (
                  <div
                    key={index}
                    className="absolute inset-0 bg-white rounded-xl shadow-lg border border-white/10 transition-all duration-1000 ease-in-out flex items-center justify-center overflow-hidden will-change-transform"
                    style={{
                      transform:
                        activeLayer >= index
                          ? `translateZ(${-index * 20}px) translateY(${index * 10}px) rotateY(-15deg) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
                          : `translateZ(${-index * 100}px) translateY(${index * 100}px) rotateY(-15deg) opacity(0)`,
                      opacity: activeLayer >= index ? 1 : 0,
                      zIndex: 10 - index,
                    }}
                  >
                    <div className="absolute top-4 left-4 text-xs font-bold font-mono opacity-50">
                      {layer.label} Channel
                    </div>
                    <div
                      className="w-48 h-48 rounded-full border-[20px]"
                      style={{
                        borderColor:
                          layer.color === 'black'
                            ? '#000'
                            : layer.color === 'yellow'
                              ? '#FF0'
                              : layer.color === 'magenta'
                                ? '#F0F'
                                : '#0FF',
                        opacity: 0.5,
                      }}
                    ></div>
                    <div
                      className="absolute bottom-10 right-4 text-4xl font-black opacity-20"
                      style={{ color: layer.color === 'black' ? '#000' : layer.color }}
                    >
                      Mixture
                    </div>
                  </div>
                ))}

                <div
                  className="absolute inset-0 bg-[#F4B400] rounded-xl shadow-[0_0_50px_rgba(244,180,0,0.3)] flex items-center justify-center overflow-hidden transition-all duration-1000 will-change-transform"
                  style={{
                    transform: `translateZ(30px) translateX(40px) rotateY(-15deg) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
                    opacity: activeLayer === 4 ? 1 : 0,
                    zIndex: 20,
                  }}
                >
                  <div className="text-[#0B1120] text-center">
                    <Box size={48} className="mx-auto mb-4" />
                    <h3 className="text-2xl font-bold uppercase tracking-widest">Premium</h3>
                    <p className="text-xs font-mono mt-2">Print Quality</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent w-[200%] h-full -skew-x-12 animate-shine"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRINT GUARANTEE --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFBF0] border border-[#F4B400]/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B400]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6 text-[#F4B400]">
              <ShieldCheck size={48} />
            </div>

            <h3 className="text-3xl font-bold text-dark mb-4">{CONTENT.guarantee.title}</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {CONTENT.guarantee.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-bold text-dark">
              {CONTENT.guarantee.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-xl border border-[#F4B400]/20"
                >
                  <CheckCircle2 size={18} className="text-[#F4B400]" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FINISHES SIMULATOR --- */}
      <section className="py-24 bg-white relative z-10 overflow-hidden no-cursor-glow">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.finishes.title}
            description={CONTENT.finishes.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4 space-y-4">
              {CONTENT.finishes.items.map((finish) => (
                <button
                  key={finish.id}
                  onClick={() => setActiveFinish(finish.id as any)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-start gap-4 group
                                ${
                                  activeFinish === finish.id
                                    ? 'border-[#F4B400] bg-[#FFFBF0] shadow-md scale-105 ring-1 ring-[#F4B400]'
                                    : 'border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50'
                                }
                            `}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors
                                ${activeFinish === finish.id ? 'border-[#F4B400] bg-[#F4B400] text-white' : 'border-gray-300 group-hover:border-gray-400'}
                            `}
                  >
                    {activeFinish === finish.id && <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-lg mb-1 transition-colors ${activeFinish === finish.id ? 'text-[#0B1120]' : 'text-gray-600'}`}
                    >
                      {finish.label}
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{finish.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8 flex justify-center perspective-1000">
              <TiltCard activeFinish={activeFinish} />
            </div>
          </div>
        </div>
      </section>

      {/* --- PAPER ENGINEERING --- */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 pointer-events-none"></div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title={CONTENT.paper.title}
            description={CONTENT.paper.description}
            className="mb-16"
          />

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 w-full grid grid-cols-1 gap-4">
              {CONTENT.paper.items.map((type, index) => (
                <button
                  key={index}
                  onClick={() => setPaperWeight(index)}
                  className={`group relative flex items-center justify-between p-6 rounded-2xl transition-all duration-300 border-2 text-left
                                  ${
                                    paperWeight === index
                                      ? 'bg-white border-dark shadow-xl scale-[1.02]'
                                      : 'bg-white/50 border-transparent hover:bg-white hover:border-gray-200'
                                  }
                              `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors
                                      ${paperWeight === index ? 'bg-dark text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white'}
                                  `}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${paperWeight === index ? 'text-dark' : 'text-gray-700'}`}
                      >
                        {type.weight}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        {type.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${paperWeight === index ? 'text-primary' : 'text-gray-600'}`}
                  >
                    {type.use.split(',')[0]}
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:w-1/2 w-full flex justify-center perspective-[1200px]">
              <div className="relative w-80 h-80 flex items-center justify-center">
                <div
                  className="relative w-64 h-48 bg-white transition-all duration-700 ease-out preserve-3d"
                  style={{
                    transform: `rotateX(55deg) rotateZ(-30deg) translateZ(${paperWeight * 10}px)`,
                    boxShadow: `-20px 20px 50px rgba(0,0,0,0.15)`,
                  }}
                >
                  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center border border-gray-100">
                    <div className="text-center opacity-30 transform rotate-180">
                      <div className="text-4xl font-black text-dark">
                        {CONTENT.paper.items[paperWeight].weight}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-[0.3em]">
                        {CONTENT.paper.items[paperWeight].name.split('/')[0]}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E')] opacity-10 mix-blend-overlay"></div>
                  </div>

                  <div
                    className="absolute top-0 right-0 h-full origin-right transform rotateY(90deg) flex flex-col"
                    style={{
                      width: `${Math.max(2, CONTENT.paper.items[paperWeight].thickness * 3)}px`,
                    }}
                  >
                    {CONTENT.paper.items[paperWeight].weight.includes('600g') ? (
                      <>
                        <div className="flex-1 bg-gray-100 border-r border-gray-200"></div>
                        <div className="h-[40%] bg-instagram border-r border-red-700"></div>
                        <div className="flex-1 bg-gray-100 border-r border-gray-200"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-200 border-r border-gray-300"></div>
                    )}
                  </div>

                  <div
                    className="absolute bottom-0 left-0 w-full origin-bottom transform rotateX(90deg) flex flex-col"
                    style={{
                      height: `${Math.max(2, CONTENT.paper.items[paperWeight].thickness * 3)}px`,
                    }}
                  >
                    {CONTENT.paper.items[paperWeight].weight.includes('600g') ? (
                      <>
                        <div className="flex-1 bg-gray-200 border-b border-gray-300"></div>
                        <div className="h-[40%] bg-[#C1205C] border-b border-red-800"></div>
                        <div className="flex-1 bg-gray-200 border-b border-gray-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-300 border-b border-gray-400"></div>
                    )}
                  </div>
                </div>

                <div
                  className="absolute top-1/2 left-1/2 w-64 h-48 bg-dark/20 blur-2xl transform -translate-x-1/2 -translate-y-1/2 rotateX(55deg) rotateZ(-30deg) translateZ(-50px) transition-all duration-700"
                  style={{
                    opacity: 0.5 - paperWeight * 0.1,
                    transform: `translate(-50%, -50%) rotateX(55deg) rotateZ(-30deg) translateZ(-${50 + paperWeight * 10}px) scale(${1 - paperWeight * 0.05})`,
                  }}
                ></div>
              </div>

              <div className="absolute bottom-0 right-0 p-8 text-right pointer-events-none">
                <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">
                  Grubość (approx)
                </div>
                <div className="text-3xl font-bold text-dark">
                  {(CONTENT.paper.items[paperWeight].thickness * 0.1).toFixed(1)} mm
                </div>
                {CONTENT.paper.items[paperWeight].weight.includes('600g') && (
                  <div className="text-xs font-bold text-instagram mt-2 bg-instagram/10 inline-block px-2 py-1 rounded animate-pulse">
                    + COLOR CORE
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PACKAGING ENGINEERING --- */}
      <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F4B400] text-xs font-bold uppercase tracking-wider mb-6">
                  <Ruler size={14} /> {CONTENT.packaging.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {CONTENT.packaging.title.line1}
                  <br />
                  <span className="text-[#F4B400]">{CONTENT.packaging.title.line2}</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {CONTENT.packaging.description}
                </p>

                <ul className="space-y-4">
                  {CONTENT.packaging.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-1 p-1 rounded bg-[#F4B400]/20 text-[#F4B400]">
                        {i === 0 ? <Scissors size={16} /> : <Box size={16} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{feat.title}</h3>
                        <p className="text-gray-300 text-xs">{feat.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </AnimateOnScroll>
            </div>

            <div className="lg:w-1/2 w-full flex justify-center">
              <AnimateOnScroll delay={200}>
                <div className="relative w-full max-w-md aspect-square bg-[#0F172A] border border-[#1E293B] rounded-xl p-8 shadow-2xl">
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="#1E293B"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    <path
                      d="M 50 50 L 150 50 L 150 150 L 50 150 Z"
                      fill="none"
                      stroke="#E1306C"
                      strokeWidth="1"
                      className="animate-draw"
                    />
                    <path
                      d="M 50 50 L 20 20 M 150 50 L 180 20 M 150 150 L 180 180 M 50 150 L 20 180"
                      fill="none"
                      stroke="#E1306C"
                      strokeWidth="1"
                      className="animate-draw"
                      style={{ animationDelay: '1s' }}
                    />

                    <path
                      d="M 50 50 L 150 150 M 150 50 L 50 150"
                      fill="none"
                      stroke="#00C853"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      className="opacity-50"
                    />

                    <g className="text-[6px] fill-[#F4B400] font-mono">
                      <text x="90" y="45">
                        100mm
                      </text>
                      <text x="155" y="100">
                        100mm
                      </text>
                    </g>
                  </svg>

                  <div className="absolute bottom-4 left-4 bg-white/10 px-2 py-1 rounded text-xxs text-[#F4B400] font-mono">
                    Die_Cut_v3.ai
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
        <style>{`
            @keyframes draw {
                from { stroke-dasharray: 0, 1000; }
                to { stroke-dasharray: 1000, 0; }
            }
            .animate-draw {
                animation: draw 3s ease-out forwards;
            }
          `}</style>
      </section>

      {/* --- PREFLIGHT CHECKLIST --- */}
      <section className="py-24 bg-gray-50 relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.preflight.title}
            description={CONTENT.preflight.description}
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {preflightChecklist.map((item, i) => {
              const isChecked = checkedItems.includes(i);
              return (
                <AnimateOnScroll key={i} delay={i * 100} className="h-full">
                  <div
                    onClick={() => toggleCheck(i)}
                    className={`p-6 rounded-2xl border transition-all h-full group cursor-pointer relative overflow-hidden
                                ${isChecked ? 'bg-dark border-dark text-white shadow-lg transform -translate-y-1' : 'bg-white border-gray-100 hover:border-[#F4B400]'}
                            `}
                  >
                    {isChecked && (
                      <div className="absolute top-4 right-4 text-success">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                                  ${isChecked ? 'bg-white/10 text-white' : 'bg-[#F9FAFB] text-dark group-hover:text-[#F4B400]'}
                              `}
                    >
                      {item.icon}
                    </div>
                    <h3
                      className={`font-bold mb-2 transition-colors ${isChecked ? 'text-white' : 'text-dark'}`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm transition-colors ${isChecked ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- WHAT WE DESIGN --- */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={CONTENT.arsenal.title} className="mb-12" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CONTENT.arsenal.items.map((item, i) => {
              const icons = [
                <Box key="box" />,
                <Sheet key="sheet" />,
                <Recycle key="recycle" />,
                <Package key="pkg" />,
              ];
              return (
                <GlassCard
                  key={i}
                  className="p-6 flex flex-col items-center justify-center text-center hover:border-[#F4B400] bg-[#F9FAFB] group cursor-default h-48"
                >
                  {i < 4 ? (
                    <div
                      className={`bg-white border border-gray-200 shadow-sm mb-4 ${item.shape} group-hover:shadow-md group-hover:scale-105 transition-all relative`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Printer size={16} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 group-hover:text-[#F4B400] transition-colors shadow-sm">
                      {icons[i - 4]}
                    </div>
                  )}
                  <span className="font-bold text-dark text-lg group-hover:text-[#F4B400] transition-colors">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-600 mt-1 uppercase tracking-wide">
                    {item.sub}
                  </span>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Najczęstsze pytania o Druk" className="mb-12" />
          <div className="space-y-4">
            {CONTENT.faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[#F4B400]/50 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-dark text-lg pr-4">{faq.q}</span>
                  <div
                    className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''} text-[#F4B400]`}
                  >
                    <ArrowRight size={20} className="rotate-90" />
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
      <section className="py-24 bg-white text-center border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-block p-4 rounded-full bg-[#FFFBF0] mb-6 animate-pulse">
            <Package size={32} className="text-[#F4B400]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
            {CONTENT.cta.title}
          </h2>
          <p className="text-xl text-gray-600 mb-10">{CONTENT.cta.description}</p>
          <Button
            onClick={() => openModal('design')}
            variant="primary"
            size="lg"
            className="!bg-[#F4B400] hover:!bg-[#E65100] border-transparent text-[#0B1120]"
          >
            {CONTENT.cta.button}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PrintDesign;
