import { createClient } from '@sanity/client';
import { SanityTeamMember, SanityCaseStudy, PricingTier } from '@/types';
import { SanityImage, SanityBody } from '@/types/sanity';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'azuef2ua';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-21';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Ensure fresh data, especially after migration
});

export interface SanityCategory {
  _id: string;
  title: string;
  description?: string;
}

export interface SanityArticle {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: SanityImage;
  publishedAt: string;
  excerpt: string;
  body: SanityBody;
  category: { title: string };
  tags: string[];
  readTime: string;
}

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

export const cmsService = {
  /**
   * Fetch all team members
   */
  async getTeamMembers(): Promise<SanityTeamMember[]> {
    try {
      const query = `*[_type == "teamMember"] {
        _id,
        name,
        role,
        image,
        email,
        linkedin
      }`;
      return await client.fetch(query);
    } catch (error) {
      console.warn('Sanity fetch error (getTeamMembers):', error);
      return [];
    }
  },

  /**
   * Fetch Case Studies (List / Tiles)
   */
  async getCaseStudies(category?: string): Promise<SanityCaseStudy[]> {
    try {
      const filter = category ? `&& category == "${category}"` : '';
      const query = `*[_type == "caseStudy" ${filter}] | order(date desc) {
        _id,
        title,
        "slug": slug.current,
        clientLogo,
        category,
        subcategory,
        date,
        excerpt,
        mainImage
      }`;
      return await client.fetch(query);
    } catch (error) {
      console.warn('Sanity fetch error (getCaseStudies):', error);
      return [];
    }
  },

  /**
   * Fetch Single Case Study by Slug
   */
  async getCaseStudyBySlug(slug: string): Promise<SanityCaseStudy | null> {
    try {
      const query = `*[_type == "caseStudy" && slug.current == $slug][0] {
        ...,
        "slug": slug.current,
        downloads[] {
          description,
          "asset": asset->{
            url
          }
        },
        credits[]->{
          _id,
          name,
          role,
          image,
          linkedin
        }
      }`;
      return await client.fetch(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getCaseStudyBySlug: ${slug}):`, error);
      return null;
    }
  },

  /**
   * Fetch all articles for the knowledge base
   */
  async getArticles(): Promise<SanityArticle[]> {
    try {
      const query = `*[_type == "article"] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        mainImage,
        publishedAt,
        excerpt,
        category->{title},
        tags,
        readTime
      }`;
      return await client.fetch(query);
    } catch (error) {
      console.warn('Sanity fetch error (getArticles):', error);
      return [];
    }
  },

  /**
   * Fetch single article by slug
   */
  async getArticleBySlug(slug: string): Promise<SanityArticle | null> {
    try {
      const query = `*[_type == "article" && slug.current == $slug][0] {
        _id,
        title,
        "slug": slug.current,
        mainImage,
        publishedAt,
        excerpt,
        body,
        category->{title},
        tags,
        readTime
      }`;
      return await client.fetch(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getArticleBySlug: ${slug}):`, error);
      return null;
    }
  },

  /**
   * Fetch all categories
   */
  async getCategories(): Promise<SanityCategory[]> {
    try {
      const query = `*[_type == "category"] {
        _id,
        title,
        description
      }`;
      return await client.fetch(query);
    } catch (error) {
      console.warn('Sanity fetch error (getCategories):', error);
      return [];
    }
  },

  /**
   * Fetch all locations for Programmatic SEO (List for SSG)
   */
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
      return await client.fetch(query);
    } catch (error) {
      console.warn('Sanity fetch error (getLocations):', error);
      return [];
    }
  },

  /**
   * Fetch single location by slug
   */
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
      return await client.fetch(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getLocationBySlug: ${slug}):`, error);
      return null;
    }
  },

  /**
   * Fetch all industries for Programmatic SEO (List for SSG)
   */
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
      return await client.fetch(query);
    } catch (error) {
      console.warn('Sanity fetch error (getIndustries):', error);
      return [];
    }
  },

  /**
   * Fetch single industry by slug
   */
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
      return await client.fetch(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getIndustryBySlug: ${slug}):`, error);
      return null;
    }
  },

  /**
   * Fetch Calculator Configuration
   */
  async getCalculatorConfig(): Promise<CalculatorConfig | null> {
    try {
      const query = `*[_type == "calculatorConfig"][0] {
        baseRates,
        designMultipliers,
        features,
        marketing
      }`;
      return await client.fetch(query);
    } catch (error) {
      console.warn('Sanity fetch error (getCalculatorConfig):', error);
      return null;
    }
  },

  /**
   * Fetch Pricing Section by category slug (e.g. 'landing-page')
   */
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
      return await client.fetch(query, { categorySlug });
    } catch (error) {
      console.warn(`Sanity fetch error (getPricingSection: ${categorySlug}):`, error);
      return null;
    }
  },

  /**
   * Fetch related content (Articles & Case Studies) based on category
   */
  async getRelatedContent(
    currentSlug: string,
    category?: string
  ): Promise<
    Array<{
      _type: 'article' | 'caseStudy';
      title: string;
      slug: string;
      mainImage: SanityImage;
      category: string;
      date: string;
    }>
  > {
    try {
      // Fallback to fetching recent items if no category is provided
      const filter = category
        ? `(category->title == $category || category == $category)`
        : `true`;

      const query = `*[
        (_type == "article" || _type == "caseStudy") &&
        slug.current != $currentSlug &&
        ${filter}
      ] | order(publishedAt desc, date desc)[0...3] {
        _type,
        title,
        "slug": slug.current,
        mainImage,
        "category": coalesce(category->title, category),
        "date": coalesce(publishedAt, date)
      }`;

      return await client.fetch(query, { currentSlug, category });
    } catch (error) {
      console.warn('Sanity fetch error (getRelatedContent):', error);
      return [];
    }
  },
};
