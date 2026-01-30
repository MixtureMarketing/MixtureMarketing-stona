/* eslint-disable @typescript-eslint/no-unused-vars */

import { SITE_CONFIG } from '../../../config/site';

export const DESIGN_BRANDING_CONTENT = {
  seo: {
    title: 'Projektowanie Graficzne i Branding | Identyfikacja Wizualna',
    description:
      'Budujemy marki, które zapadają w pamięć. Oferujemy kompleksowy branding, projektowanie logo, księgi znaku, UI/UX design i materiały do druku.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    badge: 'Creative Engineering',
    title: {
      line1: 'Studio Graficzne & UI.',
      line2: 'Design to inżynieria wizualna.',
    },
    description:
      'Łączymy psychologię koloru, matematykę siatek i strategię biznesową. Projektujemy systemy, które nie tylko wyglądają, ale przede wszystkim – <strong>działają i sprzedają.</strong>',
    cta: 'Konsultacja Wizualna',
  },
  toolkit: {
    title: 'Narzędzia',
    subtitle: 'Industry Standard Stack',
    tools: [
      { name: 'Figma', desc: 'UI/UX Design' },
      { name: 'Adobe CC', desc: 'Creative Suite' },
      { name: 'Blender', desc: '3D Modeling' },
      { name: 'Rive / AE', desc: 'Motion' },
      { name: 'Midjourney', desc: 'Gen AI' },
    ],
  },
  ecosystem: {
    title: 'Design 360°',
    description:
      'Traktujemy design jako jeden organizm. Twój branding zasila UI, UI zasila marketing, a materiały drukowane domykają doświadczenie w świecie fizycznym.',
    items: [
      {
        step: '01',
        title: 'Strategia & DNA',
        desc: 'Fundament. Określamy archetyp marki, paletę kolorów i język komunikacji. To źródło prawdy dla wszystkich innych działań.',
        tags: ['Brand Book', 'Logo', 'Tone of Voice'],
      },
      {
        step: '02',
        title: 'Digital Experience',
        desc: 'Wdrożenie. Przekuwamy zasady brandingu na piksele. Strony WWW, aplikacje i social media, które konwertują.',
        tags: ['Web Design', 'App UI', 'Social Media'],
      },
      {
        step: '03',
        title: 'Physical Touch',
        desc: 'Utrwalenie. Przenosimy markę do świata realnego. Opakowania, wizytówki i gadżety, które budują prestiż.',
        tags: ['Packaging', 'Print', 'Merch'],
      },
    ],
  },
  sectors: {
    title: 'Design dla Twojej Branży',
    description:
      'Każdy sektor rządzi się innymi prawami wizualnymi. Dopasowujemy estetykę do oczekiwań Twoich klientów.',
    items: [
      {
        title: 'Tech & SaaS',
        desc: 'Czystość, abstrakcja, dark mode. Budujemy wizerunek innowatora.',
      },
      {
        title: 'E-commerce',
        desc: 'Ekspozycja produktu, jasne tła, czytelne CTA. Design nastawiony na sprzedaż.',
      },
      {
        title: 'Law & Finance',
        desc: 'Szeryfowa typografia, granat, złoto. Wzbudzanie zaufania i stabilności.',
      },
      {
        title: 'Beauty & Wellness',
        desc: 'Pastele, dużo światła, eleganckie detale. Granie na emocjach i zmysłach.',
      },
    ],
  },
  pillars: {
    title: 'Cztery Filary Designu',
    description:
      'Kompleksowa obsługa wizualna Twojej firmy. Traktujemy design jako proces inżynierski, a nie tylko estetyczny.',
    items: [
      {
        id: '01',
        title: 'Brand Identity',
        role: 'Strategia & DNA',
        desc: 'Tworzymy marki, które zapadają w pamięć. Budujemy spójny system identyfikacji wizualnej, który buduje zaufanie i uzasadnia cenę premium.',
        features: ['Strategia Marki', 'Logo & Księga Znaku', 'Archetypy Marki', 'Naming'],
        path: '/design/branding/',
      },
      {
        id: '02',
        title: 'UI/UX Design',
        role: 'Interfejsy & Użyteczność',
        desc: 'Projektujemy intuicyjne strony i aplikacje. Skupiamy się na ścieżce użytkownika (User Journey) i konwersji, a nie tylko na ładnych obrazkach.',
        features: ['Web Design (RWD)', 'Makiety Aplikacji', 'Prototypowanie', 'Design Systems'],
        path: '/design/ui-ux/',
      },
      {
        id: '03',
        title: 'Print & Packaging',
        role: 'Doświadczenie Fizyczne',
        desc: 'Przenieś markę do świata realnego. Projektujemy opakowania, które sprzedają produkt na półce oraz materiały premium (DTP).',
        features: [
          'Opakowania (Unboxing)',
          'Katalogi i Oferty',
          'Wizytówki Premium',
          'Przygotowanie do druku',
        ],
        path: '/design/print/',
      },
      {
        id: '04',
        title: 'Audyt Wizualny',
        role: 'Analiza & Optymalizacja',
        desc: 'Twoja strona nie sprzedaje? Sprawdzimy dlaczego. Analizujemy błędy UX, spójność marki i czytelność, wskazując konkretne elementy do poprawy.',
        features: [
          'Analiza UX/UI',
          'Audyt Spójności Marki',
          'Weryfikacja Dostępności',
          'Raport z zaleceniami',
        ],
        path: '/design/visual-audit/',
      },
    ],
  },
  roi: {
    items: [
      { val: '0.05s', label: 'Czas na zrobienie pierwszego wrażenia' },
      { val: '94%', label: 'Użytkowników ocenia wiarygodność po wyglądzie' },
      { val: '200%', label: 'Wzrost konwersji przy dobrym UX' },
    ],
  },
  cta: {
    title: 'Wygląd ma znaczenie.',
    text: 'Masz tylko 3 sekundy, aby zrobić dobre pierwsze wrażenie. Nie zmarnuj ich.',
    button: 'Zamów Darmowy Audyt Wizualny',
  },
  faqs: [
    {
      q: 'Czy otrzymuję pełne prawa autorskie do projektów?',
      a: 'Tak, po opłaceniu faktury końcowej przekazujemy pełne autorskie prawa majątkowe do wszystkich zaakceptowanych projektów. Możesz ich używać bez ograniczeń czasowych i terytorialnych.',
    },
    {
      q: 'W jakich formatach otrzymam gotowe pliki?',
      a: 'Dostarczamy kompletny pakiet produkcyjny: formaty wektorowe (AI, EPS, SVG, PDF) dla druku i skalowania, oraz formaty rastrowe (PNG, JPG) zoptymalizowane pod Internet i social media.',
    },
    {
      q: 'Ile trwa proces projektowy?',
      a: 'Czas realizacji zależy od stopnia skomplikowania. Prosty branding (logo + księga znaku) to zazwyczaj 2-3 tygodnie. Projektowanie UI/UX dla strony www trwa od 2 do 4 tygodni, wliczając fazę makietowania i prototypowania.',
    },
    {
      q: 'Czy projektujecie również materiały do druku?',
      a: 'Tak, oferujemy kompleksowe przygotowanie do druku (DTP). Projektujemy wizytówki, katalogi, opakowania, teczki ofertowe oraz banery wielkoformatowe, dbając o poprawność techniczną plików dla drukarni.',
    },
  ],
};

