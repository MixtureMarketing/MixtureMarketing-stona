import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, CreditCard, Database, PlugZap, LucideIcon } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { client } from '../../../services/cms/client';
import { SanityImage } from '../../../types/sanity';
import { WEB_DEV_CONTENT } from '../../../data/content';

/**
 * Sekcja „custom w znajomym WordPressie" — teza: klient pracuje w znanym panelu,
 * dedykowana jest aplikacja pod spodem. Dowód: trzy realne rozszerzenia z JEDNEGO
 * wdrożenia (Fundacja Niepodzielni, WordPress na Bedrocku): silnik rezerwacji na
 * API Bookero, Psychomapa (własny typ treści na mapie) i menu z żywymi terminami.
 * Każda figura nosi etykietę możliwości, której dowodzi — teza i dowód spotykają
 * się wizualnie, a nie w dwóch osobnych kolumnach.
 *
 * Mechanizmy podpisów ZWERYFIKOWANE w kodzie fundacji (2026-07-15): menu czyta
 * terminy z metadanych synchronizowanych z Bookero, Psychomapa to własny CPT
 * `osrodki` + endpoint + import CLI. Podpisy nazywają granicę odpowiedzialności
 * (silnik nasz — Bookero i OpenStreetMap cudze).
 */

const builder = imageUrlBuilder(client);

/**
 * Zrzuty przypięte po `_ref` (hash treści pliku), nie po indeksie galerii: podpis
 * nigdy nie trafi pod cudzy obraz. Gdy obraz zniknie z galerii, figura znika bez
 * pustej ramki — sekcja degraduje się do tekstu, nie do atrapy.
 */
const PROOF_QUERY = `*[_type == "caseStudy" && slug.current == "fundacja-niepodzielni"][0]{
  "engine": gallery[asset._ref == "image-4d93a928a4bb0fdf9e3a7367c8a9a5933096ad59-1900x895-png"][0],
  "map": gallery[asset._ref == "image-356dac554da5a8e10f0a085680026b6f4625b30c-1914x859-png"][0],
  "menu": gallery[asset._ref == "image-df8b17f1e17c1a49d522a090ca4d71c164cb3fe7-849x451-png"][0]
}`;

interface WpProof {
  engine?: SanityImage | null;
  map?: SanityImage | null;
  menu?: SanityImage | null;
}

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

const WebDevWpCustom: React.FC = () => {
  const [proof, setProof] = useState<WpProof | null>(null);
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    let alive = true;
    import('../../../services/cms/client')
      .then(({ fetchWithCache }) => fetchWithCache<WpProof | null>(PROOF_QUERY))
      .then((r) => {
        if (alive) setProof(r ?? null);
      })
      .catch(() => {
        if (alive) setProof(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    // Sekcja CIEMNA — The Ciemnia Rule: granat istnieje po to, żeby realizacje
    // świeciły, a tu świecą trzy realne zrzuty działającego wdrożenia.
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-deep-dark py-24 md:py-32 lg:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(38% 44% at 6% 8%, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 64%),' +
            'radial-gradient(40% 46% at 94% 92%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 66%)',
        }}
        aria-hidden="true"
      />
      <Container className="relative z-10">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-16">
          <div
            className="lg:w-1/2"
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
              tania głębia (gradient, nie filtr), żeby zrzut nie wyglądał na
              wklejony 1px ramką w morze granatu. */}
          <div
            className="w-full lg:w-1/2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 56px), 0)' }}
          >
            {proof?.engine && (
              <figure className="relative">
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
                  className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
                >
                  <img
                    src={builder.image(proof.engine).width(1200).fit('max').auto('format').url()}
                    alt="Silnik rezerwacji Fundacji Niepodzielni: wspólny kalendarz wielu specjalistów z filtrami i najbliższymi wolnymi terminami"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    loading="lazy"
                    decoding="async"
                    className="w-full"
                  />
                </Link>
                {/* Granica odpowiedzialności nazwana wprost — silnik nasz, Bookero cudze. */}
                <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
                  Silnik rezerwacji, który napisaliśmy na API{' '}
                  <span className="font-semibold text-white">Bookero</span> — wspólny kalendarz
                  wielu specjalistów w miejsce gotowej wtyczki.{' '}
                  <Link
                    to="/portfolio/fundacja-niepodzielni"
                    className="font-bold text-primary underline-offset-4 hover:underline"
                  >
                    Fundacja Niepodzielni
                    <ArrowRight size={14} className="ml-1 inline" aria-hidden="true" />
                  </Link>
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        {/* Dowody 2 i 3 — z TEGO SAMEGO wdrożenia, dojeżdżają po tezie. */}
        {(proof?.map || proof?.menu) && (
          <div
            className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10 lg:mt-20 lg:gap-16"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 88px), 0)' }}
          >
            {proof?.map && (
              <figure>
                <ProofTag label="Custom Post Types" />
                <Link
                  to="/portfolio/fundacja-niepodzielni"
                  className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
                >
                  <img
                    src={builder.image(proof.map).width(900).fit('max').auto('format').url()}
                    alt="Psychomapa Fundacji Niepodzielni: interaktywna mapa Polski z ośrodkami pomocy psychologicznej pogrupowanymi w regiony"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    loading="lazy"
                    decoding="async"
                    className="w-full"
                  />
                </Link>
                <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
                  Psychomapa — ogólnopolski katalog ośrodków pomocy jako własny typ treści w
                  WordPressie, na otwartej mapie{' '}
                  <span className="font-semibold text-white">OpenStreetMap</span>.
                </figcaption>
              </figure>
            )}
            {proof?.menu && (
              <figure>
                <ProofTag label="Integracje API" />
                <Link
                  to="/portfolio/fundacja-niepodzielni"
                  className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
                >
                  <img
                    src={builder.image(proof.menu).width(900).fit('max').auto('format').url()}
                    alt="Rozwinięte menu strony Fundacji Niepodzielni: rodzaje konsultacji oraz najbliższe wolne terminy psychologów"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    loading="lazy"
                    decoding="async"
                    className="w-full"
                  />
                </Link>
                <figcaption className="mt-4 text-sm leading-relaxed text-white/65">
                  Najbliższe wolne terminy specjalistów prosto w menu strony — dane z systemu
                  rezerwacji, nie wpisywane ręcznie.
                </figcaption>
              </figure>
            )}
          </div>
        )}
      </Container>
    </section>
  );
};

export default WebDevWpCustom;
