import React from 'react';
import { LucideIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import AmbientBackground from './AmbientBackground';

interface StandardHeroProps {
  badge: string;
  badgeIcon: LucideIcon;
  title: string | { line1: string; line2: string; accent?: string };
  description: string;
  ctaPrimaryText: string;
  ctaPrimaryOnClick: () => void;
  ctaSecondaryText?: string;
  ctaSecondaryOnClick?: () => void;
  ctaSecondaryIcon?: LucideIcon;
  backLinkPath?: string;
  backLinkLabel?: string;
  visual?: React.ReactNode;
  accentGradientFrom?: string;
  accentGradientTo?: string;
}

const StandardHero: React.FC<StandardHeroProps> = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  ctaPrimaryText,
  ctaPrimaryOnClick,
  ctaSecondaryText,
  ctaSecondaryOnClick,
  ctaSecondaryIcon: CtaSecondaryIcon,
  backLinkPath,
  backLinkLabel,
  visual,
  accentGradientFrom = 'primary',
  accentGradientTo = 'secondary',
}) => {
  const navigate = useNavigate();

  const renderTitle = () => {
    if (typeof title === 'string') return title;
    return (
      <>
        {title.line1} <br />
        <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${accentGradientFrom} to-${accentGradientTo}`}>
          {title.line2}
        </span>
        {title.accent && <span className="block text-primary">{title.accent}</span>}
      </>
    );
  };

  return (
    <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden">
      <AmbientBackground />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {backLinkPath && (
          <button
            onClick={() => navigate(backLinkPath)}
            className="group flex items-center text-sm font-semibold text-gray-700 hover:text-secondary mb-8 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            {backLinkLabel || 'Wróć'}
          </button>
        )}

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in border border-secondary/20">
              <BadgeIcon size={14} /> {badge}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-tight animate-fade-in-up">
              {renderTitle()}
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button onClick={ctaPrimaryOnClick} icon={<ArrowRight size={18} />}>
                {ctaPrimaryText}
              </Button>
              {ctaSecondaryText && ctaSecondaryOnClick && (
                <Button variant="secondary" onClick={ctaSecondaryOnClick} icon={CtaSecondaryIcon && <CtaSecondaryIcon size={18} />}>
                  {ctaSecondaryText}
                </Button>
              )}
            </div>
          </div>

          {visual && (
            <div className="lg:w-1/2 w-full relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StandardHero;
