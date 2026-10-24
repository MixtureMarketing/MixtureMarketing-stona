/**
 * Meta description gotowy do <meta name="description"> / og / twitter.
 *
 * Bezpiecznik dla opisów, których nie piszemy ręcznie (Sanity: case studies, branże;
 * podtytuły artykułów z HTML-em): usuwa znaczniki, zbija białe znaki i przycina do
 * MAX znaków na granicy słowa (Google i tak tnie ~155–160 znaków — lepiej uciąć
 * samemu w sensownym miejscu niż w pół słowa). Opisy pisane ręcznie trzymamy ≤ MAX.
 */
export const META_DESCRIPTION_MAX = 160;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
};

export const toMetaDescription = (raw: string | undefined | null): string => {
  const text = (raw ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|quot|#39|apos|lt|gt|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= META_DESCRIPTION_MAX) return text;
  const cut = text.slice(0, META_DESCRIPTION_MAX - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > META_DESCRIPTION_MAX * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:—–-]+$/, '')}…`;
};
