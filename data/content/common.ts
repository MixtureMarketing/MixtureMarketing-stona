import { SITE_CONFIG } from '../../config/site';
import { DICTIONARY } from '../dictionary';

export const HERO_CONTENT = {
  badge: 'Partner Strategiczny dla Biznesu',
  title: {
    line1: 'Nie szukaj',
    line2: 'wykonawców.',
    line3: 'Wybierz Partnera',
  },
  description:
    "Łączymy inżynierską precyzję Software House'u z kreatywnością Agencji Marketingowej.",
  cta: {
    primary: DICTIONARY.cta.consultation,
    secondary: DICTIONARY.cta.offer,
  },
  microCopy: {
    responseTime: DICTIONARY.labels.responseTime,
    noObligation: DICTIONARY.labels.noObligation,
  },
  visuals: {
    codeSnippet: {
      comment: '// Odzyskujemy 30% danych',
      strategy: 'Smart Scaling',
      status: 'Ready',
    },
  },
};

export const NAVBAR_CONTENT = {
  about: DICTIONARY.labels.about,
  portfolio: DICTIONARY.labels.portfolio,
  contact: DICTIONARY.labels.contact,
  pricing: DICTIONARY.labels.pricing,
  offer: {
    label: 'Oferta',
    title: 'Zbudujmy coś',
    accent: 'wyjątkowego.',
    desc: 'Opowiedz nam o swoim pomyśle. Pomożemy dobrać technologię i przygotujemy bezpłatną wycenę.',
    button: DICTIONARY.cta.book,
    features: ['Analiza techniczna', 'Dobór kanałów Ads', 'Plan wdrożenia'],
    badge: 'Rozmowa Strategiczna',
  },
  knowledgeBase: {
    label: DICTIONARY.labels.knowledgeBase,
    badge: 'Wyróżnione artykuły',
    all: 'Zobacz całą bazę',
    readMore: DICTIONARY.cta.readMore,
  },
  mobileMenu: {
    question: 'Masz pytanie?',
    cta: DICTIONARY.cta.consultation,
    seeAll: 'Zobacz całą ofertę',
  },
  megaMenu: [
    {
      category: 'Web Development',
      description: 'Fundament Twojego biznesu.',
      items: [
        { label: 'Landing Page', desc: 'Kampanie & Konwersja' },
        { label: 'Strona Firmowa', desc: 'Wizerunek B2B' },
        { label: 'Sklep Internetowy', desc: 'E-commerce' },
        { label: 'Systemy Dedykowane', desc: 'Web Apps & SaaS' },
      ],
    },
    {
      category: 'Marketing Cyfrowy',
      description: 'Ruch i sprzedaż.',
      items: [
        { label: 'Google Ads', desc: 'Kampanie Search & SEM' },
        { label: 'Meta Ads', desc: 'Facebook & Instagram' },
        { label: 'SEO & Content', desc: 'Ruch Organiczny' },
        { label: 'Analityka', desc: 'GA4 & Audyty' },
      ],
    },
    {
      category: 'Grafika & Design',
      description: 'Wizerunek i zaufanie.',
      items: [
        { label: 'Branding', desc: 'Logo & Księgi Znaku' },
        { label: 'UI/UX Design', desc: 'Makiety Stron' },
        { label: 'Materiały Druk', desc: 'Wizytówki & Oferty' },
        { label: 'Audyt Wizualny', desc: 'Analiza UX' },
      ],
    },
  ],
};

export const FOOTER_CONTENT = {
  about:
    'Łączymy inżynierską precyzję z kreatywną wizją. Projektujemy systemy, które skalują biznesy naszych klientów.',
  columns: {
    offer: {
      title: 'Oferta',
      links: [
        { label: 'Web Development', path: '/web-development/' },
        { label: 'Google Ads', path: '/marketing/google-ads/' },
        { label: 'Meta Ads', path: '/marketing/meta-ads/' },
        { label: 'Audyt SEO', path: '/marketing/seo/' },
        { label: 'Branding', path: '/design/branding/' },
      ],
    },
    company: {
      title: 'Firma',
      links: [
        { label: DICTIONARY.labels.about, path: 'about', type: 'scroll' },
        { label: DICTIONARY.labels.portfolio, path: '/portfolio/' },
        { label: DICTIONARY.labels.knowledgeBase, path: '/baza-wiedzy/' },
        { label: 'Kariera', path: '/contact/' },
        { label: 'Prywatność', path: '/privacy-policy/' },
        { label: 'Regulamin', path: '/terms/' },
      ],
    },
    community: {
      title: 'Społeczność',
    },
  },
  trustBox: {
    badge: 'Verified Partner',
    text: 'Jesteśmy gotowi do Twojego kolejnego projektu. Skontaktuj się z nami dziś.',
    cta: 'Napisz do nas',
  },
  bottom: {
    copy: 'Designed with Precision',
  },
};

