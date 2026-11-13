export const UX_AUDIT_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Design & UX',
    title: {
      line1: 'Audyt UX sklepu internetowego:',
      line2: 'dlaczego sklep nie sprzedaje?',
    },
    /** <title> strony (≤ 60 znaków, fraza „audyt UX sklepu internetowego” na początku). */
    seoTitle: 'Audyt UX sklepu internetowego: co sprawdzić i jak',
    subtitle:
      'Audyt UX sklepu internetowego: co sprawdzamy, jak wygląda krok po kroku i jakie błędy najczęściej zatrzymują zakup.',
  },
  lead: {
    highlight:
      'Wydajesz tysiące złotych na Facebook Ads i Google Ads. Statystyki rosną, użytkownicy wchodzą na stronę... i wychodzą. Koszyki są porzucane, a słupki sprzedaży stoją w miejscu.',
    text: 'Zanim zwolnisz agencję marketingową lub obniżysz ceny produktów, zadaj sobie pytanie: <strong>Czy w moim sklepie da się w ogóle wygodnie kupować?</strong>',
    support:
      '<strong>Szukasz wsparcia?</strong> Sprawdź naszą usługę <a href="/design/ui-ux/" class="text-secondary font-bold hover:underline">Projektowania UI/UX</a> lub zamów profesjonalny <a href="/design/visual-audit/" class="text-secondary font-bold hover:underline">Audyt Wizualny</a>.',
  },
  definition: {
    title: 'Czym właściwie jest Audyt UX?',
    subtitle: 'Definicja',
    text: 'Audyt UX sklepu internetowego (User Experience) to ocena tego, jak łatwo klient przechodzi od wejścia na stronę do opłaconego zamówienia. To nie jest opinia „czy strona jest ładna”. To analiza oparta na danych z analityki, obserwacji zachowań i <strong>10 heurystykach użyteczności Jakoba Nielsena</strong> (zasadach oceny interfejsu, źródło: Nielsen Norman Group, „10 Usability Heuristics for User Interface Design”).',
    ui: {
      title: 'UI (User Interface)',
      desc: 'Sklep wygląda nowocześnie, ma ładne kolory i zdjęcia.',
      analogy: 'Wygląd samochodu',
    },
    ux: {
      title: 'UX (User Experience)',
      desc: 'Sklep działa szybko, nawigacja jest intuicyjna, a zakup trwa 30 sekund.',
      analogy: 'Prowadzenie samochodu',
    },
  },
  killers: {
    title: 'Top 5 "Zabójców Konwersji"',
    subtitle: 'Najczęstsze Błędy',
    text: 'To błędy, które w audytach sklepów wracają najczęściej. Sprawdź, czy któryś z nich dotyczy Twojego sklepu.',
    mobile: {
      title: 'Koszmar na mobile',
      desc: 'W wielu sklepach większość wejść pochodzi z telefonów (sprawdzisz to w raporcie „Urządzenia” w Google Analytics 4). Jeśli Twój sklep to tylko „zmniejszona wersja” wersji na komputer, tracisz klientów dokładnie tam, gdzie jest ich najwięcej.',
    },
    forms: {
      title: 'Formularze, które odstraszają',
      bad: 'Wymaganie założenia konta przed zakupem (tzw. "Login Wall"). Pytania o "Nazwę firmy" przy zakupie prywatnym.',
      good: 'Zakupy jako Gość (Guest Checkout). Pasek postępu. Walidacja w czasie rzeczywistym.',
    },
    list: [
      {
        title: 'Zła Nawigacja',
        desc: 'Wyszukiwarka, która nie radzi sobie z literówkami i filtry, które nie działają.',
      },
      {
        title: 'Ukryte Koszty',
        desc: 'Informacja o drogiej dostawie dopiero w ostatnim kroku koszyka.',
      },
      { title: 'Brak Zaufania', desc: 'Brak opinii, brak polityki zwrotów, podejrzany wygląd.' },
    ],
  },
  checklist: {
    title: 'Co obejmuje audyt UX sklepu',
    subtitle: 'Zakres',
    text: 'Dobry audyt nie kończy się na liście uwag. Przechodzi przez całą ścieżkę klienta i ocenia każdy etap osobno, żeby było jasne, gdzie sklep traci zamówienia.',
    items: [
      {
        title: 'Strona główna i kategorie',
        desc: 'Czy w kilka sekund widać, co sklep sprzedaje, jak filtrować produkty i jak wrócić do poprzedniego widoku.',
      },
      {
        title: 'Karta produktu',
        desc: 'Zdjęcia, cena, dostępność, koszt dostawy i opinie w jednym miejscu, bez przewijania w poszukiwaniu odpowiedzi.',
      },
      {
        title: 'Koszyk i dostawa',
        desc: 'Czy koszt końcowy jest widoczny od początku, czy da się zmienić ilość i czy klient wie, ile jeszcze kroków przed nim.',
      },
      {
        title: 'Płatność i zakup',
        desc: 'Zakup bez konta, czytelne formularze, komunikaty o błędach i znane metody płatności.',
      },
      {
        title: 'Wyszukiwarka sklepu',
        desc: 'Literówki, synonimy, wyniki bez trafień i sortowanie: to, od czego często zaczyna się zakup.',
      },
      {
        title: 'Szybkość i dostępność',
        desc: 'Czas ładowania na telefonie, czytelność i obsługa klawiaturą.',
      },
    ],
  },
  process: {
    title: 'Jak wygląda audyt krok po kroku',
    subtitle: 'Przebieg',
    text: 'Pracujemy w czterech krokach. Pierwszy opiera się na liczbach, drugi na ocenie eksperta, trzeci na obserwacji ludzi, czwarty zamienia to w plan.',
    steps: [
      {
        title: 'Dane z analityki',
        desc: 'Z GA4 odczytujemy lejek zakupowy i miejsca, w których odpada najwięcej osób, osobno dla telefonu i komputera.',
      },
      {
        title: 'Przegląd ekspercki',
        desc: 'Przechodzimy ścieżkę zakupu według 10 heurystyk Nielsena i zapisujemy każdy problem z opisem i zrzutem ekranu.',
      },
      {
        title: 'Obserwacja użytkowników',
        desc: 'Mapy cieplne i nagrania sesji pokazują, co klienci robią naprawdę, a nie co deklarują.',
      },
      {
        title: 'Raport i priorytety',
        desc: 'Każda poprawka dostaje ocenę wpływu na sprzedaż i nakładu pracy, więc od razu wiadomo, co zrobić w pierwszej kolejności.',
      },
    ],
  },
  tools: {
    title: 'Narzędzia Detektywa',
    subtitle: 'Jak znajdujemy błędy?',
    text: 'Nie zgadujemy. Używamy technologii, by zobaczyć to, czego nie widać gołym okiem.',
    items: [
      {
        title: 'Mapy Cieplne',
        desc: 'Widzimy "Rage Clicks" (wściekłe kliknięcia) i elementy, które użytkownicy ignorują.',
      },
      {
        title: 'Nagrania Sesji',
        desc: 'Oglądamy (anonimowo), jak realni ludzie gubią się w menu lub nie mogą kliknąć przycisku.',
      },
      {
        title: 'Analiza Lejka',
        desc: 'GA4 pokazuje nam dokładnie, w którym kroku (Koszyk → Dostawa → Płatność) odpada najwięcej osób.',
      },
    ],
  },
  roi: {
    title: 'ROI: Czy to się opłaca?',
    subtitle: 'Zwrot z Inwestycji',
    text: 'Każda poprawka w sklepie ma sens tylko wtedy, gdy zwiększa liczbę zamówień. Dlatego audyt zaczyna się od liczb z Twojej analityki, a nie od opinii o wyglądzie. Poniżej dwa powody, dla których to zwykle się opłaca.',
    cards: [
      {
        label: 'Koszt Naprawy',
        text: 'Błąd wychwycony na etapie makiety jest tańszy niż ten sam błąd poprawiany w gotowym kodzie. <strong class="text-red-700 text-lg">Audyt przed przebudową</strong> pozwala wprowadzić tylko te zmiany, które mają wpływ na sprzedaż.',
      },
      {
        label: 'Efekt Skali',
        text: 'Przy tym samym ruchu wzrost konwersji z 1% do 2% to <strong class="text-emerald-700 text-lg">2x więcej zamówień</strong> bez zwiększania budżetu na reklamy (prosty rachunek, a nie obietnica wyniku).',
      },
    ],
  },
  related: {
    text: 'Zanim zamówisz audyt, sprawdź też:',
    cost: {
      label: 'Ile kosztuje strona internetowa w Rzeszowie w 2026 roku',
      href: '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026/',
    },
    speed: {
      label: 'Core Web Vitals 2025: nowy standard Google Lighthouse',
      href: '/baza-wiedzy/core-web-vitals-2025/',
    },
  },
  cta: {
    title: 'Przestań zgadywać, zacznij sprzedawać.',
    text: 'Zamów audyt UX. Wskażemy wąskie gardła w ścieżce zakupu i przygotujemy plan poprawek uporządkowany według wpływu na sprzedaż.',
    primaryBtn: 'Zamów audyt UX',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
