/**
 * Wspólna sekcja przed final CTA dla 4 spokes Marketing (SEO/GoogleAds/
 * MetaAds/Analytics). Zawiera:
 * - FounderCard (FC2 — local B2B kupuje od czlowieka, brak biura)
 * - Spoke<->spoke cross-linki (3 inne specjalizacje — eliminuje dead-end)
 *
 * Sprint F3 FC1+FC2. Identyczny wzorzec do WebDevSpokeFooter (Grupa E).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShieldCheck, Megaphone, Activity } from 'lucide-react';
import FounderCard from './FounderCard';
import Container from './Container';

type SpokeType = 'seo' | 'google-ads' | 'meta-ads' | 'analytics';

const ALL_SPOKES: {
  type: SpokeType;
  title: string;
  desc: string;
  path: string;
  icon: React.ElementType;
  accent: string;
}[] = [
  {
    type: 'seo',
    title: 'Pozycjonowanie SEO',
    desc: 'Audyt techniczny, on-page, link building, Local Pack, content SEO. Mierzalne ROI.',
    path: '/marketing/seo/',
    icon: TrendingUp,
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    type: 'google-ads',
    title: 'Google Ads',
    desc: 'Search, Performance Max, Shopping, Display. ROAS średni 4.2× w kampaniach lokalnych.',
    path: '/marketing/google-ads/',
    icon: ShieldCheck,
    accent: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'meta-ads',
    title: 'Meta Ads',
    desc: 'Facebook + Instagram, Pixel + CAPI, kreacje video, retargeting + lookalike.',
    path: '/marketing/meta-ads/',
    icon: Megaphone,
    accent: 'bg-pink-100 text-pink-700',
  },
  {
    type: 'analytics',
    title: 'Analytics',
    desc: 'GA4 + GTM + server-side tracking + CAPI. Atrybucja per kanał, dashboardy.',
    path: '/marketing/analytics/',
    icon: Activity,
    accent: 'bg-amber-100 text-amber-700',
  },
];

interface MarketingSpokeFooterProps {
  /** Bieżący typ — pomijany w cross-linkach */
  currentType: SpokeType;
  /** Custom bio na FounderCard per intent */
  founderBio?: React.ReactNode;
}

const MarketingSpokeFooter: React.FC<MarketingSpokeFooterProps> = ({ currentType, founderBio }) => {
  const otherSpokes = ALL_SPOKES.filter((s) => s.type !== currentType);

  return (
    <section className="py-20 bg-light-gray">
      <Container>
        {/* FounderCard */}
        <div className="max-w-4xl mx-auto mb-12">
          <FounderCard intro="Z kim pracujesz" bio={founderBio} />
        </div>

        {/* Spoke<->spoke cross-linking */}
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 text-center mb-3">
            Inne specjalizacje marketingowe
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-dark text-center mb-8">
            Połącz z innym kanałem — często działają razem
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

export default MarketingSpokeFooter;
