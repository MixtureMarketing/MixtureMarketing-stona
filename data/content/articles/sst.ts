/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SST_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Analityka & Dane',
    title: {
      line1: 'Koniec Ery Cookies?',
      line2: 'Server-Side Tracking.',
    },
    subtitle: 'Odzyskaj 30% przychodów, których Twój Pixel już nie widzi przez iOS i AdBlocki.',
  },
  lead: {
    highlight:
      'Wydajesz budżet na reklamy w Meta i Google Ads. Panel pokazuje ROAS 400%, ale Twój system sklepowy widzi znacznie więcej zamówień. <strong>Gdzie podziały się dane w systemach reklamowych?</strong> Zostały zablokowane.',
    text1:
      'W 2025 roku opieranie analityki wyłącznie na przeglądarce użytkownika (Client-Side) to strategia dziurawa jak sito. Safari (ITP), Firefox, aktualizacje iOS 17+ oraz wszechobecne AdBlocki sprawiają, że tradycyjny Pixel traci nawet <strong>30-40% danych o konwersjach</strong>.',
    text2:
      'Dla algorytmów reklamowych brak danych to śmierć. Dla Ciebie – przepalony budżet. Rozwiązaniem jest <strong>Server-Side Tracking (SST)</strong>.',
  },
  whyBlind: {
    title: 'Dlaczego Twój Pixel "ślepnie"?',
    subtitle: 'Problemy z Cookies',
    text: 'Tradycyjne śledzenie polega na tym, że przeglądarka wysyła informacje do Facebooka czy Google. To działało świetnie, dopóki giganci technologiczni nie wypowiedzieli wojny "ciasteczkom śledzącym" (Third-Party Cookies).',
    items: [
      { title: 'iOS 17+', desc: 'Apple usuwa parametry śledzące (GCLID, FBCLID) z linków.' },
      { title: 'AdBlocki', desc: 'Blokują skrypty śledzące zanim w ogóle się załadują.' },
      { title: 'ITP/ETP', desc: 'Safari i Firefox skracają żywotność ciasteczek do 24h.' },
    ],
  },
  solution: {
    title: 'Rozwiązanie: Server-Side Tracking',
    subtitle: 'Nowoczesna Architektura',
    text: 'SST przenosi ciężar śledzenia z urządzenia użytkownika na Twój własny, bezpieczny serwer (np. GTM Server-Side). Dane nie lecą bezpośrednio do gigantów, ale przechodzą przez "filtr" na Twoim zapleczu.',
    bar: {
      title: 'Analogia Baru',
      client:
        'To jak krzyczenie do kolegi w tłocznym barze. Kelner (AdBlock) może Cię uciszyć, a hałas zagłuszyć wiadomość.',
      server:
        'To rozmowa przez prywatną linię telefoniczną na zapleczu. Nikt jej nie przerywa, sygnał jest krystalicznie czysty.',
    },
  },
  techs: {
    title: 'CAPI i Enhanced Conversions',
    subtitle: 'Kluczowe Technologie',
    text: 'Jako Software House nie instalujemy tylko "wtyczek". Budujemy infrastrukturę danych opartą o dwa filary:',
    items: [
      {
        title: '1. Meta Conversion API (CAPI)',
        desc: 'To "tylne wejście" do Facebooka. Twój serwer wysyła sygnał bezpośrednio do Meta, omijając blokady przeglądarek.',
        badges: ['Odzyskiwanie iOS', 'Advanced Matching'],
      },
      {
        title: '2. Google Ads Enhanced Conversions',
        desc: 'Wysyła zahaszowane (SHA-256) dane użytkownika w momencie konwersji, co pozwala Google "połączyć kropki" nawet bez ciastek.',
        badges: ['Lepsze YouTube Ads', 'Prywatność 1st Party'],
      },
    ],
  },
  caseStudy: {
    badge: 'Case Study: Branża Fashion',
    title: 'Odzyskiwanie "niewidzialnych" zamówień',
    before: {
      title: 'Stan przed wdrożeniem',
      backend: '1000 zamówień',
      meta: '650 zamówień',
      gap: '35% luki w danych',
      label: 'Algorytmy działały na oślep',
    },
    after: {
      title: 'Efekt po 30 dniach',
      matchRate: '9/10',
      attribution: '+22%',
      roas: '+15%',
    },
  },
  whySoftwareHouse: {
    title: 'Dlaczego Software House?',
    subtitle: 'DevOps + Data Engineering',
    text: 'Wdrożenie SST to zadanie z pogranicza programowania i zarządzania infrastrukturą, a nie marketingu. Wymaga:',
    items: [
      { title: 'Chmura', desc: 'Konfiguracja kontenerów na Google Cloud (GCP) lub AWS.' },
      { title: 'DNS', desc: 'Zarządzanie rekordami domen (First-Party Context).' },
      { title: 'Backend', desc: 'Pisanie Data Layer po stronie kodu Twojego sklepu.' },
    ],
    quote:
      '"Agencje marketingowe świetnie ustawiają reklamy. My budujemy autostradę, po której te reklamy mogą bezpiecznie pędzić."',
  },
  cta: {
    title: 'Naprawmy Twoją analitykę.',
    text: 'Podejrzewasz, że tracisz dane? Przeprowadzimy bezpłatny audyt Twojego Pixela i wdrożymy profesjonalny Server-Side Tracking.',
    primaryBtn: 'Umów Konsultację Techniczną',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
