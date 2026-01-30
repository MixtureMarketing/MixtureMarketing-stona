import { FormConfigGroup, Step2Content } from './types';
import { ContactType } from '../../../types';
import { WEB_FORM_CONFIG } from './configs/web';
import { MARKETING_FORM_CONFIG } from './configs/marketing';
import { DESIGN_FORM_CONFIG } from './configs/design';

export const FORM_CONFIG: Record<string, FormConfigGroup> = {
  ...WEB_FORM_CONFIG,
  ...MARKETING_FORM_CONFIG,
  ...DESIGN_FORM_CONFIG,
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
