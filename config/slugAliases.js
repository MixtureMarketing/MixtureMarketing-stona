// Poprawne publiczne slugi branż zamiast błędnych slugów z CMS (audyt, P9).
// W Sanity dwa dokumenty branż mają slugi z literówką / podwójnym myślnikiem
// („usugi-b2b”, „saas--startups”). Publiczny adres dostaje poprawną formę, a stary adres
// przekierowuje 301 (public/_redirects). Dokument w CMS zostaje pod starym slugiem —
// aliasy tłumaczą w obie strony, więc strona nie wymaga zmiany w Sanity.
// Po zmianie slugów w Sanity (Ręcznie) mapę można usunąć razem z regułami 301.

/** slug w CMS → poprawny slug publiczny */
export const INDUSTRY_SLUG_ALIASES = Object.freeze({
  'usugi-b2b': 'uslugi-b2b',
  'saas--startups': 'saas-startups',
});

/** @param {string} cmsSlug @returns {string} slug publiczny (bez aliasu: bez zmian) */
export function publicIndustrySlug(cmsSlug) {
  return Object.prototype.hasOwnProperty.call(INDUSTRY_SLUG_ALIASES, cmsSlug)
    ? INDUSTRY_SLUG_ALIASES[cmsSlug]
    : cmsSlug;
}

/**
 * @param {string} publicSlug
 * @returns {string} slug dokumentu w CMS. Stary (błędny) slug publiczny NIE jest
 * tłumaczony: adres /branza/usugi-b2b/ ma być 404/301, nie drugą kopią strony.
 */
export function cmsIndustrySlug(publicSlug) {
  const hit = Object.entries(INDUSTRY_SLUG_ALIASES).find(([, pub]) => pub === publicSlug);
  return hit ? hit[0] : publicSlug;
}

/** Stary (błędny) slug: adres ma przekierowywać 301, a nie renderować drugą kopię strony. */
export function isLegacyIndustrySlug(slug) {
  return Object.prototype.hasOwnProperty.call(INDUSTRY_SLUG_ALIASES, slug);
}
