import { Article } from '../../types';
import { SanityArticle, urlFor } from '../../services/cmsService';
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

  const isSanity = (a: unknown): a is SanityArticle =>
    typeof a === 'object' && a !== null && ('_updatedAt' in a || 'publishedAt' in a);
  const rawDate = 'date' in article ? article.date : (article as SanityArticle).publishedAt;
  const updatedDate =
    isSanity(article) && article._updatedAt
      ? article._updatedAt
      : rawDate || new Date().toISOString();

  const isoDate = parseToIsoDate(rawDate || new Date().toISOString());
  const isoUpdatedDate = parseToIsoDate(updatedDate);
  const duration = article.readTime ? parseReadTime(article.readTime) : undefined;
  const description =
    ('description' in article ? article.description : (article as SanityArticle).excerpt) || '';
  const section =
    ('categoryLabel' in article ? (article as Article).categoryLabel : undefined) ||
    getCategoryTitle(article.category) ||
    'Baza Wiedzy';

  // Author Resolution
  let authorSchema;
  if (isSanity(article) && article.author) {
    authorSchema = {
      '@type': 'Person',
      name: article.author.name,
      url: `${baseUrl}/o-nas`, // Fallback link
      ...(article.author.image && {
        image: urlFor(article.author.image).width(400).height(400).url(),
      }),
    };
  } else {
    authorSchema = {
      '@type': 'Organization',
      name: 'Mixture Marketing Team',
      url: baseUrl,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: article.title,
    image: [ogImage, `${baseUrl}/assets/images/sygnet.png`],
    author: authorSchema,
    publisher: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/images/sygnet.png`,
      },
    },
    datePublished: isoDate,
    dateModified: isoUpdatedDate,
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
