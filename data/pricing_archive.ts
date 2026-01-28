// Backup of all hardcoded pricing data extracted from content.ts
// Use this reference to populate Sanity CMS

export const PRICING_ARCHIVE = {
  // Web Development (Already migrated but good to keep)
  'landing-page': {
    title: 'Inwestycja w Wynik',
    description:
      'Cena obejmuje design, kodowanie, podpięcie domeny, certyfikat SSL i pełną konfigurację analityczną.',
    tiers: [
      {
        title: 'Campaign Ready',
        subtitle: 'Szybka Kampania / MVP',
        price: '2 500',
        desc: 'Idealny pod Google Ads. Szybki start, sprawdzona struktura, pełna analityka. Czas realizacji: 5 dni.',
        features: [
          'Projekt graficzny UX/UI',
          'Kodowanie (Next.js / HTML)',
          'Konfiguracja GA4 i Pixela',
          'Formularz zgodny z RODO',
          'Szybkość < 1s (Green Score)',
        ],
      },
      {
        title: 'High Performance',
        subtitle: 'Dedykowany Design & A/B',
        price: '4 000',
        desc: 'Dla marek, które chcą dominować. Unikalny design, zaawansowane animacje i warianty do testów A/B.',
        features: [
          'Zaawansowany Copywriting',
          'Integracje (CRM, Mailer)',
          'Sekcje interaktywne (Kalkulatory)',
          '2 warianty nagłówka (Testy A/B)',
          'Heatmapy w cenie (1 msc)',
        ],
        highlight: true,
      },
      {
        title: 'Multi-Landing System',
        subtitle: 'Skalowanie (Agencje/SaaS)',
        price: 'Wycena',
        desc: 'System szablonów dla wielu produktów lub landingi dynamiczne (D-SKAG) dopasowane do zapytań w Google.',
        features: [
          'Design System (biblioteka sekcji)',
          'Dynamic Content Replacement',
          'CMS do zarządzania treścią',
          'Zaawansowana analityka lejkowa',
          'Stała optymalizacja konwersji',
        ],
      },
    ],
  },
  'corporate-website': {
    title: 'Inwestycja w Wizerunek',
    description:
      "Poniższe pakiety to kompleksowe wdrożenia 'pod klucz'. Od projektu, przez kodowanie, aż po uzupełnienie treści.",
    tiers: [
      {
        title: 'Business Card',
        subtitle: 'Mała Firma / Start',
        price: '4 500',
        desc: 'Profesjonalna wizytówka w sieci. Buduje wiarygodność i ułatwia kontakt klientom. Idealna dla firm usługowych i lokalnych biznesów.',
        features: [
          'Indywidualny projekt graficzny',
          'Do 5 podstron (Oferta, O nas, Kontakt)',
          'Panel CMS (Samodzielna edycja)',
          'Formularz kontaktowy + Mapa Google',
          'Podstawowe SEO i optymalizacja',
        ],
      },
      {
        title: 'Corporate Pro',
        subtitle: 'Rozwój & Wizerunek',
        price: '8 000',
        desc: 'Rozbudowany serwis wizerunkowy. Zawiera bloga, portfolio, sekcję kariery i zaawansowane funkcje prezentacji oferty.',
        features: [
          'Do 10 unikalnych widoków',
          'Blog firmowy / Aktualności',
          'Sekcja Portfolio / Case Studies',
          'Integracja z Social Media & Newsletter',
          'Wersja dwujęzyczna (PL/EN)',
        ],
        highlight: true,
      },
      {
        title: 'Enterprise Portal',
        subtitle: 'Korporacja / Instytucja',
        price: 'Wycena',
        desc: 'Dedykowany portal korporacyjny z intranetem, strefą klienta lub zaawansowanymi integracjami (HR, CRM).',
        features: [
          'Nieograniczona liczba podstron',
          'Strefa Logowania (B2B / Pracownik)',
          'Integracje API (CRM, ERP)',
          'Advanced Search & Filtering',
          'SLA i audyty bezpieczeństwa',
        ],
      },
    ],
  },
  ecommerce: {
    title: 'Inwestycja w E-commerce',
    description: 'Sklep to nie wydatek, to maszyna do zarabiania. Oto nasze pakiety wdrożeniowe.',
    tiers: [
      {
        title: 'WooCommerce Start',
        subtitle: 'Dla małych i średnich',
        price: '6 000',
        desc: 'Kompletny sklep na własność. Bez abonamentu. Idealny do sprzedaży do 5000 produktów. Łatwa edycja i niskie koszty utrzymania.',
        features: [
          'Indywidualny projekt graficzny (UX/UI)',
          'Integracja Płatności i Kurierów',
          'Import produktów z XML/CSV',
          'Podstawowe optymalizacja SEO',
          'Szkolenie z obsługi panelu',
        ],
        highlight: false,
      },
      {
        title: 'E-commerce Pro',
        subtitle: 'Skalowalny Biznes',
        price: '12 000',
        desc: 'Zaawansowane wdrożenie nastawione na automatyzację. Integracje z hurtowniami (Dropshipping), marketing automation i Allegro.',
        features: [
          'Integracja Baselinker (Allegro/Amazon)',
          'Zaawansowane filtrowanie (ElasticSearch)',
          'Odzyskiwanie porzuconych koszyków',
          'Wielowalutowość i wielojęzyczność',
          'Optymalizacja Core Web Vitals (Speed)',
        ],
        highlight: true,
      },
      {
        title: 'B2B / Headless',
        subtitle: 'Hurtownie i Korporacje',
        price: 'Wycena',
        desc: 'Dedykowana platforma dla sprzedaży hurtowej lub sklep oparty o architekturę Headless (React/Next.js) dla maksymalnej wydajności.',
        features: [
          'Cenniki indywidualne i grupy rabatowe',
          'Integracja z ERP (Subiekt/Comarch/SAP)',
          'Kredyt kupiecki i faktury terminowe',
          'Frontend PWA (Aplikacja)',
          'Dedykowane API i Mikroserwisów',
        ],
        highlight: false,
      },
    ],
  },
  'custom-web-app': {
    title: 'Modele Współpracy',
    description:
      'Elastyczność to podstawa. Wybierz model, który najlepiej pasuje do Twojego budżetu i etapu rozwoju projektu.',
    tiers: [
      {
        title: 'Fixed Price',
        subtitle: 'Zamknięty Projekt',
        price: 'Wycena',
        desc: 'Idealny, gdy masz precyzyjną specyfikację i zamknięty zakres prac. Wiesz dokładnie, ile zapłacisz i kiedy otrzymasz produkt.',
        features: [
          'Szczegółowa specyfikacja (Scope)',
          'Gwarancja budżetu',
          'Harmonogram kamieni milowych',
          '12 msc gwarancji na kod',
        ],
      },
      {
        title: 'Time & Material',
        subtitle: 'Agile / Rozwój',
        price: 'Stawka / h',
        desc: 'Elastyczność. Płacisz za realnie przepracowany czas zespołu. Idealne dla startupów i projektów, które ewoluują w trakcie tworzenia.',
        features: [
          'Pełna elastyczność zmian',
          "Start prac 'od zaraz'",
          'Raportowanie co do minuty',
          'Możliwość skalowania zespołu',
        ],
        highlight: true,
      },
      {
        title: 'Team Extension',
        subtitle: 'Wsparcie IT',
        price: 'B2B / etat',
        desc: 'Brakuje Ci rąk do pracy? Wynajmij naszych senior developerów (React/Node/Python) do swojego wewnętrznego zespołu.',
        features: [
          'Developerzy Mid/Senior',
          'Wsparcie CTO',
          'Brak kosztów rekrutacji',
          'Transfer wiedzy (Know-how)',
        ],
      },
    ],
  },
  'premium-websites': {
    title: 'Inwestycja w Wizerunek',
    description:
      "Poniższe pakiety to kompleksowe wdrożenia 'pod klucz'. Od projektu, przez kodowanie, aż po uzupełnienie treści.",
    tiers: [
      {
        title: 'Business Card',
        subtitle: 'Mała Firma / Start',
        price: '4 500',
        desc: 'Profesjonalna wizytówka w sieci. Buduje wiarygodność i ułatwia kontakt klientom. Idealna dla firm usługowych i lokalnych biznesów.',
        features: [
          'Indywidualny projekt graficzny',
          'Do 5 podstron (Oferta, O nas, Kontakt)',
          'Panel CMS (Samodzielna edycja)',
          'Formularz kontaktowy + Mapa Google',
          'Podstawowe SEO i optymalizacja',
        ],
      },
      {
        title: 'Corporate Pro',
        subtitle: 'Rozwój & Wizerunek',
        price: '8 000',
        desc: 'Rozbudowany serwis wizerunkowy. Zawiera bloga, portfolio, sekcję kariery i zaawansowane funkcje prezentacji oferty.',
        features: [
          'Do 10 unikalnych widoków',
          'Blog firmowy / Aktualności',
          'Sekcja Portfolio / Case Studies',
          'Integracja z Social Media & Newsletter',
          'Wersja dwujęzyczna (PL/EN)',
        ],
        highlight: true,
      },
      {
        title: 'Enterprise Portal',
        subtitle: 'Korporacja / Instytucja',
        price: 'Wycena',
        desc: 'Dedykowany portal korporacyjny z intranetem, strefą klienta lub zaawansowanymi integracjami (HR, CRM).',
        features: [
          'Nieograniczona liczba podstron',
          'Strefa Logowania (B2B / Pracownik)',
          'Integracje API (CRM, ERP)',
          'Advanced Search & Filtering',
          'SLA i audyty bezpieczeństwa',
        ],
      },
    ],
  },

  // Marketing
  'google-ads': {
    title: 'Przejrzyste Warunki',
    description:
      'Rozdzielamy budżet reklamowy (dla Google) od naszego wynagrodzenia. Wiesz dokładnie, za co płacisz.',
    tiers: [
      {
        title: 'Start',
        subtitle: 'Budżet mediowy do 3k PLN',
        price: '1 500',
        feeLabel: 'Opłata miesięczna (Fee)',
        features: ['Kampanie w Wyszukiwarce', 'Konfiguracja GA4 w cenie', 'Raport miesięczny PDF'],
        cta: 'Wybieram Start',
      },
      {
        title: 'Scale',
        subtitle: 'Budżet mediowy do 10k PLN',
        price: '2 500',
        feeLabel: 'Opłata miesięczna (Fee)',
        features: [
          'Search + Remarketing + GDN',
          'Kampanie Produktowe (PLA)',
          'Raporty Live (Looker Studio)',
          'Konsultacje strategiczne',
        ],
        cta: 'Wybieram Scale',
        highlight: true,
      },
      {
        title: 'Enterprise',
        subtitle: 'Budżet 10k+ PLN',
        price: '% Fee',
        priceSub: 'od wydatków',
        feeLabel: 'Indywidualna negocjacja',
        features: [
          'Pełen ekosystem (YouTube, Discovery)',
          'Zaawansowane skrypty (Ads Scripts)',
          'Audyt UX Landing Page',
          'Dedykowany opiekun',
        ],
        cta: 'Zapytaj o Ofertę',
      },
    ],
  },
  'meta-ads': {
    title: 'Pakiety Wdrożeniowe',
    description:
      'Poniższe kwoty to nasze wynagrodzenie (Fee) za obsługę kampanii. Budżet mediowy ustalasz oddzielnie i płacisz go bezpośrednio do Mety.',
    tiers: [
      {
        title: 'Start',
        subtitle: 'Budżet do 3k PLN',
        price: '1 500',
        features: ['Facebook & Instagram Feed', 'Konfiguracja Piksela', 'Raport miesięczny PDF'],
        cta: 'Wybieram Start',
      },
      {
        title: 'Growth',
        subtitle: 'Budżet do 10k PLN',
        price: '2 500',
        features: [
          'Kampanie Reels & Stories',
          'Dynamiczny Remarketing',
          'Konfiguracja CAPI (Server-Side)',
          'Raporty Live (Looker Studio)',
        ],
        cta: 'Wybieram Growth',
        highlight: true,
      },
      {
        title: 'Enterprise',
        subtitle: 'Budżet 10k+ PLN',
        price: '% Fee',
        priceSub: 'od wydatków',
        features: [
          'Pełen ekosystem (Messenger, Lead Ads)',
          'Tworzenie wideo (UGC)',
          'Dedykowany opiekun',
          'Strategia cross-channel (TikTok/LinkedIn)',
        ],
        cta: 'Zapytaj o Ofertę',
      },
    ],
  },
  seo: {
    title: 'Pakiety SEO',
    description:
      'Przejrzyste zasady. Żadnych ukrytych kosztów. Wybierz tempo wzrostu, które pasuje do Twojego budżetu.',
    tiers: [
      {
        title: 'Lokalne SEO',
        subtitle: 'Dla małych firm',
        price: '1 200',
        features: [
          'Wizytówka Google Maps',
          'Optymalizacja Strony Głównej',
          '2 artykuły blogowe / msc',
          'Raportowanie pozycji',
        ],
      },
      {
        title: 'National SEO',
        subtitle: 'E-commerce / Usługi PL',
        price: '2 500',
        features: [
          'Pełny Audyt Techniczny',
          'Link Building (Autorytet)',
          '4 rozbudowane artykuły / msc',
          'Optymalizacja konwersji (CRO)',
        ],
        highlight: true,
      },
      {
        title: 'Authority',
        subtitle: 'Liderzy Rynku',
        price: 'Wycena',
        priceSub: 'indywidualna',
        features: [
          'Dominacja w Topical Authority',
          'Dedykowany Content Plan',
          'Publikacje w mediach (PR)',
          'Raportowanie Data Studio',
        ],
      },
    ],
  },
  'marketing-main': {
    title: 'Przejrzyste Warunki',
    description:
      'Rozdzielamy budżet reklamowy (dla Google) od naszego wynagrodzenia. Wiesz dokładnie, za co płacisz.',
    tiers: [
      {
        title: 'Start',
        subtitle: 'Budżet mediowy do 3k PLN',
        price: '1 500',
        feeLabel: 'Opłata miesięczna (Fee)',
        features: ['Kampanie w Wyszukiwarce', 'Konfiguracja GA4 w cenie', 'Raport miesięczny PDF'],
        cta: 'Wybieram Start',
      },
      {
        title: 'Scale',
        subtitle: 'Budżet mediowy do 10k PLN',
        price: '2 500',
        feeLabel: 'Opłata miesięczna (Fee)',
        features: [
          'Search + Remarketing + GDN',
          'Kampanie Produktowe (PLA)',
          'Raporty Live (Looker Studio)',
          'Konsultacje strategiczne',
        ],
        cta: 'Wybieram Scale',
        highlight: true,
      },
      {
        title: 'Enterprise',
        subtitle: 'Budżet 10k+ PLN',
        price: '% Fee',
        priceSub: 'od wydatków',
        feeLabel: 'Indywidualna negocjacja',
        features: [
          'Pełen ekosystem (YouTube, Discovery)',
          'Zaawansowane skrypty (Ads Scripts)',
          'Audyt UX Landing Page',
          'Dedykowany opiekun',
        ],
        cta: 'Zapytaj o Ofertę',
      },
    ],
  },
  // Design (Only Landing Page has defined pricing tiers in content.ts)
  // Others like UI/UX or Branding are usually custom quoted or didn't have a table in content.ts
};
