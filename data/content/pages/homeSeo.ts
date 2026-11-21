/**
 * MIX-1269 (plan SEO A12): strona główna pod frazę „agencja marketingowa Rzeszów”.
 * Teksty za przełącznikiem VITE_MM_HOME_SEO (config/flags.ts); uzasadnienie w docs/tresci/MIX-1269.md.
 * `HOME_SEO_BASE` = dzisiejsze title i meta (wyłączony przełącznik), bez zmian co do znaku.
 */

/** Fraza docelowa (bez rozróżniania wielkości liter): w title i H1 dokładnie raz. */
export const HOME_SEO_PHRASE = 'agencja marketingowa rzeszów';

export const HOME_SEO_BASE = {
  title: 'Agencja Marketingowa Rzeszów — Web, SEO, Ads',
  description:
    'Agencja marketingowa z Rzeszowa: strony WWW, SEO, Google Ads, Meta Ads, branding. Dojeżdżamy do klientów na Podkarpaciu, realizujemy projekty w całej Polsce.',
};

export const HOME_SEO = {
  /** 58 znaków; z sufiksem marki byłoby ponad 60, więc fitTitle zostawia go bez marki (jak dziś). */
  title: 'Agencja marketingowa Rzeszów: strony WWW, SEO i Google Ads',
  /** 151 znaków (limit karty 155). */
  description:
    'Agencja marketingowa z Rzeszowa: strony i sklepy internetowe, SEO, Google Ads, Meta Ads i branding. Pracujemy z firmami z Podkarpacia i z całej Polski.',
  /** Pierwsza linia H1 nad „Nie szukaj wykonawców. Wybierz Partnera.” */
  h1Lead: 'Agencja marketingowa Rzeszów.',
};

export interface HomeLocalLink {
  to: string;
  label: string;
  /** Wyróżniony przycisk (hub lokalny), jak „Hub lokalny” dziś. */
  primary?: boolean;
}

/** Linki pasa „Lokalnie · Rzeszów” w sekcji usług (adresy z public/sitemap.xml). */
export const HOME_LOCAL_LINKS: HomeLocalLink[] = [
  { to: '/web-development/rzeszow/', label: 'Strony internetowe Rzeszów' },
  { to: '/agencja-seo-rzeszow/', label: 'Pozycjonowanie stron Rzeszów' },
  { to: '/agencja-interaktywna-rzeszow/', label: 'Agencja interaktywna Rzeszów' },
  { to: '/marketing/google-ads/', label: 'Kampanie Google Ads' },
  { to: '/miasto/rzeszow/', label: 'Marketing w Rzeszowie', primary: true },
];
