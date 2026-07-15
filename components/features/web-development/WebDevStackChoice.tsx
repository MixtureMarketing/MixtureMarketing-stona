import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../common/Container';
import { addScrollTask } from '../../../hooks/useSectionProgress';
import { BY_ID, DOT, DOT_LIT, FIELD, GROUPS, RULES } from './stackChoiceData';

/**
 * Sekcja „Nie mamy jednego młotka." — półka narzędzi i wybór, który po niej przebiega.
 * Treść i decyzje właściciela: `stackChoiceData.ts`.
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
 *
 * RUNDA 2 (2026-07-15) — właściciel: „cała prawa strona jest pusta, cały ciężar wisi po
 * lewej stronie; te zapalania się technologii są bardzo subtelne, ledwo widoczne".
 * Obie uwagi dało się zmierzyć i obie okazały się czymś innym, niż wyglądały:
 *
 * 1. PUSTKA: `max-w-xl` na regule wewnątrz kolumny `1fr` zostawiał 448 px pustki przy
 *    1440 i 693 px przy 1834 (41% okna przy 2560). To nie był margines, tylko dziura —
 *    nawigacja biegła do 1685 px, sekcja kończyła się na 1141 px. Lekarstwem NIE jest
 *    rozciągnięcie tekstu (576 px to poprawna miara czytania; rozciągnięcie zamienia
 *    jeden defekt na drugi), tylko SYMETRIA: reguły wyśrodkowane w lejku 1040 px dają
 *    216 px z każdej strony — ramę zamiast dziury.
 * 2. „LEDWO WIDOCZNE" to była wada KOMPOZYCJI, nie kontrastu. Pole stało w lewej
 *    peryferii, poza torem wzroku — żadna ilość koloru tego nie ratowała. Stąd obrót osi
 *    o 90°: półka jest nad regułami, na całą szerokość, a zapłon przebiega TUŻ NAD
 *    czytanym zdaniem. Ten sam mechanizm, inne miejsce.
 *
 * ZERO 3D. Poprzednia próba (rotateX(7deg) przy perspective:1600px na szerokości 1400px
 * = stosunek 1.14 = rzut praktycznie ortogonalny) nie dawała żadnej głębi. Pomiar sześciu
 * stron produkcyjnych (Neon, Vercel, Stripe, Clerk, Resend, basement.studio) pokazał, że
 * `perspective` jest tam użyte 0–4 razy, a maski 2–194 razy: branża wyszła z 3D. Głębia
 * idzie z kontrastu, nie z geometrii.
 *
 * BEZ PINU, i to jest rozstrzygnięcie liczbami, nie gustem. Pin (`.hero-pin`) wymaga
 * `overflow:hidden`, które UNIEWAŻNIŁOBY `sticky` samej półki; doliczyłby 2100–3900 px
 * scrolla niosącego zero informacji (3–5× koszt całego hero); i skasowałby porównanie
 * między regułami — dziś widać 3–4 naraz, a ich sens jest w zestawieniu. Hero zasługuje
 * na takeover, bo to moment wejścia i jedna myśl. Tu użytkownik jest w środku strony
 * i OCENIA — odebrany scroll to dokładnie ta ściema, którą persona rozpoznaje.
 *
 * KONTRAKT SPOCZYNKU: `active === null` → WSZYSTKO zapalone. Prerender (hook milczy przy
 * window.isPrerendering), no-JS i reduced-motion dostają komplet czytelnych nazw. Ruch
 * jest progressive enhancement, nigdy bramką widoczności.
 *
 * A11Y — świadomie: przygaszenie niesie znaczenie kolorem, więc (1) przygaszone nazwy
 * trzymają AA, nie schodzą do dekoracji, (2) KAŻDA reguła wymienia swoje technologie
 * TEKSTEM w `answer`, więc czytnik ekranu i wyszukiwarka dostają tę informację bez półki.
 * Półka jest wzmocnieniem, nie jedynym nośnikiem.
 */

/**
 * Atak szybki, zwolnienie wolne. Asymetria niesie zdanie: wybór LĄDUJE, reszta ODPŁYWA —
 * oko idzie za tym, co przychodzi. Symetryczne 500/500 daje strobo przy szybkim scrollu.
 */
const IN = '260ms';
const OUT = '700ms';

/**
 * DOLNA GRANICA linii czytania, nie sama linia: reguła najbliższa tej wysokości jest tą,
 * którą czytasz, ale półka może zepchnąć linię niżej (patrz obliczenie w efekcie).
 *
 * 0.5, nie 0.42 jak w wersji ze szpaltą, bo półka zasłania teraz górę kadru i przy 0.42
 * „aktywna" bywała reguła schowana za nią.
 */
