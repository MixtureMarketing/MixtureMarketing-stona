import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import BaseCard from '../common/BaseCard';
import Image from '../common/Image';
import Container from '../common/Container';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { Article } from '../../types';
import { KNOWLEDGE_BASE_CONTENT as CONTENT } from '../../data/content';

/**
 * Immersyjny scroll (--p): karty artykułów schodzą się z trzech stron
 * (lewa / dół / prawa) do siatki — „wiedza zbiera się w bibliotekę".
 * Scroll-linked, dwukierunkowy; spoczynek = var(--p, 1) (prerender-safe).
 */
const CARD_DRIFT = [
  'translate3d(calc((1 - var(--p, 1)) * -44px), 0, 0)',
  'translate3d(0, calc((1 - var(--p, 1)) * 52px), 0)',
  'translate3d(calc((1 - var(--p, 1)) * 44px), 0, 0)',
];

const KnowledgeBaseTeaser: React.FC = () => {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [failed, setFailed] = useState(false);
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    // Dynamic import to reduce initial bundle size
    import('@/services/cmsService')
      .then(({ cmsService }) => cmsService.getArticles())
      .then((data) => {
        const featured = data.filter((a) => a.isFeatured).slice(0, 3);
        if (featured.length === 0) setFailed(true);
        else setLatestArticles(featured);
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    // Szew jasno-ciemny (choreografia całości): biel wraca zaokrąglonym
    // grzbietem na granat LeadMagnetu — druga i ostatnia nakładka po hero.
    <section
      ref={sectionRef}
      className="relative z-10 -mt-8 overflow-hidden rounded-t-[2rem] bg-white py-24 md:-mt-12"
    >
      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <SectionHeader
              align="left"
              triad
              title={CONTENT.teaser.title}
              description={CONTENT.teaser.description}
            />
          </div>
          <Link
            to="/baza-wiedzy/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-dark hover:border-secondary hover:bg-blue-50 hover:text-secondary font-bold rounded-full transition-colors motion-safe:focus-visible:-translate-y-0.5"
          >
            {CONTENT.teaser.button}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        {/* Empty-state: CMS niedostępny / brak wyróżnionych — uczciwy komunikat
            zamiast pustej sekcji, z drogą dalej do pełnej bazy */}
        {failed && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-10 text-center">
            <p className="text-gray-700">
              Nie udało się załadować najnowszych artykułów.{' '}
              <Link to="/baza-wiedzy/" className="font-bold text-secondary hover:underline">
                Przejdź do pełnej Bazy Wiedzy
              </Link>
              .
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestArticles.map((article, index) => (
            <div
              key={article.id}
              className={index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}
              style={{ transform: CARD_DRIFT[index % CARD_DRIFT.length] }}
            >
              <Link
                to={article.slug}
                className="group block h-full"
                aria-label={`Czytaj artykuł: ${article.title}`}
              >
                <BaseCard
                  variant="solid"
                  padding="none"
                  hover="lift"
                  className="flex flex-col h-full overflow-hidden border-gray-100 group-hover:border-primary transition-all duration-500"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full transform object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      width={600}
                      height={400}
                    />
                    {/* Fade u dołu — chowa wypalony w grafice tytuł, łączy obraz z kartą */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-wider text-dark shadow-sm flex items-center gap-1.5">
                        <Tag size={10} className="text-accent-dark" aria-hidden="true" />{' '}
                        {article.categoryLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xxs font-bold text-gray-600 uppercase tracking-widest mb-4">
                      <Clock size={12} className="text-accent-dark" aria-hidden="true" />{' '}
                      {article.readTime} czytania
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-4 group-hover:text-secondary transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold text-accent-dark group-hover:gap-3 transition-all">
                      Czytaj dalej <ArrowRight size={16} />
                    </div>
                  </div>
                </BaseCard>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default KnowledgeBaseTeaser;
