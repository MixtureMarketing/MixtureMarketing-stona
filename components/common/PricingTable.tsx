import React from 'react';
import AnimateOnScroll from './AnimateOnScroll';
import SectionHeader from './SectionHeader';
import PricingTierCard from './PricingTierCard';
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
    if (tier.onCtaClick) tier.onCtaClick();
    else openModal('web');
  };

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
                  <PricingTierCard
                    tier={tier}
                    isHighlight={isHighlight ?? false}
                    onCtaClick={() => handleCtaClick(tier)}
                  />
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
