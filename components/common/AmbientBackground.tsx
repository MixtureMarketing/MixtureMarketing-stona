import React, { useState, useEffect } from 'react';

const AmbientBackground: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Architectural Grid Pattern - Simplified SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#213261" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Decorative Orbs - Client Side Only with GPU acceleration hint */}
      {isMounted && (
        <div className="opacity-0 animate-fade-in duration-1000 fill-mode-forwards">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.08] animate-blob will-change-transform"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.08] animate-blob animation-delay-2000 will-change-transform"></div>
          <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-instagram rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.05] animate-blob animation-delay-4000 will-change-transform"></div>
        </div>
      )}
    </div>
  );
};

export default AmbientBackground;
