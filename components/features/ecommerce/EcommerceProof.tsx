import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';

/**
 * Dowód: ŻYWY sklep klienta (Driftmark Marine) — zrzuty z produkcji 2026-07-15,
 * statyczne assety w public/. Celowo NIE z galerii CMS: tamta zawiera makiety
 * z Lorem ipsum i zmyślonymi liczbami („1200 satisfied customers"), które
 * wprowadziłyby na stronę sfabrykowane metryki. Sekcja CIEMNA — The Ciemnia
 * Rule: granat istnieje po to, żeby realizacja świeciła.
 */
const EcommerceProof: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-deep-dark py-24 md:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 46% at 12% 10%, color-mix(in srgb, var(--color-secondary) 20%, transparent), transparent 64%),' +
            'radial-gradient(38% 44% at 90% 90%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 66%)',
        }}
        aria-hidden="true"
      />
      <Container className="relative z-10">
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-white md:text-4xl">
            {CONTENT.proof.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/75">{CONTENT.proof.description}</p>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:gap-12"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 56px), 0)' }}
        >
          {CONTENT.proof.images.map((img) => (
            <figure key={img.src}>
              <Link
                to={CONTENT.proof.linkTo}
                className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  width={1440}
                  height={880}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  loading="lazy"
                  decoding="async"
                  className="w-full"
                />
              </Link>
              <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>

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

export default EcommerceProof;
