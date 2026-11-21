// MIX-1866: dane firmy bez zależności od Vite (bez zmiennych budowy). Używa ich config/site.ts
// (strona) i szablon maili w Cloudflare Functions (functions/api/_shared/emailLayout.ts),
// gdzie zmiennych budowy Vite nie ma.

export const SITE_IDENTITY = {
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
  },
};
