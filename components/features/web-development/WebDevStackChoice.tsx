import React from 'react';
import { Link } from 'react-router-dom';
import { History, KeyRound, Layers, Wallet, X, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { BY_ID, DOT, FIELD, GROUPS, SHOP_LADDER, SITUATIONS, Choice } from './stackChoiceData';

/**
 * Sekcja „Nie mamy jednego młotka." — teza właściciela: pokazujemy, w czym umiemy,
 * a wybór zależy od projektu (złożoność, budżet, to, z czym klient już pracuje).
 * Treść i decyzje właściciela: `stackChoiceData.ts`.
 *
 * Budowa: tryptyk „jedna potrzeba, trzy odpowiedzi" (dowód tezy) → cztery karty
 * częstych sytuacji → tabliczka pełnego warsztatu (37 nazw; linki do bazy wiedzy
 * to realny ruch wewnętrzny). Chipy przy odpowiedziach pokazują wyłącznie
 * technologie nazwane w zdaniu obok — sekcja nie rysuje niczego, czego nie mówi.
 */

const CRITERIA: { Icon: LucideIcon; label: string }[] = [
  { Icon: Layers, label: 'Złożoność projektu' },
  { Icon: Wallet, label: 'Twój budżet' },
  { Icon: History, label: 'To, z czym już pracujesz' },
];

/** Chip technologii: kropka w kolorze marki + nazwa; z linkiem, gdy jest artykuł. */
const TechChip: React.FC<{ id: string }> = ({ id }) => {
  const t = BY_ID.get(id);
  if (!t) return null;
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: DOT[id] }}
      />
      {t.name}
    </>
  );
  const cls =
    'inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-bold';
  return t.href ? (
    <Link
      to={t.href}
      className={`${cls} text-accent-dark transition-colors hover:border-accent-dark`}
    >
      {inner}
    </Link>
  ) : (
    <span className={`${cls} text-dark`}>{inner}</span>
  );
};

const ChipList: React.FC<{ picks: string[]; className?: string }> = ({ picks, className }) => (
  <ul className={`flex flex-wrap gap-2 ${className ?? ''}`}>
    {picks.map((id) => (
      <li key={id}>
        <TechChip id={id} />
      </li>
    ))}
  </ul>
);

/** Karta sytuacji: pytanie klienta → odpowiedź tekstem → te same nazwy jako chipy. */
const SituationCard: React.FC<{ choice: Choice }> = ({ choice }) => (
  <article className="flex flex-col rounded-2xl border border-gray-100 bg-light-gray p-7 md:p-8">
    <h3 className="text-xl font-extrabold tracking-tight text-balance text-dark">
      {choice.situation}
    </h3>
    <p className="mt-3 text-[15px] leading-relaxed text-gray-700">{choice.answer}</p>
    <ChipList picks={choice.picks} className="mt-auto pt-6" />
    {choice.aside && (
      <p className="mt-6 border-t border-gray-200 pt-5 text-[15px] font-bold text-accent-dark">
        {choice.aside}
      </p>
    )}
  </article>
);

/** Pozycja tabliczki: nazwa z kropką; linki do bazy wiedzy w kolorze akcji. */
const PlateName: React.FC<{ id: string }> = ({ id }) => {
  const t = BY_ID.get(id);
  if (!t) return null;
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: DOT[id] }}
      />
      {t.name}
    </>
  );
  return t.href ? (
    <Link
      to={t.href}
      className="inline-flex items-center gap-1.5 text-[15px] font-bold text-accent-dark underline-offset-4 hover:underline"
    >
      {inner}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-dark">
      {inner}
    </span>
  );
};

