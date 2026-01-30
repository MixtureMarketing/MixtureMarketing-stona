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
