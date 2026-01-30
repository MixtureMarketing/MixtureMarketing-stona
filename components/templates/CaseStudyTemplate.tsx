import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import { client, cmsService } from '@/services/cmsService';
import { SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import Seo from '@/components/common/Seo';
import NotFound from '@/components/common/NotFound';
import RelatedArticles from '../articles/RelatedArticles';
import LazyHydrate from '../common/LazyHydrate';

// Refactored Sub-components
import CaseStudyHero from './case-study/CaseStudyHero';
import CaseStudyContent from './case-study/CaseStudyContent';
import CaseStudySidebar from './case-study/CaseStudySidebar';
import CaseStudyNavigation from './case-study/CaseStudyNavigation';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

const CaseStudyTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<SanityCaseStudy | null>(null);
  const [nextProject, setNextProject] = useState<SanityCaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeAsset, setActiveAsset] = useState<{ asset: SanityImage; caption?: string } | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const [current, all] = await Promise.all([
          cmsService.getCaseStudyBySlug(slug),
          cmsService.getCaseStudies(),
        ]);

        if (current) {
          setProject(current);
          const currentIndex = all.findIndex((p) => p.slug.current === slug);
          if (currentIndex !== -1 && currentIndex < all.length - 1) {
            setNextProject(all[currentIndex + 1]);
          } else if (all.length > 0 && all[0].slug.current !== slug) {
            setNextProject(all[0]);
          } else {
            setNextProject(null);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-dark"></div>
      </div>
    );
  }

  if (error || !project) return <NotFound />;

  return (
    <div className="min-h-screen bg-gray-50 text-dark selection:bg-primary selection:text-white">
      <Seo
        title={`${project.title} - Case Study Mixture Marketing`}
        description={project.excerpt || `Zobacz realizację dla klienta ${project.client}`}
        lcpImage={project.mainImage ? urlFor(project.mainImage).width(1200).url() : undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: project.title,
          image: project.mainImage ? [urlFor(project.mainImage).width(1200).url()] : [],
          datePublished: project.date,
          author: { '@type': 'Organization', name: 'Mixture Marketing' },
          publisher: {
            '@type': 'Organization',
            name: 'Mixture Marketing',
            logo: {
              '@type': 'ImageObject',
              url: 'https://mixturemarketing.pl/assets/images/sygnet.png',
            },
          },
          description: project.excerpt,
        }}
      />

      {/* --- ASSET MODAL --- */}
      <AnimatePresence>
        {activeAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl overflow-y-auto cursor-zoom-out"
            onClick={() => setActiveAsset(null)}
          >
            <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4">
              <button
                onClick={() => setActiveAsset(null)}
                className="fixed top-6 right-6 z-[1010] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
              >
                <X size={24} />
              </button>

              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="w-full max-w-6xl bg-white rounded-lg overflow-hidden shadow-2xl relative cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {activeAsset.caption && (
                  <div className="bg-dark text-white p-4 text-center font-bold text-sm">
                    {activeAsset.caption}
                  </div>
                )}
                <img
                  src={urlFor(activeAsset.asset).width(1920).url()}
                  alt={activeAsset.caption || 'Design Preview'}
                  className="w-full h-auto block"
                />
              </motion.div>
              <p className="mt-8 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                Przewiń aby zobaczyć całość
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CaseStudyHero project={project} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-20 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <CaseStudyContent project={project} onAssetClick={setActiveAsset} />
          <CaseStudySidebar project={project} />
        </div>
      </main>

      <LazyHydrate minHeight="400px">
        <RelatedArticles currentSlug={slug || ''} category={project.category} />
      </LazyHydrate>

      <CaseStudyNavigation nextProject={nextProject} />
    </div>
  );
};

export default CaseStudyTemplate;
