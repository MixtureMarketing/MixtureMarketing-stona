/**
 * Treść /web-development/corporate/ — przepisana 2026-07-16 (krytyka 10/40,
 * najniższa w web-dev). Usunięte (decyzje właściciela + zakaz atrap):
 * „SLA 99.9%" i „Cloudflare Enterprise" (obietnice kontraktowe bez pokrycia),
 * „strona nie do zhakowania" (absolutne twierdzenie bezpieczeństwa),
 * audiodeskrypcja (nieoferowana), moduł „Relacje Inwestorskie ESPI/EBI"
 * (brak realizacji), statusy Verified/Compliant/Active/Monitored oraz
 * Completed/Processing/Pending (preparowana telemetria), badge/microCopy.
 * Zostaje: „migracja w 4 tygodnie" (potwierdzone). Cena wg CMS: od 4 500 zł
 * (hero twierdził 7 500 wbrew tabeli cen na tej samej stronie).
 * Literówka „wymogymi" poprawiona.
 */
export const CORPORATE_WEBSITE_CONTENT = {
  seo: {
    title: 'Strony Internetowe dla Firm | Wizerunek i Skala B2B',
    description:
      'Tworzymy profesjonalne serwisy korporacyjne budujące autorytet marki. Bezpieczne, szybkie i zoptymalizowane pod kątem generowania leadów biznesowych.',
    image: '/assets/images/frontend.png',
  },
  hero: {
    title: {
      line1: 'Korporacyjne serwisy WWW.',
      line2: 'Skala, bezpieczeństwo, prestiż.',
    },
    description:
      'Dla firm, które nie mogą pozwolić sobie na przestoje. Budujemy serwisy odporne na duże obciążenia, zgodne z wymogami prawnymi (WCAG/RODO) i gotowe na globalną ekspansję.',
    cta: 'Konsultacja techniczna',
  },
  modules: {
    title: 'Moduły dla biznesu',
    description:
      'Strona korporacyjna to ekosystem. Integrujemy narzędzia, które usprawniają procesy wewnątrz i na zewnątrz organizacji.',
    items: [
      {
        title: 'Kariera i HR',
        desc: 'System rekrutacyjny zintegrowany z ATS. Filtrowanie ofert, formularze aplikacyjne i budowanie marki pracodawcy.',
        tech: 'Integracja ATS',
      },
      {
        title: 'Strefa klienta (B2B)',
        desc: 'Dedykowany panel logowania dla partnerów. Dostęp do faktur, cenników hurtowych i dokumentacji technicznej.',
        tech: 'Logowanie i role',
      },
      {
        title: 'Newsroom i blog',
        desc: 'Centrum prasowe dla mediów. Kategoryzacja treści, materiały do pobrania i automatyzacja newslettera.',
        tech: 'Materiały prasowe',
      },
    ],
  },
  cms: {
    title: 'Zarządzanie treścią bez kompromisów',
    description:
      'Elastyczność dla marketingu, bezpieczeństwo dla IT. Wybierz silnik dopasowany do Twojej organizacji.',
    wordpress: {
      label: 'WordPress (marketing)',
      title: 'Swoboda i niezależność.',
      desc: "Najpopularniejszy CMS na świecie, dostosowany do potrzeb korporacyjnych. Intuicyjny edytor wizualny (Gutenberg/ACF) pozwala działowi marketingu tworzyć nowe landing page'e bez pomocy programistów.",
      features: [
        'Intuicyjna edycja (drag & drop)',
        'Tysiące gotowych integracji',
        'Niski koszt wdrożenia i utrzymania',
        'Krótki czas szkolenia zespołu',
      ],
    },
    headless: {
      label: 'Headless CMS (IT)',
      title: 'Wydajność i bezpieczeństwo.',
      desc: 'Oddzielamy warstwę prezentacji (frontend) od zapisu treści (backend). Statyczny frontend drastycznie zmniejsza powierzchnię ataku i ładuje się w ułamku sekundy, a treściami zarządzasz z nowoczesnego panelu (Sanity/Strapi).',
      features: [
        'Brak bazy danych wystawionej na świat',
        'Globalna dystrybucja treści (CDN)',
        'Te same treści na WWW i w aplikacji',
        'Nowoczesny stack (React/Next.js)',
      ],
    },
  },
  compliance: {
    title: {
      line1: 'Bezpieczeństwo',
      line2: 'to nie opcja. To wymóg.',
    },
    description:
      'Dla korporacji i instytucji zgodność z prawem jest krytyczna. Wdrażamy standardy, które chronią Twoją firmę przed karami i utratą reputacji.',
    items: [
      {
        title: 'WCAG 2.1 AA',
        desc: 'Dostępność cyfrowa dla osób z niepełnosprawnościami: kontrast, nawigacja klawiaturą, semantyka dla czytników ekranu.',
      },
      {
        title: 'RODO / Omnibus',
        desc: 'Zarządzanie zgodami (Consent Mode v2), rejestry czynności przetwarzania, polityki prywatności.',
      },
      {
        title: 'WAF i ochrona ruchu',
        desc: 'Hosting za Cloudflare: firewall aplikacyjny filtruje boty i typowe ataki, zanim dotrą do serwisu.',
      },
      {
        title: 'Kopie zapasowe',
        desc: 'Regularne kopie treści i kodu z procedurą odtworzenia — awaria nie oznacza utraty serwisu.',
      },
    ],
  },
  migration: {
    title: 'Migracja bez utraty ruchu',
    subtitle: 'Przekierowania 301',
    description:
      'Boisz się, że nowa strona zniszczy Twoje pozycje w Google? Mamy procedurę bezpiecznej migracji, która działa jak precyzyjna operacja chirurgiczna.',
    steps: [
      {
        id: '01',
        title: 'Skan i audyt',
        desc: 'Skanujemy starą strukturę URL i tworzymy mapę wszystkich linków.',
      },
      {
        id: '02',
        title: 'Mapowanie 301',
        desc: 'Tworzymy tabelę przekierowań: stary adres → nowy odpowiednik.',
      },
      {
        id: '03',
        title: 'Implementacja',
        desc: 'Wgrywamy reguły przekierowań do konfiguracji serwera lub hostingu.',
      },
      {
        id: '04',
        title: 'Weryfikacja GSC',
        desc: 'Monitorujemy ruch po starcie, eliminując błędy 404.',
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
