/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const EDGE_COMPUTING_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Future Tech',
    title: {
      line1: 'Edge Computing: Kod na',
      line2: '"krańcu świata".',
    },
    subtitle:
      'Przez dekadę rządzili giganci chmurowi. Dziś prawa fizyki mówią "sprawdzam". Zobacz, jak przetwarzanie brzegowe rewolucjonizuje IoT, Gaming i AI.',
  },
  analogy: {
    title: 'Chmura vs Edge: Analogia Pizzerii',
    cloud: {
      title: 'Model Cloud (Centralny)',
      desc: 'Jedna gigantyczna pizzeria w Warszawie. Nieważne gdzie mieszkasz, pizza jedzie z centrali. Dociera zimna, po 4 godzinach.',
    },
    edge: {
      title: 'Model Edge (Brzegowy)',
      desc: 'Sieć małych lokali w każdej dzielnicy. Pizza jest pieczona 500m od Twojego domu. Masz ją w 10 minut, gorącą.',
    },
  },
  whatIs: {
    title: 'Czym jest Edge Computing?',
    subtitle: 'Definicja i Filozofia',
    text: 'Edge Computing to paradygmat, w którym obliczenia odbywają się <strong>jak najbliżej źródła danych</strong> – użytkownika, kamery, czujnika w fabryce – zamiast w odległej chmurze. To układ nerwowy Internetu Rzeczy (IoT).',
  },
  architecture: {
    title: 'Trójwarstwowa Architektura Przyszłości',
  },
  safety: {
    title: 'Gdy milisekundy ratują życie',
    subtitle: 'Krytyczne Opóźnienia',
    text: 'W świecie autonomicznych pojazdów czy robotyki medycznej, standardowe opóźnienie chmury (100-200ms) to wieczność. Przy prędkości 100 km/h, samochód przejeżdża prawie 6 metrów, zanim chmura zdąży odpowiedzieć "hamuj". Zobacz różnicę:',
  },
  benefits: {
    title: 'Dlaczego biznes potrzebuje Edge?',
    subtitle: 'Kluczowe Korzyści',
    items: [
      {
        title: 'Ultra-niskie opóźnienia',
        desc: 'Autonomiczny samochód nie może czekać na odpowiedź z USA. Edge pozwala na reakcję w czasie poniżej 5ms.',
      },
      {
        title: 'Oszczędność pasma',
        desc: 'Fabryka z 1000 czujników generuje terabajty danych. Edge filtruje je na miejscu, wysyłając do chmury tylko istotne raporty.',
      },
      {
        title: 'Prywatność i RODO',
        desc: 'Dane z kamer monitoringu mogą być analizowane lokalnie. Do chmury trafiają tylko anonimowe statystyki.',
      },
      {
        title: 'Działanie Offline',
        desc: 'Systemy brzegowe mogą podejmować decyzje nawet przy chwilowym braku połączenia z globalną siecią.',
      },
    ],
  },
  funnel: {
    title: 'Opanuj Tsunami Danych',
    subtitle: 'Efektywność Kosztowa',
    text: 'Wysyłanie 100% surowych danych do chmury to marnotrawstwo transferu i pieniędzy. Edge działa jak inteligentny filtr, który przetwarza dane u źródła.',
  },
  useCases: {
    title: 'Gdzie Edge już działa?',
    subtitle: 'Realne Zastosowania',
    items: [
      {
        title: 'Gaming',
        desc: 'Serwery Cloud Gaming (jak Xbox Cloud) muszą być blisko Ciebie, by sterowanie było precyzyjne.',
      },
      {
        title: 'Smart Retail',
        desc: 'Sklepy typu Amazon Go śledzą ruch produktów w czasie rzeczywistym dzięki lokalnej analizie wizji.',
      },
      {
        title: 'Industrie 4.0',
        desc: 'Predictive Maintenance – maszyny same wykrywają awarie na podstawie wibracji, bez pomocy chmury.',
      },
      {
        title: 'Smart CDN',
        desc: 'Personalizacja walut i języka odbywa się na serwerze brzegowym, jeszcze przed załadowaniem strony.',
      },
    ],
  },
  tech: {
    title: 'Tech Corner: Kodowanie na krawędzi',
    subtitle: 'Serverless at Edge',
    text: 'Zamiast całego serwera Node.js, piszesz małe funkcje (np. w Cloudflare Workers), które są replikowane do 200+ lokalizacji w kilka sekund.',
  },
  market: {
    title: 'Rynek Przetwarzania Brzegowego',
    subtitle: 'Prognoza 2018-2028',
    text: 'Według analityków Gartnera, do 2025 roku 75% danych będzie przetwarzanych poza centralną chmurą.',
  },
  summary: {
    title: 'Czy Chmura umiera?',
    text: 'Absolutnie nie! Edge i Cloud to symbioza. <strong>Chmura pozostaje mózgiem</strong> (magazynowanie, trenowanie AI), a <strong>Edge to układ nerwowy i odruchy</strong> (reakcja tu i teraz). Razem tworzą najpotężniejszą infrastrukturę w historii IT.',
  },
  cta: {
    title: 'Zbudujmy system gotowy na przyszłość.',
    text: 'Twoja aplikacja działa za wolno? Planujesz wdrożenie IoT? Pomożemy Ci zaprojektować architekturę hybrydową, która wyprzedzi konkurencję.',
    primaryBtn: 'Porozmawiajmy o architekturze',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
