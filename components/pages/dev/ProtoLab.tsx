import React from 'react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import FlipDotHeading from '../../visuals/flipdot/FlipDotHeading';

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

    {/* Wybieg — przestrzeń pod kolejne prototypy (halftone, fakty). */}
    <section className="min-h-[50vh] bg-white py-24">
      <Container>
        <p className="text-gray-500">Slot: halftone-dowód (prototyp 2) · fakty (prototyp 3).</p>
      </Container>
    </section>
  </div>
);

export default ProtoLab;
