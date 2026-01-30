export const VISUAL_AUDIT_CONTENT = {
  seo: {
    title: 'Audyt Wizualny i UX/UI | Analiza Użyteczności Stron',
    description:
      'Znajdziemy wąskie gardła na Twojej stronie. Audyt UX/UI, analiza map cieplnych i zgodności z WCAG. Popraw konwersję dzięki twardym danym.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    badge: 'Digital Forensics',
    title: {
      line1: 'Twoja strona gubi klientów.',
      line2: 'Powiemy Ci gdzie.',
    },
    description:
      'Audyt UX to nie "opinia grafika". To śledztwo. Analizujemy mapy cieplne, nagrania sesji i strukturę informacji, by znaleźć wąskie gardła (Bottlenecks) w Twoim lejku sprzedaży.',
    cta: 'Zamów Audyt Śledczy',
    microCopy: 'Eye-Tracking Analysis',
  },
  test5s: {
    title: 'Test 5 Sekund',
    description:
      'Użytkownik daje Ci tylko 5 sekund kredytu zaufania. Jeśli w tym czasie nie zrozumie, co oferujesz – wychodzi. Sprawdź, czy Twój przekaz jest czytelny.',
    labels: {
      cta: 'Najedź, aby zobaczyć (5s)',
      timeUp: 'Czas minął!',
      summary:
        'Co zapamiętałeś? Jeśli nie potrafisz powtórzyć głównej korzyści i wezwania do działania (CTA) – Twoja strona oblewa test.',
      retry: 'Spróbuj Ponownie',
    },
    mock: {
      title: 'Zwiększ Sprzedaż o 200%',
      desc: 'Kompleksowa obsługa marketingowa dla e-commerce. Płacisz tylko za efekty.',
      button: 'Rozpocznij Współpracę',
    },
  },
  wcag: {
    badge: 'Legal Compliance',
    title: {
      line1: 'Dostępność to nie opcja.',
      line2: 'To wymóg prawny (WCAG).',
    },
    description:
      'Od 2025 roku większość stron e-commerce i usługowych musi spełniać normy WCAG 2.1 (Europejski Akt o Dostępności). Nasz audyt sprawdza kod pod kątem czytników ekranu, kontrastu i nawigacji klawiaturą.',
    features: [
      {
        title: 'Analiza Kodu (Semantyka)',
        desc: 'Sprawdzamy poprawność znaczników HTML (H1-H6, Alt, Aria-labels), które są kluczowe dla robotów i technologii asystujących.',
      },
      {
        title: 'Kontrast i Czytelność',
        desc: 'Weryfikujemy stosunek kontrastu tekstu do tła (wymagane min. 4.5:1 dla poziomu AA).',
      },
    ],
  },
  heuristics: {
    title: '10 Heurystyk Nielsena',
    description:
      'Sprawdzamy użyteczność Twojej strony według złotych standardów UX. Gdzie tracisz punkty?',
    items: [
      { label: 'Widoczność statusu', score: 80, desc: 'Czy użytkownik wie, co się dzieje?' },
      { label: 'Dopasowanie do świata', score: 40, desc: 'Czy język jest zrozumiały?' },
      { label: 'Kontrola użytkownika', score: 60, desc: "Czy jest przycisk 'Wstecz'?" },
      { label: 'Spójność i standardy', score: 90, desc: 'Czy przyciski wyglądają tak samo?' },
      {
        label: 'Zapobieganie błędom',
        score: 30,
        desc: 'Czy formularz pomaga uniknąć pomyłek?',
      },
    ],
    summary: {
      title: 'Twój Wynik?',
      desc: 'Zamów darmową próbkę audytu (Homepage).',
      button: 'Sprawdź Teraz',
    },
  },
  faqs: [
    {
      q: 'Czym różni się audyt wizualny od technicznego?',
      a: 'Audyt techniczny (SEO) sprawdza kod i szybkość. Audyt wizualny (UX/UI) sprawdza to, co widzi człowiek: czytelność, emocje, łatwość obsługi i estetykę (Heurystyki Nielsena).',
    },
    {
      q: 'Czy muszę wdrażać wszystkie zmiany od razu?',
      a: "Nie. W raporcie priorytetyzujemy błędy. Oznaczamy 'Quick Wins' (szybkie i tanie poprawki o dużym wpływie) oraz zmiany długoterminowe.",
    },
    {
      q: 'Jak wygląda raport?',
      a: 'Otrzymujesz dokument PDF (20-40 stron) con konkretnymi zrzutami ekranu Twojej strony, oznaczonymi błędami i – co najważniejsze – wizualizacją, jak to naprawić.',
    },
  ],
  cta: {
    title: 'Przestań zgadywać. Zacznij badać.',
    description:
      'Większość problemów ze sprzedażą to problemy z UX. Zdiagnozuj je i napraw, zanim przepalisz kolejny budżet reklamowy.',
    button: 'Zamów Wycenę Audytu',
  },
};
