/**
 * Treść huba /design/ — przepisana 2026-07-16 (krytyka 14/40).
 * Usunięte: surowy HTML w hero (widoczny tag <strong>), sekcja ROI
 * z liczbami z powietrza („0.05s / 94% / 200% wzrost konwersji" — zakaz:
 * usuwać, nie podmieniać), angielski kostium („Creative Engineering",
 * „Industry Standard Stack", „Physical Touch"). Czas realizacji brandingu
 * ujednolicony do 3–4 tygodni (potwierdzony przez właściciela; wcześniej
 * trzy różne wersje na trzech stronach). Ceny potwierdzone 2026-07-16:
 * Print od 800, Branding od 3 500/8 000, UI/UX od 2 000, Audyt od 2 500.
 */
export const DESIGN_BRANDING_CONTENT = {
  seo: {
    title: 'Projektowanie graficzne i branding — logo, UI/UX, druk | Mixture',
    description:
      'Branding, projektowanie logo i ksiąg znaku, UI/UX oraz materiały do druku. Projektujemy jak inżynierowie: na siatkach, z zasadami i plikami produkcyjnymi.',
    image: '/assets/images/audyt-ux.png',
  },
  hero: {
    title: {
      line1: 'Wygląd to',
      line2: 'inżynieria.',
    },
    description:
      'Logo, interfejsy i materiały do druku projektujemy jak systemy: na siatkach, z zasadami zapisanymi w księdze znaku i z plikami produkcyjnymi, które drukarnia i programista przyjmują bez poprawek.',
    cta: 'Umów bezpłatną konsultację',
  },
  toolkit: {
    title: 'Narzędzia, w których pracujemy',
    tools: [
      { name: 'Figma', desc: 'Projekty UI i prototypy' },
      { name: 'Adobe CC', desc: 'Grafika i przygotowanie do druku' },
      { name: 'Blender', desc: 'Wizualizacje 3D' },
      { name: 'Rive / AE', desc: 'Animacje' },
      { name: 'Midjourney', desc: 'Generowanie koncepcji' },
    ],
  },
  ecosystem: {
    title: 'Jeden system, trzy światy',
    description:
      'Traktujemy design jako jeden organizm: branding zasila interfejsy, interfejsy zasilają marketing, a druk domyka doświadczenie w świecie fizycznym.',
    items: [
      {
        step: '01',
        title: 'Strategia i DNA marki',
        desc: 'Fundament: archetyp marki, paleta, język komunikacji. To źródło prawdy dla wszystkich dalszych decyzji wizualnych.',
        tags: ['Logo', 'Księga znaku', 'Ton komunikacji'],
      },
      {
        step: '02',
        title: 'Doświadczenie cyfrowe',
        desc: 'Zasady brandingu przekute na piksele: strony, aplikacje i materiały do kampanii — spójne z marką i mierzalne.',
        tags: ['Web design', 'UI aplikacji', 'Social media'],
      },
      {
        step: '03',
        title: 'Świat fizyczny',
        desc: 'Marka, którą można dotknąć: opakowania, wizytówki i materiały firmowe z plikami gotowymi do druku.',
        tags: ['Opakowania', 'Druk', 'Materiały firmowe'],
      },
    ],
  },
  sectors: {
    title: 'Design dopasowany do branży',
    description:
      'Każdy sektor rządzi się innymi prawami wizualnymi. Dopasowujemy estetykę do oczekiwań Twoich klientów — nie do naszego portfolio.',
    items: [
      {
        title: 'Technologie i SaaS',
        desc: 'Czystość, abstrakcja, ciemne motywy. Wizerunek firmy, która wie, co robi.',
      },
      {
        title: 'E-commerce',
        desc: 'Ekspozycja produktu, jasne tła, czytelne wezwania do działania. Design nastawiony na sprzedaż.',
      },
      {
        title: 'Kancelarie i finanse',
        desc: 'Szeryfowa typografia, granat, umiar. Wzbudzanie zaufania i stabilności.',
      },
      {
        title: 'Beauty i wellness',
        desc: 'Światło, powietrze, eleganckie detale. Granie na emocjach i zmysłach.',
      },
    ],
  },
  pillars: {
    title: 'Cztery filary designu',
    description:
      'Kompleksowa obsługa wizualna firmy. Każdy filar to osobna dyscyplina — i osobna podstrona z konkretami.',
    items: [
      {
        id: '01',
        title: 'Branding',
        role: 'Strategia i tożsamość',
        desc: 'Marki, które zapadają w pamięć: spójny system identyfikacji, który buduje zaufanie i uzasadnia cenę.',
        features: ['Strategia marki', 'Logo i księga znaku', 'Archetypy marki', 'Naming'],
        path: '/design/branding/',
      },
      {
        id: '02',
        title: 'UI/UX Design',
        role: 'Interfejsy i użyteczność',
        desc: 'Intuicyjne strony i aplikacje: projektujemy ścieżkę użytkownika i konwersję, nie tylko ładne ekrany.',
        features: ['Web design (RWD)', 'Makiety aplikacji', 'Prototypowanie', 'Design systemy'],
        path: '/design/ui-ux/',
      },
      {
        id: '03',
        title: 'Print i opakowania',
        role: 'Doświadczenie fizyczne',
        desc: 'Marka w świecie realnym: opakowania, które sprzedają na półce, i materiały premium z poprawnymi plikami produkcyjnymi.',
        features: [
          'Opakowania',
          'Katalogi i oferty',
          'Wizytówki premium',
          'Przygotowanie do druku',
        ],
        path: '/design/print/',
      },
      {
        id: '04',
        title: 'Audyt wizualny',
        role: 'Analiza i optymalizacja',
        desc: 'Strona nie sprzedaje? Sprawdzimy dlaczego: błędy UX, spójność marki, czytelność — z konkretną listą poprawek.',
        features: [
          'Analiza UX/UI',
          'Audyt spójności marki',
          'Weryfikacja dostępności',
          'Raport z zaleceniami',
        ],
        path: '/design/visual-audit/',
      },
    ],
  },
  /** Ciemnia dowodowa — realizacje z tagami design z CMS. */
  proof: {
    title: 'Projekty, nie deklaracje.',
    description:
      'Zamiast procentów z powietrza — realne projekty, przy których robiliśmy branding, interfejsy i materiały: wejdź i oceń sam.',
    linkLabel: 'Zobacz wszystkie realizacje',
    linkTo: '/portfolio',
  },
  cta: {
    title: 'Wygląd ma znaczenie.',
    text: 'Pierwsze wrażenie robi się raz. Porozmawiajmy, zanim zrobi je za Ciebie przypadkowy szablon.',
    button: 'Zamów darmowy audyt wizualny',
  },
  faqs: [
    {
      q: 'Czy otrzymuję pełne prawa autorskie do projektów?',
      a: 'Tak, po opłaceniu faktury końcowej przekazujemy pełne autorskie prawa majątkowe do wszystkich zaakceptowanych projektów. Możesz ich używać bez ograniczeń czasowych i terytorialnych.',
    },
    {
      q: 'W jakich formatach otrzymam gotowe pliki?',
      a: 'Dostarczamy kompletny pakiet produkcyjny: formaty wektorowe (AI, EPS, SVG, PDF) dla druku i skalowania oraz formaty rastrowe (PNG, JPG) zoptymalizowane pod internet i social media.',
    },
    {
      q: 'Ile trwa proces projektowy?',
      a: 'Czas zależy od zakresu. Branding (logo + księga znaku) to zazwyczaj 3–4 tygodnie. Projektowanie UI/UX strony trwa od 2 do 4 tygodni, wliczając makiety i prototyp.',
    },
    {
      q: 'Czy projektujecie również materiały do druku?',
      a: 'Tak, oferujemy kompleksowe przygotowanie do druku (DTP): wizytówki, katalogi, opakowania, teczki ofertowe i banery wielkoformatowe — z poprawnymi technicznie plikami dla drukarni.',
    },
  ],
};
