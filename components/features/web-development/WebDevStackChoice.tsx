import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../common/Container';
import { addScrollTask } from '../../../hooks/useSectionProgress';

/**
 * Sekcja „Nie mamy jednego młotka." — pole narzędzi i wybór, który po nim wędruje.
 *
 * CZWARTE podejście. Trzy poprzednie poległy, bo szukały ŁADNIEJSZEJ FORMY dla treści,
 * która była zła. Właściciel nazwał prawdziwą tezę dopiero 2026-07-15: ta sekcja nigdy
 * nie miała mówić „pracujemy tylko na tym stosie" — miała pokazywać, W CZYM UMIEMY,
 * i że WYBÓR ZALEŻY OD PROJEKTU. To zmienia wszystko:
 *
 * - Stara wersja PRZECZYŁA stronie. Hero i FAQ obiecują „technologię dobieramy do
 *   Twojego celu, nie do naszej wygody"; sekcja pokazywała jeden stały zestaw sześciu
 *   rzeczy. Ta sekcja jest teraz jedynym miejscem, gdzie ta obietnica staje się
 *   sprawdzalna — z konfliktu robi się dowód.
 * - Stara wersja DUPLIKOWAŁA sekcję nad sobą (WebDevProjectTypes wymienia React,
 *   Next.js, Headless WP, Redis, PostgreSQL przy typach projektów). Tamta mówi CO
 *   budujemy, ta mówi JAK WYBIERAMY. Inna robota, brak powtórzenia.
 * - Warstwa PostgreSQL biła w produkt firmy („bez rosnących abonamentów", gdy w menu
 *   jest /abonament/). Wycięta.
 *
 * FORMA WYPROWADZONA Z TEZY: pole ~34 nazw widać JEDNYM RZUTEM OKA — to odpowiedź na
 * „w czym umiemy", bez czytania. Reguły przewijają się obok, a w polu zapalają się
 * nazwy, które dana reguła wybiera. Widzisz naraz SZEROKOŚĆ (całe pole) i WYBÓR (trzy
 * zapalone). Bez tego ruchu „dobieramy do projektu" jest tylko napisane.
 *
 * RUCH MA ZADANIE W TRAKCIE CZYTANIA — i to jest cała różnica wobec poprzedniej wersji.
 * Tamta wkładała efekt w animację WJAZDU sekcji: przy --p=0.35 warstwy były jeszcze pod
 * foldem, a gdy wjeżdżały w kadr, --p było już 1 i wszystko stało. Rozwarstwienia
 * DOSŁOWNIE NIE DAŁO SIĘ ZOBACZYĆ (zmierzone zrzutem 2026-07-15). Tu ruch odpala się
 * dopiero, gdy reguła wjeżdża w linię czytania.
 *
 * ZERO 3D. Poprzednia próba (rotateX(7deg) przy perspective:1600px na szerokości 1400px
 * = stosunek 1.14 = rzut praktycznie ortogonalny) nie dawała żadnej głębi. Pomiar sześciu
 * stron produkcyjnych (Neon, Vercel, Stripe, Clerk, Resend, basement.studio) pokazał, że
 * `perspective` jest tam użyte 0–4 razy, a maski 2–194 razy: branża wyszła z 3D. Głębia
 * idzie z kontrastu, nie z geometrii.
 *
 * KONTRAKT SPOCZYNKU: `active === null` → WSZYSTKO zapalone. Prerender (hook milczy przy
 * window.isPrerendering), no-JS i reduced-motion dostają komplet czytelnych nazw. Ruch
 * jest progressive enhancement, nigdy bramką widoczności.
 *
 * A11Y — świadomie: przygaszenie niesie znaczenie kolorem, więc (1) przygaszone nazwy
 * trzymają AA, nie schodzą do dekoracji, (2) KAŻDA reguła wymienia swoje technologie
 * TEKSTEM w `answer`, więc czytnik ekranu i wyszukiwarka dostają tę informację bez pola.
 * Pole jest wzmocnieniem, nie jedynym nośnikiem.
 */

