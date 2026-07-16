/**
 * Treść huba /marketing/ — przepisana 2026-07-16 (krytyka 12/40, pełna
 * przebudowa). Decyzje właściciela: kotwica od 1 200 zł/mc (najniższy realny
 * pakiet CMS — SEO lokalne); raportowanie = dashboard 24/7 + spotkanie co
 * miesiąc (wersja „co tydzień" była nieprawdą); zakres POTWIERDZONY bez
 * LinkedIn Ads / Cold Mailingu / YouTube Ads; zero wyników z ręki (żadnych
 * ROAS/procentów — nie mamy zmierzonych wyników kampanii, więc ich nie
 * pokazujemy). Głos: po polsku, do właściciela firmy — nie „kaloryczne
 * leady" i „Growth Hacking".
 */
export const MARKETING_CONTENT = {
  seo: {
    title: 'Marketing internetowy — Google Ads, Meta Ads, SEO | Mixture',
    description:
      'Kampanie Google Ads i Meta Ads oraz SEO dla firm, które chcą wiedzieć, za co płacą. Dashboard z wynikami 24/7, spotkanie co miesiąc, budżety od 1 200 zł/mc.',
    image: '/assets/images/google-ads.png',
  },
  hero: {
    title: 'Reklamy, które',
    titleAccent: 'się liczą.',
    description:
      'Google Ads, Meta Ads i SEO dla firm, które chcą wiedzieć, za co płacą. Patrzysz na te same liczby co my — w dashboardzie dostępnym 24/7, nie w tabelce wysyłanej raz na kwartał.',
    cta: 'Umów bezpłatną konsultację',
  },
  /**
   * Ciemnia dowodowa: realizacje z tagami reklamowymi/SEO z CMS + metoda
   * pracy wprost. Nagłówek KRÓTKI świadomie — składa go tablica flip-dot
   * także na mobile (długie słowa schodzą poniżej progu tarczy).
   */
  proof: {
    title: 'Kampanie, nie obiecanki.',
    description:
      'Nie pokażemy Ci wykresu „+320% przychodu" z powietrza — takie liczby zostawiamy agencjom, po których sprzątamy. Pokazujemy projekty, przy których prowadziliśmy reklamy i SEO, oraz metodę, według której pracujemy.',
    method: [
      'Dashboard z wynikami masz dostępny 24/7 — te same liczby, na które patrzymy my.',
      'Raz w miesiącu siadamy nad wynikami i planem na kolejny okres.',
      'Konto reklamowe jest Twoje. Odchodzisz — wszystko zostaje u Ciebie.',
    ],
    linkLabel: 'Zobacz wszystkie realizacje',
    linkTo: '/portfolio',
  },
  painPoints: {
    title: 'Dlaczego Twoje reklamy nie działają?',
    description:
      'Większość kont reklamowych, które przejmujemy, ma te same trzy błędy. Sprawdź, czy nie płacisz za któryś z nich.',
    items: [
      {
        title: 'Brak wykluczeń',
        desc: 'Płacisz za kliknięcia osób, które szukają „darmowych" rozwiązań albo pracy. Na wielu kontach to jedna trzecia budżetu wydana na ruch, który nigdy nie kupi.',
      },
      {
        title: 'Ślepa analityka',
        desc: 'Jeśli konto nie mierzy zakupów i telefonów, system reklamowy nie wie, komu pokazywać reklamy — i uczy się na złych danych. Kampania działa po omacku.',
      },
      {
        title: 'Słaba strona docelowa',
        desc: 'Najlepsza reklama nie sprzeda, jeśli strona ładuje się wolno albo gubi klienta. Reklamy i strona to jeden system — dlatego robimy jedno i drugie.',
      },
    ],
  },
  /** Dwa modele wzrostu — uczciwe lustro zamiast fejkowej symulacji. */
  models: {
    title: 'Szybko czy na lata?',
    description:
      'To nie jest wybór „albo–albo" — większość firm potrzebuje obu, w różnych proporcjach. Ale uczciwie: każdy z tych modeli ma inną mechanikę, koszt i trwałość.',
    sprint: {
      title: 'Sprint — płatny ruch',
      lines: [
        'Google Ads na frazy, których ludzie już szukają, i Meta Ads na domykanie niezdecydowanych.',
        'Pierwsze dane spływają w kilka dni. Wyniki rosną, dopóki płacisz za media — to koszt stały, nie inwestycja.',
        'Ma sens, gdy: sezon, promocja, nowy produkt, szybka walidacja oferty.',
      ],
      note: 'Budżet mediowy od ~2 000 zł/mc, żeby algorytmy miały z czego się uczyć.',
    },
    marathon: {
      title: 'Maraton — widoczność organiczna',
      lines: [
        'SEO, treści eksperckie i automatyzacja marketingu — budowa pozycji, która pracuje bez licznika kliknięć.',
        'Efekty rosną miesiącami, ale zostają na lata i nie znikają w dniu, w którym zatrzymasz budżet.',
        'Ma sens, gdy: budujesz markę, masz konkurencyjny rynek, chcesz uniezależnić się od stawek reklamowych.',
      ],
      note: 'Pierwsze mierzalne ruchy zwykle po 3–6 miesiącach — każdy, kto obiecuje szybciej, zgaduje.',
    },
  },
  /** Synergia — linia plotera przez kanały (zamiast wiecznej orbity). */
  synergy: {
    title: 'Kanały grają razem albo wcale',
    description:
      'Pojedynczy kanał zostawia dziury, w które ucieka budżet. Łączymy je tak, żeby jeden podawał drugiemu.',
    items: [
      {
        title: 'Google łapie, Meta domyka',
        desc: 'Google Ads ściąga ludzi, którzy już szukają. Meta przypomina się tym, którzy weszli, obejrzeli i się zawahali.',
      },
      {
        title: 'Ads uczy, SEO przejmuje',
        desc: 'Frazy, które w reklamach realnie sprzedają, pozycjonujemy organicznie — z czasem ten sam ruch kosztuje coraz mniej.',
      },
      {
        title: 'Analityka pilnuje całości',
        desc: 'Poprawnie zmierzone zakupy i telefony to paliwo obu kanałów. Bez tego każda optymalizacja jest zgadywaniem.',
      },
    ],
  },
  /** Drabinka usług → podstrony. Zero „KPI Target", zero obietnic pozycji. */
  services: {
    title: 'Cztery narzędzia. Dobierane, nie wciskane.',
    description:
      'Nie sprzedajemy „pakietu wszystkiego". Na konsultacji mówimy wprost, który kanał ma sens w Twojej sytuacji — a który byłby przepalaniem budżetu.',
    items: [
      {
        id: 'google',
        title: 'Google Ads',
        role: 'Ludzie, którzy już szukają',
        desc: 'Kampanie Search i Shopping na frazy z intencją zakupu. Płacisz za kliknięcie, więc pilnujemy wykluczeń i jakości ruchu.',
        features: ['Search i Shopping', 'Remarketing', 'Stała optymalizacja konwersji'],
        path: '/marketing/google-ads/',
      },
      {
        id: 'meta',
        title: 'Meta Ads',
        role: 'Ludzie, którzy jeszcze nie wiedzą, że szukają',
        desc: 'Facebook i Instagram: precyzyjne grupy odbiorców, testy kreacji i remarketing, który domyka sprzedaż.',
        features: ['Kampanie sprzedażowe i leadowe', 'Remarketing', 'Testy kreacji'],
        path: '/marketing/meta-ads/',
      },
      {
        id: 'seo',
        title: 'SEO i treści',
        role: 'Widoczność, która zostaje',
        desc: 'Techniczne SEO, treści eksperckie i profil linków. Bez obiecywania pozycji — z pomiarem widoczności i ruchu.',
        features: ['Audyt techniczny', 'Treści eksperckie', 'Link building'],
        path: '/marketing/seo/',
      },
      {
        id: 'analytics',
        title: 'Analityka',
        role: 'Wiesz, co zarabia',
        desc: 'GA4, śledzenie konwersji i dashboard w Looker Studio. To na tej warstwie stoi każda decyzja o budżecie.',
        features: ['GA4 i GTM', 'Consent Mode v2', 'Dashboard Looker Studio'],
        path: '/marketing/analytics/',
      },
    ],
  },
  faqs: [
    {
      q: 'Jak szybko zobaczę efekty kampanii?',
      a: 'W Google Ads i Meta Ads pierwsze dane (ruch, zapytania) widać w ciągu kilku dni od startu. Stabilizacja kosztów i pełna optymalizacja to zwykle 1–3 miesiące. SEO to proces długofalowy — realnie 3–6 miesięcy do pierwszych mierzalnych ruchów.',
    },
    {
      q: 'Jaki budżet reklamowy jest potrzebny na start?',
      a: 'Rekomendujemy budżet mediowy od około 2 000–3 000 zł miesięcznie — poniżej tej kwoty algorytmy reklamowe mają za mało danych, żeby się uczyć, i optymalizacja jest utrudniona. Budżet mediowy płacisz bezpośrednio do Google/Meta, osobno od naszego wynagrodzenia.',
    },
    {
      q: 'Czy obsługujecie sklepy internetowe?',
      a: 'Tak. Integrujemy katalogi produktów (Google Merchant Center, katalog Meta), wdrażamy śledzenie e-commerce i optymalizujemy kampanie pod zwrot z wydatków reklamowych.',
    },
    {
      q: 'Jak wygląda raportowanie?',
      a: 'Dostajesz dostęp do dashboardu (Looker Studio) z wynikami 24/7 — patrzysz na te same liczby co my. Raz w miesiącu spotykamy się, omawiamy wyniki i plan na kolejny okres.',
    },
    {
      q: 'Co się dzieje z kontem reklamowym, gdy kończymy współpracę?',
      a: 'Konto reklamowe i konto analityczne są zakładane na Twoją firmę i zostają u Ciebie — z całą historią i danymi, na których uczyły się algorytmy. Nie trzymamy klientów zakładnikami dostępów.',
    },
  ],
  cta: {
    title: 'Nie wiesz, od czego zacząć?',
    description:
      'Umów się na 15-minutową rozmowę. Powiemy Ci wprost, co w Twojej sytuacji ma sens, a co byłoby stratą pieniędzy — nawet jeśli oznacza to, że na razie nic u nas nie kupisz.',
    button: 'Umów darmową konsultację',
  },
};