export const BRAND_IDENTITY_CONTENT = {
  seo: {
    title: 'Identyfikacja Wizualna i Logo | Projektowanie Marki',
    description:
      'Tworzymy kompletne systemy identyfikacji wizualnej. Projektujemy logo, księgi znaku i strategie komunikacji, które wyróżnią Twoją markę.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    badge: 'Brand Engineering',
    title: {
      line1: 'Twoja marka to',
      line2: 'coś więcej niż logo.',
    },
    description:
      'Projektujemy kompletne systemy identyfikacji wizualnej. Przekuwamy wartości Twojej firmy na język kształtów, kolorów i typografii, budując zaufanie od pierwszego wejrzenia.',
    cta: 'Rozpocznij Warsztat',
    microCopy: 'System, nie obrazek',
  },
  process: {
    title: 'Jak powstaje marka?',
    description:
      'To nie jest chwila natchnienia. To ułożony proces, który gwarantuje, że efekt końcowy będzie spójny z Twoją strategią biznesową.',
    steps: [
      {
        title: 'Warsztat Strategiczny',
        desc: 'Briefing i analiza konkurencji. Określamy archetyp marki, grupę docelową i kluczowe wartości.',
        time: 'Tydzień 1',
      },
      {
        title: '3 Linie Koncepcyjne',
        desc: 'Przygotowujemy szkice i wstępne projekty logo w trzech różnych kierunkach stylistycznych.',
        time: 'Tydzień 2',
      },
      {
        title: 'Iteracje & Szlifowanie',
        desc: 'Wybierasz jeden kierunek, a my dopracowujemy go do perfekcji (siatki modułowe, dobór kolorów).',
        time: 'Tydzień 3',
      },
      {
        title: 'Księga Znaku & Pliki',
        desc: 'Tworzymy dokumentację (Brand Book) i eksportujemy pliki we wszystkich potrzebnych formatach.',
        time: 'Tydzień 4',
      },
    ],
  },
  dna: {
    title: 'Zdefiniuj DNA Marki',
    description:
      'Każda marka jest inna. Użyj suwaków, aby określić charakter, który chcesz osiągnąć. Zobacz, jak zmienia się forma wizualna w czasie rzeczywistym.',
    labels: {
      classic: 'Klasyczna',
      modern: 'Nowoczesna',
      calm: 'Spokojna',
      energetic: 'Energiczna',
      subtle: 'Subtelna',
      expressive: 'Wyrazista',
    },
    status: {
      style: [
        'Tradycja i powaga',
        'Balans między historią a przyszłością',
        'Innowacja i minimalizm',
      ],
      energy: ['Stabilność i zaufanie', 'Aktywna, ale opanowana', 'Dynamika i akcja'],
      weight: ['Lekkość i powietrze', 'Wyważona obecność', 'Siła i dominacja'],
    },
  },
  archetypes: {
    title: 'Charakter Marki',
    description:
      "Nie dobieramy kolorów, bo 'są ładne'. Dobieramy je tak, aby wywołać konkretną reakcję w mózgu Twojego klienta.",
    items: {
      sage: {
        label: 'Mędrzec (The Sage)',
        desc: 'Dla marek opartych na wiedzy, technologii i prawdzie. Buduje autorytet i zaufanie.',
        font: 'Sans-Serif (Geometric)',
        mood: 'Profesjonalny, Spokojny, Analityczny',
      },
      rebel: {
        label: 'Buntownik (The Rebel)',
        desc: 'Dla marek, które łamią zasady i zmieniają rynek. Energetyczny, odważny, głośny.',
        font: 'Bold / Grunge',
        mood: 'Odważny, Dynamiczny, Kontrowersyjny',
      },
      ruler: {
        label: 'Władca (The Ruler)',
        desc: 'Dla marek premium, oferujących kontrolę, stabilność i luksus. Minimalizm i perfekcja.',
        font: 'Serif (Elegant)',
        mood: 'Ekskluzywny, Dominujący, Stabilny',
      },
    },
  },
  touchpoints: {
    title: 'Ekosystem Twojej Marki',
    description:
      'Logo to tylko wierzchołek góry lodowej. Projektujemy system, który działa spójnie w każdym punkcie styku z klientem (Touchpoints).',
    items: [
      {
        title: 'Digital',
        desc: 'Cyfrowe serce Twojej marki. Projektujemy interfejsy, które konwertują użytkowników w lojalnych klientów.',
        list: ['Strona WWW', 'Aplikacja', 'Landing Page'],
      },
      {
        title: 'Social',
        desc: 'Budujemy spójność tam, gdzie Twoi klienci spędzają najwięcej czasu. Od Instagrama po LinkedIn.',
        list: ['Avatar', 'Post Template', 'Cover Photo'],
      },
      {
        title: 'Print',
        list: ['Wizytówka', 'Papier Firmowy', 'Teczka'],
      },
      {
        title: 'Office',
        list: ['Stopka mailowa', 'Prezentacja PPT', 'Gadżety'],
      },
    ],
  },
  deliverables: {
    title: 'Profesjonalna Paczka Danych',
    description:
      'Nie wysyłamy po prostu pliku JPG na maila. Otrzymujesz kompletny Brand Kit, zorganizowany i gotowy do użycia przez drukarnie i deweloperów.',
    items: [
      {
        ext: 'AI / EPS',
        desc: 'Pliki źródłowe (Wektor). Nieskończone skalowanie bez utraty jakości.',
      },
      {
        ext: 'PDF',
        desc: 'Księga Znaku (Brand Book). Instrukcja obsługi Twojej marki.',
      },
      {
        ext: 'SVG / PNG',
        desc: 'Pliki do Internetu i Social Media. Zoptymalizowane i lekkie.',
      },
      {
        ext: 'CMYK',
        desc: 'Pliki przygotowane do druku (Wizytówki, Banery).',
      },
    ],
  },
  faqs: [
    {
      q: 'Czy otrzymam prawa autorskie do logo?',
      a: 'Tak. Po zakończeniu projektu i opłaceniu faktury przekazujemy Ci pełne autorskie prawa majątkowe. Możesz zarejestrować znak w urzędzie patentowym.',
    },
    {
      q: 'Ile propozycji logo otrzymam?',
      a: 'Standardowo przygotowujemy 3 odmienne linie kreatywne. Każda z nich wynika z wcześniejszej analizy i strategii. Po wyborze jednej, dopracowujemy ją do perfekcji.',
    },
    {
      q: 'Co to jest Księga Znaku i czy jej potrzebuję?',
      a: "To 'instrukcja obsługi' Twojej marki. Określa zasady stosowania logo, kolory (RGB/CMYK/Pantone), typografię i pola ochronne. Jest niezbędna, aby zachować spójność wizerunku w przyszłości.",
    },
    {
      q: 'Jak długo trwa proces brandingu?',
      a: 'Profesjonalny proces trwa zazwyczaj od 2 do 4 tygodni. Obejmuje to warsztaty, fazę koncepcyjną, projektowanie i przygotowanie plików produkcyjnych.',
    },
  ],
  cta: {
    title: 'Zbudujmy markę, której nie da się zignorować.',
    description:
      'Wyróżnij się albo zgiń. W gąszczu konkurencji wygrywają te firmy, które mają charakter i spójny przekaz.',
    button: 'Rozpocznij Projekt Brandingu',
  },
};

