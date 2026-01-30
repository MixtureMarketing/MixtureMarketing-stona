export const ANALYTICS_CONTENT = {
  seo: {
    title: 'Analityka Webowa i Wdrożenia GA4 | Server-Side Tracking',
    description:
      'Mierz i optymalizuj swoje działania. Oferujemy wdrożenia Google Analytics 4 (GA4), Google Tag Manager (GTM) i śledzenie po stronie serwera (Server-Side).',
    image: '/assets/images/server-side-tracking.png',
  },
  hero: {
    badge: 'Data Intelligence',
    title: {
      line1: 'Przestań zgadywać.',
      line2: 'Zacznij zarabiać na danych.',
    },
    description:
      'Większość firm posiada dane, ale tylko nieliczne potrafią je czytać. Wdrażamy architekturę analityczną, która odpowiada na jedno kluczowe pytanie: <strong>"Gdzie uciekają Twoje pieniądze?"</strong>',
    cta: 'Zamów Audyt Danych',
    trustBadge: 'Gwarancja poprawności',
  },
  dashboard: {
    revenueLabel: 'Przychód (Real-time)',
    stats: [
      { label: 'Użytkownicy', val: '14.2k' },
      { label: 'Konwersja', val: '3.8%' },
      { label: 'Bounce Rate', val: '42%' },
    ],
  },
  painPoints: {
    title: 'Czy ufasz swoim danym?',
    description:
      'Błędna konfiguracja analityki to błędne decyzje biznesowe. Oto najczęstsze sygnały ostrzegawcze, że Twoje dane mogą kłamać.',
    items: [
      {
        title: 'Ryzyko Prawne (RODO)',
        desc: 'Brak Consent Mode v2 to ryzyko kar i blokady konta Google Ads. Twoja strona musi szanować wybór użytkownika, nie tracąc danych.',
      },
      {
        title: 'Utrata Danych (iOS/AdBlock)',
        desc: 'Nawet 40% konwersji jest niewidocznych przez blokady w przeglądarkach. Jeśli nie mierzysz Server-Side, działasz po omacku.',
      },
      {
        title: 'Błędna Atrybucja',
        desc: "Wszystkie zamówienia wpadają do 'Direct'? Nie wiesz, czy sprzedał Facebook czy Google? Przepalasz budżet na nieskuteczne reklamy.",
      },
    ],
  },
  compliance: {
    badge: 'Critical Update 2024',
    title: {
      line1: 'Twoja strona może',
      line2: 'łamać prawo.',
    },
    description:
      'Od marca 2024 Google wymaga <strong>Consent Mode v2</strong>. Brak tego wdrożenia oznacza nie tylko ryzyko kar za RODO, ale przede wszystkim blokadę list remarketingowych w Google Ads.',
    features: [
      {
        title: 'Audyt Prawny (RODO/Omnibus)',
        desc: 'Weryfikujemy politykę prywatności, klauzule w formularzach i banery cookies.',
      },
      {
        title: 'Konfiguracja Consent Mode v2',
        desc: 'Zaawansowane wdrożenie w GTM. Google "domodeluje" dane od użytkowników, którzy nie wyrazili zgody na cookies.',
      },
    ],
    status: {
      safe: 'Twoja strona jest bezpieczna.',
      desc: 'Wdrożono wszystkie protokoły.',
    },
  },
  slider: {
    title: 'Zmień Piekło Excela w Raj Danych',
    description:
      'Przesuń suwak i zobacz różnicę. Zamiast setek wierszy, których nikt nie czyta – interaktywny dashboard, który mówi, co robić.',
    labels: {
      before: 'PRZED (Chaos)',
      after: 'PO (Wnioski)',
    },
  },
  solutions: {
    title: 'Fundament Techniczny',
    description:
      'Budujemy architekturę danych, która jest zgodna z prawem, odporna na braki ciasteczek i czytelna dla biznesu.',
    items: [
      {
        title: 'Google Analytics 4 (GA4)',
        subtitle: 'Ĺąródło Prawdy',
        desc: "Kompletna konfiguracja zdarzeń e-commerce. Mierzymy nie tylko 'zakup', ale też 'dodanie do koszyka' i 'rozpoczęcie płatności', aby znaleźć wąskie gardła.",
      },
      {
        title: 'Server-Side Tracking',
        subtitle: 'Omiń AdBlocki',
        desc: 'Wdrażamy CAPI (Facebook) i GA4 Server-Side. Przesyłamy dane bezpiecznym kanałem serwer-serwer, odzyskując do 30% utraconych konwersji.',
      },
      {
        title: 'Looker Studio',
        subtitle: 'Wizualizacja',
        desc: 'Interaktywne dashboardy, które rozumie prezes i dział marketingu. Wszystkie kluczowe wskaźniki (KPI) w jednym miejscu, dostępne 24/7.',
      },
      {
        title: 'Google Tag Manager',
        subtitle: 'Zarządzanie Kodem',
        desc: 'Porządek w skryptach. Wdrażamy zmiany marketingowe bez angażowania programistów, co przyspiesza pracę i odciąża dział IT.',
      },
      {
        title: 'Consent Mode v2',
        subtitle: 'Legalność & AI',
        desc: "Wdrażamy tryb zgody Google. Dzięki temu jesteś zgodny z RODO, a algorytmy Google 'domodelują' dane użytkowników, którzy nie wyrazili zgody.",
      },
      {
        title: 'Data Warehouse',
        subtitle: 'BigQuery / SQL',
        desc: 'Dla E-commerce i B2B. Łączymy dane ze sklepu, CRM i systemów kasowych w jednej bazie danych, aby liczyć realne LTV i zysk netto.',
      },
    ],
  },
  warehouse: {
    badge: 'Data Warehouse',
    title: {
      line1: 'Integracja Offline & Online',
      line2: '(BigQuery).',
    },
    description:
      'Dla klientów B2B i dużego E-commerce. Łączymy dane ze sklepu internetowego, kas fiskalnych (POS) i systemu CRM w jednym miejscu.',
    features: [
      {
        title: 'Single Source of Truth',
        desc: 'Jeden centralny magazyn danych (Data Warehouse). Koniec z rozbieżnościami między raportami marketingu a księgowością.',
      },
      {
        title: 'Analiza LTV i Cohort',
        desc: 'Śledzimy realną wartość klienta w czasie, łącząc jego wizyty na stronie z zakupami offline.',
      },
      {
        title: 'AI Prediction',
        desc: 'Wykorzystujemy dane historyczne do prognozowania sprzedaży i stanów magazynowych.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        q: 'Czy wdrożenie GA4 spowolni moją stronę?',
        a: 'Nie, jeśli jest zrobione poprawnie przez Google Tag Manager (GTM). GTM ładuje skrypty asynchronicznie, co oznacza, że nie blokują one wyświetlania treści dla użytkownika.',
      },
      {
        q: 'Co to jest Server-Side Tracking i czy go potrzebuję?',
        a: 'To nowoczesna metoda przesyłania danych z pominięciem przeglądarki użytkownika. Jest niezbędna, jeśli chcesz mieć precyzyjne dane w dobie blokad plików cookies (IOS 14+, AdBlock).',
      },
      {
        q: 'Czy moje dane są zgodne z RODO?',
        a: 'Wdrażamy Consent Mode v2, który zarządza zgodami użytkowników. Google Analytics zbiera dane tylko od osób, które wyraziły zgodę, a dla pozostałych stosuje zaawansowane modelowanie behawioralne.',
      },
    ],
  },
  cta: {
    title: 'Odzyskaj kontrolę nad danymi.',
    text: 'Przestań latać na ślepo. Wdrożymy analitykę i zapewnimy bezpieczeństwo prawne Twojej firmie.',
    button: 'Zamów Audyt Prawny & Data',
  },
};
