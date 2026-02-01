import React from 'react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import Button from '../common/Button';
import { ArrowRight, LucideIcon } from 'lucide-react';
import LazyHydrate from '../common/LazyHydrate';

interface OfferFeatureSectionProps {
  badge: string;
  badgeBg: string;
  badgeTextColor: string;
  title: string;
  description: string;
  features: string[];
  featuresIcon: LucideIcon;
  buttonText: string;
  onButtonClick: () => void;
  visual: React.ReactNode;
  stat?: {
    label: string;
    value: string;
    icon: LucideIcon;
    iconColor: string;
  };
  reverse?: boolean;
  className?: string;
}

/**
 * Reusable section for showcase features in the Offers page.
 * Unifies the layout for Web, Marketing, and other future offers.
 */
const OfferFeatureSection: React.FC<OfferFeatureSectionProps> = ({
  badge,
  badgeBg,
  badgeTextColor,
  title,
  description,
  features,
  featuresIcon: FeatureIcon,
  buttonText,
  onButtonClick,
  visual,
  stat,
  reverse = false,
  className = '',
}) => {
  return (
    <LazyHydrate minHeight="600px">
      <AnimateOnScroll>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${className}`}>
          <div className={`order-2 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${badgeBg} ${badgeTextColor}`}
            >
              {badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark">{title}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">{description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${badgeBg} ${badgeTextColor}`}
                  >
                    <FeatureIcon size={12} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {stat && (
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                <div className={`bg-white p-3 rounded-xl shadow-sm ${stat.iconColor}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xxs font-bold text-gray-500 uppercase">{stat.label}</p>
                  <p className="text-lg font-black text-dark">{stat.value}</p>
                </div>
              </div>
            )}

            <Button onClick={onButtonClick} variant="primary" icon={<ArrowRight size={18} />}>
              {buttonText}
            </Button>
          </div>

          <div className={`order-1 ${reverse ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
              {visual}
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </LazyHydrate>
  );
};

export default OfferFeatureSection;
