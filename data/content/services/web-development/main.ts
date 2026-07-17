import { SITE_CONFIG } from '../../../../config/site';

export const WEB_DEV_CONTENT = {
  seo: {
    // „Inżynieria i Wyniki" to porzucone pozycjonowanie — H1 mówi dziś „Bez szablonu,
    // bez długu technicznego". Tytuł w <head> szedł za starą wersją.
    title: 'Tworzenie stron WWW i aplikacji webowych | Bez szablonu',
    description:
      'Budujemy szybkie, bezpieczne i skalowalne rozwiązania webowe. Od Landing Page po zaawansowane aplikacje B2B. Poznaj nasz stack technologiczny i realizacje.',
    image: '/assets/images/frontend.png',
  },
  /**
   * Pas pod treścią hero — wzorzec z hero strony głównej: dowodem jest NAZWA
   * realnej realizacji, nie deklaracja. Wcześniej stały tu nazwy technologii,
   * czyli trzecie powtórzenie przekazu „znamy się na technologii" (pas + TechStack
   * + Ekosystem). Technologie zostają w TechStack, gdzie każda ma uzasadnienie
   * biznesowe; hero dostaje proof-strip.
   *
   * Statycznie, bez marquee: ruch ciągły wymagałby przycisku pauzy (WCAG 2.2.2),
   * a strona ma już 6 animacji w pętli bez pauzy. Nie dokładamy siódmej.
   * Same nazwy — zero zrzutów (PRODUCT.md → Constraints: hero to typografia i słowo).
   */
  heroTrust: {
    label: 'Wybrane realizacje',
    items: [
      'Fundacja Niepodzielni',
      'Driftmark Marine',
      'BDB Biuro',
      'PickMe',
      'Impackt Edu',
      'KorepetytorAI',
    ],
  },
  hero: {
    badge: 'Piszemy kod, nie składamy szablonów',
    title: 'Tworzenie stron WWW i systemów webowych.',
    titleAccent: 'Bez szablonu, bez długu technicznego.',
    description:
      'Budujemy szybkie, bezpieczne i skalowalne rozwiązania webowe — od landing page’y pod kampanie po aplikacje B2B. Technologię dobieramy do Twojego celu, nie do naszej wygody.',
    ctaPrimary: 'Rozpocznij projekt',
  },
  offerGrid: {
    // `subtitle` („Oferta & Rozwiązania") usunięty — to był eyebrow nad nagłówkiem
    // sekcji, czyli szablon agencyjny z anty-referencji SaaS-cream.
    title: 'Cztery rodzaje projektów, które budujemy',
    description:
      'Nie budujemy „stron z szablonu”. Dobieramy stack technologiczny tak, aby od pierwszego dnia wspierał Twoje cele biznesowe i marketingowe.',
  },
  faq: {
    // `subtitle` („Ekspercka Wiedza") usunięty — eyebrow bez treści.
    title: 'Najczęstsze pytania',
  },
  wpCustom: {
    // badge usunięty — sekcja nie potrzebuje eyebrow (DESIGN.md → The Jeden Eyebrow Rule)
    title: 'Dedykowane wtyczki i rozszerzenia',
    titleAccent: 'w znajomym WordPressie.',
    // Zdanie drugie niesie tezę usuniętej sekcji „Panel Administratora" (S5):
    // klient pracuje dalej w znanym panelu, custom siedzi pod spodem. Sekcja
    // znikła, bo stawiała tę tezę bez dowodu — zdanie zostaje, dowód niesie zrzut.
    description:
      'Gotowe wtyczki spowalniają stronę i nie spełniają Twoich wymagań? Piszemy autorskie rozwiązania w PHP i React, które rozszerzają możliwości Twojego WordPressa bez zbędnego balastu. Ty dalej pracujesz w znajomym panelu — dedykowana jest aplikacja pod spodem, nie Twoje przyzwyczajenia.',
    features: [
      { title: 'Kalkulatory Ofertowe', desc: 'Dynamiczne wyceny usług.' },
      { title: 'Integracje API', desc: 'Połączenie z CRM/ERP zewnętrznym.' },
      { title: 'Custom Post Types', desc: 'Niestandardowe katalogi danych.' },
      { title: 'Bramki Płatności', desc: 'Specyficzne metody płatności.' },
    ],
  },
  /**
   * Etap 2 (2026-07-15):
   * - `kpi` usunięte. „Main KPI: ROAS Booster / Brand Authority / Conversion Rate Up /
   *   Process Efficiency" to nie były KPI, tylko puste angielskie buzzwordy w miejscu,
   *   gdzie obiecujemy konkret. Doktryna: usuwane, nie zastępowane innymi.
   * - `subtitle` zostaje jako informacja („do czego to służy"), ale traci styl
   *   uppercase+tracking — cztery mikro-etykiety w jednym widoku to gramatyka
   *   eyebrow z anty-referencji „SaaS-cream" (DESIGN.md → The Jeden Eyebrow Rule).
   * - `highlight` tylko na jednej karcie. Dwa wyróżnienia naraz znoszą się nawzajem.
   */
  projectTypes: [
    {
      title: 'Landing page pod kampanię',
      subtitle: 'Kampanie Google Ads, lead magnet',
      desc: 'Strony sprzedażowe zaprojektowane pod konkretną akcję. Idealne do kampanii Google Ads, gdzie liczy się każdy ułamek sekundy i czytelne CTA.',
      techs: ['React', 'A/B Testing', 'GTM Layer'],
      path: '/web-development/landing-page/',
      highlight: false,
    },
    {
      title: 'Serwis firmowy',
      subtitle: 'Wizerunek B2B, architektura informacji',
      desc: 'Nowoczesne portale korporacyjne budujące zaufanie kontrahentów. Skalowalne, wielojęzyczne i zintegrowane z Twoim ekosystemem biznesowym.',
      techs: ['Next.js', 'WordPress Headless', 'SSR'],
      path: '/web-development/corporate/',
      highlight: true,
    },
    {
      title: 'E-commerce i skalowanie',
      subtitle: 'WooCommerce, rozwiązania dedykowane',
      desc: 'Wydajne sklepy internetowe zintegrowane z Baselinker, ERP i płatnościami. Automatyzujemy procesy, byś mógł skupić się na wzroście.',
      techs: ['WooCommerce', 'Redis', 'ElasticSearch'],
      path: '/web-development/ecommerce/',
      highlight: false,
    },
    {
      // `band: true` — ta pozycja wychodzi z siatki i dostaje własny, szeroki pas.
      // Powód nie jest kosmetyczny: to jedyna pozycja, która nie jest stroną, tylko
      // oprogramowaniem. Wzorzec z home, gdzie „Strona w abonamencie" (produkt)
      // wychodzi z siatki trzech kompetencji. Cztery identyczne karty to „identical
      // card grids" z listy absolutnych zakazów — złamanie rytmu musi mieć powód.
      title: 'Dedykowane systemy web',
      subtitle: 'Aplikacje B2B, SaaS, CRM',
      desc: 'Oprogramowanie szyte na miarę: systemy rezerwacji, panele klienta, platformy e-learningowe. Rozwiązujemy Twoje unikalne problemy biznesowe.',
      techs: ['Laravel / Node', 'PostgreSQL', 'Docker'],
      path: '/web-development/custom-app/',
      highlight: false,
      band: true,
      bandNote: 'To już nie strona — to oprogramowanie z własnym panelem i integracjami.',
    },
  ],
  /**
   * Przepisane 2026-07-15 z czterech kategorii na JEDNĄ SEKWENCJĘ.
   *
   * Powód nie jest kosmetyczny: nagłówek mówi „nie samotna wyspa", a układ czterech
   * odizolowanych kart ilustrował dokładnie to, czemu copy zaprzecza — cztery razy
   * samotną wyspę. To nie są kategorie do wyboru, tylko etapy jednej drogi
   * zamówienia: klient płaci → dane lecą do CRM → zamówienie ląduje w ERP →
   * paczka idzie do kuriera.
   *
   * Kolory kategorii (#3F3D91 / #E1306C / #00C853 / #F4B400) wycięte. Łamały
   * The Trzy Prądy Rule (czwarty i piąty akcent), a #F4B400 nie występował
   * w palecie DESIGN.md w ogóle. #00C853 to token `success` — kolor statusu użyty
   * jako dekoracja kategorii ERP. Nikt nie umiał odpowiedzieć, dlaczego kurierzy
   * są żółci. Sekwencja ma jeden kolor, bo jest jednym przepływem — różnicowanie
   * etapów kolorem sugerowałoby, że to alternatywy.
   */
  integrations: {
    title: 'Ekosystem, nie samotna wyspa',
    description:
      'Twoja strona to nie wyspa — to jeden przystanek na drodze zamówienia. Oto ta droga i systemy, które po niej jeżdżą.',
    origin: 'Twój serwis',
    flow: [
      { stage: 'Klient płaci', tools: ['Stripe', 'PayU', 'Przelewy24', 'PayPal'] },
      { stage: 'Dane lecą do CRM', tools: ['HubSpot', 'Salesmanago', 'Mailchimp', 'GA4'] },
      { stage: 'Zamówienie do ERP', tools: ['Subiekt GT', 'Comarch', 'Baselinker', 'SAP'] },
      { stage: 'Paczka do kuriera', tools: ['InPost', 'DHL', 'DPD', 'Furgonetka'] },
    ],
  },
  /**
   * Przepisane 2026-07-15 na twierdzenia jakościowe (decyzja właściciela).
   * Wypadły wszystkie zmyślone pomiary: „LCP 3.5s-5s" vs „0.4s-0.8s" — nigdy ich
   * nie mierzyliśmy, a kolumna „oni" opisywała anonimowego chochoła. Wypadły też
   * „WAF + Daily Backup" (niepotwierdzone, jak w S6). „6 msc SLA w cenie" → realne
   * „3 miesiące wsparcia" (SLA to osobna, płatna umowa — patrz sekcja infrastructure).
   *
   * Twierdzenie zostaje, pomiar znika. Realny dowód wydajności niesie karta flagowa
   * w sekcji Realizacje (Core Web Vitals, dane polowe, z datą).
   */
  comparison: {
    title: 'Tania strona to dług,',
    titleAccent: 'który spłacasz później.',
    description:
      'Różnica nie siedzi w cenie faktury, tylko w tym, co dostajesz pod spodem. Bez liczb, których nie zmierzyliśmy — same konkrety, które możesz sprawdzić w umowie i w kodzie.',
    columns: { bad: 'Szablon z marketplace', good: 'Nasz standard' },
    data: [
      {
        label: 'Co się ładuje',
        bad: 'Ciężki szablon i wtyczka na każdą funkcję',
        good: 'Kod pisany pod cel — tylko to, czego strona używa',
        desc: 'Wydajność zaczyna się od tego, czego nie ma',
      },
      {
        label: 'Architektura pod SEO',
        bad: 'Chaotyczna struktura, którą robot musi zgadywać',
        good: 'Semantyczny HTML i dane strukturalne',
        desc: 'Czytelność dla robotów Google',
      },
      {
        label: 'Zarządzanie treścią',
        bad: 'Edycja, po której układ się rozjeżdża',
        good: 'Znajomy panel, edycja bez psucia layoutu',
        desc: 'Zmieniasz treść sam, bez dzwonienia do nas',
      },
      {
        label: 'Wsparcie po wdrożeniu',
        bad: 'Brak albo płatne od pierwszego dnia',
        good: '3 miesiące wsparcia w cenie projektu',
        desc: 'Awaria z naszej winy to nasz koszt',
      },
    ],
  },
  faqs: [
    {
      q: 'Czy tworzenie stron www pod SEO naprawdę ma znaczenie?',
      a: "Tak. Google nie widzi obrazków, widzi kod. Jeśli kod jest 'brudny' (bloatware) lub strona wolno się ładuje, Twoje pozycje będą niskie, nawet jeśli masz świetne teksty. My budujemy semantyczny fundament (Schema.org), który Google kocha od pierwszej sekundy.",
    },
    {
      q: 'Jaki stos technologiczny (Tech Stack) stosujecie?',
      a: 'Wybieramy technologię pod cel biznesowy. Dla szybkich stron wizerunkowych: Next.js i React. Dla e-commerce: zoptymalizowany WooCommerce lub PrestaShop, a przy nietypowych wymaganiach Medusa.js albo Sylius. Dla aplikacji: Laravel i Node.js. Nie używamy gotowych, ociężałych szablonów.',
    },
    {
      q: 'Czy po wdrożeniu będę mógł sam edytować stronę?',
      a: 'Bezwzględnie tak. Wdrażamy dedykowane panele administracyjne lub Headless CMS (np. WordPress jako backend), które są intuicyjne i pozwalają na edycję bez ingerencji w kod.',
    },
  ],
  /**
   * Sekcja przepisana 2026-07-15. Wypadły: „Uptime SLA 99.9%" (nie jesteśmy w stanie
   * zagwarantować — decyzja właściciela), fejkowy licznik zablokowanych ataków
   * i symulowany terminal. Wypadły też „codzienne backupy / ochrona przed DDoS /
   * SSL 256-bit" — to zobowiązania publiczne, a nie zostały potwierdzone; wracają
   * dopiero po potwierdzeniu przez właściciela, nie „bo brzmią standardowo".
   *
   * Zostaje wyłącznie to, co właściciel firmuje. Treść czytana jak oferta, bo nią jest.
   */
  infrastructure: {
    title: 'Co dostajesz w cenie,',
    titleAccent: 'a za co dopłacasz.',
    description:
      'Piszemy to wprost, zanim podpiszesz umowę — a nie po pierwszej awarii. Bez gwiazdek i bez obietnic, których nie da się dotrzymać.',
    included: {
      label: 'W cenie projektu',
      items: [
        {
          title: '3 miesiące wsparcia po wdrożeniu',
          desc: 'Jeśli coś przestanie działać z naszej winy, naprawiamy to bez dodatkowych kosztów. Standard przy każdym projekcie.',
        },
        {
          // Potwierdzone przez właściciela 2026-07-15. „WAF" i „SSL 256-bit"
          // celowo NIE wracają — pytanie dotyczyło backupów, DDoS i SSL, więc
          // tylko te trzy mają potwierdzenie. Nie rozszerzamy zobowiązań domysłem.
          title: 'Codzienne backupy, SSL i ochrona przed DDoS',
          desc: 'Kopie zapasowe robione każdego dnia, szyfrowane połączenie i filtrowanie ruchu. Standard wdrożenia, nie dodatek za dopłatą.',
        },
      ],
    },
    optional: {
      label: 'Opcja dodatkowo płatna',
      items: [
        {
          title: 'Umowa SLA z gwarantowanym czasem reakcji',
          desc: 'Dla serwisów krytycznych, w których przestój kosztuje. Zakres i czas reakcji ustalamy indywidualnie — to osobna umowa i osobny koszt.',
        },
      ],
    },
  },
  /**
   * Poprawione 2026-07-15. Dwa problemy:
   * 1. `titleAccent` było martwym polem — BaseCta przyjmuje `title` jako pojedynczy
   *    string, więc nagłówek renderował się jako urwane „Gotowy na cyfrową".
   *    Pole usunięte, tytuł jest teraz kompletnym zdaniem.
   * 2. „dominację technologiczną" i „narzędzie, które będzie na siebie zarabiać" —
   *    puste superlatywy i obietnica przychodu, której nie firmujemy. Zastąpione
   *    tym, co realnie oferujemy: 15 minut rozmowy i widełki w 24 h (spójne
   *    z priceHint w hero).
   */
  ctaSection: {
    title: 'Zacznijmy od rozmowy, nie od faktury.',
    description:
      'Piętnaście minut konkretnych pytań o Twój projekt, a potem widełki wyceny w 24 godziny. Bez prezentacji sprzedażowej i bez zobowiązań.',
    buttonText: 'Umów konsultację',
    phone: SITE_CONFIG.contact.phone,
  },
};
