/**
 * Global site configuration.
 * Centralizing these values makes it easier to update contact info, social links, and other global metadata.
 */

export const SITE_CONFIG = {
  name: 'Mixture Marketing',
  companyName: 'Mixture Marketing Sp. z o.o.',
  domain: 'https://mixturemarketing.pl',
  contact: {
    email: 'info@mixturemarketing.pl',
    phone: '+48 794 443 551',
    phoneFull: '+48794443551',
    address: {
      street: 'Al. Józefa Piłsudskiego 17 / 4',
      city: 'Rzeszów',
      postalCode: '35-074',
      country: 'Polska',
      countryCode: 'PL',
    },
    vatID: 'PL5170435774',
    // Cloudflare Turnstile Site Key. Publiczny - przeznaczony do osadzenia
    // w kodzie frontend. Secret key trzymany jest jako env var TURNSTILE_SECRET
    // na serwerze PHP (weryfikacja w public/api/contact_submit.php).
    turnstileSiteKey: '0x4AAAAAACYHLgkgk3FJUj06',
  },
  social: {
    facebook: 'https://www.facebook.com/MixtureMarketing',
    instagram: 'https://www.instagram.com/mixture_marketing/',
    linkedin: 'https://pl.linkedin.com/company/mixture-marketing',
    tiktok: 'https://www.tiktok.com/@mixturemarketing',
  },
};
