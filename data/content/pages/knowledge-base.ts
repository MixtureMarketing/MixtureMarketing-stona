/**
 * Treść /baza-wiedzy/ — poprawki 2026-07-17 (krytyka 24/40).
 * Usunięte: badge „Knowledge Hub" (angielski kostium), martwy blok
 * newsletter z wymyślonym „Dołącz do 2,500+ subskrybentów" (nierenderowany,
 * ale czekał w danych na podpięcie — nabity pistolet) i surowym HTML
 * w stringu privacy.
 */
export const KNOWLEDGE_BASE_CONTENT = {
  seo: {
    title: 'Baza Wiedzy | Mixture Marketing',
    description:
      'Praktyczna wiedza z zakresu technologii, marketingu i designu. Poradniki, case studies i analizy, które pomogą Ci rozwijać biznes.',
    image: '/assets/images/sygnet.png',
  },
  header: {
    title: {
      line1: 'Baza wiedzy',
      line2: 'i innowacji.',
    },
    subtitle:
      'Eksperckie artykuły, deep-dive technologiczny i sprawdzone strategie. Dzielimy się tym, co działa w realnych projektach.',
  },
  search: {
    placeholder: 'Szukaj artykułów, technologii, tematów...',
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
    newest: 'Najnowsze publikacje',
    categoryPrefix: 'Kategoria:',
    notFound: {
      title: 'Nic nie znaleziono',
      desc: 'Spróbuj zmienić kategorię lub wpisać inne hasło.',
      button: 'Wyczyść filtry',
    },
  },
  teaser: {
    title: 'Ostatnio w Bazie Wiedzy',
    description:
      'Dzielimy się praktyczną wiedzą z pogranicza technologii i marketingu. Sprawdź nasze najnowsze analizy i poradniki.',
    button: 'Wszystkie artykuły',
  },
};
