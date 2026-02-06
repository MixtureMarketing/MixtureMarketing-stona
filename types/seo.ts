import { Article } from './article';
import { SanityArticle } from '../services/cmsService';

export interface SeoProps {
  title: string;
  description: string;
  type?: string;
  name?: string;
  canonical?: string;
  image?: string;
  lcpImage?: string;
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
