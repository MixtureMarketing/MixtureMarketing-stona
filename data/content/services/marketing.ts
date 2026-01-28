import { SITE_CONFIG } from '../../../config/site';

export const MARKETING_CONTENT = {
  seo: {
    title: 'Performance Marketing | Agencja SEM, Social Ads i SEO',
    description:
      'Zwiększ sprzedaż z kampaniami performance marketing. Specjalizujemy się w Google Ads (SEM), Meta Ads (Facebook, Instagram) i SEO. Czysta matematyka wzrostu.',
    image: '/assets/images/google-ads.png',
  },
  hero: {
    badge: 'Performance Marketing Agency',
    title: 'Performance Marketing.',
    titleAccent: 'Czysta matematyka wzrostu.',
    description:
      'Koniec z "zasięgami", które nie sprzedają. Wdrażamy ekosystem reklamowy oparty na twardych danych. Łączymy Google Ads, Meta Ads i SEO w jedną maszynę do generowania przychodu.',
    cta: 'Darmowa Analiza Strategii',
    revenueLabel: 'Przychód Generowany (YTD)',
  },
  painPoints: {
    title: 'Dlaczego Twoje reklamy nie działają?',
    description:
      'Większość kont reklamowych ma te same błędy. Sprawdź, czy nie popełniasz któregoś z nich.',
    items: [
      {
        title: 'Brak Wykluczeń',
        desc: "Płacisz za kliknięcia osób, które szukają 'darmowych' rozwiązań lub 'pracy'. To marnowanie 30-40% budżetu.",
      },
      {
        title: 'Błędna Analityka',
        desc: 'Jeśli nie mierzysz konwersji (zakupów/telefonów), systemy reklamowe nie wiedzą, komu wyświetlać reklamy. Działasz po omacku.',
      },
      {
        title: 'Słaba Oferta (Landing)',
        desc: 'Możesz mieć najlepsze reklamy, ale jeśli strona docelowa jest wolna lub nieczytelna, klient ucieknie. Marketing to system naczyń połączonych.',
      },
    ],
  },
  strategy: {
    title: 'Wybierz swój',
    titleAccent: 'Model Wzrostu',
    description:
      'Dopasowujemy taktykę do Twoich celów finansowych. Zależy Ci na szybkim zwrocie (Cashflow) czy budowie pozycji lidera (Brand)?',
    quick: {
      title: 'Sprint (Cashflow)',
      subtitle: 'Szybka sprzedaż',
      paramsTitle: 'Parametry: Agresywne',
      timeLabel: 'Czas do wyniku',
      timeVal: '48 Godzin',
      durabilityLabel: 'Trwałość efektu',
      durabilityVal: 'Budżetowa',
    },
    stable: {
      title: 'Maraton (Brand)',
      subtitle: 'Stabilny wzrost',
      paramsTitle: 'Parametry: Zrównoważone',
      timeLabel: 'Czas do wyniku',
      timeVal: '3-6 Miesięcy',
      durabilityLabel: 'Trwałość efektu',
      durabilityVal: 'Długofalowa',
    },
    quickTools: [
      {
        name: 'Google Ads (Search)',
        desc: 'Gotowy popyt.',
      },
      {
        name: 'Meta Ads (Remarketing)',
        desc: 'Domykanie sprzedaży.',
      },
      {
        name: 'Landing Page',
        desc: 'Maksymalna konwersja.',
      },
    ],
    stableTools: [
      {
        name: 'SEO (Organic)',
        desc: 'Darmowy ruch.',
      },
      {
        name: 'Content Marketing',
        desc: 'Edukacja i zaufanie.',
      },
      {
        name: 'Marketing Automation',
        desc: 'Powracalność (LTV).',
      },
    ],
  },
  synergy: {
    title: 'Efekt Synergii (Omnichannel)',
    description:
      'Pojedynczy kanał to za mało. Tworzymy ekosystem, w którym kanały wzajemnie się napędzają, obniżając łączny koszt pozyskania klienta (CAC).',
    items: [
      {
        title: 'Google + Meta',
        desc: 'Google ściąga precyzyjny ruch (szukających), a Meta "domyka" sprzedaż remarketingiem, gdy klient się waha.',
      },
      {
        title: 'SEO + Google Ads',
        desc: 'Dzielimy frazy. Drogie i pilne kupujemy w Ads. Edukacyjne i długoterminowe pozycjonujemy w SEO. Optymalizacja budżetu.',
      },
    ],
  },
  industries: {
    title: 'Specjalizacje Branżowe',
    description:
      'Rozumiemy specyfikę Twojego rynku. Inaczej sprzedaje się buty, a inaczej oprogramowanie dla firm.',
    items: [
      {
        title: 'E-commerce',
        desc: 'Sklepy internetowe. Skupienie na ROAS, feedach produktowych (GMC) i porzuconych koszykach.',
        tags: ['Google Shopping', 'DPA'],
      },
      {
        title: 'Usługi B2B',
        desc: 'Firmy usługowe i technologiczne. Generowanie kalorycznych leadów, LinkedIn Ads i Cold Mailing.',
        tags: ['Lead Gen', 'LinkedIn'],
      },
      {
        title: 'SaaS & Startups',
        desc: 'Aplikacje i subskrypcje. Skalowanie użytkowników, analiza Cohort i redukcja Churnu.',
        tags: ['Growth Hacking', 'PPC'],
      },
    ],
  },
  arsenal: {
    title: 'Arsenał Wzrostu',
    subtitle: 'Technologie',
    description:
      "Nie używamy 'wszystkiego'. Dobieramy precyzyjne narzędzia do konkretnych celów biznesowych. Zbuduj swój stack marketingowy.",
    items: [
      {
        id: 'google',
        title: 'Google Ads (SEM)',
        role: 'Popyt Aktywny',
        desc: 'Przechwytujemy klientów, którzy już szukają Twoich produktów. Płacisz tylko za kliknięcie (PPC).',
        color: '#4285F4',
        features: ['Search & Shopping', 'YouTube Ads', 'Remarketing'],
        kpi: 'Wysoki ROAS',
        path: '/marketing/google-ads/',
      },
      {
        id: 'meta',
        title: 'Meta Ads (Social)',
        role: 'Popyt Utajony',
        desc: 'Docieramy do precyzyjnych grup docelowych na Facebooku i Instagramie. Skalujemy sprzedaż poprzez kreację.',
        color: '#E1306C',
        features: ['Skalowanie E-commerce', 'Generowanie Leadów B2B', 'Instagram Reels'],
        kpi: 'Niski CPA',
        path: '/marketing/meta-ads/',
      },
      {
        id: 'seo',
        title: 'SEO & Content',
        role: 'Ruch Organiczny',
        desc: 'Budujemy autorytet domeny i widoczność na lata. Inwestycja w darmowy ruch, który uniezależnia Cię od stawek reklamowych.',
        color: '#00C853',
        features: ['Audyt Techniczny', 'Content Marketing', 'Link Building'],
        kpi: 'TOP 3 w Google',
        path: '/marketing/seo/',
      },
      {
        id: 'analytics',
        title: 'Data & Analityka',
        role: 'Business Intelligence',
        desc: 'Mierzymy każdą złotówkę. Wdrażamy zaawansowane śledzenie (Server-Side), abyś wiedział, co przynosi zysk.',
        color: '#F4B400',
        features: ['GA4 & GTM', 'Consent Mode v2', 'Looker Studio'],
        kpi: 'Poprawność Danych',
        path: '/marketing/analytics/',
      },
    ],
  },
  faqs: [
    {
      q: 'Jak szybko zobaczę efekty kampanii?',
      a: 'W przypadku Google Ads i Meta Ads pierwsze efekty (ruch, leady) są widoczne w ciągu 48h od uruchomienia. Pełna optymalizacja i stabilizacja kosztów zajmuje zazwyczaj 1-3 miesiące. SEO to proces długofalowy (3-6 miesięcy).',
    },
    {
      q: 'Jaki budżet reklamowy jest potrzebny na start?',
      a: 'Rekomendujemy start z budżetem mediowym min. 2000-3000 PLN miesięcznie, aby algorytmy reklamowe miały wystarczającą ilość danych do nauki. Poniżej tej kwoty optymalizacja jest utrudniona.',
    },
    {
      q: 'Czy obsługujecie sklepy internetowe (E-commerce)?',
      a: 'Tak, to nasza specjalizacja. Integrujemy katalogi produktów (GMC, Facebook Catalog), wdrażamy śledzenie e-commerce i optymalizujemy kampanie pod zwrot z nakładów (ROAS).',
    },
    {
      q: 'Jak wygląda raportowanie?',
      a: 'Nie wysyłamy suchych tabelek. Otrzymujesz dostęp do interaktywnego dashboardu (Looker Studio) 24/7, a raz w miesiącu spotykamy się na omówienie wyników i planów na kolejny okres.',
    },
  ],
  cta: {
    title: 'Nadal błądzisz?',
    description:
      'Nie musisz być ekspertem od wszystkiego. Umów się na 15-minutową konsultację strategiczną. Powiemy Ci wprost: co zadziała, a co będzie stratą pieniędzy w Twoim przypadku.',
    button: 'Umów darmową konsultację',
  },
};

