/**
 * Poprawki 2026-07-17 (krytyka 13/40): usunięte wymyślone liczby
 * („Średni ROAS 650%", „Obsługa Budżetów 1M+ PLN"), SLA 99.9% → 99.5%/4h
 * (jedyne SLA potwierdzone przez właściciela), stack przycięty do
 * potwierdzonego (out: Docker, Google Cloud), etykiety EN → PL.
 */
export const OFFERS_CONTENT = {
  web: {
    startup: {
      badge: 'Szybki Start & MVP',
      title: 'Strony WWW & E-commerce',
      desc: 'Potrzebujesz szybko zaistnieć w sieci? Tworzymy wydajne strony na WordPress i sklepy, które sprzedają od pierwszego dnia. Idealne rozwiązanie na start, z możliwością późniejszej rozbudowy.',
      features: [
        'Strony Wizytówki (WordPress)',
        'Sklepy WooCommerce',
        'Optymalizacja Szybkości',
        'Podstawowe SEO',
      ],
      stat: { label: 'Czas wdrożenia', value: '2-4 Tygodnie' },
      modules: ['Design UX/UI', 'CMS Setup', 'RWD Mobile', 'SEO Basic'],
    },
    enterprise: {
      badge: 'Skalowalność & Bezpieczeństwo',
      title: 'Dedykowane Systemy & SaaS',
      desc: 'Rozwiązania dla liderów rynku. Projektujemy zaawansowane aplikacje webowe (React/Laravel), headless CMS i systemy B2B, które obsługują tysiące użytkowników jednocześnie przy zachowaniu najwyższego bezpieczeństwa.',
      features: [
        'Aplikacje Webowe (React)',
        'Dedykowane Backend (Laravel)',
        'Architektura Mikroserwisów',
        'Audyty Bezpieczeństwa',
      ],
      stat: { label: 'SLA (umowy utrzymaniowe)', value: '99.5% · reakcja 4h' },
      modules: ['Microservices', 'Cloud AWS', 'Load Balancing', 'Security Audit'],
    },
  },
  marketing: {
    startup: {
      badge: 'Wzrost & Trakcja',
      title: 'Kampanie Generujące Sprzedaż',
      desc: 'Każda złotówka się liczy. Skupiamy się na kanałach o najwyższym zwrocie z inwestycji (ROI). Uruchamiamy precyzyjne kampanie Google Ads i Meta Ads, aby sprowadzić pierwszych płacących klientów.',
      features: [
        'Google Ads (Search)',
        'Facebook Lead Ads',
        'Konfiguracja Analityki',
        'Remarketing',
      ],
      stat: { label: 'Budżety klientów', value: '2–10 tys. zł/mc' },
      widgets: { budget: '2k - 10k', metric: 'Kampanie sprzedażowe' },
    },
    enterprise: {
      badge: 'Dominacja & Wizerunek',
      title: 'Strategie Omnichannel',
      desc: 'Kompleksowe zarządzanie budżetami reklamowymi w wielu kanałach. Zaawansowana segmentacja, automatyzacja marketingu i budowanie świadomości marki (Brand Awareness) na dużą skalę.',
      features: [
        'Strategia 360°',
        'Marketing Automation',
        'Kampanie Wideo (YouTube)',
        'Raportowanie BI',
      ],
      stat: { label: 'Model rozliczeń', value: 'Flat fee / prowizja' },
      widgets: { budget: '50k+', metric: 'Marka i LTV' },
    },
  },
  seo: {
    title: 'Oferta - Web Development, Marketing, Design | Mixture Marketing',
    description:
      'Poznaj pełną ofertę naszej agencji. Specjalizujemy się w web development (strony, sklepy, aplikacje), marketingu cyfrowym (SEO, SEM, Social Media) i brandingu.',
    image: '/assets/images/sygnet.png',
  },
  hero: {
    title: {
      label: 'Technologia',
      highlight: 'dopasowana do skali.',
    },
    subtitle:
      'Niezależnie czy budujesz MVP, czy skalujesz system dla milionów użytkowników – dostarczamy architekturę i marketing adekwatne do Twoich celów.',
    buttons: {
      startup: {
        title: 'Start-Up / MVP',
        subtitle: 'Szybkość & Wzrost',
      },
      enterprise: {
        title: 'Enterprise',
        subtitle: 'Skala & Bezpieczeństwo',
      },
    },
  },
  button: 'Szczegóły Techniczne',
  techStack: [
    'React',
    'Next.js',
    'Astro',
    'TypeScript',
    'Laravel',
    'Node.js',
    'Go',
    'AWS',
    'WordPress',
    'WooCommerce',
    'Figma',
    'Google Ads',
    'GA4',
    'Meta Business',
  ],
  faqs: [
    {
      q: 'Czy po wykonaniu strony będę mógł ją samodzielnie edytować?',
      a: 'Tak. Niezależnie czy wybierzesz WordPress (Startup) czy dedykowany Headless CMS (Enterprise), wdrażamy intuicyjny panel administratora i szkolimy Twój zespół z jego obsługi.',
    },
    {
      q: 'Jak wygląda model rozliczeń w marketingu?',
      a: 'Stawiamy na transparentność. Budżet reklamowy (płatny do Google/Meta) jest oddzielony od naszego wynagrodzenia (prowizja od wydatków lub stała opłata flat fee, zależnie od skali).',
    },
    {
      q: 'Czy podpisujemy umowę o poufności (NDA)?',
      a: 'Oczywiście. Bezpieczeństwo Twoich danych i pomysłów biznesowych to priorytet. Standardowo pracujemy na NDA, szczególnie przy projektach Enterprise.',
    },
    {
      q: 'Co obejmuje darmowa opieka techniczna?',
      a: 'Przez 6 miesięcy po wdrożeniu dbamy o aktualizacje wtyczek, bezpieczeństwo serwera, kopie zapasowe oraz naprawę ewentualnych błędów krytycznych.',
    },
  ],
};
