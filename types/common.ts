export type ContactType = 'general' | 'web' | 'marketing' | 'design' | 'audit' | 'consultation';

// --- Pricing Types ---

export interface PricingTier {
  _id?: string;
  title: string;
  subtitle?: string;
  price: string;
  currency?: string;
  priceSuffix?: string; // e.g. "od wydatków"
  description: string;
  features: string[];
  isRecommended?: boolean;
  highlightText?: string;
  buttonText?: string;
  // Optional local override for specific actions (e.g. open modal with specific type)
  onCtaClick?: () => void;
}

export interface PricingSectionData {
  title: string;
  description?: string;
  tiers: PricingTier[];
}
