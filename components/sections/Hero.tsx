import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Mouse } from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import TextReveal from '../common/TextReveal';
import { BrowserMockup, CodeSnippet, AdsDashboardMini } from '../visuals/hero/HomeHeroDecorations';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useWindowSize } from '../../hooks/useWindowSize';
import { HERO_CONTENT } from '../../data/content';

interface HeroProps {
  onOpenModal?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenModal: _onOpenModal }) => {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();
  const windowSize = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate percentage for spotlight
  const spotlightX = (mousePosition.x / (windowSize.width || 1)) * 100;
  const spotlightY = (mousePosition.y / (windowSize.height || 1)) * 100;

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gray-50">
      <AmbientBackground />

      {/* Grain Overlay */}
      <div className="absolute inset-0 z-[1] bg-grain pointer-events-none"></div>

      {/* --- FLOATING DECORATIONS (PARALLAX + FLOAT) --- */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <BrowserMockup mousePosition={mousePosition} />
          <CodeSnippet mousePosition={mousePosition} />
          <AdsDashboardMini mousePosition={mousePosition} />
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-xl mb-8 md:mb-10 relative group cursor-default hover:border-primary transition-all duration-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-xxs md:text-xs font-black tracking-[0.2em] uppercase text-dark">
                {HERO_CONTENT.badge}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 md:mb-10 leading-[1.05] md:leading-[0.95]">
              <TextReveal delay={100} className="text-dark">
                {HERO_CONTENT.title.line1}
              </TextReveal>
              <TextReveal delay={300} className="text-dark">
                {HERO_CONTENT.title.line2}
              </TextReveal>
              <span
                className="text-transparent bg-clip-text block mt-2 md:mt-4 pb-2 relative inline-block animate-fade-in transition-all duration-300"
                style={{
                  animationDelay: '0.6s',
                  backgroundImage:
                    windowSize.width > 1024
                      ? `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, #61B6DE 0%, #213261 60%)`
                      : `linear-gradient(90deg, #61B6DE, #213261)`,
                  backgroundSize: '200% 200%',
                }}
              >
                <TextReveal delay={700}>{HERO_CONTENT.title.line3}</TextReveal>
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 blur-[1px]"></div>
              </span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={1000}>
            <p className="text-lg md:text-2xl text-gray-700 mb-10 md:mb-14 max-w-2xl mx-auto leading-relaxed font-medium px-4 md:px-0">
              {HERO_CONTENT.description}
            </p>

            <div className="flex flex-col gap-6 items-center relative z-20 px-4 sm:px-0">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center items-center w-full">
                <Button
                  onClick={() => navigate('/offers#calculator')}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto h-14 md:h-16 px-10 text-lg shadow-2xl shadow-secondary/30 hover:scale-105 transition-transform duration-300"
                  icon={<ArrowRight size={22} />}
                >
                  Oblicz koszt projektu
                </Button>

                <Button
                  onClick={scrollToServices}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto h-14 md:h-16 px-10 text-lg border-gray-200"
                >
                  {HERO_CONTENT.cta.secondary}
                </Button>
              </div>

              {/* Micro-copy under CTA */}
              <div
                className="flex items-center gap-4 text-xxs font-black text-gray-600 uppercase tracking-[0.2em] mt-4 animate-fade-in"
                style={{ animationDelay: '1.5s' }}
              >
                <span className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-400 fill-amber-400" />{' '}
                  {HERO_CONTENT.microCopy.responseTime}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                <span>{HERO_CONTENT.microCopy.noObligation}</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
        onClick={scrollToServices}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xxs font-black uppercase tracking-[0.2em] text-dark">Scroll</span>
          <Mouse size={24} className="text-primary" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
