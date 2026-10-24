import { SanityTeamMember } from '../types/sanity';

/**
 * Sanitizacja danych zespołu z CMS przed renderem i JSON-LD (/o-nas/).
 * Produkcja pokazywała „Karol Mierzwa " / „Alicja Piwońska " (spacje na końcu),
 * stanowisko „Desing " (literówka widoczna w treści i w schemie) oraz `"email": null`.
 * Docelowo dane trzeba poprawić w Sanity — ta warstwa chroni stronę przed regresją.
 */
const TYPO_FIXES: [RegExp, string][] = [[/\bDesing\b/g, 'Design']];

const clean = (value: string | null | undefined): string | undefined => {
  const v = (value ?? '').replace(/\s+/g, ' ').trim();
  return v || undefined;
};

export const normalizeTeamMember = (m: SanityTeamMember): SanityTeamMember => {
  const role = TYPO_FIXES.reduce((r, [re, fix]) => r.replace(re, fix), clean(m.role) ?? '');
  return {
    ...m,
    name: clean(m.name) ?? '',
    role,
    email: clean(m.email),
    linkedin: clean(m.linkedin),
  };
};
