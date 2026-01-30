import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/services/cmsService';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

interface CaseStudyNavigationProps {
  nextProject: SanityCaseStudy | null;
}

const CaseStudyNavigation: React.FC<CaseStudyNavigationProps> = ({ nextProject }) => {
  const navigate = useNavigate();

  if (!nextProject) return null;

  return (
    <section
      className="bg-dark py-24 relative overflow-hidden group cursor-pointer"
      onClick={() => navigate(`/portfolio/${nextProject.slug.current}`)}
    >
      {nextProject.mainImage && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-10 transition-opacity duration-700">
          <img
            src={urlFor(nextProject.mainImage).width(1920).url()}
            alt=""
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
    </section>
  );
};

export default CaseStudyNavigation;
