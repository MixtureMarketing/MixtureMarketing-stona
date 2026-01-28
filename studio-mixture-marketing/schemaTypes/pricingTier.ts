import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pricingTier',
  title: 'Pakiet Cenowy',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nazwa Pakietu',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Podtytuł (np. Dla małych firm)',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Cena (np. 2500)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'currency',
      title: 'Waluta (np. PLN)',
      type: 'string',
      initialValue: 'PLN',
    }),
    defineField({
      name: 'priceSuffix',
      title: 'Dopisek do ceny (np. od wydatków, indywidualna)',
      type: 'string',
    }),
    defineField({
      name: 'feeLabel',
      title: 'Etykieta opłaty (np. Opłata miesięczna)',
      type: 'string',
      description: 'Używane głównie w pakietach marketingowych',
    }),
    defineField({
      name: 'description',
      title: 'Opis pakietu',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'features',
      title: 'Lista funkcji',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'isRecommended',
      title: 'Wyróżniony / Rekomendowany',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'highlightText',
      title: 'Tekst wyróżnienia (np. Najczęściej Wybierany)',
      type: 'string',
      hidden: ({document}) => !document?.isRecommended,
    }),
    defineField({
      name: 'buttonText',
      title: 'Tekst przycisku',
      type: 'string',
      initialValue: 'Wybierz Pakiet',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'price',
      isRecommended: 'isRecommended',
    },
    prepare({title, subtitle, isRecommended}) {
      return {
        title: title,
        subtitle: `${subtitle} ${isRecommended ? '(⭐)' : ''}`,
      }
    },
  },
})
