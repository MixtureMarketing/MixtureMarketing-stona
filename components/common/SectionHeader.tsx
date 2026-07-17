import React, { memo } from 'react';
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
  /**
   * Triada prądów (opt-in, sekcje strony głównej): trzy kropki w kolorach
   * prądów Sceny Mixture zbiegają się z rozsypki do rzędu na var(--p)
   * sekcji-rodzica — mikro-motyw materii hero wraca na poziomie oka.
   * Spoczynek/prerender/reduced = uformowany rząd (var(--p, 1)).
   */
  triad?: boolean;
}

/** Kropki triady: kolor prądu + deterministyczna rozsypka startowa (px). */
const TRIAD = [
  { cls: 'bg-primary', sx: -26, sy: 14 },
  { cls: 'bg-secondary', sx: 8, sy: -20 },
  { cls: 'bg-brand-pink', sx: 30, sy: 10 },
] as const;

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
    triad = false,
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
      h1: 'text-3xl xs:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight',
      h2: 'text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold',
      h3: 'text-xl xs:text-2xl md:text-3xl lg:text-4xl font-bold',
      h4: 'text-lg xs:text-xl md:text-2xl lg:text-3xl font-bold',
      h5: 'text-base xs:text-lg md:text-xl lg:text-2xl font-bold',
      h6: 'text-sm xs:text-base md:text-lg lg:text-xl font-bold',
    };

    const Content = (
      <div className={`max-w-3xl ${alignClass} ${className}`}>
        {triad && (
          <div
            className={`mb-5 flex items-center gap-2.5 ${
              effectiveAlign === 'center' ? 'justify-center' : ''
            }`}
            aria-hidden="true"
          >
            {TRIAD.map(({ cls, sx, sy }) => (
              <span
                key={cls}
                className={`h-2 w-2 rounded-full ${cls}`}
                style={{
                  transform: `translate3d(calc((1 - var(--p, 1)) * ${sx}px), calc((1 - var(--p, 1)) * ${sy}px), 0)`,
                }}
              />
            ))}
          </div>
        )}
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
