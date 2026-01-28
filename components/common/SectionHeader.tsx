import React, { memo } from 'react';
import { COLORS } from '../../types';
import AnimateOnScroll from './AnimateOnScroll';
import TextReveal from './TextReveal';

interface SectionHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  centered?: boolean; // Alias for align="center"
  center?: boolean; // Alias for align="center"
  className?: string;
  lightMode?: boolean; // If true, text is optimized for dark backgrounds
  animate?: boolean;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const SectionHeader: React.FC<SectionHeaderProps> = memo(
  ({
    title,
    subtitle,
    description,
    align,
    centered,
    center,
    className = '',
    lightMode = false,
    animate = true,
    level = 'h2',
  }) => {
    // Determine alignment: priority to 'align', then 'centered/center' toggles
    let effectiveAlign: 'left' | 'center' | 'right' = 'center';
    if (align) {
      effectiveAlign = align;
    } else if (centered === false) {
      effectiveAlign = 'left';
    } else if (centered === true || center === true) {
      effectiveAlign = 'center';
    }

    const alignClass =
      effectiveAlign === 'left'
        ? 'text-left'
        : effectiveAlign === 'right'
          ? 'text-right'
          : 'text-center mx-auto';
    const textColor = lightMode ? 'text-white' : `text-dark`;
    const descColor = lightMode ? 'text-gray-300' : 'text-gray-700';
    const subtitleColor = lightMode ? 'text-primary' : 'text-secondary';

    const HeadingTag = level;

    // Responsive sizes based on heading level
    const sizes = {
      h1: 'text-4xl md:text-5xl lg:text-7xl font-black tracking-tight',
      h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
      h3: 'text-2xl md:text-3xl lg:text-4xl font-bold',
      h4: 'text-xl md:text-2xl lg:text-3xl font-bold',
      h5: 'text-lg md:text-xl lg:text-2xl font-bold',
      h6: 'text-base md:text-lg lg:text-xl font-bold',
    };

    const Content = (
      <div className={`max-w-3xl ${alignClass} ${className}`}>
        {subtitle && (
          <p className={`text-xs font-bold tracking-widest uppercase mb-4 ${subtitleColor}`}>
            {subtitle}
          </p>
        )}

        <HeadingTag className={`${sizes[level]} mb-6 leading-[1.2] pb-2 ${textColor}`}>
          {animate && typeof title === 'string' ? <TextReveal>{title}</TextReveal> : <>{title}</>}
        </HeadingTag>

        {description && (
          <p
            className={`text-lg leading-relaxed ${descColor} ${effectiveAlign === 'center' ? 'max-w-2xl mx-auto' : ''}`}
          >
            {description}
          </p>
        )}
      </div>
    );

    if (animate && typeof title !== 'string') {
      // If title is a node (complex), wrap whole block in fade up
      return <AnimateOnScroll>{Content}</AnimateOnScroll>;
    }

    // If title is string, it handles its own animation inside Content via TextReveal
    // We might still want to animate description fade in
    return <div>{Content}</div>;
  },
);

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