interface Tech {
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
 */
const FIELD: Tech[] = [
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
 * Sygnet = HUE marki, luminancja docisnieta do >=3:1 na bieli (WCAG 1.4.11).
 *
 * "Zapalaj we wlasnym kolorze narzedzia" nie dziala DOSLOWNIE i to jest pomiar, nie gust:
 * 10 z 37 marek wypada na bieli (React #00D8FF = 1.71:1, Elasticsearch #FEC514 = 1.59:1,
 * Nuxt #00DC82 = 1.82:1). Zapalony React bylby duchem - mechanizm gaslby akurat tam, gdzie
 * ma swiecic. Wiec hue zostaje co do stopnia, zmienia sie tylko jasnosc.
 *
 * Kropka to JEDYNE miejsce, gdzie kolor cudzej marki wchodzi na te strone. Nigdy pod tekst
 * (DESIGN.md), nigdy jako logotyp: 37 obcych logo to sciana naklejek, czyli pozyczony
 * autorytet - odwrotnosc tezy "wybieramy rozumem". Do tego MySQL to znak Oracle'a, a
 * WordPress ma restrykcyjna polityke znaku; praw do wiekszosci z tych 37 nie mamy.
 */
const DOT: Record<string, string> = {
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
  // Load balancer i CI/CD nie maja marki, bo to PRAKTYKI, nie produkty. Dostaja kolor domu
  // (Blekit Mixture docisniety do AA). Luka zamienia sie w wypowiedz: czesc pola jest nasza.
  lb: '#2C9ED3',
  cicd: '#2C9ED3',
};

/**
 * Szuflady warsztatu. Grupowanie NIE jest porzadkiem dla porzadku - bez niego regula zapala
 * 3 nazwy rozrzucone po blobie i widac MIGOTANIE. Po pogrupowaniu widac ZASIEG decyzji:
 * "Sklep standardowy" zapala po jednym z trzech szuflad, a "System, ktorego nie ma w pudelku"
 * otwiera cala szuflade Backend i nie tyka Frontu. To jest argument, nie ozdoba.
 *
 * To nie jest tabela: brak kolumn, brak obrysow, brak wyrownania - etykieta i swobodnie
 * zawijany zbior pod nia. Zawijanie jest tu konstrukcyjne. Kto doda obrysy albo wyrowna
 * nazwy w kolumny, zrobi z tego arkusz i zabije sens.
 */
const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Front', ids: ['next', 'react', 'vue', 'nuxt', 'astro', 'tailwind', 'ts'] },
  { label: 'Backend', ids: ['laravel', 'symfony', 'php', 'node', 'python', 'django'] },
  { label: 'Sklepy', ids: ['woo', 'presta', 'medusa', 'sylius', 'baselinker'] },
  { label: 'Treść', ids: ['wp', 'bedrock', 'sage', 'headless', 'sanity', 'strapi'] },
  { label: 'Dane', ids: ['postgres', 'mysql', 'mongo', 'redis', 'elastic', 'meili'] },
  { label: 'Infra', ids: ['docker', 'k8s', 'nginx', 'lb', 'trellis', 'cicd', 'cloudflare'] },
];
const BY_ID = new Map(FIELD.map((t) => [t.id, t]));

/**
 * Atak szybki, zwolnienie wolne. Asymetria niesie zdanie: wybor LADUJE, reszta ODPLYWA -
 * oko idzie za tym, co przychodzi. Symetryczne 500/500 daje strobo przy szybkim scrollu.
 */
const IN = '260ms';
const OUT = '700ms';

interface Rule {
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
 * `aside` przy regule 1 i 5 to jedyne dwa miejsca na tej stronie, gdzie ODRADZAMY sobie
 * droższą robotę. To nie jest ozdoba copy — dla persony (właściciel MŚP sparzony przez
 * poprzednią agencję) to jedyny sygnał, którego tamta agencja nigdy mu nie dała. Nie
 * ruszać bez rozmowy z właścicielem.
 */
const RULES: Rule[] = [
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

/** Linia czytania: reguła najbliższa 42% wysokości okna jest tą, którą czytasz. */
const READ_LINE = 0.42;

const WebDevStackChoice: React.FC = () => {
  const listRef = useRef<HTMLOListElement>(null);
  // null = spoczynek = WSZYSTKO zapalone. Prerender/no-JS/reduced-motion zostają tu.
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.isPrerendering) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const el = listRef.current;
    if (!el) return;

    // <md pole NIE jest sticky - przy regule 2 jest juz poza kadrem. Zapalanie nazw,
    // ktorych nikt nie widzi, to ruch bez zadania (i realny bug). `.matches` czytane co
    // klatke w fazie READ, wiec resize dziala za darmo.
    const desktop = window.matchMedia('(min-width: 768px)');
    let last = -1;
    return addScrollTask(() => {
      // FAZA READ — same odczyty, zero zapisów (kontrakt schedulera).
      const items = el.children;
      const line = window.innerHeight * READ_LINE;
      const box = el.getBoundingClientRect();
      // Poza sekcją wracamy do spoczynku: pole świeci w całości, zamiast zostawać
      // zamrożone na przypadkowej regule z poprzedniej wizyty w kadrze.
      let next = -1;
      if (desktop.matches && box.top < line && box.bottom > line) {
        let best = Infinity;
        for (let i = 0; i < items.length; i++) {
          const r = items[i].getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - line);
          if (d < best) {
            best = d;
            next = i;
          }
        }
      }
      if (next === last) return;
      last = next;
      // FAZA WRITE — setState poza rAF-em odczytu jest tu bezpieczny: leci tylko przy
      // ZMIANIE reguły (kilka razy na całą sekcję), nie co klatkę.
      return () => setActive(next === -1 ? null : next);
    });
  }, []);

