import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { client } from '../../../services/cms/client';
import { SanityImage } from '../../../types/sanity';
import WanderingGlow from '../../visuals/WanderingGlow';
import FlipDotHeading from '../../visuals/flipdot/FlipDotHeading';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../../data/content';

/**
 * Ciemnia dowodowa huba /design/ (przebudowa 2026-07-16, krytyka 14/40).
 * Zastępuje sekcję „ROI designu" z liczbami z powietrza (94% / 200%):
 * realizacje z tagami projektowymi z CMS — wejdź i oceń sam.
 * Wykluczenia zweryfikowane OKIEM: makiety z lorem ipsum (impackt,
 * driftmark) oraz glamspace (ilustracja wektorowa, nie zrzut — wróci,
 * jeśli właściciel potwierdzi, że to nasza praca projektowa).
 */

const builder = imageUrlBuilder(client);

const DESIGN_TAGS: Record<string, string> = {
  branding: 'Branding',
  uiux: 'UI/UX',
  print: 'Print',
};

const EXCLUDED_SLUGS = new Set([
  'impackt-edu',
  'driftmark-marine-e-commerce-z-konfiguratorem-lodzi-i-rebranding',
  'glamspace',
]);

interface Realization {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  date?: string;
  subcategory?: string[];
  mainImage?: SanityImage;
}

const DesignProof: React.FC = () => {
  const [items, setItems] = useState<Realization[]>([]);
  const [failed, setFailed] = useState(false);
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    let alive = true;
    import('../../../services/cms/caseStudyService')
      .then(({ caseStudyService }) => caseStudyService.getCaseStudies())
      .then((data) => {
        if (!alive) return;
        const today = new Date().toISOString().slice(0, 10);
        const usable = (data as unknown as Realization[])
          .filter((c) => c.mainImage)
          .filter((c) => !EXCLUDED_SLUGS.has(c.slug))
          .filter((c) => !c.date || c.date <= today)
          .filter(
            (c) =>
              c.category === 'design' ||
              (c.subcategory ?? []).some((s) => s === 'branding' || s === 'uiux' || s === 'print'),
          )
          .slice(0, 4);
        if (usable.length === 0) setFailed(true);
        else setItems(usable);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-deep-dark py-24 md:py-28">
      <WanderingGlow
        amplitude={12}
        background={
          'radial-gradient(40% 45% at 88% 4%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 62%),' +
          'radial-gradient(42% 48% at 6% 96%, color-mix(in srgb, var(--color-secondary) 24%, transparent), transparent 66%)'
        }
      />
      <Container className="relative z-10">
        <div
          className="max-w-4xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <FlipDotHeading
            text={CONTENT.proof.title}
            className="text-6xl font-extrabold tracking-tight text-balance text-white"
          />
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
            {CONTENT.proof.description}
          </p>
        </div>

        {failed && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
            <p className="text-white/75">
              Nie udało się załadować realizacji.{' '}
              <Link to="/portfolio" className="font-bold text-primary hover:underline">
                Przejdź do pełnego portfolio
              </Link>
              .
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div
            className="mt-12 grid grid-cols-1 items-start gap-6 sm:grid-cols-2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
          >
            {items.map((item, i) => {
              const tags = (item.subcategory ?? []).filter((s) => DESIGN_TAGS[s]).slice(0, 3);
              return (
                <Link
                  key={item._id}
                  to={`/portfolio/${item.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-primary/50"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={builder
                        .image(item.mainImage!)
                        .width(1100)
                        .fit('max')
                        .auto('format')
                        .url()}
                      alt={`Zrzut realizacji: ${item.title}`}
                      sizes="(min-width: 640px) 45vw, 100vw"
                      loading="lazy"
                      decoding="async"
                      className="w-full transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-deep-dark"
                      style={{ opacity: `calc((1 - var(--p, 1)) * 2.2 - ${i * 0.25})` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-6">
                    {tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xxs font-bold text-white/60"
                          >
                            {DESIGN_TAGS[t]}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary">
                      {item.title.trim()}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      Zobacz case study
                      <ArrowRight
                        size={15}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <p className="mt-10">
          <Link
            to={CONTENT.proof.linkTo}
            className="inline-flex items-center gap-2 font-bold text-primary underline-offset-4 hover:underline"
          >
            {CONTENT.proof.linkLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      </Container>
    </section>
  );
};

export default DesignProof;
