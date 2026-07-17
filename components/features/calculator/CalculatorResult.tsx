// Wynik kalkulatora — WYŁĄCZNIE widełki + uczciwy komunikat + CTA (kontrakt: zero godzin/wewn.).
// Ton DESIGN.md: „bez atrap i wymyślonych liczb" — mówimy wprost, że to orientacja, nie oferta.
import React from 'react';
import { Link } from 'react-router-dom';
import type { PriceRange } from '../../../services/calculatorService';

const pln = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

interface CalculatorResultProps {
  priceRange: PriceRange;
  onReset: () => void;
}

const CalculatorResult: React.FC<CalculatorResultProps> = ({ priceRange, onReset }) => (
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
        to="/contact"
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
