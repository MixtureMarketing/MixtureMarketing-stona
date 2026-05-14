import { SITE_CONFIG } from '../../config/site';

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
      item: crumb.item.startsWith('http') ? crumb.item : `${baseUrl}${crumb.item}`,
    })),
  };
};

export const getFaqSchema = (faq: { question: string; answer: string }[] | undefined) => {
  if (!faq || faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
};

export const getLocalBusinessSchema = (baseUrl: string) => {
  const { address, phoneFull, email } = SITE_CONFIG.contact;
  const socialLinks = Object.values(SITE_CONFIG.social);

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_CONFIG.name,
    image: `${baseUrl}/assets/images/sygnet.png`,
    '@id': `${baseUrl}/#organization`,
    url: baseUrl,
    telephone: phoneFull,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      postalCode: address.postalCode,
      addressCountry: address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.041187,
      longitude: 21.999116,
    },
    areaServed: [
      { '@type': 'Country', name: 'Polska' },
      { '@type': 'City', name: 'Rzeszów' },
      { '@type': 'AdministrativeArea', name: 'Podkarpackie' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    priceRange: '$$',
    sameAs: socialLinks,
    legalName: SITE_CONFIG.companyName,
    vatID: SITE_CONFIG.contact.vatID,
  };
};
