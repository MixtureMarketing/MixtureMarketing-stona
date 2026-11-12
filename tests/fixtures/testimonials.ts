// MIX-1326: dane TESTOWE, jawnie fikcyjne ("Firma Testowa"). Żadna prawdziwa opinia klienta nie
// trafia do repozytorium (treść czeka na zgody klientów, MIX-1325).
import type { TestimonialViewItem } from '../../components/sections/testimonials/TestimonialsView';
import type { SanityTestimonial } from '../../types/sanity';

export const REVIEW_URL = 'https://example.com/oryginalna-opinia-testowa';

export const viewItems: TestimonialViewItem[] = [
  {
    id: 't1',
    companyName: 'Firma Testowa Alfa',
    industry: 'Branża testowa: handel',
    personFirstName: 'Anna',
    quote: 'Fikcyjna opinia numer jeden, tylko do testów.',
    logoUrl: 'https://example.com/logo-alfa.png',
    googleReviewUrl: REVIEW_URL,
  },
  {
    id: 't2',
    companyName: 'Firma Testowa Beta',
    industry: 'Branża testowa: usługi',
    personFirstName: 'Jan',
    quote: 'Fikcyjna opinia numer dwa, tylko do testów.',
  },
  {
    id: 't3',
    companyName: 'Firma Testowa Gamma',
    industry: 'Branża testowa: produkcja',
    personFirstName: 'Ewa',
    quote: 'Fikcyjna opinia numer trzy, tylko do testów.',
    googleReviewUrl: REVIEW_URL,
  },
];

export const cmsItems: SanityTestimonial[] = viewItems.map((v) => ({
  _id: v.id,
  companyName: v.companyName,
  industry: v.industry,
  personFirstName: v.personFirstName,
  quote: v.quote,
  googleReviewUrl: v.googleReviewUrl,
}));
