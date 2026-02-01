import React, { memo } from 'react';

export type CardVariant = 'glass' | 'solid' | 'muted' | 'glow' | 'dark';
export type CardHover = 'lift' | 'zoom' | 'glow' | 'none';

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: CardVariant;
  hover?: CardHover;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  rounded?: 'xl' | '2xl' | '3xl';
}

/**
 * The core Card component for the Mixture Marketing design system.
 * Unifies background styles, shadows, and hover interactions.
 */
const BaseCard: React.FC<BaseCardProps> = memo(
  ({
    children,
    variant = 'solid',
    hover = 'none',
    padding = 'md',
    className = '',
    rounded = '2xl',
    ...props
  }) => {
    // Background and Border variants
    const variantMap: Record<CardVariant, string> = {
      glass: 'bg-white/70 backdrop-blur-md border-white/50 shadow-sm',
      solid: 'bg-white border-gray-100 shadow-sm',
      muted: 'bg-gray-50 border-gray-100 shadow-inner',
      glow: 'bg-white border-primary/20 shadow-[0_0_30px_rgba(97,182,222,0.1)]',
      dark: 'bg-deep-dark border-white/10 shadow-2xl text-white',
    };

    // Hover effect variants
    const hoverMap: Record<CardHover, string> = {
      lift: 'hover:-translate-y-1 hover:shadow-lg',
      zoom: 'hover:scale-[1.02] hover:shadow-xl',
      glow: 'hover:border-primary/50 hover:shadow-primary/10',
      none: '',
    };

    // Padding variants
    const paddingMap = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6 md:p-8',
      lg: 'p-8 md:p-12',
    };

    // Rounded variants
    const roundedMap = {
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    };

    const combinedClasses = `
      relative overflow-hidden transition-all duration-300
      ${variantMap[variant]}
      ${hoverMap[hover]}
      ${paddingMap[padding]}
      ${roundedMap[rounded]}
      ${className}
    `.trim();

    return (
      <div className={combinedClasses} {...props}>
        <div className="relative z-10 h-full flex flex-col">{children}</div>
      </div>
    );
  },
);

BaseCard.displayName = 'BaseCard';

export default BaseCard;
