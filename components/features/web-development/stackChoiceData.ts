/**
 * Dane sekcji „Nie mamy jednego młotka." (/web-development/).
 *
 * To jest TREŚĆ i decyzje właściciela, nie logika — zmienia się po rozmowie
 * z właścicielem, a nie po pomiarze w przeglądarce.
 */

export interface Tech {
  id: string;
  name: string;
  /** Artykuł w /baza-wiedzy/. Te linki to realny ruch wewnętrzny — muszą przeżyć. */
  href?: string;
}

/**
 * Pole = zakres potwierdzony przez właściciela 2026-07-15 (odpowiedzi „tak/nie" na listę).
 * NIE DOPISYWAĆ NIC BEZ POTWIERDZENIA. Odrzucone wprost: Shopify, Svelte, Go, Magento,
 * Shoper/IdoSell, Payload/Directus/Contentful. Artykuł w /baza-wiedzy/ NIE JEST dowodem
 * kompetencji — dlatego `href` stoi tylko przy nazwach, które są i w polu, i w bazie.
 */
export const FIELD: Tech[] = [
  { id: 'next', name: 'Next.js', href: '/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych' },
  {
    id: 'react',
    name: 'React',
    href: '/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu',
  },
  { id: 'vue', name: 'Vue.js', href: '/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular' },
  { id: 'nuxt', name: 'Nuxt' },
  { id: 'astro', name: 'Astro' },
  {
    id: 'tailwind',
    name: 'Tailwind',
    href: '/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania',
  },
  {
    id: 'ts',
    name: 'TypeScript',
    href: '/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu',
  },
  { id: 'laravel', name: 'Laravel', href: '/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie' },
  { id: 'symfony', name: 'Symfony' },
  { id: 'php', name: 'PHP' },
  { id: 'node', name: 'Node.js', href: '/baza-wiedzy/nodejs-jeden-jezyk' },
  { id: 'python', name: 'Python' },
  { id: 'django', name: 'Django', href: '/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp' },
  { id: 'woo', name: 'WooCommerce' },
  { id: 'presta', name: 'PrestaShop' },
  { id: 'medusa', name: 'Medusa.js' },
  { id: 'sylius', name: 'Sylius' },
  { id: 'baselinker', name: 'BaseLinker' },
  { id: 'wp', name: 'WordPress' },
  { id: 'bedrock', name: 'Bedrock' },
  { id: 'sage', name: 'Sage' },
  {
    id: 'headless',
    name: 'Headless WP',
    href: '/baza-wiedzy/headless-wordpress-wydajnosc-i-bezpieczenstwo',
  },
  { id: 'sanity', name: 'Sanity' },
  { id: 'strapi', name: 'Strapi' },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    href: '/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu',
  },
  { id: 'mysql', name: 'MySQL' },
  {
    id: 'mongo',
    name: 'MongoDB',
    href: '/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji',
  },
  { id: 'redis', name: 'Redis', href: '/baza-wiedzy/redis-optymalizacja' },
  {
    id: 'elastic',
    name: 'Elasticsearch',
    href: '/baza-wiedzy/elasticsearch-inteligentna-wyszukiwarka-ecommerce',
  },
  { id: 'meili', name: 'Meilisearch' },
  { id: 'docker', name: 'Docker', href: '/baza-wiedzy/docker-konteneryzacja-przewodnik' },
  { id: 'k8s', name: 'Kubernetes' },
  { id: 'nginx', name: 'Nginx' },
  { id: 'lb', name: 'Load balancer' },
  { id: 'trellis', name: 'Trellis / Ansible' },
  { id: 'cicd', name: 'CI/CD', href: '/baza-wiedzy/ci-cd-automatyzacja-wdrozen' },
  { id: 'cloudflare', name: 'Cloudflare' },
];

/**
 * Sygnety na jasnym tle. Hue cudzej marki zostaje, luminancja dociśnięta do >=3:1
 * (WCAG 1.4.11) — 10 z 37 oryginalnych kolorów wypada na bieli (React #61DAFB = 1.71:1).
 * Kropka to jedyne miejsce, gdzie kolor cudzej marki wchodzi na stronę: nigdy pod tekst,
 * nigdy jako logotyp (do większości z 37 znaków nie mamy praw; MySQL to znak Oracle'a).
 */
export const DOT: Record<string, string> = {
  next: '#000000',
  react: '#00A2BF',
  vue: '#3CA777',
  nuxt: '#00A964',
  astro: '#FF5D01',
  tailwind: '#34A49F',
  ts: '#3178C6',
  laravel: '#FF2D20',
  symfony: '#000000',
  php: '#777BB4',
  node: '#339933',
  python: '#3776AB',
  django: '#092E20',
  woo: '#96588A',
  presta: '#DF0067',
  medusa: '#000000',
  sylius: '#17A78B',
  baselinker: '#0D6EFD',
  wp: '#21759B',
  bedrock: '#525DDC',
  sage: '#525DDC',
  headless: '#21759B',
  sanity: '#F03E2F',
  strapi: '#4945FF',
  postgres: '#336791',
  mysql: '#00758F',
  mongo: '#47A248',
  redis: '#DC382D',
  elastic: '#BB8D01',
  meili: '#FF4FA3',
  docker: '#2496ED',
  k8s: '#326CE5',
  nginx: '#009639',
  trellis: '#EE0000',
  cloudflare: '#EA710D',
  // Load balancer i CI/CD to praktyki, nie produkty — dostają kolor domu (Błękit
  // Mixture dociśnięty do AA).
  lb: '#2C9ED3',
  cicd: '#2C9ED3',
};

