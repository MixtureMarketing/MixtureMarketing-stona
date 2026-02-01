import React from 'react';

interface StatusPingProps {
  color?: 'emerald' | 'rose' | 'sky' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Atomic component for pulsating status indicators.
 */
const StatusPing: React.FC<StatusPingProps> = ({
  color = 'emerald',
  size = 'md',
  className = '',
}) => {
  const colorMap = {
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-500',
    sky: 'bg-sky-400',
    amber: 'bg-amber-400',
  };

  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-3 h-3',
  };

  return (
    <div className={`relative flex ${sizeMap[size]} ${className}`}>
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorMap[color]}`}
      ></span>
      <span
        className={`relative inline-flex rounded-full ${sizeMap[size]} ${colorMap[color]}`}
      ></span>
    </div>
  );
};

export default StatusPing;
