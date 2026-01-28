import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';
import SectionHeader from './SectionHeader';
import Button from './Button';
import GlassCard from './GlassCard';
import { useModal } from '../../context/ModalContext';
import { PricingTier } from '../../types';

interface PricingTableProps {
  title: string;
  description?: string;
  tiers: PricingTier[];
  className?: string;
  columns?: 2 | 3 | 4;
}

const PricingTable: React.FC<PricingTableProps> = ({
  title,
  description,
  tiers,
  className = '',
  columns,
}) => {
  const { openModal } = useModal();

  if (!tiers || tiers.length === 0) return null;

  const handleCtaClick = (tier: PricingTier) => {
    if (tier.onCtaClick) {
      tier.onCtaClick();
    } else {
      openModal('web');
    }
  };

  // Determine grid columns based on prop or number of tiers
  const numTiers = tiers.length;
  const activeColumns = columns || (numTiers >= 4 ? 4 : numTiers === 2 ? 2 : 3);

  let gridClass = 'md:grid-cols-2 lg:grid-cols-3';
  if (activeColumns === 2) gridClass = 'md:grid-cols-2 max-w-4xl';
  if (activeColumns === 4) gridClass = 'md:grid-cols-2 lg:grid-cols-4 max-w-[1600px]';

  return (
    <section className={`py-24 bg-gray-50 relative ${className}`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={title} description={description || ''} className="mb-16" />

        <div className={`mx-auto ${activeColumns === 4 ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
          <div className={`grid grid-cols-1 ${gridClass} gap-8 mx-auto`}>
            {tiers.map((tier, index) => {
              const isHighlight = tier.isRecommended;

              // Dynamic ordering logic
              let orderClass = '';
              if (activeColumns === 3) {
                orderClass = isHighlight
                  ? 'md:col-span-2 lg:col-span-1 lg:order-2'
                  : index === 0
                    ? 'lg:order-1'
                    : 'lg:order-3';
              }

              return (
                <AnimateOnScroll
                  key={index}
                  delay={index * 100}
                  className={`${activeColumns === 3 ? orderClass : ''} h-full`}
                >
                  <div className="relative h-full">
                    {isHighlight && (
                      <div className="absolute top-0 left-0 right-0 -mt-3 text-center z-20">
                        <span className="bg-secondary text-white text-xxs font-bold px-6 py-1.5 rounded-full shadow-xl tracking-widest uppercase">
                          {tier.highlightText || 'Rekomendowany Wybór'}
                        </span>
                      </div>
                    )}
                    <GlassCard
                      className={`p-8 h-full flex flex-col transition-all duration-500 hover:shadow-2xl relative overflow-hidden ${
                        isHighlight
                          ? 'border-secondary shadow-xl ring-4 ring-[#E0EFFF] bg-white'
                          : 'border-gray-100 hover:border-primary/30 bg-white'
                      }`}
                    >
                      {/* Decorative background blob for highlighted */}
                      {isHighlight && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      )}

                      <div className="mb-8">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xxs font-black uppercase tracking-wider mb-4 ${
                            isHighlight
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tier.subtitle || 'Pakiet'}
                        </div>
                        <h3 className="text-2xl font-black text-dark mb-4">{tier.title}</h3>

                        <div className="flex items-baseline gap-2 mb-6">
                          {tier.price !== 'Wycena' && (
                            <span className="text-gray-600 text-sm font-medium">od</span>
                          )}
                          <span className="text-5xl font-black text-dark">{tier.price}</span>
                          <span className="text-gray-700 font-bold text-lg">
                            {tier.currency || (tier.price === 'Wycena' ? '' : 'PLN')}
                          </span>
                          {tier.priceSuffix && (
                            <span className="text-xs text-gray-500 ml-1">{tier.priceSuffix}</span>
                          )}
                        </div>

                        <p className="text-base text-gray-600 leading-relaxed font-medium">
                          {tier.description}
                        </p>
                      </div>

                      <div className="space-y-4 mb-10 flex-grow">
                        {tier.features && tier.features.length > 0 && (
                          <>
                            <h3 className="text-xxs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                              <Sparkles size={14} /> Pakiet zawiera:
                            </h3>
                            <ul className="space-y-3">
                              {tier.features.map((feat, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 text-sm text-gray-700"
                                >
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm ${
                                      isHighlight ? 'bg-secondary' : 'bg-blue-50 text-primary'
                                    }`}
                                  >
                                    <CheckCircle2
                                      size={12}
                                      className={isHighlight ? 'text-white' : 'text-primary'}
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
                        onClick={() => handleCtaClick(tier)}
                        variant={isHighlight ? 'primary' : 'outline'}
                        className={`w-full justify-center py-4 ${
                          isHighlight
                            ? 'shadow-xl shadow-secondary/20 !bg-secondary border-none hover:!bg-dark'
                            : 'border-gray-200 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {tier.buttonText ||
                          (tier.price === 'Wycena' ? 'Zapytaj o Ofertę' : 'Wybierz Pakiet')}
                      </Button>
                    </GlassCard>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingTable;
