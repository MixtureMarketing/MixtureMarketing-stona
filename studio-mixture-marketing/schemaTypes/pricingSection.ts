import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pricingSection',
  title: 'Sekcja Cennika',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł Sekcji',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis Sekcji',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'category',
      title: 'Kategoria / ID (np. landing-page)',
      type: 'string',
      description: 'Unikalny identyfikator używany w kodzie do pobrania odpowiedniego cennika',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'packages',
      title: 'Pakiety',
      type: 'array',
      of: [{type: 'reference', to: {type: 'pricingTier'}}],
    }),
  ],
})
