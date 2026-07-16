/**
 * Treść /marketing/seo/ — przepisana 2026-07-16 (krytyka 14/40).
 * Zasady: zero obietnic pozycji (TOP 3 / „Zdominuj" wypadły — własne FAQ
 * mówi wprost, że pozycji się nie gwarantuje i to zostaje jako atut);
 * liczby branżowe bez procentów (mechanika); cena hero = najniższy pakiet
 * CMS (SEO lokalne 1 200 zł/mc — wcześniej hero mówiło 1 500 wbrew własnej
 * tabeli); dowód szybkości = REALNY pomiar CrUX wdrożenia klienta z datą
 * (ten sam, którym dowodzi /web-development/), nie teatr „LIVE OPTIMIZATION".
 */
export const SEO_CONTENT = {
  seo: {
    title: 'Pozycjonowanie stron (SEO) — Rzeszów i cała Polska | Mixture',
    description:
      'SEO bez gwarancji „1. miejsca" i bez raportów-wydmuszek: technika, treści eksperckie i linki, z pomiarem widoczności w GSC. Pakiety od 1 200 zł/mc.',
    image: '/assets/images/core-web-vitals.png',
  },
  hero: {
    title: {
      line1: 'Widoczność, która',
      line2: 'zostaje z Tobą.',
    },
    description:
      'Reklamy przestają działać w dniu, w którym przestajesz płacić. Pozycjonowanie buduje ruch, który zostaje — o ile ktoś robi je uczciwie: techniką, treścią i linkami, nie obietnicami pozycji.',
    cta: 'Darmowy audyt SEO',
  },
  /** Trzy filary — na nich stoi każda widoczność organiczna. */
  pillars: {
    title: 'Na czym naprawdę stoi SEO',
    description:
      'Nie ma sekretnej sztuczki. Jest technika, którą robot umie przeczytać, treść, którą człowiek chce przeczytać, i autorytet, który przekonuje jednych i drugich.',
    items: [
      {
        title: 'Technika',
        desc: 'Indeksacja, struktura, szybkość. Strona, której Google nie umie przeczytać, nie ma czego pozycjonować — dlatego każdy projekt zaczynamy od audytu technicznego.',
      },
      {
        title: 'Treść',
        desc: 'Odpowiedzi na pytania, które Twoi klienci naprawdę wpisują w Google — pisane przez ludzi, weryfikowane merytorycznie. Nie „teksty pod SEO".',
      },
      {
        title: 'Autorytet',
        desc: 'Linki z miejsc, które mają znaczenie w Twojej branży, i opinie, które budują zaufanie. Zdobywane, nie kupowane hurtem.',
      },
    ],
  },
  localSeo: {
    title: 'Widoczność lokalna zaczyna się od map',
    description:
      'Dla firm usługowych — restauracji, warsztatów, gabinetów — duża część klientów zaczyna od wyników mapowych, nie od klasycznej listy. To osobna dyscyplina i osobna robota.',
    items: [
      'Optymalizacja wizytówki Google (profil, kategorie, zdjęcia)',
      'Zarządzanie opiniami i odpowiedziami',
      'Spójność danych firmy w katalogach (NAP)',
    ],
  },
  /**
   * Szybkość — ciemnia Z DOWODEM: realny pomiar CrUX wdrożenia klienta.
   * PRZED ZMIANĄ TEKSTU: zmierz ponownie i zaktualizuj datę. Nigdy z ręki.
   * Źródło: PageSpeed Insights API, dane polowe CrUX dla niepodzielni.com,
   * pomiar 15.07.2026 (ten sam dowód co na /web-development/).
   */
  technicalSeo: {
    title: 'Szybkość to ranking.',
    description:
      'Google mierzy, jak Twoja strona ładuje się u realnych użytkowników (Core Web Vitals) — i wolne strony przegrywają, zanim zacznie się walka o treść. My tę szybkość robimy i mierzymy, nie deklarujemy.',
    proof: {
      label: 'Core Web Vitals: zaliczone — mobile i desktop',
      detail:
        'LCP 1,0 s · CLS 0 · dane polowe Google CrUX dla wdrożenia klienta (niepodzielni.com), pomiar 15.07.2026',
      linkLabel: 'Zobacz case study',
      linkTo: '/portfolio/fundacja-niepodzielni',
    },
    stack: [
      'Nowoczesne formaty obrazów (WebP/AVIF)',
      'Eliminacja zasobów blokujących renderowanie',
      'Kompresja i cache po stronie serwera',
      'Optymalizacja czasu odpowiedzi serwera (TTFB)',
    ],
  },
  roadmap: {
    title: 'Jak wygląda pierwszy rok',
    description:
      'SEO to proces — każdy, kto obiecuje skok w miesiąc, zgaduje albo kłamie. Tak wygląda uczciwa mapa drogi.',
    steps: [
      {
        month: 'Miesiąc 1',
        title: 'Audyt i szybkie naprawy',
        desc: 'Eliminujemy błędy krytyczne: indeksację, duplikaty, szybkość. To fundament — bez niego dalsza praca nie ma na czym stanąć.',
      },
      {
        month: 'Miesiące 2–3',
        title: 'Treść i struktura',
        desc: 'Budujemy treści wokół tematów, w których masz realną wiedzę, porządkujemy nagłówki, meta tagi i linkowanie wewnętrzne.',
      },
      {
        month: 'Miesiące 4–6',
        title: 'Autorytet i linki',
        desc: 'Pozyskujemy wartościowe linki z portali branżowych. W tym okresie zwykle widać pierwsze mierzalne ruchy widoczności.',
      },
      {
        month: 'Miesiąc 7+',
        title: 'Rozbudowa i konwersja',
        desc: 'Poszerzamy klastry tematyczne i pracujemy nad tym, żeby rosnący ruch zamieniał się w zapytania i sprzedaż.',
      },
    ],
  },
  /** Kalkulator = arytmetyka założeń użytkownika (CTR jest suwakiem!). */
  roi: {
    title: 'Ile ten sam ruch kosztuje w reklamach',
    description:
      'Prosta arytmetyka: weź frazę, jej miesięczne wyszukiwania i stawkę za kliknięcie w Ads — i zobacz, jaką wartość ma ruch organiczny z tej frazy. Założenia ustawiasz sam.',
    disclaimer:
      'To arytmetyka Twoich założeń, nie prognoza. Realny CTR zależy od pozycji, wyglądu wyniku i konkurencji — a pozycji nie obiecujemy, co do zasady.',
    labels: {
      volume: 'Miesięczne wyszukiwania frazy',
      cpc: 'Koszt kliknięcia w Ads (CPC)',
      ctr: 'Założony CTR wyniku organicznego',
      traffic: 'Wejścia miesięcznie przy tych założeniach',
      equivalent: 'Wartość tego ruchu w cenach Ads',
    },
  },
  faqs: [
    {
      q: 'Kiedy zobaczę pierwsze efekty SEO?',
      a: 'SEO to maraton, nie sprint. Pierwsze wzrosty widoczności (liczba słów kluczowych w TOP50) widać zwykle po 3 miesiącach. Realny wzrost ruchu i sprzedaży następuje zazwyczaj między 6. a 9. miesiącem systematycznej pracy.',
    },
    {
      q: 'Czy muszę mieć bloga?',
      a: 'Tak, jeśli chcesz skalować widoczność. Blog pozwala pokryć setki zapytań typu long-tail (np. „jaka pompa ciepła do domu 100m2"), na które Twoi klienci szukają odpowiedzi przed zakupem. To buduje zaufanie i ściąga ruch.',
    },
    {
      q: 'Czy gwarantujecie 1. miejsce w Google?',
      a: 'Nie. Google oficjalnie ostrzega przed agencjami dającymi takie gwarancje — algorytm jest tajny i zmienny. Gwarantujemy rzetelną realizację strategii, pomiar widoczności w Google Search Console i transparentne omówienie efektów co miesiąc.',
    },
    {
      q: 'Czy używacie AI do pisania tekstów?',
      a: 'Traktujemy AI jako asystenta (research, struktura), ale nie jako autora. Treści są pisane lub weryfikowane przez ludzi z wiedzą merytoryczną — bo tekst, który nie pomaga czytelnikowi, nie pomoże też w Google.',
    },
    {
      q: 'Jak wygląda raportowanie?',
      a: 'Dostajesz dostęp do danych na żywo (Google Search Console + dashboard) i raz w miesiącu spotykamy się, żeby omówić widoczność, ruch i plan na kolejny okres. Zero 50-stronicowych PDF-ów, których nikt nie czyta.',
    },
  ],
  cta: {
    title: 'Sprawdź, na co widoczna jest konkurencja.',
    description:
      'Przygotujemy darmową analizę: na jakie frazy widoczna jest Twoja konkurencja, a Ty nie — i co z tego realnie wynika dla Twojego biznesu.',
    button: 'Zamów analizę konkurencji',
  },
};
