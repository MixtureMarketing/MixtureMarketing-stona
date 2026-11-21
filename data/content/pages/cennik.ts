/**
 * Treść strony /cennik/ (MIX-1855), za przełącznikiem VITE_MM_CENNIK (config/flags.ts).
 *
 * ŹRÓDŁA CEN: każda kwota poniżej jest już opublikowana na stronie albo w Sanity (pricingSection →
 * packages); tabela „cena → plik:linia / _id dokumentu” jest w docs/tresci/MIX-1855-zrodla-cen.md.
 * Nie dopisujemy tu żadnej ceny, której nie ma na stronie. Bez żadnej oferty w modelu
 * miesięcznym „strony w abonamencie” i bez obietnic wyniku (test: tests/seo/cennikTresc.test.ts).
 */

export interface CennikItem {
  name: string;
  desc: string;
  /** Gotowy tekst ceny, np. „od 2 500 zł netto”. */
  price: string;
}

export interface CennikGroup {
  id: string;
  title: string;
  intro: string;
  items: CennikItem[];
}

export interface CennikFaq {
  q: string;
  a: string;
}

export const CENNIK_PATH = '/cennik/';

export const CENNIK_CONTENT = {
  seo: {
    /** Warianty od najpełniejszego (fitTitle dobiera pierwszy, który mieści się w 60 znakach). */
    title: ['Cennik usług: strony WWW, reklamy, SEO', 'Cennik usług — ceny od', 'Cennik'],
    description:
      'Cennik Mixture Marketing: strony WWW od 2 500 zł netto, Google i Meta Ads od 1 500 zł/mc, SEO od 1 200 zł/mc, design od 800 zł. Ceny od, wycena po rozmowie.',
    image: '/assets/images/sygnet.png',
  },
  hero: {
    title: 'Cennik: ile kosztuje strona, reklama i SEO',
    lead: 'Podajemy widełki „od”, żebyś mógł zaplanować budżet jeszcze przed rozmową. Ostateczną kwotę ustalamy po poznaniu zakresu projektu.',
    cta: 'Poproś o wycenę',
    calculatorCta: 'Policz orientacyjną cenę w kalkulatorze',
  },
  disclaimer:
    'Podane kwoty to ceny „od”, a nie ceny końcowe. Ostateczna wycena zależy od zakresu projektu: liczby podstron, integracji, treści i grafiki.',
  groups: [
    {
      id: 'strony-www',
      title: 'Strony WWW i aplikacje',
      intro: 'Strony, sklepy i aplikacje webowe. Projekty można rozliczać etapami.',
      items: [
        {
          name: 'Landing page',
          desc: 'Strona pod kampanię reklamową, gotowa zwykle w 7–14 dni roboczych.',
          price: 'od 2 500 zł netto',
        },
        {
          name: 'Strona firmowa z CMS',
          desc: 'Strona wizytówkowa lub rozbudowana witryna firmy z panelem do edycji treści.',
          price: 'od 5 500 zł',
        },
        {
          name: 'Sklep internetowy',
          desc: 'WooCommerce, PrestaShop lub rozwiązanie dedykowane, z płatnościami i kurierami.',
          price: 'od 9 500 zł',
        },
        {
          name: 'Portal B2B',
          desc: 'Portal dla klientów biznesowych (B2B).',
          price: 'od 19 000 zł',
        },
        {
          name: 'Aplikacja dedykowana',
          desc: 'Aplikacja webowa budowana pod proces firmy; realizacja od około 3 miesięcy.',
          price: 'od 23 000 zł',
        },
        {
          name: 'Opieka nad stroną po wdrożeniu',
          desc: 'Aktualizacje bezpieczeństwa, monitoring, kopie zapasowe i drobne zmiany treści.',
          price: 'od 290 zł/mies.',
        },
      ],
    },
    {
      id: 'kampanie',
      title: 'Kampanie reklamowe',
      intro:
        'Opłata za prowadzenie kampanii jest osobno od budżetu reklamowego, który płacisz bezpośrednio platformie. Budżety naszych klientów to zwykle 2–10 tys. zł miesięcznie.',
      items: [
        {
          name: 'Google Ads',
          desc: 'Search, Shopping i Performance Max z pulpitem wyników dostępnym na bieżąco. Budżet mediowy zalecamy od około 2 000–3 000 zł miesięcznie.',
          price: 'od 1 500 zł/mc + budżet mediowy',
        },
        {
          name: 'Meta Ads',
          desc: 'Kampanie sprzedażowe i leadowe na Facebooku i Instagramie, z remarketingiem.',
          price: 'od 1 500 zł/mc + budżet mediowy',
        },
      ],
    },
    {
      id: 'seo',
      title: 'Pozycjonowanie (SEO)',
      intro:
        'Zakres zależy od konkurencji w branży i stanu wyjściowego strony. Wyniki są mierzone w Google Search Console.',
      items: [
        {
          name: 'Lokalne SEO',
          desc: 'Jedno miasto, do 10 fraz.',
          price: 'od 1 200 zł/mies.',
        },
        {
          name: 'Ogólnopolskie SEO',
          desc: 'Do 30 fraz w skali kraju.',
          price: 'od 2 500 zł/mies.',
        },
        {
          name: 'SEO dla sklepów',
          desc: 'Sklepy internetowe z asortymentem od 500 pozycji.',
          price: 'od 3 500 zł/mies.',
        },
        {
          name: 'Audyt techniczny SEO',
          desc: 'Jednorazowy audyt strony z listą rekomendacji.',
          price: 'od 1 900 zł',
        },
      ],
    },
    {
      id: 'design',
      title: 'Grafika i design',
      intro: 'Identyfikacja wizualna, projekty interfejsów, druk i audyt wizualny.',
      items: [
        {
          name: 'Materiały drukowane',
          desc: 'Wizytówki, broszury, opakowania; kontrola plików przed drukiem w cenie.',
          price: 'od 800 zł',
        },
        {
          name: 'Logo i brand book',
          desc: 'Logo z księgą marki; pełna identyfikacja wizualna od 8 000 zł.',
          price: 'od 3 500 zł',
        },
        {
          name: 'Projekt UI/UX',
          desc: 'Projekt interfejsu w Figmie z prototypem.',
          price: 'od 2 000 zł',
        },
        {
          name: 'Audyt wizualny',
          desc: 'Ocena spójności marki i interfejsu z konkretnymi rekomendacjami.',
          price: 'od 2 500 zł',
        },
      ],
    },
  ] satisfies CennikGroup[],
  faqTitle: 'Najczęstsze pytania o ceny',
  faqs: [
    {
      q: 'Ile kosztuje strona internetowa?',
      a: 'Landing page kosztuje od 2 500 zł netto, strona firmowa z CMS od 5 500 zł, sklep internetowy od 9 500 zł, a dedykowana aplikacja webowa od 23 000 zł. To ceny „od”: ostateczna kwota zależy od zakresu projektu i jest ustalana po rozmowie.',
    },
    {
      q: 'Od czego zależy cena strony?',
      a: 'Najmocniej wpływają na nią liczba podstron, integracje z zewnętrznymi systemami, przygotowanie treści oraz zakres grafiki. Dlatego ten sam typ strony może mieć różną wycenę.',
    },
    {
      q: 'Czy wycena jest płatna?',
      a: 'Nie. Wycena projektu jest bezpłatna, wystarczy formularz lub telefon. Bezpłatna jest też konsultacja, która trwa 45–60 minut, a wstępne widełki budżetowe przesyłamy w 24 godziny.',
    },
    {
      q: 'Ile kosztują kampanie Google Ads i Meta Ads?',
      a: 'Prowadzenie kampanii Google Ads lub Meta Ads zaczyna się od 1 500 zł miesięcznie. Do tego dochodzi budżet reklamowy płacony platformie; zalecamy start od około 2 000–3 000 zł miesięcznie, żeby algorytmy miały dość danych do nauki.',
    },
    {
      q: 'Ile kosztuje pozycjonowanie strony?',
      a: 'Lokalne SEO (jedno miasto, do 10 fraz) kosztuje od 1 200 zł miesięcznie, ogólnopolskie (do 30 fraz) od 2 500 zł, a SEO sklepu od 3 500 zł. Jednorazowy audyt techniczny to od 1 900 zł. Nie obiecujemy konkretnej pozycji, bo zależy ona od konkurencji i stanu strony.',
    },
    {
      q: 'Ile kosztuje logo i identyfikacja wizualna?',
      a: 'Logo z księgą marki kosztuje od 3 500 zł, a pełna identyfikacja wizualna od 8 000 zł. Projekt interfejsu UI/UX zaczyna się od 2 000 zł, a materiały drukowane od 800 zł.',
    },
    {
      q: 'Czy płacę za projekt jednorazowo?',
      a: 'Projekty stron i aplikacji można rozliczać etapami. Harmonogram płatności omawiamy przed startem prac, razem z harmonogramem realizacji.',
    },
    {
      q: 'Jakie koszty są po wdrożeniu strony?',
      a: 'Opieka nad stroną (aktualizacje bezpieczeństwa, monitoring, kopie zapasowe, drobne zmiany treści) zaczyna się od 290 zł miesięcznie. W sklepie dochodzi hosting, około 100 zł miesięcznie.',
    },
    {
      q: 'Ile trwa realizacja strony internetowej?',
      a: 'Landing page zwykle 7–14 dni roboczych, strona firmowa z CMS 4–8 tygodni, sklep internetowy 6–12 tygodni, a aplikacja dedykowana od około 3 miesięcy. Harmonogram zawsze ustalamy przed startem.',
    },
  ] satisfies CennikFaq[],
  finalCta: {
    title: 'Chcesz poznać cenę swojego projektu?',
    text: 'Opisz, czego potrzebujesz. Wstępne widełki budżetowe wyślemy w 24 godziny.',
    button: 'Poproś o wycenę',
  },
};
