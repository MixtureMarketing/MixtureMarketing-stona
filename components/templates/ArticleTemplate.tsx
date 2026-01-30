import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cmsService, SanityArticle, urlFor } from '@/services/cmsService';
import Seo from '@/components/common/Seo';
import NotFound from '@/components/common/NotFound';
import AmbientBackground from '@/components/common/AmbientBackground';
import LazyHydrate from '@/components/common/LazyHydrate';
import { Calendar, Clock, Tag } from 'lucide-react';
import RelatedArticles from '../articles/RelatedArticles';
import PortableTextRenderer from '../common/PortableTextRenderer';

const ArticleTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<SanityArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await cmsService.getArticleBySlug(slug);
        if (data) {
          setArticle(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto"></div>
          <div className="text-gray-400 font-bold uppercase tracking-widest text-xxs">
            Ładowanie artykułu...
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-dark selection:bg-primary/30">
      <Seo
        title={article.title}
        description={article.excerpt || 'Artykuł z bazy wiedzy Mixture Marketing'}
        lcpImage={
          article.mainImage
            ? urlFor(article.mainImage).width(1200).url()
            : '/assets/images/sygnet.png'
        }
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Baza Wiedzy', item: '/baza-wiedzy' },
          { name: article.title, item: `/baza-wiedzy/${article.slug.current}` },
        ]}
        article={{
          id: article._id,
          title: article.title,
          description: article.excerpt,
          date: article.publishedAt,
          category: article.category?.title as 'tech' | 'marketing' | 'design' | 'analytics',
          readTime: article.readTime,
          categoryLabel: article.category?.title || 'Baza Wiedzy',
          image: '/assets/images/sygnet.png', // Placeholder
          slug: `/baza-wiedzy/${article.slug.current}`,
          tags: article.tags || [],
        }}
      />

      <AmbientBackground />

      <div className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <header className="mb-16 text-center">
            {article.category?.title && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-[#cce4ff]">
                <span>{article.category.title}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-black mb-8 text-dark leading-[1.1] tracking-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                {new Date(article.publishedAt).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {article.readTime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  {article.readTime} min czytania
                </div>
              )}
            </div>

            {article.excerpt && (
              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mt-8 border-b border-gray-200 pb-8 italic">
                {article.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-black prose-a:text-primary prose-strong:text-dark prose-pre:bg-dark prose-pre:shadow-xl prose-img:rounded-3xl">
            <PortableTextRenderer value={article.body} />
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Tag size={14} /> Tagi Artykułu
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <LazyHydrate minHeight="400px">
        <RelatedArticles currentSlug={slug || ''} category={article.category?.title as string} />
      </LazyHydrate>
    </div>
  );
};

export default ArticleTemplate;
