import React, { createContext, useContext } from 'react';
import type { QuoteState } from './useQuoteState';
import type { EstimationLibrary } from './useEstimationLibrary';

// Współdzieli stan wyceny (useQuoteState) i bibliotekę do drzewa wizarda bez prop-drillingu.
interface QuoteContextValue {
  state: QuoteState;
  library: EstimationLibrary;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

export const QuoteProvider: React.FC<{
  state: QuoteState;
  library: EstimationLibrary;
  children: React.ReactNode;
}> = ({ state, library, children }) => (
  <QuoteContext.Provider value={{ state, library }}>{children}</QuoteContext.Provider>
);

export function useQuote(): QuoteContextValue {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote poza QuoteProvider');
  return ctx;
}
