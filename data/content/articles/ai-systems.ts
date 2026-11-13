/**
 * Treść artykułu „Aplikacje dedykowane z AI: kiedy firma naprawdę ich potrzebuje” (MIX-1280, plan SEO A34).
 * ARTYKUŁ UKRYTY do akceptacji Jakuba: noindex, poza sitemapą, listą Bazy wiedzy i menu
 * (routes.js → prerenderOnlyRoutes, brak wpisu w services/cms/legacyArticles.ts).
 * Ten sam tekst, do akceptacji, jest w docs/tresci/MIX-1280.md (test pilnuje zgodności).
 *
 * Fraza główna: „aplikacje dedykowane” (+ „aplikacje internetowe Rzeszów”; frazy z danych GSC planu SEO, S4:184, S5:63).
 *
 * Źródła faktów (wszystko inne to opis procesu i ogólna wiedza, bez liczb):
 * - „od 23 000 zł”, „od 19 000 zł”, „od 3 miesięcy”, płatność etapami, płatny warsztat wymagań,
 *   widełki w 24 godziny, repozytorium od pierwszego dnia, prawa autorskie: data/content/services/web-development/custom-app.ts
 *   (kalkulator /wycena/, MIX-923) i ai-systems.ts (MIX-1272);
 * - KorepetytorAI (asystent AI, studentpi.pl): custom-app.ts (`proof`), /portfolio/studentpi/;
 * - opisy projektów bez nazw klientów (zakład produkcyjny, platforma szkoleniowa): ai-systems.ts (PROJEKTY-OPISY.md, MIX-895).
 * Nazw klientów nie ma (zgody: MIX-1325); test tego pilnuje.
 */

export const AI_ARTICLE_SLUG = '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/';
export const AI_ARTICLE_ID = 'aplikacje-dedykowane-z-ai';
/** Data szkicu; przy publikacji ustawić realną datę publikacji (patrz docs/tresci/MIX-1280.md). */
export const AI_ARTICLE_PUBLISHED = '2026-11-13';

