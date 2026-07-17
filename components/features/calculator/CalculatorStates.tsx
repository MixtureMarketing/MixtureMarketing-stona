// Stany brzegowe kalkulatora: ładowanie pytań i błąd ładowania (po ludzku, bez technicznych kodów).
import React from 'react';

export const CalculatorLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
    <p className="text-sm">Ładuję kalkulator…</p>
  </div>
);

interface LoadErrorProps {
  onRetry: () => void;
}

export const CalculatorLoadError: React.FC<LoadErrorProps> = ({ onRetry }) => (
  <div className="text-center space-y-4 py-12">
    <p className="text-gray-300">
      Nie udało się załadować kalkulatora. To może być chwilowy problem z połączeniem.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="px-5 py-2.5 rounded-xl border border-white/20 text-gray-200 hover:border-white/40 transition"
    >
      Spróbuj ponownie
    </button>
  </div>
);
