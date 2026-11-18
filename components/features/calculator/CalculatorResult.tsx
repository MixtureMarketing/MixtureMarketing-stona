// Wynik kalkulatora — WYŁĄCZNIE widełki + uczciwy komunikat + CTA (kontrakt: zero godzin/wewn.).
// Ton DESIGN.md: „bez atrap i wymyślonych liczb" — mówimy wprost, że to orientacja, nie oferta.
// MIX-1867: `newUi` = ekran spójny z paskiem ceny (ta sama etykieta „Twój projekt”, ten sam zapis
// kwot), CTA-pigułka indygo, fokus na nagłówku wyniku po pojawieniu się ekranu (klawiatura,
// czytnik ekranu). Bez `newUi` wygląd jak przed MIX-1867.
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { PriceRange } from '../../../services/calculatorService';
import { calcUi } from './calcUi';
import { handoffState, type CalculatorHandoff } from './calculatorHandoff';
import { useHideCookieOver } from './useHideCookieOver';

const pln = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

interface CalculatorResultProps {
  priceRange: PriceRange;
  onReset: () => void;
  newUi?: boolean;
  /** Oś czasu nowego klienta (MIX-1816); brak = ekran bez zmian. */
  timeline?: React.ReactNode;
  /** MIX-1814 (Z9): harmonogram rozmów pod wynikiem; brak = ekran wyniku jak dotąd. */
  booking?: React.ReactNode;
  /**
   * MIX-1815 (VITE_MM_RESULT_CONTACT): konfiguracja dla /contact/. Podana = ekran wyniku z treściami
   * P4, przyciskami ≥ 44 px i „Umów rozmowę” z konfiguracją; brak = ekran jak dziś.
   */
  handoff?: CalculatorHandoff | null;
}

// min-h-11 = 44 px: cel dotyku (próg firmy, WCAG 2.5.5), jak przyciski opcji i linku.
const BTN = 'inline-flex min-h-11 items-center justify-center px-6 py-3 rounded-xl transition';
const OLD_PRIMARY = `${BTN} bg-primary text-dark font-semibold hover:brightness-110`;
const OLD_SECONDARY = `${BTN} border border-white/20 text-gray-200 hover:border-white/40`;

/**
 * MIX-1815 r3: ekran wyniku z przejściem do kontaktu w obu wyglądach. Stary wygląd = ekran r2
 * (min-h-11); nowy wygląd (MIX-1867/MIX-1937) = pigułka indygo z SVG-strzałką (min-h-12 = 48 px),
 * tekst na granacie ≥ text-white/75, fokus na nagłówku. Harmonogram i oś czasu pod przyciskami.
 */
const ResultWithContact: React.FC<
  Omit<CalculatorResultProps, 'handoff'> & { handoff: CalculatorHandoff }
> = ({ priceRange, onReset, handoff, newUi, timeline, booking }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  // Przycisk ciasteczek (fixed) nie może zasłaniać przycisków wyniku na telefonie (MIX-1799).
  useHideCookieOver(boxRef, true, 'resultCookie');
  useEffect(() => {
    if (newUi) headRef.current?.focus();
  }, [newUi]);
  const ui = calcUi(true);
  const range = (
    <>
      {pln(priceRange.min)}&nbsp;–&nbsp;{pln(priceRange.max)}&nbsp;zł netto
    </>
  );
  return (
    <div
      className={newUi ? 'space-y-6 md:space-y-8 text-center' : 'text-center space-y-6'}
      data-testid="calc-result"
    >
      {newUi ? (
        <h2
          ref={headRef}
          tabIndex={-1}
          className="text-3xl font-extrabold tracking-tight text-white focus:outline-none md:text-5xl"
        >
          Twój projekt: {range}
        </h2>
      ) : (
        <h2 className="text-3xl md:text-5xl font-extrabold text-white">Twój projekt: {range}</h2>
      )}
      <p
        className={`mx-auto max-w-md ${newUi ? 'leading-relaxed text-white/75' : 'text-gray-300'}`}
      >
        To orientacja z naszego modelu wyceny, nie oferta. Dokładną cenę podamy po 20-minutowej
        rozmowie.
      </p>
      <div
        ref={boxRef}
        data-testid="calc-result-actions"
        className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
      >
        <Link
          to="/contact/"
          state={handoffState(handoff)}
          className={newUi ? ui.btnPrimary : OLD_PRIMARY}
        >
          Umów rozmowę
          {newUi && <ArrowRight size={18} aria-hidden="true" />}
        </Link>
        <button
          type="button"
          onClick={onReset}
          className={newUi ? ui.btnSecondary : OLD_SECONDARY}
        >
          Policz jeszcze raz
        </button>
      </div>
      <p className={`mx-auto max-w-md text-sm ${newUi ? 'text-white/75' : 'text-gray-400'}`}>
        Twoje odpowiedzi i widełki przeniesiemy do formularza kontaktu.
      </p>
      {booking}
      {timeline}
    </div>
  );
};

