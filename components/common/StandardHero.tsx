/* eslint-disable max-lines -- wspoldzielony hero 15 podstron: 17 opcjonalnych propow,
   dwa rejestry tla (light/dark) i rampy priorytetu przy scroll-takeover. Tlo ciemne
   wydzielone do HeroDarkBackdrop; dalsze dzielenie rozbiloby jeden ekran na fragmenty. */
import React from 'react';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from './AmbientBackground';
import { HeroTitle, HeroButtons, HeroDarkBackdrop } from './HeroSubComponents';
import Container from './Container';
import HeroBadge from './HeroBadge';
import { useHeroTakeover } from '../../hooks/useHeroTakeover';

interface StandardHeroProps {
  /** Opcjonalny. Gdy H1 mówi to samo — badge jest duplikatem i odruchem eyebrow. */
  badge?: string;
  /** @deprecated icon ignorowany odkad StandardHero uzywa HeroBadge z live-dot (Sprint E3) */
  badgeIcon?: LucideIcon;
  title: string | { line1: string; line2: string; accent?: string };
  description: string;
  ctaPrimaryText: string;
  ctaPrimaryOnClick: () => void;
  ctaSecondaryText?: string;
  ctaSecondaryOnClick?: () => void;
  ctaSecondaryIcon?: LucideIcon;
  ctaSecondaryNode?: React.ReactNode;
  backLinkPath?: string;
  backLinkLabel?: string;
  /**
   * Wizual poboczny hero. UWAGA (PRODUCT.md → Constraints, DESIGN.md → The Hero Is
   * Words Rule): zrzuty/screeny realizacji są tu ZAKAZANE na wszystkich stronach —
   * dowód żyje w sekcjach proof/Realizacje. Bez wizualu hero idzie na pełną szerokość.
   */
  visual?: React.ReactNode;
  /** Mikro-anchor cenowy pod opisem (np. "od 3 900 zł · 4-8 tygodni"). EH1 — redukcja "ukrytej ceny" porzucen. */
  priceHint?: string;
  /** Trust line pod CTA — np. founder ("Jakub Niedziela odpowiada osobiscie w 24h"). EH3. */
  trustLine?: React.ReactNode;
  /**
   * Rejestr tła. `light` (domyślny) — dotychczasowy jasny hero na 14 podstronach.
   * `dark` — granatowa strefa premium jak hero strony głównej: pełny fold,
   * monumentalna typografia, treść na `--cover` przy scroll-takeover.
   *
   * Kolor akcentu H1 zmienia się wraz z rejestrem i to NIE jest kosmetyka:
   * `primary` (#61b6de) ma 8.30:1 na granacie, ale tylko 2.17:1 na jasnym tle —
   * oblewa nawet próg 3:1 dla dużego tekstu. `accent-dark` odwrotnie: 4.99:1 na
   * bieli, za ciemny na granat. Wzorzec koloru nie przenosi się między rejestrami.
   */
  tone?: 'light' | 'dark';
  /** Pas pod treścią hero, na dole foldu — miejsce na dowód (pas technologii, marquee). */
  bottomBand?: React.ReactNode;
  /**
   * Własny H1 zamiast `HeroTitle`. Furtka dla podstron, które komponują nagłówek
   * na miarę (np. typografia flush do obu krawędzi). Gdy podany — `title` jest
   * ignorowany, a blok traci `max-w-4xl` i idzie na pełną szerokość kontenera.
   * Pozostałe 14 podstron na StandardHero nie widzi tej ścieżki.
   */
  titleNode?: React.ReactNode;
}

/**
 * Rampa: wycina z --cover odcinek [start, start+len] i normalizuje do 0..1.
 * clamp() trzyma poza zakresem, więc każdy element ma własne okno reakcji.
 */
const ramp = (start: number, len: number) =>
  `clamp(0, calc((var(--cover, 0) - ${start}) / ${len}), 1)`;

/**
 * Element USTĘPUJE: cofa się W GÓRĘ i gaśnie w swoim oknie.
 *
 * Kierunek jest warunkiem poprawności. Przy dodatnim px (zjazd w dół) ustępujący
 * wjeżdża w to, co pod nim: cena zjeżdżała +50 px prosto w CTA i nachodziła na nie
 * przez 2 klatki, zanim zdążyła zgasnąć. Ustępowanie ma zwalniać przestrzeń, a nie
 * przepychać treść w dół — więc px jest ujemny (recesja ku górze).
 */
