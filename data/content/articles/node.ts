export const NODE_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Fullstack Development',
    title: {
      line1: 'Node.js: Jeden język,',
      line2: 'by rządzić całym stackiem IT.',
    },
    quote:
      '"Koniec z barierą językową w Twoim zespole IT. Postaw na wydajność JavaScript Everywhere."',
  },
  contextBox: {
    text: 'Ten artykuł jest częścią serii Backend Architecture.',
    linkText: 'Zobacz pełne porównanie: Node vs Python vs Go vs Laravel',
    linkUrl: '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto/',
  },
  lead: {
    text1:
      'Przez dekady w świecie IT panował podział. Programiści Frontend mówili w JavaScript. Programiści Backend mówili w Javie, PHP czy Pythonie. Te dwa światy rzadko się rozumiały, co wymagało zatrudniania osobnych zespołów.',
    text2:
      'Aż w 2009 roku pojawił się Node.js. Sprawił, że JavaScript "uciekł" z przeglądarki i zamieszkał na serwerze. Dziś to technologia napędzająca Ubera, Netflixa czy LinkedIn. W połączeniu z React.js, tworzy duet, który zdominował nowoczesne aplikacje. W tym artykule wyjaśnimy, dlaczego architektura "JavaScript Everywhere" to najlepsza optymalizacja kosztowa dla Twojego projektu.',
  },
  eventLoop: {
    title: 'Sekret Kelnera: Event Loop',
    subtitle: 'Jak to działa?',
    text: 'Node.js to środowisko, którego moc tkwi w architekturze Non-blocking I/O. Jak wytłumaczyć to biznesowi? Użyjmy analogii restauracji.',
    conclusion:
      'Wniosek: Node.js jest niezwykle lekki i wydajny przy obsłudze dużej liczby jednoczesnych połączeń (np. 100,000 użytkowników online).',
  },
  jsEverywhere: {
    title: 'Biznesowy Argument nr 1: "JavaScript Everywhere"',
    subtitle: 'Optymalizacja Zasobów',
    text: 'To największa korzyść organizacyjna. Wybierając Node.js na backendzie i React lub Vue na frontendzie, używasz tego samego języka w całym projekcie.',
    cards: [
      {
        title: 'Elastyczność Zespołu',
        desc: 'Twój Frontendowiec może naprawić błąd na Backendzie. Staje się Fullstack Developerem.',
      },
      {
        title: 'Współdzielenie Kodu',
        desc: 'Walidacja ("Czy e-mail jest poprawny?") napisana raz, działa i w przeglądarce i na serwerze.',
      },
      {
        title: 'Łatwiejsza Rekrutacja',
        desc: 'JS to najpopularniejszy język świata. Łatwiej znaleźć eksperta JS niż niszowego technologa.',
      },
    ],
  },
  useCases: {
    title: 'Gdzie Node.js błyszczy?',
    subtitle: 'Use Cases',
    cards: [
      {
        title: '1. Aplikacje Real-Time (Uber, Chat)',
        desc: 'Dzięki <strong>WebSockets</strong>, Node utrzymuje stałe połączenie. Gdy kierowca Ubera zmienia pozycję, informacja trafia do Ciebie w milisekundach, bez "odpytywania" serwera.',
      },
      {
        title: '2. Streaming (Netflix)',
        desc: 'Netflix używa Node.js, by skrócić czas ładowania interfejsu. Node świetnie radzi sobie z przesyłaniem strumieni danych bez zatykania pamięci RAM.',
      },
      {
        title: '3. Mikroserwisy (API)',
        desc: 'Node jest lekki. Zamiast jednego monolitu, budujesz małe serwisy, które łatwo skalować w chmurze (AWS Lambda).',
      },
    ],
  },
  nestjs: {
    title: 'NestJS: Node.js dla Korporacji',
    subtitle: 'Enterprise Standard',
    text: 'Klienci czasem pytają: "Czy JavaScript nie jest zbyt chaotyczny dla banku?". Kiedyś tak było. Teraz mamy NestJS. To framework, który wprowadza porządek i architekturę znaną z Javy (MVC), pozwalając pisać w bezpiecznym TypeScript.',
    badge: 'Nasz standard w dużych wdrożeniach',
  },
  warning: {
    title: 'Kiedy NIE używać Node.js?',
    subtitle: 'Uczciwość to podstawa',
  },
  cta: {
    title: 'Zjednocz swoją technologię.',
    text: 'Chcesz zbudować szybką aplikację, która łatwo się skaluje? Rozważ architekturę opartą na Node.js i NestJS. Niższe koszty, szybszy czas wdrożenia.',
    primaryBtn: 'Porozmawiajmy o Back-endzie',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
