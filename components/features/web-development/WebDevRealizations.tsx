import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { client } from '../../../services/cms/client';
import { SanityImage } from '../../../types/sanity';
import WanderingGlow from '../../visuals/WanderingGlow';

/**
 * Sekcja „Realizacje web" — brakujący szczebel belief ladder: „oni naprawdę robią
 * tę robotę, oto realne wdrożenia, nie atrapy". Zasila się z Sanity (category=web),
 * zero danych wpisywanych z ręki.
 *
 * Ciemna (deep-dark) świadomie — The Ciemnia Rule: granat istnieje po to, żeby
 * realizacje świeciły. To jedyna sekcja tej podstrony, która niesie prawdziwy
 * dowód, więc jedyna, która ma powód być ciemna.
 *
 * Choreografia własna (The Motion Has A Job Rule): zrzuty „wychodzą z ciemni" —
 * każdy ma nad sobą granatową warstwę, która gaśnie z --p, kolejne z opóźnieniem.
 * Animujemy opacity solidnej warstwy (kompozycja GPU), nie filter: blur.
 * Spoczynek = var(--p, 1) → warstwa przezroczysta, zdjęcia widoczne w pełni
 * (prerender / reduced-motion / no-JS).
 *
 * Siatka o zmiennej wysokości (CSS columns): mainImage w CMS mają proporcje od
 * 0.85:1 (BDB, portret) do 2.26:1 (KorepetytorAI). Sztywne aspect-ratio + object-cover
 * przycinałoby je brutalnie, więc każdy zrzut zachowuje własne proporcje.
 */

const builder = imageUrlBuilder(client);

interface Realization {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  date?: string;
  subcategory?: string[];
  mainImage?: SanityImage;
}

// Podkategorie istotne dla web-developmentu; marketingowe (seo, ads, print)
// pomijamy — na tej podstronie byłyby szumem, nie informacją.
const WEB_TAGS: Record<string, string> = {
  ecommerce: 'E-commerce',
  webapp: 'Web App / SaaS',
  landing: 'Landing Page',
  corporate: 'Strona firmowa',
};

/**
 * Realizacja flagowa sekcji (decyzja właściciela, 2026-07-15) — dostaje kartę lead
 * zamiast miejsca w siatce wg daty. Jeśli slug zniknie z CMS, sekcja degraduje się
 * łagodnie: brak karty lead, wszystko ląduje w siatce.
 */
const LEAD_SLUG = 'fundacja-niepodzielni';

/**
 * Realizacje wykluczone z sekcji: ich `mainImage` w CMS to makieta z Figmy
 * z tekstem zastępczym „Lorem ipsum", a nie zrzut wdrożonej strony (zweryfikowane
 * wizualnie 2026-07-15). Sekcja obiecuje „Nie wizualizacje i nie mockupy" —
 * pokazanie tu makiety z lorem ipsum robi z nagłówka kłamstwo, a z nas dokładnie
 * tę agencję, od której się odcinamy.
 *
 * TO NIE JEST DOCELOWY FIX. Właściwa naprawa: podmiana `mainImage` w Sanity na
 * prawdziwy zrzut wdrożenia — wtedy skreśl slug z tej listy i realizacja wraca.
 * Nie da się tego wykryć kodem; wymaga oka.
 */
const MOCKUP_SLUGS = new Set([
  'impackt-edu',
  'driftmark-marine-e-commerce-z-konfiguratorem-lodzi-i-rebranding',
]);

