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
      icon: 'zap',
    },
    {
      title: 'Strategia 360°',
      desc: 'Jeden partner od wszystkiego. Projektujemy stronę z myślą o marketingu, a reklamy z myślą o stronie. Koniec z przerzucaniem się winą między agencjami.',
      icon: 'target',
    },
    {
      title: 'Kultura Wyniku',
      desc: 'Nie raportujemy pustych zasięgów. Liczy się ROI, ROAS i liczba leadów. Jeśli coś nie zarabia, zmieniamy strategię, dopóki nie dowieziemy wyniku.',
      icon: 'chart',
    },
  ],
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
    {
      key: 'saas',
      path: '/abonament',
      title: 'Strona w abonamencie',
      subtitle: 'SaaS · od 179 zł/mc',
      desc: 'Cały pakiet — strona, SEO, leady — w jednej miesięcznej cenie. Idealne dla mikrofirm które nie chcą inwestować jednorazowo 10 tys. zł.',
      features: [
        'Strona + hosting w cenie',
        'Local SEO + GBP synced',
        'Leady na telefon (SMS 30s)',
      ],
      button: 'Zobacz pakiety',
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
