import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';
import { MMB_SECTIONS, MMB_TEXT as T, isCurrentPage } from './mobileMenuBData';
import type { DragZone } from './useMobileMenuB';

// MIX-1465: ekran „Oferta” menu B (makieta 3daea5a): strzałka wstecz, trzy zakładki, lista usług.
// Każda zakładka ma własny panel (nieaktywne `hidden`), więc wszystkie linki są w HTML.

export const OFFER_SCREEN_ID = 'mobile-menu-offer';
export const OFFER_TITLE_ID = 'mobile-menu-offer-title';
export type Swap = '' | 'swap' | 'swap from-left';

export const stagger = (i: number, j?: number) =>
  ({ '--i': i, ...(j === undefined ? {} : { '--j': j }) }) as React.CSSProperties;
export const current = (on: boolean) => (on ? ('page' as const) : undefined);

interface OfferScreenProps {
  active: boolean;
  hasMore: boolean;
  tab: number;
  swap: Swap;
  path: string;
  dragZone: DragZone;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  titleRef: React.RefObject<HTMLParagraphElement | null>;
  onScroll: () => void;
  onBack: () => void;
  onSelectTab: (index: number) => void;
  onNavigate: () => void;
}

const MobileMenuBOffer: React.FC<OfferScreenProps> = ({
  active,
  hasMore,
  tab,
  swap,
  path,
  dragZone,
  scrollRef,
  titleRef,
  onScroll,
  onBack,
  onSelectTab,
  onNavigate,
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const n = MMB_SECTIONS.length;
    const next = (
      {
        ArrowRight: (tab + 1) % n,
        ArrowLeft: (tab + n - 1) % n,
        Home: 0,
        End: n - 1,
      } as Record<string, number>
    )[e.key];
    if (next === undefined) return;
    e.preventDefault();
    onSelectTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id={OFFER_SCREEN_ID}
      className={`mmb-screen mmb-screen-offer${active ? ' is-active' : ''}${hasMore ? ' has-more' : ''}`}
      role="region"
      aria-labelledby={OFFER_TITLE_ID}
      inert={!active}
    >
      <div className="mmb-head" {...dragZone}>
        <button
          className="mmb-back mmb-stg"
          type="button"
          aria-label={T.back}
          style={stagger(0)}
          onClick={onBack}
        >
          <ChevronLeft className="mmb-ico" size={20} aria-hidden="true" />
        </button>
        {/* Wygląd nagłówka z makiety (h2), ale bez znacznika h2: menu leży w DOM przed <h1>
            strony (test MIX-1411 „bez nagłówków h1–h6”). */}
        <p
          className="mmb-title mmb-stg"
          id={OFFER_TITLE_ID}
          ref={titleRef}
          tabIndex={-1}
          style={stagger(0)}
        >
          {CONTENT.offer.label}
        </p>
      </div>
      <div ref={scrollRef} className="mmb-scroll" onScroll={onScroll}>
        <div
          className="mmb-tabs mmb-stg"
          role="tablist"
          aria-label={T.tabs}
          style={stagger(1)}
          onKeyDown={onTabKeyDown}
        >
          <span
            className="mmb-tab-ind"
            aria-hidden="true"
            style={{ '--t': tab } as React.CSSProperties}
          />
          {MMB_SECTIONS.map((s, i) => (
            <button
              key={s.target}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className="mmb-tab"
              role="tab"
              id={`mobile-menu-tab-${i}`}
              aria-selected={i === tab}
              aria-controls={`mobile-menu-panel-${i}`}
              tabIndex={i === tab ? 0 : -1}
              type="button"
              onClick={() => onSelectTab(i)}
            >
              {s.tab}
            </button>
          ))}
        </div>
        {MMB_SECTIONS.map((s, i) => (
          <div
            key={s.target}
            id={`mobile-menu-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`mobile-menu-tab-${i}`}
            tabIndex={0}
            hidden={i !== tab}
          >
            <p className="mmb-panel-desc mmb-stg" style={stagger(2)}>
              <strong>{s.category}</strong> · {s.description}
            </p>
            <ul className={`mmb-svc ${i === tab ? swap : ''}`}>
              {s.items.map((item, j) => {
                const Icon = item.icon;
                return (
                  <li key={item.target} className="mmb-stg" style={stagger(3 + j, j)}>
                    <Link
                      to={item.target}
                      onClick={onNavigate}
                      className="mmb-row"
                      aria-current={current(isCurrentPage(path, item.target))}
                    >
                      <span className="mmb-tile">
                        <Icon className="mmb-ico" size={20} aria-hidden="true" />
                      </span>
                      <span className="mmb-row-txt">
                        <strong>{item.label}</strong>
                        <small>{item.desc}</small>
                      </span>
                      <ChevronRight className="mmb-ico" size={20} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              to={s.target}
              onClick={onNavigate}
              className="mmb-see-all mmb-stg"
              style={stagger(7)}
              aria-current={current(isCurrentPage(path, s.target))}
            >
              <span>{`${CONTENT.mobileMenu.seeAll}: ${s.category}`}</span>
              <ArrowRight className="mmb-ico" size={20} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MobileMenuBOffer;
