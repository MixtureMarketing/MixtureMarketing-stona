import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { SanityImage } from '../../types/sanity';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '../../services/cmsService';
import LazyHydrate from '../common/LazyHydrate';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

interface RelatedItem {
  _type: 'article' | 'caseStudy';
  title: string;
  slug: string;
  mainImage: SanityImage;
  category: string;
  date: string;
}

interface RelatedArticlesProps {
  currentSlug?: string;
  currentArticleId?: string; // Alias for backward compatibility
  category?: string;
  tags?: string[];
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ currentSlug, currentArticleId, category }) => {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = currentSlug || currentArticleId || '';

  useEffect(() => {
    if (!slug) return;

    const fetchRelated = async () => {
      try {
        setLoading(true);
        // Remove "/baza-wiedzy/" or "/portfolio/" prefix for slug comparison if needed
        const cleanSlug = slug.split('/').pop() || slug;
        const data = await cmsService.getRelatedContent(cleanSlug, category);
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch related content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [slug, category]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Mogą Cię zainteresować</h2>
          <Link
            to="/baza-wiedzy"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            Więcej artykułów <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ))
            : items.map((item) => (
                <Link
                  key={item.slug}
                  to={item._type === 'caseStudy' ? `/portfolio/${item.slug}` : `/baza-wiedzy/${item.slug}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    {item.mainImage ? (
                      <img
                        src={urlFor(item.mainImage).width(600).height(400).url()}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        Brak zdjęcia
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-900 shadow-sm">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                      <Calendar size={14} className="text-indigo-500" />
                      {new Date(item.date).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedArticles;