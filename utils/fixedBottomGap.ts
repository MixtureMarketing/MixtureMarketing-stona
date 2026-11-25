/**
 * MIX-2079: o ile pikseli dolna krawędź warstwy `position: fixed` (miejsce, gdzie przeglądarka
 * stawia `bottom: 0`) wisi NAD dolną krawędzią widocznej części strony (visualViewport).
 *
 * Safari na iOS po schowaniu klawiatury (wpisanie adresu, powrót z innej aplikacji) potrafi
 * zostawić warstwę `fixed` liczoną od starej, krótszej wysokości widoku: pasek „Darmowy audyt”
 * i przycisk zgód stoją wtedy w ~60 % ekranu (zgłoszenie z iPhone 24.11). Wynik > 0 = o tyle
 * pasek trzeba zsunąć w dół. Zwykły przypadek (luka ≤ tolerancji) i powiększenie palcami
 * (scale ≠ 1, tam visualViewport celowo nie pokrywa się z warstwą) dają 0 = bez zmian.
 * Nigdy nie przesuwa w górę (klawiatura otwarta: pasek nie ma wjeżdżać nad klawiaturę).
 */
export interface FixedBottomGapInput {
  /** getBoundingClientRect().top sondy `fixed bottom-0 h-0` (dolna krawędź warstwy fixed). */
  layerBottom: number;
  /** visualViewport.height (px CSS). */
  viewportHeight: number;
  /** visualViewport.offsetTop (px CSS). */
  viewportOffsetTop: number;
  /** visualViewport.scale. */
  scale: number;
}

/** Tolerancja w px: drobne różnice zaokrągleń nie ruszają paska. */
export const FIXED_BOTTOM_GAP_TOLERANCE = 2;
/** Dopuszczalne odchylenie skali od 1 (powiększenie palcami = brak korekty). */
export const FIXED_BOTTOM_GAP_SCALE_EPS = 0.01;

export function fixedBottomGap({
  layerBottom,
  viewportHeight,
  viewportOffsetTop,
  scale,
}: FixedBottomGapInput): number {
  if (![layerBottom, viewportHeight, viewportOffsetTop, scale].every(Number.isFinite)) return 0;
  if (Math.abs(scale - 1) > FIXED_BOTTOM_GAP_SCALE_EPS) return 0;
  if (viewportHeight <= 0) return 0;
  const gap = viewportOffsetTop + viewportHeight - layerBottom;
  if (gap <= FIXED_BOTTOM_GAP_TOLERANCE) return 0;
  // Sonda poza widokiem albo absurdalna luka (≥ cały widok) = pomiar niewiarygodny, bez korekty.
  if (layerBottom <= 0 || gap >= viewportHeight) return 0;
  return Math.round(gap);
}
