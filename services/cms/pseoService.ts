import { SanityImage } from '@/types/sanity';
import { fetchWithCache, CmsUnavailableError } from './client';

export interface SanityLocation {
  _id: string;
  city: string;
  slug: { current: string };
  genitive: string;
  businessContext: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SanityIndustry {
  _id: string;
  name: string;
  slug: { current: string };
  forWho: string;
  painPoints: string[];
  techRequirements: string[];
  jargon: string[];
  compliance?: string;
  heroImage?: SanityImage;
}

/** Kafelek branży na hubie /branza/. */
export interface SanityIndustrySummary {
  _id: string;
  name: string;
  slug: string;
  forWho?: string | null;
  /** Liczba „Pain Points” — miara kompletności dokumentu (wybór przy duplikatach sluga). */
  painPointCount?: number | null;
}

/**
 * Jedna pozycja na slug. Przy duplikacie wygrywa dokument pełniejszy (więcej
 * wypełnionych „Pain Points”), przy remisie — pierwszy. Wynik posortowany po nazwie (pl).
 */
export const dedupeIndustriesBySlug = (rows: SanityIndustrySummary[]): SanityIndustrySummary[] => {
  const bySlug = new Map<string, SanityIndustrySummary>();
  for (const row of rows) {
    if (!row?.slug || !row.name) continue;
    const prev = bySlug.get(row.slug);
    if (!prev || (row.painPointCount ?? 0) > (prev.painPointCount ?? 0)) bySlug.set(row.slug, row);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
};

export const pseoService = {
  async getLocations(): Promise<SanityLocation[]> {
    try {
      const query = `*[_type == "location"] {
        _id,
        city,
        "slug": slug.current,
        genitive,
        businessContext,
        seoTitle,
        seoDescription
      }`;
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getLocations):', error);
      return [];
    }
  },

  async getLocationBySlug(slug: string): Promise<SanityLocation | null> {
    try {
      const query = `*[_type == "location" && slug.current == $slug][0] {
        _id,
        city,
        "slug": slug.current,
        genitive,
        businessContext,
        seoTitle,
        seoDescription
      }`;
      return await fetchWithCache(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getLocationBySlug: ${slug}):`, error);
      // Błąd pobrania ≠ brak dokumentu — patrz CmsUnavailableError.
      throw new CmsUnavailableError(`getLocationBySlug: ${slug}`, error);
    }
  },

  /**
   * Lista branż dla huba /branza/ — tylko pola potrzebne do kafelka (nazwa, grupa
   * docelowa, slug). Deduplikowana po slugu (w Sanity bywają dwa dokumenty z tym
   * samym slugiem, np. `e-commerce`).
   * Błąd pobrania RZUCA CmsUnavailableError (jak getXBySlug) — pusta lista z błędu
   * trafiłaby do prerenderu jako hub bez linków.
   */
  async getIndustryList(): Promise<SanityIndustrySummary[]> {
    try {
      const query = `*[_type == "industry" && defined(slug.current)] {
        _id,
        name,
        "slug": slug.current,
        forWho,
        "painPointCount": count(painPoints)
      }`;
      const rows = await fetchWithCache<SanityIndustrySummary[] | null>(query);
      return dedupeIndustriesBySlug(rows ?? []);
    } catch (error) {
      console.warn('Sanity fetch error (getIndustryList):', error);
      throw new CmsUnavailableError('getIndustryList', error);
    }
  },

  async getIndustryBySlug(slug: string): Promise<SanityIndustry | null> {
    try {
      const query = `*[_type == "industry" && slug.current == $slug][0] {
        _id,
        name,
        "slug": slug.current,
        forWho,
        painPoints,
        techRequirements,
        jargon,
        compliance,
        heroImage
      }`;
      return await fetchWithCache(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getIndustryBySlug: ${slug}):`, error);
      // Błąd pobrania ≠ brak dokumentu — patrz CmsUnavailableError.
      throw new CmsUnavailableError(`getIndustryBySlug: ${slug}`, error);
    }
  },
};
