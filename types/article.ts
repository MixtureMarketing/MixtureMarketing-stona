export interface Article {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'marketing' | 'design' | 'analytics' | 'business';
  categoryLabel: string;
  image: string;
  /** Data publikacji, ISO RRRR-MM-DD. */
  date: string;
  /** Data ostatniej realnej zmiany treści (ISO); brak = jak `date`. */
  updatedDate?: string;
  readTime: string;
  slug: string;
  tags: string[];
  isFeatured?: boolean;
}
