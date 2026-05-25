import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../../types';
import { SanityArticle } from '../../services/cmsService';
import { useCanonicalUrl, getOgImage } from '../../hooks/useSeoHelpers';
// Bezposrednie importy zamiast barrel ('../../utils/seoSchemas') — pozwala
// Rollupowi tree-shakeowac. articleSchema NIE jest tu importowany — strony
// artykulow uzywaja osobnego <ArticleSchemaSeo> (lazy w ArticleTemplate),
// dzieki czemu @sanity/image-url (urlFor) nie trafia do glownego Seo chunk
// (76% unused JS na non-article pages).
import {
  getBreadcrumbsSchema,
  getFaqSchema,
  getLocalBusinessSchema,
} from '../../utils/seo/commonSchemas';
import { getServiceSchema } from '../../utils/seo/serviceSchema';

interface SeoProps {
  title: string;
  description: string;
  type?: string;
  name?: string;
  canonical?: string;
  image?: string;
  lcpImage?: string;
  noindex?: boolean;
  article?: Article | SanityArticle | Partial<Article & SanityArticle>;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: { name: string; item: string }[];
  faq?: { question: string; answer: string }[];
  service?: {
    name: string;
    description: string;
    areaServed?: string;
    serviceType?: string;
    offers?: { price: string; currency: string; name: string }[];
  };
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  type = 'website',
  name = 'Mixture Marketing',
  canonical,
  image,
  lcpImage,
  noindex,
  article,
  jsonLd,
  breadcrumbs,
  faq,
  service,
}) => {
  const fullTitle = `${title} | ${name}`;
  const baseUrl = 'https://mixturemarketing.pl';
  const canonicalUrl = useCanonicalUrl(canonical);
  const ogImage = getOgImage(image);

  // Uwaga: article schema NIE jest renderowany tutaj — strony artykulow
  // dolaczaja osobny <ArticleSchemaSeo article={...} /> obok <Seo />.
  void article;
  const schemas = [
    getBreadcrumbsSchema(breadcrumbs || [], baseUrl),
    getFaqSchema(faq || []),
    getServiceSchema(service, title, description, baseUrl),
    getLocalBusinessSchema(baseUrl),
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
  ].filter(Boolean);

  const lcpBasePath = lcpImage?.substring(0, lcpImage.lastIndexOf('.'));

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {/* hreflang — sygnal dla Google ze strona jest po polsku (pl-PL) i jest defaultem */}
      <link rel="alternate" hrefLang="pl-PL" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      {lcpBasePath && (
        <>
          <link
            rel="preload"
            as="image"
            href={`${lcpBasePath}.avif`}
            type="image/avif"
            fetchPriority="high"
          />
          <link
            rel="preload"
            as="image"
            href={`${lcpBasePath}.webp`}
            type="image/webp"
            fetchPriority="high"
          />
        </>
      )}

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default Seo;
