/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const REDIS_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Backend & Performance',
    title: {
      line1: 'Redis: Twój system na',
      line2: 'sterydach wydajności.',
    },
    subtitle:
      'Kompletny przewodnik po najpopularniejszej bazie In-Memory świata. Od prostego cache, przez kolejki zadań, aż po wyszukiwanie wektorowe w AI.',
  },
  contextBox: {
    text: 'Ten artykuł jest częścią serii <strong>Architektura Danych</strong>.',
    linkText: 'Zobacz pełne porównanie: PostgreSQL vs MongoDB vs Redis vs Elasticsearch',
    linkUrl: '/baza-wiedzy/bazy-danych-kompendium-architekta',
  },
  lead: {
    highlight:
      'Wyobraź sobie, że Twoja baza danych to biblioteka na drugim końcu miasta, a Redis to notatnik, który masz zawsze pod ręką. <strong>Różnica w czasie dostępu jest gigantyczna.</strong>',
  },
  howItWorks: {
    title: 'Jak to działa?',
    subtitle: 'Architektura Systemu',
    text: 'Redis nie zastępuje Twojej głównej bazy danych. On ją wspiera jako <strong>Warstwa Cache</strong>. Poniżej interaktywny schemat pokazujący różnicę między szybkim odczytem z Redis (Hit) a wolnym odczytem z głównej bazy (Miss).',
  },
  speed: {
    title: 'Wielki Wyścig: RAM vs Dysk',
    subtitle: 'Dlaczego to jest szybkie?',
    text: 'Tradycyjne bazy danych zapisują wszystko na dysku twardym. To bezpieczne, ale wolne (wymaga fizyki). Redis trzyma dane w pamięci operacyjnej (RAM). Zobacz symulację różnicy.',
  },
  cli: {
    title: 'Poczuj moc CLI',
    subtitle: 'Spróbuj sam',
    text: 'Redis jest uwielbiany przez programistów za prostotę. Nie musisz pisać skomplikowanego SQL-a. Wpisz komendy poniżej, aby ustawić i pobrać dane.',
  },
  persistence: {
    title: 'Czy stracę dane po restarcie? (Persistence)',
    text: 'To najczęstszy mit. Mimo że Redis działa w RAM, potrafi zapisywać dane na dysk. Masz do wyboru dwie strategie (lub ich połączenie):',
    rdb: {
      title: 'RDB (Snapshot)',
      desc: '"Zdjęcie" bazy co jakiś czas (np. co 5 minut).',
      pros: ['Szybki start serwera', 'Kompaktowe pliki'],
      cons: ['Ryzyko utraty ostatnich 5 min'],
    },
    aof: {
      title: 'AOF (Append Only File)',
      desc: 'Dziennik każdej operacji zapisu w czasie rzeczywistym.',
      pros: ['Pełne bezpieczeństwo danych', 'Czytelny format logów'],
      cons: ['Wolniejszy start przy dużych danych'],
    },
  },
  ha: {
    title: 'High Availability & Sentinel',
    subtitle: 'Niezawodność',
    text: 'W środowisku Enterprise awaria jednego serwera nie może zatrzymać biznesu. <strong>Redis Sentinel</strong> monitoruje serwery i w razie awarii Mastera automatycznie awansuje jedną z kopii (Replica) na szefa. Zobacz symulację:',
  },
  pubsub: {
    title: 'Redis to nie tylko Cache (Pub/Sub)',
    text: 'Redis działa też jako ultra-szybki kurier wiadomości. System A wysyła wiadomość na kanał, a System B, C i D natychmiast ją otrzymują. Idealne do czatów, powiadomień live i gier multiplayer.',
  },
  ai: {
    badge: 'Redis + Artificial Intelligence',
    title: 'Redis w erze AI: Vector Search',
    text: 'Nowoczesne aplikacje AI (jak ChatGPT) używają tzw. wektorów do rozumienia znaczenia tekstu i obrazu. Redis ewoluował. Teraz potrafi przechowywać te wektory i błyskawicznie znajdować "podobne" elementy (np. "znajdź buty podobne do tych na zdjęciu").',
    cards: [
      { title: 'RAG', desc: 'Pamięć dla chatbotów AI' },
      { title: 'Rekomendacje', desc: 'Systemy "Netflix-style"' },
      { title: 'Wyszukiwanie', desc: 'Semantic Search' },
    ],
  },
  comparison: {
    title: 'Porównanie Technologii',
    headers: ['Cecha', 'Redis', 'SQL (MySQL/PG)', 'Memcached'],
    rows: [
      { label: 'Typ', v1: 'In-Memory NoSQL', v2: 'Relacyjna (Disk)', v3: 'In-Memory Cache' },
      {
        label: 'Zastosowanie',
        v1: 'Cache, Kolejki, Real-time',
        v2: 'Główne dane, Transakcje',
        v3: 'Prosty caching',
      },
      {
        label: 'Struktury',
        v1: '✅ Tak (Listy, Mapy...)',
        v2: '✅ Tak (Tabele)',
        v3: '❌ Nie (Tylko stringi)',
      },
      {
        label: 'Trwałość',
        v1: '✅ Tak (Snapshots/AOF)',
        v2: '✅ Tak (Pełna)',
        v3: '❌ Nie (Ulotne)',
      },
    ],
  },
  chart: {
    title: 'Gdzie najczęściej wdrażamy Redis?',
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Najczęściej zadawane pytania',
    items: [
      {
        q: 'Czy Redis jest bezpieczny?',
        a: 'Tak, o ile jest odpowiednio skonfigurowany (nie wystawiony publicznie do internetu) i zabezpieczony hasłem oraz szyfrowaniem TLS.',
      },
      {
        q: 'Co się stanie, gdy braknie prądu?',
        a: 'Domyślnie dane w RAM znikają. Jednak Redis oferuje tryby RDB (zrzuty co jakiś czas) oraz AOF (zapis każdej komendy), które pozwalają odzyskać dane po restarcie.',
      },
      {
        q: 'Ile kosztuje wdrożenie Redis?',
        a: 'Samo oprogramowanie jest darmowe (Open Source). Kosztem jest konfiguracja oraz pamięć RAM serwera. W chmurze (AWS ElastiCache, Azure Redis) płacisz za użyte zasoby.',
      },
    ],
  },
  cta: {
    title: 'Twój system potrzebuje turbodoładowania?',
    text: 'Redis to potężne narzędzie. Zła konfiguracja może kosztować utratę danych. Dobra - da Ci 10x szybszą aplikację. Pomożemy Ci to zrobić dobrze.',
    primaryBtn: 'Sprawdź nasz Tech Stack',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
