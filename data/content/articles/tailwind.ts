/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const TAILWIND_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Design & UX',
    title: {
      line1: 'Tailwind CSS: Koniec z',
      line2: '"generycznym" wyglądem. Przyszłość UI.',
    },
    subtitle:
      'Design system, który nadąża za Twoją wyobraźnią. Dowiedz się, dlaczego <strong>Utility-First</strong> to jedyna droga do unikalnego UI w 2025 roku.',
  },
  lead: {
    highlight:
      'Przez lata w świecie tworzenia stron istniał bolesny kompromis: szybkość kosztem wyglądu (szablony) lub unikalność kosztem fortuny (style od zera).',
    text: 'W 2025 roku ten kompromis już nie istnieje. Dzięki <a href="/design/ui-ux/" class="text-secondary hover:underline font-bold">Tailwind CSS</a> budujemy "szyte na miarę" interfejsy z prędkością składania klocków LEGO.',
  },
  whatIs: {
    title: 'Czym jest Tailwind CSS? (LEGO dla dorosłych)',
    subtitle: 'Definicja',
    text: 'Tailwind to framework CSS typu <strong>Utility-First</strong>. Zamiast gotowych komponentów (jak w Bootstrapie), dostajesz tysiące mikro-klas, które pozwalają Ci na pełną swobodę bez walki z "opornym" kodem.',
  },
  preview: {
    title: 'Bootstrap vs. Tailwind',
    subtitle: 'Wizualne Porównanie',
    text: 'Strona na Bootstrapie często wygląda "poprawnie, ale nudno". Strona na Tailwindzie to czysta kartka papieru, na której grafik i programista mogą stworzyć arcydzieło bez ograniczeń systemowych.',
  },
  reasons: {
    title: '4 Powody, dla których Twój projekt tego potrzebuje',
    subtitle: 'Zalety Biznesowe',
    items: [
      {
        title: '1. Unikalny Design System',
        desc: 'Twój brand ma swoje kolory i charakter. Tailwind pozwala zamknąć te zasady w pliku konfiguracyjnym, gwarantując 100% spójności wizualnej.',
      },
      {
        title: '2. Szybkość (Time-to-Market)',
        desc: 'Programiści nie tracą czasu na przełączanie się między plikami. Piszą style bezpośrednio w kodzie, co drastycznie skraca czas i koszt developmentu.',
      },
      {
        title: '3. Lekkość i Wydajność',
        desc: 'Magia silnika JIT usuwa nieużywany kod. Wynikowy plik CSS często waży poniżej 10KB, co sprawia, że strona ładuje się błyskawicznie.',
      },
      {
        title: '4. Mobile First w standardzie',
        desc: 'Tworzenie wersji responsywnych jest naturalną częścią pracy z Tailwindem. Masz pełną kontrolę nad wyglądem na każdym urządzeniu.',
      },
    ],
  },
  comparison: {
    title: 'Pojedynek: Tailwind vs. Tradycyjny CSS',
    subtitle: 'Analiza Ekspercka',
    headers: ['Cecha', 'Tradycyjny CSS / Sass', 'Tailwind CSS'],
    rows: [
      {
        label: 'Utrzymanie',
        v1: 'Trudne. Pliki rosną bez końca.',
        v2: 'Łatwe. Usuwasz element = usuwasz styl.',
      },
      {
        label: 'Nazewnictwo',
        v1: 'Tracisz czas na wymyślanie nazw klas.',
        v2: 'Nie wymyślasz nazw. Używasz narzędzi.',
      },
      {
        label: 'Spójność',
        v1: 'Łatwo o pomyłki w odcieniach i marginesach.',
        v2: 'Sztywna paleta zablokowana w configu.',
      },
      { label: 'Rozmiar pliku', v1: 'Rośnie wraz z aplikacją.', v2: 'Pozostaje mały i stabilny.' },
    ],
  },
  myth: {
    title: '"Ale kod wygląda brzydko!"',
    text1:
      'Na pierwszy rzut oka – tak, kod HTML wygląda na "napuchnięty". Ale w nowoczesnym programowaniu (React, Next.js) używamy <strong>Komponentów</strong>.',
    text2:
      'Nie kopiujemy przycisku 50 razy. Tworzymy jeden komponent <code><Button /></code> z klasami Tailwinda i używamy go w całej aplikacji. Kod pozostaje czysty, a zmiany wprowadzasz w jednym miejscu.',
  },
  cta: {
    title: 'Chcesz unikalnego designu, a nie szablonu?',
    text: 'Nasz zespół designu i frontendu tworzy interfejsy "pixel-perfect" przy użyciu Tailwind CSS. Sprawdź nasze portfolio i zobacz różnicę.',
    primaryBtn: 'Zobacz naszą ofertę Design',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
