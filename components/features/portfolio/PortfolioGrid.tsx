import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SanityCaseStudy } from '../../../types';
import { SanityImage } from '../../../types/sanity';
import BaseCard from '../../common/BaseCard';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '../../../services/cmsService';

const builder = imageUrlBuilder(client);
function urlForImage(source: SanityImage) {
  return builder.image(source);
}

interface PortfolioGridProps {
  projects: SanityCaseStudy[];
  loading: boolean;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ projects, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <BaseCard
            key={i}
            variant="solid"
            padding="none"
            className="h-[500px] animate-pulse flex flex-col overflow-hidden"
          >
            <div className="h-2/3 bg-gray-200 w-full" />
            <div className="p-8 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </BaseCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [content-visibility:auto] [contain-intrinsic-size:1px_1500px]">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate(`/portfolio/${project.slug}`)}
            className="group cursor-pointer h-full"
          >
            <BaseCard
              variant="solid"
              padding="none"
              hover="lift"
              className="h-full flex flex-col border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden bg-gray-100">
                {project.mainImage ? (
                  <img
                    src={urlForImage(project.mainImage).width(800).height(600).url()}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="font-bold uppercase tracking-widest text-xs">
                      Brak zdjęcia
                    </span>
                  </div>
                )}

                {/* Overlay Tags */}
                <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 text-xxs font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border border-white/20 text-white ${
                      project.category === 'web'
                        ? 'bg-blue-600/90'
                        : project.category === 'marketing'
                          ? 'bg-indigo-600/90'
                          : 'bg-purple-600/90'
                    }`}
                  >
                    {project.category}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-dark rounded-full font-bold text-sm">
                      Zobacz Case Study <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-dark mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    {project.client || 'Klient poufny'}
                  </p>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                  {project.excerpt}
                </p>

                {/* Tags */}
                {project.subcategory && (
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                    {project.subcategory.slice(0, 3).map((sub, i) => (
                      <span
                        key={i}
                        className="text-xxs font-bold uppercase text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100"
                      >
                        {sub}
                      </span>
                    ))}
                    {project.subcategory.length > 3 && (
                      <span className="text-xxs font-bold text-gray-400 px-1 py-1">
                        + {project.subcategory.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </BaseCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioGrid;
