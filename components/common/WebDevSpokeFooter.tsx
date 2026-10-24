/**
 * Wspólna sekcja przed final CTA dla 4 subroute Web Dev (Corporate/Ecom/
 * Landing/CustomApp). Zawiera:
 * - FounderCard (CH1 trust signal — local B2B kupuje od czlowieka)
 * - Spoke↔spoke cross-linki (3 inne typy projektow — eliminuje "dead-end" landing)
 *
 * Sprint E3 EC2 + EC3.
 */
import React from 'react';
import { Building2, ShoppingCart, MousePointerClick, Code2 } from 'lucide-react';
import SpokeFooter, { type Spoke } from './SpokeFooter';

type SpokeType = 'corporate' | 'ecommerce' | 'landing' | 'custom';

const ALL_SPOKES: Spoke<SpokeType>[] = [
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
    desc: 'WooCommerce, PrestaShop, przy nietypowej sprzedaży Medusa.js/Sylius. Płatności i BaseLinker.',
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

const WebDevSpokeFooter: React.FC<WebDevSpokeFooterProps> = (props) => (
  <SpokeFooter
    spokes={ALL_SPOKES}
    eyebrow="Inne typy projektów web"
    heading="Twój projekt nie pasuje? Zobacz pokrewne kategorie"
    {...props}
  />
);

export default WebDevSpokeFooter;
