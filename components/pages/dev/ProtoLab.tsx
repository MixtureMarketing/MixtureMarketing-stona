import React from 'react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import FlipDotHeading from '../../visuals/flipdot/FlipDotHeading';
import { useSectionProgress } from '../../../hooks/useSectionProgress';

/**
 * PROTOTYP 2: halftone-wywołanie dowodu. Zrzut realizacji wjeżdża jako
 * raster z kropek brandu (asset build-time: scripts/generate-halftone.mjs)
 * i „wywołuje się" do ostrego wraz z --p. Spoczynek/prerender/reduced =
 * OSTRY zrzut (kontrakt var(--p,1)) — raster to wyłącznie przejście wejścia,
 * dowód nigdy nie zostaje zasłonięty.
 */
const HalftoneProto: React.FC = () => {
  // Postęp mierzy FIGURA, nie sekcja: --p sekcji dobija do ~0.7 zanim figura
  // wejdzie w kadr i całe wywołanie działoby się poza ekranem.
  const figRef = useSectionProgress<HTMLElement>(0.6);
  return (
    <section className="bg-deep-dark py-24 md:py-32" data-proto="halftone">
      <Container>
        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Halftone-wywołanie dowodu
        </h2>
        <figure
          ref={figRef}
          className="relative mt-10 overflow-hidden rounded-2xl border border-white/10"
        >
          {/* Cross-dissolve: ostry dowód WJEŻDŻA z --p, raster gaśnie — nigdy
              nie leżą na sobie oba w pełni (raster z tłem przyciemniałby zrzut). */}
          <img
            src="/assets/images/realizacje/driftmark-sklep-home.webp"
            alt="Strona główna sklepu Driftmark Marine — zrzut z produkcji"
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
            className="w-full"
            style={{ opacity: 'var(--p, 1)' }}
          />
          <img
            src="/assets/images/realizacje/driftmark-sklep-home-halftone.webp"
            alt=""
            aria-hidden="true"
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: 'calc(1 - var(--p, 1))' }}
          />
          <figcaption className="sr-only">
            Raster kropek wywołuje się do ostrego zrzutu przy przewijaniu.
          </figcaption>
        </figure>
      </Container>
    </section>
  );
};

/**
 * LABORATORIUM PROTOTYPÓW kierunku „warsztat + wyspy kropek" (2026-07-16).
 * Strona deweloperska: noindex, CELOWO poza routes.js (bez prerenderu
 * i sitemapy). Tu mieszkają prototypy mechanizmów PRZED wdrożeniem na
 * właściwe strony — każdy w warunkach zbliżonych do docelowych (ciemny pas,
 * realne rozmiary typografii). Usunąć lub wyłączyć przed merge do main.
 */
const ProtoLab: React.FC = () => (
  <div className="bg-white font-sans">
    <Seo
      title="Proto Lab — Mixture"
      description="Wewnętrzne laboratorium prototypów wizualnych."
      noindex
    />

    {/* Rozbieg — wymusza scroll przed pasem flip-dot (test wejścia w viewport). */}
    <section className="flex min-h-[60vh] items-end bg-light-gray pb-16">
      <Container>
        <p className="max-w-2xl text-lg text-gray-700">
          Laboratorium prototypów. Przewiń w dół: pas flip-dot odgrywa kaskadę przy wejściu w
          viewport. Klik w tablicę = powtórka (tylko w labie).
        </p>
      </Container>
    </section>

    {/* PROTOTYP 1: flip-dot — ciemny pas jak przyszła sekcja dowodowa. */}
    <section className="bg-deep-dark py-24 md:py-32" data-proto="flipdot">
      <Container>
        {/* Skala display obowiązkowa: poniżej ~60px stopnia pisma matryca 5×7
            schodzi pod 4px/tarczę i silnik odmawia budowy tablicy (zostaje HTML). */}
        <FlipDotHeading
          text="Dowód, nie obietnica."
          className="text-6xl font-extrabold tracking-tight text-white md:text-7xl"
          replayOnClick
        />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
          Nagłówek składa się jak na elektromechanicznej tablicy flip-dot — kaskada tarcz biegnie
          ukosem, pojedyncze krążki przeskakują z mechanicznym rozrzutem. Pod spodem stoi prawdziwy
          nagłówek HTML.
        </p>
      </Container>
    </section>

    {/* Rozdzielnik — halftone musi wjechać zza krawędzi, nie startować w kadrze. */}
    <section className="min-h-[40vh] bg-white py-24">
      <Container>
        <p className="text-gray-500">Niżej: prototyp 2 (halftone-wywołanie dowodu).</p>
      </Container>
    </section>

    <HalftoneProto />

    {/* Wybieg — przestrzeń pod prototyp 3 (fakty). */}
    <section className="min-h-[50vh] bg-white py-24">
      <Container>
        <p className="text-gray-500">Slot: fakty (prototyp 3).</p>
      </Container>
    </section>
  </div>
);

export default ProtoLab;
