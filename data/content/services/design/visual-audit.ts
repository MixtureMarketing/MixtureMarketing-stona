/**
 * Treść /design/visual-audit/ — przepisana 2026-07-16 (krytyka 11/40, najniższa
 * w kategorii). Usunięte: 5 bezimiennych kart z wymyślonymi procentami (grid
 * czytał item.title, dane miały label; „score: 80/40/60..." — liczby z powietrza),
 * makieta „Zwiększ Sprzedaż o 200%", preparowane wyniki testu 5 sekund
 * (Logo ✓ / CTA ✗), zapętlony fejkowy log skanera WCAG, eye-tracking
 * (decyzja właściciela: zakres = mapy cieplne + nagrania sesji, bez
 * eye-trackingu). Heurystyki: pełna, prawdziwa dziesiątka Nielsena.
 * Wynik axe w sekcji WCAG to REALNY pomiar tej podstrony — patrz
 * wcag.axeProof; aktualizować przy większych zmianach strony.
 */
export const VISUAL_AUDIT_CONTENT = {
  seo: {
    title: 'Audyt Wizualny i UX/UI | Analiza Użyteczności Stron',
    description:
      'Znajdziemy wąskie gardła na Twojej stronie. Audyt UX/UI, analiza map cieplnych i zgodności z WCAG. Popraw konwersję dzięki twardym danym.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    title: {
      line1: 'Twoja strona gubi klientów.',
      line2: 'Powiemy Ci gdzie.',
    },
    description:
      'Audyt UX to nie „opinia grafika". To śledztwo. Analizujemy mapy cieplne, nagrania sesji i strukturę informacji, by znaleźć wąskie gardła w Twoim lejku sprzedaży.',
    cta: 'Zamów audyt',
  },
  test5s: {
    title: 'Test 5 sekund',
    description:
      'Użytkownik daje Ci tylko 5 sekund kredytu zaufania. Jeśli w tym czasie nie zrozumie, co oferujesz — wychodzi. Tak wygląda jedno z badań, które robimy na Twojej stronie.',
    labels: {
      start: 'Start — patrz 5 sekund',
      timeUp: 'Czas minął. Odpowiedz z pamięci:',
      questions: [
        'Co ta firma oferuje?',
        'Jaka jest główna korzyść dla Ciebie?',
        'Co miałeś kliknąć?',
      ],
      summary:
        'W prawdziwym badaniu te pytania zadajemy ludziom, którzy widzą Twoją stronę pierwszy raz. Jeśli odpowiedzi się rozjeżdżają — wiemy, co poprawić.',
      retry: 'Spróbuj ponownie',
    },
    stats: [
      { val: '5s', label: 'Czas uwagi' },
      { val: '3', label: 'Pytania protokołu' },
      { val: '1', label: 'Główna akcja' },
    ],
  },
  wcag: {
    badge: 'Wymóg prawny',
    title: {
      line1: 'Dostępność to nie opcja.',
      line2: 'To wymóg prawny (WCAG).',
    },
    description:
      'Od czerwca 2025 Europejski Akt o Dostępności obejmuje większość stron e-commerce i usługowych (normy WCAG 2.1 AA). Nasz audyt sprawdza kod pod kątem czytników ekranu, kontrastu i nawigacji klawiaturą.',
    features: [
      {
        title: 'Analiza kodu (semantyka)',
        desc: 'Sprawdzamy poprawność znaczników HTML (H1–H6, alt, aria), kluczowych dla robotów i technologii asystujących.',
      },
      {
        title: 'Kontrast i czytelność',
        desc: 'Weryfikujemy stosunek kontrastu tekstu do tła (wymagane min. 4.5:1 dla poziomu AA).',
      },
    ],
    /** REALNY wynik axe-core dla tej podstrony — nie atrapa. Zmierzony
     *  po przebudowie strony; do odświeżenia przy większych zmianach. */
    axeProof: {
      heading: 'Zaczynamy od siebie',
      command: 'axe /design/visual-audit/ --tags wcag2a,wcag2aa',
      lines: [
        { label: 'naruszenia', value: '0' },
        { label: 'reguły zaliczone', value: '31' },
        { label: 'data audytu', value: '16.07.2026' },
        { label: 'narzędzie', value: 'axe-core 4.10.2' },
      ],
      note: 'To wynik strony, którą właśnie czytasz — możesz go powtórzyć w DevTools. Audyt automatyczny wykrywa ok. 30% problemów WCAG; resztę znajduje człowiek z czytnikiem ekranu i klawiaturą. Dlatego raport piszemy ręcznie.',
    },
  },
  heuristics: {
    title: '10 heurystyk Nielsena',
    description:
      'Klasyczna checklista użyteczności, według której przechodzimy Twoją stronę ekran po ekranie. Przy każdej heurystyce — pytanie, które zadajemy w Twoim imieniu.',
    items: [
      { label: 'Widoczność statusu systemu', desc: 'Czy użytkownik zawsze wie, co się dzieje?' },
      {
        label: 'Zgodność z rzeczywistością',
        desc: 'Czy mówisz językiem klienta, nie żargonem firmy?',
      },
      { label: 'Kontrola i swoboda', desc: 'Czy da się cofnąć błędny krok bez frustracji?' },
      { label: 'Spójność i standardy', desc: 'Czy ten sam element zawsze działa tak samo?' },
      {
        label: 'Zapobieganie błędom',
        desc: 'Czy formularz pomaga uniknąć pomyłki, zanim wystąpi?',
      },
      {
        label: 'Rozpoznawanie zamiast przypominania',
        desc: 'Czy opcje widać, czy trzeba je pamiętać?',
      },
      { label: 'Elastyczność i wydajność', desc: 'Czy powracający użytkownik ma szybszą ścieżkę?' },
      {
        label: 'Estetyka i minimalizm',
        desc: 'Czy każdy element na ekranie zarabia na swoje miejsce?',
      },
      { label: 'Pomoc przy błędach', desc: 'Czy komunikat błędu mówi, jak problem rozwiązać?' },
      {
        label: 'Pomoc i dokumentacja',
        desc: 'Czy odpowiedź na pytanie da się znaleźć bez dzwonienia?',
      },
    ],
  },
  faqs: [
    {
      q: 'Czym różni się audyt wizualny od technicznego?',
      a: 'Audyt techniczny (SEO) sprawdza kod i szybkość. Audyt wizualny (UX/UI) sprawdza to, co widzi człowiek: czytelność, emocje, łatwość obsługi i estetykę (heurystyki Nielsena).',
    },
    {
      q: 'Czy muszę wdrażać wszystkie zmiany od razu?',
      a: "Nie. W raporcie priorytetyzujemy błędy. Oznaczamy 'Quick Wins' (szybkie i tanie poprawki o dużym wpływie) oraz zmiany długoterminowe.",
    },
    {
      q: 'Jak wygląda raport?',
      a: 'Otrzymujesz dokument PDF (20-40 stron) z konkretnymi zrzutami ekranu Twojej strony, oznaczonymi błędami i – co najważniejsze – wizualizacją, jak to naprawić.',
    },
  ],
  cta: {
    title: 'Przestań zgadywać. Zacznij badać.',
    description:
      'Większość problemów ze sprzedażą to problemy z UX. Zdiagnozuj je i napraw, zanim przepalisz kolejny budżet reklamowy.',
    button: 'Zamów wycenę audytu',
  },
};
