import { PortableTextBlock } from '@portabletext/types';

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  caption?: string;
}

export type SanityBody = PortableTextBlock[];

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
