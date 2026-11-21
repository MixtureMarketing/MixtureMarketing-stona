// MIX-1816 (Z13): treść osi czasu „Co dostajesz i kiedy" na ekranie wyniku wyceny. JEDEN plik treści:
// Jakub edytuje tylko tutaj (tytuł, krótkie wprowadzenie, trzy okresy, 1–3 punkty w każdym).
// Zasady treści (pilnuje newClientTimeline.content.test.ts): bez obietnicy wyniku (żadnych słów o
// gwarancji, wzroście, zwrocie, procentach ani „pewności"), bez cen i bez kwot. Piszemy, co klient
// DOSTAJE i kiedy, nie co z tego wyniknie. Pusty punkt albo okres bez punktów nie jest pokazywany.

export interface TimelinePeriod {
  /** Nagłówek okresu, np. „Tydzień 1". */
  period: string;
  /** 1–3 krótkie punkty: co klient dostaje. */
  items: string[];
}

export const NEW_CLIENT_TIMELINE_HEADING = 'Co dostajesz i kiedy';

export const NEW_CLIENT_TIMELINE_INTRO =
  'Tak zwykle wygląda start współpracy. Terminy ustalamy w rozmowie; to plan pracy, nie obietnica wyników.';

export const NEW_CLIENT_TIMELINE: TimelinePeriod[] = [
  {
    period: 'Tydzień 1',
    items: [
      'Rozmowa startowa: ustalamy cele, zakres i kolejność prac.',
      'Makiety głównych podstron do Twojej akceptacji.',
    ],
  },
  {
    period: 'Miesiąc 1',
    items: [
      'Projekt graficzny i pierwsze działające podstrony na wersji testowej.',
      'Poprawki po Twoich uwagach oraz wstawienie treści i zdjęć.',
    ],
  },
  {
    period: '90 dni',
    items: [
      'Uruchomienie strony i podpięcie pomiaru ruchu.',
      'Przegląd pierwszych danych i lista dalszych usprawnień.',
    ],
  },
];
