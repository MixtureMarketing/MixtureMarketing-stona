import type { SanityImage } from '@/types/sanity';

/**
 * MIX-1275: zdjęcie z katalogu public/ zamiast zasobu Sanity (realizacje z repo, np. AI Q-PLAST).
 * Kształt jak obraz z CMS, więc szablony realizacji działają bez zmian; `urlFor` oddaje wtedy
 * samą ścieżkę (szerokość, kadr i format są już w pliku).
 */
export const LOCAL_IMAGE_PREFIX = 'local:';
/** Tylko ścieżka własna od `/` (bez `//host`, schematu, `..`, zapytania i spacji). */
const LOCAL_SRC = /^\/(?!\/)(?!.*\.\.)[A-Za-z0-9_\-./]+$/;

export const localImage = (src: string): SanityImage => ({
  _type: 'image',
  asset: { _ref: `${LOCAL_IMAGE_PREFIX}${src}`, _type: 'reference' },
});

/** Ścieżka zdjęcia lokalnego albo `null` (obraz z Sanity lub niedozwolona ścieżka). */
export const localImageSrc = (source: unknown): string | null => {
  const ref = (source as { asset?: { _ref?: unknown } } | null | undefined)?.asset?._ref;
  if (typeof ref !== 'string' || !ref.startsWith(LOCAL_IMAGE_PREFIX)) return null;
  const src = ref.slice(LOCAL_IMAGE_PREFIX.length);
  return LOCAL_SRC.test(src) ? src : null;
};
