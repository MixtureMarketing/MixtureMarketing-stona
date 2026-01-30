import { PricingTier } from '@/types';
import { fetchWithCache } from './client';

export interface CalculatorConfig {
  baseRates: {
    landingPage: { minPrice: number; maxPrice: number; minTime: number; maxTime: number };
    corporate: { minPrice: number; maxPrice: number; minTime: number; maxTime: number };
    ecommerce: { minPrice: number; maxPrice: number; minTime: number; maxTime: number };
    webApp: { minPrice: number; maxPrice: number; minTime: number; maxTime: number };
  };
  designMultipliers: {
    template: number;
    custom: number;
    premium: number;
  };
  features: {
    cms: number;
    blog: number;
    i18n: number;
    integrations: number;
    payments: number;
    auth: number;
    filtering: number;
  };
  marketing: {
    copywriting: number;
    seo: number;
    social: number;
  };
}

export interface SanityPricingSection {
  title: string;
  description?: string;
  tiers: PricingTier[];
}

export const configService = {
  async getCalculatorConfig(): Promise<CalculatorConfig | null> {
    try {
      const query = `*[_type == "calculatorConfig"][0] {
        baseRates,
        designMultipliers,
        features,
        marketing
      }`;
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getCalculatorConfig):', error);
      return null;
    }
  },

  async getPricingSection(categorySlug: string): Promise<SanityPricingSection | null> {
    try {
      const query = `*[_type == "pricingSection" && category == $categorySlug][0] {
        title,
        description,
        "tiers": packages[]->{
          title,
          subtitle,
          price,
          currency,
          priceSuffix,
          description,
          features,
          isRecommended,
          highlightText,
          buttonText
        }
      }`;
      return await fetchWithCache(query, { categorySlug });
    } catch (error) {
      console.warn(`Sanity fetch error (getPricingSection: ${categorySlug}):`, error);
      return null;
    }
  },
};
