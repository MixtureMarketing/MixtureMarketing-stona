import { Article } from '../../types';
import { SanityArticle } from '../../services/cmsService';
import { parseToIsoDate, parseReadTime } from './dateUtils';

export const getArticleSchema = (
  article: Article | SanityArticle | Partial<Article & SanityArticle> | null,
  ogImage: string,
  baseUrl: string,
  canonicalUrl: string,
) => {
  if (!article) return null;

  const getCategoryTitle = (cat: string | { title: string } | undefined): string => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    return cat.title || '';
  };

  const categoryTitle = getCategoryTitle(article.category).toLowerCase();
  const schemaType =
    categoryTitle.includes('tech') || categoryTitle.includes('technologia')
      ? 'TechArticle'
      : 'BlogPosting';

  const rawDate = 'date' in article ? article.date : (article as SanityArticle).publishedAt;
  const isoDate = parseToIsoDate(rawDate || new Date().toISOString());
  const duration = article.readTime ? parseReadTime(article.readTime) : undefined;
  const description =
    ('description' in article ? article.description : (article as SanityArticle).excerpt) || '';
  const section =
    ('categoryLabel' in article ? (article as Article).categoryLabel : undefined) ||
    getCategoryTitle(article.category) ||
    'Baza Wiedzy';

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: article.title,
    image: [ogImage, `${baseUrl}/assets/images/sygnet.png`],
    author: {
      '@type': 'Organization',
      name: 'Mixture Marketing Team',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/images/sygnet.png`,
      },
    },
    datePublished: isoDate,
    dateModified: isoDate,
    description: description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: (article.tags || []).join(', '),
    articleSection: section,
    ...(duration && { timeRequired: duration }),
    ...(schemaType === 'TechArticle' && { proficiencyLevel: 'Intermediate' }),
  };
};
