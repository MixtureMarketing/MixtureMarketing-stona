/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { cmsService, SanityArticle, client } from '@/services/cmsService';
import Seo from '@/components/common/Seo';
import NotFound from '@/components/common/NotFound';
import AmbientBackground from '@/components/common/AmbientBackground';
import LazyHydrate from '@/components/common/LazyHydrate';
import { Calendar, Clock, Tag } from 'lucide-react';
import AuditTeaser from '@/components/features/audit/AuditTeaser';
import RelatedArticles from '../articles/RelatedArticles';

import imageUrlBuilder from '@sanity/image-url';
import { SanityImage } from '@/types/sanity';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

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
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="pt-32 pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-8 mb-16">
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded-full mx-auto"></div>
            <div className="w-full h-24 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="flex justify-center gap-6">
              <div className="w-32 h-5 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="w-32 h-5 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            <div className="w-full h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-full h-64 bg-gray-200 animate-pulse rounded-2xl my-8"></div>
            <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-4/6 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return <NotFound />;
  }

  const isMarketing =
    article.category?.title?.toLowerCase().includes('marketing') ||
    article.category?.title?.toLowerCase().includes('seo') ||
    article.category?.title?.toLowerCase().includes('ads');

  // State to track if we've inserted the teaser
  let hasInsertedTeaser = false;

  // Custom components for PortableText
  const ptComponents: PortableTextComponents = {
    types: {
      image: ({ value }: { value: SanityImage }) => {
        if (!value?.asset?._ref) return null;
        return (
          <div className="my-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center text-gray-400 text-xs italic">
            [Obraz z Sanity: {value.asset._ref}]
          </div>
        );
      },
    },
    block: {
      h2: ({ children }: { children?: React.ReactNode }) => {
        const showTeaser = !hasInsertedTeaser;
        if (showTeaser) hasInsertedTeaser = true;

        return (
          <>
            <h2 className="text-3xl font-bold text-dark mt-16 mb-8 leading-tight">{children}</h2>
            {showTeaser && (
              <div className="my-12 not-prose">
                <LazyHydrate minHeight="120px">
                  <AuditTeaser
                    layout="compact"
                    variant="light"
                    buttonText={isMarketing ? 'Sprawdź swoje SEO' : 'Analizuj Kod Strony'}
                    placeholder={
                      isMarketing ? 'Adres Twojej strony (np. mojanazwa.pl)...' : 'https://...'
                    }
                    className="bg-indigo-50/50 border-indigo-100 shadow-sm"
                  />
                </LazyHydrate>
              </div>
            )}
          </>
        );
      },
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className="text-2xl font-bold text-dark mt-10 mb-4">{children}</h3>
      ),
      normal: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-6 text-lg text-gray-700 leading-relaxed">{children}</p>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="border-l-4 border-primary pl-6 py-2 my-10 italic text-xl text-gray-700 bg-white p-6 rounded-r-2xl shadow-sm">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: { children?: React.ReactNode }) => (
        <ul className="list-disc pl-6 mb-8 text-lg text-gray-700 space-y-3 marker:text-primary">
          {children}
        </ul>
      ),
      number: ({ children }: { children?: React.ReactNode }) => (
        <ol className="list-decimal pl-6 mb-8 text-lg text-gray-700 space-y-3 marker:text-dark marker:font-bold">
          {children}
        </ol>
      ),
    },
  };

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
          category: article.category?.title,
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
            <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
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
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mt-8 border-b border-gray-200 pb-8">
                {article.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <LazyHydrate minHeight="600px">
            <article className="prose prose-lg prose-slate max-w-none">
              <PortableText value={article.body} components={ptComponents} />
            </article>
          </LazyHydrate>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <LazyHydrate minHeight="100px">
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <Tag size={16} /> Tagi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </LazyHydrate>
          )}
        </div>
      </div>

      <LazyHydrate minHeight="400px">
        <RelatedArticles currentSlug={slug || ''} category={article.category?.title as any} />
      </LazyHydrate>
    </div>
  );
};

export default ArticleTemplate;
