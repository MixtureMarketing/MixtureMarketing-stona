import React, { useState, useEffect } from 'react';
import { Filter, Layers, Layout, Zap, PenTool } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cmsService } from '../../services/cmsService';
import Seo from '../common/Seo';
import PortfolioGrid from '../features/portfolio/PortfolioGrid';
import { SanityCaseStudy } from '../../types/sanity';
import Container from '../common/Container';
import BaseCard from '../common/BaseCard';
import Button from '../common/Button';

const PortfolioPage = () => {
  const [projects, setProjects] = useState<SanityCaseStudy[]>([]);
  const [filter, setFilter] = useState<'all' | 'web' | 'marketing' | 'design'>('all');
  const [loading, setLoading] = useState(true);
  // Globalny CSS-kill nie łapie animacji JS framera — respektujemy reduced-motion ręcznie
  const reducedMotion = useReducedMotion();

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
        {/* Hero words-only w ciemnym rejestrze (lift 2026-07-16) — gradient-text,
            eyebrow „Wybrane Realizacje" i fioletowe orby usunięte. */}
        <div className="pt-40 pb-20 relative overflow-hidden bg-deep-dark text-white">
          <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />

          <Container className="relative z-10">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight text-white">
                Tworzymy cyfrowe <br />
                <span className="text-primary">doświadczenia.</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                Od zaawansowanych aplikacji webowych, przez kampanie marketingowe, po branding.
                Każdy projekt niżej pochodzi z naszego CMS — wejdź i oceń sam.
              </p>
            </motion.div>

            {/* --- FILTERS --- */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.2 }}
              className="mt-16 flex flex-wrap gap-4"
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id as 'all' | 'web' | 'marketing' | 'design')}
                    aria-pressed={isActive}
                    className={`relative px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 group overflow-hidden ${
                      isActive
                        ? 'text-deep-dark'
                        : 'text-white/80 hover:text-white bg-white/5 border border-white/15'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-white rounded-full"
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : { type: 'spring', bounce: 0.2, duration: 0.6 }
                        }
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon
                        size={16}
                        aria-hidden="true"
                        className={
                          isActive
                            ? 'text-secondary'
                            : 'text-white/50 group-hover:text-primary transition-colors'
                        }
                      />
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </Container>
        </div>

        {/* --- PROJECTS GRID --- */}
        <Container className="pb-32">
          {!loading && filteredProjects.length === 0 ? (
            <BaseCard
              variant="solid"
              padding="lg"
              rounded="3xl"
              className="text-center py-20 border-dashed border-gray-200"
            >
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
            </BaseCard>
          ) : (
            <PortfolioGrid projects={filteredProjects} loading={loading} />
          )}
        </Container>
      </div>
    </>
  );
};

export default PortfolioPage;
