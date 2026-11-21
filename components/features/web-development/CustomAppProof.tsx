import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { urlFor } from '../../../services/cms/client';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';
import { isCustomAppPsychonEnabled } from '../../../config/flags';

/**
 * Dowód: KorepetytorAI (StudentPI) — prawdziwy SaaS z portfolio, obrazy
 * zweryfikowane oczami i przypięte po `_ref` (hash treści), URL-e CDN budowane
 * synchronicznie — bez fetcha, więc prawa strona nigdy nie stoi pusta
 * (lekcja z WebDevWpCustom). Sekcja CIEMNA — The Ciemnia Rule.
 *
 * MIX-1975: przy VITE_MM_CUSTOMAPP_PSYCHON=1 (config/flags.ts) sekcja pokazuje PsychON
 * (`CONTENT.proofPsychon`): lokalne zrzuty z public/ z width/height (bez skoku układu) i link
 * do /portfolio/. Wyłączony przełącznik = dotychczasowa sekcja KorepetytorAI bez zmian.
 */

const hideBrokenFigure: React.ReactEventHandler<HTMLImageElement> = (e) => {
  e.currentTarget.closest('figure')?.style.setProperty('display', 'none');
};

const CustomAppProof: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  const psychon = isCustomAppPsychonEnabled();
  const proof = psychon ? CONTENT.proofPsychon : CONTENT.proof;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-deep-dark py-24 md:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 46% at 10% 12%, color-mix(in srgb, var(--color-secondary) 20%, transparent), transparent 64%),' +
            'radial-gradient(38% 44% at 92% 88%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 66%)',
        }}
        aria-hidden="true"
      />
      <Container className="relative z-10">
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-white md:text-4xl">
            {proof.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/75">{proof.description}</p>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:gap-12"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 56px), 0)' }}
        >
          {psychon &&
            CONTENT.proofPsychon.figures.map((fig) => (
              <figure key={fig.src}>
                <Link
                  to={proof.linkTo}
                  className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
                >
                  <img
                    src={fig.src}
                    alt={fig.alt}
                    width={fig.width}
                    height={fig.height}
                    loading="lazy"
                    decoding="async"
                    onError={hideBrokenFigure}
                    className="h-auto w-full"
                  />
                </Link>
                <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
                  {fig.caption}
                </figcaption>
              </figure>
            ))}
          {!psychon &&
            CONTENT.proof.figures.map((fig) => {
              let img = urlFor(fig.ref);
              if ('rect' in fig && fig.rect) {
                img = img.rect(fig.rect.x, fig.rect.y, fig.rect.w, fig.rect.h);
              }
              return (
                <figure key={fig.ref}>
                  <Link
                    to={proof.linkTo}
                    className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
                  >
                    <img
                      src={img.width(1200).fit('max').url()}
                      alt={fig.alt}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      loading="lazy"
                      decoding="async"
                      onError={hideBrokenFigure}
                      className="w-full"
                    />
                  </Link>
                  <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
                    {fig.caption}
                  </figcaption>
                </figure>
              );
            })}
        </div>

        <p className="mt-10">
          <Link
            to={proof.linkTo}
            className="inline-flex items-center gap-2 font-bold text-primary underline-offset-4 hover:underline"
          >
            {proof.linkLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      </Container>
    </section>
  );
};

export default CustomAppProof;
