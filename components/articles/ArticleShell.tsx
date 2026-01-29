import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import Seo from '../common/Seo';
import AmbientBackground from '../common/AmbientBackground';
import RelatedArticles from './RelatedArticles';

interface ArticleShellProps {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  image: string;
  icon: LucideIcon;
  accentColor: string;
  secondaryAccentColor?: string;
  heroVisual?: React.ReactNode;
  children: React.ReactNode;
}

const ArticleShell: React.FC<ArticleShellProps> = ({
  id,
  title,
  description,
  category,
  categoryLabel,
  image,
  icon: Icon,
  accentColor, // e.g. '#61DAFB'
  secondaryAccentColor = '#00D8FF',
  heroVisual,
  children,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark selection:bg-primary/20 font-sans">
      <Seo title={title} description={description} image={image} />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] pointer-events-none bg-gray-100">
        <div
          className="h-full shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-100 ease-out"
          style={{ 
            width: `${scrollProgress}%`, 
            backgroundColor: accentColor,
            boxShadow: `0 0 15px ${accentColor}`
          }}
        />
      </div>

      <AmbientBackground />

      <div className="pt-12 pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <header className="mb-20 mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-8 border border-blue-100 shadow-sm">
              <Icon size={14} />
              <span>{categoryLabel}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 text-dark leading-[1.1] tracking-tight">
              {title.split(': ')[0]}: <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark" style={{ 
                backgroundImage: `linear-gradient(to right, #1f2937, ${accentColor}, #1f2937)` 
              }}>
                {title.split(': ')[1] || ''}
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
              {description}
            </p>
          </header>

          {/* Hero Visual Slot */}
          {heroVisual && <div className="mb-24">{heroVisual}</div>}

          <article className="prose prose-lg prose-slate max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-dark prose-li:text-gray-700">
            {children}
            
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
