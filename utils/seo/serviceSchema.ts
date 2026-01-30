interface ServiceSchemaProps {
  name: string;
  description: string;
  areaServed?: string;
  serviceType?: string;
  offers?: { price: string; currency: string; name: string }[];
}

export const getServiceSchema = (
  service: ServiceSchemaProps | undefined,
  title: string,
  description: string,
  baseUrl: string,
) => {
  if (!service) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.serviceType || title,
    provider: {
      '@type': 'Organization',
      name: 'Mixture Marketing',
      url: baseUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: service.areaServed || 'Poland',
    },
    hasOfferCatalog: service.offers
      ? {
          '@type': 'OfferCatalog',
          name: 'Cennik Usług',
          itemListElement: service.offers.map((offer) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: offer.name,
            },
            price: offer.price,
            priceCurrency: offer.currency || 'PLN',
          })),
        }
      : undefined,
    description: service.description || description,
    name: service.name || title,
  };
};