const NewResult: React.FC<Omit<CalculatorResultProps, 'newUi'>> = ({
  priceRange,
  onReset,
  timeline,
  booking,
}) => {
  const ui = calcUi(true);
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headRef.current?.focus();
  }, []);
  return (
    <div data-testid="calc-result" className="space-y-6 md:space-y-8">
      <div className="space-y-4 py-2 text-center">
        <h2
          ref={headRef}
          tabIndex={-1}
          className="text-base font-extrabold text-primary focus:outline-none"
        >
          Twój projekt: orientacyjne widełki
        </h2>
        <p className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          {pln(priceRange.min)}&nbsp;–&nbsp;{pln(priceRange.max)}&nbsp;zł
        </p>
        <p className="text-sm text-white/75">Przedział na podstawie Twoich odpowiedzi</p>
      </div>
      <p className="mx-auto max-w-md text-center leading-relaxed text-white/75">
        To zgrubny przedział — <strong className="text-white">nie wiążąca oferta</strong>. Dokładną
        wycenę przygotujemy po krótkiej rozmowie o szczegółach projektu.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/contact/" className={ui.btnPrimary}>
          Umów rozmowę
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <button type="button" onClick={onReset} className={ui.btnSecondary}>
          Policz jeszcze raz
        </button>
      </div>
      {booking}
      {timeline}
    </div>
  );
};

const CalculatorResult: React.FC<CalculatorResultProps> = ({
  priceRange,
  onReset,
  newUi,
  timeline,
  booking,
  handoff,
}) => {
  if (handoff)
    return (
      <ResultWithContact
        priceRange={priceRange}
        onReset={onReset}
        handoff={handoff}
        newUi={newUi}
        timeline={timeline}
        booking={booking}
      />
    );
  if (newUi)
    return (
      <NewResult priceRange={priceRange} onReset={onReset} timeline={timeline} booking={booking} />
    );
  return (
    <div className="text-center space-y-6">
      <p className="text-sm uppercase tracking-wider text-primary/80">Orientacyjne widełki</p>
      <p className="text-4xl md:text-5xl font-extrabold text-white">
        {pln(priceRange.min)}&nbsp;–&nbsp;{pln(priceRange.max)}&nbsp;zł
      </p>
      <p className="mx-auto max-w-md text-gray-300">
        To zgrubny przedział na podstawie Twoich odpowiedzi — <strong>nie wiążąca oferta</strong>.
        Dokładną wycenę przygotujemy po krótkiej rozmowie o szczegółach projektu.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          to="/contact/"
          className="px-6 py-3 rounded-xl bg-primary text-dark font-semibold hover:brightness-110 transition"
        >
          Umów rozmowę
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-3 rounded-xl border border-white/20 text-gray-200 hover:border-white/40 transition"
        >
          Policz jeszcze raz
        </button>
      </div>
      {booking}
      {timeline}
    </div>
  );
};

export default CalculatorResult;
