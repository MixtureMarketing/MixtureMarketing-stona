/**
 * Treść strony /web-development/systemy-ai-aplikacje/ (MIX-1272, plan SEO A18).
 * STRONA UKRYTA do akceptacji Jakuba: noindex, poza sitemapą i menu (routes.js → prerenderOnlyRoutes).
 *
 * Źródła faktów (wszystko inne to opis procesu, nie liczby):
 * - opisy projektów bez nazw klientów: `PROJEKTY-OPISY.md` (MIX-895); zgoda na nazwy czeka na decyzję A17,
 *   więc `clientName` jest zawsze `null` — po zgodzie wystarczy wpisać nazwę i podmienić `label`;
 * - kwoty i czasy („od 23 000 zł”, „od 19 000 zł”, „od 3 miesięcy”, płatność etapami): te same co na
 *   /web-development/custom-app/ (kalkulator /wycena/, MIX-923) — patrz custom-app.ts;
 * - KorepetytorAI: publiczna realizacja już opisana na /portfolio/studentpi/ i w custom-app.ts;
 * - zasięg „Rzeszów, Podkarpacie i cała Polska”: public/llms.txt.
 * Teksty do akceptacji Jakuba.
 */

export interface AiCase {
  id: string;
  /** Opis klienta bez nazwy (do czasu zgody A17). */
  label: string;
  /** Nazwa klienta po zgodzie (A17); do tego czasu null i nigdzie nie jest renderowana. */
  clientName: string | null;
  problem: string;
  solution: string;
  tech: string;
  stage: string;
}

export const AI_SYSTEMS_PATH = '/web-development/systemy-ai-aplikacje/';

