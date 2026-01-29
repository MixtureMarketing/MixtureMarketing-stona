import { FormConfigGroup, Step2Content } from './types';
import { ContactType } from '../../../types';

export const FORM_CONFIG: Record<string, FormConfigGroup> = {
  // --- WEB DEVELOPMENT ---
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

  // --- MARKETING ---
  ads: {
    title: 'Kampanie Reklamowe',
    description: 'Efektywny marketing zaczyna się od matematyki.',
    fields: [
      {
        name: 'budget',
        label: 'Miesięczny budżet mediowy (na kliki)',
        type: 'select',
        options: [
          { value: 'start', label: '2 000 - 5 000 PLN' },
          { value: 'growth', label: '5 000 - 15 000 PLN' },
          { value: 'scale', label: '15 000 PLN +' },
          { value: 'unknown', label: 'Nie wiem, doradźcie mi' },
        ],
      },
      {
        name: 'goal',
        label: 'Co promujemy?',
        type: 'select',
        options: [
          { value: 'services', label: 'Usługi (Lead Generation)' },
          { value: 'ecommerce', label: 'Sklep (E-commerce)' },
          { value: 'app', label: 'Aplikację / SaaS' },
        ],
      },
      {
        name: 'area',
        label: 'Obszar działań',
        type: 'select',
        options: [
          { value: 'local', label: 'Lokalnie (Miasto/Województwo)' },
          { value: 'national', label: 'Cała Polska' },
          { value: 'global', label: 'Zagranica / Global' },
        ],
      },
    ],
  },
  seo: {
    title: 'Pozycjonowanie (SEO)',
    description: 'Darmowy ruch z Google to inwestycja długoterminowa.',
    fields: [
      {
        name: 'website',
        label: 'Adres strony do pozycjonowania',
        type: 'input',
        placeholder: 'https://',
      },
      {
        name: 'history',
        label: 'Historia domeny',
        type: 'select',
        options: [
          { value: 'new', label: 'Nowa domena (świeża)' },
          { value: 'existing', label: 'Istniejąca, pozycjonowana wcześniej' },
          { value: 'penalty', label: 'Po spadkach / karach Google' },
        ],
      },
      {
        name: 'auditScope',
        label: 'Zasięg',
        type: 'select',
        options: [
          { value: 'local', label: 'Lokalne SEO (Mapy)' },
          { value: 'national', label: 'Szerokie (Sklep/Portal)' },
          { value: 'content', label: 'Content Marketing (Blog)' },
        ],
      },
    ],
  },

  // --- DESIGN ---
  branding: {
    title: 'Branding i Design',
    description: 'Wizerunek buduje zaufanie i uzasadnia cenę.',
    fields: [
      {
        name: 'scope',
        label: 'Zakres prac',
        type: 'select',
        options: [
          { value: 'logo', label: 'Tylko Logo + Podstawy' },
          { value: 'identity', label: 'Pełna Identyfikacja (Brand Book)' },
          { value: 'rebranding', label: 'Rebranding (Zmiana wizerunku)' },
        ],
      },
      {
        name: 'assets',
        label: 'Co jest gotowe?',
        type: 'select',
        options: [
          { value: 'name', label: 'Mam nazwę firmy' },
          { value: 'strategy', label: 'Mam strategię marki' },
          { value: 'nothing', label: 'Nic, startuję od zera' },
        ],
      },
    ],
  },
};

export const getStep2Fallback = (type: ContactType): Step2Content | null => {
  switch (type) {
    case 'web':
      return {
        title: 'Szczegóły Projektu WWW',
        typeLabel: 'Typ rozwiązania',
        options: [
          { value: 'landing', label: 'Landing Page' },
          { value: 'corporate', label: 'Strona Firmowa' },
          { value: 'ecommerce', label: 'Sklep Internetowy' },
          { value: 'custom', label: 'System Dedykowany / Web App' },
        ],
      };
    case 'marketing':
      return {
        title: 'Twoje Cele Marketingowe',
        typeLabel: 'Główny kanał',
        options: [
          { value: 'google', label: 'Google Ads' },
          { value: 'meta', label: 'Facebook / Instagram Ads' },
          { value: 'seo', label: 'SEO / Pozycjonowanie' },
          { value: 'full', label: 'Kompleksowa Obsługa 360' },
        ],
      };
    case 'design':
      return {
        title: 'Kierunek Designu',
        typeLabel: 'Zakres prac',
        options: [
          { value: 'branding', label: 'Branding / Logo' },
          { value: 'uiux', label: 'UI/UX Design' },
          { value: 'print', label: 'Materiały Drukowane' },
        ],
      };
    default:
      return null;
  }
};

export const CALENDAR_IFRAME_SRC =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3BjudwE3-s8uOf_UCGGuNEPZ2We5uAymq1F2rZ1BRU23QreOwcAT6-XwOqeY1QAcD7S_0JL1p3?gv=true';
