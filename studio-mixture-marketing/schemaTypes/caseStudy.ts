import {defineField, defineType, Rule, SanityDocument} from 'sanity'

export default defineType({
  name: 'caseStudy',
  title: 'Portfolio (Realizacje)',
  type: 'document',
  groups: [
    {name: 'main', title: 'Główne Dane'},
    {name: 'content', title: 'Opis (Story)'},
    {name: 'specs', title: 'Specyfikacja Techniczna'},
    {name: 'media', title: 'Media i Pliki'},
    {name: 'relations', title: 'Zespół i Opinie'},
  ],
  fields: [
    // --- 1. GŁÓWNE DANE ---
    defineField({
      name: 'title',
      title: 'Nazwa Projektu',
      type: 'string',
      group: 'main',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'main',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Klient',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'clientLogo',
      title: 'Logo Klienta',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
    }),
    defineField({
      name: 'category',
      title: 'Kategoria Główna',
      type: 'string',
      group: 'main',
      options: {
        list: [
          {title: 'Web Development', value: 'web'},
          {title: 'Marketing Cyfrowy', value: 'marketing'},
          {title: 'Grafika & Design', value: 'design'},
        ],
        layout: 'radio',
      },
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'subcategory',
      title: 'Podkategorie',
      type: 'array',
      group: 'main',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Landing Page', value: 'landing'},
          {title: 'E-commerce', value: 'ecommerce'},
          {title: 'Strona Firmowa', value: 'corporate'},
          {title: 'Web App / SaaS', value: 'webapp'},
          {title: 'Google Ads', value: 'google_ads'},
          {title: 'Meta Ads', value: 'meta_ads'},
          {title: 'SEO', value: 'seo'},
          {title: 'Analityka', value: 'analytics'},
          {title: 'Branding', value: 'branding'},
          {title: 'UI/UX Design', value: 'uiux'},
          {title: 'Druk', value: 'print'},
        ],
      },
    }),
    defineField({
      name: 'date',
      title: 'Data Realizacji',
      type: 'date',
      group: 'main',
    }),
    defineField({
      name: 'excerpt',
      title: 'Krótki Opis (Zajawka)',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'Widoczny na liście projektów i w meta description SEO.',
    }),
    defineField({
      name: 'mainImage',
      title: 'Obraz Wyróżniający (Okładka)',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Tekst Alternatywny'}],
    }),

    // --- 2. OPIS (STORY) ---
    defineField({
      name: 'challenge',
      title: 'Wyzwanie (The Challenge)',
      type: 'array',
      group: 'content',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'solution',
      title: 'Nasze Rozwiązanie',
      type: 'array',
      group: 'content',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'result',
      title: 'Efekt (The Result)',
      type: 'array',
      group: 'content',
      of: [{type: 'block'}],
    }),

    // --- 3. SPECYFIKACJA (WARUNKOWA) ---

    defineField({
      name: 'websiteUrl',
      title: 'Link do strony WWW',
      type: 'url',
      group: 'specs',
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'web',
    }),
    defineField({
      name: 'techStack',
      title: 'Technologie (Tech Stack)',
      type: 'array',
      group: 'specs',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'React', value: 'React'},
          {title: 'Next.js', value: 'Next.js'},
          {title: 'Vue.js', value: 'Vue.js'},
          {title: 'TypeScript', value: 'TypeScript'},
          {title: 'Tailwind CSS', value: 'Tailwind CSS'},
          {title: 'Sanity CMS', value: 'Sanity CMS'},
          {title: 'WordPress', value: 'WordPress'},
          {title: 'Shopify', value: 'Shopify'},
          {title: 'PHP', value: 'PHP'},
          {title: 'Laravel', value: 'Laravel'},
          {title: 'Node.js', value: 'Node.js'},
          {title: 'Go (Golang)', value: 'Go'},
          {title: 'Python', value: 'Python'},
        ],
        layout: 'grid',
      },
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'web',
    }),
    defineField({
      name: 'integrations',
      title: 'Integracje',
      type: 'array',
      group: 'specs',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Stripe', value: 'Stripe'},
          {title: 'PayPal', value: 'PayPal'},
          {title: 'Przelewy24', value: 'Przelewy24'},
          {title: 'InPost', value: 'InPost'},
          {title: 'DHL', value: 'DHL'},
          {title: 'Google Maps', value: 'Google Maps'},
          {title: 'Google Analytics 4', value: 'GA4'},
          {title: 'Meta Pixel', value: 'Meta Pixel'},
          {title: 'HubSpot', value: 'HubSpot'},
          {title: 'Mailchimp', value: 'Mailchimp'},
          {title: 'Zapier', value: 'Zapier'},
        ],
        layout: 'grid',
      },
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'web',
    }),
    defineField({
      name: 'performanceScore',
      title: 'Wynik PageSpeed (Mobile)',
      type: 'number',
      group: 'specs',
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'web',
    }),

    // B. MARKETING
    defineField({
      name: 'kpi',
      title: 'Kluczowe KPI',
      type: 'array',
      group: 'specs',
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'marketing',
      of: [
        {
          type: 'object',
          name: 'metric',
          fields: [
            {name: 'label', type: 'string', title: 'Wskaźnik (np. ROAS)'},
            {name: 'value', type: 'string', title: 'Wartość (np. 1200%)'},
          ],
        },
      ],
    }),
    defineField({
      name: 'platforms',
      title: 'Platformy Reklamowe',
      type: 'array',
      group: 'specs',
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'marketing',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Google Ads', value: 'Google Ads'},
          {title: 'Meta Ads (FB/Insta)', value: 'Meta Ads'},
          {title: 'LinkedIn Ads', value: 'LinkedIn'},
          {title: 'TikTok Ads', value: 'TikTok'},
        ],
      },
    }),

    // C. DESIGN
    defineField({
      name: 'tools',
      title: 'Narzędzia Design',
      type: 'array',
      group: 'specs',
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'design',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'typography',
      title: 'Kroje Pisma',
      type: 'string',
      group: 'specs',
      hidden: ({document}: {document: SanityDocument}) => document?.category !== 'design',
    }),

    // --- 4. MEDIA ---
    defineField({
      name: 'gallery',
      title: 'Galeria Zdjęć (Główna)',
      type: 'array',
      group: 'media',
      of: [{type: 'image', options: {hotspot: true}}],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'designAssets',
      title: 'Makiety i Projekty (Design Assets)',
      description: 'Zrzuty ekranu makiet, podgląd PDF-ów, wizualizacje brandbooka.',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'caption', type: 'string', title: 'Podpis (np. Strona Główna - Desktop)'},
          ],
        },
      ],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'downloads',
      title: 'Pliki do pobrania',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'file',
          fields: [{name: 'description', type: 'string', title: 'Nazwa pliku (dla użytkownika)'}],
        },
      ],
    }),

    // --- 5. RELACJE ---
    defineField({
      name: 'testimonial',
      title: 'Referencja Klienta',
      type: 'text',
      rows: 4,
      group: 'relations',
    }),
    defineField({
      name: 'testimonialAuthor',
      title: 'Autor Referencji',
      type: 'string',
      group: 'relations',
    }),
    defineField({
      name: 'credits',
      title: 'Zespół Realizujący',
      type: 'array',
      group: 'relations',
      of: [
        {
          type: 'reference',
          to: [{type: 'teamMember'}],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'mainImage',
    },
  },
})