export const UI_UX_DESIGN_CONTENT = {
  seo: {
    title: 'UI/UX Design | Projektowanie Stron i Aplikacji',
    description:
      'Projektujemy intuicyjne i użyteczne interfejsy (UI/UX). Tworzymy makiety i prototypy stron oraz aplikacji, które zapewniają doskonałe doświadczenie użytkownika.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    badge: 'Human-Centric Interface',
    title: {
      line1: 'Interfejsy,',
      line2: 'które rozmawiają.',
    },
    description:
      'Projektujemy doświadczenia, nie tylko ekrany. Nasz proces łączy psychologię poznawczą z inżynierską precyzję, by Twoi użytkownicy poczuli różnicę od pierwszego kliknięcia.',
    cta: 'Rozpocznij Projekt',
    microCopy: {
      label: 'Workflow',
      value: 'Figma Prototype',
    },
  },
  designTokens: {
    title: 'Design Tokens',
    subtitle: 'Variable Control',
    labels: {
      color: 'Brand Primary',
      radius: 'Corner Radius',
      theme: 'System Theme',
    },
  },
  preview: {
    title: 'User Dashboard',
    subtitle: 'Real-time Interface Analytics',
    stats: {
      conversion: 'Conversion',
      bounce: 'Bounce Rate',
    },
    button: 'Confirm Action',
  },
  rwd: {
    title: 'Mobile First. Zawsze.',
    description:
      'Ponad 70% ruchu to smartfony. Projektujemy zaczynając od najmniejszego ekranu, aby mieć pewność, że kluczowe treści są zawsze czytelne i dostępne.',
    labels: {
      compact: 'Compact',
      adaptive: 'Adaptive',
      full: 'Full Experience',
    },
  },
  transformation: {
    title: 'Od szkicu do produktu',
    description:
      'Zobacz, jak przekuwamy surowe makiety funkcjonalne (Wireframes) w dopracowany interfejs (Hi-Fi). Przełącz widok, aby zobaczyć różnicę.',
    labels: {
      lofi: 'UX Wireframe',
      hifi: 'UI Final Design',
    },
    hifi: {
      cta: 'Get Started',
      secondary: 'Learn More',
    },
    lofi: {
      cta: 'Button',
      secondary: 'Secondary',
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
        title: 'Spójność (Consistency)',
        desc: 'Ten sam przycisk wygląda tak samo na każdej z 50 podstron.',
      },
      {
        title: 'Szybkość wdrażania',
        desc: 'Programiści otrzymują gotowe klocki, a nie obrazek do "odrysowania".',
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
        title: 'System Feedbacku',
        desc: 'Użytkownik zawsze wie, co dzieje się w systemie.',
      },
    ],
    labels: {
      ripple: 'Ripple Engine',
      logic: 'Logic Switch',
      perspective: '3D Perspective',
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
    button: 'Wyceń Prototyp',
  },
};

