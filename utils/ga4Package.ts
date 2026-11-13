// MIX-1514: tytul pakietu z CMS -> staly slug ASCII dla parametru GA4 `package`. Slug powstaje PRZED
// straznikiem (sanitizeGa4Event), ktory sprawdza go dalej jak kazda wartosc `package`.
//
// Allowlista, fail-closed: slug dostaje tylko tytul z ponizszej listy (dokladnie ten zapis). Kazdy
// inny tytul (nowy pakiet w CMS, imie i nazwisko, e-mail, telefon, inny zapis znanego tytulu) i kazda
// inna wartosc staje sie "(odrzucone)" juz tutaj. Nie oddajemy go straznikowi bez zmian, bo ten
// przepuszcza kazde slowo ASCII (np. nazwisko "Kowalski"). Nowy tytul pakietu w CMS wymaga wpisu
// tutaj; do tego czasu w GA4 widac go jako "(odrzucone)".

import { REFUSED } from './ga4Events';

/** Tytuly pakietow z publicznego CMS (8 sekcji cennika, 24 miejsca, 19 tytulow), stan 12.11.2026. */
const PACKAGE_SLUGS: ReadonlyMap<string, string> = new Map([
  ['Campaign Ready', 'campaign-ready'],
  ['High Performance', 'high-performance'],
  ['Multi-Landing System', 'multi-landing-system'],
  ['Fixed Price', 'fixed-price'],
  ['Time & Material', 'time-material'],
  ['Team Extension', 'team-extension'],
  ['Business Card', 'business-card'],
  ['Corporate Pro', 'corporate-pro'],
  ['Enterprise Portal', 'enterprise-portal'],
  ['Start', 'start'],
  ['Scale', 'scale'],
  ['Enterprise', 'enterprise'],
  ['Growth', 'growth'],
  ['WooCommerce Start', 'woocommerce-start'],
  ['E-commerce Pro', 'e-commerce-pro'],
  ['B2B / Headless', 'b2b-headless'],
  ['Lokalne SEO', 'lokalne-seo'],
  ['National SEO', 'national-seo'],
  ['Authority', 'authority'],
]);

/** Slugi z listy (do testow: kazdy musi przejsc straznika bez zmian). */
export const KNOWN_PACKAGE_SLUGS: readonly string[] = [...PACKAGE_SLUGS.values()];

/**
 * Staly slug znanego tytulu pakietu; brak (undefined / null) zostaje brakiem parametru; wszystko
 * inne = "(odrzucone)". Map.get: klucze z prototypu (constructor, __proto__) nie trafiaja.
 */
export const packageSlug = (title: unknown): string | undefined => {
  if (title === undefined || title === null) return undefined;
  return (typeof title === 'string' && PACKAGE_SLUGS.get(title)) || REFUSED;
};
