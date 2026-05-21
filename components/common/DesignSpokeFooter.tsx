/**
 * Wspolna sekcja przed final CTA dla 4 spokes Design (UI-UX/Branding/Print/
 * VisualAudit). FounderCard + spoke<->spoke cross-linki. Identyczny wzorzec
 * do WebDevSpokeFooter (Grupa E) + MarketingSpokeFooter (Grupa F).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layout, Palette, Printer, Eye } from 'lucide-react';
import FounderCard from './FounderCard';
import Container from './Container';

type SpokeType = 'ui-ux' | 'branding' | 'print' | 'visual-audit';

const ALL_SPOKES: {
  type: SpokeType;
  title: string;
  desc: string;
  path: string;
  icon: React.ElementType;
  accent: string;
}[] = [
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

const DesignSpokeFooter: React.FC<DesignSpokeFooterProps> = ({ currentType, founderBio }) => {
  const otherSpokes = ALL_SPOKES.filter((s) => s.type !== currentType);

  return (
    <section className="py-20 bg-light-gray">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <FounderCard intro="Z kim pracujesz" bio={founderBio} />
        </div>

        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 text-center mb-3">
            Inne usługi projektowe
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-dark text-center mb-8">
            Połącz z innym obszarem designu
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

export default DesignSpokeFooter;
