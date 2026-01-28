import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { cmsService } from '../../../services/cmsService';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '../../../services/cmsService';
import { SanityImage } from '../../../types/sanity';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

interface ServiceRelatedArticlesProps {
  category: string; // 'web', 'marketing', 'design', 'tech'
  title?: string;
  className?: string;
}

const ServiceRelatedArticles: React.FC<ServiceRelatedArticlesProps> = ({
  category,
  title = 'Poszerz swoją wiedzę',
  className = '',
}) => {
  const [articles, setArticles] = useState<
    Array<{
      slug: string;
      title: string;
      mainImage: SanityImage;
      category: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // Map service categories to Sanity categories if needed
        // For now assuming direct mapping or partial match handled by cmsService
        const data = await cmsService.getRelatedContent('', category);
        setArticles(data.filter((item) => item._type === 'article').slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch service related articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

  if (!loading && articles.length === 0) return null;

  return (
    <section className={`py-24 bg-white relative overflow-hidden ${className}`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
              <BookOpen size={14} /> Baza Wiedzy
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#213261]">{title}</h2>
          </div>
          <Link
            to="/baza-wiedzy"
            className="group flex items-center gap-2 text-sm font-bold text-[#3F3D91] hover:text-[#61B6DE] transition-colors"
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
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))
            : articles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/baza-wiedzy/${article.slug}`}
                  className="group block"
                >
                  <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all duration-500">
                    {article.mainImage ? (
                      <img
                        src={urlFor(article.mainImage).width(600).height(400).url()}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#213261]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xxs font-bold uppercase tracking-wider text-[#213261] mb-2">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#213261] group-hover:text-[#3F3D91] transition-colors leading-snug mb-3">
                    {article.title}
                  </h3>

                  <div className="flex items-center text-sm font-bold text-[#3A8FB7] group-hover:gap-2 transition-all">
                    Czytaj dalej <ArrowRight size={16} className="ml-1" />
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceRelatedArticles;
