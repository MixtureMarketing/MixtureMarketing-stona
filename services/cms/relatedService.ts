import { fetchWithCache, CmsUnavailableError } from './client';
import { hasRealScreenshot } from './mockupSlugs';
import { publicIndustrySlug } from '../../config/slugAliases.js';
import {
  isRelatedType,
  pickRelated,
  RelatedLink,
  RelatedPoolItem,
  RelatedType,
} from '../../utils/related';

/** Surowy wiersz puli z GROQ (pola tematów zależą od rodzaju dokumentu). */
interface PoolRow {
  _type?: unknown;
  slug?: unknown;
  title?: unknown;
  category?: unknown;
  tags?: unknown;
  subcategory?: unknown;
  techStack?: unknown;
  platforms?: unknown;
}

/**
 * Jedno zapytanie na całą pulę (artykuły, realizacje, branże), tylko pola do wyboru i linku.
 * fetchWithCache trzyma wynik 5 min, więc kolejne strony w tej samej sesji nie pytają ponownie.
 */
export const RELATED_POOL_QUERY = `*[_type in ["article", "caseStudy", "industry"] && defined(slug.current)] {
  _type,
  "slug": slug.current,
  "title": coalesce(title, name),
  "category": coalesce(category->title, category),
  tags,
  subcategory,
  techStack,
  platforms
}`;

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

/** Wiersz GROQ → pozycja puli z publicznym slugiem; `null` = pozycja nie trafia do bloku. */
export function toPoolItem(row: PoolRow | null | undefined): RelatedPoolItem | null {
  if (!row || !isRelatedType(row._type) || typeof row.slug !== 'string') return null;
  if (typeof row.title !== 'string') return null;
  const type: RelatedType = row._type;
  // Makiety z Figmy nie są pokazywane jako realizacje (services/cms/mockupSlugs.ts).
  if (type === 'caseStudy' && !hasRealScreenshot(row.slug)) return null;
  const slug = type === 'industry' ? publicIndustrySlug(row.slug) : row.slug;
  const category = typeof row.category === 'string' ? [row.category] : [];
  return {
    _type: type,
    slug,
    title: row.title,
    topics: [
      ...category,
      ...strings(row.tags),
      ...strings(row.subcategory),
      ...strings(row.techStack),
      ...strings(row.platforms),
    ],
  };
}

/** Klucz strony dla hooka i zrzutu: `<rodzaj>:<slug publiczny>`. */
export const relatedKey = (type: RelatedType, slug: string): string => `${type}:${slug}`;

export function parseRelatedKey(key: string): { _type: RelatedType; slug: string } | null {
  const at = typeof key === 'string' ? key.indexOf(':') : -1;
  if (at <= 0) return null;
  const type = key.slice(0, at);
  const slug = key.slice(at + 1);
  return isRelatedType(type) && slug ? { _type: type, slug } : null;
}

export const relatedService = {
  /**
   * Powiązane linki dla strony o kluczu `relatedKey(...)`. Pusta lista = brak dopasowań
   * (blok się nie renderuje). Błąd CMS RZUCA (jak getXBySlug), żeby pusty wynik z awarii
   * nie trafił do zrzutu prerenderu jako „brak powiązanych”.
   */
  async getRelatedFor(key: string): Promise<RelatedLink[]> {
    const current = parseRelatedKey(key);
    if (!current) return [];
    let rows: PoolRow[] | null;
    try {
      rows = await fetchWithCache<PoolRow[] | null>(RELATED_POOL_QUERY);
    } catch (error) {
      console.warn('Sanity fetch error (getRelatedFor):', error);
      throw new CmsUnavailableError(`getRelatedFor: ${key}`, error);
    }
    const pool = (Array.isArray(rows) ? rows : []).map(toPoolItem);
    return pickRelated(current, pool);
  },
};
