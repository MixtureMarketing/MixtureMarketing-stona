import React from 'react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import FlipDotHeading from '../../visuals/flipdot/FlipDotHeading';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import webFacts from '../../../data/content/web-facts.json';

/**
 * PROTOTYP 2: halftone-wywołanie dowodu. Zrzut realizacji wjeżdża jako
 * raster z kropek brandu (asset build-time: scripts/generate-halftone.mjs)
 * i „wywołuje się" do ostrego wraz z --p. Spoczynek/prerender/reduced =
 * OSTRY zrzut (kontrakt var(--p,1)) — raster to wyłącznie przejście wejścia,
 * dowód nigdy nie zostaje zasłonięty.
 */
/**
 * Okno wywołania: raster trzyma pełną moc, aż figura wjedzie ~1/3 w kadr
 * (p=0.4), a ostry dowód domyka się przy ~3/4 widoczności (p=0.85) —
 * bez tego remapu przejście kończyło się, zanim ktokolwiek je zobaczył
 * (uwaga właściciela z odbioru 1. wersji). CSS sam przycina opacity do [0,1].
 */
const DEVELOP = (invert: boolean) =>
  invert ? 'calc(1 - (var(--p, 1) - 0.4) / 0.45)' : 'calc((var(--p, 1) - 0.4) / 0.45)';

const HalftoneProto: React.FC = () => {
  // Postęp mierzy FIGURA, nie sekcja: --p sekcji dobija do ~0.7 zanim figura
  // wejdzie w kadr i całe wywołanie działoby się poza ekranem.
  const figRef = useSectionProgress<HTMLElement>(0.9);
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
            style={{ opacity: DEVELOP(false) }}
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
            style={{ opacity: DEVELOP(true) }}
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
/**
 * PROTOTYP 3: sekcja uczciwych faktów — czyta WYŁĄCZNIE data/content/
 * web-facts.json (pipeline: scripts/fetch-web-facts.mjs). Każda liczba ma
 * metodę i datę pomiaru; zero metryk per-user i zero liczb z ręki.
 * Paski = wykorzystanie budżetu wymuszanego w CI (skala odwrócona:
 * mało = dobrze) — wypełnienie rośnie z --p (ruch podaje pomiar i gaśnie).
 */
const FactsProto: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.75);
  const date = new Date(webFacts.generatedAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const rows = webFacts.budget
    ? [
        {
          label: 'Skrypty strony głównej',
          value: webFacts.budget.jsKB,
          limit: webFacts.budget.jsLimitKB,
        },
        {
          label: 'Style (CSS)',
          value: webFacts.budget.cssKB,
          limit: webFacts.budget.cssLimitKB,
        },
      ]
    : [];
  return (
    <section ref={sectionRef} className="bg-light-gray py-24 md:py-32" data-proto="facts">
      <Container>
        <div className="max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            Ta strona jest naszym portfolio.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            Nie obiecujemy szybkich stron — pokazujemy pomiar tej, na której jesteś. Liczby pochodzą
            z narzędzi, które blokują nam wydanie strony, gdy budżet pęknie.
          </p>
        </div>

        <dl className="mt-12 max-w-3xl space-y-10">
          {rows.map((row) => {
            const pct = Math.round(((row.value ?? 0) / (row.limit || 1)) * 100);
            return (
              <div key={row.label}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6">
                  <dt className="text-[15px] font-bold text-dark">{row.label}</dt>
                  <dd className="text-3xl font-extrabold tracking-tight tabular-nums text-dark md:text-4xl">
                    {String(row.value).replace('.', ',')}&nbsp;kB
                    <span className="ml-3 text-base font-bold text-gray-500">
                      z {row.limit} kB budżetu
                    </span>
                  </dd>
                </div>
                {/* Pasek wykorzystania budżetu — mało = dobrze; wypełnia się z --p. */}
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"
                  role="img"
                  aria-label={`Wykorzystanie budżetu: ${pct} procent`}
                >
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{
                      width: `${pct}%`,
                      transform: 'scaleX(calc(var(--p, 1)))',
                      transformOrigin: 'left',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </dl>

        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-gray-500">
          Pomiar: rozmiar po kompresji, sprawdzany automatycznie przy każdym wydaniu (size-limit).
          Stan na {date}. Dla porównania: jedno zdjęcie z telefonu waży zwykle kilkadziesiąt razy
          więcej.
        </p>
      </Container>
    </section>
  );
};

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

    <FactsProto />

    {/* Wybieg pod ostatnią sekcją — pełny scroll-through dla hydratacji. */}
    <section className="min-h-[40vh] bg-white py-24">
      <Container>
        <p className="text-gray-500">Koniec laboratorium.</p>
      </Container>
    </section>
  </div>
);

export default ProtoLab;
