import React, { CSSProperties } from 'react';

interface TiltCardFrontProps {
  cardColor: string;
  glare: { x: number; y: number; opacity: number };
  activeFinish: string;
  goldStyle: CSSProperties;
  goldTextStyle: CSSProperties;
  embossImgStyle: CSSProperties;
  embossTextStyle: CSSProperties;
  uvStyle: (x: number) => CSSProperties;
}

const TiltCardFront: React.FC<TiltCardFrontProps> = ({
  cardColor,
  glare,
  activeFinish,
  goldStyle,
  goldTextStyle,
  embossImgStyle,
  embossTextStyle,
  uvStyle,
}) => {
  return (
    <div
      className="absolute inset-0 rounded-[2rem] overflow-hidden border border-white/10 p-6 md:p-10 flex flex-col justify-between"
      style={{
        backgroundColor: cardColor,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(0deg)',
      }}
    >
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
                  WebkitMaskImage: 'url("/assets/images/sygnet-mixture-marketing-fioletowe.svg")',
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
  );
};

export default TiltCardFront;