const READ_LINE = 0.5;

const WebDevStackChoice: React.FC = () => {
  const listRef = useRef<HTMLOListElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  // null = spoczynek = WSZYSTKO zapalone. Prerender/no-JS/reduced-motion zostają tu.
  const [active, setActive] = useState<number | null>(null);
  /**
   * ŚLAD: technologie, które którakolwiek reguła już wybrała. Rośnie monotonicznie i to
   * jest zamierzone — to PAMIĘĆ, nie stan. Bez niego każda reguła jest osobnym błyskiem
   * i przy siódmej nie wiadomo, ile pola zostało pokryte; ze śladem widać, jak zasięg
   * NARASTA. To dokładnie ta „pamięć między regułami", którą miałby kupić pin — sticky
   * daje ją za 0 px odebranego scrolla.
   *
   * Ślad żyje wyłącznie w kanale KROPKI (wybrane kiedyś = kropka trzyma kolor marki,
   * nigdy niewybrane = kropka szara i odsunięta). Nie dotyka koloru tekstu, więc nie
   * miesza się z kontrastem zapłonu ani nie rusza AA.
   */
  const [seen, setSeen] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || window.isPrerendering) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const el = listRef.current;
    if (!el) return;

    // <md półka NIE jest sticky — przy regule 2 jest już poza kadrem. Zapalanie nazw,
    // których nikt nie widzi, to ruch bez zadania (i realny bug). `.matches` czytane co
    // klatkę w fazie READ, więc resize działa za darmo.
    const desktop = window.matchMedia('(min-width: 768px)');
    // Od xl półka zasłania górę kadru. Linia czytania MUSI zostać pod nią — inaczej
    // „aktywna" jest reguła, której nie widać, a to gorsze niż brak mechanizmu.
    const wide = window.matchMedia('(min-width: 1280px)');
    let last = -1;
    return addScrollTask(() => {
      // FAZA READ — same odczyty, zero zapisów (kontrakt schedulera).
      const items = el.children;
      const vh = window.innerHeight;
      // Linia LICZONA, nie założona: półka ma 224 px przy 1440, ale 256 px przy 1280
      // (węższe kolumny = więcej wierszy), a przy 1280x720 stałe 0.5*vh = 360 px
      // wypadłoby 24 px pod jej krawędzią. Czytanie rectu co klatkę kosztuje tyle co nic
      // (i tak jesteśmy w fazie READ), a koryguje każdą kombinację szerokości, wysokości
      // i długości nazw — także tę, której nie zmierzyłem.
      const shelfBottom = wide.matches
        ? (shelfRef.current?.getBoundingClientRect().bottom ?? 0)
        : 0;
      const line = Math.min(Math.max(vh * READ_LINE, shelfBottom + 96), vh * 0.75);
      const box = el.getBoundingClientRect();
      // Poza sekcją wracamy do spoczynku: półka świeci w całości, zamiast zostawać
      // zamrożona na przypadkowej regule z poprzedniej wizyty w kadrze.
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
      // ZMIANIE reguły (kilka razy na całą sekcję), nie co klatkę. Ślad dopisujemy w tym
      // samym miejscu, a nie osobnym efektem na [active]: to jest jedno zdarzenie
      // z zewnętrznego systemu (scroll), więc jedna ścieżka zapisu i zero kaskad.
      return () => {
        setActive(next === -1 ? null : next);
        if (next === -1) return;
        setSeen((prev) => {
          const picks = RULES[next].picks;
          if (picks.every((id) => prev.has(id))) return prev;
          const grown = new Set(prev);
          for (const id of picks) grown.add(id);
          return grown;
        });
      };
    });
  }, []);

  const lit = active === null ? null : new Set(RULES[active].picks);

  /**
   * Kolejność zapłonu = kolejność w POLU, nie w regule: fala ma się czytać po układzie oka.
   * Po ułożeniu pola w półkę FIELD biegnie kolumnami z lewa na prawo, więc opóźnienie
   * zamienia się w falę przebiegającą półkę — dokładnie w kierunku czytania.
   *
   * DLACZEGO W OGÓLE: sam kolor mówi „są zapalone"; fala mówi „WYBIERAMY je" — a to jest
   * teza sekcji. Bez opóźnienia siedem płytek błyska naraz i czyta się jak podświetlenie
   * wyniku wyszukiwania, nie jak decyzja.
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
    // cicho, bez błędu. Poprzedni TechStack ją miał. Półka musi się przypiąć.
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

        {/* Dwa układy, jeden DOM — bo defekt był SZEROKOŚCIOWY, a nie strukturalny.
            Do xl (<1280) szpalta po lewej działa i jest zrównoważona (zmierzone przy
            768–1024); psuje się dopiero na szerokich ekranach. Od xl `block` rozpina
            półkę nad regułami.

            `xl:block` to nie kosmetyka: sticky na elemencie siatki jest ograniczony do
            SWOJEGO obszaru siatki, więc półka jako wiersz 1 nie miałaby po czym jechać.
            Jako zwykły blok dostaje za blok obejmujący cały ten wrapper. */}
        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-10 md:mt-16 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:block">
          {/* PÓŁKA. Sticky: stoi, a wybór po niej przebiega. Na mobile jedzie w normalnym
              przepływie nad regułami (sticky półka + sticky nic = przepychanka na 390px;
              lepiej pokazać zakres raz, na wejściu).
              `bg-white` + `z-10` są KONSTRUKCYJNE: reguły przewijają się POD półką, więc
              musi być nieprzezroczysta i nad nimi. z-10 < --z-nav (50), bo nawigacja ma
              pierwszeństwo. `top-20` = 80px = dokładnie wysokość nawigacji (h-20). */}
          {/* `after:` = 40 px bieli gasnącej w dół, TUŻ POD krawędzią półki. To nie jest
              ozdoba, tylko naprawa defektu, którego nie złapał żaden pomiar — widać go
              dopiero na zrzucie: reguła wjeżdżająca pod półkę była CIĘTA W POŁOWIE ZDANIA
              na twardej krawędzi („sprzedaży, konfigurator, wiele rynków." wisiało pod
              kreską jak sierota). Liczby mówiły, że wszystko gra. Z gradientem tekst
              ROZPŁYWA się, zamiast być gilotynowany — czyta się jako „przechodzi pod
              półką", a nie jako uszkodzony layout.
              `to-white/0`, nie `to-transparent`: transparent to przezroczysta CZERŃ, więc
              gradient przechodziłby przez szarość. `pointer-events-none`, bo pas leży nad
              regułami i inaczej zjadałby kliknięcia. */}
          <div
            ref={shelfRef}
            className="bg-white md:sticky md:top-24 md:self-start xl:top-20 xl:z-10 xl:border-b xl:border-gray-200 xl:pt-5 xl:pb-5 xl:after:pointer-events-none xl:after:absolute xl:after:inset-x-0 xl:after:top-full xl:after:h-10 xl:after:bg-gradient-to-b xl:after:from-white xl:after:to-white/0"
          >
            {/* Zmienia się ETYKIETA i to ona niesie tezę „mamy 37, bierzemy 3". Bez wielkiej
                cyfry i bez gradientu — to odczyt, nie hero-metric template. Bez CountUp:
                animowany licznik to metryka dla efektu (wycięta z tej strony 2026-07-15).
                Bez aria-live: przy scrollu zaspamowałoby czytnik, a reguła i tak nazywa swoje
                technologie tekstem w `answer`. */}
            <p className="text-xs font-bold tracking-wide text-gray-600">
              {lit ? 'Do tego bierzemy' : 'Czym się posługujemy'}
              <span className="ml-2 font-extrabold tabular-nums text-dark">
                {lit ? `${lit.size} z ${FIELD.length}` : FIELD.length}
              </span>
            </p>

            <div className="mt-5 space-y-4 xl:mt-4 xl:grid xl:grid-cols-6 xl:gap-x-6 xl:space-y-0">
              {GROUPS.map((g) => {
                const hits = g.ids.filter((id) => !lit || lit.has(id)).length;
                return (
                  <div key={g.label}>
                    {/* Etykietę WOLNO gasić: #374151 (10.31:1) -> #6b7280 (4.83:1), oba AA.
                        Reguła, która nie tyka Frontu, wygasza całą szufladę Front — stąd widać
                        ZASIĘG decyzji, a nie tylko jej skład. */}
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
                        const isLit = rank !== undefined;
                        // Spoczynek -> każda nazwa pełna, bez płytek. Kontrakt.
                        const isRest = lit === null;
                        const traced = isLit || isRest || seen.has(id);
                        const style: React.CSSProperties = {
                          transitionDuration: isLit || isRest ? IN : OUT,
                          // Inline TYLKO delay. Zero @keyframes w tej sekcji — animacja CSS
                          // bije styl inline w kaskadzie i właśnie tak umarły rampy w hero.
                          ...(isLit ? { transitionDelay: `${Math.min(rank * 34, 300)}ms` } : null),
                        };
                        const inner = (
                          <>
                            {/* aria-hidden: kropka DUBLUJE stan, który niesie już kolor nazwy
                                — więc kolor nie jest jedynym nośnikiem, a scale(.6) daje drugi
                                kanał (nigdy niewybrane się ODSUWA, nie tylko blednie). */}
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 rounded-full transition-[background-color,transform] ease-out"
                              style={{
                                transitionDuration: isLit || isRest ? IN : OUT,
                                backgroundColor: isLit ? DOT_LIT[id] : traced ? DOT[id] : '#c9ced6',
                                transform: traced ? 'none' : 'scale(.6)',
                              }}
                            />
                            {t.name}
                          </>
                        );
                        /**
                         * PŁYTKA GRANATOWA — tu leży naprawa „ledwo widocznego" zapłonu,
                         * i to jest liczba, nie gust. Poprzednia płytka #e8f4fb ma
                         * luminancję 0.888 przy bieli 1.0: delta 0.11. Granat #213261 ma
                         * 0.035: delta 0.965, czyli ~9x większa masa. Peryferia rejestrują
                         * masę luminancji, nie odcień — dlatego tamta płytka nie mogła
                         * zadziałać niezależnie od tego, jak długo się na nią patrzyło.
                         *
                         * Drugi, głębszy błąd tamtej wersji: zapalony i spoczynkowy miały
                         * TEN SAM kolor tekstu. Zdarzeniem nie było więc zapalenie siedmiu,
                         * tylko wygaszenie trzydziestu. A 15 z 37 nazw to linki: zapalony
                         * #2d739a (lum 0.152) obok wygaszonego #6b7280 (lum 0.167) to
                         * delta 0.015, czyli ZERO. Połowa pola zapalała się bez żadnej
                         * zmiany jasności. Teraz zapalony ZYSKUJE płytkę i biel; wygaszony
                         * jedynie traci. Kierunek zdarzenia zgadza się z tezą.
                         *
                         * Granat na bieli i biel na granacie = 12.4:1. Solidny
                         * background-color, nie gradient — axe przy gradiencie zgłasza
                         * „incomplete" zamiast wyniku. Płytka mieści się w The Ciemnia Rule:
                         * granat oprawia DOWÓD, a nie całą sekcję-argument; tu granatowe są
                         * wyłącznie te 3–7 wybranych płytek, czyli dokładnie dowód wyboru.
                         * Padding jest ZAWSZE, więc płytka nigdy nie rusza layoutu.
                         */
                        const cls = `inline-flex items-center gap-1.5 rounded px-2 py-1 text-[15px] font-bold transition-colors ${
                          isLit
                            ? 'bg-[#213261] text-white'
                            : isRest
                              ? t.href
                                ? 'text-accent-dark'
                                : 'text-dark'
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
              zakazów. Kolejność niesie znaczenie w DOM, nie w ozdobniku.

              LEJEK od xl: 1472 (półka) -> 1040 (<ol>) -> 576 (zdanie) -> 384 (odpowiedź).
              `mx-auto` na 1040 zamienia 448 px pustki po jednej stronie na 216 px z obu —
              rama zamiast dziury. Prawa kolumna zjeżdża o 56 px (xl:mt-14), bo dwie równe
              kolumny czytają się jak tabela; przesunięcie robi z tego przekątną i prowadzi
              oko z pytania do odpowiedzi. */}
          <ol
            ref={listRef}
            className="space-y-14 md:space-y-20 xl:mx-auto xl:mt-16 xl:max-w-[65rem] xl:space-y-20"
          >
            {RULES.map((r, i) => {
              const isOn = active === null || active === i;
              return (
                <li
                  key={r.situation}
                  className="max-w-xl xl:grid xl:max-w-none xl:grid-cols-[36rem_24rem] xl:gap-x-20"
                >
                  <p
                    // #8b95a5 = 3.03:1 — wystarcza, bo to DUŻY tekst (>=18px bold,
                    // próg 3:1). Przy 15px w polu byłby naruszeniem; tu nie jest.
                    className={`text-[clamp(1.25rem,2.1vw,1.75rem)] leading-snug font-extrabold tracking-tight text-balance transition-colors duration-500 ${
                      isOn ? 'text-dark' : 'text-[#8b95a5]'
                    }`}
                  >
                    {r.situation}
                  </p>
                  <div className="mt-3 xl:mt-10">
                    {/* Odpowiedź NAZYWA technologie tekstem — półka jest wzmocnieniem,
                        nie jedynym nośnikiem znaczenia (a11y + SEO). */}
                    <p className="text-lg leading-relaxed text-gray-700">{r.answer}</p>
                    {r.aside && (
                      <p className="mt-4 border-t border-gray-200 pt-4 text-base font-bold text-accent-dark">
                        {r.aside}
                      </p>
                    )}
                  </div>
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
