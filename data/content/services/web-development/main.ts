import { SITE_CONFIG } from '../../../../config/site';

export const WEB_DEV_CONTENT = {
  seo: {
    title: 'Tworzenie Stron i Aplikacji Webowych | Inżynieria i Wyniki',
    description:
      'Budujemy szybkie, bezpieczne i skalowalne rozwiązania webowe. Od Landing Page po zaawansowane aplikacje B2B. Poznaj nasz stack technologiczny i realizacje.',
    image: '/assets/images/frontend.png',
  },
  hero: {
    badge: 'Software House & Agency',
    title: 'Tworzenie Stron WWW i Systemów Webowych.',
    titleAccent: 'Inżynieria i Wyniki.',
    description:
      "Budujemy szybkie, bezpieczne i skalowalne rozwiązania webowe. Od prostych Landing Page'y pod kampanie, po zaawansowane aplikacje B2B. Technologia dobrana do Twojego celu.",
    ctaPrimary: 'Rozpocznij Projekt',
    ctaSecondary: 'Zobacz Stack Tech',
  },
  offerGrid: {
    title: 'Kompleksowe Usługi Programistyczne',
    subtitle: 'Oferta & Rozwiązania',
    description:
      "Nie budujemy 'stron z szablonu'. Dobieramy stack technologiczny tak, aby od pierwszego dnia wspierał Twoje cele biznesowe i marketingowe.",
  },
  faq: {
    title: 'Najczęstsze pytania',
    subtitle: 'Ekspercka Wiedza',
  },
  wpCustom: {
    badge: 'WordPress Beyond Limits',
    title: 'Dedykowane Wtyczki',
    titleAccent: 'i Rozszerzenia WordPress.',
    description:
      'Gotowe wtyczki spowalniają stronę i nie spełniają Twoich wymagań? Piszemy autorskie rozwiązania w PHP i React, które rozszerzają możliwości Twojego WordPressa bez zbędnego balastu.',
    features: [
      { title: 'Kalkulatory Ofertowe', desc: 'Dynamiczne wyceny usług.' },
      { title: 'Integracje API', desc: 'Połączenie z CRM/ERP zewnętrznym.' },
      { title: 'Custom Post Types', desc: 'Niestandardowe katalogi danych.' },
      { title: 'Bramki Płatności', desc: 'Specyficzne metody płatności.' },
    ],
  },
  adminPanel: {
    badge: 'Intuicyjne Zarządzanie',
    title: 'Panel Administratora',
    titleAccent: 'skrojony pod Twój biznes.',
    description:
      'Twój panel administracyjny powinien pomagać, a nie przeszkadzać. Dostosowujemy narzędzia do rodzaju projektu:',
    sections: [
      {
        title: 'Strony Marketingowe (WordPress Headless)',
        desc: 'Intuicyjna edycja tekstów i zdjęć. Znany interfejs, ale z super-szybkim frontendem w Next.js.',
      },
      {
        title: 'Aplikacje Dedykowane (Custom Admin)',
        desc: 'Panele szyte na miarę. Tabele zamówień, statystyki, zarządzanie użytkownikami (CRUD) i integracje API w jednym miejscu.',
      },
    ],
  },
  projectTypes: [
    {
      title: 'Landing Page High-Conversion',
      subtitle: 'Kampanie Google Ads / Lead Magnet',
      desc: 'Strony sprzedażowe zaprojektowane pod konkretną akcję. Idealne do kampanii Google Ads, gdzie liczy się każdy ułamek sekundy i czytelne CTA.',
      techs: ['React', 'A/B Testing', 'GTM Layer'],
      kpi: 'Conversion Rate Up',
      path: '/web-development/landing-page/',
      highlight: false,
    },
    {
      title: 'Serwisy Firmowe Premium',
      subtitle: 'Wizerunek B2B & Architektura Informacji',
      desc: 'Nowoczesne portale korporacyjne budujące zaufanie kontrahentów. Skalowalne, wielojęzyczne i zintegrowane z Twoim ekosystemem biznesowym.',
      techs: ['Next.js 14', 'WordPress Headless', 'SSR'],
      kpi: 'Brand Authority',
      path: '/web-development/corporate/',
      highlight: true,
    },
    {
      title: 'E-commerce & Skalowanie',
      subtitle: 'WooCommerce & Custom Solutions',
      desc: 'Wydajne sklepy internetowe zintegrowane z Baselinker, ERP i płatnościami. Automatyzujemy procesy, byś mógł skupić się na wzroście.',
      techs: ['WooCommerce', 'Redis', 'ElasticSearch'],
      kpi: 'ROAS Booster',
      path: '/web-development/ecommerce/',
      highlight: true,
    },
    {
      title: 'Dedykowane Systemy Web',
      subtitle: 'Aplikacje B2B / SaaS / CRM',
      desc: 'Oprogramowanie szyte na miarę: systemy rezerwacji, panele klienta, platformy e-learningowe. Rozwiązujemy Twoje unikalne problemy biznesowe.',
      techs: ['Laravel / Node', 'PostgreSQL', 'Docker'],
      kpi: 'Process Efficiency',
      path: '/web-development/custom-app/',
      highlight: false,
    },
  ],
  integrations: {
    title: 'Ekosystem, nie samotna wyspa',
    description:
      'Twoja strona musi rozmawiać z resztą biznesu. Łączymy systemy w jeden spójny organizm.',
    categories: [
      {
        name: 'Płatności & Finanse',
        color: '#3F3D91',
        tools: ['Stripe', 'PayU', 'Przelewy24', 'PayPal'],
      },
      {
        name: 'Marketing & CRM',
        color: '#E1306C',
        tools: ['HubSpot', 'Salesmanago', 'Mailchimp', 'GA4'],
      },
      {
        name: 'ERP & Magazyn',
        color: '#00C853',
        tools: ['Subiekt GT', 'Comarch', 'Baselinker', 'SAP'],
      },
      {
        name: 'Kurierzy & Logistyka',
        color: '#F4B400',
        tools: ['InPost', 'DHL', 'DPD', 'Furgonetka'],
      },
    ],
  },
  comparison: {
    title: 'Specyfikacja Techniczna',
    subtitle: 'Porównanie Standardów',
    description:
      'Tania strona to często dług techniczny na start. Zobacz różnicę w kodzie, wydajności i bezpieczeństwie.',
    data: [
      {
        label: 'Szybkość ładowania (LCP)',
        bad: '3.5s - 5s',
        good: '0.4s - 0.8s',
        desc: 'Czas do pełnej interaktywności',
      },
      {
        label: 'Architektura (SEO)',
        bad: 'Chaotyczna',
        good: 'Semantic HTML5',
        desc: 'Czytelność dla robotów Google',
      },
      {
        label: 'Bezpieczeństwo',
        bad: 'Podstawowe',
        good: 'WAF + Daily Backup',
        desc: 'Ochrona przed atakami i utratą danych',
      },
      {
        label: 'Zarządzanie treścią',
        bad: 'Skomplikowane',
        good: 'Headless CMS',
        desc: 'Łatwość edycji bez psucia układu',
      },
      {
        label: 'Wsparcie techniczne',
        bad: 'Brak / Płatne',
        good: '6 msc SLA w cenie',
        desc: 'Gwarancja stabilności po wdrożeniu',
      },
    ],
  },
  faqs: [
    {
      q: 'Czy tworzenie stron www pod SEO naprawdę ma znaczenie?',
      a: "Tak. Google nie widzi obrazków, widzi kod. Jeśli kod jest 'brudny' (bloatware) lub strona wolno się ładuje, Twoje pozycje będą niskie, nawet jeśli masz świetne teksty. My budujemy semantyczny fundament (Schema.org), który Google kocha od pierwszej sekundy.",
    },
    {
      q: 'Jaki stos technologiczny (Tech Stack) stosujecie?',
      a: 'Wybieramy technologię pod cel biznesowy. Dla szybkich stron wizerunkowych: Next.js i React. Dla e-commerce: zoptymalizowany WooCommerce lub Headless Shopify. Dla aplikacji: Laravel i Node.js. Nie używamy gotowych, ociężałych szablonów.',
    },
    {
      q: 'Czy po wdrożeniu będę mógł sam edytować stronę?',
      a: 'Bezwzględnie tak. Wdrażamy dedykowane panele administracyjne lub Headless CMS (np. WordPress jako backend), które są intuicyjne i pozwalają na edycję bez ingerencji w kod.',
    },
  ],
  infrastructure: {
    badge: 'Enterprise Grade Security',
    title: 'Bezpieczeństwo',
    titleAccent: 'wpisane w kod.',
    description:
      'Nie polegamy na wtyczkach "security". Zabezpieczamy infrastrukturę na poziomie serwera i aplikacji. Codzienne backupy, ochrona przed DDoS i szyfrowanie SSL to u nas standard.',
    stats: [
      { label: 'Uptime SLA', val: '99.9%' },
      { label: 'Backup', val: 'Daily' },
      { label: 'SSL', val: '256-bit' },
      { label: 'Protection', val: 'WAF' },
    ],
  },
  ctaSection: {
    title: 'Gotowy na cyfrową',
    titleAccent: 'dominację technologiczną?',
    description:
      'Nie kupuj strony, zainwestuj w narzędzie, które będzie na siebie zarabiać. Umów się na 15-minutowy call strategiczny, podczas którego przeanalizujemy Twoje potrzeby i zaproponujemy optymalne rozwiązania.',
    buttonText: 'Umów Konsultację',
    phone: SITE_CONFIG.contact.phone,
  },
};
