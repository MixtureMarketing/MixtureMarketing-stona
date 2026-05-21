/**
 * Wspólna sekcja przed final CTA dla 4 subroute Web Dev (Corporate/Ecom/
 * Landing/CustomApp). Zawiera:
 * - FounderCard (CH1 trust signal — local B2B kupuje od czlowieka)
 * - Spoke↔spoke cross-linki (3 inne typy projektow — eliminuje "dead-end" landing)
 *
 * Sprint E3 EC2 + EC3.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShoppingCart, MousePointerClick, Code2 } from 'lucide-react';
import FounderCard from './FounderCard';
import Container from './Container';

type SpokeType = 'corporate' | 'ecommerce' | 'landing' | 'custom';

const ALL_SPOKES: {
  type: SpokeType;
  title: string;
  desc: string;
  path: string;
  icon: React.ElementType;
  accent: string;
}[] = [
  {
    type: 'corporate',
    title: 'Strony korporacyjne',
    desc: 'CMS z RODO, migracja, integracje ERP/CRM, wielojęzyczność.',
    path: '/web-development/corporate/',
    icon: Building2,
    accent: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'ecommerce',
    title: 'Sklepy internetowe',
    desc: 'Shoper, WooCommerce, dedykowany Next.js+Sanity, integracje płatności.',
    path: '/web-development/ecommerce/',
    icon: ShoppingCart,
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    type: 'landing',
    title: 'Landing pages',
    desc: 'Szybkie strony konwersyjne pod kampanie Google/Meta Ads.',
    path: '/web-development/landing-page/',
    icon: MousePointerClick,
    accent: 'bg-violet-100 text-violet-700',
  },
  {
    type: 'custom',
    title: 'Aplikacje dedykowane',
    desc: 'SaaS / B2B / portale klienckie. Next.js + Node.js + PostgreSQL.',
    path: '/web-development/custom-app/',
    icon: Code2,
    accent: 'bg-pink-100 text-pink-700',
  },
];

interface WebDevSpokeFooterProps {
  /** Bieżący typ strony — zostanie pominięty w cross-linkach */
  currentType: SpokeType;
  /** Custom bio na FounderCard per intent */
  founderBio?: React.ReactNode;
}

const WebDevSpokeFooter: React.FC<WebDevSpokeFooterProps> = ({ currentType, founderBio }) => {
  const otherSpokes = ALL_SPOKES.filter((s) => s.type !== currentType);

  return (
    <section className="py-20 bg-light-gray">
      <Container>
        {/* FounderCard */}
        <div className="max-w-4xl mx-auto mb-12">
          <FounderCard intro="Z kim pracujesz" bio={founderBio} />
        </div>

        {/* Spoke↔spoke cross-linking */}
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 text-center mb-3">
            Inne typy projektów web
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-dark text-center mb-8">
            Twój projekt nie pasuje? Zobacz pokrewne kategorie
          </h2>
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
};

export default WebDevSpokeFooter;
