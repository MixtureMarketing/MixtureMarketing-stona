import { SanityTeamMember, SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import { fetchWithCache } from './client';

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
      return null;
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
};
