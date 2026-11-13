// Przełącznik wariantu B menu mobilnego (MIX-1411): „Oferta” otwiera drugi ekran ze strzałką
// „wstecz”. Działa jak `components/pages/abonament/PreonboardModal.tsx:54` i
// `components/features/calculator/livePrice.ts` (zmienna `VITE_MM_*` wstrzykiwana przy budowie):
// domyślnie WYŁĄCZONY; włącza go tylko `VITE_MM_MOBILE_MENU_B=1` albo `=true` w środowisku budowy.

/** Włączony tylko dla `1` albo `true`; brak, puste i każda inna wartość = stare menu. */
export function isMobileMenuBEnabled(
  raw: unknown = import.meta.env.VITE_MM_MOBILE_MENU_B,
): boolean {
  return raw === '1' || raw === 'true';
}
