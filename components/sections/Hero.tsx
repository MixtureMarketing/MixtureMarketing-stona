import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Pause, Play } from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import Button from '../common/Button';
import TrustMarquee from '../common/TrustMarquee';
import MixtureField from '../visuals/hero/MixtureField';
import { HERO_CONTENT, HERO_TRUST } from '../../data/content';

interface HeroProps {
  onOpenModal?: () => void;
}

/**
 * Hero „Scena Mixture" — monumentalna typografia na sygnaturowym wizualu
 * generatywnym: inżynierska siatka kropek, przez którą płyną i mieszają się
 * barwne prądy marki (precyzja × kreatywność = Mixture, dosłownie).
 * Zero atrap, zero zrzutów realizacji, zero wymyślonych liczb — dowód niesie
 * typograficzny pas realizacji (TrustMarquee) i sekcje poniżej.
 *
 * LCP = tekst H1 (widoczny domyślnie, prerender-safe). Canvas montuje się
 * dopiero po hydratacji (dynamiczny import silnika); prerender i no-JS widzą
 * czysty granat z poświatami CSS. Reduced-motion: statyczna klatka pola.
 *
 * Scroll-takeover (desktop, motion-safe — klasy hero-runway/hero-pin w Home):
 * hero jest przypięty, arkusz „Kompetencji" najeżdża od dołu, silnik rozpycha
 * kropki przed jego krawędzią, a treść (--cover) lekko ucieka i gaśnie.
 */
const Hero: React.FC<HeroProps> = ({ onOpenModal: _onOpenModal }) => {
  const navigate = useNavigate();
  // Pauza ruchu ciągłego (scena + marquee) — wymóg WCAG 2.2.2 (pause/stop/hide).
  const [motionPaused, setMotionPaused] = useState(false);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-deep-dark pt-28 md:pt-32">
      {/* Baza sceny — głębia + poświaty w kolorach prądów (widoczne też w prerenderze) */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(180deg, var(--color-deep-dark) 0%, #0d1529 55%, var(--color-deep-dark) 100%),' +
            'radial-gradient(42% 34% at 26% 24%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 64%),' +
            'radial-gradient(38% 34% at 76% 72%, color-mix(in srgb, var(--color-secondary) 14%, transparent), transparent 66%)',
          backgroundBlendMode: 'normal, screen, screen',
        }}
      />

      {/* Pole mieszania — siatka × prądy (canvas, klient-only) */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <MixtureField paused={motionPaused} />
      </div>

      {/* Winieta — wtapia krawędzie pola w mrok, prowadzi wzrok do środka */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(118% 88% at 50% 44%, transparent 52%, rgba(5,9,20,0.72) 100%)',
        }}
      />

      {/* Grain — spójny z resztą sceny */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.05]"
        style={{ backgroundImage: "url('/assets/noise.svg')", backgroundSize: '160px 160px' }}
        aria-hidden="true"
      />

      {/* --cover (0..1, ustawiane przez MixtureField przy scroll-takeover):
          treść lekko ucieka w górę i gaśnie, gdy arkusz „Kompetencji" najeżdża */}
      <div
        data-hero-covers
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-14 text-center sm:px-6"
        style={{
          transform: 'translate3d(0, calc(var(--cover, 0) * -48px), 0)',
          opacity: 'calc(1 - var(--cover, 0) * 0.45)',
        }}
      >
        <AnimateOnScroll>
          <h1 className="text-balance tracking-tight text-white">
            <span className="block text-2xl font-medium text-white/60 sm:text-3xl lg:text-4xl">
              {HERO_CONTENT.title.line1} {HERO_CONTENT.title.line2}
            </span>
            <span className="mt-4 block text-[clamp(3rem,8.5vw,6rem)] font-black leading-[1.04]">
              Wybierz <span className="text-primary">Partnera</span>.
            </span>
          </h1>
        </AnimateOnScroll>

        <AnimateOnScroll delay={450}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
            {HERO_CONTENT.description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
            <Button
              onClick={() => navigate('/audyt-360/')}
              variant="primary"
              size="lg"
              className="h-14 w-full px-9 text-base shadow-2xl shadow-secondary/30 motion-safe:hover:scale-[1.03] sm:w-auto md:h-16 md:text-lg"
              icon={<ArrowRight size={22} />}
            >
              Darmowy audyt strony w 60s
            </Button>

            <button
              type="button"
              onClick={() => navigate('/offers#calculator')}
              className="group inline-flex min-h-11 items-center gap-2 px-2 text-base font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Oblicz wycenę projektu
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>

          <Link
            to="/miasto/rzeszow/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-white/55 transition-colors hover:text-white/85"
          >
            <MapPin size={15} className="text-primary" aria-hidden="true" />
            <span>Rzeszów i cała Polska</span>
          </Link>
        </AnimateOnScroll>
      </div>

      {/* Typograficzny pas realizacji — uczciwy dowód bez zrzutów (logo klientów
          podmienimy tu bez zmiany struktury, gdy prawa będą zebrane).
          Przycisk pauzy zatrzymuje marquee + scenę (WCAG 2.2.2); ukryty przy
          reduced-motion, bo wtedy nic się nie rusza. */}
      <div
        data-hero-covers
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 md:pb-32"
      >
        <AnimateOnScroll delay={650}>
          <div className="flex items-center gap-4">
            <TrustMarquee
              className="min-w-0 flex-1"
              label={HERO_TRUST.label}
              items={HERO_TRUST.items}
              paused={motionPaused}
            />
            <button
              type="button"
              onClick={() => setMotionPaused((p) => !p)}
              aria-pressed={motionPaused}
              aria-label={motionPaused ? 'Wznów animacje tła' : 'Zatrzymaj animacje tła'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition-colors hover:border-white/35 hover:text-white motion-reduce:hidden"
            >
              {motionPaused ? (
                <Play size={15} aria-hidden="true" />
              ) : (
                <Pause size={15} aria-hidden="true" />
              )}
            </button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Hero;
