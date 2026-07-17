/* eslint-disable max-lines -- wspólne CTA: 3 warianty + ikona + 2 przyciski w jednym pliku */
import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';
import AnimateOnScroll from './AnimateOnScroll';

export type CtaVariant = 'dark' | 'gradient' | 'white'; // 'glass' out: nieużywany + No-Glass

interface BaseCtaProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: CtaVariant;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  className?: string;
  badges?: string[];
  accentColor?: string;
}

/**
 * Unified Call-to-Action component for articles and landing pages.
 */
const BaseCta: React.FC<BaseCtaProps> = ({
  title,
  description,
  buttonText = 'Rozpocznij Projekt',
  buttonLink,
  onClick,
  icon: Icon,
  variant = 'dark',
  secondaryButtonText,
  secondaryButtonLink,
  className = '',
  badges = [],
  accentColor,
}) => {
  const containerVariants: Record<CtaVariant, string> = {
    dark: 'bg-dark text-white',
    gradient: 'bg-gradient-to-br from-dark to-secondary text-white',
    white: 'bg-white border border-gray-100 text-dark',
  };

  const handlePrimaryClick = () => {
    if (onClick) onClick();
    else if (buttonLink) window.location.href = buttonLink;
  };

  const handleSecondaryClick = () => {
    if (secondaryButtonLink) window.location.href = secondaryButtonLink;
  };

  return (
    <div className={`mt-24 ${className}`}>
      <AnimateOnScroll>
        <div
          className={`rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden group shadow-2xl ${containerVariants[variant]}`}
        >
          {/* Tania poświata: jeden gradient zamiast dwóch blur-[100px] */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(40% 55% at 96% 0%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 62%), radial-gradient(40% 55% at 4% 100%, color-mix(in srgb, var(--color-secondary) 18%, transparent), transparent 62%)',
            }}
            aria-hidden="true"
          ></div>

          <div className="relative z-10 flex flex-col items-center">
            {Icon && (
              <div
                className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500"
                style={accentColor ? { color: accentColor } : {}}
              >
                <Icon size={40} className="animate-pulse" />
              </div>
            )}

            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight max-w-3xl mx-auto leading-tight">
              {title}
            </h2>
            <p
              className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${variant === 'white' ? 'text-gray-700' : 'text-white/90'}`}
            >
              {description}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Button
                variant={variant === 'white' ? 'primary' : 'white'}
                size="lg"
                className="shadow-xl px-10"
                onClick={handlePrimaryClick}
              >
                {buttonText}
              </Button>

              {secondaryButtonText && (
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white px-10"
                  size="lg"
                  onClick={handleSecondaryClick}
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>

            {badges.length > 0 && (
              <div className="mt-12 flex flex-wrap justify-center gap-6 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white font-black text-xxs uppercase tracking-widest"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {badge}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
};

export default BaseCta;
