import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import Button from './Button';

interface HeroTitleProps {
  title: string | { line1: string; line2: string; accent?: string };
  accentGradientFrom: string;
  accentGradientTo: string;
}

export const HeroTitle: React.FC<HeroTitleProps> = ({
  title,
  accentGradientFrom,
  accentGradientTo,
}) => {
  if (typeof title === 'string') return <>{title}</>;
  const t = title || { line1: '', line2: '' };
  return (
    <>
      {t.line1} <br />
      <span
        className="text-transparent bg-clip-text"
        style={{
          backgroundImage: `linear-gradient(to right, ${accentGradientFrom}, ${accentGradientTo})`,
        }}
      >
        {t.line2}
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
