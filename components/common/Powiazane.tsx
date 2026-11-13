import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCmsDocument, CMS_DOC } from '@/hooks/useCmsDocument';
import { relatedService, relatedKey } from '@/services/cms/relatedService';
import { relatedHref, RelatedLink, RelatedType, RELATED_LIMIT } from '@/utils/related';

/** Podpis rodzaju nad tytułem linku. Treść do akceptacji Jakuba (MIX-1268). */
export const RELATED_TYPE_LABEL: Record<RelatedType, string> = {
  article: 'Artykuł',
  caseStudy: 'Realizacja',
  industry: 'Branża',
};

interface PowiazaneListaProps {
  links: ReadonlyArray<RelatedLink> | null | undefined;
}

/**
 * Widok bloku „Powiązane” (MIX-1268). Pusta lista = `null`: bez sekcji, bez nagłówka
 * i bez zarezerwowanego miejsca (brak przesunięcia układu, CLS).
 */
export const PowiazaneLista: React.FC<PowiazaneListaProps> = ({ links }) => {
  const headingId = useId();
  const items = Array.isArray(links) ? links.slice(0, RELATED_LIMIT) : [];
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="powiazane py-16 bg-white border-t border-gray-200"
      data-powiazane={items.length}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 id={headingId} className="text-2xl font-bold text-dark mb-8">
          Powiązane
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((link) => (
            <li key={`${link._type}|${link.slug}`}>
              <Link
                to={relatedHref(link)}
                className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-dark transition-colors hover:border-secondary/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                    {RELATED_TYPE_LABEL[link._type]}
                  </span>
                  <span className="block text-base font-bold leading-snug group-hover:text-secondary">
                    {link.title}
                  </span>
                </span>
                <ArrowRight size={16} aria-hidden="true" className="text-secondary" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// Stabilna referencja fetchera (wymóg useCmsDocument).
const fetchRelated = relatedService.getRelatedFor;

interface PowiazaneProps {
  type: RelatedType;
  /** Publiczny slug bieżącej strony (z trasy). */
  slug: string | undefined;
}

/**
 * Blok „Powiązane” na stronie z CMS. Dane: zrzut z prerenderu (bez zapytania po starcie),
 * inaczej jedno zapytanie o pulę. Ładowanie, błąd i brak dopasowań = nic (bez szkieletu).
 */
const Powiazane: React.FC<PowiazaneProps> = ({ type, slug }) => {
  const { status, data } = useCmsDocument<RelatedLink[]>(
    slug ? relatedKey(type, slug) : undefined,
    fetchRelated,
    CMS_DOC.related,
  );
  if (status !== 'ok') return null;
  return <PowiazaneLista links={data} />;
};

export default Powiazane;
