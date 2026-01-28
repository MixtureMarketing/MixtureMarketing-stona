import { SITE_CONFIG } from '../../../config/site';

export const CONTACT_PAGE_CONTENT = {
  seo: {
    title: 'Kontakt | Umów się na Darmową Konsultację',
    description:
      'Skontaktuj się z nami, aby omówić swój projekt. Wypełnij formularz lub zadzwoń. Oferujemy darmową, 15-minutową konsultację strategiczną.',
    image: '/assets/images/sygnet.png',
  },
  hero: {
    badge: 'Start A Project',
    title: {
      line1: 'Porozmawiajmy o',
      line2: 'Twoim Biznesie.',
    },
    description:
      'Masz pytania? Chcesz wycenić projekt? A może po prostu napić się kawy w Rzeszowie? Jesteśmy do Twojej dyspozycji.',
  },
  ctaCard: {
    title: 'Gotowy na start?',
    description:
      'Nie marnuj czasu na skomplikowane maile. Wypełnij nasz interaktywny brief, a my wrócimy do Ciebie z konkretną wyceną i planem działania.',
    features: [
      {
        icon: 'Zap',
        title: 'Szybka Wycena',
        desc: 'Wstępne widełki budżetowe w 24h',
      },
      {
        icon: 'Clock',
        title: 'Darmowa Konsultacja',
        desc: '15 min rozmowy strategicznej gratis',
      },
      {
        icon: 'ShieldCheck',
        title: 'Brak Zobowiązań',
        desc: 'Otrzymujesz ofertę i sam decydujesz',
      },
    ],
    button: 'Wypełnij Brief Online',
    microCopy: 'Zajmie to mniej niż 2 minuty.',
  },
  contactMethods: {
    phone: {
      label: 'Zadzwoń do nas',
      sub: 'Pon - Pt, 9:00 - 17:00',
    },
    email: {
      label: 'Napisz wiadomość',
      sub: 'Odpowiadamy w 24h',
    },
    office: {
      label: 'Odwiedź nas',
    },
  },
  invoiceData: {
    title: 'Dane Rejestrowe',
    companyName: SITE_CONFIG.companyName,
    address: {
      street: SITE_CONFIG.contact.address.street,
      city: `${SITE_CONFIG.contact.address.postalCode} ${SITE_CONFIG.contact.address.city}, ${SITE_CONFIG.contact.address.country}`,
    },
    nipLabel: 'NIP (Tax ID)',
    nip: SITE_CONFIG.contact.vatID.replace('PL', ''),
  },
};
