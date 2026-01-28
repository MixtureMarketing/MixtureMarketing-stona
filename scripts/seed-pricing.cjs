const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Minimalistic .env reader
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim().replace(/['"]/g, '');
        }
      });
    }
  } catch (e) {}
}

loadEnv();

const projectId = process.env.VITE_SANITY_PROJECT_ID || 'azuef2ua';
const dataset = process.env.VITE_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing SANITY_API_TOKEN.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-21',
  useCdn: false,
});

// --- DATA FROM ARCHIVE ---
const PRICING_DATA = {
  'landing-page': {
    title: 'Inwestycja w Wynik',
    description:
      'Cena obejmuje design, kodowanie, podpięcie domeny, certyfikat SSL i pełną konfigurację analityczną.',
    tiers: [
      {
        title: 'Campaign Ready',
        subtitle: 'Szybka Kampania / MVP',
        price: '2 500',
        desc: 'Idealny pod Google Ads. Szybki start, sprawdzona struktura, pełna analityka. Czas realizacji: 5 dni.',
        features: [
          'Projekt graficzny UX/UI',
          'Kodowanie (Next.js / HTML)',
          'Konfiguracja GA4 i Pixela',
          'Formularz zgodny z RODO',
          'Szybkość < 1s (Green Score)',
        ],
        highlight: false,
      },
      {
        title: 'High Performance',
        subtitle: 'Dedykowany Design & A/B',
        price: '4 000',
        desc: 'Dla marek, które chcą dominować. Unikalny design, zaawansowane animacje i warianty do testów A/B.',
        features: [
          'Zaawansowany Copywriting',
          'Integracje (CRM, Mailer)',
          'Sekcje interaktywne (Kalkulatory)',
          '2 warianty nagłówka (Testy A/B)',
          'Heatmapy w cenie (1 msc)',
        ],
        highlight: true,
      },
      {
        title: 'Multi-Landing System',
        subtitle: 'Skalowanie (Agencje/SaaS)',
        price: 'Wycena',
        desc: 'System szablonów dla wielu produktów lub landingi dynamiczne (D-SKAG) dopasowane do zapytań w Google.',
        features: [
          'Design System (biblioteka sekcji)',
          'Dynamic Content Replacement',
          'CMS do zarządzania treścią',
          'Zaawansowana analityka lejkowa',
          'Stała optymalizacja konwersji',
        ],
        highlight: false,
      },
    ],
  },
  'corporate-website': {
    title: 'Inwestycja w Wizerunek',
    description:
      "Poniższe pakiety to kompleksowe wdrożenia 'pod klucz'. Od projektu, przez kodowanie, aż po uzupełnienie treści.",
    tiers: [
      {
        title: 'Business Card',
        subtitle: 'Mała Firma / Start',
        price: '4 500',
        desc: 'Profesjonalna wizytówka w sieci. Buduje wiarygodność i ułatwia kontakt klientom. Idealna dla firm usługowych i lokalnych biznesów.',
        features: [
          'Indywidualny projekt graficzny',
          'Do 5 podstron (Oferta, O nas, Kontakt)',
          'Panel CMS (Samodzielna edycja)',
          'Formularz kontaktowy + Mapa Google',
          'Podstawowe SEO i optymalizacja',
        ],
        highlight: false,
      },
      {
        title: 'Corporate Pro',
        subtitle: 'Rozwój & Wizerunek',
        price: '8 000',
        desc: 'Rozbudowany serwis wizerunkowy. Zawiera bloga, portfolio, sekcję kariery i zaawansowane funkcje prezentacji oferty.',
        features: [
          'Do 10 unikalnych widoków',
          'Blog firmowy / Aktualności',
          'Sekcja Portfolio / Case Studies',
          'Integracja z Social Media & Newsletter',
          'Wersja dwujęzyczna (PL/EN)',
        ],
        highlight: true,
      },
      {
        title: 'Enterprise Portal',
        subtitle: 'Korporacja / Instytucja',
        price: 'Wycena',
        desc: 'Dedykowany portal korporacyjny z intranetem, strefą klienta lub zaawansowanymi integracjami (HR, CRM).',
        features: [
          'Nieograniczona liczba podstron',
          'Strefa Logowania (B2B / Pracownik)',
          'Integracje API (CRM, ERP)',
          'Advanced Search & Filtering',
          'SLA i audyty bezpieczeństwa',
        ],
        highlight: false,
      },
    ],
  },
  ecommerce: {
    title: 'Inwestycja w E-commerce',
    description: 'Sklep to nie wydatek, to maszyna do zarabiania. Oto nasze pakiety wdrożeniowe.',
    tiers: [
      {
        title: 'WooCommerce Start',
        subtitle: 'Dla małych i średnich',
        price: '6 000',
        desc: 'Kompletny sklep na własność. Bez abonamentu. Idealny do sprzedaży do 5000 produktów. Łatwa edycja i niskie koszty utrzymania.',
        features: [
          'Indywidualny projekt graficzny (UX/UI)',
          'Integracja Płatności i Kurierów',
          'Import produktów z XML/CSV',
          'Podstawowe optymalizacja SEO',
          'Szkolenie z obsługi panelu',
        ],
        highlight: false,
      },
      {
        title: 'E-commerce Pro',
        subtitle: 'Skalowalny Biznes',
        price: '12 000',
        desc: 'Zaawansowane wdrożenie nastawione na automatyzację. Integracje z hurtowniami (Dropshipping), marketing automation i Allegro.',
        features: [
          'Integracja Baselinker (Allegro/Amazon)',
          'Zaawansowane filtrowanie (ElasticSearch)',
          'Odzyskiwanie porzuconych koszyków',
          'Wielowalutowość i wielojęzyczność',
          'Optymalizacja Core Web Vitals (Speed)',
        ],
        highlight: true,
      },
      {
        title: 'B2B / Headless',
        subtitle: 'Hurtownie i Korporacje',
        price: 'Wycena',
        desc: 'Dedykowana platforma dla sprzedaży hurtowej lub sklep oparty o architekturę Headless (React/Next.js) dla maksymalnej wydajności.',
        features: [
          'Cenniki indywidualne i grupy rabatowe',
          'Integracja z ERP (Subiekt/Comarch/SAP)',
          'Kredyt kupiecki i faktury terminowe',
          'Frontend PWA (Aplikacja)',
          'Dedykowane API i Mikroserwisów',
        ],
        highlight: false,
      },
    ],
  },
  'custom-web-app': {
    title: 'Modele Współpracy',
    description:
      'Elastyczność to podstawa. Wybierz model, który najlepiej pasuje do Twojego budżetu i etapu rozwoju projektu.',
    tiers: [
      {
        title: 'Fixed Price',
        subtitle: 'Zamknięty Projekt',
        price: 'Wycena',
        desc: 'Idealny, gdy masz precyzyjną specyfikację i zamknięty zakres prac. Wiesz dokładnie, ile zapłacisz i kiedy otrzymasz produkt.',
        features: [
          'Szczegółowa specyfikacja (Scope)',
          'Gwarancja budżetu',
          'Harmonogram kamieni milowych',
          '12 msc gwarancji na kod',
        ],
        highlight: false,
      },
      {
        title: 'Time & Material',
        subtitle: 'Agile / Rozwój',
        price: 'Stawka / h',
        desc: 'Elastyczność. Płacisz za realnie przepracowany czas zespołu. Idealne dla startupów i projektów, które ewoluują w trakcie tworzenia.',
        features: [
          'Pełna elastyczność zmian',
          "Start prac 'od zaraz'",
          'Raportowanie co do minuty',
          'Możliwość skalowania zespołu',
        ],
        highlight: true,
      },
      {
        title: 'Team Extension',
        subtitle: 'Wsparcie IT',
        price: 'B2B / etat',
        desc: 'Brakuje Ci rąk do pracy? Wynajmij naszych senior developerów (React/Node/Python) do swojego wewnętrznego zespołu.',
        features: [
          'Developerzy Mid/Senior',
          'Wsparcie CTO',
          'Brak kosztów rekrutacji',
          'Transfer wiedzy (Know-how)',
        ],
        highlight: false,
      },
    ],
  },
  'premium-websites': {
    title: 'Inwestycja w Wizerunek',
    description:
      "Poniższe pakiety to kompleksowe wdrożenia 'pod klucz'. Od projektu, przez kodowanie, aż po uzupełnienie treści.",
    tiers: [
      {
        title: 'Business Card',
        subtitle: 'Mała Firma / Start',
        price: '4 500',
        desc: 'Profesjonalna wizytówka in sieci. Buduje wiarygodność i ułatwia kontakt klientom. Idealna dla firm usługowych i lokalnych biznesów.',
        features: [
          'Indywidualny projekt graficzny',
          'Do 5 podstron (Oferta, O nas, Kontakt)',
          'Panel CMS (Samodzielna edycja)',
          'Formularz kontaktowy + Mapa Google',
          'Podstawowe SEO i optymalizacja',
        ],
        highlight: false,
      },
      {
        title: 'Corporate Pro',
        subtitle: 'Rozwój & Wizerunek',
        price: '8 000',
        desc: 'Rozbudowany serwis wizerunkowy. Zawiera bloga, portfolio, sekcję kariery i zaawansowane funkcje prezentacji oferty.',
        features: [
          'Do 10 unikalnych widoków',
          'Blog firmowy / Aktualności',
          'Sekcja Portfolio / Case Studies',
          'Integracja z Social Media & Newsletter',
          'Wersja dwujęzyczna (PL/EN)',
        ],
        highlight: true,
      },
      {
        title: 'Enterprise Portal',
        subtitle: 'Korporacja / Instytucja',
        price: 'Wycena',
        desc: 'Dedykowany portal korporacyjny z intranetem, strefą klienta lub zaawansowanymi integracjami (HR, CRM).',
        features: [
          'Nieograniczona liczba podstron',
          'Strefa Logowania (B2B / Pracownik)',
          'Integracje API (CRM, ERP)',
          'Advanced Search & Filtering',
          'SLA i audyty bezpieczeństwa',
        ],
        highlight: false,
      },
    ],
  },
  'google-ads': {
    title: 'Przejrzyste Warunki',
    description:
      'Rozdzielamy budżet reklamowy (dla Google) od naszego wynagrodzenia. Wiesz dokładnie, za co płacisz.',
    tiers: [
      {
        title: 'Start',
        subtitle: 'Budżet mediowy do 3k PLN',
        price: '1 500',
        features: ['Kampanie w Wyszukiwarce', 'Konfiguracja GA4 w cenie', 'Raport miesięczny PDF'],
        highlight: false,
      },
      {
        title: 'Scale',
        subtitle: 'Budżet mediowy do 10k PLN',
        price: '2 500',
        features: [
          'Search + Remarketing + GDN',
          'Kampanie Produktowe (PLA)',
          'Raporty Live (Looker Studio)',
          'Konsultacje strategiczne',
        ],
        highlight: true,
      },
      {
        title: 'Enterprise',
        subtitle: 'Budżet 10k+ PLN',
        price: '% Fee',
        features: [
          'Pełen ekosystem (YouTube, Discovery)',
          'Zaawansowane skrypty (Ads Scripts)',
          'Audyt UX Landing Page',
          'Dedykowany opiekun',
        ],
        highlight: false,
      },
    ],
  },
  'meta-ads': {
    title: 'Pakiety Wdrożeniowe',
    description:
      'Poniższe kwoty to nasze wynagrodzenie (Fee) za obsługę kampanii. Budżet mediowy ustalasz oddzielnie i płacisz go bezpośrednio do Mety.',
    tiers: [
      {
        title: 'Start',
        subtitle: 'Budżet do 3k PLN',
        price: '1 500',
        features: ['Facebook & Instagram Feed', 'Konfiguracja Piksela', 'Raport miesięczny PDF'],
        highlight: false,
      },
      {
        title: 'Growth',
        subtitle: 'Budżet do 10k PLN',
        price: '2 500',
        features: [
          'Kampanie Reels & Stories',
          'Dynamiczny Remarketing',
          'Konfiguracja CAPI (Server-Side)',
          'Raporty Live (Looker Studio)',
        ],
        highlight: true,
      },
      {
        title: 'Enterprise',
        subtitle: 'Budżet 10k+ PLN',
        price: '% Fee',
        features: [
          'Pełen ekosystem (Messenger, Lead Ads)',
          'Tworzenie wideo (UGC)',
          'Dedykowany opiekun',
          'Strategia cross-channel (TikTok/LinkedIn)',
        ],
        highlight: false,
      },
    ],
  },
  seo: {
    title: 'Pakiety SEO',
    description:
      'Przejrzyste zasady. Żadnych ukrytych kosztów. Wybierz tempo wzrostu, które pasuje do Twojego budżetu.',
    tiers: [
      {
        title: 'Lokalne SEO',
        subtitle: 'Dla małych firm',
        price: '1 200',
        features: [
          'Wizytówka Google Maps',
          'Optymalizacja Strony Głównej',
          '2 artykuły blogowe / msc',
          'Raportowanie pozycji',
        ],
        highlight: false,
      },
      {
        title: 'National SEO',
        subtitle: 'E-commerce / Usługi PL',
        price: '2 500',
        features: [
          'Pełny Audyt Techniczny',
          'Link Building (Autorytet)',
          '4 rozbudowane artykuły / msc',
          'Optymalizacja konwersji (CRO)',
        ],
        highlight: true,
      },
      {
        title: 'Authority',
        subtitle: 'Liderzy Rynku',
        price: 'Wycena',
        features: [
          'Dominacja w Topical Authority',
          'Dedykowany Content Plan',
          'Publikacje w mediach (PR)',
          'Raportowanie Data Studio',
        ],
        highlight: false,
      },
    ],
  },
};

