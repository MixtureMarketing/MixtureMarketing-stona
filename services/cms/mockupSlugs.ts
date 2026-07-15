/**
 * Case studies, których `mainImage` w Sanity to MAKIETA Z FIGMY z tekstem
 * zastępczym „Lorem ipsum", a nie zrzut wdrożonej strony (zweryfikowane wizualnie
 * 2026-07-15 — oglądaniem plików, bo tekstu wypalonego w PNG nie wykryje żaden
 * test na `innerText`).
 *
 * Dlaczego to wspólna lista, a nie lokalna stała w jednej sekcji: makieta wyciekała
 * przez DRUGIE wejście. Wykluczyłem ją z sekcji „Realizacje", a ta sama grafika
 * wróciła 3000 px niżej przez `RelatedArticles` na tej samej stronie. Każda
 * powierzchnia pokazująca `caseStudy.mainImage` musi filtrować przez tę listę.
 *
 * PRODUCT.md: „Dowód bije dekorację. Zero placeholderów tam, gdzie ma być praca."
 * Lorem ipsum w sekcji obiecującej prawdziwą robotę to atrapa — dokładnie ta,
 * od której odcina się marka.
 *
 * TO NIE JEST DOCELOWY FIX. Właściwa naprawa: podmiana `mainImage` w Sanity na
 * prawdziwy zrzut wdrożenia. Wtedy skreśl slug stąd i realizacja wraca wszędzie.
 * Kodem tego nie wykryjesz — wymaga oka.
 */
export const MOCKUP_SLUGS: ReadonlySet<string> = new Set([
  'impackt-edu',
  'driftmark-marine-e-commerce-z-konfiguratorem-lodzi-i-rebranding',
]);

/** Czy dana realizacja ma nadający się do ekspozycji zrzut (nie makietę). */
export const hasRealScreenshot = (slug?: string): boolean => !!slug && !MOCKUP_SLUGS.has(slug);
