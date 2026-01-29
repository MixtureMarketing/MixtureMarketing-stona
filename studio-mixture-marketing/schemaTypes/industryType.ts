import {defineField, defineType, Rule} from 'sanity'

export const industryType = defineType({
  name: 'industry',
  title: 'Branża (pSEO)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nazwa Branży (Mianownik)',
      description: 'np. Kancelarie Prawne, Deweloperzy Mieszkaniowi',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'forWho',
      title: 'Dla kogo (Celownik)',
      description: 'np. "dla Prawników", "dla Branży Budowlanej". Używane w nagłówkach.',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'painPoints',
      title: 'Główne Problemy (Pain Points)',
      description:
        'Lista 3-4 problemów typowych dla tej branży (np. "Brak czasu na marketing", "Skomplikowane RODO").',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'techRequirements',
      title: 'Wymagania Techniczne',
      description: 'Specyficzne potrzeby (np. "Integracja z CRM", "System rezerwacji wizyt").',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'jargon',
      title: 'Słownictwo Branżowe (Jargon)',
      description: 'Specyficzne zwroty budujące zaufanie (np. "Pacjent 360", "Telemedycyna").',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'compliance',
      title: 'Bezpieczeństwo i Prawo',
      description:
        'Wzmianka o regulacjach (np. "Zgodność z wytycznymi Naczelnej Rady Adwokackiej").',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Zdjęcie w tle (Hero)',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
})
