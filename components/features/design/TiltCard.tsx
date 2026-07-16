import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import TiltCardFront from './TiltCardFront';
import TiltCardBack from './TiltCardBack';

interface TiltCardProps {
  activeFinish: 'none' | 'gold' | 'uv' | 'emboss';
}

const TiltCard: React.FC<TiltCardProps> = ({ activeFinish }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const sweepRaf = useRef<number>(0);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  /* Wybór uszlachetnienia = karta „łapie światło": przemiatanie odbicia L→P
     z lekkim wahnięciem karty, żeby efekt było widać bez ruszania myszką
     (dopracowanie Laboratorium, 2026-07-16). Reduced motion / prerender:
     statyczna klatka z widocznym odbiciem zamiast animacji. */
  useEffect(() => {
    if (activeFinish === 'none') return;
    cancelAnimationFrame(sweepRaf.current);
    const reduced =
      window.isPrerendering || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // jedna klatka rAF zamiast setState wprost w efekcie (react-hooks/set-state-in-effect)
      sweepRaf.current = requestAnimationFrame(() => setGlare({ x: 35, y: 30, opacity: 1 }));
      return () => cancelAnimationFrame(sweepRaf.current);
    }
    const start = performance.now();
    const DUR = 1300;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setGlare({ x: eased * 100, y: 35, opacity: t < 1 ? 1 : 0 });
      setRotation({ x: 0, y: Math.sin(t * Math.PI) * 6 });
      if (t < 1) sweepRaf.current = requestAnimationFrame(tick);
    };
    sweepRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(sweepRaf.current);
  }, [activeFinish]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    cancelAnimationFrame(sweepRaf.current); // kursor przejmuje światło
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotation({
      x: ((y - centerY) / centerY) * -10,
      y: ((x - centerX) / centerX) * 10,
    });
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
    WebkitMaskImage: 'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
    WebkitMaskSize: 'contain',
    background: `linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) ${xPos}%, rgba(255,255,255,0) 100%)`,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2)) brightness(1.2)',
  });

  const sharedProps = {
    cardColor,
    glare,
    activeFinish,
    goldStyle,
    goldTextStyle,
    embossImgStyle,
    embossTextStyle,
    uvStyle,
  };

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
            <TiltCardFront {...sharedProps} />
            <TiltCardBack {...sharedProps} />
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
        <RefreshCw
          size={24}
          className="group-hover:rotate-180 transition-transform duration-1000"
          aria-hidden="true"
        />
        ZOBACZ DRUGĄ STRONĘ
      </button>
    </div>
  );
};

export default TiltCard;
