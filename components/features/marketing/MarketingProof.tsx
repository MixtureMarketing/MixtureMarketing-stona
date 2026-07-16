import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, KeyRound, LayoutDashboard, LucideIcon } from 'lucide-react';
import imageUrlBuilder from '@sanity/image-url';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { client } from '../../../services/cms/client';
import { SanityImage } from '../../../types/sanity';
import WanderingGlow from '../../visuals/WanderingGlow';
import FlipDotHeading from '../../visuals/flipdot/FlipDotHeading';
import { MARKETING_CONTENT as CONTENT } from '../../../data/content';

/**
 * Ciemnia dowodowa huba /marketing/ (przebudowa 2026-07-16, krytyka 12/40).
 * Decyzja właściciela: nie mamy ANI JEDNEGO zmierzonego wyniku kampanii,
 * więc dowodem są realizacje z tagami reklamowymi/SEO z CMS + wprost
 * nazwana metoda pracy — zero fikcyjnych procentów (poprzednik pokazywał
 * losowo rosnący „przychód" i „ROAS 8.5" z powietrza).
 * Nagłówek składa tablica flip-dot (krótkie słowa — buduje się też na
 * mobile). Choreografia ciemni jak na /web-development/: zrzuty wychodzą
 * z granatu na --p, światło wędruje przez sekcję.
 */

const builder = imageUrlBuilder(client);

const MARKETING_TAGS: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  seo: 'SEO',
  analytics: 'Analityka',
};

/** Makiety z Figmy zamiast zrzutów wdrożeń — nie są dowodem (patrz
 *  WebDevRealizations.MOCKUP_SLUGS; ta sama weryfikacja wizualna 2026-07-15). */
const MOCKUP_SLUGS = new Set([
  'impackt-edu',
  'driftmark-marine-e-commerce-z-konfiguratorem-lodzi-i-rebranding',
]);

const METHOD_ICONS: LucideIcon[] = [LayoutDashboard, CalendarCheck, KeyRound];

interface Realization {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  date?: string;
  subcategory?: string[];
  mainImage?: SanityImage;
}

const MarketingProof: React.FC = () => {
  const [items, setItems] = useState<Realization[]>([]);
  const [failed, setFailed] = useState(false);
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  useEffect(() => {
    let alive = true;
    // Dynamiczny import — klient Sanity nie wchodzi do bundla wejściowego.
    import('../../../services/cms/caseStudyService')
      .then(({ caseStudyService }) => caseStudyService.getCaseStudies())
      .then((data) => {
        if (!alive) return;
        const today = new Date().toISOString().slice(0, 10);
        const usable = (data as unknown as Realization[])
          .filter((c) => c.mainImage)
          .filter((c) => !MOCKUP_SLUGS.has(c.slug))
          .filter((c) => !c.date || c.date <= today)
          // Dowód marketingowy = realizacja z tagiem reklamowym albo SEO.
          .filter((c) =>
            (c.subcategory ?? []).some(
              (s) => s === 'google_ads' || s === 'meta_ads' || s === 'seo',
            ),
          )
          .slice(0, 4);
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

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-deep-dark py-24 md:py-28">
      <WanderingGlow
        amplitude={12}
        background={
          'radial-gradient(40% 45% at 88% 4%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 62%),' +
          'radial-gradient(42% 48% at 6% 96%, color-mix(in srgb, var(--color-secondary) 24%, transparent), transparent 66%)'
        }
      />

      <Container className="relative z-10">
        <div
          className="max-w-4xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <FlipDotHeading
            text={CONTENT.proof.title}
            className="text-6xl font-extrabold tracking-tight text-balance text-white"
          />
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
            {CONTENT.proof.description}
          </p>
        </div>

        {failed && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
            <p className="text-white/75">
              Nie udało się załadować realizacji.{' '}
              <Link to="/portfolio" className="font-bold text-primary hover:underline">
                Przejdź do pełnego portfolio
              </Link>
              .
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div
            className="mt-12 grid grid-cols-1 items-start gap-6 sm:grid-cols-2"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
          >
            {items.map((item, i) => {
              const tags = (item.subcategory ?? []).filter((s) => MARKETING_TAGS[s]).slice(0, 3);
              return (
                <Link
                  key={item._id}
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
                      alt={`Zrzut realizacji: ${item.title}`}
                      sizes="(min-width: 640px) 45vw, 100vw"
                      loading="lazy"
                      decoding="async"
                      className="w-full transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                    />
                    {/* Ciemnia: warstwa gaśnie z --p, kolejne karty z opóźnieniem. */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-deep-dark"
                      style={{ opacity: `calc((1 - var(--p, 1)) * 2.2 - ${i * 0.25})` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xxs font-bold text-white/60"
                        >
                          {MARKETING_TAGS[t]}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary">
                      {item.title.trim()}
                    </h3>
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
              );
            })}
          </div>
        )}

        {/* Metoda pracy — to jest właściwa obietnica tej strony: nie procenty,
            tylko warunki współpracy, które da się sprawdzić pierwszego dnia. */}
        <ul
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          {CONTENT.proof.method.map((line, i) => {
            const Icon = METHOD_ICONS[i] ?? LayoutDashboard;
            return (
              <li key={line} className="flex items-start gap-3.5">
                <Icon size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-[15px] leading-relaxed text-white/75">{line}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-10">
          <Link
            to={CONTENT.proof.linkTo}
            className="inline-flex items-center gap-2 font-bold text-primary underline-offset-4 hover:underline"
          >
            {CONTENT.proof.linkLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      </Container>
    </section>
  );
};

export default MarketingProof;
