/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsService } from '../../services/cmsService';
import { SanityCaseStudy } from '../../types';
import Seo from '../common/Seo';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import { ArrowRight, Filter, Layers, Zap, PenTool, Layout } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '../../services/cmsService';

const builder = imageUrlBuilder(client);
function urlForImage(source: any) {
  return builder.image(source);
}

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SanityCaseStudy[]>([]);
  const [filter, setFilter] = useState<'all' | 'web' | 'marketing' | 'design'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const data = await cmsService.getCaseStudies();
      setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = React.useMemo(() => {
    if (filter === 'all') {
      return projects;
    }
    return projects.filter((p) => p.category === filter);
  }, [filter, projects]);

  const categories = [
    { id: 'all', label: 'Wszystkie', icon: Layers },
    { id: 'web', label: 'Web Development', icon: Layout },
    { id: 'marketing', label: 'Marketing', icon: Zap },
    { id: 'design', label: 'Design', icon: PenTool },
  ];

  return (
    <>
      <Seo
        title="Portfolio - Nasze Realizacje | Mixture Marketing"
        description="Zobacz wybrane projekty stron www, kampanii marketingowych i brandingu. Sprawdź, jak łączymy technologię z kreatywnością, by budować przewagę rynkową."
      />

      <div className="min-h-screen bg-gray-50 text-dark">
        {/* --- HERO SECTION --- */}
        <div className="pt-32 pb-20 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-t from-purple-100/50 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase mb-4 pl-1">
                Wybrane Realizacje
              </p>
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                Tworzymy cyfrowe <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark to-secondary">
                  doświadczenia
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Od zaawansowanych aplikacji webowych, przez skuteczne kampanie marketingowe, po
                unikalny branding. Poznaj projekty, które przynoszą realne wyniki.
              </p>
            </motion.div>

            {/* --- FILTERS --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 flex flex-wrap gap-4"
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id as any)}
                    className={`relative px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 group overflow-hidden ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 hover:text-dark bg-white border border-gray-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-dark"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon
                        size={16}
                        className={
                          isActive
                            ? 'text-primary'
                            : 'text-gray-400 group-hover:text-primary transition-colors'
                        }
                      />
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* --- PROJECTS GRID --- */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[500px] bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse flex flex-col overflow-hidden"
                >
                  <div className="h-2/3 bg-gray-200 w-full" />
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [content-visibility:auto] [contain-intrinsic-size:1px_1500px]">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
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
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2">
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
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
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

                        <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">
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
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Filter size={32} />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-2">Brak projektów</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                W tej kategorii nie mamy jeszcze opublikowanych case studies. Sprawdź inne kategorie
                lub wróć do nas wkrótce.
              </p>
              <Button variant="primary" onClick={() => setFilter('all')}>
                Pokaż wszystkie projekty
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PortfolioPage;
