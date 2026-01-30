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
        '<strong>Remarketing:</strong> "Śledzenie" niezdedicated banerami graficznymi.',
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
      'Sprawdzimy Twoje obecne konto i wskażemy miejsca, gdzie uciekają pieniądze. Bez zobowiązań.',
    button: 'Zamów Darmowy Audyt Konta',
  },
};
