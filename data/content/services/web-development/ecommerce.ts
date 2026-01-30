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
      'Koniec z ręcznym przepisywaniem zamówień. Tworzymy centralny system (Hub), który lączy Twój sklep ze światem.',
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
  faqs: [
    {
      q: 'Czy integrujecie sklepy z Baselinkerem?',
      a: 'Tak, Baselinker to standard w naszych wdrożeniach. Konfigurujemy dwukierunkową synchronizację stanów magazynowych, cen oraz automatyczne pobieranie zamówień ze sklepu i marketplace-ów (Allegro, Amazon, eBay).',
    },
    {
      q: 'Dlaczego WooCommerce, a nie SaaS (np. Shopify)?',
      a: 'WooCommerce daje Ci 100% własności nad kodem i danymi klientów bez miesięcznych prowizji od sprzedaży. Jest też znacznie bardziej elastyczny przy wdrażaniu nietypowych funkcji (np. konfiguratorów produktowych) i tańszy w utrzymaniu przy dużej skali.',
    },
    {
      q: 'Jakie metody płatności i dostawy obsługuje sklep?',
      a: 'Wdrażamy wszystkie popularne bramki: PayU, Przelewy24, Stripe, Tpay oraz PayPal. W zakresie dostaw integrujemy InPost (Paczkomaty), kurierów (DHL, DPD) oraz systemy takie jak Furgonetka.',
    },
    {
      q: 'Czy sklep będzie gotowy pod SEO?',
      a: 'Zdecydowanie tak. Każdy sklep posiada wdrożone dane strukturalne (Schema.org), zoptymalizowane pod kątem szybkości formaty obrazów (WebP/AVIF) oraz przyjazną architekturę URL, co ułatwia Google indeksowanie produktów.',
    },
  ],
};