export const ANALYTICS_CONTENT = {
  seo: {
    title: 'Analityka Webowa i Wdrożenia GA4 | Server-Side Tracking',
    description:
      'Mierz i optymalizuj swoje działania. Oferujemy wdrożenia Google Analytics 4 (GA4), Google Tag Manager (GTM) i śledzenie po stronie serwera (Server-Side).',
    image: '/assets/images/server-side-tracking.png',
  },
  hero: {
    badge: 'Data Intelligence',
    title: {
      line1: 'Przestań zgadywać.',
      line2: 'Zacznij zarabiać na danych.',
    },
    description:
      'Większość firm posiada dane, ale tylko nieliczne potrafią je czytać. Wdrażamy architekturę analityczną, która odpowiada na jedno kluczowe pytanie: <strong>"Gdzie uciekają Twoje pieniądze?"</strong>',
    cta: 'Zamów Audyt Danych',
    trustBadge: 'Gwarancja poprawności',
  },
  dashboard: {
    revenueLabel: 'Przychód (Real-time)',
    stats: [
      { label: 'Użytkownicy', val: '14.2k' },
      { label: 'Konwersja', val: '3.8%' },
      { label: 'Bounce Rate', val: '42%' },
    ],
  },
  painPoints: {
    title: 'Czy ufasz swoim danym?',
    description:
      'Błędna konfiguracja analityki to błędne decyzje biznesowe. Oto najczęstsze sygnały ostrzegawcze, że Twoje dane mogą kłamać.',
    items: [
      {
        title: 'Ryzyko Prawne (RODO)',
        desc: 'Brak Consent Mode v2 to ryzyko kar i blokady konta Google Ads. Twoja strona musi szanować wybór użytkownika, nie tracąc danych.',
      },
      {
        title: 'Utrata Danych (iOS/AdBlock)',
        desc: 'Nawet 40% konwersji jest niewidocznych przez blokady w przeglądarkach. Jeśli nie mierzysz Server-Side, działasz po omacku.',
      },
      {
        title: 'Błędna Atrybucja',
        desc: "Wszystkie zamówienia wpadają do 'Direct'? Nie wiesz, czy sprzedał Facebook czy Google? Przepalasz budżet na nieskuteczne reklamy.",
      },
    ],
  },
  compliance: {
    badge: 'Critical Update 2024',
    title: {
      line1: 'Twoja strona może',
      line2: 'łamać prawo.',
    },
    description:
      'Od marca 2024 Google wymaga <strong>Consent Mode v2</strong>. Brak tego wdrożenia oznacza nie tylko ryzyko kar za RODO, ale przede wszystkim blokadę list remarketingowych w Google Ads.',
    features: [
      {
        title: 'Audyt Prawny (RODO/Omnibus)',
        desc: 'Weryfikujemy politykę prywatności, klauzule w formularzach i banery cookies.',
      },
      {
        title: 'Konfiguracja Consent Mode v2',
        desc: 'Zaawansowane wdrożenie w GTM. Google "domodeluje" dane od użytkowników, którzy nie wyrazili zgody na cookies.',
      },
    ],
    status: {
      safe: 'Twoja strona jest bezpieczna.',
      desc: 'Wdrożono wszystkie protokoły.',
    },
  },
  slider: {
    title: 'Zmień Piekło Excela w Raj Danych',
    description:
      'Przesuń suwak i zobacz różnicę. Zamiast setek wierszy, których nikt nie czyta – interaktywny dashboard, który mówi, co robić.',
    labels: {
      before: 'PRZED (Chaos)',
      after: 'PO (Wnioski)',
    },
  },
  solutions: {
    title: 'Fundament Techniczny',
    description:
      'Budujemy architekturę danych, która jest zgodna z prawem, odporna na braki ciasteczek i czytelna dla biznesu.',
    items: [
      {
        title: 'Google Analytics 4 (GA4)',
        subtitle: 'Ĺąródło Prawdy',
        desc: "Kompletna konfiguracja zdarzeń e-commerce. Mierzymy nie tylko 'zakup', ale też 'dodanie do koszyka' i 'rozpoczęcie płatności', aby znaleźć wąskie gardła.",
      },
      {
        title: 'Server-Side Tracking',
        subtitle: 'Omiń AdBlocki',
        desc: 'Wdrażamy CAPI (Facebook) i GA4 Server-Side. Przesyłamy dane bezpiecznym kanałem serwer-serwer, odzyskując do 30% utraconych konwersji.',
      },
      {
        title: 'Looker Studio',
        subtitle: 'Wizualizacja',
        desc: 'Interaktywne dashboardy, które rozumie prezes i dział marketingu. Wszystkie kluczowe wskaźniki (KPI) w jednym miejscu, dostępne 24/7.',
      },
      {
        title: 'Google Tag Manager',
        subtitle: 'Zarządzanie Kodem',
        desc: 'Porządek w skryptach. Wdrażamy zmiany marketingowe bez angażowania programistów, co przyspiesza pracę i odciąża dział IT.',
      },
      {
        title: 'Consent Mode v2',
        subtitle: 'Legalność & AI',
        desc: "Wdrażamy tryb zgody Google. Dzięki temu jesteś zgodny z RODO, a algorytmy Google 'domodelują' dane użytkowników, którzy nie wyrazili zgody.",
      },
      {
        title: 'Data Warehouse',
        subtitle: 'BigQuery / SQL',
        desc: 'Dla E-commerce i B2B. Łączymy dane ze sklepu, CRM i systemów kasowych w jednej bazie danych, aby liczyć realne LTV i zysk netto.',
      },
    ],
  },
  warehouse: {
    badge: 'Data Warehouse',
    title: {
      line1: 'Integracja Offline & Online',
      line2: '(BigQuery).',
    },
    description:
      'Dla klientów B2B i dużego E-commerce. Łączymy dane ze sklepu internetowego, kas fiskalnych (POS) i systemu CRM w jednym miejscu.',
    features: [
      {
        title: 'Single Source of Truth',
        desc: 'Jeden centralny magazyn danych (Data Warehouse). Koniec z rozbieżnościami między raportami marketingu a księgowością.',
      },
      {
        title: 'Analiza LTV i Cohort',
        desc: 'Śledzimy realną wartość klienta w czasie, łącząc jego wizyty na stronie z zakupami offline.',
      },
      {
        title: 'AI Prediction',
        desc: 'Wykorzystujemy dane historyczne do prognozowania sprzedaży i stanów magazynowych.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        q: 'Czy wdrożenie GA4 spowolni moją stronę?',
        a: 'Nie, jeśli jest zrobione poprawnie przez Google Tag Manager (GTM). GTM ładuje skrypty asynchronicznie, co oznacza, że nie blokują one wyświetlania treści dla użytkownika.',
      },
      {
        q: 'Co to jest Server-Side Tracking i czy go potrzebuję?',
        a: 'To nowoczesna metoda przesyłania danych z pominięciem przeglądarki użytkownika. Jest niezbędna, jeśli chcesz mieć precyzyjne dane w dobie blokad plików cookies (IOS 14+, AdBlock).',
      },
      {
        q: 'Czy moje dane są zgodne z RODO?',
        a: 'Wdrażamy Consent Mode v2, który zarządza zgodami użytkowników. Google Analytics zbiera dane tylko od osób, które wyraziły zgodę, a dla pozostałych stosuje zaawansowane modelowanie behawioralne.',
      },
    ],
  },
  cta: {
    title: 'Odzyskaj kontrolę nad danymi.',
    text: 'Przestań latać na ślepo. Wdrożymy analitykę i zapewnimy bezpieczeństwo prawne Twojej firmie.',
    button: 'Zamów Audyt Prawny & Data',
  },
};