export interface AiArticleSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const AI_ARTICLE_CONTENT = {
  header: {
    title: 'Aplikacje dedykowane z AI: kiedy firma naprawdę ich potrzebuje',
    seoTitle: 'Aplikacje dedykowane z AI: kiedy warto je zamówić',
    subtitle:
      'AI w firmowej aplikacji nie jest celem samym w sobie. Sprawdź, w jakich sytuacjach dedykowany system z elementami AI się opłaca, a kiedy wystarczy zwykła aplikacja albo gotowe narzędzie.',
  },
  lead: {
    highlight:
      'Dedykowana aplikacja z elementami AI ma sens wtedy, gdy ręczna, powtarzalna praca kosztuje Twoją firmę więcej niż jej zbudowanie. W pozostałych przypadkach AI jest tylko modnym dodatkiem.',
    text: 'Poniżej opisujemy, jak to rozpoznać: od pytań, które warto sobie zadać przed rozmową z wykonawcą, przez przykłady zastosowań, po koszty i przebieg projektu. Piszemy to z perspektywy firmy, która buduje takie systemy na zamówienie, więc wskazujemy też sytuacje, w których nie warto ich zamawiać.',
  },
  sections: [
    {
      title: 'Czym jest aplikacja dedykowana z elementami AI',
      paragraphs: [
        'Aplikacja dedykowana to system napisany pod proces konkretnej firmy, a nie licencja na gotowe narzędzie. Ma własne dane, role użytkowników i logikę dopasowaną do tego, jak pracujecie. Dzięki temu nie dopasowujesz firmy do programu, tylko program do firmy.',
        'Elementy AI to funkcje, które pomagają w pracy: asystent odpowiadający na pytania pracowników, podpowiedź kolejnego kroku, klasyfikacja zgłoszeń, wyszukiwanie w dokumentach firmowych. Taka funkcja jest jednym z modułów aplikacji, a resztę systemu (logowanie, uprawnienia, historia zmian, raporty) trzeba zrobić tak samo solidnie jak w każdym innym projekcie.',
        'To rozróżnienie jest ważne, bo większość kosztu i ryzyka leży w zwykłej inżynierii: w danych, uprawnieniach i testach. Sama funkcja AI bywa najmniejszą częścią systemu.',
      ],
    },
    {
      title: 'Kiedy dedykowany system z AI się opłaca',
      paragraphs: [
        'Z naszych projektów wynika kilka powtarzalnych sygnałów, że warto rozważyć własny system. Im więcej z nich rozpoznajesz u siebie, tym mocniejszy argument.',
      ],
      bullets: [
        'Wiedza siedzi w głowach pracowników. Doświadczeni ludzie wiedzą, co poprawić, gdy coś idzie nie tak, ale nigdzie tego nie zapisano, a odejście jednej osoby oznacza utratę wiedzy.',
        'Zgłoszenia, grafiki i raporty żyją w kilku narzędziach. Arkusze, komunikator i poczta nie dają jednej historii sprawy, więc czas ucieka na szukanie informacji.',
        'Gotowe narzędzie wymusza obejścia. Kupiony program robi większość potrzebnych rzeczy, a resztę ktoś uzupełnia ręcznie w arkuszu.',
        'Proces jest specyficzny dla Twojej branży lub zakładu i nie występuje w standardowym oprogramowaniu.',
        'Dane są wrażliwe lub muszą zostać u Ciebie. Własny system pozwala zdecydować, gdzie je przechowywać i kto ma do nich dostęp.',
      ],
    },
    {
      title: 'Przykłady zastosowań z naszych projektów',
      paragraphs: [
        'Pierwszy przykład to zakład produkcji tworzyw sztucznych. Gdy na wtryskarce pojawia się wada wypraski, ustawiacz poprawia nastawy z pamięci i metodą prób, a każda próba kosztuje czas i materiał. Zbudowaliśmy system, który prowadzi go od zgłoszenia wady do zmiany nastaw: terminal przy maszynie z ekranem dotykowym obsługiwanym w rękawicach, podpowiedź silnika rekomendacji oraz zapis każdej zmiany i jej skutku. Kierownik widzi statystyki, a system działa także wtedy, gdy na hali nie ma internetu.',
        'Drugi przykład to platforma dla organizacji prowadzącej szkolenia i staże. Kursy, testy, dokumenty i certyfikaty były rozproszone w wielu narzędziach. Platforma zbiera całą ścieżkę uczestnika w jednym miejscu, z jednym logowaniem do kilku aplikacji. Nowe funkcje wchodzą do niej wyłączone, a włącza je klient po własnym teście.',
        'Trzeci przykład jest publicznie dostępny. KorepetytorAI to platforma do nauki matematyki z asystentem AI, interaktywnymi ćwiczeniami i śledzeniem postępów ucznia, którą zbudowaliśmy od zera. Możesz ją obejrzeć pod adresem studentpi.pl, a jej opis znajdziesz w <a href="/portfolio/studentpi/">case study KorepetytorAI</a>.',
        'Nazw klientów z dwóch pierwszych przykładów nie podajemy, bo nie mamy jeszcze zgody na ich publiczne wymienianie.',
      ],
    },
    {
      title: 'Kiedy AI nie jest potrzebne',
      paragraphs: [
        'Najczęstsza odpowiedź na pytanie „czy potrzebuję AI” brzmi: nie zawsze. Jeśli problem polega na tym, że zgłoszenia giną w poczcie, wystarczy zwykły obieg zgłoszeń z historią i powiadomieniami. AI niczego tu nie przyspieszy, a doda koszt i ryzyko błędnych podpowiedzi.',
        'Elementy AI warto dodać dopiero wtedy, gdy jest dość danych, na których mogą się uczyć lub z których mogą korzystać, a ich błędna odpowiedź nie ma poważnych skutków albo jest sprawdzana przez człowieka. Dlatego na pierwszej rozmowie sprawdzamy, czy rozwiąże to zwykła aplikacja. Jeśli AI nie jest potrzebne, mówimy to wprost i wyceniamy samą aplikację.',
        'Gotowe narzędzie też bywa dobrym wyborem. Jeśli standardowy program pokrywa Twój proces, zamawianie własnego systemu to wydatek bez uzasadnienia. Dedykowana aplikacja zaczyna się opłacać, gdy standard przestaje wystarczać.',
      ],
    },
    {
      title: 'Jak sprawdzić, czy aplikacja się zwróci',
      paragraphs: [
        'Zanim zamówisz system, policz koszt obecnego sposobu pracy. Nie potrzebujesz do tego skomplikowanych modeli, wystarczy prosta tabelka z danymi z Twojej firmy.',
      ],
      bullets: [
        'Ile godzin tygodniowo zajmuje dziś ręczne wykonywanie danego procesu i ile osób w nim uczestniczy.',
        'Ile kosztuje jeden błąd: poprawka, reklamacja, zmarnowany materiał albo stracony klient.',
        'Co się dzieje, gdy kluczowa osoba jest na urlopie lub odchodzi z firmy.',
        'Ile kosztują dziś licencje na narzędzia, które aplikacja mogłaby zastąpić, i obejścia, które z nich wynikają.',
      ],
    },
    {
      title: 'Jak ocenić zwrot z takiej inwestycji',
      paragraphs: [
        'Zestaw te liczby z ceną z wyceny. Jeśli oszczędność czasu i błędów w rozsądnym okresie pokrywa koszt projektu, aplikacja ma uzasadnienie biznesowe. Jeśli nie, lepiej zacząć od mniejszego zakresu albo od zmiany samego procesu.',
        'Dlatego dzielimy projekty na etapy. Pierwszy etap obejmuje to, co daje największy efekt przy najmniejszym zakresie, a o kolejnych decydujesz, gdy widzisz działającą wersję. Takie podejście zmniejsza ryzyko, że wydasz budżet na funkcje, z których nikt nie korzysta.',
        'Pamiętaj też o kosztach po wdrożeniu: utrzymaniu, aktualizacjach i rozwoju. System używany codziennie będzie wymagał zmian, bo zmienia się firma, jej klienci i przepisy. Uwzględnij to w planie od początku, zamiast traktować aplikację jak zakup jednorazowy.',
      ],
    },
    {
      title: 'Ile kosztuje aplikacja dedykowana i jak długo powstaje',
      paragraphs: [
        'Aplikacje dedykowane zaczynają się u nas od 23 000 zł, a portal B2B od 19 000 zł. Najmniejsze wdrożenia trwają od około 3 miesięcy. To ceny od, a nie ceny końcowe: ostateczna kwota zależy od zakresu, liczby ról i integracji z innymi systemami. Elementy AI wyceniamy do projektu, bo zależą od zakresu i danych.',
        'Płacisz etapami, za fragmenty, które widzisz działające na środowisku testowym, a nie wszystko z góry. Żeby sprawdzić orientacyjne widełki własnego pomysłu, możesz skorzystać z <a href="/wycena/">kalkulatora wyceny</a>, który liczy je w około minutę. Szczegóły oferty opisuje strona <a href="/web-development/custom-app/">aplikacje dedykowane</a>.',
      ],
    },
    {
      title: 'Jak wygląda projekt krok po kroku',
      paragraphs: [
        'Największym ryzykiem w takich projektach nie jest kod, tylko źle odkryte wymagania. Dlatego zaczynamy od rozmowy, a nie od umowy.',
      ],
      bullets: [
        'Darmowa rozmowa. Opowiadasz, jak pracujesz i co Cię boli, a my mówimy, co jest możliwe i czy AI jest tu potrzebne. W 24 godziny dostajesz wstępne widełki.',
        'Warsztat wymagań przy złożonych projektach. Rozmawiamy z ludźmi, którzy będą korzystać z systemu. Warsztat jest płatny zależnie od zakresu i liczby osób, a wersja online jest tańsza.',
        'Wycena właściwa. Dostajesz konkretny zakres i cenę oraz harmonogram podzielony na etapy.',
        'Wersja testowa, odbiory i rozwój. Pierwszą działającą wersję oglądasz wcześnie, a nowe funkcje włączamy dopiero po Twoim teście.',
      ],
    },
    {
      title: 'Bezpieczeństwo i dane w systemie z AI',
      paragraphs: [
        'Zanim zaczniemy, ustalamy, jakie dane system przetwarza i gdzie je przechowuje. Przy danych osobowych omawiamy zasady ich ochrony i podpisujemy umowę powierzenia. Każde wydanie przechodzi testy automatyczne i niezależną weryfikację, a nie testujemy na produkcji.',
        'Kod i dokumentacja są Twoje. Repozytorium widzisz od pierwszego dnia, a po odbiorze przekazujemy pełne prawa autorskie wraz z dokumentacją API i instrukcją wdrożenia. Dzięki temu nie jesteś uzależniony od jednego wykonawcy.',
      ],
    },
    {
      title: 'Jak zacząć',
      paragraphs: [
        'Zanim napiszesz do wykonawcy, odpowiedz sobie na trzy pytania. Który proces w firmie zabiera najwięcej ręcznej pracy? Jakie dane są potrzebne, żeby go uprościć? Kto będzie z systemu korzystał na co dzień? Same odpowiedzi często pokazują, czy potrzebna jest aplikacja, czy wystarczy prostsze rozwiązanie.',
        'Jeśli chcesz porozmawiać o swoim przypadku, zobacz stronę <a href="/web-development/systemy-ai-aplikacje/">systemy AI i aplikacje</a> albo od razu <a href="/wycena/">policz widełki w kalkulatorze</a>. Działamy w Rzeszowie, na Podkarpaciu i w całej Polsce, a rozmowy prowadzimy zdalnie.',
      ],
    },
  ] satisfies AiArticleSection[],
  faq: {
    title: 'Najczęstsze pytania o aplikacje dedykowane z AI',
    items: [
      {
        q: 'Czy do mojej firmy potrzebne jest AI?',
        a: 'Nie zawsze. Na rozmowie sprawdzamy, czy problem rozwiąże zwykła aplikacja, czy elementy AI realnie skrócą pracę. Jeśli AI nie jest potrzebne, powiemy to wprost i wycenimy samą aplikację.',
      },
      {
        q: 'Ile kosztuje aplikacja dedykowana z elementami AI?',
        a: 'Aplikacje dedykowane zaczynają się od 23 000 zł, a portal B2B od 19 000 zł. Elementy AI wyceniamy do projektu, bo zależą od zakresu i danych. Widełki dostajesz w 24 godziny po rozmowie, a płacisz etapami.',
      },
      {
        q: 'Ile trwa budowa takiego systemu?',
        a: 'Najmniejsze wdrożenia zaczynają się od około 3 miesięcy. Konkretny harmonogram powstaje po rozmowie albo warsztacie wymagań i jest podzielony na etapy, więc pierwsze działające fragmenty widzisz wcześnie.',
      },
      {
        q: 'Co z moimi danymi w aplikacji z AI?',
        a: 'Przed startem ustalamy, jakie dane system przetwarza i gdzie je przechowuje. Przy danych osobowych omawiamy zasady ich ochrony i podpisujemy umowę powierzenia. To zapisujemy w umowie projektu.',
      },
      {
        q: 'Czy kod aplikacji będzie mój?',
        a: 'Tak. Repozytorium widzisz od pierwszego dnia, a po odbiorze przekazujemy pełne prawa autorskie, dokumentację API i instrukcję wdrożenia.',
      },
    ],
  },
  cta: {
    title: 'Porozmawiajmy o Twoim systemie',
    description:
      'Zaczynamy od darmowej, niezobowiązującej rozmowy. W 24 godziny dostajesz wstępne widełki.',
    quote: { label: 'Policz widełki w kalkulatorze', to: '/wycena/' },
    service: { label: 'Systemy AI i aplikacje', to: '/web-development/systemy-ai-aplikacje/' },
    offer: { label: 'Aplikacje dedykowane', to: '/web-development/custom-app/' },
  },
};