const WebDevStackChoice: React.FC = () => {
  // Trzy niezależne progi wejścia: sekcja jest wysoka, więc jeden --p na jej górze
  // zostawiłby dolne bloki bez ruchu. Spoczynek = var(--p, 1) = pełna widoczność.
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  const gridRef = useSectionProgress<HTMLDivElement>(0.85);
  const plateRef = useSectionProgress<HTMLDivElement>(0.85);

  return (
    <section id="tech-stack" ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="xl:flex xl:items-start xl:justify-between xl:gap-16"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              Nie mamy jednego młotka.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              W czym zrobimy Twój projekt, zależy od trzech rzeczy: jak bardzo jest złożony, jaki
              masz budżet i z czym już pracujesz. Żadną z nich nie jest nasza wygoda.
            </p>
          </div>
          {/* Kryteria wyboru — na xl pionowa lista przy prawej krawędzi, żeby nagłówek
              nie zostawiał pustej połowy ekranu. Czwarty wiersz to pointa: przekreślona
              „nasza wygoda" (czytniki dostają prefiks, bo samo przekreślenie jest wizualne). */}
          <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-3 xl:mt-2 xl:shrink-0 xl:flex-col xl:gap-y-4 xl:border-l xl:border-gray-100 xl:pl-8">
            {CRITERIA.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm font-bold text-dark">
                <Icon size={18} className="shrink-0 text-secondary" aria-hidden="true" />
                {label}
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-sm font-bold text-gray-500">
              <X size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
              <span className="sr-only">nie decyduje: </span>
              <s>Nasza wygoda</s>
            </li>
          </ul>
        </div>

        {/* Tryptyk: JEDEN panel = jedna potrzeba; trzy przegrody = trzy odpowiedzi.
            Ruch: treść przegród dojeżdża z lekkim opóźnieniem od lewej — odpowiedzi
            układają się w kolejności rosnącej złożoności. Transform na wewnętrznym
            wrapperze, nie na przegrodzie: przesunięta przegroda rwałaby ramkę panelu. */}
        <div
          className="mt-14 md:mt-16"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 40px), 0)' }}
        >
          <h3 className="text-2xl font-extrabold tracking-tight text-balance text-dark">
            Ta sama potrzeba — trzy różne odpowiedzi.
          </h3>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-700">
            „Chcę sprzedawać w internecie” kończy się u nas na trzy różne sposoby — zależnie od
            skali i budżetu.
          </p>
          <div className="mt-7 grid grid-cols-1 divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-light-gray md:grid-cols-3 md:divide-x md:divide-y-0">
            {SHOP_LADDER.map((step, i) => (
              <div key={step.situation} className="p-7 md:p-8 lg:p-9">
                <div
                  className="flex h-full flex-col"
                  style={{
                    transform: `translate3d(0, calc((1 - var(--p, 1)) * ${24 + 16 * i}px), 0)`,
                  }}
                >
                  <p className="text-lg font-extrabold tracking-tight text-balance text-dark">
                    {step.situation}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-gray-700">{step.answer}</p>
                  <ChipList picks={step.picks} className="mt-auto pt-6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cztery pozostałe sytuacje — równorzędne, więc wjeżdżają równo. */}
        <div
          ref={gridRef}
          className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 40px), 0)' }}
        >
          {SITUATIONS.map((choice) => (
            <SituationCard key={choice.situation} choice={choice} />
          ))}
        </div>

        {/* Tabliczka warsztatu: pełny, potwierdzony zakres — 37 nazw w 6 wierszach.
            Stopka nazywa zasadę własności kodu (PRODUCT.md, decyzja właściciela
            2026-07-15) — odpowiedź na najczęstszą obawę persony: „czy będę uwiązany?". */}
        <div
          ref={plateRef}
          className="mt-14 md:mt-16"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-gray-100 px-7 py-6 md:px-9">
              <h3 className="text-xl font-extrabold tracking-tight text-dark">
                Czym się posługujemy
              </h3>
              <p className="text-sm font-bold text-gray-500">
                <span className="tabular-nums text-dark">{FIELD.length}</span> narzędzi ·{' '}
                <span className="tabular-nums text-dark">{GROUPS.length}</span> obszarów
              </p>
            </div>
            <dl className="divide-y divide-gray-100 px-7 md:px-9">
              {GROUPS.map((g) => (
                <div
                  key={g.label}
                  className="flex flex-col gap-2 py-5 md:flex-row md:items-baseline md:gap-8"
                >
                  <dt className="w-20 shrink-0 text-sm font-bold text-gray-500">{g.label}</dt>
                  <dd className="flex flex-wrap gap-x-6 gap-y-2">
                    {g.ids.map((id) => (
                      <PlateName key={id} id={id} />
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            {/* Granatowa pieczęć: najważniejsze zdanie sekcji dla persony („czy będę
                uwiązany?") dostaje najmocniejszą oprawę. */}
            <p className="flex items-start gap-3 rounded-b-3xl bg-dark px-7 py-5 text-[15px] font-bold text-white md:px-9">
              <KeyRound size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              Repozytorium kodu od pierwszego dnia i pełne prawa autorskie po odbiorze — przy każdym
              projekcie, niezależnie od technologii.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default WebDevStackChoice;
