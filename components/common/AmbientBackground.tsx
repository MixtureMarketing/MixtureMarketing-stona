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

      {/* Decorative Orbs - Client Side Only to save DOM nodes during initial parse */}
      {isMounted && (
        <>
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.08] animate-blob"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.08] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-instagram rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.05] animate-blob animation-delay-4000"></div>
        </>
      )}
    </div>
  );
};

export default AmbientBackground;
