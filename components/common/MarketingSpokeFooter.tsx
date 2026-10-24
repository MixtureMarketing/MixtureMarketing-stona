/**
 * Wspólna sekcja przed final CTA dla 4 spokes Marketing (SEO/GoogleAds/
 * MetaAds/Analytics). Zawiera:
 * - FounderCard (FC2 — local B2B kupuje od czlowieka, brak biura)
 * - Spoke<->spoke cross-linki (3 inne specjalizacje — eliminuje dead-end)
 *
 * Sprint F3 FC1+FC2. Identyczny wzorzec do WebDevSpokeFooter (Grupa E).
 */
import React from 'react';
import { TrendingUp, ShieldCheck, Megaphone, Activity } from 'lucide-react';
import SpokeFooter, { type Spoke } from './SpokeFooter';

type SpokeType = 'seo' | 'google-ads' | 'meta-ads' | 'analytics';

const ALL_SPOKES: Spoke<SpokeType>[] = [
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
    desc: 'Search, Performance Max, Shopping, Display. Integracja z GA4, konto reklamowe zostaje Twoje.',
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

const MarketingSpokeFooter: React.FC<MarketingSpokeFooterProps> = (props) => (
  <SpokeFooter
    spokes={ALL_SPOKES}
    eyebrow="Inne specjalizacje marketingowe"
    heading="Połącz z innym kanałem — często działają razem"
    {...props}
  />
);

export default MarketingSpokeFooter;
