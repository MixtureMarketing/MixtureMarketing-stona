import type React from 'react';
import type { FaqItem } from '../shared';

export type CellStatus = 'ok' | 'mid' | 'no';

export interface Cell {
  status: CellStatus;
  text: string;
}

export interface CompareRow {
  label: string;
  mixture: Cell;
  competitor: Cell;
}

/**
 * Treść strony porównawczej /abonament/vs-*. Wspólny układ renderuje
 * ComparisonPage; konfiguracje stron deklarujemy z `satisfies ComparisonConfig`.
 */
export interface ComparisonConfig {
  seo: {
    title: string;
    description: string;
    canonical: string;
    /** Nazwa ostatniego okruszka (BreadcrumbList) */
    breadcrumb: string;
  };
  hero: {
    badge: string;
    title: string;
    /** Druga linia h1 (gradient) */
    highlight: string;
    lead: React.ReactNode;
  };
  plans: {
    /** Podpis pod ceną na karcie Mixture */
    mixtureNote: string;
    competitor: {
      label: string;
      /** Kolor etykiety, np. 'text-gray-500' */
      labelColor: string;
      price: string;
      note: string;
    };
  };
  table: {
    scrollLabel: string;
    caption: string;
    competitorHeader: string;
    rows: readonly CompareRow[];
    /** Przypis pod tabelą */
    footnote?: string;
  };
  /** Dodatkowa sekcja między tabelą a „Kiedy X, kiedy Mixture?” */
  extraSection?: React.ReactNode;
  decisions: {
    heading: string;
    /** Szare tło sekcji (bg-gray-50/60) */
    muted?: boolean;
    competitor: {
      heading: string;
      icon: React.ElementType;
      /** Klasy kafelka ikony, np. 'bg-blue-100 text-blue-700' */
      iconTone: string;
      /** Kolor ikon CheckCircle2 przy punktach, np. 'text-blue-600' */
      checkColor: string;
      items: readonly string[];
    };
    mixtureItems: readonly string[];
  };
  faq: {
    items: readonly FaqItem[];
    className?: string;
  };
  cta: {
    muted?: boolean;
    heading: string;
    text: string;
    /** Główny (gradientowy) przycisk to telefon, a link drugi — inaczej odwrotnie */
    phoneFirst?: boolean;
    link: { to: string; label: string };
  };
}
