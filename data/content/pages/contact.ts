import { SITE_CONFIG } from '../../../config/site';

/**
 * Poprawki 2026-07-17 (krytyka 25/40): konsultacja ujednolicona do
 * 45–60 min (decyzja właściciela — /contact twierdził „15-minutowa"
 * wbrew /o-nas); oba „24h" potwierdzone. Usunięte: badge „Start A Project"
 * (hero words-only), martwy blok ctaCard (nierenderowany — obietnice
 * żyły w repo bez strony). Trzy potwierdzone atuty przeniesione do
 * `highlights` (renderowane pod hero).
 */
export const CONTACT_PAGE_CONTENT = {
  seo: {
    title: 'Kontakt | Umów się na Darmową Konsultację',
    description:
      'Skontaktuj się z nami, aby omówić swój projekt. Wypełnij formularz lub zadzwoń. Oferujemy bezpłatną konsultację strategiczną (45–60 min).',
    image: '/assets/images/sygnet.png',
  },
  hero: {
    title: {
      line1: 'Porozmawiajmy o',
      line2: 'Twoim biznesie.',
    },
    description:
      'Masz pytania? Chcesz wycenić projekt? A może po prostu napić się kawy w Rzeszowie? Jesteśmy do Twojej dyspozycji.',
  },
  /** Potwierdzone przez właściciela 2026-07-17 — bez obietnic z powietrza. */
  highlights: [
    { title: 'Szybka wycena', desc: 'Wstępne widełki budżetowe w 24h' },
    { title: 'Bezpłatna konsultacja', desc: '45–60 min rozmowy strategicznej' },
    { title: 'Brak zobowiązań', desc: 'Otrzymujesz ofertę i sam decydujesz' },
  ],
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
      label: 'Adres rejestrowy',
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
