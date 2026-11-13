/**
 * Przełączniki funkcji (build-time, Vite). Domyślnie wszystko wyłączone.
 * Funkcja zamiast stałej: wartość czytana przy wywołaniu (testy podmieniają ją
 * przez vi.stubEnv), a w buildzie Vite i tak wstawia literał.
 */

/** Klauzula informacyjna RODO pod formularzami + pełna treść w polityce prywatności (MIX-844). */
export const isRodoKlauzulaEnabled = (): boolean => import.meta.env.VITE_RODO_KLAUZULA === '1';

/**
 * Baner zgód w prerenderowanym HTML (MIX-1579, LCP mobile). Baner rysował się dopiero po
 * starcie Reacta (ok. 4–5 s na telefonie w Lighthouse) i był elementem LCP na /, /audyt-360/
 * i /baza-wiedzy/. Włączony: prerender zapisuje baner i przycisk zgód w HTML, a skrypt
 * w <head> (index.html) chowa baner gościom z zapisaną zgodą jeszcze przed pierwszym
 * malowaniem. Wyłączony = dotychczasowe zachowanie.
 */
export const isCookieBannerStaticEnabled = (): boolean =>
  import.meta.env.VITE_MM_COOKIE_BANNER_STATIC === '1';

/**
 * Sekcje lokalne „Rzeszów” na stronach Google Ads i sklepów internetowych (MIX-1286, plan SEO A35).
 * Tekst czeka na akceptację Jakuba (docs/tresci/MIX-1286.md). Wyłączony = sekcji nie ma w DOM ani
 * w prerenderowanym HTML; Preview buduje się z `VITE_MM_RZESZOW_SEKCJE=1` (ci.yml).
 */
export const isRzeszowSectionsEnabled = (): boolean =>
  import.meta.env.VITE_MM_RZESZOW_SEKCJE === '1';
