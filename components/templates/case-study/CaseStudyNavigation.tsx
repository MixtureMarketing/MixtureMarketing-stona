import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SanityCaseStudy } from '@/types';
import { urlFor } from '@/services/cmsService';

interface CaseStudyNavigationProps {
  nextProject: SanityCaseStudy | null;
}

const CaseStudyNavigation: React.FC<CaseStudyNavigationProps> = ({ nextProject }) => {
  // MIX-1378: slug z GROQ to tekst; bez niepustego sluga nie ma linku (nigdy /portfolio/undefined/).
  const slug = typeof nextProject?.slug === 'string' ? nextProject.slug.trim() : '';
  if (!nextProject || !slug) return null;

  return (
    <section className="bg-dark relative overflow-hidden group">
      <Link to={`/portfolio/${slug}/`} className="block py-24 cursor-pointer">
        {nextProject.mainImage && (
          <div className="absolute inset-0 opacity-20 group-hover:opacity-10 transition-opacity duration-700">
            <img
              src={urlFor(nextProject.mainImage).width(1200).url()}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover grayscale mix-blend-multiply"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10 text-center">
          <p className="text-white/60 text-sm font-bold uppercase tracking-[0.3em] mb-4">
            Następny Projekt
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 group-hover:scale-105 transition-transform duration-500">
            {nextProject.title}
          </h2>
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-dark rounded-full font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
            Zobacz Case Study <ArrowRight size={20} />
          </div>
        </div>
      </Link>
    </section>
  );
};

export default CaseStudyNavigation;