export const TERMS_CONTENT = {
  seo: {
    title: 'Regulamin Serwisu | Mixture Marketing',
    description:
      'Zasady korzystania z serwisu mixturemarketing.pl oraz świadczenia usług drogą elektroniczną.',
    image: '/assets/images/sygnet.png',
  },
  header: {
    title: 'Regulamin Serwisu',
    subtitle:
      'Zasady korzystania ze strony mixturemarketing.pl oraz świadczenia usług drogą elektroniczną.',
  },
  sections: {
    general: {
      title: '1. Postanowienia Ogólne',
      content: [
        `Właścicielem serwisu dostępnego pod adresem <strong>mixturemarketing.pl</strong> (dalej: "Serwis") jest spółka <strong>Mixture Marketing Sp. z o.o.</strong> z siedzibą w Rzeszowie (35-074), Al. Józefa Piłsudskiego 17/4, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego, NIP: ${SITE_CONFIG.contact.vatID} (dalej: "Usługodawca").`,
        `Pytania dotyczące Regulaminu prosimy kierować na adres: <strong>${SITE_CONFIG.contact.email}</strong> lub telefonicznie pod numerem: <strong>${SITE_CONFIG.contact.phone}</strong>.`,
      ],
    },
    services: {
      title: '2. Rodzaje i zakres usług',
      intro: 'Usługodawca świadczy usługi drogą elektroniczną polegające na:',
      list: [
        {
          bold: 'Prezentacji oferty:',
          text: 'Udostępnianie informacji o usługach web developmentu, marketingu i brandingu.',
        },
        {
          bold: 'Formularzu interaktywnym:',
          text: 'Umożliwienie wysyłania zapytań ofertowych i załączników.',
        },
        {
          bold: 'Bazie wiedzy:',
          text: 'Udostępnianie darmowych artykułów i materiałów edukacyjnych (Lead Magnets).',
        },
      ],
      outro:
        'Korzystanie z Serwisu jest dobrowolne i całkowicie bezpłatne. Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą wejścia na stronę i wygasa z chwilą jej opuszczenia.',
    },
    userObligations: {
      title: '3. Obowiązki Użytkownika',
      intro:
        'Użytkownik zobowiązany jest do korzystania z Serwisu w sposób zgodny z prawem i dobrymi obyczajami. Zabronione jest w szczególności:',
      list: [
        'Dostarczanie treści o charakterze bezprawnym (np. obraźliwych, naruszających dobra osobiste).',
        'Podejmowanie działań mogących zakłócić pracę infrastruktury technicznej (ataki DDoS, boty).',
        'Wykorzystywanie Serwisu do rozsyłania niezamówionej informacji handlowej (SPAM).',
      ],
    },
    technical: {
      title: '4. Wymagania Techniczne',
      intro: 'Do poprawnej współpracy z systemem teleinformatycznym Usługodawcy niezbędne jest:',
      grid: [
        [
          '- Połączenie z siecią Internet',
          '- Przeglądarka wspierająca HTML5',
          '- Włączone Cookies i JavaScript',
        ],
        ['- Minimalna rozdzielczość: 360px', '- Aktywne konto e-mail (do kontaktu)'],
      ],
    },
    complaints: {
      title: '5. Reklamacje i Rekonstrukcja',
      intro: `Reklamacje dotyczące usług świadczonych drogą elektroniczną można zgłaszać drogą e-mailową na adres: <strong>${SITE_CONFIG.contact.email}</strong>.`,
      steps: [
        '1. Zgłoszenie powinno zawierać opis problemu oraz datę jego wystąpienia.',
        '2. Usługodawca rozpatrzy reklamację w terminie <strong>14 dni kalendarzowych</strong>.',
        '3. Odpowiedź zostanie przesłana na adres e-mail Użytkownika.',
      ],
    },
    ip: {
      title: '6. Własność Intelektualna',
      text: 'Wszystkie treści zamieszczone w Serwisie (teksty, grafiki, kod źródłowy, logotypy) stanowią przedmiot praw autorskich przysługujących Usługodawcy i podlegają ochronie prawnej. Kopiowanie lub rozpowszechnianie materiałów bez pisemnej zgody jest zabronione.',
    },
    disputes: {
      title: '7. Pozasądowe Rozwiązywanie Sporów',
      text: 'Konsument ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń. Szczegółowe informacje dostępne są w siedzibach oraz na stronach internetowych powiatowych rzeczników konsumentów. Możesz także skorzystać z unijnej platformy ODR dostępnej pod adresem:',
      link: {
        href: 'http://ec.europa.eu/consumers/odr/',
        label: 'http://ec.europa.eu/consumers/odr/',
      },
    },
  },
  footer: {
    omnibus: 'Regulamin zgodny z dyrektywą Omnibus',
  },
};

