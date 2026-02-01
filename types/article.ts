export interface Article {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'marketing' | 'design' | 'analytics';
  categoryLabel: string;
  image: string;
  date: string;
  readTime: string;
  slug: string;
  tags: string[];
  isFeatured?: boolean;
}
