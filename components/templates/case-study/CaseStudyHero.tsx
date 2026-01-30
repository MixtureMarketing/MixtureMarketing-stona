import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';
import { SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/services/cmsService';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

interface CaseStudyHeroProps {
  project: SanityCaseStudy;
}

const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({ project }) => {
  return (
    <header className="pt-32 pb-12 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-5xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-dark text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            {project.category} / {project.subcategory?.[0] || 'Realizacja'}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-dark mb-8 leading-tight">
            {project.title}
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            {project.excerpt}
          </p>

          <div className="inline-flex flex-wrap justify-center gap-6 bg-white p-2 pr-6 rounded-full shadow-lg border border-gray-100">
            {project.client && (
              <div className="flex items-center gap-3 pl-2">
                {project.clientLogo ? (
                  <div className="w-10 h-10 rounded-full bg-white p-1 shadow-sm overflow-hidden border border-gray-100">
                    <img
                      src={urlFor(project.clientLogo).width(64).url()}
                      alt={project.client}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
                <span className="font-bold text-dark">{project.client}</span>
              </div>
            )}
            <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Calendar size={16} /> {project.date || '2024'}
            </div>
          </div>
        </motion.div>

        {project.mainImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-[1600px] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white"
          >
            <img
              src={urlFor(project.mainImage).width(1600).url()}
              alt={project.title}
              className="w-full h-auto object-cover"
              fetchPriority="high"
            />
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default CaseStudyHero;
