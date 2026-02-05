import { SanityImage, SanityBody } from '@/types/sanity';
import { Article } from '@/types/article';
import { fetchWithCache, urlFor } from './client';
import { LEGACY_ARTICLES } from './legacyArticles';

export interface SanityArticle {
  _id: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  mainImage: SanityImage;
  publishedAt: string;
  excerpt: string;
  body: SanityBody;
  category: { title: string };
  tags: string[];
  readTime: string;
  author?: {
    name: string;
    image?: SanityImage;
    bio?: string;
  };
}

interface SanityCategory {
  _id: string;
  title: string;
  description?: string;
}

export const articleService = {
  async getArticles(): Promise<Article[]> {
    try {
      const query = `*[_type == "article"] | order(publishedAt desc) {
        _id,
        _updatedAt,
        title,
        "slug": slug.current,
        mainImage,
        publishedAt,
        excerpt,
        category->{title},
        tags,
        readTime,
        author->{name, image, bio}
      }`;
      const sanityArticles: SanityArticle[] = await fetchWithCache(query);

      const mappedSanity: Article[] = sanityArticles.map((art) => ({
        id: art._id,
        title: art.title,
        description: art.excerpt,
        category: (art.category?.title?.toLowerCase() as Article['category']) || 'tech',
        categoryLabel: art.category?.title || 'Artykuł',
        image: art.mainImage ? urlFor(art.mainImage).width(800).url() : '/assets/images/sygnet.png',
        date: art.publishedAt,
        readTime: art.readTime || '5 min',
        slug: `/baza-wiedzy/${typeof art.slug === 'string' ? art.slug : art.slug.current}`,
        tags: art.tags || [],
      }));

      return [...LEGACY_ARTICLES, ...mappedSanity].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    } catch (error) {
      console.warn('Sanity fetch error (getArticles):', error);
      return LEGACY_ARTICLES;
    }
  },

  async getArticleBySlug(slug: string): Promise<SanityArticle | null> {
    try {
      const query = `*[_type == "article" && slug.current == $slug][0] {
        _id,
        _updatedAt,
        title,
        "slug": slug.current,
        mainImage,
        publishedAt,
        excerpt,
        body,
        category->{title},
        tags,
        readTime,
        author->{name, image, bio}
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
