import { FormConfigGroup } from '../types';

export const WEB_FORM_CONFIG: Record<string, FormConfigGroup> = {
  landing: {
    title: 'Szczegóły Landing Page',
    description: 'Landing ma realizować jeden, konkretny cel. Jaki?',
    fields: [
      {
        name: 'goal',
        label: 'Główny cel strony',
        type: 'select',
        options: [
          { value: 'leads', label: 'Pozyskiwanie kontaktów (Lead Gen)' },
          { value: 'sales', label: 'Sprzedaż produktu (Sales Page)' },
          { value: 'event', label: 'Rejestracja na webinar / event' },
          { value: 'app', label: 'Promocja aplikacji mobilnej' },
        ],
      },
      {
        name: 'assets',
        label: 'Materiały (Teksty/Zdjęcia)',
        type: 'select',
        options: [
          { value: 'ready', label: 'Mam gotowe wszystkie materiały' },
          { value: 'copy', label: 'Potrzebuję copywritingu i tekstów' },
          { value: 'mix', label: 'Mam część, resztę zrobimy razem' },
        ],
      },
      {
        name: 'traffic',
        label: 'Planowane źródło ruchu',
        type: 'select',
        options: [
          { value: 'ads', label: 'Płatne kampanie (Google/Meta Ads)' },
          { value: 'social', label: 'Social Media / Mailing' },
          { value: 'seo', label: 'Ruch organiczny (SEO)' },
          { value: 'unknown', label: 'Nie mam jeszcze planu' },
        ],
      },
    ],
  },
  ecommerce: {
    title: 'Parametry Sklepu',
    description: 'Sklep to nie tylko wygląd, to logistyka. Określmy skalę.',
    fields: [
      {
        name: 'scope',
        label: 'Wielkość asortymentu',
        type: 'select',
        options: [
          { value: 'micro', label: 'Do 50 produktów' },
          { value: 'mid', label: '50 - 1000 produktów' },
          { value: 'large', label: '1000+ produktów (Hurtownia)' },
        ],
      },
      {
        name: 'integrations',
        label: 'Kluczowe integracje',
        type: 'select',
        options: [
          { value: 'basic', label: 'Podstawowe (Płatności, Kurier)' },
          { value: 'erp', label: 'System ERP (Subiekt, Comarch, SAP)' },
          { value: 'market', label: 'Baselinker / Allegro / Amazon' },
        ],
      },
      {
        name: 'history',
        label: 'Status projektu',
        type: 'select',
        options: [
          { value: 'new', label: 'Buduję nowy sklep od zera' },
          { value: 'migration', label: 'Migracja (np. z Shoper/SaaS)' },
          { value: 'redesign', label: 'Przebudowa obecnego sklepu' },
        ],
      },
    ],
  },
  corporate: {
    title: 'Serwis Korporacyjny',
    description: 'Strona firmowa to wizytówka i narzędzie rekrutacji.',
    fields: [
      {
        name: 'area',
        label: 'Zasięg terytorialny',
        type: 'select',
        options: [
          { value: 'pl', label: 'Tylko Polska' },
          { value: 'eu', label: 'Europa (EN + inne języki)' },
          { value: 'global', label: 'Globalny (Multilanguage)' },
        ],
      },
      {
        name: 'features',
        label: 'Moduły specjalne',
        type: 'select',
        options: [
          { value: 'none', label: 'Brak (Strona wizerunkowa)' },
          { value: 'hr', label: 'Kariera / Oferty pracy / ATS' },
          { value: 'b2b', label: 'Strefa Partnera (Logowanie)' },
          { value: 'investor', label: 'Relacje Inwestorskie (Giełda)' },
        ],
      },
      {
        name: 'tech',
        label: 'Zarządzanie treścią',
        type: 'select',
        options: [
          { value: 'wordpress', label: 'WordPress (Samodzielna edycja)' },
          { value: 'headless', label: 'Headless CMS (Bezpieczeństwo)' },
          { value: 'support', label: 'Stała opieka agencji' },
        ],
      },
    ],
  },
  custom: {
    title: 'Aplikacja Dedykowana',
    description: 'Software szyty na miarę. Zdefiniujmy ramy projektu.',
    fields: [
      {
        name: 'appStage',
        label: 'Na jakim jesteś etapie?',
        type: 'select',
        options: [
          { value: 'idea', label: 'Mam pomysł i wizję' },
          { value: 'spec', label: 'Mam specyfikację / makiety' },
          { value: 'mvp', label: 'Mam MVP, chcę skalować' },
        ],
      },
      {
        name: 'process',
        label: 'Główny proces do cyfryzacji',
        type: 'select',
        options: [
          { value: 'b2b', label: 'Sprzedaż / Zamówienia B2B' },
          { value: 'internal', label: 'Zarządzanie firmą / pracownikami' },
          { value: 'saas', label: 'Produkt dla klientów (SaaS)' },
        ],
      },
      {
        name: 'budget',
        label: 'Wstępny budżet (Widełki)',
        type: 'select',
        options: [
          { value: 'mvp', label: 'MVP (30k - 60k PLN)' },
          { value: 'growth', label: 'Growth (60k - 150k PLN)' },
          { value: 'enterprise', label: 'Enterprise (150k PLN +)' },
        ],
      },
    ],
  },
};
