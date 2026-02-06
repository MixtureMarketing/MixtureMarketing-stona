import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoProps } from '../../types/seo';
import { useCanonicalUrl, getOgImage } from '../../hooks/useSeoHelpers';
import {
  getArticleSchema,
  getBreadcrumbsSchema,
  getFaqSchema,
  getServiceSchema,
  getLocalBusinessSchema,
} from '../../utils/seoSchemas';

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
  breadcrumbs,
  faq,
  service,
}) => {
  const fullTitle = `${title} | ${name}`;
  const baseUrl = 'https://mixturemarketing.pl';
  const canonicalUrl = useCanonicalUrl(canonical);
  const ogImage = getOgImage(image);

  const memoizedSchemas = React.useMemo(() => {
    return [
      getArticleSchema(article || null, ogImage, baseUrl, canonicalUrl),
      getBreadcrumbsSchema(breadcrumbs || [], baseUrl),
      getFaqSchema(faq || []),
      getServiceSchema(service, title, description, baseUrl),
      getLocalBusinessSchema(baseUrl),
      ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
    ]
      .filter(Boolean)
      .map((schema) => JSON.stringify(schema));
  }, [
    article,
    ogImage,
    baseUrl,
    canonicalUrl,
    breadcrumbs,
    faq,
    service,
    title,
    description,
    jsonLd,
  ]);

  const lcpBasePath = React.useMemo(
    () => lcpImage?.substring(0, lcpImage.lastIndexOf('.')),
    [lcpImage],
  );

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
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
      {memoizedSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {schema}
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
