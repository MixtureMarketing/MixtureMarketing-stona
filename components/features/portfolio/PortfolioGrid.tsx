import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SanityCaseStudy } from '../../../types';
import BaseCard from '../../common/BaseCard';
import { urlFor } from '../../../services/cmsService';
import { isTransitionActive } from '../../../utils/caseStudyTransition';
import { isPortfolioVideoEnabled } from '@/config/flags';
import PortfolioCardVideo, { PORTFOLIO_CARD_ATTR } from './PortfolioCardVideo';
import { canPlayCardVideo, cardVideoFor } from './cardVideo';

const cardPhotoUrl = (project: SanityCaseStudy) =>
  urlFor(project.mainImage!).width(CARD_PHOTO.width).height(CARD_PHOTO.height).fit('crop').url();

/** Atrybut granatowej nakładki najechania („Zobacz case study”): testy i pomiary (MIX-1896). */
export const PORTFOLIO_OVERLAY_ATTR = 'data-portfolio-overlay';

/**
 * MIX-1896: karta z filmem nie ma nakładki, więc fokus z klawiatury pokazuje pierścień na całej karcie
 * (pseudo-element stretched linku, wewnątrz karty: `ring-inset`, bo karta ma `overflow-hidden`;
 * zaokrąglenie jak BaseCard `rounded-2xl`).
 */
export const VIDEO_CARD_FOCUS =
  'focus-visible:after:ring-4 focus-visible:after:ring-inset focus-visible:after:ring-primary focus-visible:after:rounded-2xl';

/** MIX-1722: the card photo has the same 16:9 crop as the case-study hero (HERO_PHOTO, 1600x900), at half the size. */
export const CARD_PHOTO = { width: 800, height: 450 } as const;

interface PortfolioGridProps {
  projects: SanityCaseStudy[];
  loading: boolean;
}

/** Etykiety PL i kolor plakietki kategorii — paleta marki zamiast blue/indigo/purple. */
const CATEGORY_BADGE: Record<string, { label: string; className: string }> = {
  web: { label: 'Web Development', className: 'bg-secondary/90' },
  marketing: { label: 'Marketing', className: 'bg-accent-dark/90' },
  design: { label: 'Design', className: 'bg-dark/90' },
};

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ projects, loading }) => {
  // Framer omija globalny CSS-kill reduced-motion — respektujemy ręcznie
  const reducedMotion = useReducedMotion();
  // MIX-1896 r2: karty, których film nie wczytał się (błąd pliku): wracają do nakładki
  const [nieudane, setNieudane] = React.useState<Record<string, true>>({});
  // MIX-1711: lista montowana w trakcie przejścia (powrót z realizacji) stoi od razu: karty bez wejścia
  // (opacity 0, skala 0,9 przez 0,4 s), więc zdjęcie leci do pełnej karty, a klatki animacji są lżejsze
  const entrance = !reducedMotion && !isTransitionActive();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <BaseCard
            key={i}
            variant="solid"
            padding="none"
            className="animate-pulse flex flex-col overflow-hidden"
          >
            <div className="aspect-[16/9] bg-gray-200 w-full" />
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
    // vt-lista: w trakcie przejścia bez content-visibility (components/common/caseStudyTransitions.css, MIX-1711)
    // MIX-1741: `auto` = ostatni zmierzony rozmiar. Bez niego po przejściu wstecz (powrót content-visibility:auto)
    // lista bywała na klatkę pominięta i miała 1500 px zamiast swojej wysokości (375: 4820 px), strona się skracała,
    // przewinięcie spadało na stopkę, a lista nad ekranem zostawała pominięta (sonda .bieg/mix1741/footer.mjs).
    <div className="vt-lista grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [content-visibility:auto] [contain-intrinsic-size:auto_1px_auto_1500px]">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => {
          // MIX-1896: karta z filmem (ten sam warunek co film kafelka) bez nakładki i bez powiększenia zdjęcia
          const video = cardVideoFor(project);
          // film faktycznie gra tylko na urządzeniu z myszą bez reduced-motion i bez błędu pliku; inaczej nakładka
          const gra = !!video && canPlayCardVideo() && !nieudane[project._id];
          return (
            <motion.div
              key={project._id}
              layout={!reducedMotion}
              initial={entrance ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: reducedMotion ? 0 : 0.4 }}
              className="group h-full"
              {...(isPortfolioVideoEnabled() ? { [PORTFOLIO_CARD_ATTR]: '' } : {})}
            >
              {/* Karta klikalna przez stretched-link na tytule (klawiatura + czytniki),
                nie przez onClick na divie. */}
              <BaseCard
                variant="solid"
                padding="none"
                hover="lift"
                className="h-full flex flex-col border-gray-100 relative"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                  {project.mainImage ? (
                    <img
                      src={cardPhotoUrl(project)}
                      alt={project.title}
                      width={CARD_PHOTO.width}
                      height={CARD_PHOTO.height}
                      className={`w-full h-full object-cover${
                        gra ? '' : ' transition-transform duration-700 group-hover:scale-110'
                      }`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="font-bold uppercase tracking-widest text-xs">
                        Brak zdjęcia
                      </span>
                    </div>
                  )}

                  {video && (
                    <PortfolioCardVideo
                      video={video}
                      poster={cardPhotoUrl(project)}
                      onFail={() => setNieudane((m) => ({ ...m, [project._id]: true }))}
                    />
                  )}

                  {/* Overlay Tags */}
                  <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 text-xxs font-bold uppercase tracking-wider rounded-lg shadow-sm border border-white/20 text-white ${
                        CATEGORY_BADGE[project.category]?.className ?? 'bg-dark/90'
                      }`}
                    >
                      {CATEGORY_BADGE[project.category]?.label ?? project.category}
                    </span>
                  </div>

                  {/* Hover Overlay: tylko karta bez filmu (MIX-1896: nakładka zasłaniała film) */}
                  {!gra && (
                    <div
                      {...{ [PORTFOLIO_OVERLAY_ATTR]: '' }}
                      className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    >
                      <div className="transform translate-y-4 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300">
                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-dark rounded-full font-bold text-sm">
                          Zobacz case study <ArrowRight size={16} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-dark mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      <Link
                        to={`/portfolio/${project.slug}/`}
                        className={`after:absolute after:inset-0 after:z-10 focus-visible:outline-none${
                          gra ? ` ${VIDEO_CARD_FOCUS}` : ''
                        }`}
                      >
                        {project.title}
                      </Link>
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
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioGrid;
