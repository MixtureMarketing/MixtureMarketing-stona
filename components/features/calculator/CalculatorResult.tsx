// Wynik kalkulatora — WYŁĄCZNIE widełki + uczciwy komunikat + CTA (kontrakt: zero godzin/wewn.).
// Ton DESIGN.md: „bez atrap i wymyślonych liczb" — mówimy wprost, że to orientacja, nie oferta.
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { PriceRange } from '../../../services/calculatorService';
import { handoffState, type CalculatorHandoff } from './calculatorHandoff';
import { useHideCookieOver } from './useHideCookieOver';

const pln = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

interface CalculatorResultProps {
  priceRange: PriceRange;
  onReset: () => void;
  /**
   * MIX-1815 (VITE_MM_RESULT_CONTACT): konfiguracja dla /contact/. Podana = ekran wyniku z treściami
   * P4, przyciskami ≥ 44 px i „Umów rozmowę” z konfiguracją; brak = ekran jak dziś.
   */
  handoff?: CalculatorHandoff | null;
}

// min-h-11 = 44 px: cel dotyku (próg firmy, WCAG 2.5.5), jak przyciski opcji i linku.
const BTN = 'inline-flex min-h-11 items-center justify-center px-6 py-3 rounded-xl transition';

const ResultWithContact: React.FC<{
  priceRange: PriceRange;
  onReset: () => void;
  handoff: CalculatorHandoff;
}> = ({ priceRange, onReset, handoff }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  // Przycisk ciasteczek (fixed) nie może zasłaniać przycisków wyniku na telefonie (MIX-1799).
  useHideCookieOver(boxRef, true, 'resultCookie');
  return (
    <div className="text-center space-y-6" data-testid="calc-result">
      <h2 className="text-3xl md:text-5xl font-extrabold text-white">
        Twój projekt: {pln(priceRange.min)}&nbsp;–&nbsp;{pln(priceRange.max)}&nbsp;zł netto
      </h2>
      <p className="mx-auto max-w-md text-gray-300">
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
          className={`${BTN} bg-primary text-dark font-semibold hover:brightness-110`}
        >
          Umów rozmowę
        </Link>
        <button
          type="button"
          onClick={onReset}
          className={`${BTN} border border-white/20 text-gray-200 hover:border-white/40`}
        >
          Policz jeszcze raz
        </button>
      </div>
      <p className="mx-auto max-w-md text-sm text-gray-400">
        Twoje odpowiedzi i widełki przeniesiemy do formularza kontaktu.
      </p>
    </div>
  );
};

const CalculatorResult: React.FC<CalculatorResultProps> = ({ priceRange, onReset, handoff }) =>
  handoff ? (
    <ResultWithContact priceRange={priceRange} onReset={onReset} handoff={handoff} />
  ) : (
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
    </div>
  );

export default CalculatorResult;
