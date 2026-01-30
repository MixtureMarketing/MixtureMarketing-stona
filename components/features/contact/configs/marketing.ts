import { FormConfigGroup } from '../types';

export const MARKETING_FORM_CONFIG: Record<string, FormConfigGroup> = {
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
};
