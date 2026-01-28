/* eslint-disable @typescript-eslint/no-unused-vars */

import { SITE_CONFIG } from '../../../config/site';

export const WHY_US_CONTENT = {
  subtitle: 'Dlaczego My?',
  title: 'Przewaga oparta na danych',
  description:
    'Nie jesteśmy kolejną agencją, która znika po wystawieniu faktury. Łączymy inżynierską precyzję z kreatywnością agencji reklamowej.',
  items: [
    {
      title: 'Technologia High-End',
      desc: 'Nie używamy przestarzałych rozwiązań. Wdrażamy Next.js, React i nowoczesny WordPress. Twoja strona będzie szybka jak aplikacja natywna.',
    },
    {
      title: 'Strategia 360°',
      desc: 'Jeden partner od wszystkiego. Projektujemy stronę z myślą o marketingu, a reklamy z myślą o stronie. Koniec z przerzucaniem się winą między agencjami.',
    },
    {
      title: 'Kultura Wyniku',
      desc: 'Nie raportujemy pustych zasięgów. Liczy się ROI, ROAS i liczba leadów. Jeśli coś nie zarabia, zmieniamy strategię, dopóki nie dowieziemy wyniku.',
    },
  ],
};

export const CLIENTS_CONTENT = {
  badge: 'Realne Wyniki',
  title: 'Nie wierz nam na słowo.',
  description:
    'Wierz liczbom. Oto przykłady problemów, które rozwiązaliśmy dla naszych partnerów biznesowych.',
  labels: {
    challenge: 'Wyzwanie',
    solution: 'Rozwiązanie',
    trusted: 'Zaufali nam',
  },
  testimonials: [
    {
      author: 'Michał K.',
      role: 'CEO, Branża Fashion',
      company: 'ModaPremium',
      challenge: 'Wysoki koszt pozyskania klienta (CAC) i niska powracalność.',
      solution:
        'Wdrożenie lejków sprzedażowych w Meta Ads + automatyzacja mailowa odzyskująca koszyki.',
      result: 'ROAS 1250%',
      resultDesc: 'Zwrot z nakładów reklamowych',
      quote:
        'Mixture Marketing to nie tylko agencja, to analitycy. Przestaliśmy przepalać budżet na przypadkowe działania. Liczby mówią same za siebie.',
    },
    {
      author: 'Anna Z.',
      role: 'Marketing Director',
      company: 'SolarSystem OZE',
      challenge: 'Dużo zapytań niskiej jakości (spam), handlowcy tracili czas.',
      solution:
        "Przebudowa Landing Page'a i precyzyjne targetowanie w Google Ads na słowa intencyjne.",
      result: '+40% Leadów',
      resultDesc: 'Wzrost kwalifikowanych zapytań',
      quote:
        'W końcu otrzymujemy zapytania od klientów, którzy faktycznie chcą kupić instalację, a nie tylko pytają o cenę. Jakość leadów wzrosła drastycznie.',
    },
    {
      author: 'Tomasz W.',
      role: 'Founder',
      company: 'Logistics SaaS',
      challenge:
        'Skomplikowany interfejs aplikacji powodował rezygnację użytkowników po okresie próbnym.',
      solution:
        'Kompletny redesign UX/UI skupiony na onboardingu i uproszczeniu kluczowych procesów.',
      result: '-25% Churn',
      resultDesc: 'Spadek rezygnacji klientów',
    },
  ],
};

