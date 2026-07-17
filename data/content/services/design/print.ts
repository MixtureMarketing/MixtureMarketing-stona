/**
 * Treść /design/print/ — poprawki 2026-07-16 (krytyka 23/40).
 * Usunięte: obietnica „do 1h" (decyzja właściciela: bez SLA godzinowego —
 * „priorytetowo, bezpłatnie"), badge/microCopy hero (hero words-only).
 * Cena potwierdzona: od 800 zł.
 */
export const PRINT_DESIGN_CONTENT = {
  seo: {
    title: 'Projektowanie do Druku (DTP) | Wizytówki, Katalogi',
    description:
      'Przenosimy Twoją markę do świata offline. Projektujemy materiały do druku (DTP): wizytówki, katalogi, oferty, opakowania i inne.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    title: {
      line1: 'Design, który można',
      line2: 'dotknąć.',
    },
    description:
      'W świecie cyfrowym fizyczny produkt to luksus. Projektujemy materiały, które przechodzą test dotyku. Precyzja co do milimetra, idealne odwzorowanie kolorów i szlachetne uszlachetnienia.',
    cta: 'Wyceń druk',
  },
  guarantee: {
    title: 'Gwarancja poprawności technicznej',
    description:
      'Bierzemy pełną odpowiedzialność za pliki produkcyjne. Jeśli drukarnia odrzuci nasz projekt z przyczyn technicznych, poprawiamy go priorytetowo i bezpłatnie.',
    items: ['Zgodność kolorów', 'Poprawne spady', 'Krzywe wektorowe'],
  },
  finishes: {
    title: 'Laboratorium Uszlachetnień',
    description:
      'Druk to nie tylko kolor. To faktura, błysk i głębia. Wybierz uszlachetnienie — karta złapie światło. Poruszaj kursorem nad wizytówką, aby samemu poprowadzić odbicie.',
    items: [
      { id: 'none', label: 'Standard', desc: 'Druk cyfrowy lub offsetowy. Czysty, matowy papier.' },
      {
        id: 'gold',
        label: 'Złocenie (Hot-Stamp)',
        desc: 'Wprasowanie złotej folii na gorąco. Efekt premium i luksusu.',
      },
      {
        id: 'uv',
        label: 'Lakier UV 3D',
        desc: 'Błyszczący, wypukły lakier na wybranych elementach. Wyczuwalny pod palcem.',
      },
      {
        id: 'emboss',
        label: 'Tłoczenie (Letterpress)',
        desc: 'Fizyczne wgniecenie papieru. Klasyczna elegancja i minimalizm.',
      },
    ],
  },
  paper: {
    title: 'Inżynieria Papieru',
    description:
      'Gramatura papieru to nie tylko waga. To sztywność, prestiż i odczucie jakości. Zobacz różnicę między ulotką a wizytówką premium.',
    items: [
      {
        weight: '90g',
        name: 'Papier Biurowy / Offset',
        use: 'Papier firmowy, wnętrza książek, faktury.',
        thickness: 2,
      },
      {
        weight: '170g',
        name: 'Kreda Mat / Błysk',
        use: 'Ulotki składane, plakaty, wnętrza katalogów.',
        thickness: 4,
      },
      {
        weight: '350g',
        name: 'Karton Premium',
        use: 'Wizytówki, okładki, teczki ofertowe, zaproszenia.',
        thickness: 8,
      },
      {
        weight: '600g',
        name: 'Multiloft (Kaszerowany)',
        use: 'Wizytówki Luxury, podkładki, karty menu.',
        thickness: 16,
      },
    ],
  },
  packaging: {
    badge: 'Opakowania',
    title: {
      line1: 'Nie tylko ładny obrazek.',
      line2: 'To działająca konstrukcja.',
    },
    description:
      'Projektowanie opakowań to architektura w skali mikro. Tworzymy siatki wykrojników (die-cuts), które składają się idealnie co do milimetra. Uwzględniamy grubości kartonu, kierunek włókien i pola klejenia.',
    features: [
      {
        title: 'Wykrojniki i Bigowanie',
        desc: 'Przygotowujemy profesjonalne pliki CAD dla drukarni.',
      },
      {
        title: 'Makiety 3D',
        desc: 'Zobaczysz wirtualny model opakowania 360° przed drukiem.',
      },
    ],
  },
  preflight: {
    title: 'Gwarancja Preflight',
    description:
      'Drukarnia nie odrzuci Twoich plików. Każdy projekt przechodzi rygorystyczną kontrolę techniczną przed wysyłką. Sprawdź, co weryfikujemy.',
    items: [
      {
        title: '300 DPI',
        desc: 'Weryfikacja rozdzielczości rastrów. Zero pikselozy.',
      },
      {
        title: 'CMYK / Pantone',
        desc: 'Konwersja kolorów z RGB. Sprawdzamy overprinty i nasycenie czerni.',
      },
      {
        title: 'Spady i Marginesy',
        desc: 'Bezpieczne pole tekstowe i 3mm spadu na obcięcie.',
      },
      {
        title: 'Krzywe (Outline)',
        desc: 'Zamiana fontów na krzywe. Gwarancja poprawnego wydruku tekstu.',
      },
    ],
  },
  arsenal: {
    title: 'Twój Arsenał Marketingowy',
    items: [
      { label: 'Wizytówki', sub: 'Premium / NFC', shape: 'w-24 h-14' },
      { label: 'Katalogi', sub: 'Klejenie / Szycie', shape: 'w-20 h-28' },
      { label: 'Teczki', sub: 'Ofertowe', shape: 'w-24 h-32 rounded-tr-[30px]' },
      { label: 'Ulotki', sub: 'DL / A5 / Składane', shape: 'w-16 h-32' },
      { label: 'Opakowania', sub: 'Produktowe' },
      { label: 'Roll-upy', sub: 'Eventowe' },
      { label: 'Etykiety', sub: 'Na roli' },
      { label: 'Gadżety', sub: 'Merch' },
    ],
  },
  faqs: [
    {
      q: 'Czym różni się RGB od CMYK?',
      a: 'RGB (Red, Green, Blue) to kolory światła (ekran). CMYK (Cyan, Magenta, Yellow, Key/Black) to kolory farby (druk). Projektujemy w CMYK, aby kolory na papierze wyglądały tak samo jak na monitorze.',
    },
    {
      q: 'Jaki jest minimalny nakład druku?',
      a: 'Dla druku cyfrowego (wizytówki, ulotki) realizujemy zamówienia już od 50-100 sztuk. Dla druku offsetowego i opakowań opłacalność zaczyna się od 500-1000 sztuk.',
    },
    {
      q: 'Czy projektujecie też nietypowe wykrojniki?',
      a: 'Tak. Tworzymy opakowania i materiały o niestandardowych kształtach. Przygotowujemy pliki techniczne z liniami cięcia i bigowania dla drukarni.',
    },
  ],
  cta: {
    title: 'Masz produkt, który potrzebuje oprawy?',
    description:
      'Opakowanie to Twój "cichy sprzedawca". Sprawmy, żeby krzyczał jakością na sklepowej półce.',
    button: 'Wyceń Opakowanie / Druk',
  },
};
