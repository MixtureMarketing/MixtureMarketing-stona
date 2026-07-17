/**
 * Treść /marketing/analytics/ — przepisana 2026-07-16 (krytyka 10/40 —
 * najniższa w serwisie, mimo najmocniejszej merytoryki; rdzeń ekspercki
 * ZACHOWANY). Usunięte: fejkowy dashboard hero (licznik „124 875 PLN
 * NA ŻYWO" tykający co 2 s), symulowany „Security Scan" z werdyktem
 * „Twoja strona jest bezpieczna", badge „Critical Update 2024" (w 2026),
 * „Gwarancja poprawności", mojibake „Ĺąródło", procenty z ręki (40%/30%
 * → mechanika), suwak Excel→dashboard z Math.random (wróci, gdy będzie
 * PRAWDZIWY zanonimizowany zrzut Looker Studio od właściciela).
 * Cena: BRAK do czasu sekcji cennika analytics w CMS (decyzja właściciela).
 */
export const ANALYTICS_CONTENT = {
  seo: {
    title: 'Analityka webowa — GA4, Server-Side, Consent Mode v2 | Mixture',
    description:
      'Wdrożenia Google Analytics 4, Google Tag Manager, śledzenie Server-Side i Consent Mode v2. Dane, którym można ufać — zgodnie z RODO.',
    image: '/assets/images/server-side-tracking.png',
  },
  hero: {
    title: {
      line1: 'Przestań zgadywać.',
      line2: 'Zacznij mierzyć.',
    },
    description:
      'Większość firm ma dane — niewiele ma dane, którym można ufać. Wdrażamy architekturę analityczną, która pokazuje, skąd naprawdę przychodzą klienci i gdzie po drodze giną pieniądze.',
    cta: 'Zamów audyt danych',
  },
  painPoints: {
    title: 'Czy ufasz swoim danym?',
    description:
      'Błędna konfiguracja analityki to błędne decyzje biznesowe. Oto najczęstsze sygnały, że Twoje dane mogą kłamać.',
    items: [
      {
        title: 'Ryzyko prawne (RODO)',
        desc: 'Brak Consent Mode v2 to ryzyko kar i ograniczeń konta Google Ads. Strona musi szanować wybór użytkownika — nie tracąc przy tym możliwości pomiaru.',
      },
      {
        title: 'Dziurawy pomiar (iOS/AdBlock)',
        desc: 'Blokady w przeglądarkach ukrywają część konwersji przed klasycznymi skryptami. Bez pomiaru po stronie serwera nie wiesz, ile naprawdę sprzedajesz z reklam.',
      },
      {
        title: 'Błędna atrybucja',
        desc: 'Wszystkie zamówienia wpadają do „Direct"? Nie wiesz, czy sprzedał Facebook, czy Google — więc budżet dostaje ten kanał, który lepiej wygląda, a nie ten, który sprzedaje.',
      },
    ],
  },
  compliance: {
    title: {
      line1: 'Consent Mode v2',
      line2: 'to nie opcja.',
    },
    description:
      'Od marca 2024 Google wymaga Consent Mode v2 — bez niego tracisz listy remarketingowe w Google Ads i ryzykujesz niezgodność z RODO. To wdrożenie techniczno-prawne, nie kolejna wtyczka.',
    features: [
      {
        title: 'Audyt zgodności (RODO/Omnibus)',
        desc: 'Weryfikujemy politykę prywatności, klauzule w formularzach i baner cookies — od strony technicznej i treściowej.',
      },
      {
        title: 'Wdrożenie Consent Mode v2',
        desc: 'Konfiguracja w Google Tag Managerze: pomiar szanuje zgody użytkowników, a Google modeluje dane tam, gdzie zgody nie ma.',
      },
    ],
  },
  solutions: {
    title: 'Fundament techniczny',
    description:
      'Budujemy architekturę danych, która jest zgodna z prawem, odporna na blokady cookies i czytelna dla biznesu.',
    items: [
      {
        title: 'Google Analytics 4',
        subtitle: 'Źródło prawdy',
        desc: 'Kompletna konfiguracja zdarzeń e-commerce: nie tylko „zakup", ale też „dodanie do koszyka" i „rozpoczęcie płatności" — żeby znaleźć wąskie gardła.',
      },
      {
        title: 'Server-Side Tracking',
        subtitle: 'Pomiar mimo blokad',
        desc: 'Zdarzenia płyną bezpośrednio z serwera (GA4 Server-Side, CAPI) — pomiar nie znika razem z blokadą skryptów w przeglądarce.',
      },
      {
        title: 'Looker Studio',
        subtitle: 'Wizualizacja',
        desc: 'Dashboardy, które rozumie właściciel i dział marketingu. Kluczowe wskaźniki w jednym miejscu, dostępne 24/7.',
      },
      {
        title: 'Google Tag Manager',
        subtitle: 'Porządek w skryptach',
        desc: 'Zmiany w pomiarze bez angażowania programistów przy każdej drobnostce — szybciej i bez ryzyka dla wydajności strony.',
      },
      {
        title: 'Consent Mode v2',
        subtitle: 'Zgodność z prawem',
        desc: 'Tryb zgody Google: pomiar zgodny z RODO, a algorytmy reklamowe dostają modelowane dane tam, gdzie użytkownik zgody nie wyraził.',
      },
      {
        title: 'BigQuery',
        subtitle: 'Magazyn danych',
        desc: 'Dla e-commerce i B2B: dane ze sklepu, CRM i sprzedaży offline w jednej bazie — żeby liczyć realną wartość klienta, nie tylko sesje.',
      },
    ],
  },
  warehouse: {
    title: {
      line1: 'Online i offline',
      line2: 'w jednej bazie.',
    },
    description:
      'Dla klientów B2B i większego e-commerce: łączymy dane ze strony, systemu sprzedaży i CRM, żeby raporty marketingu i księgowości wreszcie mówiły to samo.',
    features: [
      {
        title: 'Jedno źródło prawdy',
        desc: 'Centralny magazyn danych zamiast trzech sprzecznych raportów. Koniec dyskusji „czyje liczby są prawdziwe".',
      },
      {
        title: 'Realna wartość klienta (LTV)',
        desc: 'Łączymy wizyty na stronie z zakupami — także offline — żeby widzieć, ile klient jest wart w czasie, a nie tylko przy pierwszym zakupie.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        q: 'Czy wdrożenie GA4 spowolni moją stronę?',
        a: 'Nie, jeśli jest zrobione poprawnie przez Google Tag Manager (GTM). GTM ładuje skrypty asynchronicznie — nie blokują one wyświetlania treści.',
      },
      {
        q: 'Co to jest Server-Side Tracking i czy go potrzebuję?',
        a: 'To metoda przesyłania danych z pominięciem przeglądarki użytkownika. Jest niezbędna, jeśli chcesz mieć wiarygodny pomiar w dobie blokad cookies (iOS, AdBlock) — szczególnie przy płatnych kampaniach.',
      },
      {
        q: 'Czy moje dane będą zgodne z RODO?',
        a: 'Wdrażamy Consent Mode v2, który zarządza zgodami użytkowników: analityka zbiera dane od osób, które wyraziły zgodę, a dla pozostałych Google stosuje modelowanie behawioralne.',
      },
      {
        q: 'Ile kosztuje wdrożenie analityki?',
        a: 'To zależy od zakresu: inna praca czeka przy prostej stronie usługowej, inna przy sklepie z magazynem danych. Po bezpłatnej rozmowie dostajesz konkretną wycenę z zakresem prac.',
      },
    ],
  },
  cta: {
    title: 'Odzyskaj kontrolę nad danymi.',
    text: 'Sprawdzimy, co dziś mierzy Twoja strona, czego nie mierzy i co z tego wynika dla Twoich decyzji. Bez zobowiązań.',
    button: 'Zamów audyt danych',
  },
};