export const GOOGLE_ADS_CONTENT = {
  seo: {
    title: 'Kampanie Google Ads (SEM) | Agencja Google Ads',
    description:
      'Prowadzimy skuteczne kampanie Google Ads (linki sponsorowane), które generują sprzedaż. Płać tylko za efekty (PPC) i osiągaj wysoki zwrot z inwestycji (ROAS).',
    image: '/assets/images/google-ads.png',
  },
  hero: {
    badge: 'Certyfikowana Agencja Google Partner',
    title: {
      line1: 'Twoja firma na',
      line2: '1. miejscu w Google.',
    },
    description:
      'Przechwytuj klientów dokładnie w momencie, gdy szukają Twoich produktów. Precyzyjne kampanie SEM, które skalują sprzedaż, a nie koszty.',
    cta: 'Darmowy Audyt Konta',
    microCopy: 'Płać tylko za efekt (PPC)',
    caseStudy: {
      label: 'Ostatni Wynik (Sklep Meblowy)',
      desc: 'Zwiększyliśmy przychód o <strong>+320%</strong> w 3 miesiące, redukując koszt kliknięcia o 40%.',
    },
    simulator: {
      placeholder: 'skuteczna agencja google ads warszawa',
      ad: {
        label: 'Sponsorowane',
        title: 'Profesjonalne Kampanie Google Ads | Zwrot z Inwestycji',
        desc: 'Nie przepalaj budżetu. Skuteczne kampanie Linków Sponsorowanych. Certyfikowani specjaliści, jasne raporty i realne wyniki. Zamów darmowy audyt.',
        links: ['Darmowa Wycena', 'Case Studies', 'Cennik', 'Kontakt'],
      },
    },
  },
  painPoints: {
    title: 'Gdzie uciekają Twoje pieniądze?',
    description:
      "System Google Ads jest skomplikowany. Jeden zły 'ptaszek' w ustawieniach może kosztować Cię tysiące złotych miesięcznie. Sprawdź, czy nie popełniasz tych błędów.",
    items: [
      {
        title: 'Brak Wykluczeń (Negative Keywords)',
        desc: "Wyświetlasz reklamy na słowa 'darmowe', 'chomikuj' lub 'praca'? Płacisz za ruch śmieciowy, który nigdy nie kupi.",
      },
      {
        title: 'Złe Dopasowanie (Broad Match)',
        desc: 'Używasz dopasowania przybliżonego bez kontroli? Google pokazuje Cię każdemu, nie tylko zdecydowanym klientom.',
      },
      {
        title: 'Niski Wynik Jakości (QS)',
        desc: 'Masz słabą stronę docelową lub nieadekwatne teksty? Google każe Ci płacić nawet 400% więcej za kliknięcie niż konkurencji.',
      },
    ],
  },
  industries: {
    title: 'Strategia dopasowana do branży',
    description:
      'Inaczej promuje się sklep z tysiącem produktów, a inaczej lokalnego usługodawcę. Dobieramy narzędzia pod Twój model biznesowy.',
    services: {
      title: 'Firmy Usługowe',
      subtitle: 'Lead Generation',
      desc: 'Dla prawników, lekarzy, hydraulików i B2B. Celem jest telefon od klienta lub wypełnienie formularza.',
      features: [
        '<strong>Google Search:</strong> Przechwytywanie "gorących" zapytań (np. "awaria rury warszawa").',
        '<strong>Google Maps:</strong> Promowanie wizytówki w wynikach lokalnych.',
        '<strong>Remarketing:</strong> "Śledzenie" niezdecydowanych banerami graficznymi.',
      ],
      cta: 'Strategia dla Usług',
    },
    ecommerce: {
      title: 'Sklepy Internetowe',
      subtitle: 'E-commerce / ROAS',
      desc: 'Dla sklepów online. Celem jest bezpośrednia sprzedaż produktu z jak najwyższym zwrotem z inwestycji (ROAS).',
      features: [
        '<strong>Google Shopping (PLA):</strong> Reklamy ze zdjęciem i ceną produktu.',
        '<strong>Google CSS Partner:</strong> -20% tańsze kliknięcia w kampaniach produktowych.',
        '<strong>Performance Max:</strong> Automatyzacja wyświetlania w całym ekosystemie Google.',
      ],
      cta: 'Strategia E-commerce',
    },
  },
  calculator: {
    title: 'Symulator Zysków',
    description:
      'Sprawdź, jakiego efektu możesz się spodziewać. Przesuwaj suwaki i zobacz, jak budżet zamienia się w przychód.',
    labels: {
      budget: 'Miesięczny Budżet',
      budgetDesc: 'Budżet wpłacany bezpośrednio do Google.',
      cpc: 'Koszt kliknięcia (CPC)',
      cpcDesc: 'Średnia stawka w Twojej branży.',
      cr: 'Konwersja (CR)',
      crDesc: 'Ile % odwiedzających kupuje/dzwoni.',
      aov: 'Średnia Wartość Zamówienia',
      traffic: 'Ruch na stronie',
      leads: 'Ilość Transakcji',
      cpa: 'Koszt Pozyskania (CPA)',
      roas: 'ROAS (Zwrot)',
      revenue: 'Przewidywany Przychód',
      profit: 'Zysk netto (est.)',
    },
  },
  algorithm: {
    title: 'Nasz Algorytm Sukcesu',
    subtitle: 'Procedura Operacyjna',
    description:
      'Nie zgadujemy. Działamy według sprawdzonego procesu inżynieryjnego, który eliminuje ryzyko przepalenia budżetu i gwarantuje skalowalność.',
    steps: [
      {
        step: '01',
        title: 'Deep Audit & Setup',
        desc: 'Fundament. Sprawdzamy poprawność danych, konfigurujemy konwersje w GA4 i eliminujemy błędy techniczne.',
        cmd: '> init_tracking --ga4',
        status: 'Connected',
      },
      {
        step: '02',
        title: 'Struktura SKAG',
        desc: 'Hiper-precyzja. Tworzymy grupy reklam (Single Keyword Ad Groups) dla najwyższego Wyniku Jakości (QS).',
        cmd: '> build_structure --granular',
        status: 'Optimized',
      },
      {
        step: '03',
        title: 'Bid Management',
        desc: 'Inteligentne stawki. Wykluczamy nierentowne słowa i dostosowujemy stawki godzinowe oraz urządzeń.',
        cmd: '> adjust_bids --maximize_roas',
        status: 'Processing',
      },
      {
        step: '04',
        title: 'Skalowanie Wyniku',
        desc: 'Zwiększamy budżet tylko na kampanie, które dowożą wynik. Ekspansja na nowe frazy i kanały (YouTube/Discovery).',
        cmd: '> scale_profit --up',
        status: 'Growing',
      },
    ],
  },
  faqs: [
    {
      q: 'Ile muszę wydać na reklamy (Budżet Mediowy)?',
      a: 'To zależy od branży i konkurencji. Zalecamy start od min. 2000-3000 PLN miesięcznie, aby algorytmy miały wystarczającą ilość danych do nauki. Pamiętaj: ten budżet trafia bezpośrednio do Google.',
    },
    {
      q: 'Czy płacę za wyświetlenie reklamy?',
      a: 'W sieci wyszukiwania (Search) - NIE. Płacisz tylko wtedy, gdy ktoś kliknie w reklamę i wejdzie na Twoją stronę (model PPC - Pay Per Click). Wyświetlenia są darmowe.',
    },
    {
      q: 'Dlaczego moja konkurencja jest wyżej?',
      a: 'Pozycja zależy od iloczynu: Stawka CPC x Wynik Jakości. Jeśli masz lepszą stronę i trafniejszą reklamę, możesz być wyżej niż konkurencja, płacąc mniej za kliknięcie. Nad tym właśnie pracujemy.',
    },
    {
      q: "Co to jest 'Fee Agencji'?",
      a: 'To nasze wynagrodzenie za konfigurację, optymalizację, pisanie tekstów i raportowanie. Jest oddzielone od budżetu reklamowego, dzięki czemu masz pełną przejrzystość kosztów.',
    },
  ],
  ctaAudit: {
    title: 'Zacznij od audytu. To nic nie kosztuje.',
    description:
      'Sprawmedzimy Twoje obecne konto i wskażemy miejsca, gdzie uciekają pieniądze. Bez zobowiązań.',
    button: 'Zamów Darmowy Audyt Konta',
  },
};

