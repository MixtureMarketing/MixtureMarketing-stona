import React from 'react';
import WindowControls from '../../../common/WindowControls';

interface WindowFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'dark' | 'light';
  showControls?: boolean;
}

/**
 * Reusable Mac-style window frame for terminal and code simulators.
 */
const WindowFrame: React.FC<WindowFrameProps> = ({
  children,
  title = '',
  className = '',
  variant = 'dark',
  showControls = true,
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-2xl border ${
        isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
      } ${className}`}
    >
      <div
        className={`${
          isDark ? 'bg-[#252526] border-gray-800' : 'bg-gray-100 border-gray-200'
        } px-4 py-3 border-b flex items-center justify-between`}
      >
        {showControls && <WindowControls />}
        {title && (
          <span
            className={`text-xxs font-bold uppercase tracking-widest ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {title}
          </span>
        )}
        <div className="w-12"></div> {/* Spacer to center title if needed */}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
};

export default WindowFrame;