export const OFFERS_CONTENT = {
  web: {
    startup: {
      badge: 'Szybki Start & MVP',
      title: 'Strony WWW & E-commerce',
      desc: 'Potrzebujesz szybko zaistnieć w sieci? Tworzymy wydajne strony na WordPress i sklepy, które sprzedają od pierwszego dnia. Idealne rozwiązanie na start, z możliwością późniejszej rozbudowy.',
      features: [
        'Strony Wizytówki (WordPress)',
        'Sklepy WooCommerce',
        'Optymalizacja Szybkości',
        'Podstawowe SEO',
      ],
      stat: { label: 'Czas wdrożenia', value: '2-4 Tygodnie' },
      modules: ['Design UX/UI', 'CMS Setup', 'RWD Mobile', 'SEO Basic'],
    },
    enterprise: {
      badge: 'Skalowalność & Bezpieczeństwo',
      title: 'Dedykowane Systemy & SaaS',
      desc: 'Rozwiązania dla liderów rynku. Projektujemy zaawansowane aplikacje webowe (React/Laravel), headless CMS i systemy B2B, które obsługują tysiące użytkowników jednocześnie przy zachowaniu najwyższego bezpieczeństwa.',
      features: [
        'Aplikacje Webowe (React)',
        'Dedykowane Backend (Laravel)',
        'Architektura Mikroserwisów',
        'Audyty Bezpieczeństwa',
      ],
      stat: { label: 'Gwarancja SLA', value: '99.9%' },
      modules: ['Microservices', 'Cloud AWS', 'Load Balancing', 'Security Audit'],
    },
  },
  marketing: {
    startup: {
      badge: 'Wzrost & Trakcja',
      title: 'Kampanie Generujące Sprzedaż',
      desc: 'Każda złotówka się liczy. Skupiamy się na kanałach o najwyższym zwrocie z inwestycji (ROI). Uruchamiamy precyzyjne kampanie Google Ads i Meta Ads, aby sprowadzić pierwszych płacących klientów.',
      features: [
        'Google Ads (Search)',
        'Facebook Lead Ads',
        'Konfiguracja Analityki',
        'Remarketing',
      ],
      stat: { label: 'Średni ROAS', value: '650%' },
      widgets: { budget: '2k - 10k', metric: 'Sales Focused' },
    },
    enterprise: {
      badge: 'Dominacja & Wizerunek',
      title: 'Strategie Omnichannel',
      desc: 'Kompleksowe zarządzanie budżetami reklamowymi w wielu kanałach. Zaawansowana segmentacja, automatyzacja marketingu i budowanie świadomości marki (Brand Awareness) na dużą skalę.',
      features: [
        'Strategia 360°',
        'Marketing Automation',
        'Kampanie Wideo (YouTube)',
        'Raportowanie BI',
      ],
      stat: { label: 'Obsługa Budżetów', value: '1M+ PLN' },
      widgets: { budget: '50k+', metric: 'Brand & LTV' },
    },
  },
  seo: {
    title: 'Oferta - Web Development, Marketing, Design | Mixture Marketing',
    description:
      'Poznaj pełną ofertę naszej agencji. Specjalizujemy się w web development (strony, sklepy, aplikacje), marketingu cyfrowym (SEO, SEM, Social Media) i brandingu.',
    image: '/assets/images/sygnet.png',
  },
  hero: {
    title: {
      label: 'Technologia',
      highlight: 'dopasowana do skali.',
    },
    subtitle:
      'Niezależnie czy budujesz MVP, czy skalujesz system dla milionów użytkowników – dostarczamy architekturę i marketing adekwatne do Twoich celów.',
    buttons: {
      startup: {
        title: 'Start-Up / MVP',
        subtitle: 'Szybkość & Wzrost',
      },
      enterprise: {
        title: 'Enterprise',
        subtitle: 'Skala & Bezpieczeństwo',
      },
    },
  },
  button: 'Szczegóły Techniczne',
  faq: {
    title: 'Częste pytania',
    items: [
      {
        q: 'Czy po wykonaniu strony będę mógł ją samodzielnie edytować?',
        a: 'Tak. Niezależnie czy wybierzesz WordPress (Startup) czy dedykowany Headless CMS (Enterprise), wdrażamy intuicyjny panel administratora i szkolimy Twój zespół z jego obsługi.',
      },
      {
        q: 'Jak wygląda model rozliczeń w marketingu?',
        a: 'Stawiamy na transparentność. Budżet reklamowy (płatny do Google/Meta) jest oddzielony od naszego wynagrodzenia (prowizja od wydatków lub stała opłata flat fee, zależnie od skali).',
      },
      {
        q: 'Czy podpisujemy umowę o poufności (NDA)?',
        a: 'Oczywiście. Bezpieczeństwo Twoich danych i pomysłów biznesowych to priorytet. Standardowo pracujemy na NDA, szczególnie przy projektach Enterprise.',
      },
      {
        q: 'Co obejmuje darmowa opieka techniczna?',
        a: 'Przez 6 miesięcy po wdrożeniu dbamy o aktualizacje wtyczek, bezpieczeństwo serwera, kopie zapasowe oraz naprawę ewentualnych błędów krytycznych.',
      },
    ],
  },
};