export const PRINT_DESIGN_CONTENT = {
  seo: {
    title: 'Projektowanie do Druku (DTP) | Wizytówki, Katalogi',
    description:
      'Przenosimy Twoją markę do świata offline. Projektujemy materiały do druku (DTP): wizytówki, katalogi, oferty, opakowania i inne.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    badge: 'Print Engineering',
    title: {
      line1: 'Design, który można',
      line2: 'dotknąć.',
    },
    description:
      'W świecie cyfrowym fizyczny produkt to luksus. Projektujemy materiały, które przechodzą test dotyku. Precyzja co do milimetra, idealne odwzorowanie kolorów i szlachetne uszlachetnienia.',
    cta: 'Wyceń Druk',
    microCopy: 'CMYK Ready',
  },
  guarantee: {
    title: 'Gwarancja Poprawności Technicznej',
    description:
      'Bierzemy pełną odpowiedzialność za pliki produkcyjne. Jeśli drukarnia odrzuci nasz projekt z przyczyn technicznych, poprawiamy go w trybie priorytetowym (do 1h) bezpłatnie.',
    items: ['Zgodność Kolorów', 'Poprawne Spady', 'Krzywe Wektorowe'],
  },
  finishes: {
    title: 'Laboratorium Uszlachetnień',
    description:
      'Druk to nie tylko kolor. To faktura, błysk i głębia. Wybierz efekt i poruszaj myszką nad wizytówką, aby zobaczyć grę światła.',
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
      { label: 'Katalogi', sub: 'Klejonie / Szycie', shape: 'w-20 h-28' },
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
