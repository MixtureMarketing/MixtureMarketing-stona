import {defineField, defineType} from 'sanity'

export const calculatorType = defineType({
  name: 'calculatorConfig',
  title: 'Konfiguracja Kalkulatora',
  type: 'document',
  // Singleton-like behavior instruction
  description: 'Używaj tylko jednego dokumentu tego typu do konfiguracji globalnego kalkulatora.',
  fields: [
    defineField({
      name: 'title',
      title: 'Nazwa Konfiguracji',
      type: 'string',
      initialValue: 'Globalny Cennik',
      readOnly: true,
    }),

    // --- BASE RATES ---
    defineField({
      name: 'baseRates',
      title: 'Stawki Bazowe (Typ Projektu)',
      type: 'object',
      fields: [
        defineField({
          name: 'landingPage',
          title: 'Landing Page (Wizytówka)',
          type: 'object',
          fields: [
            defineField({
              name: 'minPrice',
              type: 'number',
              title: 'Cena Min (PLN)',
              initialValue: 2500,
            }),
            defineField({
              name: 'maxPrice',
              type: 'number',
              title: 'Cena Max (PLN)',
              initialValue: 4000,
            }),
            defineField({
              name: 'minTime',
              type: 'number',
              title: 'Czas Min (tygodnie)',
              initialValue: 2,
            }),
            defineField({
              name: 'maxTime',
              type: 'number',
              title: 'Czas Max (tygodnie)',
              initialValue: 3,
            }),
          ],
        }),
        defineField({
          name: 'corporate',
          title: 'Strona Firmowa (Corporate)',
          type: 'object',
          fields: [
            defineField({
              name: 'minPrice',
              type: 'number',
              title: 'Cena Min (PLN)',
              initialValue: 4000,
            }),
            defineField({
              name: 'maxPrice',
              type: 'number',
              title: 'Cena Max (PLN)',
              initialValue: 8000,
            }),
            defineField({
              name: 'minTime',
              type: 'number',
              title: 'Czas Min (tygodnie)',
              initialValue: 4,
            }),
            defineField({
              name: 'maxTime',
              type: 'number',
              title: 'Czas Max (tygodnie)',
              initialValue: 6,
            }),
          ],
        }),
        defineField({
          name: 'ecommerce',
          title: 'Sklep (E-commerce)',
          type: 'object',
          fields: [
            defineField({
              name: 'minPrice',
              type: 'number',
              title: 'Cena Min (PLN)',
              initialValue: 6000,
            }),
            defineField({
              name: 'maxPrice',
              type: 'number',
              title: 'Cena Max (PLN)',
              initialValue: 15000,
            }),
            defineField({
              name: 'minTime',
              type: 'number',
              title: 'Czas Min (tygodnie)',
              initialValue: 4,
            }),
            defineField({
              name: 'maxTime',
              type: 'number',
              title: 'Czas Max (tygodnie)',
              initialValue: 10,
            }),
          ],
        }),
        defineField({
          name: 'webApp',
          title: 'Aplikacja Webowa / SaaS',
          type: 'object',
          fields: [
            defineField({
              name: 'minPrice',
              type: 'number',
              title: 'Cena Min (PLN)',
              initialValue: 20000,
            }),
            defineField({
              name: 'maxPrice',
              type: 'number',
              title: 'Cena Max (PLN)',
              initialValue: 50000,
            }),
            defineField({
              name: 'minTime',
              type: 'number',
              title: 'Czas Min (tygodnie)',
              initialValue: 10,
            }),
            defineField({
              name: 'maxTime',
              type: 'number',
              title: 'Czas Max (tygodnie)',
              initialValue: 16,
            }),
          ],
        }),
      ],
    }),

    // --- DESIGN MULTIPLIERS ---
    defineField({
      name: 'designMultipliers',
      title: 'Mnożniki Designu',
      description: 'Mnożnik aplikowany do stawki bazowej.',
      type: 'object',
      fields: [
        defineField({
          name: 'template',
          type: 'number',
          title: 'Template / Minimal (x)',
          initialValue: 1.0,
        }),
        defineField({
          name: 'custom',
          type: 'number',
          title: 'Custom Standard (x)',
          initialValue: 1.3,
        }),
        defineField({
          name: 'premium',
          type: 'number',
          title: 'Premium / Award Winning (x)',
          initialValue: 1.8,
        }),
      ],
    }),

    // --- FEATURES (ADD-ONS) ---
    defineField({
      name: 'features',
      title: 'Funkcjonalności (Dodatki)',
      description: 'Stała kwota dodawana do wyceny.',
      type: 'object',
      fields: [
        defineField({name: 'cms', type: 'number', title: 'System CMS (PLN)', initialValue: 1500}),
        defineField({
          name: 'blog',
          type: 'number',
          title: 'Blog / Aktualności (PLN)',
          initialValue: 1000,
        }),
        defineField({
          name: 'i18n',
          type: 'number',
          title: 'Wielojęzyczność (PLN)',
          initialValue: 2000,
        }),
        defineField({
          name: 'integrations',
          type: 'number',
          title: 'Integracje API (PLN)',
          initialValue: 2500,
        }),
        defineField({
          name: 'payments',
          type: 'number',
          title: 'Płatności Online (PLN)',
          initialValue: 1000,
        }),
        defineField({
          name: 'auth',
          type: 'number',
          title: 'Logowanie Użytkowników (PLN)',
          initialValue: 3000,
        }),
        defineField({
          name: 'filtering',
          type: 'number',
          title: 'Zaawansowane Filtrowanie (PLN)',
          initialValue: 1500,
        }),
      ],
    }),

    // --- MARKETING & CONTENT ---
    defineField({
      name: 'marketing',
      title: 'Marketing & Content',
      type: 'object',
      fields: [
        defineField({
          name: 'copywriting',
          type: 'number',
          title: 'Wsparcie Copywriterskie (PLN)',
          initialValue: 1500,
        }),
        defineField({
          name: 'seo',
          type: 'number',
          title: 'Pakiet SEO na start (PLN)',
          initialValue: 2000,
        }),
        defineField({
          name: 'social',
          type: 'number',
          title: 'Konfiguracja Social Media (PLN)',
          initialValue: 1000,
        }),
      ],
    }),
  ],
})
