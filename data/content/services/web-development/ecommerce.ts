/**
 * Treść strony /web-development/ecommerce/ — przepisana 2026-07-16 po krytyce
 * dual-agent (20/40) i decyzjach właściciela:
 * - kotwica cenowa: od 6 000 zł (zgodna z najniższym pakietem cennika w CMS),
 * - stack sklepowy = drabinka huba: WooCommerce / PrestaShop / Medusa.js / Sylius
 *   (Shoper ODRZUCONY przez właściciela — wolno go wymieniać wyłącznie jako
 *   alternatywę SaaS w sekcji własności i w ścieżce migracji),
 * - nowa ścieżka „masz już sklep": audyt / migracja z SaaS / przejęcie utrzymania.
 * Zero metryk z ręki, zero atrap, angielskie nazwy tylko tam, gdzie są nazwami
 * produktów (BLIK, BaseLinker, InPost...).
 */

export const ECOMMERCE_CONTENT = {
  seo: {
    title: 'Sklepy internetowe — WooCommerce, PrestaShop | Mixture Marketing',
    description:
      'Budujemy sklepy na otwartym oprogramowaniu: WooCommerce, PrestaShop, a przy nietypowej sprzedaży Medusa.js albo Sylius. Płatności (BLIK, Przelewy24), kurierzy (InPost, DPD), Allegro przez BaseLinker. Kod i dane należą do Ciebie.',
    image: '/assets/images/realizacje/driftmark-sklep-home.webp',
  },
  hero: {
    title: {
      line1: 'Sklep, który',
      line2: 'jest Twój.',
    },
    description:
      'Budujemy sklepy na otwartym oprogramowaniu — WooCommerce, PrestaShop, a przy nietypowej sprzedaży Medusa.js albo Sylius. Bez abonamentu za samo istnienie, bez prowizji od Twojej sprzedaży, z kodem i danymi, które należą do Ciebie.',
  },
  /** Dowód: ŻYWY sklep klienta (zrzuty z produkcji, 2026-07-15), nie makiety. */
  proof: {
    title: 'Tak wygląda sklep, który zbudowaliśmy.',
    description:
      'Driftmark Marine sprzedaje łodzie motorowe w całej Europie. Katalog modeli ze specyfikacjami, karty produktów z wyposażeniem i ceną, wycena na zapytanie — wszystko na WordPressie, w dwóch językach.',
    images: [
      {
        src: '/assets/images/realizacje/driftmark-sklep-home.webp',
        width: 1440,
        height: 900,
        alt: 'Strona główna sklepu Driftmark Marine: ciemne hero z łodzią w ruchu, nawigacja z katalogiem modeli i przyciskiem wyceny',
        caption: 'Strona główna — wejście do katalogu i szybka ścieżka „Request a quote”.',
      },
      {
        src: '/assets/images/realizacje/driftmark-karta-produktu.webp',
        width: 1440,
        height: 860,
        alt: 'Karta produktu łodzi Driftmark 250 AL: zdjęcie, lista wyposażenia z ikonami, cena 39 700 euro i przycisk wyceny',
        caption: 'Karta produktu — wyposażenie, realna cena i wycena jednym kliknięciem.',
      },
    ],
    linkLabel: 'Zobacz case study: Driftmark Marine',
    linkTo: '/portfolio/driftmark-marine-e-commerce-z-konfiguratorem-lodzi-i-rebranding',
  },
  /**
   * Centralny argument strony — „dwa sklepy po roku": ten sam sklep wynajęty
   * (SaaS) i własny (open source). Rysunek lustrzany wokół wspólnej osi etykiet;
   * wiersze przeniesione z poprzedniej sekcji „Własność czy Wynajem?".
   */
  ownership: {
    title: 'Dwa sklepy. Ten sam towar, inna umowa.',
    description:
      'Platformy abonamentowe (Shopify, Shoper, Wix) wynajmują Ci sklep. Otwarte oprogramowanie oddaje Ci go na własność. Po roku sprzedaży różnica wygląda tak:',
    saasLabel: 'Wynajem (platforma SaaS)',
    ownLabel: 'Własność (nasz standard)',
    rows: [
      { label: 'Twoje dane klientów', saas: 'Na serwerze platformy', own: '100% Twoje' },
      { label: 'Prowizja od sprzedaży', saas: 'Często 1–2% od zamówienia', own: '0%' },
      {
        label: 'Opłaty miesięczne',
        saas: 'Abonament — rośnie z planem',
        own: 'Hosting, ok. 100 zł',
      },
      { label: 'Dostęp do kodu', saas: 'Zablokowany', own: 'Pełny, od pierwszego dnia' },
    ],
    saasRisk: 'Przestajesz płacić — tracisz sklep i historię klientów.',
    ownSafety: 'Możesz przenieść sklep na inny serwer albo do innej firmy w dowolnym momencie.',
  },
  /**
   * Integracje jako tabliczka (spec-sheet), nie orbita: nazwy wyłącznie z FAQ
   * i potwierdzonego zakresu. Zdanie o synchronizacji = treść z FAQ (BaseLinker).
   */
  integrations: {
    title: 'Sklep, który zna się z resztą Polski.',
    description:
      'Zamówienie płaci się BLIK-iem, etykieta kuriera drukuje się sama, stany magazynowe i Allegro synchronizują się przez BaseLinker w obie strony. Ty pakujesz paczki — resztę robi sklep.',
    groups: [
      { label: 'Płatności', items: ['BLIK', 'Przelewy24', 'PayU', 'Stripe', 'Tpay', 'PayPal'] },
      { label: 'Dostawy', items: ['InPost Paczkomaty', 'DHL', 'DPD', 'Furgonetka'] },
      { label: 'Sprzedaż', items: ['Allegro', 'Amazon', 'eBay', 'BaseLinker'] },
      { label: 'Zaplecze', items: ['Faktury i księgowość', 'ERP', 'Hurtownie (XML)'] },
    ],
    /** W środku sklepu — mechanizmy sprzedaży (dawne „boosters", bez kart-atrap). */
    insideLabel: 'A w środku sklepu:',
    inside: [
      'wyszukiwarka, która toleruje literówki i podpowiada w trakcie pisania',
      'podpowiedzi „klienci kupili również” i zestawy produktów',
      'zakupy bez zakładania konta, z adresem uzupełnianym z InPost',
    ],
  },
  /** Utrzymanie + własność kodu — pieczęć w brzmieniu zatwierdzonym na hubie. */
  maintenance: {
    title: 'Co płacisz po starcie',
    lines: [
      'Hosting to ok. 100 zł miesięcznie — płacisz za serwer, nie nam abonament.',
      'Aktualizacje, kopie zapasowe i opiekę techniczną możesz zamówić u nas albo u kogokolwiek innego — kod jest Twój, więc nic Cię z nami nie wiąże.',
    ],
    seal: 'Repozytorium kodu od pierwszego dnia i pełne prawa autorskie po odbiorze — przy każdym projekcie, niezależnie od technologii.',
  },
  /** Nowa ścieżka (decyzja właściciela 2026-07-15): klient z ISTNIEJĄCYM sklepem. */
  existing: {
    title: 'Masz już sklep?',
    description:
      'Większość naszych rozmów nie zaczyna się od „chcę nowy sklep”, tylko od „mam sklep i coś jest nie tak”. Trzy sytuacje, z którymi możesz przyjść:',
    paths: [
      {
        title: 'Sklep jest wolny albo nie sprzedaje',
        desc: 'Audyt istniejącego sklepu: wydajność, ścieżka zakupowa, SEO. Dostajesz listę problemów z wyceną naprawy — i decydujesz, co dalej.',
        cta: 'audit',
      },
      {
        title: 'Płacisz abonament i prowizje platformie',
        desc: 'Migracja z Shopify, Shopera czy Wix na WooCommerce lub PrestaShop — z produktami, klientami i historią zamówień. Sklep staje się Twój.',
        cta: 'consult',
      },
      {
        title: 'Poprzedni wykonawca zniknął',
        desc: 'Przejmujemy utrzymanie sklepu, którego nikt nie dogląda: aktualizacje, kopie, bezpieczeństwo. Bez przepisywania wszystkiego od zera.',
        cta: 'consult',
      },
    ],
  },
  cta: {
    title: 'Porozmawiajmy o Twoim sklepie.',
    description:
      'Nowy sklep albo naprawa istniejącego — zaczynamy od rozmowy i wyceny widełkowej w 24 h. Bez zobowiązań i bez wciskania technologii, której nie potrzebujesz.',
    button: 'Umów darmową konsultację',
  },
  faqs: [
    {
      q: 'Czy integrujecie sklepy z BaseLinkerem?',
      a: 'Tak, BaseLinker to standard w naszych wdrożeniach. Konfigurujemy dwukierunkową synchronizację stanów magazynowych, cen oraz automatyczne pobieranie zamówień ze sklepu i marketplace-ów (Allegro, Amazon, eBay).',
    },
    {
      q: 'Dlaczego WooCommerce albo PrestaShop, a nie platforma typu Shopify?',
      a: 'Otwarte oprogramowanie daje Ci 100% własności nad kodem i danymi klientów, bez miesięcznych prowizji od sprzedaży. Jest też elastyczniejsze przy nietypowych funkcjach i tańsze w utrzymaniu przy większej skali. Platformy SaaS bywają dobre na start — ale to wynajem, nie własność.',
    },
    {
      q: 'Mam sklep na Shopify / Shoperze. Da się go przenieść?',
      a: 'Tak. Przenosimy produkty, klientów i historię zamówień na WooCommerce lub PrestaShop, a przekierowania dbają o to, żeby nie stracić pozycji w Google. Migrację planujemy tak, żeby sklep sprzedawał bez przerwy.',
    },
    {
      q: 'Jakie metody płatności i dostawy obsługuje sklep?',
      a: 'Wdrażamy wszystkie popularne bramki: PayU, Przelewy24 (w tym BLIK), Stripe, Tpay oraz PayPal. W zakresie dostaw integrujemy InPost (Paczkomaty), kurierów (DHL, DPD) oraz systemy takie jak Furgonetka.',
    },
    {
      q: 'Czy sklep będzie gotowy pod SEO?',
      a: 'Zdecydowanie tak. Każdy sklep posiada wdrożone dane strukturalne (Schema.org), zoptymalizowane pod kątem szybkości formaty obrazów (WebP/AVIF) oraz przyjazną architekturę URL, co ułatwia Google indeksowanie produktów.',
    },
  ],
};
