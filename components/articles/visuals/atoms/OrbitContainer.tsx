import React from 'react';

interface OrbitContainerProps {
  children: React.ReactNode;
  size?: string;
  duration?: string;
  className?: string;
  reverse?: boolean;
}

/**
 * A wrapper that applies a circular orbital animation to its children.
 */
const OrbitContainer: React.FC<OrbitContainerProps> = ({
  children,
  size = 'w-64 h-64',
  duration = '15s',
  className = '',
  reverse = false,
}) => {
  return (
    <div
      className={`absolute ${size} border border-white/5 rounded-full pointer-events-none ${className}`}
      style={{
        animation: `spin ${duration} linear infinite ${reverse ? 'reverse' : 'normal'}`,
      }}
    >
      {children}
    </div>
  );
};

export default OrbitContainer;
