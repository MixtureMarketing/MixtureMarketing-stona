import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

/**
 * Atomic component for loading states (Skeletons).
 * Reduces boilerplate in pages and components waiting for data.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const baseClasses = `bg-gray-200 animate-pulse ${className}`;

  const variantClasses = {
    text: 'h-4 w-full rounded',
    rect: 'rounded-xl',
    circle: 'rounded-full',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]}`}
          style={style}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export default Skeleton;
