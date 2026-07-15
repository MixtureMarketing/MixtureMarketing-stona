import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { client } from '../../../services/cms/client';
import { SanityImage } from '../../../types/sanity';
import { WEB_DEV_CONTENT } from '../../../data/content';

/**
 * Sekcja „custom w znajomym WordPressie".
 *
 * Redesign: usunięto komplet atrap — ozdobny snippet `custom-logic.php` (kod
 * pisany pod zrzut, nie z projektu), dwa blur-bloby, wymyślone „0.02s Query Time",
 * obrócony badge „Connected" i animate-float. To były dokładnie te „ozdobne snippety
 * kodu" i „floating bloby", które PRODUCT.md wymienia w anty-referencjach z nazwy.
 *
 * W ich miejsce: prawdziwy zrzut silnika rezerwacji Fundacji Niepodzielni
 * (gallery[0] case study) — wspólny kalendarz wielu specjalistów, który zbudowaliśmy
 * na API Bookero, zastępując gotową wtyczkę. Podpis nazywa granicę wprost: silnik
 * jest nasz, Bookero jest cudze. Bez tego rozgraniczenia przypisalibyśmy sobie
 * zewnętrzny system.
 *
 * Ruch (The Motion Has A Job Rule): najpierw siada twierdzenie (lewa kolumna, 24px),
 * dowód ląduje pod nim później (zrzut, 56px) — kolejność „teza, potem dowód" jest
 * zadaniem tego ruchu. Spoczynek = var(--p, 1); prerender/reduced-motion widzą statykę.
 */

const builder = imageUrlBuilder(client);

// Zrzut dowodowy: gallery[0] case study Niepodzielnych = ekran „Znajdź swojego
// specjalistę". Jeśli wpis lub galeria zniknie z CMS, sekcja degraduje się do
// samej kolumny tekstowej — bez pustej ramki i bez atrapy w zastępstwie.
const PROOF_QUERY = `*[_type == "caseStudy" && slug.current == "fundacja-niepodzielni"][0]{"img": gallery[0]}`;

const WebDevWpCustom: React.FC = () => {
  const [proof, setProof] = useState<SanityImage | null>(null);
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    let alive = true;
    import('../../../services/cms/client')
      .then(({ fetchWithCache }) => fetchWithCache<{ img?: SanityImage } | null>(PROOF_QUERY))
      .then((r) => {
        if (alive) setProof(r?.img ?? null);
      })
      .catch(() => {
        if (alive) setProof(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    // Sekcja pisana wprost, nie przez SectionWrapper: useSectionProgress musi
    // ustawić --p na elemencie, po którym dziedziczą dzieci, a SectionWrapper
    // nie forwarduje refa.
    // Sekcja CIEMNA — The Ciemnia Rule: granat istnieje po to, żeby realizacje
    // świeciły, a ta sekcja niesie prawdziwy zrzut działającego silnika rezerwacji.
    // Drugi ciemny punkt kotwiczący strony: bez niego całość po Realizacjach to
    // nieprzerwany jasny ciąg dziewięciu sekcji.
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
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div
            className="lg:w-1/2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-balance text-white md:text-4xl">
              {WEB_DEV_CONTENT.wpCustom.title}{' '}
              <span className="text-primary">{WEB_DEV_CONTENT.wpCustom.titleAccent}</span>
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/75">
              {WEB_DEV_CONTENT.wpCustom.description}
            </p>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WEB_DEV_CONTENT.wpCustom.features.map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs text-white/65">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="w-full lg:w-1/2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 56px), 0)' }}
          >
            {proof && (
              <figure>
                <Link
                  to="/portfolio/fundacja-niepodzielni"
                  className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-primary/50"
                >
                  <img
                    src={builder.image(proof).width(1200).fit('max').auto('format').url()}
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
      </Container>
    </section>
  );
};

export default WebDevWpCustom;
