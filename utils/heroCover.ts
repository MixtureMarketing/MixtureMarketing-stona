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

export function setHeroCovered(host: ParentNode, covered: boolean): void {
  host.querySelectorAll('[data-hero-covers]').forEach((region) => {
    region.querySelectorAll(HERO_FOCUSABLE).forEach((el) => el.toggleAttribute('inert', covered));
  });
}
