import { SITE_CONFIG } from '../../config/site';
import { withTrailingSlash } from '../url';

export const getBreadcrumbsSchema = (
  breadcrumbs: { name: string; item: string }[] | undefined,
  baseUrl: string,
) => {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      // Zawsze ze slashem — zgodnie z canonicalami (wersja bez slasha to 308 na CF Pages).
      item: withTrailingSlash(
        crumb.item.startsWith('http') ? crumb.item : `${baseUrl}${crumb.item}`,
      ),
    })),
  };
};

export interface FaqSchemaItem {
  question: string;
  answer: string;
}

// SpeakableSpecification - sygnal dla Google Assistant + AI search (ChatGPT,
// Perplexity, AI Overviews) ze odpowiedzi FAQ sa cytowalne glosowo.
// CSS selectors targetuja schema.org Question/Answer w DOM.
const DEFAULT_FAQ_SPEAKABLE = ['[itemprop="name"]', '[itemprop="acceptedAnswer"]'];

/** Schema FAQPage dla niepustej listy pytań. `speakable: null` — bez SpeakableSpecification. */
export const buildFaqSchema = (
  faq: readonly FaqSchemaItem[],
  { speakable = DEFAULT_FAQ_SPEAKABLE }: { speakable?: readonly string[] | null } = {},
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  ...(speakable && {
    speakable: { '@type': 'SpeakableSpecification', cssSelector: [...speakable] },
  }),
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

export const getFaqSchema = (
  faq: readonly FaqSchemaItem[] | undefined,
  options?: { speakable?: readonly string[] | null },
) => (!faq || faq.length === 0 ? null : buildFaqSchema(faq, options));

export const getLocalBusinessSchema = (baseUrl: string) => {
  const { phoneFull, email } = SITE_CONFIG.contact;
  // MIX-1020: bez adresu biura wirtualnego — profil Google (kgmid) + areaServed.
  const socialLinks = [...Object.values(SITE_CONFIG.social), SITE_CONFIG.google.knowledgeGraphUrl];

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_CONFIG.name,
    image: `${baseUrl}/assets/images/sygnet.png`,
    '@id': `${baseUrl}/#organization`,
    url: baseUrl,
    telephone: phoneFull,
    email,
    areaServed: [
      { '@type': 'Country', name: 'Polska' },
      { '@type': 'City', name: 'Rzeszów' },
      { '@type': 'AdministrativeArea', name: 'Podkarpackie' },
      { '@type': 'City', name: 'Mielec' },
      { '@type': 'City', name: 'Stalowa Wola' },
      { '@type': 'City', name: 'Krosno' },
      { '@type': 'City', name: 'Przemyśl' },
      { '@type': 'City', name: 'Dębica' },
      { '@type': 'City', name: 'Jasło' },
    ],
    hasMap: SITE_CONFIG.google.knowledgeGraphUrl,
    // OpeningHoursSpecification - per-day pelna granularnosc dla Google
    // (single object z dayOfWeek[] dziala, ale array z osobnymi entry to
    // bardziej kanoniczna forma akceptowana przez Map Pack).
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
        validFrom: '2024-01-01',
        validThrough: '2030-12-31',
      },
    ],
    priceRange: '$$',
    paymentAccepted: 'Przelew bankowy, Faktura VAT',
    currenciesAccepted: 'PLN, EUR, USD',
    sameAs: socialLinks,
    legalName: SITE_CONFIG.companyName,
    vatID: SITE_CONFIG.contact.vatID,
  };
};
