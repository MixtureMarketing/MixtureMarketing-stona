import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import Button from './Button';

interface HeroTitleProps {
  title: string | { line1: string; line2: string; accent?: string };
  accentGradientFrom: string;
  accentGradientTo: string;
  mousePosition?: { x: number; y: number };
  windowSize?: { width: number; height: number };
}

export const HeroTitle: React.FC<HeroTitleProps> = ({
  title,
  accentGradientFrom,
  accentGradientTo,
  mousePosition,
  windowSize,
}) => {
  const spotlightX = mousePosition && windowSize ? (mousePosition.x / (windowSize.width || 1)) * 100 : 50;
  const spotlightY = mousePosition && windowSize ? (mousePosition.y / (windowSize.height || 1)) * 100 : 50;

  if (typeof title === 'string') return <>{title}</>;
  const t = title || { line1: '', line2: '' };
  return (
    <>
      {t.line1} <br />
      <span
        className="text-transparent bg-clip-text block mt-2 pb-2 relative inline-block animate-fade-in transition-all duration-300"
        style={{
          backgroundImage:
            windowSize && windowSize.width > 1024
              ? `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, ${accentGradientTo} 0%, ${accentGradientFrom} 60%)`
              : `linear-gradient(to right, ${accentGradientFrom}, ${accentGradientTo})`,
          backgroundSize: '200% 200%',
        }}
      >
        {t.line2}
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 blur-[1px]"></div>
      </span>
      {t.accent && <span className="block text-primary">{t.accent}</span>}
    </>
  );
};

interface HeroButtonsProps {
  ctaPrimaryText: string;
  ctaPrimaryOnClick: () => void;
  ctaSecondaryText?: string;
  ctaSecondaryOnClick?: () => void;
  ctaSecondaryIcon?: LucideIcon;
  ctaSecondaryNode?: React.ReactNode;
}

export const HeroButtons: React.FC<HeroButtonsProps> = ({
  ctaPrimaryText,
  ctaPrimaryOnClick,
  ctaSecondaryText,
  ctaSecondaryOnClick,
  ctaSecondaryIcon: CtaSecondaryIcon,
  ctaSecondaryNode,
}) => (
  <div
    className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
    style={{ animationDelay: '0.2s' }}
  >
    <Button onClick={ctaPrimaryOnClick} icon={<ArrowRight size={18} />}>
      {ctaPrimaryText}
    </Button>
    {ctaSecondaryText && ctaSecondaryOnClick && (
      <Button
        variant="secondary"
        onClick={ctaSecondaryOnClick}
        icon={CtaSecondaryIcon && <CtaSecondaryIcon size={18} />}
      >
        {ctaSecondaryText}
      </Button>
    )}
    {ctaSecondaryNode}
  </div>
);
