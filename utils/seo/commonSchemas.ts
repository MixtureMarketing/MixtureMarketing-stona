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
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Mixture Marketing',
    image: `${baseUrl}/assets/images/sygnet.png`,
    '@id': baseUrl,
    url: baseUrl,
    telephone: '+48733330335',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ul. Przykładowa 123',
      addressLocality: 'Wrocław',
      postalCode: '50-000',
      addressCountry: 'PL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.107883,
      longitude: 17.038538,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    priceRange: '$$',
  };
};
