import { SITE_CONFIG } from '../../../config/site';

export const KNOWLEDGE_BASE_CONTENT = {
  seo: {
    title: 'Baza Wiedzy | Mixture Marketing',
    description:
      'Praktyczna wiedza z zakresu technologii, marketingu i designu. Poradniki, case studies i analizy, które pomogą Ci rozwijać biznes.',
    image: '/assets/images/sygnet.png',
  },
  header: {
    badge: 'Knowledge Hub',
    title: {
      line1: 'Baza Wiedzy',
      line2: 'i Innowacji.',
    },
    subtitle:
      'Eksperckie artykuły, deep-dive technologiczny i sprawdzone strategie. Dzielimy się tym, co działa w realnych projektach.',
  },
  search: {
    placeholder: 'Szukaj artykułów, technologii, tematów...',
    button: 'Szukaj',
  },
  categories: [
    { id: 'all', label: 'Wszystkie' },
    { id: 'tech', label: 'Technologia & Dev' },
    { id: 'marketing', label: 'Marketing Cyfrowy' },
    { id: 'design', label: 'Design & UX' },
    { id: 'analytics', label: 'Analityka & Dane' },
    { id: 'business', label: 'Biznes & Strategia' },
  ],
  grid: {
    newest: 'Najnowsze Publikacje',
    categoryPrefix: 'Kategoria:',
    notFound: {
      title: 'Nic nie znaleziono',
      desc: 'Spróbuj zmienić kategorię lub wpisać inne hasło.',
      button: 'Wyczyść filtry',
    },
  },
  newsletter: {
    title: 'Wiedza prosto na maila',
    desc: 'Dołącz do 2,500+ subskrybentów. Zero spamu, same konkrety o technologii i marketingu.',
    placeholder: 'Twój adres e-mail',
    button: 'Zapisz się',
    privacy:
      'Zapisując się akceptujesz naszą <a href="/privacy-policy/" class="underline hover:text-white">Politykę Prywatności</a>.',
  },
  teaser: {
    title: 'Ostatnio w Bazie Wiedzy',
    description:
      'Dzielimy się praktyczną wiedzą z pogranicza technologii i marketingu. Sprawdź nasze najnowsze analizy i poradniki.',
    button: 'Wszystkie Artykuły',
  },
};
