import React from 'react';

/**
 * H1 hero /web-development/ — „SŁUP": każda linia dociągnięta do OBU krawędzi kadru.
 *
 * Dwie linie o różnej liczbie znaków dostają różne stopnie tak, by kończyły się
 * co do piksela równo. Tego nie da się wyklikać w szablonie — i o to chodzi:
 * w miejscu, gdzie zrzutu dowodu pokazać nie wolno (PRODUCT.md → Constraints),
 * hero samo staje się dowodem precyzji. Dla persony, która widziała dziesiątki
 * landingów, równa prawa krawędź jest jedynym sygnałem, którego szablon nie podrobi.
 *
 * DLACZEGO cqw, a nie clamp(): stopień ma wynikać z SZEROKOŚCI KONTENERA, nie okna.
 * `container-type: inline-size` + `font-size` w `cqw` daje flush na KAŻDEJ szerokości
 * bez breakpointów i bez JS.
 *
 * SKĄD TE LICZBY — kalibracja na REALNYM elemencie w przeglądarce (2026-07-15):
 *   ustaw font-size: 100px na linii → odczytaj scrollWidth → cqw = 10000 / ink
 *   linia 1: ink@100px = 2213 px → 4.519cqw
 *   linia 2: ink@100px = 1835 px → 5.450cqw
 * Przy kontenerze 1376 px daje to 62 px i 75 px — obie POD sufitem 6rem/96 px
 * (DESIGN.md → Display).
 *
 * UWAGA METODYCZNA: pierwsza kalibracja szła na elemencie SYNTETYCZNYM (osobny div
 * z przepisanymi stylami) i wyszła o ~4% za mała — tekst wystawał poza pudełko
 * o ~50 px (scrollWidth 1425 przy clientWidth 1376), mimo że same pudełka mierzyły
 * się poprawnie. Mierzyć wyłącznie na elemencie, który faktycznie renderuje.
 *
 * UWAGA — te wartości są związane z TĄ treścią i TYM fontem. Zmiana słowa w H1
 * albo zmiana rodziny/tracking rozjeżdża flush. Przeliczyć ponownie, nie zgadywać.
 *
 * WAGA NIESIE ZNACZENIE, nie rytm: 800 dostaje to, co nośne (przedmiot oferty),
 * 400 — spoiwo gramatyczne. Web-development to rozpoznanie, co jest nośne; nagłówek
 * robi to na własnym zdaniu. Przy scroll-takeover spoiwo gaśnie szybciej niż nośne
 * (`--cover`), więc ostatnie, co czytasz przed dowodem, to sedno oferty.
 *
 * Sufit 6rem trzymany. `text-wrap: balance` NIEUŻYWANE — łamanie jest tu ręczne
 * i celowe, bo od niego zależy flush.
 */

interface Segment {
  t: string;
  /** 800 = nośne (przedmiot oferty), 400 = spoiwo gramatyczne */
  w: 400 | 800;
  accent?: boolean;
}

interface Line {
  segments: Segment[];
  /**
   * Stopień flush jako LITERALNA klasa Tailwinda (JIT nie widzi interpolacji).
   * Wartość = 10000 / ink@100px, w cqw — patrz komentarz nad plikiem.
   * Aktywna od `md`; poniżej flush jest wyłączony (patrz niżej).
   */
  cls: string;
}

const LINES: Line[] = [
  {
    cls: 'md:text-[4.519cqw]',
    segments: [
      { t: 'Tworzenie ', w: 400 },
      { t: 'stron WWW', w: 800 },
      { t: ' i ', w: 400 },
      { t: 'systemów webowych', w: 800 },
      { t: '.', w: 800 },
    ],
  },
  {
    cls: 'md:text-[5.45cqw]',
    segments: [
      { t: 'Bez ', w: 400 },
      { t: 'szablonu', w: 800, accent: true },
      { t: ', bez ', w: 400 },
      { t: 'długu technicznego', w: 800, accent: true },
      { t: '.', w: 800, accent: true },
    ],
  },
];

const WebDevHeroTitle: React.FC = () => (
  <h1
    className="mb-6 tracking-tight text-white"
    // container-type na samym H1: cqw liczy się od jego szerokości, czyli
    // szerokości kontenera hero. Bez tego cqw nie ma od czego liczyć.
    style={{ containerType: 'inline-size' }}
  >
    {LINES.map((line, i) => (
      // Flush TYLKO od md. Poniżej `whitespace-nowrap` wciskałby całą linię w 390 px,
      // co dawało H1 o stopniu 17 px — mniej niż tekst akapitu. Zmierzone, nie
      // przewidziane. Na mobile linia łamie się normalnie i dostaje własny clamp;
      // flush to decyzja dla kadru, który ma szerokość na taką decyzję.
      <span
        key={i}
        className={`block text-[clamp(1.75rem,7vw,2.75rem)] leading-[1.12] md:whitespace-nowrap md:leading-[1.02] ${line.cls}`}
      >
        {line.segments.map((s, j) => (
          <span
            key={j}
            style={{
              fontWeight: s.w,
              // Spoiwo (400) gaśnie szybciej niż nośne (800), gdy arkusz Realizacji
              // najeżdża. Spoczynek --cover:0 → opacity 1 → prerender widzi komplet.
              opacity:
                s.w === 400 ? 'calc(1 - var(--cover, 0))' : 'calc(1 - var(--cover, 0) * 0.45)',
            }}
            className={s.accent ? 'text-primary' : undefined}
          >
            {s.t}
          </span>
        ))}
      </span>
    ))}
  </h1>
);

export default WebDevHeroTitle;
