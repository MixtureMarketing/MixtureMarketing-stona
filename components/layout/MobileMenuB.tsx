import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Phone, X } from 'lucide-react';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';
import { SITE_CONFIG } from '@/config/site';
import { ContactType } from '@/types';
import {
  MMB_MAIN_AFTER,
  MMB_MAIN_BEFORE,
  MMB_OFFER_ICON as OfferIcon,
  MMB_SERVICE_COUNT,
  MMB_TEXT as T,
  MmbMainLink,
  isCurrentPage,
} from './mobileMenuBData';
import MobileMenuBOffer, { OFFER_SCREEN_ID, Swap, current, stagger } from './MobileMenuBOffer';
import { focusables, useCloseOnDesktop, useOpenSheet, useSheetDrag } from './useMobileMenuB';
import { loadMobileMenuBFont } from './mobileMenuBFont';
import './mobileMenuB.css';

// Wariant B menu mobilnego (MIX-1411, za przełącznikiem VITE_MM_MOBILE_MENU_B, patrz
// mobileMenuFlag.ts), od MIX-1465 = zatwierdzona makieta B „Karta pod kciukiem”
// (makiety/mix1465/zrodla/b.src.html @ 3daea5a): karta od dołu z uchwytem, ekran „Oferta” z trzema
// zakładkami. Decyzje Jakuba (MIX-1465, 12.11): Escape najpierw wraca o poziom (Oferta → menu),
// na ekranie głównym zamyka i oddaje fokus przyciskowi menu; podświetlona jest pozycja bieżącej
// strony (aria-current="page"), na stronie głównej żadna.

export { OFFER_SCREEN_ID };
/** Reset ekranu i zakładki po zamknięciu, gdy karta już zjechała (jak w makiecie). */
export const RESET_AFTER_CLOSE_MS = 320;

interface MobileMenuBProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  location: { pathname: string };
  openModal: (type: ContactType, data?: Record<string, unknown>) => void;
}

type Screen = 'main' | 'offer';

