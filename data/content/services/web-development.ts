import { SITE_CONFIG } from '../../../config/site';

export const WEB_DEV_CONTENT = {
  seo: {
    title: 'Tworzenie Stron i Aplikacji Webowych | Inżynieria i Wyniki',
    description:
      'Budujemy szybkie, bezpieczne i skalowalne rozwiązania webowe. Od Landing Page po zaawansowane aplikacje B2B. Poznaj nasz stack technologiczny i realizacje.',
    image: '/assets/images/frontend.png',
  },
  hero: {
    badge: 'Software House & Agency',
    title: 'Tworzenie Stron WWW i Systemów Webowych.',
    titleAccent: 'Inżynieria i Wyniki.',
    description:
      "Budujemy szybkie, bezpieczne i skalowalne rozwiązania webowe. Od prostych Landing Page'y pod kampanie, po zaawansowane aplikacje B2B. Technologia dobrana do Twojego celu.",
    ctaPrimary: 'Rozpocznij Projekt',
    ctaSecondary: 'Zobacz Stack Tech',
  },
  offerGrid: {
    title: 'Kompleksowe Usługi Programistyczne',
    subtitle: 'Oferta & Rozwiązania',
    description:
      "Nie budujemy 'stron z szablonu'. Dobieramy stack technologiczny tak, aby od pierwszego dnia wspierał Twoje cele biznesowe i marketingowe.",
  },
  faq: {
    title: 'Najczęstsze pytania',
    subtitle: 'Ekspercka Wiedza',
  },
  wpCustom: {
    badge: 'WordPress Beyond Limits',
    title: 'Dedykowane Wtyczki',
    titleAccent: 'i Rozszerzenia WordPress.',
    description:
      'Gotowe wtyczki spowalniają stronę i nie spełniają Twoich wymagań? Piszemy autorskie rozwiązania w PHP i React, które rozszerzają możliwości Twojego WordPressa bez zbędnego balastu.',
    features: [
      { title: 'Kalkulatory Ofertowe', desc: 'Dynamiczne wyceny usług.' },
      { title: 'Integracje API', desc: 'Połączenie z CRM/ERP zewnętrznym.' },
      { title: 'Custom Post Types', desc: 'Niestandardowe katalogi danych.' },
      { title: 'Bramki Płatności', desc: 'Specyficzne metody płatności.' },
    ],
  },
  adminPanel: {
    badge: 'Intuicyjne Zarządzanie',
    title: 'Panel Administratora',
    titleAccent: 'skrojony pod Twój biznes.',
    description:
      'Twój panel administracyjny powinien pomagać, a nie przeszkadzać. Dostosowujemy narzędzia do rodzaju projektu:',
    sections: [
      {
        title: 'Strony Marketingowe (WordPress Headless)',
        desc: 'Intuicyjna edycja tekstów i zdjęć. Znany interfejs, ale z super-szybkim frontendem w Next.js.',
      },
      {
        title: 'Aplikacje Dedykowane (Custom Admin)',
        desc: 'Panele szyte na miarę. Tabele zamówień, statystyki, zarządzanie użytkownikami (CRUD) i integracje API w jednym miejscu.',
      },
    ],
  },
  projectTypes: [
    {
      title: 'Landing Page High-Conversion',
      subtitle: 'Kampanie Google Ads / Lead Magnet',
      desc: 'Strony sprzedażowe zaprojektowane pod konkretną akcję. Idealne do kampanii Google Ads, gdzie liczy się każdy ułamek sekundy i czytelne CTA.',
      techs: ['React', 'A/B Testing', 'GTM Layer'],
      kpi: 'Conversion Rate Up',
      path: '/web-development/landing-page/',
      highlight: false,
    },
    {
      title: 'Serwisy Firmowe Premium',
      subtitle: 'Wizerunek B2B & Architektura Informacji',
      desc: 'Nowoczesne portale korporacyjne budujące zaufanie kontrahentów. Skalowalne, wielojęzyczne i zintegrowane z Twoim ekosystemem biznesowym.',
      techs: ['Next.js 14', 'WordPress Headless', 'SSR'],
      kpi: 'Brand Authority',
      path: '/web-development/corporate/',
      highlight: true,
    },
    {
      title: 'E-commerce & Skalowanie',
      subtitle: 'WooCommerce & Custom Solutions',
      desc: 'Wydajne sklepy internetowe zintegrowane z Baselinker, ERP i płatnościami. Automatyzujemy procesy, byś mógł skupić się na wzroście.',
      techs: ['WooCommerce', 'Redis', 'ElasticSearch'],
      kpi: 'ROAS Booster',
      path: '/web-development/ecommerce/',
      highlight: true,
    },
    {
      title: 'Dedykowane Systemy Web',
      subtitle: 'Aplikacje B2B / SaaS / CRM',
      desc: 'Oprogramowanie szyte na miarę: systemy rezerwacji, panele klienta, platformy e-learningowe. Rozwiązujemy Twoje unikalne problemy biznesowe.',
      techs: ['Laravel / Node', 'PostgreSQL', 'Docker'],
      kpi: 'Process Efficiency',
      path: '/web-development/custom-app/',
      highlight: false,
    },
  ],
  integrations: {
    title: 'Ekosystem, nie samotna wyspa',
    description:
      'Twoja strona musi rozmawiać z resztą biznesu. Łączymy systemy w jeden spójny organizm.',
    categories: [
      {
        name: 'Płatności & Finanse',
        color: '#3F3D91',
        tools: ['Stripe', 'PayU', 'Przelewy24', 'PayPal'],
      },
      {
        name: 'Marketing & CRM',
        color: '#E1306C',
        tools: ['HubSpot', 'Salesmanago', 'Mailchimp', 'GA4'],
      },
      {
        name: 'ERP & Magazyn',
        color: '#00C853',
        tools: ['Subiekt GT', 'Comarch', 'Baselinker', 'SAP'],
      },
      {
        name: 'Kurierzy & Logistyka',
        color: '#F4B400',
        tools: ['InPost', 'DHL', 'DPD', 'Furgonetka'],
      },
    ],
  },
  comparison: {
    title: 'Specyfikacja Techniczna',
    subtitle: 'Porównanie Standardów',
    description:
      'Tania strona to często dług techniczny na start. Zobacz różnicę w kodzie, wydajności i bezpieczeństwie.',
    data: [
      {
        label: 'Szybkość ładowania (LCP)',
        bad: '3.5s - 5s',
        good: '0.4s - 0.8s',
        desc: 'Czas do pełnej interaktywności',
      },
      {
        label: 'Architektura (SEO)',
        bad: 'Chaotyczna',
        good: 'Semantic HTML5',
        desc: 'Czytelność dla robotów Google',
      },
      {
        label: 'Bezpieczeństwo',
        bad: 'Podstawowe',
        good: 'WAF + Daily Backup',
        desc: 'Ochrona przed atakami i utratą danych',
      },
      {
        label: 'Zarządzanie treścią',
        bad: 'Skomplikowane',
        good: 'Headless CMS',
        desc: 'Łatwość edycji bez psucia układu',
      },
      {
        label: 'Wsparcie techniczne',
        bad: 'Brak / Płatne',
        good: '6 msc SLA w cenie',
        desc: 'Gwarancja stabilności po wdrożeniu',
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
      a: 'Wybieramy technologię pod cel biznesowy. Dla szybkich stron wizerunkowych: Next.js i React. Dla e-commerce: zoptymalizowany WooCommerce lub Headless Shopify. Dla aplikacji: Laravel i Node.js. Nie używamy gotowych, ociężałych szablonów.',
    },
    {
      q: 'Czy po wdrożeniu będę mógł sam edytować stronę?',
      a: 'Bezwzględnie tak. Wdrażamy dedykowane panele administracyjne lub Headless CMS (np. WordPress jako backend), które są intuicyjne i pozwalają na edycję bez ingerencji w kod.',
    },
  ],
  infrastructure: {
    badge: 'Enterprise Grade Security',
    title: 'Bezpieczeństwo',
    titleAccent: 'wpisane w kod.',
    description:
      'Nie polegamy na wtyczkach "security". Zabezpieczamy infrastrukturę na poziomie serwera i aplikacji. Codzienne backupy, ochrona przed DDoS i szyfrowanie SSL to u nas standard.',
    stats: [
      { label: 'Uptime SLA', val: '99.9%' },
      { label: 'Backup', val: 'Daily' },
      { label: 'SSL', val: '256-bit' },
      { label: 'Protection', val: 'WAF' },
    ],
  },
  ctaSection: {
    title: 'Gotowy na cyfrową',
    titleAccent: 'dominację technologiczną?',
    description:
      'Nie kupuj strony, zainwestuj w narzędzie, które będzie na siebie zarabiać. Umów się na 15-minutowy call strategiczny, podczas którego przeanalizujemy Twoje potrzeby i zaproponujemy optymalne rozwiązania.',
    buttonText: 'Umów Konsultację',
    phone: SITE_CONFIG.contact.phone,
  },
};

export const LANDING_PAGE_CONTENT = {
  seo: {
    title: 'Landing Page High-Conversion | Strony Sprzedażowe',
    description:
      'Projektujemy strony landing page zoptymalizowane pod kątem maksymalnej konwersji. Idealne do kampanii Google Ads i generowania leadów.',
    image: '/assets/images/frontend.png',
  },
  hero: {
    badge: 'Conversion Focused',
    title: {
      line1: 'Landing Page',
      line2: 'pod Wynik.',
    },
    description:
      'W kampaniach płatnych (Ads) liczy się każda milisekunda. Budujemy strony lądowania, które ładują się natychmiast i prowadzą użytkownika prosto do celu.',
    ctaPrimary: 'Wyceń Landing Page',
    ctaSecondary: 'Zobacz Anatomię',
    simulator: {
      title: 'Symulator Prędkości',
      labels: {
        loadTime: 'Czas Ładowania',
        conversionLoss: 'Utrata Konwersji',
        score: 'Performance Score',
        fast: 'Szybko (0.5s)',
        slow: 'Wolno (5.0s)',
      },
    },
  },
  useCases: {
    title: 'Jeden cel, jedna akcja',
    description:
      "Landing Page nie może być 'o wszystkim'. Projektujemy dedykowane strony pod konkretny cel biznesowy i źródło ruchu.",
    items: [
      {
        title: 'Lead Magnet',
        subtitle: 'Budowa Bazy',
        desc: 'Krótka strona oferująca darmową wartość (E-book, Raport, Checklistę) w zamian za adres e-mail. Kluczowa dla lejków marketingowych.',
        kpi: 'Conversion Rate > 25%',
        tags: ['Formularz', 'Autoresponder'],
      },
      {
        title: 'Sales Page',
        subtitle: 'Sprzedaż Bezpośrednia',
        desc: 'Długa strona sprzedażowa (Long Form). Szczegółowo omawia problem, rozwiązanie i korzyści produktu. Zbija obiekcje i zamyka sprzedaż.',
        kpi: 'Revenue / ROAS',
        tags: ['Storytelling', 'Social Proof'],
      },
      {
        title: 'Webinar / Event',
        subtitle: 'Rejestracja',
        desc: 'Strona rejestracyjna z licznikiem odliczającym czas (FOMO). Maksymalizuje liczbę zapisów na wydarzenie online lub offline.',
        kpi: 'Cost Per Lead (CPL)',
        tags: ['Timer', 'Video Hero'],
      },
      {
        title: 'App Pre-launch',
        subtitle: 'Mobile App',
        desc: 'Promocja aplikacji mobilnej przed premierą. Zbieranie listy oczekujących (Waitlist) i budowanie napięcia wokół produktu.',
        kpi: 'Viral Coefficient',
        tags: ['Mockups', 'Waitlist'],
      },
    ],
  },
  psychology: {
    badge: 'Psychologia Sprzedaży',
    title: {
      line1: 'Model AIDA.',
      line2: 'Nauka, nie przypadek.',
    },
    description:
      'Nie układamy sekcji "na czuja". Projektujemy Landing Page zgodnie z procesem decyzyjnym w mózgu klienta. Prowadzimy go za rękę od pierwszego wrażenia do kliknięcia.',
    steps: [
      {
        step: '01',
        name: 'Attention (Uwaga)',
        desc: 'Nagłówek (H1), który w 3 sekundy obiecuje konkretną wartość. Decyduje o tym, czy użytkownik zostanie.',
        tech: 'H1 / Hero Shot',
      },
      {
        step: '02',
        name: 'Interest (Zainteresowanie)',
        desc: 'UVP (Unique Value Proposition). Pokazujemy produkt w akcji i wyjaśniamy, dlaczego jest lepszy.',
        tech: 'Features / Video',
      },
      {
        step: '03',
        name: 'Desire (Pożądanie)',
        desc: "Social Proof (opinie, loga), liczby i język korzyści. Zmieniamy 'chcę to sprawdzić' w 'muszę to mieć'.",
        tech: 'Testimonials / Data',
      },
      {
        step: '04',
        name: 'Action (Działanie)',
        desc: 'Jeden, wyraźny cel (CTA). Formularz lub przycisk zakupu bez zbędnych rozpraszaczy i linków wychodzących.',
        tech: 'Sticky CTA / Form',
      },
    ],
  },
  integrations: {
    title: 'Twój Landing to nie samotna wyspa',
    description:
      'Integrujemy stronę z Twoim ekosystemem marketingowym. Dane z formularzy trafiają automatycznie tam, gdzie ich potrzebujesz.',
  },
  cta: {
    title: 'Masz już kampanię, ale brakuje strony?',
    description:
      'Możemy uruchomić Twój Landing Page w trybie ekspresowym (nawet 48h w opcji Turbo). Nie trać budżetu reklamowego na słabą stronę.',
    button: 'Rozpocznij Projekt',
  },
};

export const CORPORATE_WEBSITE_CONTENT = {
  seo: {
    title: 'Strony Internetowe dla Firm | Wizerunek i Skala B2B',
    description:
      'Tworzymy profesjonalne serwisy korporacyjne budujące autorytet marki. Bezpieczne, szybkie i zoptymalizowane pod kątem generowania leadów biznesowych.',
    image: '/assets/images/frontend.png',
  },
  hero: {
    badge: 'Global Enterprise Solutions',
    title: {
      line1: 'Korporacyjne Serwisy WWW.',
      line2: 'Skala, Bezpieczeństwo, Prestiż.',
    },
    description:
      'Dla firm, które nie mogą pozwolić sobie na przestoje. Budujemy serwisy odporne na duże obciążenia, zgodne z wymogami prawnymi (WCAG/RODO) i gotowe na globalną ekspansję.',
    cta: 'Konsultacja Techniczna',
    microCopy: 'CDN Ready',
  },
  modules: {
    title: 'Moduły dla Biznesu',
    description:
      'Strona korporacyjna to ekosystem. Integrujemy narzędzia, które usprawniają procesy wewnątrz i na zewnątrz organizacji.',
    items: [
      {
        title: 'Kariera & HR',
        desc: 'System rekrutacyjny zintegrowany z ATS. Filtrowanie ofert, formularze aplikacyjne i budowanie Employer Branding.',
        tech: 'ATS Integration',
      },
      {
        title: 'Relacje Inwestorskie',
        desc: 'Bezpieczna strefa raportów giełdowych (ESPI/EBI), interaktywne wykresy akcji i kalendarium wydarzeń korporacyjnych.',
        tech: 'Secure Data',
      },
      {
        title: 'Strefa Klienta (B2B)',
        desc: 'Dedykowany panel logowania dla partnerów. Dostęp do faktur, cenników hurtowych i dokumentacji technicznej.',
        tech: 'Auth & RBAC',
      },
      {
        title: 'Newsroom & Blog',
        desc: 'Centrum prasowe dla mediów. Kategoryzacja treści, materiały do pobrania (Press Kits) i automatyzacja newslettera.',
        tech: 'Media Assets',
      },
    ],
  },
  cms: {
    title: 'Zarządzanie treścią bez kompromisów',
    description:
      'Elastyczność dla marketingu, bezpieczeństwo dla IT. Wybierz silnik dopasowany do Twojej organizacji.',
    wordpress: {
      label: 'WordPress (Marketing)',
      title: 'Swoboda i niezależność.',
      desc: "Najpopularniejszy CMS na świecie, dostosowany do potrzeb korporacyjnych. Intuicyjny edytor wizualny (Gutenberg/ACF) pozwala działowi marketingu tworzyć nowe landing page'e bez pomocy programistów.",
      features: [
        'Intuicyjna edycja (Drag & Drop)',
        'Tysiące gotowych integracji',
        'Niski koszt wdrożenia i utrzymania',
        'Krótki czas szkolenia zespołu',
      ],
    },
    headless: {
      label: 'Headless CMS (IT)',
      title: 'Wydajność i bezpieczeństwo.',
      desc: 'Oddzielamy warstwę prezentacji (Frontend) od bazy danych (Backend). Efekt? Strona jest nie do zhakowania, ładuje się w ułamku sekundy, a treściami zarządzasz z poziomu ultra-nowoczesnego panelu (Sanity/Strapi).',
      features: [
        'Architektura niepodatna na ataki SQL Injection',
        'Globalna dystrybucja treści (CDN)',
        'Omnichannel (Te same treści na WWW i w Appce)',
        'Technologia przyszłości (React/Next.js)',
      ],
    },
  },
  compliance: {
    badge: 'Legal Tech',
    title: {
      line1: 'Bezpieczeństwo',
      line2: 'to nie opcja. To wymóg.',
    },
    description:
      'Dla korporacji i instytucji zgodność z prawem (Compliance) jest krytyczna. Wdrażamy standardy, które chronią Twoją firmę przed karami i utratą reputacji.',
    items: [
      {
        title: 'WCAG 2.1 AA',
        desc: 'Pełna dostępność cyfrowa dla osób z niepełnosprawnościami. Kontrast, nawigacja klawiaturą, audiodeskrypcja.',
        status: 'Verified',
      },
      {
        title: 'RODO / Omnibus',
        desc: 'Zaawansowane zarządzanie zgodami (Consent Mode v2), rejestry czynności przetwarzania, polityki prywatności.',
        status: 'Compliant',
      },
      {
        title: 'Anty-DDoS',
        desc: 'Ochrona infrastruktury przez Cloudflare Enterprise. Firewall (WAF) blokujący ataki i boty.',
        status: 'Active',
      },
      {
        title: 'SLA 99.9%',
        desc: 'Gwarancja dostępności usług. Redundantne serwery i codzienne kopie zapasowe (Disaster Recovery).',
        status: 'Monitored',
      },
    ],
  },
  migration: {
    title: 'Migracja bez utraty ruchu',
    subtitle: 'Protocol 301',
    description:
      'Boisz się, że nowa strona zniszczy Twoje pozycje w Google? Posiadamy procedurę bezpiecznej migracji, która działa jak precyzyjna operacja chirurgiczna.',
    steps: [
      {
        id: '01',
        title: 'Crawl & Audit',
        desc: 'Skanujemy starą strukturę URL i tworzymy mapę wszystkich linków.',
        status: 'Completed',
      },
      {
        id: '02',
        title: 'Mapowanie 301',
        desc: 'Tworzymy tabelę przekierowań: Stary Adres -> Nowy Odpowiednik.',
        status: 'Processing',
      },
      {
        id: '03',
        title: 'Implementacja',
        desc: 'Wgrywamy reguły do pliku .htaccess lub konfiguracji nginx.',
        status: 'Pending',
      },
      {
        id: '04',
        title: 'Weryfikacja GSC',
        desc: 'Monitorujemy ruch po starcie, eliminując błędy 404.',
        status: 'Pending',
      },
    ],
  },
  cta: {
    title: 'Twój biznes zasługuje na lepszą stronę.',
    description:
      'Przestarzała strona odstrasza klientów. Zmieńmy to. Umów się na bezpłatną konsultację, a doradzimy, jak odświeżyć wizerunek Twojej firmy.',
    button: 'Umów rozmowę z ekspertem',
  },
};

export const ECOMMERCE_CONTENT = {
  seo: {
    title: 'Tworzenie Sklepów Internetowych E-commerce | WooCommerce',
    description:
      'Specjalizujemy się w tworzeniu wydajnych sklepów e-commerce opartych o WooCommerce. Integracje z płatnościami, ERP i Baselinker.',
    image: '/assets/images/backend.png',
  },
  hero: {
    badge: 'E-commerce Solutions',
    title: {
      line1: 'Sklepy nastawione',
      line2: 'na czysty zysk.',
    },
    description:
      'Budujemy systemy sprzedażowe, które pracują 24/7. Automatyzujemy logistykę, płatności i marketing, abyś Ty mógł skupić się na rozwoju biznesu, a nie "klikaniu zamówień".',
    ctaPrimary: 'Wyceń Sklep',
    ctaSecondary: 'Integracja Baselinker',
  },
  automation: {
    title: 'Centrum Dowodzenia E-commerce',
    description:
      'Koniec z ręcznym przepisywaniem zamówień. Tworzymy centralny system (Hub), który łączy Twój sklep ze światem.',
    hubs: {
      myStore: 'Twój Sklep',
      masterData: 'Master Data',
    },
    integrations: [
      { label: 'Allegro / Amazon', color: '#FF5A00' },
      { label: 'Hurtownie (XML)', color: '#3F3D91' },
      { label: 'Kurierzy (InPost)', color: '#FFCC00' },
      { label: 'Księgowość (ERP)', color: '#00C853' },
      { label: 'Marketing (Ads)', color: '#E1306C' },
    ],
  },
  configurator: {
    badge: 'Product Intelligence',
    title: {
      line1: 'Sprzedawaj Produkty',
      line2: 'na Wymiar (Custom).',
    },
    description:
      'Standardowy sklep to za mało? Tworzymy zaawansowane konfiguratory produktowe z logiką warunkową. Klient widzi zmiany wizualne i cenowe w czasie rzeczywistym.',
    features: [
      {
        title: 'Wizualizacje 2D / 3D',
        desc: 'Podgląd produktu zmienia się dynamicznie wraz z wyborem opcji.',
      },
      {
        title: 'Dynamiczna Wycena',
        desc: 'Cena obliczana z wzorów matematycznych (m2, mb, waga, dodatki).',
      },
      {
        title: 'Logika Warunkowa',
        desc: 'Blokowanie opcji niemożliwych technologicznie (np. Złoty kolor tylko w wersji Premium).',
      },
    ],
    preview: {
      label: 'LIVE PREVIEW',
      width: 'Width: 65cm',
      weight: '18.5 kg',
      warranty: '5 LAT',
      norm: 'BIFMA',
    },
    controls: {
      title: 'ErgoChair Pro',
      subtitle: 'Custom Office Solution',
      priceLabel: 'Total Price',
      button: 'Dodaj do koszyka',
    },
  },
  boosters: {
    title: 'Funkcje, które sprzedają',
    description:
      'Twój sklep nie może być tylko katalogiem. Wdrażamy mechanizmy psychologii sprzedaży, które zwiększają wartość koszyka (AOV) i konwersję.',
    articleLink: 'Czytaj: Dlaczego Twój sklep nie sprzedaje? (Analiza UX)',
    items: [
      {
        title: 'Inteligentna Wyszukiwarka',
        desc: 'Podpowiedzi w czasie rzeczywistym, tolerancja literówek i promowanie bestsellerów w wynikach.',
      },
      {
        title: 'Cross-Selling',
        desc: '"Klienci kupili również" oraz zestawy produktowe. Zwiększamy średnią wartość zamówienia (AOV) bez wysiłku.',
      },
      {
        title: 'Szybki Checkout',
        desc: 'Zakupy bez rejestracji (Guest Checkout), autouzupełnianie adresu (InPost/Google Maps) i płatności 1-kliknięciem.',
      },
    ],
  },
  seoTechnical: {
    badge: 'E-commerce SEO',
    title: {
      line1: 'Widoczność = Sprzedaż.',
      line2: 'Technologia, którą',
      line3: 'lubi Google.',
    },
    description:
      'Twój sklep musi być czytelny dla robotów Google. Wdrażamy Schema.org (Rich Snippets), dzięki czemu Twoje produkty wyświetlają się w wynikach wyszukiwania wraz z ceną, dostępnością i opiniami.',
    features: [
      {
        title: 'Product Schema (Rich Snippets)',
        desc: 'Gwiazdki, cena i stan magazynowy widoczne bezpośrednio w Google.',
      },
      {
        title: 'Szybkość (Core Web Vitals)',
        desc: 'Formaty WebP, Lazy Loading i czysty kod dla błyskawicznego ładowania.',
      },
    ],
  },
  ownership: {
    title: 'Własność czy Wynajem?',
    description:
      'Dlaczego budujemy na otwartym oprogramowaniu (WooCommerce), a nie na platformach abonamentowych (SaaS)?',
    saas: {
      badge: 'Model Abonamentowy',
      title: 'Platformy SaaS',
      subtitle: 'Shopify, Shoper, Wix',
      rows: [
        { label: 'Własność Danych', val: 'Nie (Wynajem)' },
        { label: 'Prowizja od sprzedaży', val: 'Często 1-2%' },
        { label: 'Koszty miesięczne', val: 'Rosnące (Abonament)' },
        { label: 'Dostęp do kodu', val: 'Zablokowany' },
      ],
      risk: 'Ryzyko: Jeśli przestaniesz płacić abonament, tracisz sklep i całą historię klientów.',
    },
    woo: {
      badge: 'Pełna Własność',
      title: 'Nasz Standard (WooCommerce)',
      subtitle: 'Open Source & Dedicated',
      rows: [
        { label: 'Własność Danych', val: '100% Twoje' },
        { label: 'Prowizja od sprzedaży', val: '0% (Brak)' },
        { label: 'Koszty miesięczne', val: 'Tylko hosting (~100zł)' },
        { label: 'Dostęp do kodu', val: 'Nieograniczony' },
      ],
      safety:
        'Bezpieczeństwo: Jesteś niezależny. Możesz przenieść sklep na inny serwer w dowolnym momencie.',
    },
  },
  cta: {
    title: 'Masz pomysł na biznes online?',
    text: 'Nie trać czasu na walkę z technologią. My dostarczymy Ci gotowy, zatowarowany sklep, a Ty zajmij się sprzedażą.',
    button: 'Umów darmową konsultację',
  },
};

export const CUSTOM_WEB_APP_CONTENT = {
  seo: {
    title: 'Aplikacje Webowe i Systemy Dedykowane | SaaS, CRM',
    description:
      'Tworzymy oprogramowanie szyte na miarę. Dedykowane systemy CRM, platformy SaaS, panele klienta i inne aplikacje webowe rozwiązujące realne problemy biznesowe.',
    image: '/assets/images/backend.png',
  },
  hero: {
    badge: 'Custom Software Development',
    title: {
      line1: 'Dedykowane Aplikacje.',
      line2: 'Rozwiązania, których nie kupisz w pudełku.',
    },
    description:
      'Twój biznes wyrósł z Excela? Gotowy soft (SaaS) ma za mało funkcji albo kosztuje fortunę przy skali? Budujemy systemy dopasowane do Twoich procesów – nie odwrotnie.',
    cta: 'Konsultacja Techniczna',
    microCopy: 'Bezpieczeństwo i Skala',
  },
  useCases: {
    title: 'Co możemy dla Ciebie zbudować?',
    description:
      'Nie ograniczamy się do jednej branży. Tworzymy narzędzia, które oszczędzają czas, automatyzują pracę i generują przychód.',
    items: [
      {
        title: 'Portal B2B',
        desc: 'Automatyzacja zamówień hurtowych. Indywidualne cenniki, historia faktur, stany magazynowe live. Zintegrowane z Twoim ERP (Subiekt/Comarch).',
        tags: ['Integracja ERP', 'Faktury', 'Rabaty'],
      },
      {
        title: 'System Rezerwacji',
        desc: 'Dla branży usługowej i medycznej. Kalendarze, powiadomienia SMS, płatności online i zarządzanie grafikami pracowników.',
        tags: ['Kalendarz', 'SMS Gateway', 'Płatności'],
      },
      {
        title: 'CRM / ERP',
        desc: 'Zarządzanie procesami wewnątrz firmy. Obieg dokumentów, zarządzanie flotą, HR lub produkcją. Szyte na miarę, bez zbędnych funkcji.',
        tags: ['Automatyzacja', 'Raporty', 'Dashboard'],
      },
      {
        title: 'SaaS MVP',
        desc: 'Masz pomysł na startup? Budujemy pierwszą wersję produktu (Minimum Viable Product), abyś mógł szybko wejść na rynek i pozyskać inwestora.',
        tags: ['Szybki Start', 'Skalowalność', 'Subskrypcje'],
      },
    ],
  },
  techStack: {
    badge: 'Technology Stack v2.5',
    title: {
      line1: 'Technologie,',
      line2: 'którym ufamy.',
    },
    description:
      'Inżynieria to wybór odpowiednich narzędzi do problemu. Stawiamy na rozwiązania sprawdzone w boju, skalowalne i bezpieczne.',
    items: [
      {
        cat: 'Backend',
        link: '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto',
        items: ['Node.js', 'Python (Django)', 'Go', 'Laravel'],
      },
      {
        cat: 'Frontend',
        link: '/baza-wiedzy/frontend-bez-tajemnic-kompendium-cto',
        items: ['React.js', 'Next.js', 'Vue.js', 'Tailwind CSS'],
      },
      {
        cat: 'Database',
        link: '/baza-wiedzy/bazy-danych-kompendium-architekta',
        items: ['PostgreSQL', 'Redis', 'MongoDB', 'ElasticSearch'],
      },
      {
        cat: 'DevOps',
        link: '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
        items: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      },
    ],
  },
  trust: {
    title: 'Kod jest Twój. Od pierwszej linijki.',
    description:
      'Największa obawa przy dedykowanych systemach? Uzależnienie od wykonawcy (Vendor Lock-in). My działamy inaczej. Stawiamy na pełną transparentność i własność intelektualną.',
    items: [
      {
        title: 'Brak Vendor Lock-in',
        desc: 'Nie "szyfrujemy" kodu. Tworzymy oprogramowanie w popularnych technologiach (React, Node, Python), które może rozwijać każdy kompetentny programista.',
      },
      {
        title: 'Dokumentacja Techniczna',
        desc: 'Otrzymujesz kompletną dokumentację API, schemat bazy danych i instrukcję wdrożenia (README). To Twoja polisa bezpieczeństwa.',
      },
      {
        title: 'Repozytorium na własność',
        desc: 'Masz dostęp do GitHuba/Bitbucketa od pierwszego dnia. Widzisz postępy prac na żywo, a po zakończeniu projektu przekazujemy pełne prawa autorskie.',
      },
    ],
  },
  qa: {
    title: 'Jakość wpisana w proces',
    subtitle: 'Quality Assurance',
    description:
      'Nie testujemy na produkcji. Stosujemy rygorystyczny proces CI/CD (Continuous Integration / Continuous Deployment), aby każda zmiana była bezpieczna.',
    steps: [
      {
        step: 'Code Review',
        desc: 'Każda linijka kodu jest sprawdzana przez seniora.',
      },
      {
        step: 'Automated Tests',
        desc: 'Testy jednostkowe i E2E wyłapują błędy przed wdrożeniem.',
      },
      {
        step: 'Staging Env',
        desc: 'Testujesz zmiany na środowisku testowym (kopia produkcji).',
      },
      {
        step: 'Production',
        desc: 'Bezpieczne wdrożenie bez przestojów (Zero Downtime).',
      },
    ],
  },
  cta: {
    title: 'Masz pomysł na aplikację?',
    description:
      'Nie zaczynaj od kodowania. Zacznij od warsztatu Product Discovery. Zweryfikujemy Twój pomysł, dobierzemy technologię i stworzymy makietę MVP.',
    button: 'Umów Warsztat Discovery',
  },
};

export const PREMIUM_WEBSITES_CONTENT = {
  seo: {
    title: 'Strony Internetowe Premium | Tworzenie Stron WWW',
    description:
      'Budujemy strony internetowe, które sprzedają. Od Landing Page po zaawansowane systemy korporacyjne. Poznaj nasz standard jakości.',
    image: '/assets/images/frontend.png',
  },
  hero: {
    badge: 'Web Development',
    title: {
      line1: 'Twoja strona',
      line2: 'musi sprzedawać.',
    },
    description:
      'Większość agencji "robi strony". My wdrażamy narzędzia biznesowe. Od prostych Landing Page\'y po zaawansowane systemy E-commerce i CRM.',
    ctaPrimary: 'Darmowa Wycena',
    ctaSecondary: 'Wybierz Rozwiązanie',
  },
  subCategories: {
    title: 'Czego potrzebuje Twój biznes?',
    description:
      'Dobieramy technologię do celu. Nie sprzedajemy armaty na wróbla, ani procy na czołg.',
    items: [
      {
        title: 'Landing Page',
        desc: 'Jedna strona, jeden cel: Sprzedaż. Idealna pod kampanie reklamowe, premiery produktów lub zbieranie leadów.',
        tags: ['Konwersja', 'A/B Testy', 'Szybkość'],
      },
      {
        title: 'Strona Firmowa',
        desc: 'Profesjonalna wizytówka Twojej firmy w sieci. Buduje wizerunek, przedstawia ofertę i ułatwia kontakt.',
        tags: ['CMS', 'Blog', 'Wielojęzyczność'],
        popular: true,
      },
      {
        title: 'Sklep (E-commerce)',
        desc: 'Twój wirtualny sprzedawca dostępny 24/7. Bezpieczne płatności, integracje z kurierami i magazynem.',
        tags: ['WooCommerce', 'Płatności', 'Automatyzacja'],
      },
      {
        title: 'Web App / CRM',
        desc: 'Dedykowane systemy do zarządzania firmą, portale B2B i aplikacje SaaS pisane na zamówienie.',
        tags: ['React/Laravel', 'API', 'Skalowalność'],
      },
    ],
  },
  performance: {
    title: 'Google kocha szybkie strony',
    description:
      'Nie pozwól, by wolna strona marnowała Twój budżet reklamowy. Nasze realizacje osiągają topowe wyniki w Google PageSpeed Insights.',
    metrics: ['Performance', 'Accessibility', 'Best Practices', 'SEO'],
  },
  cms: {
    badge: 'Łatwa Edycja',
    title: {
      line1: 'Nie potrzebujesz informatyka,',
      line2: 'by zmienić tekst.',
    },
    description:
      'Boisz się, że każda zmiana na stronie będzie kosztować? Bez obaw. Wdrażamy intuicyjne panele CMS (WordPress/Sanity), dzięki którym edycja strony jest tak prosta, jak pisanie maila.',
    features: [
      {
        title: 'Drag & Drop',
        desc: 'Przeciągnij i upuść elementy, by zmienić układ.',
      },
      {
        title: 'Podgląd na żywo',
        desc: 'Widzisz zmiany natychmiast na telefonie i komputerze.',
      },
    ],
    labels: {
      editor: 'Edytor',
      preview: 'Podgląd',
      labelH1: 'Nagłówek H1',
      labelDesc: 'Opis',
      placeholderDesc: 'Wpisz opis swojej usługi...',
      save: 'Zapisz Zmiany',
    },
  },
  comparison: {
    title: 'Dlaczego warto zainwestować?',
    description:
      'Tania strona to pozorny zysk. Ĺąle wykonana witryna odstrasza klientów i jest niewidoczna w Google.',
    cheap: {
      title: 'Szablon z Internetu',
      items: [
        'Wolne ładowanie (spadek konwersji)',
        'Brak unikalności (taka sama jak u konkurencji)',
        'Podatność na wirusy i ataki',
        'Trudna w rozbudowie w przyszłości',
        'Słaba widoczność w Google (zły kod)',
      ],
    },
    premium: {
      title: 'Standard Mixture',
      items: [
        'Błyskawiczne ładowanie (Core Web Vitals)',
        'Unikalny Design budujący autorytet',
        'Pakiet Bezpieczeństwa w cenie',
        'Skalowalna architektura',
        'Przygotowana pod SEO od pierwszej linii kodu',
      ],
    },
  },
  cta: {
    title: {
      line1: 'Twój biznes zasługuje na',
      line2: 'cyfrową jakość premium.',
    },
    description:
      'Umów się na bezpłatną konsultację. Przeanalizujemy Twoją obecną stronę lub pomysł i przygotujemy plan wdrożenia.',
    buttonPrimary: 'Zamów Darmową Konsultację',
    buttonSecondary: 'Wróć do Oferty',
  },
};
