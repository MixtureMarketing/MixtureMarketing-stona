/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const BACKEND_COMPENDIUM_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Architektura Systemów',
    title: {
      line1: 'Backend',
      line2: 'bez Tajemnic',
    },
    subtitle:
      'Kompletny Przewodnik CTO na 2025 rok. Dowiedz się, jak dobrać fundament technologiczny, który udźwignie Twój sukces.',
  },
  lead: {
    highlight:
      'Kiedy użytkownik klika "Kup teraz", widzi tylko ładną animację przycisku. Ale w ułamku sekundy, pod powierzchnią, dzieje się magia, która decyduje o zysku lub stracie.',
    text1:
      'Sprawdzane są stany magazynowe, procesowana jest płatność, wysyłany jest e-mail, a dane trafiają do systemu ERP. To jest właśnie <strong>Backend</strong> – cyfrowy mózg Twojej firmy.',
    text2:
      'Wybór technologii backendowej to jedna z najtrudniejszych decyzji biznesowych. Wybierasz fundament na lata. Zła decyzja oznacza dług technologiczny i problemy z rekrutacją. Dobra decyzja to stabilność, bezpieczeństwo i łatwe skalowanie, co jest kluczowe przy budowie dedykowanych aplikacji webowych.',
    cta: '<strong>Planujesz nowy projekt?</strong> Nie ryzykuj błędów na starcie. Umów się na Bezpłatną Konsultację Architektoniczną z naszym zespołem.',
  },
  part1: {
    title: 'Część 1: Architektura. Jak to w ogóle działa?',
    subtitle: 'Analogia Restauracji',
    text: 'Zanim wybierzemy język, zrozummy mechanizm. Backend składa się z trzech filarów, które najlepiej wytłumaczyć na przykładzie restauracji. Bez sprawnie działającej kuchni, nawet najpiękniejsza sala (Frontend) nie zatrzyma klienta.',
    conclusion:
      '<strong>Wniosek Biznesowy:</strong> Nawet najlepszy marketing i najpiękniejszy design nie uratują sprzedaży, jeśli system zawiesi się podczas płatności lub będzie ładował dane przez 10 sekund. To w kuchni powstaje prawdziwa wartość.',
  },
  part2: {
    title: 'Część 2: Wielka Czwórka. Porównanie Technologii',
    subtitle: 'Node.js, Python, Go, Laravel',
    text: 'W 2025 roku w biznesie liczą się cztery główne technologie. Każda ma inną "osobowość" i zastosowanie. Wybór zależy od Twoich celów biznesowych, budżetu i planowanego tempa wzrostu.',
    technologies: [
      {
        name: 'Node.js',
        power: 'Real-time Speed',
        ttm: 4,
        perf: 4,
        dev: 5,
        label: 'Bardzo duża',
        title: '1. Node.js – Szybki Kurier',
        desc: 'Używa tego samego języka (JavaScript) co frontend. Idealny do aplikacji działających w czasie rzeczywistym i szybkiego skalowania startupów.',
        for: 'Uber, Chat, Streaming, Real-time',
        linkText: 'Poznaj potęgę Node.js',
        linkUrl: '/baza-wiedzy/nodejs-jeden-jezyk',
      },
      {
        name: 'Python (Django)',
        power: 'Security & AI',
        ttm: 4,
        perf: 3,
        dev: 4,
        label: 'Duża',
        title: '2. Python – Opancerzony Bankowóz',
        desc: 'Złoty standard w Fintech i AI. Oferuje najwyższe bezpieczeństwo "out of the box" i najszybszą drogę do wdrożenia zaawansowanej logiki.',
        for: 'Fintech, SaaS, AI & Data Science',
        linkText: 'Dlaczego Python to bezpieczeństwo?',
        linkUrl: '/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp',
      },
      {
        name: 'Go (Golang)',
        power: 'Massive Scale',
        ttm: 2,
        perf: 5,
        dev: 3,
        label: 'Średnia',
        title: '3. Go – Ciężarówka Wyścigowa',
        desc: 'Stworzony przez Google do ogromnej skali. Zapewnia brutalną wydajność przy minimalnym zużyciu zasobów serwera. Idealny do mikroserwisów.',
        for: 'Mikroserwisy, High-load, Infrastruktura',
        linkText: 'Sprawdź wydajność Go',
        linkUrl: '/baza-wiedzy/go-golang-jezyk-chmury',
      },
      {
        name: 'Laravel (PHP)',
        power: 'Fast Delivery',
        ttm: 5,
        perf: 3,
        dev: 5,
        label: 'Szybko',
        title: '4. Laravel – Luksusowy Kamper',
        desc: 'Król szybkości wdrożenia. Posiada gotowe moduły niemal do wszystkiego, co pozwala zbudować MVP w rekordowym czasie.',
        for: 'E-commerce, B2B, Startupy (MVP)',
        linkText: 'Dlaczego warto wybrać Laravel?',
        linkUrl: '/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie',
      },
    ],
  },
  part3: {
    title: 'Część 3: Gdzie trzymamy dane?',
    subtitle: 'Bazy Danych',
    text: 'Silnik to nie wszystko. Dane Twoich klientów potrzebują bezpiecznego i szybkiego magazynu. Wybór bazy danych ma bezpośredni wpływ na szybkość wyszukiwania i bezpieczeństwo transakcji.',
    postgres: {
      title: 'PostgreSQL (Relacyjna)',
      text: '"Pancerny Sejf". Najbezpieczniejszy wybór dla 90% firm. Gwarantuje, że każda złotówka i każde zamówienie będzie się zgadzać co do grosza.',
      verdict: 'Stawiaj na spójność danych i stabilność.',
    },
    mongo: {
      title: 'MongoDB (NoSQL)',
      text: '"Elastyczny Magazyn". Pozwala zapisywać dane bez sztywnej struktury. Wybierz, gdy budujesz katalogi produktów, IoT lub Big Data.',
      verdict: 'Wybierz, gdy dane szybko się zmieniają.',
    },
    linkText: 'Zobacz pełne Kompendium Baz Danych',
    linkUrl: '/baza-wiedzy/bazy-danych-kompendium-architekta',
  },
  part4: {
    title: 'Część 4: Monolit czy Mikroserwisy?',
    subtitle: 'Struktura Systemu',
    text: 'Wybór architektury to decyzja o tym, jak Twoja firma będzie się rozwijać przez najbliższe 5 lat. Ma ona bezpośredni wpływ na koszty utrzymania i to, jak będzie wyglądać Twoja kultura DevOps.',
    advice: {
      title: 'Złota Rada Mixture Marketing',
      text: 'W 90% przypadków radzimy zaczynać od dobrze zaprojektowanego <strong>Monolitu (Modular Monolith)</strong>. Nie buduj mikroserwisów, jeśli nie masz skali Netfliksa. Mikroserwisy to potężne narzędzie, ale wymagają armii ludzi do utrzymania. Lepiej zainwestować ten budżet w nowe funkcje produktu.',
    },
  },
  part5: {
    title: 'Część 5: Framework Decyzyjny',
    subtitle: 'Co wybrać dla swojego projektu?',
    text: 'Nie wiesz co wybrać? Nasza uproszczona ścieżka decyzyjna pomoże Ci wskazać właściwy kierunek technologiczny.',
    steps: [
      { step: 1, q: 'Ograniczony budżet & Czas (MVP)?', ans: 'Laravel / Python' },
      { step: 2, q: 'Aplikacja Real-time (Chat, Uber)?', ans: 'Node.js' },
      { step: 3, q: 'Bankowość / Dane Medyczne / AI?', ans: 'Python (Django)' },
      { step: 4, q: 'Skala Enterprise & Mikroserwisy?', ans: 'Go (Golang)' },
    ],
  },
  cta: {
    title: 'Twoja wizja potrzebuje solidnego silnika.',
    text: 'Masz pomysł na produkt, ale gubisz się w technologiach? Nasi architekci pomogą Ci dobrać stack, który będzie bezpieczny, skalowalny i przede wszystkim – opłacalny.',
    primaryBtn: 'Umów Warsztat Architektoniczny',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