const MobileMenuB: React.FC<MobileMenuBProps> = ({ isOpen, setIsOpen, location, openModal }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [tab, setTab] = useState(0);
  const [swap, setSwap] = useState<Swap>('');
  const [hasMore, setHasMore] = useState({ main: false, offer: false });
  const layerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const offerScrollRef = useRef<HTMLDivElement>(null);
  const offerButtonRef = useRef<HTMLButtonElement>(null);
  const offerTitleRef = useRef<HTMLParagraphElement>(null);

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const path = location.pathname;
  const offerActive = screen === 'offer';

  // Delikatne przygaszenie u dołu listy, gdy jest jeszcze coś do przewinięcia.
  const updateFade = useCallback(() => {
    const more = (el: HTMLDivElement | null) =>
      !!el && el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    const next = { main: more(mainScrollRef.current), offer: more(offerScrollRef.current) };
    setHasMore((prev) => (prev.main === next.main && prev.offer === next.offer ? prev : next));
  }, []);

  // Fokus po zmianie ekranu: wejście = nagłówek „Oferta”, powrót = przycisk „Oferta”.
  const showScreen = useCallback(
    (next: Screen) => {
      flushSync(() => setScreen(next));
      (next === 'offer' ? offerTitleRef : offerButtonRef).current?.focus({ preventScroll: true });
      updateFade();
    },
    [updateFade],
  );

  const selectTab = (index: number) => {
    if (index === tab) return;
    setSwap(index < tab ? 'swap from-left' : 'swap');
    setTab(index);
    requestAnimationFrame(updateFade);
  };

  // Krój menu (Manrope 700 z makiety) w wolnej chwili po załadowaniu strony, najpóźniej przy otwarciu.
  useEffect(() => {
    if (isOpen) return loadMobileMenuBFont();
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(loadMobileMenuBFont);
    else setTimeout(loadMobileMenuBFont, 1500);
  }, [isOpen]);
  useOpenSheet(isOpen, layerRef, closeRef, updateFade);
  const dragZone = useSheetDrag(layerRef, menuRef, close);

  // Reset do ekranu głównego i pierwszej zakładki dopiero, gdy karta zjechała.
  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(() => {
      setScreen('main');
      setTab(0);
      setSwap('');
    }, RESET_AFTER_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Klawiatura: Escape cofa o poziom (decyzja A), Tab krąży w karcie.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (screen === 'offer') showScreen('main');
        else close();
        return;
      }
      if (e.key !== 'Tab' || !menuRef.current) return;
      const items = focusables(menuRef.current);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, screen, close, showScreen]);

  useCloseOnDesktop(isOpen, close, updateFade);

  const mainLink = (item: MmbMainLink, i: number) => {
    const Icon = item.icon;
    return (
      <li key={item.target} className="mmb-stg" style={stagger(i)}>
        <Link
          to={item.target}
          onClick={close}
          className="mmb-row"
          aria-current={current(isCurrentPage(path, item.target, item.prefix))}
        >
          <span className="mmb-tile">
            <Icon className="mmb-ico" size={20} aria-hidden="true" />
          </span>
          <span className="mmb-row-txt">
            <strong>{item.label}</strong>
          </span>
          <ChevronRight className="mmb-ico" size={20} aria-hidden="true" />
        </Link>
      </li>
    );
  };

  return (
    <div ref={layerRef} className={`mmb${isOpen ? ' is-open' : ''}`}>
      <div className="mmb-scrim" aria-hidden="true" onClick={close} />
      <div
        ref={menuRef}
        id="mobile-menu"
        className="mmb-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={T.dialog}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="mmb-handle" aria-hidden="true" {...dragZone} />
        <button
          ref={closeRef}
          className="mmb-close"
          type="button"
          aria-label={T.close}
          onClick={close}
        >
          <X className="mmb-ico" size={20} aria-hidden="true" />
        </button>

        <div className="mmb-screens">
          <nav
            className={`mmb-screen mmb-screen-main${offerActive ? '' : ' is-active'}${hasMore.main ? ' has-more' : ''}`}
            aria-label={T.mainNav}
            inert={offerActive}
          >
            <div className="mmb-head mmb-stg" style={stagger(0)} {...dragZone}>
              <p className="mmb-kicker">{T.kicker}</p>
            </div>
            <div ref={mainScrollRef} className="mmb-scroll" onScroll={updateFade}>
              <ul>
                {MMB_MAIN_BEFORE.map((item, i) => mainLink(item, i))}
                <li className="mmb-stg" style={stagger(2)}>
                  <button
                    ref={offerButtonRef}
                    className="mmb-row mmb-row-offer"
                    type="button"
                    aria-controls={OFFER_SCREEN_ID}
                    aria-expanded={offerActive}
                    onClick={() => showScreen('offer')}
                  >
                    <span className="mmb-tile">
                      <OfferIcon className="mmb-ico" size={20} aria-hidden="true" />
                    </span>
                    <span className="mmb-row-txt">
                      <strong>{CONTENT.offer.label}</strong>
                      <small>{T.offerSub}</small>
                    </span>
                    <span className="mmb-chip">
                      {MMB_SERVICE_COUNT}
                      <span className="sr-only">{T.services}</span>
                    </span>
                    <ChevronRight className="mmb-ico" size={20} aria-hidden="true" />
                  </button>
                </li>
                {MMB_MAIN_AFTER.map((item, i) => mainLink(item, i + 3))}
              </ul>
              <Link
                to={T.promoTarget}
                onClick={close}
                className="mmb-promo mmb-stg"
                style={stagger(5)}
                aria-current={current(isCurrentPage(path, T.promoTarget, true))}
              >
                <span className="mmb-promo-top">
                  <span className="mmb-kicker">{T.promoKicker}</span>
                  <ArrowRight className="mmb-ico" size={20} aria-hidden="true" />
                </span>
                <strong>{T.promoTitle}</strong>
                <span className="mmb-promo-sub">{T.promoSub}</span>
              </Link>
            </div>
          </nav>

          <MobileMenuBOffer
            active={offerActive}
            hasMore={hasMore.offer}
            tab={tab}
            swap={swap}
            path={path}
            dragZone={dragZone}
            scrollRef={offerScrollRef}
            titleRef={offerTitleRef}
            onScroll={updateFade}
            onBack={() => showScreen('main')}
            onSelectTab={selectTab}
            onNavigate={close}
          />
        </div>

        <div className="mmb-actions">
          <a
            className="mmb-btn mmb-btn-ghost mmb-stg"
            href={`tel:${SITE_CONFIG.contact.phoneFull}`}
            style={stagger(6)}
          >
            <Phone className="mmb-ico" size={20} aria-hidden="true" />
            <span>{T.call}</span>
          </a>
          <button
            className="mmb-btn mmb-btn-primary mmb-stg"
            type="button"
            style={stagger(7)}
            onClick={() => {
              openModal('consultation');
              close();
            }}
          >
            {CONTENT.mobileMenu.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuB;
