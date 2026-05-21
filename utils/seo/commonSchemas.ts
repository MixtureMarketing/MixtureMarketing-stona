/* eslint-disable max-lines -- schema helpers (Place + OpeningHours + LocalBusiness w jednym pliku) */
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
    // SpeakableSpecification - sygnal dla Google Assistant + AI search (ChatGPT,
    // Perplexity, AI Overviews) ze odpowiedzi FAQ sa cytowalne glosowo.
    // CSS selectors targetuja schema.org Question/Answer w DOM.
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[itemprop="name"]', '[itemprop="acceptedAnswer"]'],
    },
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
    // Place reference dla biura — wymagane przez Google Map Pack.
    // Place ma wlasne @id (#office), do ktorego moga linkowac eventy/oferty.
    location: {
      '@type': 'Place',
      '@id': `${baseUrl}/#office`,
      name: `${SITE_CONFIG.name} — adres rejestrowy Rzeszów`,
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
      hasMap: `https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w`,
      publicAccess: false,
      smokingAllowed: false,
    },
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
    hasMap: `https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w`,
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
