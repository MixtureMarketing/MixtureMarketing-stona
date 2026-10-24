export const BREADCRUMBS_PATH_MAP: Record<string, string> = {
  '/branza': 'Branże',
  '/miasto': 'Miasta',
  '/web-development': 'Web Development',
  '/web-development/ecommerce': 'E-commerce',
  '/web-development/landing-page': 'Landing Page',
  '/web-development/corporate': 'Strona Firmowa',
  '/web-development/custom-app': 'Aplikacje Dedykowane',
  '/web-development/rzeszow': 'Rzeszów',
  '/marketing': 'Marketing Cyfrowy',
  '/marketing/google-ads': 'Google Ads',
  '/marketing/meta-ads': 'Meta Ads',
  '/marketing/seo': 'SEO & Content',
  '/agencja-seo-rzeszow': 'Agencja SEO Rzeszów',
  '/pozycjonowanie-rzeszow': 'Pozycjonowanie Rzeszów',
  '/miasto/rzeszow': 'Rzeszów — hub lokalny',
  '/marketing/analytics': 'Data & Analityka',
  '/agencja-interaktywna-rzeszow': 'Agencja Interaktywna Rzeszów',
  '/abonament': 'Strona w abonamencie',
  '/abonament/dziekujemy': 'Dziękujemy',
  '/abonament/professional': 'Professional (branże regulowane)',
  '/abonament/vs-wix': 'Mixture vs Wix',
  '/abonament/vs-orange-klikai': 'Mixture vs Orange KlikAI',
  '/design': 'Grafika & Design',
  '/design/branding': 'Brand Identity',
  '/design/ui-ux': 'UI/UX Design',
  '/design/print': 'Materiały Druk',
  '/design/visual-audit': 'Audyt Wizualny',
  '/contact': 'Kontakt',
  '/offers': 'Oferta',
  // Etykiety z istniejących nazw (stopka / <title> / schema strony) — wcześniej okruszek
  // pokazywał surowy slug („privacy policy”, „terms”, „wycena”, „audyt 360”, „portfolio”).
  '/wycena': 'Kalkulator wyceny',
  '/privacy-policy': 'Polityka prywatności',
  '/terms': 'Regulamin',
  '/portfolio': 'Realizacje',
  '/audyt-360': 'Darmowy audyt SEO + UX',
  '/o-nas': 'O nas',
  '/baza-wiedzy': 'Baza Wiedzy',
  '/baza-wiedzy/redis-optymalizacja': 'Redis - Optymalizacja',
  '/baza-wiedzy/cdn-globalna-wydajnosc': 'CDN - Globalna Wydajność',
  '/baza-wiedzy/optymalizacja-obrazow-webp-avif': 'Next-Gen Image Formats',
  '/baza-wiedzy/waf-bezpieczenstwo': 'WAF - Bezpieczeństwo',
  '/baza-wiedzy/edge-computing': 'Edge Computing',
  '/baza-wiedzy/core-web-vitals-2025': 'Core Web Vitals 2025',
  '/baza-wiedzy/google-ads-skalowanie-budzetu': 'Google Ads - Skalowanie',
  '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026': 'Ile kosztuje strona Rzeszów 2026',
};

/**
 * Segmenty ścieżki, które nie mają własnej strony (brak trasy → 404).
 * Okruszek renderuje się jako tekst, bez linku.
 * /branza ma hub (components/pages/IndustryHub.tsx). /miasto celowo bez huba —
 * strony miast poza Rzeszowem są noindex.
 */
export const BREADCRUMBS_NO_PAGE: ReadonlySet<string> = new Set(['/miasto']);

const HOME_CRUMB = { name: 'Strona Główna', item: '/' };

/**
 * Etykieta okruszka dla ścieżki (bez końcowego slasha). Kolejność: mapa → etykieta strony
 * (`currentLabel`, tylko ostatni segment — np. tytuł case study z CMS) → slug ze spacjami.
 */
export const breadcrumbLabel = (path: string, currentLabel?: string): string =>
  BREADCRUMBS_PATH_MAP[path] || currentLabel || path.split('/').pop()!.replace(/-/g, ' ');

/**
 * Okruszki dla schemy BreadcrumbList (Seo `breadcrumbs`) — te same etykiety co widoczne
 * <Breadcrumbs/>. Segmenty bez własnej strony (BREADCRUMBS_NO_PAGE) są pomijane: ListItem
 * w schemie musi wskazywać istniejący URL.
 */
export const getPathBreadcrumbs = (
  pathname: string,
  currentLabel?: string,
): { name: string; item: string }[] => {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((_, i) => {
    const path = `/${segments.slice(0, i + 1).join('/')}`;
    const isLast = i === segments.length - 1;
    return { path, name: breadcrumbLabel(path, isLast ? currentLabel : undefined) };
  });
  return [
    HOME_CRUMB,
    ...crumbs
      .filter(({ path }) => !BREADCRUMBS_NO_PAGE.has(path))
      .map(({ path, name }) => ({ name, item: `${path}/` })),
  ];
};
