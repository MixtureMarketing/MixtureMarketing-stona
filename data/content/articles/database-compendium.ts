/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const DATABASE_COMPENDIUM_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Architektura Danych',
    title: {
      line1: 'Bazy Danych',
      line2: 'bez Tajemnic',
    },
    subtitle:
      'Kompendium Architekta 2025. PostgreSQL, Redis, MongoDB czy Elasticsearch? Przestań zgadywać, zacznij projektować.',
  },
  lead: {
    highlight:
      'Gdy zapytasz programistę "Gdzie zapiszemy dane?", a on odpowie bez zastanowienia "W bazie danych", to powinna zapalić Ci się czerwona lampka.',
    text1:
      'W 2025 roku pojęcie "baza danych" jest tak szerokie jak "pojazd". Czy potrzebujesz ciężarówki do przewozu towarów (PostgreSQL)? Czy może bolidu F1 do szybkiej jazdy (Redis)? A może potrzebujesz czegoś, co potrafi pływać (Elasticsearch)?',
    text2:
      'Największe systemy świata – Uber, Netflix, Allegro – nie używają <strong>jednej</strong> bazy. Używają ich wszystkich, w zależności od zadania. To podejście nazywamy <strong>Polyglot Persistence</strong>. Jest ono kluczowym elementem nowoczesnej architektury Backendu.',
    cta: '<strong>Szukasz wsparcia?</strong> Sprawdź nasze usługi Budowy Aplikacji lub skonsultuj Architekturę Swojego Systemu.',
  },
  players: {
    title: 'Część 1: Wielka Czwórka',
    subtitle: 'Przedstawienie Zawodników',
    text: 'Na rynku liczy się cztery technologie. Każda z nich ma "osobowość", supermoc i konkretne zastosowanie biznesowe.',
    items: [
      {
        name: 'PostgreSQL',
        type: 'SQL',
        role: 'Główny Księgowy',
        power: 'Gwarantuje bezpieczeństwo każdej transakcji finansowej.',
        desc: 'Rygorystyczny schemat danych, nic nie zginie.',
        for: ['Finanse', 'Zamówienia', 'Użytkownicy'],
      },
      {
        name: 'MongoDB',
        type: 'NoSQL',
        role: 'Elastyczny Magazynier',
        power: 'Przyjmie dane w każdym kształcie bez błędów.',
        desc: 'Łatwe dzielenie danych na wiele serwerów.',
        for: ['Katalogi Produktów', 'IoT', 'Big Data'],
      },
      {
        name: 'Redis',
        type: 'Cache',
        role: 'Sprinter (RAM)',
        power: '1000x szybszy niż tradycyjne bazy danych.',
        desc: 'Działa w pamięci RAM, dane są tymczasowe.',
        for: ['Koszyki', 'Sesje', 'Rankingi Live'],
      },
      {
        name: 'Elasticsearch',
        type: 'Search',
        role: 'Inteligentny Bibliotekarz',
        power: 'Rozumie język, literówki i kontekst.',
        desc: 'Błyskawiczne filtrowanie milionów rekordów.',
        for: ['Wyszukiwarki', 'Autouzupełnianie', 'Logi'],
      },
    ],
  },
  matrix: {
    title: 'Część 2: Tabela Porównawcza',
    subtitle: 'Decision Matrix',
    text: 'Kiedy użyć którego narzędzia? Zestawienie kluczowych parametrów technicznych.',
    headers: ['Cecha', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    rows: [
      {
        label: 'Typ Danych',
        v1: 'Relacyjny (Tabele)',
        v2: 'Dokument (JSON)',
        v3: 'Klucz-Wartość',
        v4: 'Indeks Odwrócony',
      },
      {
        label: 'Główne zadanie',
        v1: 'Bezpieczeństwo (SSOT)',
        v2: 'Skalowalność',
        v3: 'Ekstremalna prędkość',
        v4: 'Trafność szukania',
      },
      {
        label: 'Magazyn',
        v1: 'Dysk Twardy (SSD)',
        v2: 'Dysk Twardy + RAM',
        v3: 'Pamięć RAM ⚡',
        v4: 'Dysk',
      },
      {
        label: 'Relacje (JOIN)',
        v1: '👑 Król Relacji',
        v2: '❌ Unikać',
        v3: '❌ Brak',
        v4: '❌ Brak',
      },
      {
        label: 'Trwałość',
        v1: '⭐⭐⭐⭐⭐ (Pancerna)',
        v2: '⭐⭐⭐⭐',
        v3: '⭐⭐ (Ulotna*)',
        v4: '⭐⭐⭐',
      },
    ],
  },
  architecture: {
    title: 'Część 3: Polyglot Persistence',
    subtitle: 'Architektura Referencyjna E-commerce',
    text: 'To najważniejsza część dla Ciebie jako decydenta. W profesjonalnym systemie (np. E-commerce) bazy danych współpracują ze sobą jak orkiestra.',
  },
  decisionTree: {
    title: 'Część 4: Ścieżka Decyzyjna',
    subtitle: 'Co wybrać na start?',
    text: 'Nie każdy projekt potrzebuje od razu wszystkich czterech technologii. Nie przepalaj budżetu. Zacznij mądrze.',
    steps: [
      {
        step: 1,
        q: 'Startujesz z MVP?',
        desc: 'Potrzebujesz elastyczności, ale i bezpieczeństwa danych.',
        ans: 'Wybierz PostgreSQL',
      },
      {
        step: 2,
        q: 'Aplikacja zwalnia?',
        desc: 'Serwer bazy danych jest przeciążony powtarzalnymi zapytaniami.',
        ans: 'Dodaj Redis (Caching)',
      },
      {
        step: 3,
        q: 'Klienci nie znajdują produktów?',
        desc: 'Standardowe "LIKE %...%" jest wolne i nie radzi sobie z literówkami.',
        ans: 'Dodaj Elasticsearch',
      },
      {
        step: 4,
        q: 'Masz Big Data / Logi?',
        desc: 'Dane nieustrukturyzowane (JSON) zapychają główną bazę SQL.',
        ans: 'Wdróż MongoDB',
      },
    ],
  },
  mistakes: {
    title: 'Strefa Zagrożenia',
    subtitle: 'Najczęstsze błędy architektoniczne',
    items: [
      {
        title: 'Używanie MongoDB do finansów',
        text: 'Choć Mongo wspiera transakcje, SQL jest naturalnym środowiskiem dla pieniędzy. Ryzyko niespójności salda (race conditions) jest tu znacznie trudniejsze do mitygacji dla początkujących zespołów.',
      },
      {
        title: 'Traktowanie Redisa jako głównej bazy',
        text: 'Redis jest ultra szybki, ale trzyma dane w pamięci RAM. Restart serwera lub awaria zasilania może oznaczać utratę danych z ostatniej sekundy lub minuty. To cache, nie sejf.',
      },
    ],
  },
  cta: {
    title: 'Twoje dane potrzebują architekta.',
    text: 'Budujesz system, który ma przetrwać lata? Nie zgaduj. Skonsultuj architekturę bazy danych z naszymi ekspertami. Zaprojektujemy rozwiązanie "szyte na miarę".',
    primaryBtn: 'Konsultacja Architektoniczna',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
