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
      'Dla firm, które nie mogą pozwolić sobie na przestoje. Budujemy serwisy odporne na duże obciążenia, zgodne z wymogymi prawnymi (WCAG/RODO) i gotowe na globalną ekspansję.',
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
