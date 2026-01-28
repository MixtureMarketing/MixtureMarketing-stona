const { createClient } = require('@sanity/client');

// Hardcoded for reliability in this environment
const projectId = 'azuef2ua';
const dataset = 'production';
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

// --- DATA SOURCE ---

const LOCATIONS = [
  {
    city: 'Warszawa',
    slug: 'warszawa',
    genitive: 'Warszawy',
    businessContext:
      'Największy rynek biurowy w Polsce, siedziby korporacji międzynarodowych, centrum startupów fintech i bankowości. Najwyższa konkurencja, ale i najwyższe budżety.',
    seoTitle: 'Agencja Interaktywna Warszawa | Strony WWW dla Biznesu',
    seoDescription:
      'Projektujemy nowoczesne strony internetowe i sklepy e-commerce dla firm z Warszawy. Zwiększ swoją sprzedaż w stolicy.',
  },
  {
    city: 'Kraków',
    slug: 'krakow',
    genitive: 'Krakowa',
    businessContext:
      'Główne centrum usług biznesowych (BPO/SSC), silny sektor IT i technologiczny, turystyka oraz branża kreatywna.',
    seoTitle: 'Tworzenie Stron Internetowych Kraków | Nowoczesny Design',
    seoDescription:
      'Skuteczne strony www dla firm z Krakowa. Oferujemy kompleksowe wdrożenia, pozycjonowanie i branding.',
  },
  {
    city: 'Wrocław',
    slug: 'wroclaw',
    genitive: 'Wrocławia',
    businessContext:
      'Polski hub innowacji, silna branża IT i automotive, liczne startupy technologiczne oraz centra R&D.',
    seoTitle: 'Strony WWW Wrocław | Software House i Agencja',
    seoDescription:
      'Profesjonalne strony i aplikacje internetowe dla wrocławskich firm. Nowoczesne technologie i wsparcie techniczne.',
  },
  {
    city: 'Poznań',
    slug: 'poznan',
    genitive: 'Poznania',
    businessContext:
      'Stolica polskiego handlu (Targi Poznańskie), logistyka, silny e-commerce (bliskość Allegro) oraz przemysł.',
    seoTitle: 'Projektowanie Stron Poznań | Sklepy i Wizytówki',
    seoDescription:
      'Budujemy strony internetowe nastawione na sprzedaż dla firm z Poznania i Wielkopolski. Sprawdź naszą ofertę.',
  },
  {
    city: 'Gdańsk',
    slug: 'gdansk',
    genitive: 'Gdańska',
    businessContext:
      'Gospodarka morska, logistyka portowa, szybko rosnący sektor IT (Trójmiasto), turystyka i branża eventowa.',
    seoTitle: 'Agencja Marketingowa Gdańsk | Strony i Sklepy WWW',
    seoDescription:
      'Kompleksowa obsługa firm z Gdańska. Tworzymy strony, które przyciągają klientów z regionu i ze świata.',
  },
  {
    city: 'Łódź',
    slug: 'lodz',
    genitive: 'Łodzi',
    businessContext:
      'Przemysł kreatywny, rewitalizacja przestrzeni (Manufaktura), logistyka centralna, branża tekstylna i filmowa.',
    seoTitle: 'Strony Internetowe Łódź | Skuteczny Wizerunek w Sieci',
    seoDescription:
      'Nowoczesne strony www dla łódzkich przedsiębiorców. Zadbaj o profesjonalny wizerunek swojej firmy w Łodzi.',
  },
  {
    city: 'Katowice',
    slug: 'katowice',
    genitive: 'Katowic',
    businessContext:
      'Serce konurbacji śląskiej, transformacja z przemysłu ciężkiego w nowe technologie, gaming (e-sport) i przemysł 4.0.',
    seoTitle: 'Tworzenie Stron Katowice | Śląsk | Agencja Kreatywna',
    seoDescription:
      'Strony www dla przemysłu i usług na Śląsku. Działamy w Katowicach i regionie, dostarczając solidne rozwiązania webowe.',
  },
];

