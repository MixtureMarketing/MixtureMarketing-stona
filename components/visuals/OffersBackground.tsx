import React from 'react';

const OffersBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg className="w-full h-full" viewBox="0 0 1000 3000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cableGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3F3D91" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#61B6DE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3F3D91" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central Bus Line */}
        <line
          x1="500"
          y1="0"
          x2="500"
          y2="3000"
          stroke="url(#cableGradient)"
          strokeWidth="2"
          className="hidden lg:block"
        />

        {/* Animated Energy Packets */}
        <path
          d="M 500 0 V 3000"
          stroke="#61B6DE"
          strokeWidth="3"
          strokeDasharray="100 1000"
          strokeLinecap="round"
          className="hidden lg:block animate-energy-flow"
          filter="url(#glow)"
          opacity="0.8"
        />

        {/* === BRANCH 1 === */}
        <path
          d="M 500 1050 H 850"
          stroke="rgba(63, 61, 145, 0.1)"
          strokeWidth="2"
          fill="none"
          className="hidden lg:block"
        />
        <path
          d="M 500 1050 H 850"
          stroke="#61B6DE"
          strokeWidth="2"
          fill="none"
          strokeDasharray="50 800"
          className="hidden lg:block animate-energy-flow"
          filter="url(#glow)"
        />

        {/* === BRANCH 2 === */}
        <path
          d="M 500 1850 H 150"
          stroke="rgba(63, 61, 145, 0.1)"
          strokeWidth="2"
          fill="none"
          className="hidden lg:block"
        />
        <path
          d="M 500 1850 H 150"
          stroke="#61B6DE"
          strokeWidth="2"
          fill="none"
          strokeDasharray="50 800"
          className="hidden lg:block animate-energy-flow"
          filter="url(#glow)"
        />

        {/* === BRANCH 3 === */}
        <path
          d="M 500 2650 H 850"
          stroke="rgba(63, 61, 145, 0.1)"
          strokeWidth="2"
          fill="none"
          className="hidden lg:block"
        />
        <path
          d="M 500 2650 H 850"
          stroke="#61B6DE"
          strokeWidth="2"
          fill="none"
          strokeDasharray="50 800"
          className="hidden lg:block animate-energy-flow"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
};

export default OffersBackground;
