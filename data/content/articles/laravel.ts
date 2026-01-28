export const LARAVEL_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Backend & Rapid Dev',
    title: {
      line1: 'Laravel: PHP nie umarło,',
      line2: 'ono dojrzało.',
    },
    quote: '"Gdy konkurencja jeszcze konfiguruje serwery, Ty już sprzedajesz."',
  },
  contextBox: {
    text: 'Ten artykuł jest częścią serii <strong>Backend Architecture</strong>.',
    linkText: 'Zobacz pełne porównanie: Node vs Python vs Go vs Laravel',
    linkUrl: '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto',
  },
  lead: {
    highlight:
      'W świecie technologii panuje moda na hejtowanie PHP. "To stary język", "To przeszłość". Tymczasem statystyki są nieubłagane: <strong>77% stron internetowych na świecie nadal działa na PHP.</strong>',
    text1:
      'Dlaczego? Ponieważ pojawił się on: <strong>Laravel</strong>. To framework, który wziął wszystko, co najlepsze w PHP (prostotę, tanie utrzymanie) i dodał do tego nowoczesną architekturę, elegancję i narzędzia, których zazdroszczą programiści Javy czy Pythona.',
    text2:
      'W naszym Software House Laravel to pierwszy wybór, gdy klient mówi: "Mam budżet X i muszę mieć działający produkt za 3 miesiące".',
  },
  ecosystem: {
    title: '"The Magic of Ecosystem" – Dlaczego to takie szybkie?',
    subtitle: 'Gotowe Klocki',
    text: 'To jest "Killer Feature" Laravela. Inne frameworki (jak Express.js w Node) to tylko szkielety. Laravel to w pełni umeblowany dom. Twórcy stworzyli gotowe, oficjalne rozwiązania na prawie każdy problem biznesowy.',
    verdict:
      'Wniosek: Twój zespół deweloperski skupia się na Twoim unikalnym pomyśle biznesowym, a nie na pisaniu systemu logowania po raz setny.',
  },
  eloquent: {
    title: 'Eloquent ORM: Kod, który czyta się jak angielski',
    subtitle: 'Czytelność',
    text: 'Dla Ciebie, jako klienta, ważna jest czytelność. Jeśli kod jest skomplikowany, trudniej go przejąć innemu zespołowi, a poprawki trwają dłużej. Laravel posiada Eloquent ORM – system obsługi bazy danych, który jest uważany za najlepszy na rynku.',
  },
  security: {
    title: 'Bezpieczeństwo w standardzie',
    subtitle: 'Security First',
    text: 'Laravel nie pozwala programiście na lenistwo w kwestii bezpieczeństwa. Nie musisz płacić dodatkowo za "audyt podstawowy", bo framework wymusza dobre praktyki od pierwszej linijki kodu.',
    cards: [
      {
        title: 'Anti-SQL Injection',
        desc: 'Wbudowana ochrona w Eloquent. Twoja baza jest bezpieczna.',
      },
      {
        title: 'Ochrona CSRF',
        desc: 'Automatyczna weryfikacja każdego formularza. Stop dla botów.',
      },
      {
        title: 'Szyfrowanie Haseł',
        desc: 'Standard przemysłowy Bcrypt/Argon2 prosto z pudełka.',
      },
    ],
  },
  performance: {
    title: 'Wydajność: Laravel Octane',
    subtitle: 'Mit o wolnym PHP',
    text: '"Ale PHP jest wolne!" – to argument z 2010 roku. Dziś, dzięki PHP 8.x oraz narzędziom takim jak Laravel Octane, aplikacje napisane w tym frameworku są niesamowicie szybkie.',
  },
  comparison: {
    title: 'Pojedynek: Laravel vs Node.js vs Python',
    subtitle: 'Kiedy co wybrać?',
    headers: ['Cecha', 'Laravel (PHP)', 'Node.js (JS)', 'Django (Python)'],
    rows: [
      {
        feature: 'Główna zaleta',
        v1: 'Time-to-Market, Ekosystem',
        v2: 'Czas rzeczywisty (WebSockets)',
        v3: 'AI, Data Science',
      },
      {
        feature: 'Koszt developera',
        v1: 'Średni/Niski (Duża dostępność)',
        v2: 'Średni/Wysoki',
        v3: 'Wysoki',
      },
      {
        feature: 'Idealne do',
        v1: 'E-commerce, SaaS, CRM',
        v2: 'Uber, Chat, Streaming',
        v3: 'Fintech, AI Apps',
      },
      {
        feature: 'Hosting',
        v1: 'Tani i prosty (każdy serwer)',
        v2: 'Wymaga VPS/Chmury',
        v3: 'Wymaga VPS/Chmury',
      },
    ],
  },
  useCases: {
    title: 'Co budujemy na Laravelu?',
    items: [
      {
        title: 'Platformy SaaS',
        desc: 'Dzięki gotowym modułom do płatności i subskrypcji, MVP powstaje błyskawicznie.',
      },
      {
        title: 'Marketplace i E-commerce',
        desc: 'Złożone relacje (Ceny, Warianty, Rabaty) są proste do obsłużenia w Laravelu.',
      },
      {
        title: 'Systemy ERP/CRM',
        desc: 'Ogromne panele administracyjne z tysiącami tabel i raportów.',
      },
      {
        title: 'Aplikacje Bookingowe',
        desc: 'Rezerwacje, kalendarze, powiadomienia mailowe.',
      },
    ],
  },
  cta: {
    title: 'Masz pomysł na biznes, a nie na rok developmentu?',
    text: 'Chcesz zbudować MVP w 3 miesiące, a nie w 12? Laravel jest odpowiedzią. Skonsultuj swój pomysł z naszymi architektami PHP.',
    primaryBtn: 'Oszacuj czas i koszt projektu',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
