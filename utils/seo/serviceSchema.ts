import { ORG_REF } from './organizationSchema';

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
) => {
  if (!service) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.serviceType || title,
    provider: ORG_REF,
    areaServed: service.areaServed
      ? { '@type': 'City', name: service.areaServed }
      : { '@type': 'Country', name: 'Poland' },
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
