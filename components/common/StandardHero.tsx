import React from 'react';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from './AmbientBackground';
import { HeroTitle, HeroButtons } from './HeroSubComponents';
import Container from './Container';

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
  ctaSecondaryNode?: React.ReactNode;
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
  ctaSecondaryIcon,
  ctaSecondaryNode,
  backLinkPath,
  backLinkLabel,
  visual,
  accentGradientFrom = '#3F3D91',
  accentGradientTo = '#61B6DE',
}) => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 lg:py-28 bg-light-gray overflow-hidden">
      <AmbientBackground />
      <Container className="relative z-10">
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
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-[1.1] animate-fade-in-up break-words">
              <HeroTitle
                title={title}
                accentGradientFrom={accentGradientFrom}
                accentGradientTo={accentGradientTo}
              />
            </h1>
            <p
              className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              {description}
            </p>
            <HeroButtons
              ctaPrimaryText={ctaPrimaryText}
              ctaPrimaryOnClick={ctaPrimaryOnClick}
              ctaSecondaryText={ctaSecondaryText}
              ctaSecondaryOnClick={ctaSecondaryOnClick}
              ctaSecondaryIcon={ctaSecondaryIcon}
              ctaSecondaryNode={ctaSecondaryNode}
            />
          </div>
          {visual && (
            <div
              className="lg:w-1/2 w-full relative animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              {visual}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default StandardHero;
