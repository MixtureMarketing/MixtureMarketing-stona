export const HEADLESS_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: CMS & Architecture',
    title: {
      line1: 'Headless WordPress:',
      line2: 'Zachowaj CMS, który kochasz. Zyskaj wydajność Next.js.',
    },
    subtitle:
      'Zyskaj prędkość, której potrzebujesz. Dowiedz się, dlaczego najwięksi gracze na rynku odcinają "głowę" swojemu WordPressowi.',
  },
  contextBox: {
    text: 'Szukasz wydajności bez kompromisów?',
    linkText: 'Sprawdź nasz audyt technologiczny',
    linkUrl: '/audyt-360/',
  },
  lead: {
    highlight:
      'WordPress napędza 43% Internetu. Marketing go kocha, bo jest prosty. Ale deweloperzy i dyrektorzy IT często go... nienawidzą. Dlaczego?',
    text: 'Bo tradycyjny WordPress bywa ociężały, podatny na ataki hakerskie i trudny w skalowaniu. Ale nie musisz go porzucać. Rozwiązaniem jest <strong>Headless WordPress</strong>.',
  },
  whatIs: {
    title: 'Operacja "Odcięcia Głowy": Czym to jest?',
    subtitle: 'Definicja',
    text: 'W tradycyjnym WordPressie "Głowa" (to, co widzi klient) jest nierozerwalnie złączona z "Ciałem" (panelem admina i bazą danych). W podejściu Headless rozdzielamy te dwie rzeczy.',
    items: [
      {
        label: '01. Backend',
        desc: 'WordPress służy <strong>tylko</strong> do edycji treści. Jest schowany i bezpieczny.',
      },
      {
        label: '02. API',
        desc: 'Treści są przesyłane "kablem" (REST API/GraphQL) do nowej strony.',
      },
      {
        label: '03. Frontend',
        desc: 'Strona zbudowana w <a href="/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych/" class="text-secondary hover:underline font-bold">Next.js</a> wyświetla treści błyskawicznie.',
      },
    ],
  },
  benefits: {
    title: 'Dlaczego warto przejść na Headless?',
    subtitle: 'Zalety Biznesowe',
    items: [
      {
        title: '1. Niesamowita Wydajność',
        desc: 'Tradycyjny WP składa stronę przy każdym wejściu. Headless (SSG) serwuje gotowe pliki. Wynik? Zielone wyniki w Google PageSpeed Insights i lepsze pozycje w wyszukiwarce.',
      },
      {
        title: '2. Bezpieczeństwo klasy wojskowej',
        desc: 'WordPress jest schowany za VPN lub firewallem. Haker widzi tylko statyczny HTML frontendu, w którym nie ma bazy danych ani panelu logowania do przejęcia.',
      },
      {
        title: '3. Omnichannel',
        desc: 'WordPress staje się centralnym repozytorium danych. Jedna edycja tekstu aktualizuje stronę www, aplikację mobilną i ekrany w Twoich salonach jednocześnie.',
      },
    ],
  },
  developers: {
    title: 'Koniec z "Długiem Technicznym"',
    subtitle: 'Developer Experience',
    text: 'Twoi programiści nie muszą już naprawiać starych szablonów PHP. Mogą używać nowoczesnych standardów: <a href="/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu/" class="text-white hover:text-primary underline">React</a>, Next.js i Tailwind CSS.',
    btnShow: 'Jak pobieramy dane? (GraphQL)',
    btnHide: 'Ukryj zapytanie',
  },
  analysis: {
    title: 'Czy Headless jest dla każdego?',
    subtitle: 'Szczera Analiza',
    bad: {
      title: 'Kiedy odradzamy',
      items: [
        '<strong>Mały budżet:</strong> Wdrożenie wymaga pracy programistów, nie tylko "wyklikania" szablonu.',
        '<strong>Prosta wizytówka:</strong> Dla strony z 5 zakładkami to "armata na wróbla".',
        '<strong>Zależność od Page Builderów:</strong> W Headless tracisz podgląd na żywo w Elementorze.',
      ],
    },
    good: {
      title: 'Kiedy to strzał w 10!',
      items: [
        '<strong>Duże portale:</strong> Gdy masz tysiące artykułów i ogromny ruch.',
        '<strong><a href="/web-development/ecommerce/" class="text-dark hover:underline font-bold">E-commerce</a></strong>: Gdy chcesz mieć super szybki sklep (WooCommerce Backend).',
        '<strong>FinTech / Bankowość:</strong> Gdzie bezpieczeństwo jest absolutnym priorytetem.',
      ],
    },
  },
  cta: {
    title: 'Przyspiesz swojego WordPressa.',
    text: 'Chcesz zachować wygodny panel edycji, ale potrzebujesz wydajności Next.js? Porozmawiajmy o migracji Twojego serwisu na architekturę Headless.',
    primaryBtn: 'Umów analizę wdrożeniową',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
