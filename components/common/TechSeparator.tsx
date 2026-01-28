/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface TechSeparatorProps {
  height?: string;
}

const TechSeparator: React.FC<TechSeparatorProps> = ({ height = 'h-24' }) => {
  return (
    <div
      className={`w-full flex justify-center items-center relative z-0 pointer-events-none overflow-hidden ${height}`}
    >
      <div className="h-full w-px relative">
        {/* Static Base Line */}
        <div className="absolute inset-0 bg-primary opacity-60"></div>

        {/* Glowing Energy Pulse */}
        <div
          className="absolute top-0 bottom-0 w-full animate-energy-flow-vertical"
          style={{
            background: 'linear-gradient(to bottom, transparent, #61B6DE, transparent)',
            height: '200%',
            top: '-100%',
          }}
        ></div>

        {/* Node at the center (optional, represents a junction) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#61B6DE]"></div>
      </div>

      {/* Add specific vertical animation style if not globally available */}
      <style>{`
        @keyframes energy-flow-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        .animate-energy-flow-vertical {
          animation: energy-flow-vertical 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TechSeparator;
