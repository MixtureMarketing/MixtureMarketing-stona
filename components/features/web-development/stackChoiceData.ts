/**
 * Dane sekcji „Nie mamy jednego młotka." (/web-development/).
 *
 * Wydzielone z komponentu, bo to jest TREŚĆ i decyzje właściciela, nie logika: dwie mapy
 * po 37 kolorów plus 7 reguł zajmowały 2/3 pliku i topiły w sobie mechanizm. Rozdział
 * ma też drugi cel — te tablice zmienia się po rozmowie z właścicielem, a komponent po
 * pomiarze w przeglądarce. To dwa różne powody do zmiany.
 */

export interface Tech {
  id: string;
  name: string;
  /** Artykuł w /baza-wiedzy/. Te linki to realny ruch wewnętrzny — muszą przeżyć. */
  href?: string;
}

/**
 * Pole = zakres potwierdzony przez właściciela 2026-07-15 (odpowiedzi „tak/nie" na listę).
 *
 * NIE DOPISYWAĆ NIC BEZ POTWIERDZENIA. Odrzucone wprost: Shopify, Svelte, Go, Magento,
 * Shoper/IdoSell, Payload/Directus/Contentful. Shopify było DEKLAROWANE na produkcji
 * (FAQ + szablon pSEO) mimo że firma go nie robi — wycięte hotfixem 2026-07-15.
 *
 * Artykuł w /baza-wiedzy/ NIE JEST dowodem kompetencji: jest artykuł o Go, a Go nie
 * robimy. Dlatego `href` jest tylko przy nazwach, które są i w polu, i w bazie wiedzy.
 *
 * KOLEJNOŚĆ TEJ TABLICY JEST MECHANIZMEM, nie porządkiem alfabetycznym: wyznacza kolejność
 * zapłonu (patrz `litOrder`), a po ułożeniu w półkę biegnie kolumnami z lewa na prawo.
 * Przestawienie nazwy zmienia to, jak czyta się fala. Nie sortować „dla porządku".
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
 * Sygnety w SPOCZYNKU — na bieli. Hue marki, luminancja dociśnięta do >=3:1 (WCAG 1.4.11).
 *
 * „Zapalaj we własnym kolorze narzędzia" nie działa DOSŁOWNIE na bieli i to jest pomiar,
 * nie gust: 10 z 37 marek na niej wypada (React #61DAFB = 1.71:1, Elasticsearch #FEC514
 * = 1.59:1, Nuxt #00DC82 = 1.82:1). Zapalony React byłby duchem.
 *
 * Kropka to JEDYNE miejsce, gdzie kolor cudzej marki wchodzi na tę stronę. Nigdy pod tekst
 * (DESIGN.md), nigdy jako logotyp: 37 obcych logo to ściana naklejek, czyli pożyczony
 * autorytet — odwrotność tezy „wybieramy rozumem". Do tego MySQL to znak Oracle'a, a
 * WordPress ma restrykcyjną politykę znaku; praw do większości z tych 37 nie mamy.
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
  // Load balancer i CI/CD nie mają marki, bo to PRAKTYKI, nie produkty. Dostają kolor domu
  // (Błękit Mixture dociśnięty do AA). Luka zamienia się w wypowiedź: część pola jest nasza.
  lb: '#2C9ED3',
  cicd: '#2C9ED3',
};

/**
 * Sygnety na PŁYTCE WYBORU — na granacie #213261. Ta sama zasada (hue zostaje, zmienia
 * się jasność), tylko podłoże jest ciemne, więc 24 z 37 marek MOŻE wreszcie wystąpić
 * w prawdziwym kolorze: React to tu #61DAFB, nie dociśnięte #00A2BF. Pozostałe 13
 * rozjaśnione skryptem do progu 3:1 na granacie, nie na oko.
 *
 * Next.js, Symfony i Medusa dostają biel, bo ich znaki SĄ czarno-białe — na ciemnym tle
 * biel jest ich prawdziwą postacią, a nie obejściem.
 *
 * To nie jest ozdoba, tylko drugie zdanie sekcji: na półce narzędzia są stonowane;
 * w chwili, gdy je WYBIERAMY, pokazują swój własny kolor.
 */
export const DOT_LIT: Record<string, string> = {
  next: '#FFFFFF',
  react: '#61DAFB',
  vue: '#4FC08D',
  nuxt: '#00DC82',
  astro: '#FF5D01',
  tailwind: '#38BDF8',
  ts: '#3D80C9',
  laravel: '#FF2D20',
  symfony: '#FFFFFF',
  php: '#777BB4',
  node: '#5FA04E',
  python: '#FFD43B',
  django: '#44B78B',
  woo: '#A36C98',
  presta: '#E53084',
  medusa: '#FFFFFF',
  sylius: '#17A78B',
  baselinker: '#1C77FD',
  wp: '#3C86A7',
  bedrock: '#6872E1',
  sage: '#6872E1',
  headless: '#3C86A7',
  sanity: '#F03E2F',
  strapi: '#6D6AFF',
  postgres: '#5882A5',
  mysql: '#24889F',
  mongo: '#47A248',
  redis: '#FF4438',
  elastic: '#FEC514',
  meili: '#FF4FA3',
  docker: '#2496ED',
  k8s: '#4479E7',
  nginx: '#009639',
  trellis: '#F12B2B',
  cloudflare: '#F38020',
  lb: '#61B6DE',
  cicd: '#61B6DE',
};