const yields = (start: number, len: number, px = 24): React.CSSProperties => ({
  ['--e' as string]: ramp(start, len),
  transform: `translate3d(0, calc(var(--e) * ${-Math.abs(px)}px), 0)`,
  opacity: 'calc(1 - var(--e))',
});

/**
 * Element OCALAŁY: wchodzi w przestrzeń ZWOLNIONĄ przez to, co ustąpiło, i zostaje
 * w pełnej czytelności — dopiero potem wychodzi czysto, nigdy przecięty.
 *
 * KOLEJNOŚĆ JEST WARUNKIEM POPRAWNOŚCI, nie stylistyki. `transform` przesuwa element
 * wizualnie, ale NIE w układzie — więc ocalały, który rusza za wcześnie, przelatuje
 * PO treści, która jeszcze nie zniknęła. Tak było: CTA startowało przy --cover 0.10,
 * a lede ustępowało dopiero od 0.16 → przycisk nachodził na tekst.
 * Dlatego każdy ocalały ma własny próg startu = moment, w którym to, co nad nim,
 * osiąga krycie 0:
 *   H1  startuje 0.20, wznios 56 px — back-link znika przy 0.20
 *   CTA nie jedzie WCALE (px = 0) — i to jest decyzja, nie rezygnacja. Wznios CTA
 *       o 150 px dawał 3 klatki nachodzenia na cenę mimo bramki 0.34; strojenie
 *       progów leczyło objaw. Zerowy wznios wyklucza kolizję STRUKTURALNIE, a rola
 *       ocalałego zostaje: CTA gaśnie ostatnie, więc drzwi są widoczne najdłużej.
 *
 * Ruch mówi „wiemy, co jest najważniejsze, i to zostaje, gdy braknie miejsca" —
 * czyli dokładnie to, co odróżnia custom od szablonu, na stronie, która to sprzedaje.
 *
 * Okno wyjścia [0.46, 0.62] nie jest dobrane na oko: krawędź arkusza dosięga dołu
 * zaparkowanego H1 przy --cover ≈ 0.82 (zmierzone). Ocalali gasną do zera z zapasem
 * 0.20 przed tym momentem — zamiatanie 35 klatek ma dawać zero przecięć.
 *
 * @param start próg, od którego wolno ruszyć (patrz wyżej — nie zgadywać)
 * @param px    dystans wzniosu = wysokość tego, co się zwolniło
 */
const survives = (start: number, px: number): React.CSSProperties => ({
  ['--up' as string]: ramp(start, 0.24),
  ['--out' as string]: ramp(0.46, 0.16),
  transform: `translate3d(0, calc(var(--up) * ${-px}px), 0)`,
  opacity: 'calc(1 - var(--out))',
});

