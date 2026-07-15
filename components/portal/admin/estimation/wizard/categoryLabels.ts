import type { Category } from '@/lib/estimation/types';

// Etykiety kategorii obszarów (taksonomia stała A–G z docs 04, D10/D11) + pseudo-kategoria
// „items" agregatu (moduły/integracje). To nazwy strukturalne modelu, nie wartości domenowe
// (inwariant 2 dotyczy widełek/progów/godzin — te żyją w seedach). Współdzielone przez
// ValidationScreen i LivePreviewPanel, by nigdzie nie pokazywać surowych liter A–G.
export const CATEGORY_LABEL: Record<Category, string> = {
  A: 'A · Prezentacja',
  B: 'B · Logika / dane',
  C: 'C · Bezpieczeństwo',
  D: 'D · Infrastruktura',
  E: 'E · Operacje',
  F: 'F · Marketing / analityka',
  G: 'G · Realizacja projektu',
};

// Nazwa kategorii bez prefiksu litery (do zwartego breakdownu godzin).
export const categoryName = (cat: string): string => {
  if (cat === 'items') return 'Moduły / integracje';
  const label = CATEGORY_LABEL[cat as Category];
  return label ? label.replace(/^[A-G] · /, '') : cat;
};