export const META_ADS_CONTENT = {
  seo: {
    title: 'Kampanie Meta Ads | Reklama na Facebooku i Instagramie',
    description:
      'Skalujemy sprzedaż i generujemy leady dzięki precyzyjnym kampaniom Meta Ads. Prowadzimy reklamę na Facebooku i Instagramie z wykorzystaniem CAPI.',
    image: '/assets/images/meta-ads.png',
  },
  hero: {
    badge: 'Meta Business Partner',
    title: {
      line1: 'Kampanie Facebook',
      line2: '& Instagram Ads.',
      accent: 'Skalujemy sprzedaż.',
    },
    description:
      'Google odpowiada na pytania. Facebook <strong>tworzy pragnienia</strong>. Docieramy do Twoich klientów precyzyjnym targetowaniem behawioralnym, zanim oni poszukają konkurencji.',
    cta: 'Darmowa Strategia',
    microCopy: 'Popyt Utajony',
  },
  funnel: {
    title: 'Architektura Lejka Sprzedażowego',
    description:
      "Nie wierzymy w pojedyncze reklamy. Budujemy wielopoziomowe systemy, które 'ogrzewają' klienta i domykają sprzedaż z chirurgiczną precyzją.",
    stages: [
      {
        step: 'TOF (Top of Funnel)',
        label: 'Zasięg & Świadomość',
        desc: 'Docieramy do nowych osób (Cold Audience). Celem jest zatrzymanie scrollowania i przedstawienie marki.',
      },
      {
        step: 'MOF (Middle of Funnel)',
        label: 'Edukacja & Ruch',
        desc: 'Budujemy zaufanie. Kierujemy ruch na bloga, pokazujemy wideo z produktem lub opinie klientów.',
      },
      {
        step: 'BOF (Bottom of Funnel)',
        label: 'Konwersja & Sprzedaż',
        desc: 'Domknięcie sprzedaży. Remarketing do osób, które porzuciły koszyk lub wyświetliły ofertę.',
      },
      {
        step: 'Loyalty',
        label: 'Lojalność & LTV',
        desc: 'Cross-selling i Up-selling do obecnych klientów. Zwiększamy wartość życiową klienta (LTV).',
      },
    ],
    commandCenter: {
      title: 'Strategia',
      subtitle: 'High-ROI',
      goalsLabel: 'Cele aktualnej fazy:',
      efficiencyLabel: 'Flow Efficiency',
      features: ['Automatyczne wykluczanie kupujących', 'Dynamiczne odświeżanie kreacji'],
      button: 'Zbuduj swój lejek',
    },
  },
  capi: {
    badge: 'Server-Side Tracking',
    title: {
      line1: 'Blokady iOS i Cookies?',
      line2: 'Odzyskujemy Twoje dane.',
    },
    description:
      'Pixel Facebooka traci skuteczność przez AdBlocki i politykę Apple (iOS 14+). Wdrażamy <strong>Conversions API (CAPI)</strong> – bezpośredni most danych między Twoim serwerem a Meta.',
    features: [
      {
        title: 'Precyzyjna Analityka',
        desc: 'Widzisz 20-30% więcej konwersji w panelu reklamowym.',
      },
      {
        title: 'Lepszy Remarketing',
        desc: 'Algorytmy uczą się szybciej, bo mają "pełny obraz" danych.',
      },
    ],
  },
  ecosystem: {
    title: 'Ekosystem Social Ads',
    description:
      'Facebook to potęga, ale nie jedyny gracz. Dobieramy platformy tam, gdzie są Twoi klienci.',
    platforms: [
      {
        name: 'Meta (FB & IG)',
        desc: 'Najlepsze algorytmy sprzedażowe na świecie. Idealne do skalowania E-commerce i generowania leadów B2B/B2C.',
        features: ['Precyzyjne Targetowanie', 'Skalowanie Sprzedaży'],
        tag: 'Core',
      },
      {
        name: 'TikTok Ads',
        desc: 'Niskie koszty zasięgu i potężny potencjał wiralowy. Kluczowe dla marek kierowanych do Gen Z i produktów impulsowych.',
        features: ['Niski CPM (Tani Zasięg)', 'User Generated Content'],
        tag: 'Viral',
      },
      {
        name: 'LinkedIn Ads',
        desc: 'Chirurgiczna precyzja w dotarciu do decydentów (CEO, Dyrektorzy). Droższe, ale niezbędne w sprzedaży usług high-ticket.',
        features: ['Targetowanie po Stanowiskach', 'Account Based Marketing'],
        tag: 'Premium B2B',
      },
    ],
  },
  strategySelector: {
    title: 'Strategia dopasowana do celu',
    description:
      'Algorytmy Mety działają inaczej dla sklepu, a inaczej dla usług. Wybierz swój model, aby zobaczyć dedykowany setup.',
    ecommerce: {
      label: 'E-commerce',
      desc: 'Sprzedaż bezpośrednia, ROAS, Katalogi.',
      advantage: {
        title: 'Advantage+ Shopping Campaign',
        desc: 'Pełna automatyzacja AI. System sam dobiera produkty z katalogu, które mają największą szansę na sprzedaż konkretnemu użytkownikowi.',
      },
      remarketing: {
        title: 'Dynamic Remarketing',
        desc: '"Porzuciłeś koszyk?". Wyświetlamy dokładnie te produkty, które użytkownik oglądał, z kodem rabatowym na zachętę.',
      },
    },
    b2b: {
      label: 'Usługi & B2B',
      desc: 'Generowanie leadów, Formularze, Spotkania.',
      forms: {
        title: 'Instant Forms (Lead Ads)',
        desc: 'Formularze wewnątrz Facebooka/Instagrama. Automatyczne uzupełnianie danych. Użytkownik nie wychodzi z aplikacji = wyższa konwersja.',
      },
      messenger: {
        title: 'Click-to-Messenger',
        desc: 'Rozpocznij konwersację. Boty kwalifikujące leady i szybki kontakt z handlowcem. Idealne dla usług Premium.',
      },
    },
  },
  faqs: [
    {
      q: 'Czy muszę mieć konto na Instagramie?',
      a: 'Zalecamy, ale nie jest to technicznie wymagane do puszczania reklam na Facebooku. Jednak do reklam na Instagramie (zwłaszcza Reels) profil firmowy jest kluczowy dla wiarygodności.',
    },
    {
      q: 'Ile kosztuje dotarcie do 1000 osób?',
      a: 'To zależy od branży (CPM). W Polsce średnio jest to między 10 a 25 PLN. Oznacza to, że za 1000 zł możesz wyświetlić reklamę nawet 50-100 tysięcy razy.',
    },
    {
      q: 'Co to jest CAPI (Server-Side)?',
      a: "To nowoczesna metoda przesyłania danych z Twojego serwera do Facebooka, która omija blokady cookies (iOS14+). Dzięki temu odzyskujemy nawet 30% konwersji, których 'zwykły' Pixel nie widzi.",
    },
    {
      q: 'Czy robicie też TikTok Ads?',
      a: 'Tak. TikTok to potężne narzędzie nie tylko dla Gen Z. Jeśli Twoja grupa docelowa tam jest, zaadaptujemy materiały wideo z Reels pod specyfikę TikToka.',
    },
  ],
  cta: {
    title: 'Twoi klienci tam są. Ty też powinieneś.',
    description:
      'Nie pozwól, aby konkurencja przejęła ich uwagę. Uruchom kampanię, która zapada w pamięć i sprzedaje.',
    button: 'Uruchom Kampanię',
  },
};