const INDUSTRIES = [
  {
    name: 'Deweloperzy',
    slug: 'deweloperzy',
    forWho: 'Firmy deweloperskie, agencje nieruchomości, inwestorzy (flipping).',
    painPoints: [
      'Drogie leady z portali ogłoszeniowych (Otodom itp.)',
      'Brak spójnego wizerunku inwestycji (branding osiedla)',
      'Trudna sprzedaż "dziury w ziemi" (brak wizualizacji)',
    ],
    techRequirements: [
      'Interaktywne makiety 3D mieszkań i osiedli',
      'Wyszukiwarki lokali z filtrowaniem (piętro, metraż, pokoje)',
      'Integracja z CRM (np. ASARI, VoxDeveloper)',
    ],
    jargon: [
      'PUM',
      'Prospekt informacyjny',
      'Rzut lokalu',
      'MDM',
      'Stan deweloperski',
      'Odbiory mieszkań',
    ],
    compliance: 'Ustawa deweloperska (wymogi informacyjne na stronie).',
  },
  {
    name: 'E-commerce',
    slug: 'e-commerce',
    forWho: 'Producenci odzieży, sklepy wielobranżowe, marki D2C (Direct-to-Consumer).',
    painPoints: [
      'Porzucone koszyki (niska konwersja)',
      'Problemy z szybkością ładowania strony (Core Web Vitals)',
      'Trudności w zarządzaniu stanami magazynowymi (brak synchronizacji)',
    ],
    techRequirements: [
      'Integracje płatności (BLIK, PayU, Stripe) i kurierów (InPost)',
      'Systemy PIM (Product Information Management)',
      'Marketing Automation (e-mail po porzuceniu koszyka)',
    ],
    jargon: [
      'Konwersja (CR)',
      'ROAS',
      'Omnichannel',
      'Checkout',
      'UX/UI',
      'Cross-selling',
      'Marketplace',
    ],
    compliance: 'Dyrektywa Omnibus (wyświetlanie najniższej ceny z 30 dni), RODO, Cookies.',
  },
  {
    name: 'Medycyna i Stomatologia',
    slug: 'medycyna',
    forWho: 'Kliniki estetyczne, stomatolodzy, przychodnie specjalistyczne, fizjoterapeuci.',
    painPoints: [
      '"Okienka" w grafiku (pacjenci nie odwołują wizyt)',
      'Budowanie zaufania (pacjenci boją się bólu/ceny)',
      'Ograniczone możliwości reklamowe (zakaz reklamy lekarzy)',
    ],
    techRequirements: [
      'System rezerwacji online (Integracja ze ZnanyLekarz lub własny kalendarz)',
      'Galerie "Przed i Po" (Case studies)',
      'Rozbudowane sekcje "O nas" (budowanie autorytetu lekarza)',
    ],
    jargon: [
      'Implantologia',
      'Medycyna estetyczna',
      'Holistyczne podejście',
      'Wizyta adaptacyjna',
      'EDM (Elektroniczna Dokumentacja)',
    ],
    compliance:
      'Zakaz reklamy usług lekarskich (strona może tylko informować), RODO (dane wrażliwe pacjentów).',
  },
  {
    name: 'Prawnicy i Finanse',
    slug: 'prawo-finanse',
    forWho: 'Kancelarie prawne, radcowie, doradcy podatkowi, biura rachunkowe.',
    painPoints: [
      'Postrzeganie jako "niedostępni" lub "zbyt drodzy"',
      'Zakaz agresywnego marketingu (kodeks etyki)',
      'Trudność w prostym wytłumaczeniu skomplikowanych usług',
    ],
    techRequirements: [
      'Bezpieczne formularze kontaktowe (szyfrowanie SSL)',
      'Blogi eksperckie (Content Marketing pod SEO)',
      'Sekcje "Zespół" budujące zaufanie',
    ],
    jargon: [
      'Obsługa prawna',
      'Audyt',
      'Compliance',
      'Ryczałt',
      'Spółka z o.o.',
      'Windykacja',
      'Sukcesja',
    ],
    compliance: 'Kodeks Etyki Radcy Prawnego/Adwokata (ograniczenia w formie promocji).',
  },
  {
    name: 'Budownictwo i OZE',
    slug: 'budownictwo-oze',
    forWho: 'Firmy fotowoltaiczne, instalatorzy pomp ciepła, generalni wykonawcy, firmy remontowe.',
    painPoints: [
      'Pozyskiwanie kalorycznych leadów (dużo zapytań "tylko o cenę")',
      'Sezonowość zleceń',
      'Konieczność edukacji klienta (skomplikowana technologia)',
    ],
    techRequirements: [
      'Kalkulatory oszczędności / wyceny (Lead Magnets)',
      'Portfolio realizacji (zdjęcia z drona, wideo)',
      "Landing page' pod konkretne lokalizacje (Local SEO)",
    ],
    jargon: [
      'Termomodernizacja',
      'Fotowoltaika',
      'Pompa ciepła',
      'Stan surowy',
      'Generalny wykonawca',
      'Dotacje (Czyste Powietrze)',
    ],
    compliance: 'Informowanie o dotacjach zgodnie z aktualnymi programami rządowymi.',
  },
  {
    name: 'Edukacja i Szkolenia (EdTech)',
    slug: 'edukacja',
    forWho: 'Twórcy kursów online, szkoły językowe, firmy szkoleniowe BHP, coachowie.',
    painPoints: [
      'Piractwo treści szkoleniowych',
      'Jednorazowa sprzedaż (brak powracalności klienta)',
      'Obsługa techniczna platformy (dostępy, hasła)',
    ],
    techRequirements: [
      'Platforma LMS (Learning Management System)',
      'Ochrona wideo przed pobieraniem',
      'Automatyczne generowanie certyfikatów',
    ],
    jargon: [
      'Webinar',
      'E-learning',
      'Mastermind',
      'VOD',
      'Abonament (Subskrypcja)',
      'Landing Page sprzedażowy',
    ],
    compliance:
      'Regulaminy sprzedaży treści cyfrowych (odstąpienie od umowy przy treściach digital).',
  },
];

