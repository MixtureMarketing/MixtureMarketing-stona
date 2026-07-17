import React, { CSSProperties } from 'react';

interface TiltCardBackProps {
  cardColor: string;
  glare: { x: number; y: number; opacity: number };
  activeFinish: string;
  goldStyle: CSSProperties;
  goldTextStyle: CSSProperties;
  embossImgStyle: CSSProperties;
  embossTextStyle: CSSProperties;
  uvStyle: (x: number) => CSSProperties;
}

const TiltCardBack: React.FC<TiltCardBackProps> = ({
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
      className="absolute inset-0 rounded-[2.5rem] overflow-hidden border border-white/10 flex flex-col items-center justify-center p-6 md:p-10"
      style={{
        backgroundColor: cardColor,
        transform: 'rotateY(180deg)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
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
          activeFinish === 'gold' ? goldTextStyle : activeFinish === 'emboss' ? embossTextStyle : {}
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
  );
};

export default TiltCardBack;
