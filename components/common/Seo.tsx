import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Article } from '../../data/articles';
import { SanityArticle } from '../../services/cmsService';

interface SeoProps {
  title: string;
  description: string;
  type?: string;
  name?: string;
  canonical?: string;
  image?: string;
  lcpImage?: string; // High priority image for LCP
  article?: Article | SanityArticle | Partial<Article & SanityArticle>; // Accepting both static and Sanity articles
  jsonLd?: Record<string, any> | Record<string, any>[]; // Custom JSON-LD data
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  type = 'website',
  name = 'Mixture Marketing',
  canonical,
  image,
  lcpImage,
  article,
  jsonLd,
}) => {
  const fullTitle = `${title} | ${name}`;
  const location = useLocation();
  const baseUrl = 'https://mixturemarketing.pl';

  // Enforce trailing slash for canonical URLs (except root) to match server behavior
  let pathname = location.pathname;
  if (pathname !== '/' && !pathname.endsWith('/')) {
    pathname += '/';
  }

  const canonicalUrl = canonical || `${baseUrl}${pathname}${location.search}`;
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${baseUrl}${image}`
    : `${baseUrl}/assets/images/sygnet.png`;

  // Process LCP Image for preloading
  const renderLcpPreload = () => {
    if (!lcpImage) return null;
    const basePath = lcpImage.substring(0, lcpImage.lastIndexOf('.'));
    return (
      <>
        <link
          rel="preload"
          as="image"
          href={`${basePath}.avif`}
          type="image/avif"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href={`${basePath}.webp`}
          type="image/webp"
          fetchPriority="high"
        />
      </>
    );
  };

  const parseToIsoDate = (dateStr: string) => {
    // If it's already an ISO date (contains T or just YYYY-MM-DD)
    if (dateStr.includes('-') && (dateStr.includes('T') || dateStr.split('-').length === 3)) {
      return dateStr;
    }

    const months: { [key: string]: string } = {
      stycznia: '01',
      lutego: '02',
      marca: '03',
      kwietnia: '04',
      maja: '05',
      czerwca: '06',
      lipca: '07',
      sierpnia: '08',
      września: '09',
      października: '10',
      listopada: '11',
      grudnia: '12',
    };

    const parts = dateStr.toLowerCase().split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]];
      const year = parts[2];
      if (month) return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const parseReadTime = (readTime: string) => {
    const minutes = parseInt(readTime);
    if (isNaN(minutes)) return undefined;
    return `PT${minutes}M`;
  };

  const renderArticleSchema = () => {
    if (!article) return null;

    // Normalize data from different article types
    const getCategoryTitle = (cat: any) => {
      if (typeof cat === 'string') return cat;
      return cat?.title || '';
    };

    const categoryTitle = getCategoryTitle(article.category).toLowerCase();
    const schemaType =
      categoryTitle.includes('tech') || categoryTitle.includes('technologia')
        ? 'TechArticle'
        : 'BlogPosting';

    const rawDate = 'date' in article ? article.date : (article as any).publishedAt;
    const isoDate = parseToIsoDate(rawDate || new Date().toISOString());
    const duration = article.readTime ? parseReadTime(article.readTime) : undefined;
    const description =
      ('description' in article ? article.description : (article as any).excerpt) || '';
    const section =
      ('categoryLabel' in article ? article.categoryLabel : undefined) ||
      getCategoryTitle(article.category) ||
      'Baza Wiedzy';

    return (
      <script type="application/ld+json">
        {JSON.stringify({
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
        })}
      </script>
    );
  };

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* LCP Preloading */}
      {renderLcpPreload()}

      {/* Schema.org */}
      {renderArticleSchema()}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {/* Facebook Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default Seo;