async function migrate() {
  console.log('🚀 Starting pSEO Migration to Sanity...');

  try {
    // --- LOCATIONS ---
    console.log('\n🌍 Migrating Locations...');
    for (const loc of LOCATIONS) {
      // Check if exists
      const existing = await client.fetch(`*[_type == "location" && slug.current == $slug][0]`, {
        slug: loc.slug,
      });

      if (existing) {
        console.log(`   ⚠️ Location ${loc.city} already exists. Skipping.`);
        continue;
      }

      const doc = {
        _type: 'location',
        city: loc.city,
        slug: { _type: 'slug', current: loc.slug },
        genitive: loc.genitive,
        businessContext: loc.businessContext,
        seoTitle: loc.seoTitle,
        seoDescription: loc.seoDescription,
        // Default content array (empty or basic block) could be added here if needed
        content: [],
      };

      await client.create(doc);
      console.log(`   ✅ Created Location: ${loc.city}`);
    }

    // --- INDUSTRIES ---
    console.log('\n🏭 Migrating Industries...');
    for (const ind of INDUSTRIES) {
      // Check if exists
      const existing = await client.fetch(`*[_type == "industry" && slug.current == $slug][0]`, {
        slug: ind.slug,
      });

      if (existing) {
        console.log(`   ⚠️ Industry ${ind.name} already exists. Skipping.`);
        continue;
      }

      const doc = {
        _type: 'industry',
        name: ind.name,
        slug: { _type: 'slug', current: ind.slug },
        forWho: ind.forWho,
        painPoints: ind.painPoints,
        techRequirements: ind.techRequirements,
        jargon: ind.jargon,
        compliance: ind.compliance,
      };

      await client.create(doc);
      console.log(`   ✅ Created Industry: ${ind.name}`);
    }

    console.log('\n✨ Migration Complete!');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
  }
}

migrate();
