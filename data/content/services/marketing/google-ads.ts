/**
 * Treść /marketing/google-ads/ — przepisana 2026-07-16 (krytyka 13/40).
 * Decyzje właściciela: Google Partner = PRAWDA (zostaje); CSS Partner
 * niepotwierdzony (wypada); liczby branżowe bez procentów (mechanika);
 * cena hero = najniższy pakiet CMS (Start 1 500 zł/mc); raportowanie =
 * dashboard 24/7 + spotkanie co miesiąc. Zero obietnic pozycji („1. miejsce"
 * wypadło z H1 — własne FAQ SEO mówi wprost, że pozycji się nie gwarantuje).
 * Usunięte wcześniej: „+320% (Sklep Meblowy)" — wymyślona liczba.
 */
export const GOOGLE_ADS_CONTENT = {
  seo: {
    title: 'Kampanie Google Ads — agencja Google Partner | Mixture',
    description:
      'Prowadzenie kampanii Google Ads: Search, Shopping, Performance Max. Pilnujemy wykluczeń i jakości ruchu, konto reklamowe zostaje Twoje. Dashboard z wynikami 24/7.',
    image: '/assets/images/google-ads.png',
  },
  hero: {
    title: {
      line1: 'Google Ads bez',
      line2: 'przepalania budżetu.',
    },
    description:
      'Reklamy dla ludzi, którzy już szukają tego, co sprzedajesz. Pilnujemy wykluczeń, jakości ruchu i kosztu konwersji — a Ty patrzysz na te same liczby co my, w dashboardzie dostępnym 24/7.',
    cta: 'Darmowy audyt konta',
    microCopy: 'Płacisz za kliknięcie, nie za obietnice',
  },
  painPoints: {
    title: 'Gdzie uciekają Twoje pieniądze?',
    description:
      'System Google Ads jest skomplikowany. Jeden zły „ptaszek" w ustawieniach może kosztować Cię tysiące złotych miesięcznie. To trzy błędy, które widzimy najczęściej na przejmowanych kontach.',
    items: [
      {
        title: 'Brak wykluczeń',
        desc: 'Reklama wyświetla się na frazy z „darmowe", „chomikuj" albo „praca". Płacisz za ruch, który z definicji nigdy nie kupi.',
      },
      {
        title: 'Dopasowanie przybliżone bez kontroli',
        desc: 'Google pokazuje Twoją reklamę „podobnym" zapytaniom — bez pilnowania raportu wyszukiwań budżet idzie na hasła, których nie wybrałeś.',
      },
      {
        title: 'Niski Wynik Jakości',
        desc: 'Słaba strona docelowa i nieadekwatne teksty reklam podbijają stawkę za kliknięcie — za ten sam ruch płacisz wielokrotnie więcej niż konkurent z lepszym kontem.',
      },
    ],
  },
  industries: {
    title: 'Strategia dopasowana do branży',
    description:
      'Inaczej promuje się sklep z tysiącem produktów, a inaczej lokalnego usługodawcę. Dobieramy typy kampanii do Twojego modelu biznesowego.',
    services: {
      title: 'Firmy usługowe',
      subtitle: 'Zapytania i telefony',
      desc: 'Dla prawników, lekarzy, warsztatów i firm B2B. Celem jest telefon od klienta albo wypełniony formularz.',
      features: [
        '<strong>Google Search:</strong> przechwytywanie pilnych zapytań (np. „awaria rury rzeszów").',
        '<strong>Google Maps:</strong> promowanie wizytówki w wynikach lokalnych.',
        '<strong>Remarketing:</strong> przypominanie się osobom, które były na stronie i nie zadzwoniły.',
      ],
      cta: 'Strategia dla usług',
    },
    ecommerce: {
      title: 'Sklepy internetowe',
      subtitle: 'Sprzedaż produktów',
      desc: 'Dla sklepów online. Celem jest sprzedaż z pilnowanym kosztem pozyskania i zwrotem z wydatków reklamowych.',
      features: [
        '<strong>Google Shopping:</strong> reklamy ze zdjęciem i ceną produktu prosto z Twojego katalogu.',
        '<strong>Performance Max:</strong> automatyzacja wyświetleń w całym ekosystemie Google — pod naszą kontrolą budżetową.',
        '<strong>Remarketing dynamiczny:</strong> pokazujemy dokładnie te produkty, które klient oglądał.',
      ],
      cta: 'Strategia e-commerce',
    },
  },
  /**
   * Kalkulator = arytmetyka ZAŁOŻEŃ użytkownika, nie prognoza wyniku
   * (poprzednik: „Symulator Zysków… zobacz, jak budżet zamienia się
   * w przychód" + wiersz „Zysk netto"). Zastrzeżenie jest częścią treści.
   */
  calculator: {
    title: 'Matematyka kampanii',
    description:
      'Przesuń suwaki i zobacz, jak budżet, koszt kliknięcia i konwersja składają się na koszt pozyskania klienta. To arytmetyka Twoich założeń — nie obietnica wyniku.',
    disclaimer:
      'Realne CPC i konwersję w Twojej branży poznasz po pierwszym miesiącu kampanii — dopiero wtedy te liczby przestają być założeniami.',
    labels: {
      budget: 'Miesięczny budżet mediowy',
      budgetDesc: 'Kwota wpłacana bezpośrednio do Google — osobno od naszego wynagrodzenia.',
      cpc: 'Koszt kliknięcia (CPC)',
      cpcDesc: 'Średnia stawka w Twojej branży — sprawdzimy ją w audycie.',
      cr: 'Konwersja strony',
      crDesc: 'Ile procent odwiedzających kupuje albo dzwoni.',
      aov: 'Średnia wartość zamówienia',
      traffic: 'Kliknięcia miesięcznie',
      leads: 'Transakcje / zapytania',
      cpa: 'Koszt pozyskania',
      revenue: 'Wartość zamówień przy tych założeniach',
    },
  },
  /** Proces — bez mono-teatru („> init_tracking", statusy „Connected"). */
  process: {
    title: 'Jak prowadzimy konto',
    description:
      'Nie zgadujemy. Każde konto przechodzi ten sam proces — od pomiaru, przez strukturę, po skalowanie tego, co faktycznie dowozi.',
    steps: [
      {
        title: 'Audyt i pomiar',
        desc: 'Zanim wydamy złotówkę: poprawna konfiguracja konwersji w GA4, sprzątanie błędów technicznych, przegląd historii konta.',
      },
      {
        title: 'Struktura kampanii',
        desc: 'Precyzyjne grupy reklam i trafne teksty — to one decydują o Wyniku Jakości, czyli o tym, ile realnie płacisz za kliknięcie.',
      },
      {
        title: 'Optymalizacja stawek',
        desc: 'Cotygodniowy przegląd raportu wyszukiwań: wykluczamy nierentowne frazy, dostosowujemy stawki do pory dnia i urządzeń.',
      },
      {
        title: 'Skalowanie wyniku',
        desc: 'Budżet rośnie tylko tam, gdzie liczby tego bronią. Ekspansja na nowe frazy i formaty — po dowiezieniu bazy.',
      },
    ],
  },
  /** Google Partner — potwierdzone przez właściciela 2026-07-16. */
  partner: {
    label: 'Agencja Google Partner',
    desc: 'Status weryfikowany przez Google — wymaga utrzymania wyników kont i certyfikacji zespołu. Możesz go sprawdzić w publicznym rejestrze partnerów.',
  },
  faqs: [
    {
      q: 'Ile muszę wydać na reklamy (budżet mediowy)?',
      a: 'To zależy od branży i konkurencji. Zalecamy start od min. 2000–3000 zł miesięcznie, aby algorytmy miały wystarczającą ilość danych do nauki. Ten budżet trafia bezpośrednio do Google — osobno od naszego wynagrodzenia.',
    },
    {
      q: 'Czy płacę za wyświetlenie reklamy?',
      a: 'W sieci wyszukiwania (Search) — nie. Płacisz tylko wtedy, gdy ktoś kliknie w reklamę i wejdzie na Twoją stronę (model PPC). Wyświetlenia są darmowe.',
    },
    {
      q: 'Dlaczego moja konkurencja jest wyżej?',
      a: 'Pozycja reklamy zależy od iloczynu stawki i Wyniku Jakości. Jeśli masz lepszą stronę docelową i trafniejszą reklamę, możesz być wyżej, płacąc mniej za kliknięcie. Nad tym właśnie pracujemy.',
    },
    {
      q: 'Co to jest „fee agencji"?',
      a: 'To nasze wynagrodzenie za konfigurację, optymalizację, pisanie tekstów i raportowanie. Jest oddzielone od budżetu reklamowego, dzięki czemu masz pełną przejrzystość kosztów.',
    },
    {
      q: 'Jak wygląda raportowanie?',
      a: 'Dostajesz dostęp do dashboardu (Looker Studio) z wynikami 24/7 — patrzysz na te same liczby co my. Raz w miesiącu spotykamy się i omawiamy wyniki oraz plan na kolejny okres.',
    },
  ],
  ctaAudit: {
    title: 'Zacznij od audytu. To nic nie kosztuje.',
    description:
      'Sprawdzimy Twoje obecne konto i wskażemy miejsca, gdzie uciekają pieniądze. Bez zobowiązań.',
    button: 'Zamów darmowy audyt konta',
  },
};
