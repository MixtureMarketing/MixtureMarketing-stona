export interface SeoContent {
  title: string;
  description: string;
  image: string;
}

export interface HeroContent {
  badge: string;
  title:
    | string
    | {
        line1: string;
        line2: string;
        line3?: string;
        accent?: string;
        label?: string;
        highlight?: string;
      };
  titleAccent?: string;
  description: string;
  cta?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  microCopy?:
    | string
    | { responseTime?: string; noObligation?: string; label?: string; value?: string };
  visuals?: Record<string, unknown>;
  trustBadge?: string;
  caseStudy?: { label: string; desc: string };
  simulator?: Record<string, unknown>;
  buttons?: {
    startup: { title: string; subtitle: string };
    enterprise: { title: string; subtitle: string };
  };
  revenueLabel?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  title: string;
  subtitle?: string;
  items?: FaqItem[]; // Some sections use 'items', others might be array directly? No, usually object with items or just array.
  // In WEB_DEV_CONTENT, faq is { title, subtitle } and faqs is the array separately?
  // Let's check.
}

// Helper to check usage:
// WEB_DEV: faq: {title, subtitle}, faqs: FaqItem[]
// MARKETING: faqs: FaqItem[] (direct array)
// OFFERS: faq: { title, items: FaqItem[] }
