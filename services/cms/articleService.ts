import { SanityImage, SanityBody } from '@/types/sanity';
import { fetchWithCache } from './client';

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

export interface SanityCategory {
  _id: string;
  title: string;
  description?: string;
}

export const articleService = {
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
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getArticles):', error);
      return [];
    }
  },

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
      return await fetchWithCache(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getArticleBySlug: ${slug}):`, error);
      return null;
    }
  },

  async getCategories(): Promise<SanityCategory[]> {
    try {
      const query = `*[_type == "category"] {
        _id,
        title,
        description
      }`;
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getCategories):', error);
      return [];
    }
  },
};
