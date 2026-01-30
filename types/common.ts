export const COLORS = {
  primary: '#213261', // Dark Navy - Main text, Headings
  secondary: '#3F3D91', // Indigo - Secondary actions, Active states
  accent: '#61B6DE', // Light Blue - Hover, Icons, Glow
  accentDark: '#3A8FB7', // Darker Blue - For text on light backgrounds (WCAG AA compliant)
  background: '#F5F7FA', // Light Gray - Page background
  white: '#FFFFFF',
  success: '#00C853',
  error: '#E1306C',
  warning: '#F4B400',
};

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
