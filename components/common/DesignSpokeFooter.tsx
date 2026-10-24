/**
 * Wspolna sekcja przed final CTA dla 4 spokes Design (UI-UX/Branding/Print/
 * VisualAudit). FounderCard + spoke<->spoke cross-linki. Identyczny wzorzec
 * do WebDevSpokeFooter (Grupa E) + MarketingSpokeFooter (Grupa F).
 */
import React from 'react';
import { Layout, Palette, Printer, Eye } from 'lucide-react';
import SpokeFooter, { type Spoke } from './SpokeFooter';

type SpokeType = 'ui-ux' | 'branding' | 'print' | 'visual-audit';

const ALL_SPOKES: Spoke<SpokeType>[] = [
  {
    type: 'ui-ux',
    title: 'UI / UX Design',
    desc: 'Projektowanie interfejsów: web, mobile, dashboardy. Figma, design system, prototyping.',
    path: '/design/ui-ux/',
    icon: Layout,
    accent: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'branding',
    title: 'Branding / Identity',
    desc: 'Logo, identyfikacja wizualna, brand book, naming. Strategia + projekt + wdrożenie.',
    path: '/design/branding/',
    icon: Palette,
    accent: 'bg-violet-100 text-violet-700',
  },
  {
    type: 'print',
    title: 'Print Design',
    desc: 'Materiały drukowane: katalogi, broszury, opakowania, POS. Przygotowanie do druku.',
    path: '/design/print/',
    icon: Printer,
    accent: 'bg-amber-100 text-amber-700',
  },
  {
    type: 'visual-audit',
    title: 'Audyt wizualny',
    desc: 'Ekspercka analiza brandingu i UI. Heuristic review, raport z rekomendacjami.',
    path: '/design/visual-audit/',
    icon: Eye,
    accent: 'bg-emerald-100 text-emerald-700',
  },
];

interface DesignSpokeFooterProps {
  currentType: SpokeType;
  founderBio?: React.ReactNode;
}

const DesignSpokeFooter: React.FC<DesignSpokeFooterProps> = (props) => (
  <SpokeFooter
    spokes={ALL_SPOKES}
    eyebrow="Inne usługi projektowe"
    heading="Połącz z innym obszarem designu"
    {...props}
  />
);

export default DesignSpokeFooter;
