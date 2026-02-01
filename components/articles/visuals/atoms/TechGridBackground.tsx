import React from 'react';

interface TechGridBackgroundProps {
  opacity?: string;
  className?: string;
  mask?: boolean;
}

/**
 * Atomic component for the shared "Technology Grid" background pattern.
 */
const TechGridBackground: React.FC<TechGridBackgroundProps> = ({
  opacity = 'opacity-[0.08]',
  className = '',
  mask = true,
}) => {
  return (
    <div
      className={`absolute inset-0 bg-tech-grid ${opacity} ${
        mask ? '[mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]' : ''
      } ${className}`}
      aria-hidden="true"
    />
  );
};

export default TechGridBackground;