export const SERVICES_CONTENT = {
  title: 'Kompetencje, których potrzebujesz',
  description:
    'Nie jesteśmy agencją od wszystkiego. Specjalizujemy się w trzech kluczowych obszarach, które razem tworzą kompletny ekosystem wzrostu firmy.',
  items: [
    {
      key: 'web',
      path: '/web-development',
      title: 'Web Development',
      subtitle: 'Strony & Sklepy',
      desc: 'Twój biznes online musi być szybki i niezawodny. Budujemy dedykowane strony i sklepy, które nie tylko wyglądają, ale przede wszystkim sprzedają.',
      features: ['Systemy Dedykowane', 'E-commerce (WooCommerce)', 'Optymalizacja Szybkości'],
      button: 'Zobacz Szczegóły',
    },
    {
      key: 'marketing',
      path: '/marketing',
      title: 'Marketing Cyfrowy',
      subtitle: 'Ads & SEO',
      desc: 'Przestań przepalać budżet. Wdrażamy kampanie performance, gdzie liczy się zwrot z inwestycji (ROAS), a nie puste zasięgi.',
      features: ['Google Ads & Meta Ads', 'Analityka (GA4)', 'Strategie Lejkowe'],
      button: 'Zobacz Szczegóły',
    },
    {
      key: 'design',
      path: '/design',
      title: 'Grafika & Design',
      subtitle: 'Branding & UI',
      desc: 'Ludzie kupują oczami. Projektujemy spójną identyfikację wizualną, która buduje zaufanie i wyróżnia Cię na tle konkurencji.',
      features: ['Logo & Księgi Znaku', 'UI/UX Design', 'Materiały Drukowane'],
      button: 'Zobacz Szczegóły',
    },
  ],
};

export const LEAD_MAGNET_CONTENT = {
  badge: 'Darmowa Wartość',
  title: {
    line1: 'Twoja konkurencja',
    line2: 'już Cię wyprzedza?',
  },
  description:
    'Zamów bezpłatny, 15-minutowy audyt techniczny swojej obecnej strony lub kampanii. Znajdziemy "wąskie gardła", przez które tracisz klientów.',
  items: [
    'Analiza szybkości ładowania',
    'Weryfikacja śledzenia konwersji',
    'Sprawdzenie UX / Mobile',
    'Audyt potencjału reklamowego',
  ],
  button: 'Zamów Darmowy Audyt',
  visual: {
    label: 'System Scan v2.0',
    error: {
      title: 'Wykryto krytyczny błąd',
      desc: 'Czas ładowania strony powyżej 4s (Strata ~25% konwersji).',
    },
    growth: {
      title: 'Potencjał wzrostu',
      desc: 'Optymalizacja Core Web Vitals może zwiększyć ROAS o 15%.',
    },
  },
};

export const AI_GENERATOR_CONTENT = {
  header: {
    badge: 'SYSTEM_READY',
    title: {
      line1: 'Proof of',
      line2: 'Concept.',
    },
    description:
      'Nie wierzysz w obietnice? Sprawdź naszą technologię w akcji. Ten terminal łączy się bezpośrednio z modelem językowym Google Gemini, aby wygenerować kreatywne hasło dla Twojej firmy w czasie rzeczywistym.',
  },
  features: [
    {
      title: 'Real-time Processing',
      desc: 'Generowanie na żywo bez opóźnień cache.',
    },
    {
      title: 'Secure Connection',
      desc: 'Szyfrowane połączenie SSL z API Google.',
    },
    {
      title: 'AI-Powered',
      desc: 'Wykorzystuje model Gemini 2.5 Flash.',
    },
  ],
  terminal: {
    header: 'Neural_Generator_v2.0.exe',
    fields: {
      companyName: '// NAZWA_FIRMY',
      industry: '// BRANŻA',
      tone: '// TON_KOMUNIKACJI',
    },
    placeholders: {
      companyName: 'np. SolarFuture',
      industry: 'np. OZE',
    },
    button: {
      idle: 'EXECUTE_PROTOCOL',
      processing: 'PROCESSING...',
    },
    status: {
      standby: 'System standby. Awaiting input...',
    },
    logs: {
      init: 'Initializing Neural Link v2.5...',
      analyzing: 'Analyzing industry context:',
      calibrating: 'Calibrating tone:',
      connecting: 'Connecting to Gemini API Node...',
      received: 'Response received. Decoding...',
      synthesizing: 'Synthesizing output...',
      error: 'ERROR: Connection failed.',
    },
  },
};
