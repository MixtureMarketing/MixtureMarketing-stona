/**
 * Wspólna sekcja przed final CTA na stronach spoke (Web Dev / Marketing / Design):
 * - FounderCard (local B2B kupuje od człowieka, brak biura)
 * - Spoke↔spoke cross-linki (pozostałe specjalizacje huba — eliminuje dead-end)
 *
 * Dane (lista spoke'ów, nagłówki) trzymają cienkie wrappery per hub:
 * WebDevSpokeFooter, MarketingSpokeFooter, DesignSpokeFooter.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FounderCard from './FounderCard';
import Container from './Container';

export interface Spoke<T extends string = string> {
  type: T;
  title: string;
  desc: string;
  path: string;
  icon: React.ElementType;
  /** Klasy tła + koloru ikony */
  accent: string;
}

export interface SpokeFooterProps<T extends string> {
  spokes: readonly Spoke<T>[];
  /** Bieżący typ — pomijany w cross-linkach */
  currentType: T;
  /** Etykieta nad nagłówkiem */
  eyebrow: string;
  heading: string;
  /** Custom bio na FounderCard per intent */
  founderBio?: React.ReactNode;
}

function SpokeFooter<T extends string>({
  spokes,
  currentType,
  eyebrow,
  heading,
  founderBio,
}: SpokeFooterProps<T>) {
  const otherSpokes = spokes.filter((s) => s.type !== currentType);

  return (
    <section className="py-20 bg-light-gray">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <FounderCard intro="Z kim pracujesz" bio={founderBio} />
        </div>

        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 text-center mb-3">
            {eyebrow}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-dark text-center mb-8">{heading}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {otherSpokes.map((spoke) => {
              const Icon = spoke.icon;
              return (
                <Link
                  key={spoke.type}
                  to={spoke.path}
                  className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-secondary/40 hover:shadow-lg motion-safe:focus-visible:-translate-y-0.5 transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${spoke.accent}`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-dark mb-1.5 flex items-center gap-1.5">
                    {spoke.title}
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-secondary"
                    />
                  </h3>
                  <p className="text-sm text-gray-600">{spoke.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default SpokeFooter;
