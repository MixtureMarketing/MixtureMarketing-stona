// Statyczne sciezki uzywane wylacznie przez scripts/generate-sitemap.js.
// Dwa zrodla artykulow w /baza-wiedzy/:
//   1) Hardcoded ponizej (RedisArticle, WafArticle itp.) - dedykowane komponenty
//      React w config/routes.tsx, z custom UI i animacjami. MUSZA byc tutaj,
//      bo nie pochodza z Sanity.
//   2) Sanity blog posts - pobierane dynamicznie przez generator z _type=='article'.
//      Generator deduplikuje, wiec jezeli slug pojawi sie w obu zrodlach,
//      zachowywana jest wersja statyczna.
// Wszystkie wpisy MUSZA konczyc sie trailing slashem (kanoniczna forma URL).
// /portal NIE jest w tej liscie - jest zablokowany przez robots.txt.
export const routes = [
  '/',
  '/offers/',
  '/contact/',
  '/o-nas/',
  '/privacy-policy/',
  '/terms/',
  '/audyt-360/',

  // Web Development
  '/web-development/',
  '/web-development/ecommerce/',
  '/web-development/landing-page/',
  '/web-development/corporate/',
  '/web-development/custom-app/',
  '/web-development/rzeszow/',

  // Marketing
  '/marketing/',
  '/marketing/google-ads/',
  '/marketing/meta-ads/',
  '/marketing/seo/',
  '/marketing/analytics/',
  '/agencja-interaktywna-rzeszow/',
  '/agencja-seo-rzeszow/',
  '/pozycjonowanie-rzeszow/',

  // SaaS landing
  '/abonament/',
  '/abonament/professional/',
  '/abonament/vs-wix/',
  '/abonament/vs-orange-klikai/',
  // /abonament/dziekujemy/ - intencjonalnie pominięte (noindex, post-Stripe)

  // Design
  '/design/',
  '/design/branding/',
  '/design/ui-ux/',
  '/design/print/',
  '/design/visual-audit/',

  // Knowledge Base (lista glowna)
  '/baza-wiedzy/',

  // Hardcoded premium articles (komponenty React z animacjami i custom UI)
  '/baza-wiedzy/redis-optymalizacja/',
  '/baza-wiedzy/cdn-globalna-wydajnosc/',
  '/baza-wiedzy/optymalizacja-obrazow-webp-avif/',
  '/baza-wiedzy/waf-bezpieczenstwo/',
  '/baza-wiedzy/edge-computing/',
  '/baza-wiedzy/core-web-vitals-2025/',
  '/baza-wiedzy/google-ads-skalowanie-budzetu/',
  '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026/',
  '/baza-wiedzy/audyt-ux-sklepu-internetowego/',
  '/baza-wiedzy/server-side-tracking-koniec-cookies/',
  '/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych/',
  '/baza-wiedzy/headless-wordpress-wydajnosc-i-bezpieczenstwo/',
  '/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania/',
  '/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu/',
  '/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu/',
  '/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji/',
  '/baza-wiedzy/elasticsearch-inteligentna-wyszukiwarka-ecommerce/',
  '/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu/',
  '/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular/',
  '/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp/',
  '/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie/',
  '/baza-wiedzy/go-golang-jezyk-chmury/',
  '/baza-wiedzy/nodejs-jeden-jezyk/',
  '/baza-wiedzy/frontend-bez-tajemnic-kompendium-cto/',
  '/baza-wiedzy/bazy-danych-kompendium-architekta/',
  '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto/',
  '/baza-wiedzy/docker-konteneryzacja-przewodnik/',
  '/baza-wiedzy/ci-cd-automatyzacja-wdrozen/',
  '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu/',

  // Portfolio
  '/portfolio/',
];
