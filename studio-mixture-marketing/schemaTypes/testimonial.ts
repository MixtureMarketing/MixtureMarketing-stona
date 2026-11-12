import {defineField, defineType, Rule} from 'sanity'

// MIX-1326: opinia klienta na stronie głównej i w portfolio (za przełącznikiem VITE_MM_TESTIMONIALS).
// Strona pokazuje wyłącznie dokumenty z `consentConfirmed == true` (zgoda klienta, MIX-1325).
// Uwaga: strona NIE publikuje danych strukturalnych Review/AggregateRating o własnej firmie.
export default defineType({
  name: 'testimonial',
  title: 'Opinie klientów',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Nazwa firmy',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'industry',
      title: 'Branża',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'personFirstName',
      title: 'Imię osoby',
      type: 'string',
      description: 'Tylko imię (bez nazwiska).',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Treść opinii',
      type: 'text',
      rows: 4,
      validation: (rule: Rule) => rule.required().max(400),
    }),
    defineField({
      name: 'logo',
      title: 'Logo firmy (opcjonalnie)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'googleReviewUrl',
      title: 'Link do oryginalnej opinii w Google (opcjonalnie)',
      type: 'url',
      validation: (rule: Rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'consentConfirmed',
      title: 'Zgoda klienta na publikację potwierdzona',
      type: 'boolean',
      description: 'Bez zaznaczenia opinia NIE pojawi się na stronie.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Kolejność (mniejsza = wyżej)',
      type: 'number',
    }),
  ],
  preview: {
    select: {title: 'companyName', subtitle: 'industry', media: 'logo'},
  },
})
