import React from 'react';

export const WindowControls: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex gap-1.5 ${className}`}>
    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F57]"></div>
    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]"></div>
    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#28C840]"></div>
  </div>
);
