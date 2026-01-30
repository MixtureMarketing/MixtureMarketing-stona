import { FormConfigGroup } from '../types';

export const DESIGN_FORM_CONFIG: Record<string, FormConfigGroup> = {
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
