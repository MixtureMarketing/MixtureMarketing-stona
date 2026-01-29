import {defineField, defineType, Rule} from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'Zespół (Pracownicy)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Imię i Nazwisko',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Stanowisko',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Zdjęcie',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Tekst alternatywny',
        },
      ],
    }),
    defineField({
      name: 'email',
      title: 'Email (Publiczny)',
      type: 'string',
      description: 'Widoczny na stronie O Nas',
    }),
    defineField({
      name: 'linkedin',
      title: 'Profil LinkedIn',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
})
