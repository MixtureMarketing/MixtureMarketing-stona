import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../../types';
import { SanityArticle } from '../../services/cmsService';
import { useCanonicalUrl, getOgImage } from '../../hooks/useSeoHelpers';
import { getArticleSchema } from '../../utils/seo/articleSchema';

interface ArticleSchemaSeoProps {
  article: Article | SanityArticle | Partial<Article & SanityArticle>;
  canonical?: string;
  image?: string;
}

// Osobny komponent (lazy w ArticleTemplate) — articleSchema importuje urlFor
// z @sanity/image-url. Trzymanie tego poza glownym <Seo /> usuwa ~76% unused JS
// z Seo chunk na 95% stron ktore nie sa artykulami.
const ArticleSchemaSeo: React.FC<ArticleSchemaSeoProps> = ({ article, canonical, image }) => {
  const baseUrl = 'https://mixturemarketing.pl';
  const canonicalUrl = useCanonicalUrl(canonical);
  const ogImage = getOgImage(image);
  const schema = getArticleSchema(article, ogImage, baseUrl, canonicalUrl);
  if (!schema) return null;
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default ArticleSchemaSeo;
