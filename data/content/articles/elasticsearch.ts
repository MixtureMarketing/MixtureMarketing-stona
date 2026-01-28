export const ELASTICSEARCH_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Search & UX',
    title: {
      line1: 'Elasticsearch: Wyszukiwarka,',
      line2: 'która rozumie Twojego klienta.',
    },
    subtitle:
      'Klient nie kupi tego, czego nie może znaleźć. Dowiedz się, jak zamienić zwykłą wyszukiwarkę w inteligentnego asystenta sprzedaży.',
  },
  contextBox: {
    text: 'Ten artykuł jest częścią serii <strong>Architektura Danych</strong>.',
    linkText: 'Zobacz pełne porównanie: PostgreSQL vs MongoDB vs Redis vs Elasticsearch',
    linkUrl: '/baza-wiedzy/bazy-danych-kompendium-architekta/',
  },
  lead: {
    highlight:
      'Wyobraź sobie wielki market budowlany. Pytasz o "wiertarkę udarową", a sprzedawca milczy, bo w systemie ma tylko "Młotowiertarka". <strong>Wychodzisz z pustymi rękami.</strong>',
    text: 'Tak działa 90% wyszukiwarek opartych na SQL. Są głupe i wymagają od użytkownika aptekarskiej precyzji. Rozwiązaniem jest <strong>Elasticsearch</strong> – silnik, który rozumie intencje klienta.',
  },
  whatIs: {
    title: 'Czym jest Elasticsearch? (Magia Indeksu Odwróconego)',
    subtitle: 'Technologia',
    text: 'To NoSQL Search Engine. Jego sekret tkwi w strukturze zwanej <strong>Inverted Index</strong>. Dzięki niej Elasticsearch przeszukuje miliony rekordów w milisekundy.',
  },
  comparison: {
    title: 'Pojedynek: SQL LIKE vs. Elasticsearch',
    subtitle: 'Dlaczego to się opłaca?',
    headers: ['Cecha', 'SQL (LIKE %query%)', 'Elasticsearch'],
    rows: [
      { label: 'Literówki', v1: 'Nie obsługuje.', v2: 'Fuzzy Search (Tolerancja)' },
      { label: 'Synonimy', v1: 'Trudne do wdrożenia.', v2: 'Natywne (Buty = Obuwie)' },
      { label: 'Ranking', v1: 'Tylko po dacie/cenie.', v2: 'Scoring (Trafność)' },
      { label: 'Szybkość', v1: 'Zwalnia przy Big Data.', v2: 'Błyskawiczna (Niezależna od skali)' },
    ],
  },
  killerFeatures: {
    title: 'Killer Features dla Twojego Biznesu',
    subtitle: 'Korzyści',
    text: 'Oto funkcje, które bezpośrednio przekładają się na konwersję w Twoim sklepie. Zobacz, jak działają w praktyce:',
  },
  architecture: {
    title: 'Architektura: Jak to wdrażamy?',
    subtitle: 'Wdrożenie',
    text: 'Elasticsearch współpracuje z Twoją bazą <a href="/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu/" class="text-secondary hover:underline font-bold">PostgreSQL</a>. Główna baza trzyma stany i transakcje, a Elastic trzyma "zoptymalizowaną kopię" danych pod wyszukiwanie.',
  },
  elkStack: {
    title: 'ELK Stack: Więcej niż wyszukiwarka',
    text: 'Elasticsearch to serce ekosystemu <strong>ELK</strong> (Elastic, Logstash, Kibana). Wdrażamy go, abyś widział, czego użytkownicy szukają, a nie znajdują. To bezcenna wiedza marketingowa, która mówi Ci, jakie produkty powinieneś dodać do oferty.',
    badges: ['Logs Monitoring', 'BI Dashboards'],
  },
  cta: {
    title: 'Przestań tracić klientów przez "Brak wyników".',
    text: 'Wpisz w swoim sklepie nazwę produktu z błędem. Znalazło? Jeśli nie – tracisz pieniądze. Zróbmy darmowy test Twojej wyszukiwarki.',
    primaryBtn: 'Napraw moją wyszukiwarkę',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
