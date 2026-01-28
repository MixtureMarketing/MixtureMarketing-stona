import {defineField, defineType} from 'sanity'

export const locationType = defineType({
  name: 'location',
  title: 'Lokalizacja (pSEO)',
  type: 'document',
  fields: [
    defineField({
      name: 'city',
      title: 'Miasto',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (np. warszawa)',
      type: 'slug',
      options: {source: 'city', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'genitive',
      title: 'Dopełniacz (np. Warszawy)',
      description: 'Przydatne do zdań typu: "Obsługa firm z..."',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'businessContext',
      title: 'Kontekst Biznesowy',
      description:
        'Krótka wzmianka o specyfice rynku lokalnego (np. "hub technologiczny na Woli" lub "zagłębie przemysłowe").',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title Override',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description Override',
      type: 'text',
      rows: 2,
    }),
  ],
})
