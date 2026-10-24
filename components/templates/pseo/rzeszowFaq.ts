/**
 * FAQ strony /miasto/rzeszow/ — JEDNO źródło dla widocznej sekcji (PseoLocationContent)
 * i schemy FAQPage (PseoTemplate → Seo `faq`). Wcześniej były to dwie ręczne kopie:
 * schema miała 6 pytań z innym brzmieniem odpowiedzi (i zdaniami, których nie było na
 * stronie), widoczna sekcja 8 — a Google wymaga, by treść FAQPage była widoczna.
 */
export interface RzeszowFaqItem {
  question: string;
  answer: string;
  /** Zdanie zakończone linkiem: `${prefix} <Link to={to}>{label}</Link>.` */
  link?: { prefix: string; to: string; label: string };
}

export const RZESZOW_FAQ: readonly RzeszowFaqItem[] = [
  {
    question: 'Czy oferujecie spotkania na żywo w Rzeszowie?',
    answer:
      'Tak. Preferujemy spotkania u klienta — dojeżdżamy na terenie Rzeszowa i całego Podkarpacia bez dodatkowych opłat. Alternatywnie ustalamy spotkanie w kawiarni lub przestrzeni coworkingowej w centrum miasta, albo online.',
  },
  {
    question: 'Czy obsługujecie firmy spoza Rzeszowa, z całego Podkarpacia?',
    answer:
      'Tak. Współpracujemy z klientami z Mielca, Krosna, Stalowej Woli, Przemyśla, Dębicy i Jasła — zarówno zdalnie, jak i z dojazdem do siedziby klienta przy większych projektach.',
  },
  {
    question: 'Jak wygląda pierwsza konsultacja?',
    answer:
      'Bezpłatna rozmowa 45–60 minut — online (Google Meet / Zoom), u Ciebie w siedzibie albo w neutralnej lokalizacji w centrum Rzeszowa. Omawiamy cele biznesowe, sytuację rynkową i wybieramy najwłaściwszy zakres współpracy — bez zobowiązań i bez sztywnej oferty na siłę.',
  },
  {
    question: 'Czy macie portfolio z lokalnymi klientami z Rzeszowa i okolic?',
    answer:
      "Tak. Realizowaliśmy projekty dla firm produkcyjnych z Mielca i Stalowej Woli, e-commerce z Rzeszowa oraz software house'ów z Podkarpacia. Część realizacji jest objęta NDA — szczegóły omawiamy podczas spotkania.",
  },
  {
    question: 'Czy świadczycie usługi pozycjonowania SEO w Rzeszowie?',
    answer:
      'Tak. Pełna oferta lokalnego SEO — od audytu technicznego, przez optymalizację on-page, po link building i Local Pack.',
    link: {
      prefix: 'Szczegóły na stronie',
      to: '/agencja-seo-rzeszow/',
      label: 'pozycjonowanie stron w Rzeszowie',
    },
  },
  {
    question: 'Tworzycie strony internetowe dla firm z Rzeszowa?',
    answer:
      "Tak — landing page'e, strony korporacyjne, sklepy e-commerce i dedykowane aplikacje webowe.",
    link: {
      prefix: 'Wycena widełkowa i harmonogram na stronie',
      to: '/web-development/rzeszow/',
      label: 'tworzenie stron internetowych Rzeszów',
    },
  },
  {
    question: 'Jak wybrać agencję marketingową w Rzeszowie?',
    answer:
      'Wybierając agencję marketingową w Rzeszowie, sprawdź: (1) czy oferuje spotkania na żywo na terenie miasta (u klienta lub w neutralnej lokalizacji), (2) czy posiada portfolio z lokalnymi klientami z Podkarpacia, (3) czy łączy kompetencje web development i performance marketing (Google Ads + SEO) pod jednym dachem, (4) czy podaje widełkowy cennik bez ukrytych kosztów, (5) czy oferuje bezpłatną konsultację. Mixture Marketing spełnia wszystkie kryteria — model pracy oparty na dojeździe do klienta na terenie Rzeszowa i Podkarpacia, portfolio m.in. z Mielca i Stalowej Woli, wycena widełkowa od pierwszego maila.',
  },
  {
    question: 'Ile kosztuje strona internetowa w Rzeszowie?',
    answer:
      'Widełki cenowe Mixture: landing page od 3 900 zł, strona korporacyjna z CMS od 7 500 zł, sklep internetowy od 12 000 zł, dedykowana aplikacja webowa od 25 000 zł.',
    link: {
      prefix: 'Pełen cennik 2026 na stronie',
      to: '/web-development/rzeszow/',
      label: 'strony internetowe Rzeszów',
    },
  },
];

/** Odpowiedź jako czysty tekst — dokładnie to, co widać na stronie (dla schemy FAQPage). */
export const rzeszowFaqAnswerText = ({ answer, link }: RzeszowFaqItem): string =>
  link ? `${answer} ${link.prefix} ${link.label}.` : answer;

export const RZESZOW_FAQ_SCHEMA = RZESZOW_FAQ.map((item) => ({
  question: item.question,
  answer: rzeszowFaqAnswerText(item),
}));
