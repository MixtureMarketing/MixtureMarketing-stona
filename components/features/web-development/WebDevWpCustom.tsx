import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, CreditCard, Database, PlugZap, LucideIcon } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { client } from '../../../services/cms/client';
import { WEB_DEV_CONTENT } from '../../../data/content';
import WanderingGlow from '../../visuals/WanderingGlow';

/**
 * Sekcja „custom w znajomym WordPressie" — teza: klient pracuje w znanym panelu,
 * dedykowana jest aplikacja pod spodem. Dowód: trzy realne rozszerzenia z JEDNEGO
 * wdrożenia (Fundacja Niepodzielni, WordPress na Bedrocku): silnik rezerwacji na
 * API Bookero, Psychomapa (własny typ treści na mapie) i menu z żywymi terminami.
 * Każda figura nosi etykietę możliwości, której dowodzi.
 *
 * Mechanizmy podpisów ZWERYFIKOWANE w kodzie fundacji (2026-07-15): menu czyta
 * terminy z metadanych synchronizowanych z Bookero, Psychomapa to własny CPT
 * `osrodki` + endpoint + import CLI. Podpisy nazywają granicę odpowiedzialności
 * (silnik nasz — Bookero i OpenStreetMap cudze).
 *
 * BEZ FETCHA DO CMS — celowo. Obrazy są przypięte po `_ref` (hash treści pliku),
 * więc URL-e CDN budują się synchronicznie. Poprzednie wersje ładowały ten sam
 * obraz przez asynchroniczny GROQ: przy pierwszym malowaniu (i losowo w
 * prerenderze) prawa połowa sekcji stała PUSTA, aż odpowie API — właściciel
 * dwukrotnie zgłosił „cała prawa strona jest pusta". Hash gwarantuje, że podpis
 * nie trafi pod cudzy obraz; gdyby asset zniknął z CDN, onError chowa całą
 * figurę zamiast zostawić złamaną ramkę.
 */

const builder = imageUrlBuilder(client);

const PROOF = {
  engine: 'image-4d93a928a4bb0fdf9e3a7367c8a9a5933096ad59-1900x895-png',
  map: 'image-356dac554da5a8e10f0a085680026b6f4625b30c-1914x859-png',
  menu: 'image-df8b17f1e17c1a49d522a090ca4d71c164cb3fe7-849x451-png',
} as const;

const hideBrokenFigure: React.ReactEventHandler<HTMLImageElement> = (e) => {
  e.currentTarget.closest('figure')?.style.setProperty('display', 'none');
};

const FEATURE_ICONS: Record<string, LucideIcon> = {
  'Kalkulatory Ofertowe': Calculator,
  'Integracje API': PlugZap,
  'Custom Post Types': Database,
  'Bramki Płatności': CreditCard,
};

/** Etykieta możliwości nad figurą — wiąże dowód z pozycją listy po lewej. */
const ProofTag: React.FC<{ label: string }> = ({ label }) => {
  const Icon = FEATURE_ICONS[label] ?? PlugZap;
  return (
    <p className="mb-3 flex items-center gap-2 text-sm font-bold text-white/70">
      <Icon size={16} className="shrink-0 text-primary" aria-hidden="true" />
      {label}
    </p>
  );
};

/**
 * Okno halftone-wywołania dowodu głównego (wzorzec z ProtoLab): raster trzyma
 * pełną moc, aż figura wjedzie ~1/3 w kadr (p=0.4), ostry zrzut domyka się
 * przy ~3/4 widoczności (p=0.85). CSS przycina opacity do [0,1];
 * spoczynek/prerender/reduced = ostry dowód (var(--p,1)).
 * Oba layery z public/ (ten sam plik źródłowy co raster — nie mieszamy CDN
 * z assetem lokalnym): oryginał pobrany po przypiętym hashu PROOF.engine,
 * raster liczony build-time (scripts/generate-halftone.mjs --invert:
 * na granacie świeci TUSZ interfejsu, nie białe tło).
 */
const ENGINE_SHARP = '/assets/images/realizacje/np-silnik-rezerwacji.webp';
const ENGINE_HALFTONE = '/assets/images/realizacje/np-silnik-rezerwacji-halftone.webp';
const DEVELOP = (invert: boolean) =>
  invert ? 'calc(1 - (var(--p, 1) - 0.4) / 0.45)' : 'calc((var(--p, 1) - 0.4) / 0.45)';