export const AI_SYSTEMS_CONTENT = {
  seo: {
    title: 'Systemy AI i aplikacje dedykowane | Mixture Marketing',
    description:
      'Budujemy aplikacje i systemy z elementami AI: asystenta, rekomendacje, obieg zgłoszeń. Zaczynamy od rozmowy, płacisz etapami, kod jest Twój.',
    image: '/assets/images/backend.png',
  },
  hero: {
    title: { line1: 'Systemy AI i aplikacje,', line2: 'zbudowane pod Twój proces.' },
    description:
      'Wiedza zostaje w głowach pracowników, a zgłoszenia, grafiki i raporty żyją w kilku narzędziach? Budujemy aplikacje i systemy z elementami AI tam, gdzie ręczna praca kosztuje Cię najwięcej czasu.',
    priceHint:
      'aplikacja dedykowana od 23 000 zł · elementy AI wyceniamy do projektu · płatność etapami',
  },
  offer: {
    title: 'Co możemy zbudować?',
    description:
      'AI nie jest celem samym w sobie. Dodajemy je tam, gdzie realnie skraca pracę, a resztę systemu robimy tak samo solidnie jak każdą aplikację dedykowaną.',
    items: [
      {
        title: 'Asystent w codziennej pracy',
        desc: 'Podpowiedzi i rekomendacje dla pracowników, np. jakie ustawienia maszyny poprawić po zgłoszeniu wady albo który dokument jest potrzebny na kolejnym kroku.',
      },
      {
        title: 'Obieg zgłoszeń i zmian',
        desc: 'Zgłaszanie spraw w kilku dotknięciach, historia każdej zmiany i jej skutku, powiadomienia. Koniec z arkuszami i wiadomościami na komunikatorze.',
      },
      {
        title: 'Platforma dla uczestników lub klientów',
        desc: 'Kursy, testy, dokumenty i certyfikaty w jednym miejscu, z jednym logowaniem i panelem administratora z zaproszeniami.',
      },
      {
        title: 'Panele, raporty i integracje',
        desc: 'Statystyki dla kierownika, role i uprawnienia, eksport danych oraz połączenie z narzędziami, których już używasz.',
      },
    ],
  },
  casesSection: {
    title: 'Z czym już pracowaliśmy',
    description:
      'Krótkie opisy naszych projektów. Nazwy klientów podamy, gdy będziemy mogli je publicznie wymienić.',
  },
  cases: [
    {
      id: 'asystent-produkcja',
      label: 'Zakład produkcji tworzyw sztucznych',
      clientName: null,
      problem:
        'Gdy na wtryskarce pojawia się wada wypraski, ustawiacz poprawia nastawy z pamięci i metodą prób. Wiedza zostaje w głowach, a każda próba kosztuje czas i materiał.',
      solution:
        'System prowadzi ustawiacza od zgłoszenia wady do zmiany nastaw: terminal przy maszynie z ekranem dotykowym i obsługą w rękawicach, podpowiedź silnika rekomendacji oraz zapis każdej zmiany i jej skutku. Kierownik ma panel ze statystykami, a system działa także bez internetu na hali.',
      tech: 'Aplikacja desktopowa na Windows, serwer w zakładzie z lokalną bazą, silnik rekomendacji w Pythonie, chmura w kontenerach.',
      stage: 'Wersja testowa działa na danych próbnych; trwają odbiory częściowe.',
    },
    {
      id: 'platforma-szkoleniowa',
      label: 'Organizacja prowadząca szkolenia i staże',
      clientName: null,
      problem:
        'Kursy, staże i dokumenty były rozproszone w wielu narzędziach, a uczestnik nie miał jednej ścieżki od zaproszenia do certyfikatu.',
      solution:
        'Platforma zbiera całą ścieżkę w jednym miejscu: kursy i testy, webinary, elektroniczny dziennik stażu z wglądem mentora, obieg dokumentów, certyfikaty i jedno logowanie do kilku aplikacji. Nowe funkcje wchodzą wyłączone, a włącza je klient po własnym teście.',
      tech: 'Aplikacja webowa (PHP/Laravel, React/Next.js), baza PostgreSQL, wspólne logowanie (SSO), kontenery Docker.',
      stage: 'Działa produkcyjnie i jest rozwijana kolejnymi wydaniami.',
    },
  ] satisfies AiCase[],
  proof: {
    title: 'Aplikacja z asystentem AI, którą znasz z sieci',
    description:
      'KorepetytorAI (StudentPI) to platforma do nauki matematyki, którą zbudowaliśmy od zera: kursy, interaktywne ćwiczenia, asystent AI i śledzenie postępów ucznia. Działa publicznie pod adresem studentpi.pl.',
    linkLabel: 'Zobacz case study: KorepetytorAI',
    linkTo: '/portfolio/studentpi/',
  },
  process: {
    title: 'Jak zaczynamy',
    description:
      'Największym ryzykiem w takich projektach nie jest kod, tylko źle odkryte wymagania. Dlatego zaczynamy od rozmowy, a nie od umowy.',
    steps: [
      {
        title: 'Darmowa rozmowa',
        desc: 'Opowiadasz, jak pracujesz i co Cię boli. My mówimy, co jest możliwe i czy AI w ogóle jest tu potrzebne. W 24 godziny dostajesz wstępne widełki.',
      },
      {
        title: 'Warsztat wymagań, przy złożonych projektach',
        desc: 'Rozmawiamy z ludźmi, którzy będą korzystać z systemu, od osób decyzyjnych po pracowników. Warsztat jest płatny (zależnie od zakresu i liczby osób), wersja online jest tańsza.',
      },
      {
        title: 'Wycena właściwa i płatność etapami',
        desc: 'Dostajesz konkretny zakres i cenę. Płacisz za etapy, które widzisz działające na środowisku testowym, a nie wszystko z góry.',
      },
      {
        title: 'Wersja testowa, odbiory i rozwój',
        desc: 'Pierwszą działającą wersję oglądasz wcześnie. Kolejne funkcje wchodzą po odbiorach, a nowe możliwości włączamy dopiero po Twoim teście.',
      },
    ],
  },
  quality: {
    title: 'Jakość i bezpieczeństwo w procesie',
    items: [
      {
        title: 'Testy i niezależna weryfikacja',
        desc: 'Każde wydanie przechodzi testy automatyczne i weryfikację przed wgraniem. Nie testujemy na produkcji.',
      },
      {
        title: 'Dane pod kontrolą',
        desc: 'Przed startem ustalamy, jakie dane system przetwarza i gdzie je przechowuje. Przy danych osobowych omawiamy zasady ich ochrony i umowę powierzenia.',
      },
      {
        title: 'Kod jest Twój',
        desc: 'Repozytorium widzisz od pierwszego dnia, a po odbiorze przekazujemy pełne prawa autorskie wraz z dokumentacją.',
      },
    ],
  },
  related: {
    title: 'Zobacz także',
    items: [
      {
        label: 'Aplikacje dedykowane',
        desc: 'Pełna oferta systemów na zamówienie, technologie i cennik.',
        to: '/web-development/custom-app/',
      },
      {
        label: 'Kalkulator wyceny',
        desc: 'Policz widełki dla swojej aplikacji w około minutę.',
        to: '/wycena/',
      },
      {
        label: 'Realizacje',
        desc: 'Projekty, które zbudowaliśmy dla klientów.',
        to: '/portfolio/',
      },
      {
        label: 'Bazy danych: kompendium architekta',
        desc: 'Jak wybrać bazę pod system, który ma rosnąć.',
        to: '/baza-wiedzy/bazy-danych-kompendium-architekta/',
      },
    ],
  },
  cta: {
    title: 'Porozmawiajmy o Twoim systemie.',
    description:
      'Zaczynamy od darmowej, niezobowiązującej rozmowy. W 24 godziny dostajesz wstępne widełki.',
    button: 'Umów darmową rozmowę',
  },
  faqs: [
    {
      q: 'Czy do mojej firmy potrzebne jest AI?',
      a: 'Nie zawsze. Na rozmowie sprawdzamy, czy problem rozwiąże zwykła aplikacja, czy elementy AI realnie skrócą pracę. Jeśli AI nie jest potrzebne, powiemy to wprost i wycenimy samą aplikację.',
    },
    {
      q: 'Ile kosztuje aplikacja z elementami AI?',
      a: 'Aplikacje dedykowane zaczynają się od 23 000 zł, a portal B2B od 19 000 zł. Elementy AI wyceniamy do projektu, bo zależą od zakresu i danych. Widełki dostajesz w 24 godziny po rozmowie, a płacisz etapami.',
    },
    {
      q: 'Ile trwa budowa takiego systemu?',
      a: 'Najmniejsze wdrożenia zaczynają się od około 3 miesięcy. Konkretny harmonogram powstaje po rozmowie albo warsztacie wymagań, dzielimy go na etapy, więc pierwsze działające fragmenty widzisz szybko.',
    },
    {
      q: 'Co z moimi danymi?',
      a: 'Zanim zaczniemy, ustalamy, jakie dane system przetwarza i gdzie je przechowuje. Przy danych osobowych omawiamy zasady ich ochrony i podpisujemy umowę powierzenia. To zapisujemy w umowie projektu.',
    },
    {
      q: 'Czy kod i dokumentacja będą moje?',
      a: 'Tak. Repozytorium widzisz od pierwszego dnia, a po odbiorze przekazujemy pełne prawa autorskie. Dostajesz też dokumentację API, schemat bazy danych i instrukcję wdrożenia.',
    },
    {
      q: 'Czy pracujecie z firmami spoza Rzeszowa?',
      a: 'Tak. Obsługujemy klientów z Rzeszowa, Podkarpacia i całej Polski. Rozmowy i kolejne etapy prowadzimy zdalnie, a warsztat wymagań możemy zrobić u Ciebie w firmie.',
    },
  ],
};
