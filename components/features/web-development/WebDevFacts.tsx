import React from 'react';
import { Ruler } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import webFacts from '../../../data/content/web-facts.json';

/**
 * „Ta strona jest naszym portfolio" — kotwica wiarygodności huba (kierunek
 * warsztat+wyspy, akt F po ocenie 2026-07-16). Pozycja W DRABINIE: po
 * Comparison (odpowiada na „czym różnicie się od taniej agencji"), przed FAQ.
 * Wyłącznie liczby MIERZONE, czytane z data/content/web-facts.json
 * (pipeline: scripts/fetch-web-facts.mjs); zero pomiarów per-user na ekranie.
 * Etykieta nazywa zakres uczciwie: pomiar dotyczy WSPÓLNEGO bundle'a
 * startowego serwisu, nie tej konkretnej podstrony.
 * Paski = wykorzystanie budżetu wymuszanego w CI (mało = dobrze); wypełniają
 * się z --p (dwukierunkowo; spoczynek/prerender/reduced = pełny stan).
 */
const WebDevFacts: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.75);
  if (!webFacts.budget) return null;
  const date = new Date(webFacts.generatedAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const rows = [
    {
      label: 'Skrypty startowe serwisu (wspólne dla każdej podstrony)',
      value: webFacts.budget.jsKB,
      limit: webFacts.budget.jsLimitKB,
    },
    {
      label: 'Style (CSS)',
      value: webFacts.budget.cssKB,
      limit: webFacts.budget.cssLimitKB,
    },
  ];

  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            Ta strona jest naszym portfolio.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            Nie obiecujemy szybkich stron — pokazujemy pomiar tej, na której właśnie jesteś. Liczby
            pochodzą z narzędzi, które blokują nam wydanie serwisu, gdy budżet pęknie.
          </p>
        </div>

        <dl
          className="mt-12 max-w-3xl space-y-10"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 44px), 0)' }}
        >
          {rows.map((row) => {
            const pct = Math.round(((row.value ?? 0) / (row.limit || 1)) * 100);
            return (
              <div key={row.label}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <dt className="text-[15px] font-bold text-dark">{row.label}</dt>
                  <dd className="text-3xl font-extrabold tracking-tight tabular-nums text-dark md:text-4xl">
                    {String(row.value).replace('.', ',')}&nbsp;kB
                    <span className="ml-3 text-base font-bold text-gray-500">
                      z {row.limit} kB budżetu
                    </span>
                  </dd>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"
                  role="img"
                  aria-label={`Wykorzystanie budżetu: ${pct} procent`}
                >
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{
                      width: `${pct}%`,
                      transform: 'scaleX(var(--p, 1))',
                      transformOrigin: 'left',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </dl>

        {/* Stempel pomiaru — mikroformat „metoda + data" (ten sam wzorzec co
            dowód CrUX przy realizacji flagowej): sceptyk uczy się reguły
            strony — tu każda liczba ma metrykę. */}
        <p className="mt-10 flex max-w-3xl items-start gap-2.5 text-sm leading-relaxed text-gray-500">
          <Ruler size={16} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
          <span>
            Pomiar: rozmiar po kompresji, sprawdzany automatycznie przy każdym wydaniu (size-limit).
            Stan na {date}. Dla porównania: jedno zdjęcie z telefonu waży zwykle kilkadziesiąt razy
            więcej.
          </span>
        </p>
      </Container>
    </section>
  );
};

export default WebDevFacts;
