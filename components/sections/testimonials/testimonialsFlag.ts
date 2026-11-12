// Przełącznik sekcji opinii klientów (MIX-1326): ten sam mechanizm co wariant B menu mobilnego
// (components/layout/mobileMenuFlag.ts, MIX-1411): zmienna `VITE_MM_*` wstrzykiwana przy budowie,
// domyślnie WYŁĄCZONY; włącza go tylko `VITE_MM_TESTIMONIALS=1` albo `=true`.

/** Włączony tylko dla `1` albo `true`; brak, puste i każda inna wartość = sekcji nie ma w DOM. */
export function isTestimonialsEnabled(
  raw: unknown = import.meta.env.VITE_MM_TESTIMONIALS,
): boolean {
  return raw === '1' || raw === 'true';
}
