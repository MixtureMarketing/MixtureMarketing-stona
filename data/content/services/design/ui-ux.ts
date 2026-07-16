/**
 * Treść /design/ui-ux/ — przepisana 2026-07-16 (krytyka 16/40).
 * Usunięte: atrapa dashboardu analitycznego („Conversion 24.8% / Bounce 12.4%"
 * — zakaz atrap: playground tokenów pokazuje teraz uczciwe wzorniki komponentów),
 * angielskie etykiety kostiumu (Human-Centric Interface, Variable Control,
 * Get Started, Press Me), błąd gramatyczny „z inżynierską precyzję".
 * Cena potwierdzona przez właściciela 2026-07-16: od 2 000 zł.
 */
export const UI_UX_DESIGN_CONTENT = {
  seo: {
    title: 'UI/UX Design | Projektowanie Stron i Aplikacji',
    description:
      'Projektujemy intuicyjne i użyteczne interfejsy (UI/UX). Tworzymy makiety i prototypy stron oraz aplikacji, które zapewniają doskonałe doświadczenie użytkownika.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    title: {
      line1: 'Interfejsy,',
      line2: 'które rozmawiają.',
    },
    description:
      'Projektujemy doświadczenia, nie tylko ekrany. Nasz proces łączy psychologię poznawczą z inżynierską precyzją, by Twoi użytkownicy poczuli różnicę od pierwszego kliknięcia.',
    cta: 'Rozpocznij projekt',
  },
  designTokens: {
    title: 'Design tokens',
    subtitle: 'Zmienne pod kontrolą',
    description:
      'Zamiast malować ekrany, definiujemy zmienne: kolor, promień, motyw. Przestaw suwak — a cały interfejs obok przeprojektuje się sam. Tak wygląda system, który oddajemy programistom.',
    labels: {
      color: 'Kolor marki',
      radius: 'Promień narożników',
      theme: 'Motyw',
    },
  },
  /** Uczciwy podgląd: wzorniki komponentów sterowane tokenami — bez wymyślonych metryk. */
  preview: {
    title: 'Podgląd komponentów',
    subtitle: 'Jeden system, żywe tokeny',
    specimens: {
      form: 'Formularz',
      emailLabel: 'Adres e-mail',
      emailPlaceholder: 'jan@firma.pl',
      submit: 'Wyślij',
      buttons: 'Stany przycisku',
      primary: 'Główny',
      secondary: 'Drugorzędny',
      card: 'Karta z treścią',
    },
  },
  rwd: {
    title: 'Mobile First. Zawsze.',
    description:
      'Ponad 70% ruchu to smartfony. Projektujemy zaczynając od najmniejszego ekranu, aby mieć pewność, że kluczowe treści są zawsze czytelne i dostępne.',
    labels: {
      compact: 'Smartfon',
      adaptive: 'Tablet',
      full: 'Desktop',
    },
  },
  transformation: {
    title: 'Od szkicu do produktu',
    description:
      'Zobacz, jak przekuwamy surowe makiety funkcjonalne (wireframes) w dopracowany interfejs (hi-fi). Przełącz widok, aby zobaczyć różnicę.',
    labels: {
      lofi: 'Makieta UX',
      hifi: 'Finalne UI',
    },
    hifi: {
      cta: 'Rozpocznij',
      secondary: 'Dowiedz się więcej',
    },
    lofi: {
      cta: 'Przycisk',
      secondary: 'Drugi przycisk',
    },
  },
  atomic: {
    badge: 'Atomic Design',
    title: {
      line1: 'Nie rysujemy obrazków.',
      line2: 'Budujemy skalowalne systemy.',
    },
    description:
      'Stosujemy metodologię Atomic Design. Rozbijamy interfejs na najmniejsze cząstki (atomy), z których budujemy większe komponenty. Dzięki temu Twój projekt jest spójny, łatwy w utrzymaniu i gotowy na rozwój.',
    features: [
      {
        title: 'Spójność',
        desc: 'Ten sam przycisk wygląda tak samo na każdej z 50 podstron.',
      },
      {
        title: 'Szybkość wdrażania',
        desc: 'Programiści otrzymują gotowe klocki, a nie obrazek do „odrysowania".',
      },
    ],
  },
  interactions: {
    title: 'Interakcja to rozmowa',
    description:
      'Dobre UI to nie tylko statyczny obrazek. To mikro-interakcje, które dają informację zwrotną i sprawiają, że korzystanie z produktu jest czystą przyjemnością.',
    items: [
      {
        title: 'Haptyka wizualna',
        desc: 'Interfejs reaguje na każdy ruch i dotyk użytkownika.',
      },
      {
        title: 'Przejścia stanów',
        desc: 'Płynne animacje między widokami eliminują dezorientację.',
      },
      {
        title: 'System feedbacku',
        desc: 'Użytkownik zawsze wie, co dzieje się w systemie.',
      },
    ],
    labels: {
      ripple: 'Naciśnij mnie',
      rippleCaption: 'Fala po kliknięciu',
      logic: 'Przełącznik stanu',
      perspective: 'Perspektywa 3D',
    },
  },
  faqs: [
    {
      q: 'Czym różni się UI od UX?',
      a: "UX (User Experience) to projektowanie 'jak to działa' – architektura, nawigacja, łatwość użycia. UI (User Interface) to 'jak to wygląda' – kolory, typografia, kształty przycisków. Robimy obie te rzeczy spójnie.",
    },
    {
      q: 'Czy dostanę projekt w wersji mobilnej?',
      a: 'Tak. Stosujemy podejście Mobile First. Otrzymasz projekty widoków na desktop, tablet i smartfon, aby programiści wiedzieli dokładnie, jak strona ma się zachowywać na każdym urządzeniu.',
    },
    {
      q: 'W jakim programie pracujecie?',
      a: 'Standardem branżowym jest Figma i to w niej pracujemy. Otrzymasz link do podglądu na żywo, gdzie możesz zostawiać komentarze bezpośrednio na projekcie.',
    },
  ],
  cta: {
    title: {
      line1: 'Zbudujmy coś,',
      line2: 'czego nie da się zapomnieć.',
    },
    description: 'Masz tylko 3 sekundy, aby zrobić dobre pierwsze wrażenie. Nie zmarnuj ich.',
    button: 'Wyceń prototyp',
  },
};