export const PRIVACY_POLICY_CONTENT = {
  seo: {
    title: 'Polityka Prywatności | Mixture Marketing',
    description:
      'Dowiedz się, jak chronimy i przetwarzamy Twoje dane osobowe zgodnie z RODO (GDPR).',
    image: '/assets/images/sygnet.png',
  },
  header: {
    title: 'Polityka Prywatności i Cookies',
    subtitle:
      'Zasady przetwarzania danych osobowych oraz wykorzystywania plików cookies w serwisie mixturemarketing.pl',
  },
  admin: {
    title: '1. Administrator Danych',
    content: [
      `Administratorem danych osobowych zbieranych za pośrednictwem serwisu jest <strong>Mixture Marketing Sp. z o.o.</strong> z siedzibą w Rzeszowie, przy Al. Józefa Piłsudskiego 17/4, 35-074 Rzeszów, NIP: ${SITE_CONFIG.contact.vatID} (dalej: "Administrator").`,
      `W sprawach dotyczących ochrony danych osobowych możesz skontaktować się z nami pod adresem e-mail: <strong>${SITE_CONFIG.contact.email}</strong>.`,
    ],
  },
  purpose: {
    title: '2. Podstawa i cel przetwarzania',
    intro:
      'Twoje dane przetwarzane są zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO) w celach:',
    cards: [
      {
        title: 'Kontakt i oferta',
        desc: 'Udzielenie odpowiedzi na zapytanie oraz przygotowanie oferty (Art. 6 ust. 1 lit. b oraz f RODO).',
      },
      {
        title: 'Analityka i statystyka',
        desc: 'Monitorowanie ruchu w celu optymalizacji UX serwisu (Art. 6 ust. 1 lit. a RODO - zgoda).',
      },
      {
        title: 'Marketing własny',
        desc: 'Promowanie usług Administratora (Art. 6 ust. 1 lit. f RODO).',
      },
      {
        title: 'Bezpieczeństwo',
        desc: 'Ochrona przed atakami i nielegalnym wykorzystaniem serwisu.',
      },
    ],
  },
  data: {
    title: '3. Rodzaje danych i retencja',
    intro: 'Przetwarzamy dane dobrowolnie podane w formularzach:',
    list: [
      'Imię i nazwisko (lub nazwa firmy).',
      'Adres e-mail oraz numer telefonu.',
      'Treść zapytania oraz szczegóły techniczne projektu.',
    ],
    retention: {
      title: 'Okres przechowywania:',
      text: 'Dane kontaktowe przechowujemy przez okres trwania korespondencji, a następnie do czasu przedawnienia ewentualnych roszczeń (zazwyczaj 3-6 lat) lub do momentu wycofania przez Ciebie zgody.',
    },
  },
  cookies: {
    title: '4. Cookies i technologie śledzące',
    intro:
      'Serwis wykorzystuje pliki cookies (ciasteczka) oraz narzędzia zewnętrzne (Google Analytics 4, Meta Pixel, Conversions API).',
    boxes: [
      {
        title: 'Consent Mode v2',
        text: 'Stosujemy zaawansowany tryb uzyskiwania zgody. Narzędzia analityczne i marketingowe są blokowane do momentu podjęcia przez Ciebie decyzji w banerze cookies.',
        color: 'blue',
      },
      {
        title: 'Server-Side Tracking',
        text: 'W celach precyzyjnej analityki korzystamy z Conversions API (CAPI), przesyłając dane bezpośrednio z naszego serwera do systemów reklamowych (Meta/Google), co zwiększa prywatność Twojej przeglądarki.',
        color: 'pink',
      },
    ],
  },
  rights: {
    title: '5. Prawa Użytkownika',
    intro: 'Zgodnie z RODO przysługuje Ci prawo do:',
    list: [
      'Dostęp do swoich danych',
      'Sprostowanie danych',
      'Usunięcie (bycie zapomnianym)',
      'Ograniczenie przetwarzania',
      'Przenoszenie danych',
      'Wniesienie sprzeciwu',
    ],
    complaint:
      'Masz również prawo wniesienia skargi do organu nadzorczego: <strong>Prezes Urzędu Ochrony Danych Osobowych</strong>, ul. Stawki 2, 00-193 Warszawa.',
  },
  transfer: {
    title: '6. Przekazywanie danych (EOG)',
    text: 'Twoje dane osobowe mogą być przekazywane poza Europejski Obszar Gospodarcie (EOG) w związku z korzystaniem z narzędzi firmy Google LLC oraz Meta Platforms, Inc. Przekazywanie to odbywa się w oparciu o Standardowe Klauzule Umowne lub inne mechanizmy zgodne z decyzjami Komisji Europejskiej.',
  },
  footer: {
    version: 'Ver. 2025.1.0',
  },
};
