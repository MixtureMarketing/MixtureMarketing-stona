import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Video,
  Box,
  Instagram,
  Play,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import { ContactType } from '../../types';
import Seo from '../common/Seo';
import { VISUAL_CONTENT_CONTENT as CONTENT } from '../../data/content';

interface VisualContentProps {
  onBack: () => void;
  onOpenModal: (type: ContactType) => void;
}

const VisualContent: React.FC<VisualContentProps> = ({ onBack, onOpenModal }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formats = CONTENT.formats.items.map((item, i) => {
    const icons = [
      <Instagram key="ig" size={24} />,
      <Box key="3d" size={24} />,
      <Play key="play" size={24} />,
    ];
    const colors = ['#E1306C', '#61B6DE', '#3F3D91'];
    return { ...item, icon: icons[i], color: colors[i] };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans">
      <Seo title={CONTENT.seo.title} description={CONTENT.seo.description} />

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-24 bg-[#0B1120] text-white overflow-hidden">
        <AmbientBackground />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={onBack}
            className="group flex items-center text-sm font-semibold text-gray-600 hover:text-instagram mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Wróć do Designu
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-instagram/10 text-instagram border border-instagram/20 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
                <Video size={14} /> {CONTENT.hero.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
                {CONTENT.hero.title.line1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E1306C] to-[#833AB4]">
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
                <Button onClick={() => onOpenModal('design')} icon={<ArrowRight size={18} />}>
                  {CONTENT.hero.cta}
                </Button>
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-gray-300 backdrop-blur-sm">
                  <Zap size={16} className="text-instagram" /> {CONTENT.hero.microCopy}
                </div>
              </div>
            </div>

            <div
              className="lg:w-1/2 w-full flex justify-center animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative w-[300px] h-[500px] bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden group hover:scale-105 transition-transform duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#833AB4] to-[#E1306C] opacity-20"></div>
                <div className="absolute inset-0 flex flex-col p-4 pt-12 space-y-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-white/20"></div>
                      <div className="w-20 h-2 bg-white/20 rounded"></div>
                    </div>
                    <div className="h-32 bg-white/5 rounded-lg mb-2 flex items-center justify-center text-white/20">
                      <ImageIcon size={32} />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-lg transform scale-105 transition-transform relative">
                    <div className="absolute -right-2 -top-2 bg-instagram text-white text-xxs font-bold px-2 py-1 rounded-full animate-bounce">
                      NOWOŚĆ
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-instagram"></div>
                      <div className="w-24 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-32 bg-gradient-to-tr from-[#E1306C] to-[#F77737] rounded-lg mb-2 flex items-center justify-center text-white font-bold text-lg">
                      Twoja Marka
                    </div>
                    <div className="flex gap-2">
                      <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                      <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FORMATS --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.formats.title}
            description={CONTENT.formats.description}
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {formats.map((format, index) => (
              <AnimateOnScroll key={index} delay={index * 150} className="h-full">
                <GlassCard
                  className="p-8 h-full flex flex-col hover:shadow-xl transition-all group border-t-4"
                  style={{ borderTopColor: format.color }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg"
                    style={{ backgroundColor: format.color }}
                  >
                    {format.icon}
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{format.title}</h3>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-4"
                    style={{ color: format.color }}
                  >
                    {format.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm">{format.desc}</p>
                </GlassCard>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHY VISUALS MATTER --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                align="left"
                title={CONTENT.whyVisuals.title}
                description={CONTENT.whyVisuals.description}
              />
              <ul className="space-y-4 mt-8">
                {CONTENT.whyVisuals.list.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-instagram" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-black text-instagram mb-2">
                  {CONTENT.whyVisuals.stat.val}
                </div>
                <p className="text-gray-700 font-medium">{CONTENT.whyVisuals.stat.label}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
            {CONTENT.cta.title}
          </h2>
          <p className="text-xl text-gray-600 mb-10">{CONTENT.cta.description}</p>
          <Button
            onClick={() => onOpenModal('design')}
            variant="primary"
            size="lg"
            className="!bg-instagram hover:!bg-[#C13584] border-transparent"
          >
            {CONTENT.cta.button}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default VisualContent;