/** Szuflady warsztatu — wiersze tabliczki „Czym się posługujemy". */
export const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Front', ids: ['next', 'react', 'vue', 'nuxt', 'astro', 'tailwind', 'ts'] },
  { label: 'Backend', ids: ['laravel', 'symfony', 'php', 'node', 'python', 'django'] },
  { label: 'Sklepy', ids: ['woo', 'presta', 'medusa', 'sylius', 'baselinker'] },
  { label: 'Treść', ids: ['wp', 'bedrock', 'sage', 'headless', 'sanity', 'strapi'] },
  { label: 'Dane', ids: ['postgres', 'mysql', 'mongo', 'redis', 'elastic', 'meili'] },
  { label: 'Infra', ids: ['docker', 'k8s', 'nginx', 'lb', 'trellis', 'cicd', 'cloudflare'] },
];

export const BY_ID = new Map(FIELD.map((t) => [t.id, t]));

export interface Choice {
  /** Sytuacja klienta — jego językiem, nie naszym. */
  situation: string;
  /** Odpowiedź nazywa technologie TEKSTEM — chipy tylko wzmacniają zdanie. */
  answer: string;
  /** Zdanie, które sprzedaje uczciwość, nie technologię. Nie ruszać bez właściciela. */
  aside?: string;
  /** ZASADA PRAWDY: wyłącznie technologie wymienione w `answer`, nic ponad to. */
  picks: string[];
}

/**
 * Dowód tezy „wybór zależy od projektu": ta sama potrzeba (sklep), trzy różne
 * odpowiedzi. Przykłady podane przez właściciela 2026-07-15 — kolejność rosnącej
 * złożoności i budżetu jest treścią, nie ozdobą.
 */
export const SHOP_LADDER: Choice[] = [
  {
    situation: 'Standardowy katalog, skromny budżet.',
    answer:
      'WooCommerce — sklep na WordPressie, z bazą MySQL. Bez opłat licencyjnych i bez dopłacania za funkcje, których nie użyjesz.',
    picks: ['woo', 'wp', 'mysql'],
  },
  {
    situation: 'Więcej produktów, więcej reguł, więcej ruchu.',
    answer:
      'PrestaShop, a pod spodem Redis, żeby katalog nie zwalniał, i Elasticsearch, żeby wyszukiwarka naprawdę znajdowała. Sprzedaż na marketplace’ach spina BaseLinker.',
    picks: ['presta', 'redis', 'elastic', 'baselinker'],
  },
  {
    situation: 'Własna logika sprzedaży, konfigurator, wiele rynków.',
    answer:
      'Medusa.js albo Sylius — sklep pisany pod Twój proces, na Node.js albo Symfony, z bazą PostgreSQL.',
    picks: ['medusa', 'sylius', 'node', 'symfony', 'postgres'],
  },
];

/** Pozostałe częste sytuacje — spisane ze słów właściciela (2026-07-15). */
export const SITUATIONS: Choice[] = [
  {
    situation: 'Prosta strona firmowa albo landing pod kampanię.',
    answer: 'Zwykły WordPress, Astro albo Next.js.',
    aside: 'Czasem zwykły WordPress wystarczy. Wtedy tak mówimy, zamiast sprzedawać Ci framework.',
    picks: ['wp', 'astro', 'next'],
  },
  {
    situation: 'Pracujesz z WordPressem od lat i Twój zespół go zna.',
    answer:
      'WordPress na Bedrocku z motywem Sage — albo headless, jeśli front ma być bardzo szybki.',
    aside: 'Nie przepychamy Cię na Laravel + React dlatego, że nam się wygodniej pisze.',
    picks: ['wp', 'bedrock', 'sage', 'headless'],
  },
  {
    situation: 'System, którego nie ma w pudełku.',
    answer:
      'Laravel, Symfony, Node.js albo Django — zależnie od tego, co ma robić. Pod spodem najczęściej PostgreSQL i Docker.',
    picks: ['laravel', 'symfony', 'node', 'django', 'postgres', 'docker'],
  },
  {
    situation: 'Ruch, który musi wytrzymać — kampania, sezon, Black Friday.',
    answer:
      'Load balancer, Redis, Nginx i Kubernetes — a ruch z sieci najpierw przechodzi przez Cloudflare.',
    picks: ['lb', 'redis', 'nginx', 'k8s', 'cloudflare'],
  },
];
