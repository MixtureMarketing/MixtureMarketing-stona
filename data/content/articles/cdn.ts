/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const CDN_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Infrastruktura & Network',
    title: {
      line1: 'CDN: Jak być "blisko" klienta,',
      line2: 'nawet gdy jest w Australii?',
    },
    subtitle:
      'Wyobraź sobie Internet bez opóźnień. Gdziekolwiek jest Twój klient, Twoja strona ładuje się w mgnieniu oka. To nie magia. To CDN.',
  },
  donut: {
    title: 'Analiza: Problem Pączka',
    text1:
      'Wyobraź sobie, że prowadzisz piekarnię w Warszawie. Twoje pączki są legendarne. Klienci z Krakowa też chcą je jeść. Jeśli wyślesz je kurierem, dotrą zimne i czerstwe po kilku godzinach.',
    text2:
      'Ale co, jeśli otworzysz mały punkt w Krakowie, do którego codziennie rano dostarczasz świeżą partię? Klient dostaje pączka natychmiast, cieplutkiego i pysznego. <strong>W świecie IT CDN to sieć takich "lokalnych punktów dystrybucji".</strong>',
  },
  lastMile: {
    title: 'Problem "Ostatniej Mili"',
    subtitle: 'Geografia vs Prędkość',
    text: 'Światło w światłowodzie jest szybkie, ale pokonanie oceanów zajmuje czas. Każdy "skok" przez router to dodatkowe milisekundy. Zobacz jak CDN skraca dystans między Twoim serwerem a użytkonym.',
  },
  shield: {
    title: 'Tarcza nie do przebicia',
    subtitle: 'Bezpieczeństwo & WAF',
    text: 'CDN to nie tylko szybkość. To pierwsza linia obrony przed atakami DDoS i złośliwymi botami. Dzięki warstwie <strong>WAF (Web Application Firewall)</strong>, ruch jest filtrowany na brzegu sieci, zanim w ogóle dotknie Twojego serwera.',
  },
  imageOpt: {
    title: 'Automatyczna optymalizacja',
    subtitle: 'Image Performance',
    text: 'Zdjęcia stanowią zazwyczaj 60-70% wagi strony. Nowoczesne CDNy potrafią automatycznie konwertować Twoje pliki do formatów takich jak <strong>WebP czy AVIF</strong> w locie, oszczędzając transfer i przyspieszając ładowanie na urządzeniach mobilnych.',
  },
  edge: {
    title: 'Kod na krańcu sieci',
    subtitle: 'Edge Computing',
    text: 'Nowoczesne sieci CDN ewoluowały. Dziś to nie tylko "pudła na pliki", ale potężne platformy obliczeniowe. Dzięki <strong>Edge Computing</strong> możemy uruchamiać logikę aplikacji (np. personalizację, A/B testy, autoryzację) bezpośrednio na serwerze brzegowym.',
    items: [
      'Zerowe opóźnienie w wykonywaniu skryptów.',
      'Odciążenie głównego backendu o kolejne 30-40%.',
      'Błyskawiczna personalizacja treści pod region.',
    ],
  },
  quiz: {
    title: 'Czy potrzebujesz CDN?',
    subtitle: 'Szybka Diagnoza',
    questions: [
      { q: 'Czy masz klientów spoza Polski?', weight: 40 },
      { q: 'Czy Twoja strona zawiera dużo wysokiej jakości zdjęć?', weight: 20 },
      { q: "Czy boisz się ataków DDoS lub 'wykop-efektu'?", weight: 25 },
      { q: 'Czy Twoja konkurencja ma szybciej ładujące się strony?', weight: 15 },
    ],
    result: {
      high: 'CDN jest dla Ciebie krytyczny. Każdy dzień bez tej technologii to strata potencjalnych klientów i gorsze pozycjonowanie w Google.',
      low: 'CDN może pomóc w optymalizacji, ale Twoja obecna infrastruktura radzi sobie nieźle. Warto rozważyć darmowy plan Cloudflare.',
    },
  },
  business: {
    title: '4 Powody Biznesowe',
    subtitle: 'Dlaczego warto?',
    items: [
      {
        title: 'Drastyczna szybkość (UX)',
        desc: 'Walmart odkrył, że każda sekunda optymalizacji ładowania strony zwiększa konwersję o 2%.',
      },
      {
        title: 'Lepsze SEO',
        desc: 'Google mierzy LCP. CDN bezpośrednio poprawia ten wskaźnik, serwując zasoby błyskawicznie.',
      },
      {
        title: 'Oszczędność kosztów',
        desc: 'Mniejsze zużycie CPU i transferu na Origin Server. Nawet do 80% oszczędności.',
      },
      {
        title: 'Ochrona DDoS',
        desc: 'CDN przyjmuje uderzenie miliona zapytań, chroniąc Twoją infrastrukturę przed padem.',
      },
    ],
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Pytania techniczne',
    items: [
      {
        q: 'Czy CDN obsługuje dynamiczne treści?',
        a: 'Tradycyjnie cachuje statykę, ale dzięki Edge Computing może też obsługiwać logikę i dynamiczne odpowiedzi.',
      },
      {
        q: 'Czy wdrożenie jest trudne?',
        a: 'W Cloudflare to tylko zmiana DNS. W AWS CloudFront wymaga to konfiguracji dystrybucji.',
      },
    ],
  },
  cta: {
    title: 'Twoja strona działa wolno?',
    text: 'Pomożemy Ci wdrożyć Cloudflare lub AWS CloudFront i zoptymalizować wydajność Twojego biznesu.',
    primaryBtn: 'Umów bezpłatną konsultację',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