async function migrate() {
  console.log('🚀 Starting Pricing Migration Samity...');

  try {
    for (const [categoryKey, sectionData] of Object.entries(PRICING_DATA)) {
      console.log(`\n📦 Processing category: ${categoryKey}`);

      // 1. Check if section exists
      const existingSection = await client.fetch(
        `*[_type == "pricingSection" && category == $category][0]`,
        { category: categoryKey },
      );

      if (existingSection) {
        console.log(`   ⚠️ Section already exists. Skipping...`);
        continue;
      }

      // 2. Create Tiers
      const tierRefs = [];
      for (const tier of sectionData.tiers) {
        const tierDoc = {
          _type: 'pricingTier',
          title: tier.title,
          subtitle: tier.subtitle,
          price: tier.price,
          currency: tier.price.includes('%') || tier.price === 'Wycena' ? '' : 'PLN',
          description: tier.desc || '',
          features: tier.features,
          isRecommended: tier.highlight,
          highlightText: tier.highlight ? 'Najczęściej Wybierany' : undefined,
          buttonText: tier.cta || (tier.price === 'Wycena' ? 'Zapytaj o Ofertę' : 'Wybierz Pakiet'),
        };

        const createdTier = await client.create(tierDoc);
        console.log(`   ✅ Created Tier: ${tier.title}`);
        tierRefs.push({
          _type: 'reference',
          _ref: createdTier._id,
          _key: createdTier._id,
        });
      }

      // 3. Create Section
      const sectionDoc = {
        _type: 'pricingSection',
        title: sectionData.title,
        description: sectionData.description,
        category: categoryKey,
        packages: tierRefs,
      };

      await client.create(sectionDoc);
      console.log(`   🎉 Created Pricing Section: ${sectionData.title}`);
    }

    console.log('\n✨ Migration Complete!');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
  }
}

migrate();