const WebDevWpCustom: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  // Postęp wywołania mierzy FIGURA dowodu głównego, nie sekcja — --p sekcji
  // dobija do 1, zanim figura wejdzie w kadr (lekcja z labu).
  const figRef = useSectionProgress<HTMLElement>(0.9);

  return (
    // Sekcja CIEMNA — The Ciemnia Rule: granat istnieje po to, żeby realizacje
    // świeciły, a tu świecą trzy realne zrzuty działającego wdrożenia.
    // Szew (choreografia całości): ciemna wyspa najeżdża grzbietem na biel
    // StackChoice — jedyne lustrzane odwrócenie sygnaturowego arkusza na hubie.
    <section
      ref={sectionRef}
      className="relative z-10 -mt-8 overflow-hidden rounded-t-[2rem] bg-deep-dark py-24 md:-mt-12 md:py-32 lg:py-36"
    >
      {/* „Jedno światło, dwie wyspy": ta sama poświata, która przewędrowała
          przez Realizacje, wchodzi tu od lewej i wędruje dalej z --p. */}
      <WanderingGlow
        amplitude={12}
        background={
          'radial-gradient(38% 44% at 6% 8%, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 64%),' +
          'radial-gradient(40% 46% at 94% 92%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 66%)'
        }
      />
      <Container className="relative z-10">
        {/* 45/55 — dowód dostaje więcej szerokości niż teza. Uwaga właściciela
            (dwie rundy): ciężar sekcji nie może wisieć na lewej kolumnie. */}
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-16">
          <div
            className="lg:w-[45%]"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-balance text-white md:text-4xl">
              {WEB_DEV_CONTENT.wpCustom.title}{' '}
              <span className="text-primary">{WEB_DEV_CONTENT.wpCustom.titleAccent}</span>
            </h2>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/75">
              {WEB_DEV_CONTENT.wpCustom.description}
            </p>
            {/* Możliwości jako cicha lista z ROZRÓŻNIALNYMI ikonami — nie cztery
                identyczne checkmarki w czterech identycznych pudełkach. */}
            <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {WEB_DEV_CONTENT.wpCustom.features.map((item) => {
                const Icon = FEATURE_ICONS[item.title] ?? PlugZap;
                return (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <Icon size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/65">{item.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Dowód główny: silnik rezerwacji. Poświata sceniczna pod figurą —
              tania głębia (gradient, nie filtr). */}
          <div
            className="w-full lg:w-[55%]"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 56px), 0)' }}
          >
            <figure ref={figRef} className="relative">
              <div
                className="pointer-events-none absolute -inset-8 -z-10"
                style={{
                  background:
                    'radial-gradient(60% 60% at 50% 45%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 72%)',
                }}
                aria-hidden="true"
              />
              <ProofTag label="Integracje API" />
              <Link
                to="/portfolio/fundacja-niepodzielni"
                className="group relative block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
              >
                {/* Halftone-wywołanie: szkielet interfejsu z kropek brandu
                    doostrza się do zrzutu wraz z wjazdem figury w kadr. */}
                <img
                  src={ENGINE_SHARP}
                  alt="Silnik rezerwacji Fundacji Niepodzielni: wspólny kalendarz wielu specjalistów z filtrami i najbliższymi wolnymi terminami"
                  width={1900}
                  height={895}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  loading="lazy"
                  decoding="async"
                  onError={hideBrokenFigure}
                  className="w-full"
                  style={{ opacity: DEVELOP(false) }}
                />
                <img
                  src={ENGINE_HALFTONE}
                  alt=""
                  aria-hidden="true"
                  width={1900}
                  height={895}
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ opacity: DEVELOP(true) }}
                />
              </Link>
              {/* Granica odpowiedzialności nazwana wprost — silnik nasz, Bookero cudze. */}
              <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
                Silnik rezerwacji, który napisaliśmy na API{' '}
                <span className="font-semibold text-white">Bookero</span> — wspólny kalendarz wielu
                specjalistów w miejsce gotowej wtyczki.{' '}
                <Link
                  to="/portfolio/fundacja-niepodzielni"
                  className="font-bold text-primary underline-offset-4 hover:underline"
                >
                  Fundacja Niepodzielni
                  <ArrowRight size={14} className="ml-1 inline" aria-hidden="true" />
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Dowody 2 i 3 — z TEGO SAMEGO wdrożenia, dojeżdżają po tezie. */}
        <div
          className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10 lg:mt-20 lg:gap-16"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 88px), 0)' }}
        >
          <figure>
            <ProofTag label="Custom Post Types" />
            <Link
              to="/portfolio/fundacja-niepodzielni"
              className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
            >
              <img
                src={builder.image(PROOF.map).width(900).fit('max').auto('format').url()}
                alt="Psychomapa Fundacji Niepodzielni: interaktywna mapa Polski z ośrodkami pomocy psychologicznej pogrupowanymi w regiony"
                sizes="(min-width: 768px) 50vw, 100vw"
                loading="lazy"
                decoding="async"
                onError={hideBrokenFigure}
                className="w-full"
              />
            </Link>
            <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
              Psychomapa — ogólnopolski katalog ośrodków pomocy jako własny typ treści w
              WordPressie, na otwartej mapie{' '}
              <span className="font-semibold text-white">OpenStreetMap</span>.
            </figcaption>
          </figure>
          <figure>
            <ProofTag label="Integracje API" />
            <Link
              to="/portfolio/fundacja-niepodzielni"
              className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
            >
              <img
                src={builder.image(PROOF.menu).width(900).fit('max').auto('format').url()}
                alt="Rozwinięte menu strony Fundacji Niepodzielni: rodzaje konsultacji oraz najbliższe wolne terminy psychologów"
                sizes="(min-width: 768px) 50vw, 100vw"
                loading="lazy"
                decoding="async"
                onError={hideBrokenFigure}
                className="w-full"
              />
            </Link>
            <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
              Najbliższe wolne terminy specjalistów prosto w menu strony — dane z systemu
              rezerwacji, nie wpisywane ręcznie.
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
};

export default WebDevWpCustom;