  const lit = active === null ? null : new Set(RULES[active].picks);

  /**
   * Kolejnosc zaplonu = kolejnosc w POLU, nie w regule: sweep ma sie czytac po ukladzie oka.
   *
   * DLACZEGO W OGOLE: pole jest lewe i PERYFERYJNE - oko czyta regule po prawej (24px bold).
   * Sama zmiana koloru #6b7280 -> #2d739a to delta luminancji ~0.09; peryferia jej NIE
   * rejestruja, wiec wybor nie ladowal. Stad plytka tla (masa luminancji) + opoznienie:
   * selekcja nie blyska naraz, tylko PRZEBIEGA przez pole. Kolor mowi "sa zapalone",
   * sweep mowi "WYBIERAMY je" - a to jest teza sekcji.
   */
  const litOrder = useMemo(() => {
    if (active === null) return null;
    const picks = new Set(RULES[active].picks);
    const order = new Map<string, number>();
    let n = 0;
    for (const t of FIELD) if (picks.has(t.id)) order.set(t.id, n++);
    return order;
  }, [active]);

  return (
    // BEZ `overflow-hidden`: ta klasa UNIEWAŻNIA `position: sticky` u potomków —
    // cicho, bez błędu. Poprzedni TechStack ją miał. Pole musi się przypiąć.
    <section id="tech-stack" className="relative bg-white pt-16 pb-24 md:pt-20 md:pb-28">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            Nie mamy jednego młotka.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            W czym zrobimy Twój projekt, zależy od trzech rzeczy: jak bardzo jest złożony, jaki masz
            budżet i z czym już pracujesz. Żadną z nich nie jest nasza wygoda.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-10 md:mt-16 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          {/* POLE — sticky na desktopie: stoi, a wybór po nim wędruje. Na mobile jedzie
              w normalnym przepływie nad regułami (sticky pole + sticky nic = przepychanka
              na 390px; lepiej pokazać zakres raz, na wejściu). */}
          <div className="md:sticky md:top-24 md:self-start">
            {/* Zmienia sie ETYKIETA i to ona niesie teze "mamy 37, bierzemy 3". Bez wielkiej
                cyfry i bez gradientu - to odczyt, nie hero-metric template. Bez CountUp:
                animowany licznik to metryka dla efektu (wycieta z tej strony 2026-07-15).
                Bez aria-live: przy scrollu zaspamowaloby czytnik, a regula i tak nazywa swoje
                technologie tekstem w `answer`. */}
            <p className="text-xs font-bold tracking-wide text-gray-600">
              {lit ? 'Do tego bierzemy' : 'Czym się posługujemy'}
              <span className="ml-2 font-extrabold tabular-nums text-dark">
                {lit ? `${lit.size} z ${FIELD.length}` : FIELD.length}
              </span>
            </p>

            <div className="mt-5 space-y-4">
              {GROUPS.map((g) => {
                const hits = g.ids.filter((id) => !lit || lit.has(id)).length;
                return (
                  <div key={g.label}>
                    {/* Etykiete WOLNO gasic: #374151 (10.31:1) -> #6b7280 (4.83:1), oba AA.
                        Regula, ktora nie tyka Frontu, wygasza cala szuflade Front - stad widac
                        ZASIEG decyzji, a nie tylko jej sklad. */}
                    <p
                      className={`text-[11px] font-bold tracking-wide transition-colors ${
                        hits ? 'text-gray-500' : 'text-[#6b7280]'
                      }`}
                      style={{ transitionDuration: hits ? IN : OUT }}
                    >
                      {g.label}
                    </p>
                    <ul className="mt-1.5 -ml-2 flex flex-wrap gap-x-1 gap-y-0.5">
                      {g.ids.map((id) => {
                        const t = BY_ID.get(id);
                        if (!t) return null;
                        const rank = litOrder?.get(id);
                        // Spoczynek -> kazda nazwa pelna, bez plytek. Kontrakt.
                        const on = lit === null || rank !== undefined;
                        const style: React.CSSProperties = {
                          transitionDuration: on ? IN : OUT,
                          // Inline TYLKO delay. Zero @keyframes w tej sekcji - animacja CSS
                          // bije styl inline w kaskadzie i wlasnie tak umarly rampy w hero.
                          ...(rank !== undefined
                            ? { transitionDelay: `${Math.min(rank * 28, 220)}ms` }
                            : null),
                        };
                        const inner = (
                          <>
                            {/* aria-hidden: kropka DUBLUJE stan, ktory niesie juz kolor nazwy
                                - wiec kolor nie jest jedynym nosnikiem, a scale(.6) daje drugi
                                kanal (zgaszone sie ODSUWA, nie tylko bladnie). */}
                            <span
                              aria-hidden="true"
                              className="size-[5px] shrink-0 rounded-full transition-[background-color,transform] ease-out"
                              style={{
                                transitionDuration: on ? IN : OUT,
                                backgroundColor: on ? DOT[id] : '#9ca3af',
                                transform: on ? 'none' : 'scale(.6)',
                              }}
                            />
                            {t.name}
                          </>
                        );
                        // Plytka #e8f4fb: accent-dark = 4.66:1, dark = 11.1:1 -> oba AA.
                        // Solidny background-color, nie gradient - axe liczy kontrast, a przy
                        // gradiencie zglasza "incomplete" zamiast wyniku.
                        // Padding jest ZAWSZE, wiec plytka nigdy nie rusza layoutu.
                        const cls = `inline-flex items-center gap-1.5 rounded px-2 py-1 text-[15px] font-bold transition-colors ${
                          on
                            ? `${rank !== undefined ? 'bg-[#e8f4fb]' : ''} ${t.href ? 'text-accent-dark' : 'text-dark'}`
                            : 'text-[#6b7280]'
                        }`;
                        return (
                          <li key={id}>
                            {t.href ? (
                              <Link
                                to={t.href}
                                style={style}
                                className={`${cls} underline-offset-4 hover:underline`}
                              >
                                {inner}
                              </Link>
                            ) : (
                              <span style={style} className={cls}>
                                {inner}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REGUŁY — <ol>, bo to realna sekwencja decyzji od najprostszej do najcięższej.
              Numerów NIE drukujemy: „01/02/03" nad każdą pozycją to scaffolding z listy
              zakazów. Kolejność niesie znaczenie w DOM, nie w ozdobniku. */}
          <ol ref={listRef} className="space-y-14 md:space-y-20">
            {RULES.map((r, i) => {
              const isOn = active === null || active === i;
              return (
                <li key={r.situation} className="max-w-xl">
                  <p
                    // #8b95a5 = 3.03:1 — wystarcza, bo to DUZY tekst (>=18px bold,
                    // prog 3:1). Przy 15px w polu bylby naruszeniem; tu nie jest.
                    className={`text-[clamp(1.25rem,2.1vw,1.75rem)] font-extrabold leading-snug tracking-tight text-balance transition-colors duration-500 ${
                      isOn ? 'text-dark' : 'text-[#8b95a5]'
                    }`}
                  >
                    {r.situation}
                  </p>
                  {/* Odpowiedź NAZYWA technologie tekstem — pole jest wzmocnieniem,
                      nie jedynym nośnikiem znaczenia (a11y + SEO). */}
                  <p className="mt-3 text-lg leading-relaxed text-gray-700">{r.answer}</p>
                  {r.aside && (
                    <p className="mt-4 border-t border-gray-200 pt-4 text-base font-bold text-accent-dark">
                      {r.aside}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
};

export default WebDevStackChoice;