export const SEO_CONTENT = {
  seo: {
    title: 'SEO i Content Marketing | Pozycjonowanie Stron',
    description:
      'Zdobądź wysokie pozycje w Google dzięki naszym usługom SEO i content marketingu. Budujemy autorytet domeny i generujemy darmowy ruch organiczny.',
    image: '/assets/images/core-web-vitals.png',
  },
  hero: {
    badge: 'Organic Growth',
    title: {
      line1: 'Pozycjonowanie Stron.',
      line2: 'Darmowy ruch na lata.',
    },
    description:
      'Przestań płacić za każde kliknięcie. Zbuduj widoczność, która jest <strong>aktywem</strong> Twojej firmy, a nie kosztem. Zdominuj wyniki wyszukiwania dzięki strategii Data-Driven SEO.',
    cta: 'Darmowy Audyt SEO',
    microCopy: 'Działamy Globalnie',
  },
  localSeo: {
    title: 'Bądź widoczny lokalnie (Maps)',
    description:
      'Dla wielu biznesów usługowych (restauracje, mechanicy, lekarze) 50% ruchu pochodzi z map. Optymalizujemy Wizytówki Google (GBP), abyś był pierwszym wyborem w okolicy.',
    items: [
      'Pozycjonowanie w Map Pack (TOP 3)',
      'Zarządzanie opiniami i reputacją',
      'Optymalizacja "Near Me"',
    ],
  },
  contentIntelligence: {
    title: 'Content, który buduje zaufanie',
    description:
      'Nie piszemy "tekstów pod SEO". Piszemy odpowiedzi na realne problemy Twoich klientów. Budujemy Topical Authority, który czyni Cię liderem opinii.',
    pillars: [
      { label: 'Experience', desc: 'Doświadczenie' },
      { label: 'Expertise', desc: 'Wiedza' },
      { label: 'Authority', desc: 'Autorytet' },
      { label: 'Trust', desc: 'Zaufanie' },
    ],
  },
  technicalSeo: {
    title: 'Szybkość to Ranking',
    subtitle: 'Core Web Vitals',
    description:
      "Google to robot. Jeśli Twoja strona jest wolna, robot traci zasoby i obniża Twój ranking. My nie 'instalujemy wtyczek'. My optymalizujemy kod z chirurgiczną precyzją.",
    impact: {
      conversion: '-7%',
      bounce: '+50%',
    },
    stack: [
      'Formaty Next-Gen (WebP/AVIF)',
      'Eliminacja zasobów blokujących (Render Blocking)',
      'Minifikacja i kompresja GZIP/Brotli',
      'Server-Side Caching (Redis/Varnish)',
      'Optymalizacja TTFB (Time to First Byte)',
    ],
  },
  roadmap: {
    title: 'Roadmapa Wzrostu',
    description:
      'SEO to proces. Zobacz, jak wyglądają kolejne etapy współpracy i kiedy spodziewać się pierwszych efektów.',
    steps: [
      {
        month: 'Miesiąc 1',
        title: 'Audyt & Quick Wins',
        desc: 'Eliminujemy błędy krytyczne. Naprawa indeksacji i szybkości daje natychmiastowy skok jakości w oczach Google.',
      },
      {
        month: 'Miesiąc 2-3',
        title: 'Content & Struktura',
        desc: 'Nasycamy stronę treścią (Topical Authority). Poprawiamy nagłówki, meta tagi i linkowanie wewnętrzne.',
      },
      {
        month: 'Miesiąc 4-6',
        title: 'Autorytet & Linki',
        desc: 'Pozyskujemy mocne linki z zewnętrznych portali branżowych. To paliwo, które winduje frazy do TOP 3.',
      },
      {
        month: 'Miesiąc 7+',
        title: 'Dominacja & Skalowanie',
        desc: 'Rozbudowujemy klastry tematyczne o nowe nisze. Optymalizujemy konwersję (CRO), aby ruch zamieniał się w pieniądze.',
      },
    ],
  },
  roi: {
    title: 'Wycena Ruchu (ROI)',
    description:
      "Sprawdź, ile musiałbyś zapłacić w Google Ads za ten sam ruch, który SEO może dostarczać Ci 'za darmo' miesiąc w miesiąc.",
    labels: {
      volume: 'Miesięczna liczba wyszukiwań frazy',
      cpc: 'Średni koszt kliknięcia (CPC)',
      potential: 'Potencjał TOP 3',
      traffic: 'Est. Ruch',
      equivalent: 'Ekwiwalent Ads',
      saving: 'oszczędności / msc',
    },
  },
  faqs: [
    {
      q: 'Kiedy zobaczę pierwsze efekty SEO?',
      a: 'SEO to maraton, nie sprint. Pierwsze wzrosty widoczności (ilość słów kluczowych w TOP50) widać po 3 miesiącach. Realny wzrost ruchu i sprzedaży następuje zazwyczaj między 6. a 9. miesiącem systematycznej pracy.',
    },
    {
      q: 'Czy muszę mieć bloga?',
      a: "Tak, jeśli chcesz skalować biznes. Blog pozwala pokryć tysiące zapytań typu 'long-tail' (np. 'jaka pompa ciepła do domu 100m2'), na które Twoi klienci szukają odpowiedzi przed zakupem. To buduje zaufanie i ściąga ruch.",
    },
    {
      q: 'Czy gwarantujecie 1. miejsce w Google?',
      a: 'Nie. Google oficjalnie ostrzega przed agencjami dającymi takie gwarancje. Algorytm jest tajny i zmienny. Gwarantujemy natomiast rzetelną realizację strategii, wzrost widoczności i transparentne raporty z efektów.',
    },
    {
      q: 'Czy używacie AI do pisania tekstów?',
      a: 'Traktujemy AI jako asystenta (research, struktura), ale nie jako autora. Wszystkie treści są pisane lub weryfikowane przez doświadczonych copywriterów, aby zachować unikalny ton marki i wartość merytoryczną.',
    },
  ],
  cta: {
    title: 'Sprawdź, na co zarabia konkurencja.',
    description:
      'Większość stron ma ukryte błędy techniczne. Przygotujemy dla Ciebie darmowy raport, który pokaże, na jakie słowa kluczowe widoczna jest Twoja konkurencja, a Ty nie.',
    button: 'Zamów Analizę Konkurencji',
  },
};
