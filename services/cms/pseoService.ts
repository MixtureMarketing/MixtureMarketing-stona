import { SanityImage } from '@/types/sanity';
import { fetchWithCache } from './client';

export interface SanityLocation {
  _id: string;
  city: string;
  slug: { current: string };
  genitive: string;
  businessContext: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SanityIndustry {
  _id: string;
  name: string;
  slug: { current: string };
  forWho: string;
  painPoints: string[];
  techRequirements: string[];
  jargon: string[];
  compliance?: string;
  heroImage?: SanityImage;
}

export const pseoService = {
  async getLocations(): Promise<SanityLocation[]> {
    try {
      const query = `*[_type == "location"] {
        _id,
        city,
        "slug": slug.current,
        genitive,
        businessContext,
        seoTitle,
        seoDescription
      }`;
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getLocations):', error);
      return [];
    }
  },

  async getLocationBySlug(slug: string): Promise<SanityLocation | null> {
    try {
      const query = `*[_type == "location" && slug.current == $slug][0] {
        _id,
        city,
        "slug": slug.current,
        genitive,
        businessContext,
        seoTitle,
        seoDescription
      }`;
      return await fetchWithCache(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getLocationBySlug: ${slug}):`, error);
      return null;
    }
  },

  async getIndustries(): Promise<SanityIndustry[]> {
    try {
      const query = `*[_type == "industry"] {
        _id,
        name,
        "slug": slug.current,
        forWho,
        painPoints,
        techRequirements,
        jargon,
        compliance,
        heroImage
      }`;
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getIndustries):', error);
      return [];
    }
  },

  async getIndustryBySlug(slug: string): Promise<SanityIndustry | null> {
    try {
      const query = `*[_type == "industry" && slug.current == $slug][0] {
        _id,
        name,
        "slug": slug.current,
        forWho,
        painPoints,
        techRequirements,
        jargon,
        compliance,
        heroImage
      }`;
      return await fetchWithCache(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getIndustryBySlug: ${slug}):`, error);
      return null;
    }
  },
};
