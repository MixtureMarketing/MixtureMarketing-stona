export const getSiteNavigationSchema = (baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SiteNavigationElement',
        '@id': '#primary-navigation',
        name: 'Oferta Agencji',
        url: `${baseUrl}/offers`,
      },
      {
        '@type': 'SiteNavigationElement',
        '@id': '#primary-navigation',
        name: 'Marketing SEO/Ads',
        url: `${baseUrl}/marketing`,
      },
      {
        '@type': 'SiteNavigationElement',
        '@id': '#primary-navigation',
        name: 'Tworzenie Stron WWW',
        url: `${baseUrl}/web-development`,
      },
      {
        '@type': 'SiteNavigationElement',
        '@id': '#primary-navigation',
        name: 'Baza Wiedzy',
        url: `${baseUrl}/baza-wiedzy`,
      },
      {
        '@type': 'SiteNavigationElement',
        '@id': '#primary-navigation',
        name: 'Kontakt',
        url: `${baseUrl}/contact`,
      },
    ],
  };
};
