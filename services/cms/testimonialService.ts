import type { SanityTestimonial } from '@/types/sanity';
import { MAX_TESTIMONIALS, normalizeTestimonials } from '@/utils/testimonials';
import { fetchWithCache } from './client';

/**
 * MIX-1326: opinie klientów. Tylko dokumenty ze zgodą klienta na publikację (`consentConfirmed`)
 * i z kompletem pól; maksymalnie MAX_TESTIMONIALS. Typ dokumentu: studio-mixture-marketing/schemaTypes/testimonial.ts.
 */
export const TESTIMONIALS_QUERY = `*[_type == "testimonial" && consentConfirmed == true && defined(quote) && defined(companyName) && defined(industry) && defined(personFirstName)] | order(order asc, _createdAt desc) [0...${MAX_TESTIMONIALS}] {
  _id,
  companyName,
  industry,
  personFirstName,
  quote,
  logo,
  googleReviewUrl
}`;

export const testimonialService = {
  /** Błąd pobrania albo brak dokumentów = `[]` (sekcja się wtedy nie renderuje). */
  async getTestimonials(): Promise<SanityTestimonial[]> {
    try {
      return normalizeTestimonials(await fetchWithCache<unknown>(TESTIMONIALS_QUERY));
    } catch (error) {
      console.warn('Sanity fetch error (getTestimonials):', error);
      return [];
    }
  },
};
