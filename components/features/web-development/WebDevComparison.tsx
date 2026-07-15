import React from 'react';
import { Check, X } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { WEB_DEV_CONTENT } from '../../../data/content';

/**
 * Sekcja porównawcza „szablon vs nasz standard".
 *
 * Redesign: wszystkie zmyślone pomiary wycięte w treści (patrz komentarz przy
 * WEB_DEV_CONTENT.comparison). Tutaj dwie zmiany w samym komponencie:
 *
 * 1. Znaczenie nie jest już niesione kolorem. Było: `line-through text-red-400`
 *    vs `text-emerald-400` — przy daltonizmie zostawało samo przekreślenie, a
 *    czytnik ekranu nie dostawał nic. Jest: nagłówki kolumn + ikona z etykietą
 *    tekstową w <th>, czyli sens działa bez koloru (WCAG 1.4.1).
 * 2. Sekcja jest jasna, nie ciemna. Poprzednio tabela siedziała w karcie
 *    `bg-[#0F172A]` — a to nie jest dowód, tylko argument. The Ciemnia Rule:
 *    granat jest oprawą dowodu, nie dekoracją.
 *
 * Semantyka: to realna tabela porównawcza, więc <table> z <th scope>, nie siatka
 * divów. Czytnik ekranu ogłasza wiersz i kolumnę — bez tego „Brak albo płatne"
 * jest zdaniem bez podmiotu.
 *
 * Ruch (The Motion Has A Job Rule): kolumny zjeżdżają się ku sobie z --p (lewa
 * z lewej, prawa z prawej) — porównanie dosłownie się składa. Spoczynek = var(--p, 1).
 */
const WebDevComparison: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  const { columns, data } = WEB_DEV_CONTENT.comparison;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white pt-12 pb-24 md:pt-14 md:pb-32"
    >
      <Container className="relative z-10">
        <div
          className="mx-auto max-w-2xl text-center"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {WEB_DEV_CONTENT.comparison.title}{' '}
            <span className="text-accent-dark">{WEB_DEV_CONTENT.comparison.titleAccent}</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            {WEB_DEV_CONTENT.comparison.description}
          </p>
        </div>

        <table className="mx-auto mt-14 w-full max-w-5xl border-collapse text-left md:mt-16">
          <caption className="sr-only">
            Porównanie: {columns.bad} kontra {columns.good}
          </caption>
          <thead>
            <tr className="border-b border-gray-200">
              {/* UWAGA: bez sr-only na tym <th>. sr-only to position:absolute, więc
                  komórka wypada z układu tabeli — nagłówek miałby 2 kolumny przy
                  3-kolumnowych wierszach i kolumna opisu zapadała się do ~100px.
                  Chowamy sam tekst, komórka zostaje w siatce. */}
              <th scope="col" className="hidden md:table-cell md:w-[26%]">
                <span className="sr-only">Obszar</span>
              </th>
              <th
                scope="col"
                className="pb-4 align-bottom md:w-[37%]"
                style={{ transform: 'translate3d(calc((1 - var(--p, 1)) * -20px), 0, 0)' }}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <X size={16} strokeWidth={3} aria-hidden="true" />
                  {columns.bad}
                </span>
              </th>
              <th
                scope="col"
                className="pb-4 align-bottom md:w-[37%]"
                style={{ transform: 'translate3d(calc((1 - var(--p, 1)) * 20px), 0, 0)' }}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-dark">
                  <Check size={16} strokeWidth={3} className="text-success" aria-hidden="true" />
                  {columns.good}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.label} className="border-b border-gray-100 align-top">
                <th scope="row" className="hidden py-6 pr-8 md:table-cell">
                  <span className="block font-bold text-dark">{row.label}</span>
                  <span className="mt-1 block text-sm font-normal text-gray-600">{row.desc}</span>
                </th>
                <td
                  className="py-6 pr-6 text-gray-500"
                  style={{ transform: 'translate3d(calc((1 - var(--p, 1)) * -20px), 0, 0)' }}
                >
                  {/* Etykieta kolumny powtórzona dla mobile, gdzie <th scope="row"> jest ukryty */}
                  <span className="mb-2 block text-xs font-bold text-gray-500 md:hidden">
                    {row.label}
                  </span>
                  {row.bad}
                </td>
                <td
                  className="py-6 font-medium text-dark"
                  style={{ transform: 'translate3d(calc((1 - var(--p, 1)) * 20px), 0, 0)' }}
                >
                  {row.good}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </section>
  );
};

export default WebDevComparison;
