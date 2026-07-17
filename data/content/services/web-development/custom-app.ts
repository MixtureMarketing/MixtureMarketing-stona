/**
 * Treść strony /web-development/custom-app/ — przepisana 2026-07-16 po krytyce
 * dual-agent (16/40) i decyzjach właściciela:
 * - kotwica „od 25 000 zł" zostaje; dochodzi „płatność etapami" (obietnica z huba),
 * - SLA/uptime: WSZYSTKIE procenty usunięte (decyzja właściciela — SLA to osobna
 *   płatna umowa serwisowa; wolno o tym mówić tylko tym zdaniem),
 * - stack tylko potwierdzony: Go i AWS WYCIĘTE (odrzucone wprost),
 * - zespół zgodnie z prawdą: Jakub = analityk biznesowy i PM (jeden punkt
 *   kontaktu), koduje zespół developerów, czasem sprawdzeni zewnętrzni,
 * - proces z odpowiedzi właściciela: darmowa rozmowa → widełki w 24 h; przy
 *   złożonych projektach płatny warsztat wymagań u klienta (online taniej).
 */

export const CUSTOM_WEB_APP_CONTENT = {
  seo: {
    title: 'Aplikacje webowe i systemy dedykowane | Mixture Marketing',
    description:
      'Budujemy systemy, których nie ma w pudełku: portale B2B, systemy rezerwacji, CRM/ERP i SaaS. Node.js, Python, Laravel, React, PostgreSQL. Repozytorium od pierwszego dnia i pełne prawa autorskie.',
    image: '/assets/images/backend.png',
  },
  hero: {
    /** Echo karty z tryptyku huba — spójność hub→spoke. */
    title: {
      line1: 'System, którego',
      line2: 'nie ma w pudełku.',
    },
    description:
      'Twój biznes wyrósł z Excela? Gotowy program ma za mało funkcji albo kosztuje fortunę przy Twojej skali? Budujemy systemy dopasowane do Twoich procesów — nie odwrotnie.',
  },
  /**
   * Dowód: KorepetytorAI (StudentPI) — prawdziwy SaaS z portfolio (PRODUCT.md:
   * React+Laravel z AI). Obrazy ZWERYFIKOWANE oczami 2026-07-16 (prawdziwe UI,
   * zero Lorem ipsum) i przypięte po _ref — podpis nigdy nie trafi pod cudzy
   * obraz. Aplikacja działa publicznie: studentpi.pl.
   */
  proof: {
    title: 'Prawdziwa aplikacja, nie makieta.',
    description:
      'KorepetytorAI (StudentPI) to platforma do nauki matematyki, którą zbudowaliśmy od zera: kursy, interaktywne ćwiczenia, asystent AI i śledzenie postępów ucznia. React na froncie, Laravel na zapleczu — aplikacja działa publicznie pod adresem studentpi.pl.',
    figures: [
      {
        ref: 'image-0a94d2d9c79ab9a503686ab2309f3d2a1f4c0304-1920x850-png',
        alt: 'Ekran główny aplikacji KorepetytorAI: nawigacja z sekcjami Moje Postępy i Kursy oraz nagłówek „Opanuj Matematykę z KorepetytorAI”',
        caption: 'Ekran startowy — kursy, postępy i konto ucznia w jednym miejscu.',
      },
      {
        ref: 'image-2e6a19986b2b651a6fa64aef0dc676a519da9c03-1920x3315-png',
        /** Kadr z długiego zrzutu: sekcja „Kluczowe Funkcjonalności Platformy". */
        rect: { x: 0, y: 660, w: 1920, h: 850 },
        alt: 'Podstrona funkcji KorepetytorAI: karty Inteligentny Asystent AI, Interaktywne Ćwiczenia, Śledzenie Postępów i Grywalizacja, Dopasowane Poziomy Nauczania',
        caption: 'Funkcje platformy — asystent AI, ćwiczenia i grywalizacja postępów.',
      },
    ],
    linkLabel: 'Zobacz case study: KorepetytorAI',
    linkTo: '/portfolio/studentpi',
  },
  useCases: {
    title: 'Co możemy dla Ciebie zbudować?',
    description:
      'Nie ograniczamy się do jednej branży. Budujemy narzędzia, które oszczędzają czas, automatyzują pracę i porządkują procesy.',
    items: [
      {
        title: 'Portal B2B',
        desc: 'Automatyzacja zamówień hurtowych: indywidualne cenniki, historia faktur, stany magazynowe na żywo. Zintegrowany z Twoim ERP (Subiekt, Comarch).',
      },
      {
        title: 'System rezerwacji',
        desc: 'Dla branży usługowej i medycznej: kalendarze, powiadomienia SMS, płatności online i grafiki pracowników.',
      },
      {
        title: 'CRM / ERP na miarę',
        desc: 'Obieg dokumentów, zarządzanie flotą, HR albo produkcją — dokładnie pod Twój proces, bez funkcji, za które płacisz, a których nie używasz.',
      },
      {
        title: 'SaaS od pierwszej wersji',
        desc: 'Masz pomysł na produkt? Budujemy pierwszą działającą wersję (MVP), z którą możesz wejść na rynek i rozmawiać z inwestorami.',
      },
    ],
  },
  /** Proces przedsprzedażowy — słowa właściciela (2026-07-16). Realna sekwencja. */
  start: {
    title: 'Jak zaczynamy — zanim wydasz złotówkę.',
    description:
      'Przy systemach dedykowanych największym ryzykiem nie jest kod, tylko źle odkryte wymagania. Dlatego zaczynamy od rozmowy, nie od umowy.',
    steps: [
      {
        title: 'Darmowa rozmowa',
        desc: 'Bez zobowiązań. Opowiadasz, jak pracujesz i co Cię boli — my mówimy, co jest możliwe. W 24 godziny dostajesz wstępne widełki.',
      },
      {
        title: 'Warsztat wymagań — przy złożonych projektach',
        desc: 'Przyjeżdżamy do Twojej firmy i rozmawiamy z ludźmi, którzy będą z systemu korzystać — od osób decyzyjnych po pracowników. Tak odkrywamy wymagania, o których nikt nie pomyślał przy biurku. Warsztat jest płatny (zależnie od zakresu, liczby osób i czasu trwania); wersja online jest tańsza.',
      },
      {
        title: 'Wycena właściwa i płatność etapami',
        desc: 'Po rozmowie albo warsztacie dostajesz konkretny zakres i wycenę. Płacisz za etapy, które widzisz działające — nie wszystko z góry.',
      },
    ],
  },
  /**
   * Wyłącznie zakres potwierdzony przez właściciela (lista tak/nie z huba).
   * Go i AWS odrzucone wprost — NIE przywracać. Linki do bazy wiedzy = ruch
   * wewnętrzny, zostają per kategoria.
   */
  techStack: {
    title: 'Technologie, którym ufamy.',
    description:
      'Dobieramy narzędzia do problemu — z tego samego warsztatu, który pokazujemy na stronie Web Development. Każda kategoria ma w bazie wiedzy swój przewodnik.',
    groups: [
      {
        label: 'Backend',
        link: '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto',
        items: ['Node.js', 'Python (Django)', 'Laravel'],
      },
      {
        label: 'Front',
        link: '/baza-wiedzy/frontend-bez-tajemnic-kompendium-cto',
        items: ['React', 'Next.js', 'Vue.js', 'Tailwind'],
      },
      {
        label: 'Dane',
        link: '/baza-wiedzy/bazy-danych-kompendium-architekta',
        items: ['PostgreSQL', 'Redis', 'MongoDB', 'Elasticsearch'],
      },
      {
        label: 'Zaplecze',
        link: '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
        items: ['Docker', 'Kubernetes', 'CI/CD', 'Cloudflare'],
      },
    ],
  },
  trust: {
    title: 'Kod jest Twój. Od pierwszej linijki.',
    description:
      'Największa obawa przy systemach dedykowanych? Uzależnienie od wykonawcy. Działamy odwrotnie — wszystko, co powstaje, od początku należy do Ciebie.',
    items: [
      {
        title: 'Żadnego uzależnienia od nas',
        desc: 'Nie szyfrujemy i nie ukrywamy kodu. Piszemy w popularnych technologiach (React, Node.js, Python, Laravel), które rozwinie każdy kompetentny programista.',
      },
      {
        title: 'Dokumentacja techniczna',
        desc: 'Dostajesz dokumentację API, schemat bazy danych i instrukcję wdrożenia. To Twoja polisa na wypadek, gdybyśmy kiedyś się rozstali.',
      },
      {
        title: 'Repozytorium na własność',
        desc: 'Dostęp do repozytorium kodu masz od pierwszego dnia i widzisz postępy na żywo. Po odbiorze przekazujemy pełne prawa autorskie.',
      },
    ],
    /** Rozszerzenie pieczęci huba o dokumentację — zgodnie z PRODUCT.md
        (dokumentacja techniczna TYLKO przy systemach dedykowanych). */
    seal: 'Repozytorium kodu od pierwszego dnia i pełne prawa autorskie po odbiorze — a przy systemach dedykowanych także dokumentacja API, schemat bazy i instrukcja wdrożenia.',
  },
  qa: {
    title: 'Jakość wpisana w proces',
    description: 'Nie testujemy na produkcji. Każda zmiana przechodzi tę samą drogę:',
    steps: [
      {
        step: 'Przegląd kodu',
        desc: 'Każdą zmianę sprawdza drugi programista, zanim trafi dalej.',
      },
      {
        step: 'Testy automatyczne',
        desc: 'Testy jednostkowe i E2E wyłapują błędy, zanim zobaczy je użytkownik.',
      },
      {
        step: 'Środowisko testowe',
        desc: 'Zmiany oglądasz na kopii produkcji i zatwierdzasz, zanim wejdą na żywo.',
      },
      {
        step: 'Wdrożenie bez przestojów',
        desc: 'Aktualizacje wchodzą bez wyłączania systemu.',
      },
    ],
  },
  /** Utrzymanie + jedyne dozwolone zdanie o SLA (decyzja właściciela). */
  maintenance: {
    title: 'Co po wdrożeniu',
    lines: [
      'Utrzymanie systemu możesz zamówić u nas albo u kogokolwiek innego — kod, dokumentacja i repozytorium są Twoje.',
      'Gwarantowany czas reakcji (SLA) to osobna umowa serwisowa, którą wyceniamy do projektu — nie obiecujemy procentów, których nie podpisaliśmy.',
    ],
  },
  cta: {
    title: 'Porozmawiajmy o Twoim systemie.',
    description:
      'Zaczynamy od darmowej, niezobowiązującej rozmowy — w 24 godziny dostajesz wstępne widełki. Przy złożonych projektach zaproponujemy warsztat wymagań u Ciebie w firmie.',
    button: 'Umów darmową rozmowę',
  },
  faqs: [
    {
      q: 'Ile trwa budowa systemu dedykowanego?',
      a: 'Najmniejsze wdrożenia zaczynają się od około 3 miesięcy. Konkretny harmonogram powstaje po rozmowie albo warsztacie wymagań — dzielimy go na etapy, więc pierwsze działające fragmenty widzisz szybko.',
    },
    {
      q: 'Jak wygląda płatność?',
      a: 'Etapami. Projekt dzielimy na odbierane fragmenty — płacisz za etap, który widzisz działający na środowisku testowym. Model rozliczenia (stała cena albo stawka godzinowa) dobieramy do charakteru projektu.',
    },
    {
      q: 'Czym jest warsztat wymagań i ile kosztuje?',
      a: 'To spotkanie w Twojej firmie (możliwe też online — taniej), na którym rozmawiamy z osobami decyzyjnymi i pracownikami, żeby odkryć rzeczywiste wymagania systemu. Wyceniamy go zależnie od zakresu, liczby zaangażowanych osób i czasu trwania. Przy prostszych projektach wystarczy rozmowa i widełki w 24 godziny.',
    },
    {
      q: 'Czy kod i dokumentacja będą moje?',
      a: 'Tak. Repozytorium widzisz od pierwszego dnia, a po odbiorze przekazujemy pełne prawa autorskie. Przy systemach dedykowanych dostajesz też dokumentację API, schemat bazy danych i instrukcję wdrożenia.',
    },
    {
      q: 'Co z utrzymaniem i gwarancją czasu reakcji (SLA)?',
      a: 'Utrzymanie możesz zamówić u nas albo u dowolnego wykonawcy — nic Cię z nami nie wiąże. Gwarantowany czas reakcji (SLA) to osobna umowa serwisowa, wyceniana do projektu.',
    },
  ],
};