/**
 * Dowód wydajności — WYŁĄCZNIE zmierzony, z datą (PRODUCT.md → Constraints).
 * Źródło: PageSpeed Insights API, dane polowe Google CrUX dla https://niepodzielni.com/,
 * pomiar 2026-07-15: mobile LCP 964 ms / CLS 0.000 / INP 101 ms → FAST (zaliczone),
 * desktop LCP 1,2 s / CLS 0.000 / INP 42 ms → FAST (zaliczone).
 *
 * Celowo NIE podajemy wyniku Lighthouse: desktop 99, ale mobile lab 85 — podanie
 * samej „99" byłoby cherry-pickingiem, który każdy obali w 30 sekund. Dane polowe
 * są zaliczone na obu i to jest twierdzenie, które się obroni.
 *
 * PRZED ZMIANĄ TEKSTU: zmierz ponownie i zaktualizuj datę. Nigdy z ręki.
 */
const LEAD_PROOF = {
  label: 'Core Web Vitals: zaliczone — mobile i desktop',
  detail: 'LCP 1,0 s · CLS 0 · dane polowe Google CrUX, pomiar 15.07.2026',
};

const WebDevRealizations: React.FC = () => {
  const [items, setItems] = useState<Realization[]>([]);
  const [failed, setFailed] = useState(false);
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    let alive = true;
    // Dynamiczny import — klient Sanity nie wchodzi do bundla wejściowego (size-limit).
    import('../../../services/cms/caseStudyService')
      .then(({ caseStudyService }) => caseStudyService.getCaseStudies('web'))
      .then((data) => {
        if (!alive) return;
        const today = new Date().toISOString().slice(0, 10);
        const usable = (data as unknown as Realization[])
          // Bez zrzutu nie ma dowodu — taka realizacja nie wchodzi.
          .filter((c) => c.mainImage)
          // Makieta z lorem ipsum to nie dowód, tylko atrapa — patrz MOCKUP_SLUGS.
          .filter((c) => !MOCKUP_SLUGS.has(c.slug))
          // Odporność na daty z przyszłości (KorepetytorAI ma 2026-10-01 w CMS —
          // do potwierdzenia przez właściciela). Bez tego order(date desc) wypycha
          // niewydany projekt na pierwsze miejsce.
          .filter((c) => !c.date || c.date <= today)
          .slice(0, 6);
        if (usable.length === 0) setFailed(true);
        else setItems(usable);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const lead = items.find((i) => i.slug === LEAD_SLUG);
  const rest = items.filter((i) => i.slug !== LEAD_SLUG);

  return (
    <section
      ref={sectionRef}
      // data-takeover-front: krawędź tej sekcji napędza --cover przypiętego hero
      // (useHeroTakeover). Ten sam granat co hero — dalszy ciąg tej samej ciemni,
      // w której obietnica ustępuje dowodowi.
      data-takeover-front
      className="relative overflow-hidden bg-deep-dark py-24 md:py-28"
    >
      {/* Wędrujące światło (wątek „jedno światło, dwie wyspy"): poświata
          przesuwa się L→P przez cały tranzyt sekcji; w drugiej ciemni huba
          (WpCustom) to samo światło wchodzi od lewej i wędruje dalej —
          wrażenie, że pod jasnymi arkuszami przeszło jedno źródło. */}
      <WanderingGlow
        amplitude={12}
        background={
          'radial-gradient(40% 45% at 88% 4%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 62%),' +
          'radial-gradient(42% 48% at 6% 96%, color-mix(in srgb, var(--color-secondary) 24%, transparent), transparent 66%)'
        }
      />

      <Container className="relative z-10">
        <div
          className="mb-14 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-white md:text-4xl lg:text-5xl">
              Realizacje, które możesz otworzyć w przeglądarce.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              Nie wizualizacje i nie mockupy. Prawdziwe wdrożenia dla prawdziwych klientów — wejdź w
              każdą i sprawdź, jak działa.
            </p>
          </div>
          <Link
            to="/portfolio"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/10"
          >
            Zobacz wszystkie realizacje
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Empty-state — wzorzec obowiązkowy dla sekcji z CMS (DESIGN.md):
            uczciwy komunikat i droga dalej, nigdy pusta dziura. */}
        {failed && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
            <p className="text-white/75">
              Nie udało się załadować realizacji.{' '}
              <Link to="/portfolio" className="font-bold text-primary hover:underline">
                Przejdź do pełnego portfolio
              </Link>
              .
            </p>
          </div>
        )}

        {/* Karta lead — realizacja flagowa. Poza siatką (columns), bo ma nieść
            zrzut w pełnej szerokości i jedyny zmierzony dowód wydajności, jaki mamy. */}
        {lead && (
          <div
            className="mb-6"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 40px), 0)' }}
          >
            <Link
              to={`/portfolio/${lead.slug}`}
              className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition-colors hover:border-primary/50 lg:grid lg:grid-cols-2 lg:items-center"
            >
              <div className="relative overflow-hidden">
                <img
                  src={builder.image(lead.mainImage!).width(1400).fit('max').auto('format').url()}
                  alt={`Zrzut realizacji: ${lead.title}`}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  loading="lazy"
                  decoding="async"
                  className="w-full transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-deep-dark"
                  style={{ opacity: 'calc((1 - var(--p, 1)) * 2.2)' }}
                  aria-hidden="true"
                />
              </div>

              <div className="p-6 md:p-10">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xxs font-bold text-primary">
                    Realizacja flagowa
                  </span>
                  {(lead.subcategory ?? [])
                    .filter((s) => WEB_TAGS[s])
                    .slice(0, 2)
                    .map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xxs font-bold text-white/60"
                      >
                        {WEB_TAGS[t]}
                      </span>
                    ))}
                </div>

                <h3 className="text-2xl font-bold leading-snug text-white transition-colors group-hover:text-primary md:text-3xl">
                  {lead.title.trim()}
                </h3>
                {lead.excerpt && (
                  <p className="mt-3 text-base leading-relaxed text-white/70">
                    {lead.excerpt.trim()}
                  </p>
                )}

                {/* Jedyny dowód wydajności na tej stronie — zmierzony, z datą. */}
                <div className="mt-6 rounded-2xl border border-success/25 bg-success/[0.07] p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-white">
                    <CheckCircle2 size={16} className="shrink-0 text-success" aria-hidden="true" />
                    {LEAD_PROOF.label}
                  </p>
                  <p className="mt-1.5 pl-6 text-xs leading-relaxed text-white/55">
                    {LEAD_PROOF.detail}
                  </p>
                </div>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Zobacz case study
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Dwie kolumny, nie trzy: zrzut JEST argumentem tej sekcji, więc ma być
            duży i czytelny („wejdź i sprawdź"). Przy 4–6 realizacjach trzy kolumny
            zostawiały pustą dziurę w prawej i spychały najmocniejszy dowód na dół. */}
        <div className="gap-6 sm:columns-2">
          {rest.map((item, i) => {
            const tags = (item.subcategory ?? []).filter((s) => WEB_TAGS[s]).slice(0, 2);
            return (
              <div key={item._id} className="mb-6 break-inside-avoid">
                <Link
                  to={`/portfolio/${item.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-primary/50"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={builder
                        .image(item.mainImage!)
                        .width(1100)
                        .fit('max')
                        .auto('format')
                        .url()}
                      sizes="(min-width: 640px) 45vw, 100vw"
                      alt={`Zrzut realizacji: ${item.title}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                    />
                    {/* Ciemnia: warstwa gaśnie z --p, kolejne karty z opóźnieniem.
                        opacity CSS klamruje się samo do 0..1, więc mnożnik+offset
                        wystarczy za stagger. */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-deep-dark"
                      style={{ opacity: `calc((1 - var(--p, 1)) * 2.2 - ${i * 0.22})` }}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="p-6">
                    {tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xxs font-bold text-white/60"
                          >
                            {WEB_TAGS[t]}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/65">
                        {item.excerpt.trim()}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      Zobacz case study
                      <ArrowRight
                        size={15}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default WebDevRealizations;
