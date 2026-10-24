import { SITE_CONFIG } from '../../config/site';

/**
 * JEDNA encja firmy dla całej domeny.
 *
 * Wcześniej na każdej stronie były dwa różne obiekty: `Organization` bez `@id`
 * (App.tsx, nazwa „Mixture Marketing", logo sygnet.png) i `ProfessionalService`
 * `#organization` (Footer.tsx, nazwa „… Sp. z o.o.", logo logo.svg), a `Service.provider`
 * na większości stron był anonimowym `Organization` bez `@id` — Google widział 2–3 firmy.
 *
 * Zasada: encja jest emitowana raz (App.tsx → GlobalSchema), wszystkie inne schemy
 * odwołują się do niej przez `ORG_REF` (`{ '@id': ORG_ID }`).
 */
export const ORG_ID = `${SITE_CONFIG.domain}/#organization`;
export const ORG_LOGO_URL = `${SITE_CONFIG.domain}/assets/images/sygnet.png`;

/** Odwołanie do encji firmy (provider / publisher / worksFor). */
export const ORG_REF = { '@id': ORG_ID } as const;

/** Odwołanie z nazwą — dla `publisher` artykułów (walidatory oczekują `name`). */
export const ORG_PUBLISHER = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_CONFIG.name,
  logo: { '@type': 'ImageObject', url: ORG_LOGO_URL },
} as const;

const MAP_URL =
  'https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w';

export const getOrganizationSchema = () => {
  const { contact, social } = SITE_CONFIG;
  const postalAddress = {
    '@type': 'PostalAddress',
    streetAddress: contact.address.street,
    addressLocality: contact.address.city,
    postalCode: contact.address.postalCode,
    addressCountry: contact.address.countryCode,
  };
  const geo = { '@type': 'GeoCoordinates', latitude: 50.041187, longitude: 21.999116 };

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': ORG_ID,
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.companyName,
    url: `${SITE_CONFIG.domain}/`,
    logo: { '@type': 'ImageObject', url: ORG_LOGO_URL },
    image: ORG_LOGO_URL,
    vatID: contact.vatID,
    foundingDate: contact.foundingDate,
    identifier: [
      { '@type': 'PropertyValue', name: 'KRS', value: contact.krs },
      { '@type': 'PropertyValue', name: 'REGON', value: contact.regon },
      { '@type': 'PropertyValue', name: 'NIP', value: contact.vatID },
    ],
    telephone: contact.phoneFull,
    email: contact.email,
    priceRange: '$$',
    address: postalAddress,
    geo,
    // Adres rejestrowy (model pracy mobilnej — patrz /contact/), nie „biuro".
    location: {
      '@type': 'Place',
      '@id': `${SITE_CONFIG.domain}/#office`,
      name: `${SITE_CONFIG.name} — adres rejestrowy Rzeszów`,
      address: postalAddress,
      geo,
      hasMap: MAP_URL,
    },
    hasMap: MAP_URL,
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contact.phoneFull,
      email: contact.email,
      contactType: 'customer service',
      areaServed: 'PL',
      availableLanguage: ['Polish', 'English'],
    },
    paymentAccepted: 'Przelew bankowy, Faktura VAT',
    currenciesAccepted: 'PLN, EUR, USD',
    sameAs: [social.linkedin, social.facebook, social.instagram, social.tiktok],
  };
};
