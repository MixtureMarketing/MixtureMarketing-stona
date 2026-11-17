// Stany brzegowe kalkulatora: ładowanie pytań i błąd ładowania (po ludzku, bez technicznych kodów).
// MIX-1867: `newUi` = szkielet w kształcie pierwszego kroku (pasek postępu, nagłówek, karta opcji),
// żeby po załadowaniu pytań treść nie skakała (CLS), i błąd w karcie z przyciskiem-pigułką.
import React from 'react';
import { calcUi } from './calcUi';

export const CalculatorLoading: React.FC<{ newUi?: boolean }> = ({ newUi = false }) => {
  if (!newUi) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
        <p className="text-sm">Ładuję kalkulator…</p>
      </div>
    );
  }
  const bar = 'rounded-full bg-white/10 motion-safe:animate-pulse';
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="calc-loading"
      className="space-y-6 md:space-y-8"
    >
      <div className="space-y-3">
        <p className="text-sm text-white/75">Ładuję kalkulator…</p>
        <div className={`h-2 w-full ${bar}`} />
      </div>
      <div aria-hidden="true" className="space-y-4">
        <div className={`h-8 w-48 ${bar}`} />
        <div className="space-y-4">
          <div className={`h-5 w-2/3 ${bar}`} />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-2xl bg-white/[0.06] motion-safe:animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="flex justify-end border-t border-white/10 pt-6">
        <div className={`h-12 w-32 ${bar}`} />
      </div>
    </div>
  );
};

interface LoadErrorProps {
  onRetry: () => void;
  newUi?: boolean;
}

export const CalculatorLoadError: React.FC<LoadErrorProps> = ({ onRetry, newUi = false }) => {
  if (!newUi) {
    return (
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
  }
  return (
    <div role="alert" data-testid="calc-load-error" className="space-y-5 py-8 text-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-white">
        Nie udało się załadować kalkulatora
      </h2>
      <p className="mx-auto max-w-md leading-relaxed text-white/75">
        To może być chwilowy problem z połączeniem. Spróbuj ponownie za chwilę.
      </p>
      <button type="button" onClick={onRetry} className={calcUi(true).btnPrimary}>
        Spróbuj ponownie
      </button>
    </div>
  );
};