/**
 * Szuflady warsztatu. Grupowanie NIE jest porządkiem dla porządku — bez niego reguła
 * zapala 3 nazwy rozrzucone po blobie i widać MIGOTANIE. Po pogrupowaniu widać ZASIĘG
 * decyzji: „Sklep standardowy" zapala po jednym z trzech szuflad, a „Ruch, który musi
 * wytrzymać" bierze prawie całą Infrę i nie tyka Frontu. To jest argument, nie ozdoba.
 *
 * SPROSTOWANIE do pierwszej wersji: stała tu notatka „brak kolumn — kto wyrówna nazwy
 * w kolumny, zrobi z tego arkusz". Była słuszna, DOPÓKI pole było wąską szpaltą po lewej.
 * Po obrocie osi szuflady stoją obok siebie i to nie jest arkusz: kolumny mają różną
 * liczbę nazw, nazwy zawijają się swobodnie, nie ma obrysów ani wyrównania wierszy.
 * To półka z sześcioma przegrodami. Obrysy nadal zabronione.
 */
export const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Front', ids: ['next', 'react', 'vue', 'nuxt', 'astro', 'tailwind', 'ts'] },
  { label: 'Backend', ids: ['laravel', 'symfony', 'php', 'node', 'python', 'django'] },
  { label: 'Sklepy', ids: ['woo', 'presta', 'medusa', 'sylius', 'baselinker'] },
  { label: 'Treść', ids: ['wp', 'bedrock', 'sage', 'headless', 'sanity', 'strapi'] },
  { label: 'Dane', ids: ['postgres', 'mysql', 'mongo', 'redis', 'elastic', 'meili'] },
  { label: 'Infra', ids: ['docker', 'k8s', 'nginx', 'lb', 'trellis', 'cicd', 'cloudflare'] },
];

export const BY_ID = new Map(FIELD.map((t) => [t.id, t]));

export interface Rule {
  /** Sytuacja klienta — DUŻA, bo tę rozumie. */
  situation: string;
  /** Odpowiedź — nazwy TEKSTEM (nośnik dla czytnika), plus zdanie „dlaczego". */
  answer: string;
  /** Zdanie, które sprzedaje uczciwość, nie technologię. Opcjonalne — nie na siłę. */
  aside?: string;
  picks: string[];
}

/**
 * Reguły spisane ze słów właściciela (2026-07-15). Kryteria, które podał: złożoność,
 * budżet, preferencje klienta („z czym już pracujesz").
 *
 * `aside` przy regule 1 i 6 to jedyne dwa miejsca na tej stronie, gdzie ODRADZAMY sobie
 * droższą robotę. To nie jest ozdoba copy — dla persony (właściciel MŚP sparzony przez
 * poprzednią agencję) to jedyny sygnał, którego tamta agencja nigdy mu nie dała. Nie
 * ruszać bez rozmowy z właścicielem.
 *
 * `picks` musi być PODZBIOREM tego, co `answer` nazywa tekstem — półka wzmacnia zdanie,
 * nie dopowiada za nie. Konsekwencja: 10 z 37 nazw nie zapala się przy żadnej regule
 * (React, Vue, Nuxt, TypeScript, PHP, Sanity, Strapi, MongoDB, Meilisearch, CI/CD).
 * To jest pytanie do właściciela — brakuje reguły czy nazwy? — a nie rzecz do cichego
 * załatania dopisaniem nazw, których żadne zdanie nie wypowiada.
 */
export const RULES: Rule[] = [
  {
    situation: 'Prosta strona firmowa albo landing pod kampanię.',
    answer: 'Zwykły WordPress, Astro albo Next.js.',
    aside: 'Czasem zwykły WordPress wystarczy. Wtedy tak mówimy, zamiast sprzedawać Ci framework.',
    picks: ['wp', 'astro', 'next', 'tailwind'],
  },
  {
    situation: 'Sklep ze standardowym katalogiem, przy skromnym budżecie.',
    answer: 'WooCommerce.',
    picks: ['woo', 'wp', 'mysql'],
  },
  {
    situation: 'Sklep większy — więcej produktów, więcej reguł, więcej ruchu.',
    answer: 'PrestaShop, a pod spodem cache i wyszukiwarka.',
    picks: ['presta', 'redis', 'elastic', 'baselinker'],
  },
  {
    situation: 'Sklep nietypowy: własna logika sprzedaży, konfigurator, wiele rynków.',
    answer: 'Medusa.js albo Sylius.',
    picks: ['medusa', 'sylius', 'node', 'symfony', 'postgres'],
  },
  {
    situation: 'System, którego nie ma w pudełku.',
    answer: 'Laravel, Symfony, Node.js albo Django — zależnie od tego, co ma robić.',
    picks: ['laravel', 'symfony', 'node', 'python', 'django', 'postgres', 'docker'],
  },
  {
    situation: 'Pracujesz z WordPressem od lat i Twój zespół go zna.',
    answer:
      'WordPress na Bedrocku z motywem Sage — albo headless, jeśli front ma być bardzo szybki.',
    aside: 'Nie przepychamy Cię na Laravel + React dlatego, że nam się wygodniej pisze.',
    picks: ['wp', 'bedrock', 'sage', 'headless', 'trellis'],
  },
  {
    situation: 'Ruch, który musi wytrzymać — kampania, sezon, Black Friday.',
    answer: 'Load balancer, Redis, Nginx, Kubernetes.',
    picks: ['lb', 'redis', 'nginx', 'k8s', 'cloudflare', 'docker'],
  },
];
