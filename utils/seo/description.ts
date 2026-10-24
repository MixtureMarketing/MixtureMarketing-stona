/**
 * Meta description stron branż (/branza/:slug/).
 *
 * Zdanie o problemach doklejamy TYLKO, gdy CMS ma niepuste `painPoints`. Dokumenty bez
 * tego pola (np. /branza/saas--startups/, /branza/usugi-b2b/ z seeda) dawały na produkcji
 * „… Rozwiązujemy problemy: undefined.” — w indeksowanej meta.
 */
export const industryDescription = (
  name: string,
  painPoints?: (string | null)[] | null,
): string => {
  const base = `Specjalistyczne usługi IT i marketingu dla branży: ${name}.`;
  const points = (painPoints ?? [])
    .map((p) => (typeof p === 'string' ? p.trim().replace(/[.\s]+$/, '') : ''))
    .filter(Boolean)
    .slice(0, 2);
  return points.length > 0 ? `${base} Rozwiązujemy problemy: ${points.join(', ')}.` : base;
};
