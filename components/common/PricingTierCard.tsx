import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import BaseCard from './BaseCard';
import Button from './Button';
import { PricingTier } from '../../types';

interface PricingTierCardProps {
  tier: PricingTier;
  isHighlight: boolean;
  onCtaClick: () => void;
}

const PricingTierCard: React.FC<PricingTierCardProps> = ({ tier, isHighlight, onCtaClick }) => {
  return (
    <div className="relative h-full">
      {isHighlight && (
        <div className="absolute top-0 left-0 right-0 -mt-3 text-center z-20">
          <span className="bg-secondary text-white text-xxs font-bold px-6 py-1.5 rounded-full shadow-xl tracking-widest uppercase">
            {tier.highlightText || 'Rekomendowany Wybór'}
          </span>
        </div>
      )}
      <BaseCard
        variant="solid"
        hover={isHighlight ? 'none' : 'lift'}
        padding="lg"
        className={`h-full flex flex-col relative overflow-hidden ${
          isHighlight ? 'border-secondary ring-4 ring-[#E0EFFF]' : ''
        }`}
      >
        {isHighlight && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        )}

        <div className="mb-8">
          <div
            className={`inline-block px-3 py-1 rounded-full text-xxs font-black uppercase tracking-wider mb-4 ${
              isHighlight ? 'bg-primary/10 text-accent-dark' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {tier.subtitle || 'Pakiet'}
          </div>
          <h3 className="text-2xl font-black text-dark mb-4">{tier.title}</h3>

          <div className="flex items-baseline flex-wrap gap-2 mb-6">
            {tier.price !== 'Wycena' && (
              <span className="text-gray-600 text-sm font-medium">od</span>
            )}
            <span className="text-4xl xs:text-5xl font-black text-dark">{tier.price}</span>
            <span className="text-gray-700 font-bold text-base md:text-lg">
              {tier.currency || (tier.price === 'Wycena' ? '' : 'PLN')}
            </span>
            {tier.priceSuffix && (
              <span className="text-xs text-gray-500 ml-1">{tier.priceSuffix}</span>
            )}
          </div>

          <p className="text-base text-gray-600 leading-relaxed font-medium">{tier.description}</p>
        </div>

        <div className="space-y-4 mb-10 flex-grow">
          {tier.features && tier.features.length > 0 && (
            <>
              <h4 className="text-xxs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} aria-hidden="true" /> Pakiet zawiera:
              </h4>
              <ul className="space-y-3">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm ${
                        isHighlight ? 'bg-secondary' : 'bg-blue-50 text-primary'
                      }`}
                    >
                      <CheckCircle2
                        size={12}
                        className={isHighlight ? 'text-white' : 'text-primary'}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="font-bold">{feat}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <Button
          onClick={onCtaClick}
          variant={isHighlight ? 'primary' : 'outline'}
          className={`w-full justify-center py-4 ${
            isHighlight
              ? 'shadow-xl shadow-secondary/20 !bg-secondary border-none hover:!bg-dark'
              : 'border-gray-200 hover:border-primary hover:text-primary'
          }`}
        >
          {tier.buttonText || (tier.price === 'Wycena' ? 'Zapytaj o Ofertę' : 'Wybierz Pakiet')}
        </Button>
      </BaseCard>
    </div>
  );
};

export default PricingTierCard;
