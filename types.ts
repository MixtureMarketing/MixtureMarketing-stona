// Define specific brand colors as constants for reuse in logic if needed,
// though we primarily use them as arbitrary Tailwind values.

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

import { SanityImage, SanityBody } from '@/types/sanity';

// --- CMS Types (Portfolio) ---

export interface SanityTeamMember {
  _id: string;
  name: string;
  role: string;
  image?: SanityImage;
  email?: string;
  linkedin?: string;
}

export interface SanityCaseStudy {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  category: 'web' | 'marketing' | 'design';
  subcategory?: string[];
  date?: string;
  excerpt?: string;
  mainImage?: SanityImage;
  clientLogo?: SanityImage;

  // Content (Portable Text)
  challenge?: SanityBody;
  solution?: SanityBody;
  result?: SanityBody;

  // Web Specs
  websiteUrl?: string;
  techStack?: string[];
  integrations?: string[];
  performanceScore?: number;

  // Marketing Specs
  kpi?: Array<{ label: string; value: string }>;
  platforms?: string[];

  // Design Specs
  tools?: string[];
  typography?: string;

  // Media
  gallery?: SanityImage[];
  designAssets?: Array<{
    asset: SanityImage;
    caption?: string;
  }>;
  downloads?: Array<{
    asset: { url: string };
    description?: string;
  }>;

  // Relations
  testimonial?: string;
  testimonialAuthor?: string;
  credits?: SanityTeamMember[];
}
