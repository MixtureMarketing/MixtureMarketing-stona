import React from 'react';
import {
  LucideIcon,
  FileText,
  Share2,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import Seo from '../common/Seo';
import AmbientBackground from '../common/AmbientBackground';
import Breadcrumbs from '../common/Breadcrumbs';
import RelatedArticles from './RelatedArticles';
import { useNotification } from '../../context/NotificationContext';

interface ArticleShellProps {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  image: string;
  icon?: LucideIcon;
  accentColor: string;
  secondaryAccentColor?: string;
  heroVisual?: React.ReactNode;
  children: React.ReactNode;
  slug: string;
  author?: { name: string; role?: string; url?: string };
  publishedDate?: string;
  updatedDate?: string;
}

const DEFAULT_AUTHOR = {
  name: 'Zespół Mixture Marketing',
  role: 'Eksperci SEO & Web Development',
  url: '/o-nas/',
};

const ArticleShell: React.FC<ArticleShellProps> = ({
  id = 'default-article',
  title = '',
  description,
  category,
  categoryLabel,
  image,
  icon: Icon = FileText,
  accentColor = '#3F3D91',
  heroVisual,
  children,
  slug,
  author = DEFAULT_AUTHOR,
  publishedDate,
  updatedDate,
}: ArticleShellProps) => {
  const titleStr = typeof title === 'string' ? title : '';
  const titleParts = titleStr.includes(':') ? titleStr.split(':') : [titleStr, ''];

  const { showNotification } = useNotification();

  const breadcrumbs = [
    { name: 'Strona Główna', item: '/' },
    { name: 'Baza Wiedzy', item: '/baza-wiedzy' },
    { name: titleStr, item: slug || '#' },
  ];

  const shareUrl = `https://mixturemarketing.pl${slug}`;
  const baseUrl = 'https://mixturemarketing.pl';
  const isoPublished = publishedDate
    ? new Date(publishedDate).toISOString()
    : new Date('2025-01-01').toISOString();
  const isoUpdated = updatedDate ? new Date(updatedDate).toISOString() : isoPublished;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: titleStr,
    description,
    image: [`${baseUrl}${image}`, `${baseUrl}/assets/images/sygnet.png`],
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.role && { jobTitle: author.role }),
      url: `${baseUrl}${author.url || '/o-nas/'}`,
      worksFor: {
        '@type': 'Organization',
        name: 'Mixture Marketing',
        url: baseUrl,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/assets/images/sygnet.png` },
    },
    datePublished: isoPublished,
    dateModified: isoUpdated,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${baseUrl}${slug}` },
    articleSection: categoryLabel,
  };

  const formatPL = (iso: string) =>
    new Date(iso).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const shareActions = [
    {
      icon: <Facebook size={16} />,
      label: 'Facebook',
      onClick: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank'),
    },
    {
      icon: <Linkedin size={16} />,
      label: 'LinkedIn',
      onClick: () =>
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank'),
    },
    {
      icon: <LinkIcon size={16} />,
      label: 'Kopiuj link',
      onClick: () => {
        navigator.clipboard.writeText(shareUrl);
        showNotification('Link skopiowany do schowka!', 'success');
      },
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-blue-100">
      <Seo
        title={titleStr}
        description={description}
        image={image}
        type="article"
        breadcrumbs={breadcrumbs}
        jsonLd={articleJsonLd}
      />

      <AmbientBackground />

      <div className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <Breadcrumbs />

            <div className="flex items-center gap-3">
              <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Share2 size={12} /> Udostępnij:
              </span>
              <div className="flex gap-2">
                {shareActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-secondary hover:text-white transition-all shadow-sm"
                    title={action.label}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Header */}

          <header className="mb-20 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-blue-100 shadow-sm">
              {Icon && <Icon size={14} className="shrink-0" />}

              <span>{categoryLabel}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {titleParts[0]} {titleParts[1] ? ':' : ''} <br className="hidden md:block" />
              {titleParts[1] && (
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-dark"
                  style={{
                    backgroundImage: `linear-gradient(to right, #1f2937, ${accentColor || '#3F3D91'}, #1f2937)`,
                  }}
                >
                  {titleParts[1]}
                </span>
              )}
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {description}
            </p>

            {/* Author byline — sygnal E-E-A-T (Expertise, Authoritativeness) dla Google + AI search */}
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <RouterLink
                to={author.url || '/o-nas/'}
                className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                rel="author"
              >
                <UserIcon size={14} className="text-primary" />
                <span className="font-semibold text-dark">{author.name}</span>
                {author.role && <span className="text-gray-500">· {author.role}</span>}
              </RouterLink>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <time dateTime={isoPublished}>{formatPL(isoPublished)}</time>
                {isoUpdated !== isoPublished && (
                  <span className="text-gray-400">
                    · aktualizacja: <time dateTime={isoUpdated}>{formatPL(isoUpdated)}</time>
                  </span>
                )}
              </span>
            </div>
          </header>

          {/* Hero Visual Slot */}
          {heroVisual && <div className="mb-24">{heroVisual}</div>}

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-dark prose-li:text-gray-700">
            {children || (
              <div className="py-10 text-center text-gray-400">Artykuł w przygotowaniu...</div>
            )}

            <div className="mt-24">
              <RelatedArticles currentArticleId={id} category={category} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ArticleShell;
