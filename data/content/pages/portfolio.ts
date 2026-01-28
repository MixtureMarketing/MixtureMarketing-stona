/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SITE_CONFIG } from '../../../config/site';

export const PORTFOLIO_CONTENT = {
  seo: {
    title: 'Portfolio | Realizacje i Case Studies',
    description:
      'Zobacz nasze wybrane realizacje. Tworzymy strony internetowe, sklepy e-commerce i kampanie marketingowe, które przynoszą realne wyniki biznesowe.',
    image: '/assets/images/sygnet.png',
  },
  hero: {
    badge: 'Case Studies',
    title: 'Wybrane Realizacje',
    description:
      'Nie chwalimy się ""ładnymi obrazkami"". Pokazujemy projekty, które przyniosły naszym klientom realny zwrot z inwestycji.',
  },
  filters: [
    { id: 'all', label: 'Wszystkie' },
    { id: 'dev', label: 'Web Dev' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'design', label: 'Design' },
  ],
  projects: [
    {
      title: 'Modern Fashion Store',
      category: 'E-Commerce',
      type: 'ecommerce',
      description:
        'Skalowalny sklep internetowy z integracją płatności. Migracja z SaaS na WooCommerce.',
      altText:
        'Zdjęcie przedstawiające projekt sklepu e-commerce dla marki odzieżowej Modern Fashion Store',
      image: '/assets/images/portfolio-fashion.webp',
      metric: '+45%',
      metricLabel: 'Wzrost Sprzedaży',
      metricIcon: 'TrendingUp',
    },
    {
      title: 'Logistics CRM',
      category: 'Web App / SaaS',
      type: 'dev',
      description: 'Dedykowany system zarządzania flotą i zamówieniami dla firmy transportowej.',
      altText:
        'Zrzut ekranu z aplikacji CRM do zarządzania logistyką, pokazujący mapę i listę zadań.',
      image: '/assets/images/portfolio-crm.webp',
      metric: '-20h',
      metricLabel: 'Oszczędność czasu/tydz.',
      metricIcon: 'Clock',
    },
    {
      title: 'Green Energy Rebranding',
      category: 'Branding & Web',
      type: 'design',
      description: 'Kompletny rebranding i strona wizerunkowa dla lidera branży OZE.',
      altText:
        'Strona internetowa firmy z branży OZE po rebrandingu, z zielonymi akcentami i nowoczesnym designem.',
      image: '/assets/images/portfolio-energy.webp',
      metric: '300+',
      metricLabel: 'Leadów miesięcznie',
      metricIcon: 'Users',
    },
  ],
  card: {
    businessResult: 'Wynik biznesowy',
    details: 'Szczegóły',
  },
  cta: {
    button: 'Zobacz wszystkie case studies',
  },
};
