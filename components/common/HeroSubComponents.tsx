import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import Button from './Button';

type Tone = 'light' | 'dark';

/**
 * Tło hero w rejestrze ciemnym: głębia + poświaty w kolorach marki, winieta
 * prowadząca wzrok do środka i grain. Wszystko na tanich gradientach radialnych
 * (bez blur-filtra) — widoczne również w prerenderze i przy wyłączonym JS.
 *
 * Canvas „Mixture" celowo NIE jest tu replikowany: sygnaturowa scena generatywna
 * jest własnością hero strony głównej (DESIGN.md → Scena Mixture). Podstrony
 * dziedziczą granat i typografię, nie canvas.
 */
export const HeroDarkBackdrop: React.FC = () => (
  <>
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          'linear-gradient(180deg, var(--color-deep-dark) 0%, #0d1529 55%, var(--color-deep-dark) 100%),' +
          'radial-gradient(42% 34% at 26% 24%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 64%),' +
          'radial-gradient(38% 34% at 76% 72%, color-mix(in srgb, var(--color-secondary) 14%, transparent), transparent 66%)',
        backgroundBlendMode: 'normal, screen, screen',
      }}
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute inset-0 z-[2]"
      style={{
        background: 'radial-gradient(118% 88% at 50% 44%, transparent 52%, rgba(5,9,20,0.72) 100%)',
      }}
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute inset-0 z-[3] opacity-[0.05]"
      style={{ backgroundImage: "url('/assets/noise.svg')", backgroundSize: '160px 160px' }}
      aria-hidden="true"
    />
  </>
);

interface HeroTitleProps {
  title: string | { line1: string; line2: string; accent?: string };
  tone?: Tone;
}

/**
 * Akcent H1 niesie solidny kolor marki, nie gradient. Gradient-clip text jest
 * anty-referencją (PRODUCT.md) i absolutnym zakazem (DESIGN.md) — emfaza idzie
 * przez wagę i skalę.
 *
 * Kolor zależy od rejestru tła i to nie jest kosmetyka:
 * - jasne tło (`bg-light-gray` #f9fafb) → `accent-dark` (#2d739a) = 4.99:1.
 *   `primary` dałby tam 2.17:1, czyli oblewa nawet próg 3:1 dla dużego tekstu.
 * - ciemne tło (`bg-deep-dark` #0b1120) → `primary` (#61b6de) = 8.30:1, tak jak
 *   w hero strony głównej („Wybierz Partnera.").
 * Wzorzec koloru nie przenosi się między rejestrami (DESIGN.md → Akcent AA).
 */
export const HeroTitle: React.FC<HeroTitleProps> = ({ title, tone = 'light' }) => {
  const accent = tone === 'dark' ? 'text-primary' : 'text-accent-dark';
  if (typeof title === 'string') return <>{title}</>;
  const t = title || { line1: '', line2: '' };

  // Rejestr ciemny dziedziczy wzorzec hero strony głównej: linia wprowadzająca
  // mała i wyciszona, puenta monumentalna. To nie jest kosmetyka — przy dwóch
  // liniach w tym samym, dużym stopniu polski nagłówek zjada 4 wiersze i wypycha
  // CTA poniżej foldu. Fraza kluczowa zostaje w H1 (SEO), rozmiar dostaje puenta.
  if (tone === 'dark') {
    return (
      <>
        <span className="block text-2xl font-medium text-white/60 sm:text-3xl lg:text-4xl">
          {t.line1}
        </span>
        <span className="mt-4 block text-[clamp(2.25rem,4.8vw,4rem)] font-extrabold leading-[1.05]">
          <span className={accent}>{t.line2}</span>
        </span>
        {t.accent && <span className={`block ${accent}`}>{t.accent}</span>}
      </>
    );
  }

  return (
    <>
      {t.line1} <br />
      <span className={accent}>{t.line2}</span>
      {t.accent && <span className={`block ${accent}`}>{t.accent}</span>}
    </>
  );
};

interface HeroButtonsProps {
  ctaPrimaryText: string;
  ctaPrimaryOnClick: () => void;
  ctaSecondaryText?: string;
  ctaSecondaryOnClick?: () => void;
  ctaSecondaryIcon?: LucideIcon;
  ctaSecondaryNode?: React.ReactNode;
  tone?: Tone;
}

export const HeroButtons: React.FC<HeroButtonsProps> = ({
  ctaPrimaryText,
  ctaPrimaryOnClick,
  ctaSecondaryText,
  ctaSecondaryOnClick,
  ctaSecondaryIcon: CtaSecondaryIcon,
  ctaSecondaryNode,
  tone = 'light',
}) => (
  // W rejestrze ciemnym BEZ `animate-fade-in-up`: fadeInUp ma `forwards` i animuje
  // opacity+transform, a animacja bije styl inline w kaskadzie — nadpisywałaby rampy
  // priorytetu przy scroll-takeover (--cover). Patrz StandardHero → survives().
  <div
    className={`flex flex-col gap-4 sm:flex-row ${tone === 'dark' ? '' : 'animate-fade-in-up'}`}
    style={tone === 'dark' ? undefined : { animationDelay: '0.2s' }}
  >
    <Button onClick={ctaPrimaryOnClick} icon={<ArrowRight size={18} />}>
      {ctaPrimaryText}
    </Button>
    {ctaSecondaryText && ctaSecondaryOnClick && (
      <Button
        // Na granacie wariant `secondary` (indygo na indygo) byłby nieczytelny —
        // ramka w bieli, jak w hero strony głównej.
        variant={tone === 'dark' ? 'outline' : 'secondary'}
        className={tone === 'dark' ? 'border-white/30 text-white hover:bg-white/10' : undefined}
        onClick={ctaSecondaryOnClick}
        icon={CtaSecondaryIcon && <CtaSecondaryIcon size={18} />}
      >
        {ctaSecondaryText}
      </Button>
    )}
    {ctaSecondaryNode}
  </div>
);
