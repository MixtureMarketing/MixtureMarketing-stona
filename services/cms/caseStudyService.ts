import { SanityTeamMember, SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import { fetchWithCache, CmsUnavailableError } from './client';

export const caseStudyService = {
  async getCaseStudies(category?: string): Promise<SanityCaseStudy[]> {
    try {
      const filter = category ? `&& category == "${category}"` : '';
      const query = `*[_type == "caseStudy" ${filter}] | order(date desc) {
        _id,
        title,
        "slug": slug.current,
        clientLogo,
        category,
        subcategory,
        date,
        excerpt,
        mainImage
      }`;
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getCaseStudies):', error);
      return [];
    }
  },

  async getCaseStudyBySlug(slug: string): Promise<SanityCaseStudy | null> {
    try {
      const query = `*[_type == "caseStudy" && slug.current == $slug][0] {
        ...,
        "slug": slug.current,
        downloads[] {
          description,
          "asset": asset->{
            url
          }
        },
        credits[]->{
          _id,
          name,
          role,
          image,
          linkedin
        }
      }`;
      return await fetchWithCache(query, { slug });
    } catch (error) {
      console.warn(`Sanity fetch error (getCaseStudyBySlug: ${slug}):`, error);
      // Błąd pobrania ≠ brak dokumentu — patrz CmsUnavailableError.
      throw new CmsUnavailableError(`getCaseStudyBySlug: ${slug}`, error);
    }
  },

  async getTeamMembers(): Promise<SanityTeamMember[]> {
    try {
      const query = `*[_type == "teamMember"] {
        _id,
        name,
        role,
        image,
        email,
        linkedin
      }`;
      return await fetchWithCache(query);
    } catch (error) {
      console.warn('Sanity fetch error (getTeamMembers):', error);
      return [];
    }
  },

  async getRelatedContent(
    currentSlug: string,
    category?: string,
  ): Promise<
    Array<{
      _type: 'article' | 'caseStudy';
      title: string;
      slug: string;
      mainImage: SanityImage;
      category: string;
      date: string;
    }>
  > {
    try {
      const filter = category ? `(category->title == $category || category == $category)` : `true`;
      const query = `*[
        (_type == "article" || _type == "caseStudy") &&
        slug.current != $currentSlug &&
        ${filter}
      ] | order(publishedAt desc, date desc)[0...3] {
        _type,
        title,
        "slug": slug.current,
        mainImage,
        "category": coalesce(category->title, category),
        "date": coalesce(publishedAt, date)
      }`;
      return await fetchWithCache(query, { currentSlug, category });
    } catch (error) {
      console.warn('Sanity fetch error (getRelatedContent):', error);
      return [];
    }
  },

  /**
   * Strona case study: obecny projekt + „następny projekt”. `null` = brak dokumentu
   * (NotFound); wyjątek z getCaseStudyBySlug = Sanity niedostępne (CmsErrorState, bez
   * noindex). Lista do „następnego” przy błędzie zwraca [] — nawigacja po prostu znika.
   */
  async getCaseStudyPage(
    slug: string,
  ): Promise<{ project: SanityCaseStudy; nextProject: SanityCaseStudy | null } | null> {
    const [current, all] = await Promise.all([
      caseStudyService.getCaseStudyBySlug(slug),
      caseStudyService.getCaseStudies(),
    ]);
    if (!current) return null;
    return { project: current, nextProject: pickNextCaseStudy(all, slug) };
  },
};

/** Slug nadaje się do linku tylko jako niepusty tekst (GROQ: `"slug": slug.current`). */
const hasUsableSlug = (p: SanityCaseStudy | null | undefined): p is SanityCaseStudy =>
  typeof p?.slug === 'string' && p.slug.trim() !== '';

/**
 * „Następny projekt” (MIX-1378): kolejny case study z listy, po ostatnim pierwszy (zawinięcie).
 * Pozycje bez sluga są pomijane, więc link nigdy nie prowadzi do /portfolio/undefined/.
 * `null`, gdy nie ma innego projektu niż bieżący.
 */
export function pickNextCaseStudy(
  all: SanityCaseStudy[],
  currentSlug: string,
): SanityCaseStudy | null {
  const candidates = all.filter(hasUsableSlug);
  if (candidates.length === 0) return null;
  const currentIndex = candidates.findIndex((p) => p.slug === currentSlug);
  const next =
    currentIndex === -1 ? candidates[0] : candidates[(currentIndex + 1) % candidates.length];
  return next.slug === currentSlug ? null : next;
}
