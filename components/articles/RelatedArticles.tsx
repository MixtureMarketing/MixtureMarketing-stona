import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { cmsService, urlFor } from '../../services/cmsService';
import { SanityImage } from '../../types/sanity';
import { formatDate } from '@/utils/date';

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
  layout?: 'standard' | 'service'; // 'standard' for article footer, 'service' for offer pages
  title?: string;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentSlug,
  currentArticleId,
  category = 'tech',
  layout = 'standard',
  title,
}) => {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = currentSlug || currentArticleId || 'unknown';

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        // Remove "/baza-wiedzy/" or "/portfolio/" prefix for slug comparison
        const cleanSlug = slug.includes('/') ? slug.split('/').pop() || slug : slug;
        const data = await cmsService.getRelatedContent(
          cleanSlug === 'unknown' ? '' : cleanSlug,
          category,
        );
        setItems(data as RelatedItem[]);
      } catch (error) {
        console.error('Failed to fetch related content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [slug, category]);

  if (!loading && items.length === 0) return null;

  const finalTitle =
    title || (layout === 'service' ? 'Poszerz swoją wiedzę' : 'Mogą Cię zainteresować');

  if (layout === 'service') {
    return (
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                <BookOpen size={14} /> Baza Wiedzy
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy">{finalTitle}</h2>
            </div>
            <Link
              to="/baza-wiedzy"
              className="group flex items-center gap-2 text-sm font-bold text-brand-indigo hover:text-brand-blue transition-colors"
            >
              Zobacz wszystkie artykuły
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-2xl mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  </div>
                ))
              : items.map((item) => (
                  <Link
                    key={item.slug}
                    to={
                      item._type === 'caseStudy'
                        ? `/portfolio/${item.slug}`
                        : `/baza-wiedzy/${item.slug}`
                    }
                    className="group block"
                  >
                    <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all duration-500">
                      {item.mainImage?.asset ? (
                        <img
                          src={urlFor(item.mainImage).width(600).height(400).url()}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                          Brak zdjęcia
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xxs font-bold uppercase tracking-wider text-brand-navy mb-2">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-indigo transition-colors leading-snug mb-3">
                      {item.title}
                    </h3>

                    <div className="flex items-center text-sm font-bold text-accent-dark group-hover:gap-2 transition-all">
                      Czytaj dalej <ArrowRight size={16} className="ml-1" />
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{finalTitle}</h2>
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
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ))
            : items.map((item) => (
                <Link
                  key={item.slug}
                  to={
                    item._type === 'caseStudy'
                      ? `/portfolio/${item.slug}`
                      : `/baza-wiedzy/${item.slug}`
                  }
                  className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    {item.mainImage?.asset ? (
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
                      {item.category || 'Artykuł'}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                      <Calendar size={14} className="text-indigo-500" />
                      {formatDate(item.date)}
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
