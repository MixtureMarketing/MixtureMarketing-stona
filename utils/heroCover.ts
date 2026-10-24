/**
 * Elementy fokusowalne w treści hero, które przy pełnym zakryciu arkuszem dostają `inert`.
 *
 * Inertujemy WYŁĄCZNIE elementy interaktywne, nie całe kontenery `[data-hero-covers]`:
 * `inert` na kontenerze wycinał z drzewa dostępności także `<h1>` i opis strony —
 * czytnik ekranu (i axe) widział stronę bez nagłówka pierwszego poziomu, gdy tylko
 * użytkownik przewinął pod arkusz. Cel (WCAG 2.4.11 — fokus nie ląduje pod
 * nieprzezroczystym arkuszem) wymaga zablokowania tylko tego, co przyjmuje fokus.
 */
export const HERO_FOCUSABLE =
  'a[href], button, input, select, textarea, summary, iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * Warunek przypięcia hero — MUSI być identyczny z `@media` dla `.hero-pin` w index.css.
 * Poza nim (telefony, tablety, niskie okna) hero scrolluje klasycznie, więc `--cover`
 * musi zostać 0: wcześniej wygaszanie liczono zawsze i na telefonie pas „Wybrane
 * realizacje" (/web-development/) znikał, zanim w ogóle wjechał w kadr.
 */
export const HERO_TAKEOVER_MEDIA =
  '(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 760px)';

/** Pokrycie hero (0..1) przy krawędzi arkusza na `sheetTop`; 0, gdy hero nie jest przypięty. */
export function heroCoverAt(sheetTop: number, viewportHeight: number): number {
  const pinned =
    typeof window.matchMedia !== 'function' || window.matchMedia(HERO_TAKEOVER_MEDIA).matches;
  if (!pinned) return 0;
  return Math.min(1, Math.max(0, (viewportHeight - sheetTop) / viewportHeight));
}

export function setHeroCovered(host: ParentNode, covered: boolean): void {
  host.querySelectorAll('[data-hero-covers]').forEach((region) => {
    region.querySelectorAll(HERO_FOCUSABLE).forEach((el) => el.toggleAttribute('inert', covered));
  });
}
