import React, { useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';
import { SanityCaseStudy } from '@/types';
import { urlFor } from '@/services/cmsService';
import { VT_NAMES, isViewTransitionsEnabled } from '@/utils/viewTransitions';
import { getArrivalPath, signalTargetReady, subscribeArrival } from '@/utils/caseStudyArrival';
import './caseStudyHero.css';

interface CaseStudyHeroProps {
  project: SanityCaseStudy;
}

const noArrival = () => null;

/** MIX-1471: zdjęcie na górze ma stały kadr (bez przesunięć układu); atrybuty = proporcja kadru. */
export const HERO_PHOTO = { width: 1600, height: 900 } as const;

const CategoryPill: React.FC<{ project: SanityCaseStudy }> = ({ project }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-dark text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
    <span className="w-2 h-2 rounded-full bg-primary"></span>
    {project.category} / {project.subcategory?.[0] || 'Realizacja'}
  </div>
);

const ClientDatePill: React.FC<{ project: SanityCaseStudy }> = ({ project }) =>
  project.client || project.date ? (
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
      {/* Bez fallbacku daty: brak `date` w CMS = brak daty, nie zmyślony rok. */}
      {project.date && (
        <>
          {project.client && <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Calendar size={16} /> {project.date}
          </div>
        </>
      )}
    </div>
  ) : null;

const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({ project }) => {
  // MIX-1308: wejście przez przejście z karty (A1/A2). Przełącznik wyłączony = stan nigdy
  // nie jest ustawiany, więc render jest identyczny jak przed zmianą.
  const { pathname } = useLocation();
  const arrivalPath = useSyncExternalStore(subscribeArrival, getArrivalPath, noArrival);
  const named = arrivalPath !== null && arrivalPath === pathname;
  // Zapamiętane przy montowaniu: wejście przez przejście wyłącza własne wejście framer-motion
  // (plan MIX-1310, sekcja 5, uwaga 2), także po zdjęciu nazw na końcu przejścia.
  const [arrived] = useState(named);

  useLayoutEffect(() => {
    if (named) signalTargetReady(pathname);
  }, [named, pathname]);

  const titleStyle = named ? { viewTransitionName: VT_NAMES.title } : undefined;

  // MIX-1471: przy włączonym przełączniku zdjęcie (to samo co na karcie listy) stoi na samej
  // górze pod nagłówkiem strony, a kategoria, H1, opis i klient/data są pod nim — przejście
  // wygląda jak powiększenie zdjęcia karty. Wyłączony przełącznik = układ produkcyjny niżej.
  if (isViewTransitionsEnabled()) {
    return (
      <header
        className={`${project.mainImage ? 'pt-10' : 'pt-32'} pb-12 relative z-10`}
        data-hero-layout="photo-top"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {project.mainImage && (
            // Bez wejścia framer-motion: zdjęcie jest elementem LCP i celem przejścia; MIX-1651: proporcja 16/9 na każdej szerokości (jak na desktopie);
            // bez kwadratu na telefonie, ramka rezerwuje miejsce (CLS 0).
            <div
              className="max-w-[1600px] mx-auto rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-100 aspect-[16/9] max-h-[75vh] mb-12"
              style={named ? { viewTransitionName: VT_NAMES.image } : undefined}
            >
              <img
                src={urlFor(project.mainImage)
                  .width(HERO_PHOTO.width)
                  .height(HERO_PHOTO.height)
                  .fit('crop')
                  .url()}
                alt={project.title}
                width={HERO_PHOTO.width}
                height={HERO_PHOTO.height}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
            </div>
          )}
          <motion.div
            initial={arrived ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-5xl mx-auto text-center"
          >
            <CategoryPill project={project} />
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-dark mb-8 leading-tight"
              style={titleStyle}
            >
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
              {project.excerpt}
            </p>
            <ClientDatePill project={project} />
          </motion.div>
        </div>
      </header>
    );
  }

  return (
    <header className="pt-32 pb-12 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={arrived ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-5xl mx-auto text-center mb-16"
        >
          <CategoryPill project={project} />

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black text-dark mb-8 leading-tight"
            style={titleStyle}
          >
            {project.title}
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            {project.excerpt}
          </p>

          <ClientDatePill project={project} />
        </motion.div>

        {project.mainImage && (
          <motion.div
            initial={arrived ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-[1600px] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white"
            style={named ? { viewTransitionName: VT_NAMES.image } : undefined}
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
