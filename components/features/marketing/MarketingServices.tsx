import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Megaphone, Search, TrendingUp, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { MARKETING_CONTENT as CONTENT } from '../../../data/content';

/**
 * Drabinka czterech usług → podstrony (przebudowa 2026-07-16). Poprzednik
 * („Arsenał Wzrostu"): mono-kostium, plakietki „KPI Target: TOP 3 w Google"
 * (quasi-obietnica pozycji — czerwona flaga dla poparzonej persony),
 * czwarty kolor spoza palety, backdrop-blur. Teraz: WIERSZE z akcentami
 * z palety marki, mechanika zamiast obietnic, stretched-link na całym
 * wierszu. Stagger na --p; spoczynek = pełna widoczność.
 */
const SERVICE_META: Record<string, { Icon: LucideIcon; accent: string; iconBg: string }> = {
  google: {
    Icon: Search,
    accent: 'group-hover:text-primary',
    iconBg: 'bg-primary/10 text-primary',
  },
  meta: {
    Icon: Megaphone,
    accent: 'group-hover:text-brand-pink',
    iconBg: 'bg-brand-pink/10 text-brand-pink',
  },
  seo: {
    Icon: TrendingUp,
    accent: 'group-hover:text-secondary',
    iconBg: 'bg-secondary/10 text-secondary',
  },
  analytics: {
    Icon: BarChart3,
    accent: 'group-hover:text-secondary',
    iconBg: 'bg-blue-50 text-secondary',
  },
};

const MarketingServices: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  return (
    <section ref={sectionRef} className="relative bg-light-gray py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.services.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {CONTENT.services.description}
          </p>
        </div>

        <div
          className="mt-12 divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white shadow-sm"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          {CONTENT.services.items.map((item, i) => {
            const { Icon, accent, iconBg } = SERVICE_META[item.id] ?? SERVICE_META.google;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col gap-4 px-6 py-7 md:grid md:grid-cols-[3.5rem_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center md:gap-8 md:px-9"
                style={{ transform: `translate3d(0, calc((1 - var(--p, 1)) * ${12 * i}px), 0)` }}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                >
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-extrabold tracking-tight text-dark transition-colors ${accent}`}
                  >
                    <Link to={item.path} className="after:absolute after:inset-0">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-sm font-semibold text-gray-500">{item.role}</p>
                </div>
                <p className="text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-dark md:justify-self-end">
                  Zobacz szczegóły
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default MarketingServices;
