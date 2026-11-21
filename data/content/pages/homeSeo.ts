/**
 * MIX-1269 (plan SEO A12, runda 3): strona główna najpierw o systemach dedykowanych i automatyzacji
 * z AI, marketing jako usługa dodatkowa (decyzja Jakuba MIX-1058, 21.11). Wersja r2 pod
 * „agencja marketingowa Rzeszów” odrzucona 21.11 (opis w docs/tresci/MIX-1269.md).
 * Teksty za przełącznikiem VITE_MM_HOME_SEO (config/flags.ts); dane i wybór fraz w docs/tresci/MIX-1269.md.
 * `HOME_SEO_BASE` = dzisiejsze title i meta (wyłączony przełącznik), bez zmian co do znaku.
 */

/** Fraza główna (bez rozróżniania wielkości liter): w title i H1 dokładnie raz. */
export const HOME_SEO_PHRASE = 'systemy dedykowane';

export const HOME_SEO_BASE = {
  title: 'Agencja Marketingowa Rzeszów — Web, SEO, Ads',
  description:
    'Agencja marketingowa z Rzeszowa: strony WWW, SEO, Google Ads, Meta Ads, branding. Dojeżdżamy do klientów na Podkarpaciu, realizujemy projekty w całej Polsce.',
};

export const HOME_SEO = {
  /** 48 znaków: fraza główna, potem lokalna; z sufiksem marki byłoby 68, więc fitTitle zostawia bez marki. */
  title: 'Systemy dedykowane i AI | Software house Rzeszów',
  /** 145 znaków (limit karty 155): systemy i AI najpierw, marketing jako dodatek. */
  description:
    'Software house z Rzeszowa: systemy dedykowane, aplikacje webowe i automatyzacja procesów z AI. Dodatkowo marketing: strony WWW, SEO i Google Ads.',
  /** Pierwsza linia H1 nad „Nie szukaj wykonawców. Wybierz Partnera.” */
  h1Lead: 'Systemy dedykowane i automatyzacja AI z Rzeszowa.',
};

export interface HomeLocalLink {
  to: string;
  label: string;
  /** Wyróżniony przycisk (hub lokalny), jak „Hub lokalny” dziś. */
  primary?: boolean;
}

/**
 * Linki pasa „Lokalnie · Rzeszów” w sekcji usług (adresy z public/sitemap.xml), w kolejności:
 * systemy dedykowane i AI pierwsze, marketing dalej, hub lokalny na końcu.
 */
export const HOME_LOCAL_LINKS: HomeLocalLink[] = [
  { to: '/web-development/custom-app/', label: 'Aplikacje i systemy na zamówienie' },
  {
    to: '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/',
    label: 'Automatyzacja z AI w firmie',
  },
  { to: '/web-development/rzeszow/', label: 'Strony internetowe Rzeszów' },
  { to: '/agencja-seo-rzeszow/', label: 'Pozycjonowanie stron Rzeszów' },
  { to: '/miasto/rzeszow/', label: 'Mixture w Rzeszowie', primary: true },
];