const StandardHero: React.FC<StandardHeroProps> = ({
  badge,
  badgeIcon: _BadgeIcon,
  title,
  description,
  ctaPrimaryText,
  ctaPrimaryOnClick,
  ctaSecondaryText,
  ctaSecondaryOnClick,
  ctaSecondaryIcon,
  ctaSecondaryNode,
  backLinkPath,
  backLinkLabel,
  visual,
  priceHint,
  trustLine,
  tone = 'light',
  bottomBand,
  titleNode,
}) => {
  const navigate = useNavigate();
  const dark = tone === 'dark';
  // --cover ustawiane tylko w rejestrze ciemnym (tam żyje scroll-takeover).
  // Hooka nie da się wywołać warunkowo, więc bramka idzie parametrem.
  const heroRef = useHeroTakeover<HTMLElement>(dark);

  return (
    <section
      ref={dark ? heroRef : undefined}
      className={
        dark
          ? 'relative flex min-h-screen flex-col overflow-hidden bg-deep-dark pt-28 md:pt-32'
          : 'relative overflow-hidden bg-light-gray py-20 lg:py-28'
      }
    >
      {dark ? <HeroDarkBackdrop /> : <AmbientBackground />}

      {/* `w-full` jest KONIECZNE, nie kosmetyczne. Container ma `mx-auto`
          (margin-inline: auto), a na flex-itemie margin auto znosi stretch i wymusza
          shrink-to-fit — kontener renderował 960 px zamiast 1536, mimo max-width.
          Stąd „martwy kadr": prawe ~30% było puste. DESIGN.md mówi „hero idzie na
          pełną szerokość" — kod tego nie robił. */}
      <Container
        className={
          dark ? 'relative z-10 flex w-full flex-1 flex-col justify-center' : 'relative z-10'
        }
      >
        <div data-hero-covers={dark ? '' : undefined}>
          {backLinkPath && (
            <button
              style={dark ? yields(0.04, 0.16, 40) : undefined}
              onClick={() => navigate(backLinkPath)}
              className={`group mb-8 flex items-center text-sm font-semibold uppercase tracking-wider transition-colors ${
                dark ? 'text-white/55 hover:text-white' : 'text-gray-700 hover:text-secondary'
              }`}
            >
              <ArrowLeft
                className="mr-2 transition-transform group-hover:-translate-x-1"
                size={16}
              />
              {backLinkLabel || 'Wróć'}
            </button>
          )}

          <div className={visual ? 'flex flex-col items-center gap-16 lg:flex-row' : ''}>
            <div className={visual ? 'lg:w-1/2' : titleNode ? 'w-full' : 'max-w-4xl'}>
              {badge && (
                <HeroBadge accent={dark ? 'primary' : 'secondary'} className="mb-6">
                  {badge}
                </HeroBadge>
              )}

              {titleNode ? (
                <div style={dark ? survives(0.2, 56) : undefined}>{titleNode}</div>
              ) : (
                <h1
                  className={
                    dark
                      ? 'mb-6 text-balance break-words tracking-tight text-white'
                      : 'mb-6 text-balance break-words text-3xl font-extrabold leading-[1.1] text-dark animate-fade-in-up xs:text-4xl sm:text-5xl lg:text-6xl'
                  }
                >
                  <HeroTitle title={title} tone={tone} />
                </h1>
              )}

              {/* W rejestrze ciemnym BEZ `animate-fade-in-up`. To nie kosmetyka:
                  fadeInUp ma `forwards` i animuje opacity+transform, a animacja BIJE
                  styl inline w kaskadzie — rampy --cover były po cichu nadpisywane,
                  tekst stał z kryciem 1, a CTA (bez tej klasy) przelatywało po nim.
                  DESIGN.md → The Delay Is Not Choreography Rule i tak to potępia. */}
              <p
                className={`mb-4 max-w-2xl text-xl leading-relaxed ${
                  dark ? 'text-white/75' : 'animate-fade-in-up text-gray-600'
                }`}
                style={dark ? yields(0.1, 0.2) : { animationDelay: '0.1s' }}
              >
                {description}
              </p>

              {priceHint && (
                <p
                  className={`mb-6 text-sm font-semibold ${
                    dark ? 'text-primary' : 'animate-fade-in-up text-secondary'
                  }`}
                  style={dark ? yields(0.16, 0.18, 50) : { animationDelay: '0.15s' }}
                >
                  {priceHint}
                </p>
              )}
              {!priceHint && <div className="mb-4" />}

              <div style={dark ? survives(0.34, 0) : undefined}>
                <HeroButtons
                  ctaPrimaryText={ctaPrimaryText}
                  ctaPrimaryOnClick={ctaPrimaryOnClick}
                  ctaSecondaryText={ctaSecondaryText}
                  ctaSecondaryOnClick={ctaSecondaryOnClick}
                  ctaSecondaryIcon={ctaSecondaryIcon}
                  ctaSecondaryNode={ctaSecondaryNode}
                  tone={tone}
                />
              </div>

              {trustLine && (
                <div
                  className={dark ? 'mt-5' : 'mt-5 animate-fade-in-up'}
                  style={dark ? yields(0.06, 0.16, 40) : { animationDelay: '0.4s' }}
                >
                  {trustLine}
                </div>
              )}
            </div>

            {visual && (
              <div
                className="relative w-full animate-fade-in-up lg:w-1/2"
                style={{ animationDelay: '0.3s' }}
              >
                {visual}
              </div>
            )}
          </div>
        </div>
      </Container>

      {bottomBand && (
        <div
          data-hero-covers={dark ? '' : undefined}
          className="relative z-10 w-full"
          style={dark ? yields(0, 0.14, 60) : undefined}
        >
          <Container>{bottomBand}</Container>
        </div>
      )}
    </section>
  );
};

export default StandardHero;
