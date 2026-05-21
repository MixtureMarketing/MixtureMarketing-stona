/* eslint-disable max-lines -- akceptowalne max-lines dla shared hero z 7 opcjonalnymi propami */
import React from 'react';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from './AmbientBackground';
import { HeroTitle, HeroButtons } from './HeroSubComponents';
import Container from './Container';
import HeroBadge from './HeroBadge';

interface StandardHeroProps {
  badge: string;
  /** @deprecated icon ignorowany odkad StandardHero uzywa HeroBadge z live-dot (Sprint E3) */
  badgeIcon?: LucideIcon;
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
  /** Mikro-anchor cenowy pod opisem (np. "od 3 900 zł · 4-8 tygodni"). EH1 — redukcja "ukrytej ceny" porzucen. */
  priceHint?: string;
  /** Trust line pod CTA — np. founder ("Jakub Niedziela odpowiada osobiscie w 24h"). EH3. */
  trustLine?: React.ReactNode;
}

const StandardHero: React.FC<StandardHeroProps> = ({
  badge,
  badgeIcon: _BadgeIcon,
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
  priceHint,
  trustLine,
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
            <HeroBadge accent="secondary" className="mb-6">
              {badge}
            </HeroBadge>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-[1.1] animate-fade-in-up break-words">
              <HeroTitle
                title={title}
                accentGradientFrom={accentGradientFrom}
                accentGradientTo={accentGradientTo}
              />
            </h1>
            <p
              className="text-xl text-gray-600 mb-4 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              {description}
            </p>
            {priceHint && (
              <p
                className="text-sm font-semibold text-secondary mb-6 animate-fade-in-up"
                style={{ animationDelay: '0.15s' }}
              >
                {priceHint}
              </p>
            )}
            {!priceHint && <div className="mb-4" />}
            <HeroButtons
              ctaPrimaryText={ctaPrimaryText}
              ctaPrimaryOnClick={ctaPrimaryOnClick}
              ctaSecondaryText={ctaSecondaryText}
              ctaSecondaryOnClick={ctaSecondaryOnClick}
              ctaSecondaryIcon={ctaSecondaryIcon}
              ctaSecondaryNode={ctaSecondaryNode}
            />
            {trustLine && (
              <div className="mt-5 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {trustLine}
              </div>
            )}
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
