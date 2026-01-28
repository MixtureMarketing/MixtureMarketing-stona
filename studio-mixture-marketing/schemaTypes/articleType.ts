import {defineField, defineType} from 'sanity'

export const articleType = defineType({
  name: 'article',
  title: 'Artykuł',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'reference',
      to: [{type: 'category'}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data publikacji',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'readTime',
      title: 'Czas czytania (np. 10 min)',
      type: 'string',
    }),
    defineField({
      name: 'excerpt',
      title: 'Zajawka (Excerpt)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'mainImage',
      title: 'Obraz główny',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'tags',
      title: 'Tagi',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'body',
      title: 'Treść',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
  ],
})
