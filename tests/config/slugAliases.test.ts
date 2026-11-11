import { describe, it, expect } from 'vitest';
import {
  INDUSTRY_SLUG_ALIASES,
  cmsIndustrySlug,
  isLegacyIndustrySlug,
  publicIndustrySlug,
} from '../../config/slugAliases.js';

// MIX-1266 (audyt P9): błędne slugi branż z CMS dostają poprawny adres publiczny.
describe('config/slugAliases — publiczne slugi branż', () => {
  it('mapa ma dokładnie dwa błędne slugi z audytu', () => {
    expect(INDUSTRY_SLUG_ALIASES).toEqual({
      'usugi-b2b': 'uslugi-b2b',
      'saas--startups': 'saas-startups',
    });
  });

  it.each([
    ['usugi-b2b', 'uslugi-b2b'],
    ['saas--startups', 'saas-startups'],
  ])('CMS „%s” → publiczny „%s”, a z powrotem na slug dokumentu', (cms, pub) => {
    expect(publicIndustrySlug(cms)).toBe(pub);
    expect(cmsIndustrySlug(pub)).toBe(cms);
    expect(isLegacyIndustrySlug(cms)).toBe(true);
    expect(isLegacyIndustrySlug(pub)).toBe(false);
  });

  it('stary błędny slug publiczny NIE jest tłumaczony na dokument (adres idzie 301, nie jako kopia)', () => {
    expect(cmsIndustrySlug('usugi-b2b')).toBe('usugi-b2b');
    expect(isLegacyIndustrySlug('usugi-b2b')).toBe(true);
  });

  it.each(['e-commerce', 'deweloperzy', ''])('zwykły slug „%s” bez zmian', (slug) => {
    expect(publicIndustrySlug(slug)).toBe(slug);
    expect(cmsIndustrySlug(slug)).toBe(slug);
    expect(isLegacyIndustrySlug(slug)).toBe(false);
  });

  it.each(['constructor', '__proto__', 'toString', 'hasOwnProperty'])(
    'klucz prototypu „%s” nie jest aliasem (fail-closed)',
    (slug) => {
      expect(publicIndustrySlug(slug)).toBe(slug);
      expect(isLegacyIndustrySlug(slug)).toBe(false);
    },
  );

  it('żaden slug publiczny nie ma podwójnego myślnika ani literówki z audytu', () => {
    for (const pub of Object.values(INDUSTRY_SLUG_ALIASES)) {
      expect(pub).not.toMatch(/--/);
      expect(pub).not.toBe('usugi-b2b');
    }
  });
});
