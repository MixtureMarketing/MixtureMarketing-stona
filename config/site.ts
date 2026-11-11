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
    krs: '0001034514',
    regon: '525228202',
    foundingDate: '2023-05-08',
    shareCapital: '5 000 zł',
    registryCourt: 'Sąd Rejonowy w Rzeszowie, XII Wydział Gospodarczy KRS',
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
  /**
   * Wizytówka firmy w Google (MIX-1020). Profil nie ma adresu — tylko obszar działania —
   * więc w JSON-LD zamiast adresu biura wirtualnego idą `areaServed` + te linki.
   * - `profileUrl`: link od Jakuba (przycisk „Zobacz nas w Google”),
   * - `knowledgeGraphUrl`: stały adres profilu (kgmid) do `sameAs` / `hasMap`,
   * - `reviewUrl`: link „Wystaw opinię” z panelu (od Karola). PUSTY = przycisk ukryty.
   */
  google: {
    profileUrl: 'https://share.google/U5QLwlwd3Ls52C3An',
    knowledgeGraphUrl: 'https://www.google.com/search?kgmid=/g/11t_svlzz2',
    reviewUrl: 'https://g.page/r/CTeu70P5NjsgEBM/review',
  },
};
