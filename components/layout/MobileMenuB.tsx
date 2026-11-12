import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Phone, X } from 'lucide-react';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';
import { SITE_CONFIG } from '@/config/site';
import Button from '@/components/common/Button';
import { MOBILE_MENU_DATA } from './navbarData';
import { ContactType } from '@/types';

// Wariant B menu mobilnego (MIX-1411, za przełącznikiem VITE_MM_MOBILE_MENU_B, patrz
// mobileMenuFlag.ts): płaska lista bez bloczków; „Oferta” otwiera drugi ekran ze strzałką
// „wstecz”. Oba ekrany są w DOM (nieaktywny ma `hidden`), więc linki zostają w HTML po prerenderze.

export const OFFER_SCREEN_ID = 'mobile-menu-offer';
const OFFER_TITLE_ID = 'mobile-menu-offer-title';

interface MobileMenuBProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  location: { pathname: string };
  openModal: (type: ContactType, data?: Record<string, unknown>) => void;
}

type Screen = 'main' | 'offer';

const ROW = 'flex items-center min-h-12 border-b border-gray-100';
const mainRow = (active: boolean) =>
  `${ROW} w-full py-2 text-2xl font-black ${active ? 'text-accent-dark' : 'text-dark'}`;

const MobileMenuB: React.FC<MobileMenuBProps> = ({ isOpen, setIsOpen, location, openModal }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [wasOpen, setWasOpen] = useState(isOpen);
  const scrollRef = useRef<HTMLDivElement>(null);
  const offerButtonRef = useRef<HTMLButtonElement>(null);
  const offerTitleRef = useRef<HTMLParagraphElement>(null);

  // Każde zamknięcie (X, link, Escape, zmiana trasy w Navbar) wraca do ekranu głównego.
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setScreen('main');
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsOpen(false);
      document.querySelector<HTMLElement>('button[aria-controls="mobile-menu"]')?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setIsOpen]);

  // Fokus po zmianie ekranu: wejście = nagłówek „Oferta”, powrót = przycisk „Oferta”.
  const showScreen = (next: Screen) => {
    flushSync(() => setScreen(next));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    (next === 'offer' ? offerTitleRef : offerButtonRef).current?.focus();
  };

  const close = () => setIsOpen(false);
  const path = location.pathname;

  return (
    <div
      id="mobile-menu"
      // z-[95]: nad przyciskiem ciasteczek (z-[90]), który zasłaniał „Darmowa Konsultacja”;
      // pod oknami (z-modal 100), które otwiera przycisk konsultacji.
      className={`lg:hidden fixed inset-0 z-[95] bg-white transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'} flex flex-col`}
      aria-hidden={!isOpen}
      role="navigation"
      aria-label="Menu mobilne"
    >
      <button
        type="button"
        onClick={close}
        className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-dark z-10"
        aria-label="Zamknij menu nawigacyjne"
      >
        <X size={22} aria-hidden="true" />
      </button>

      <div ref={scrollRef} className="flex-1 px-6 pt-5 pb-6 overflow-y-auto overflow-x-hidden">
        <ul hidden={screen !== 'main'} className="pt-[60px]">
          <li>
            <Link
              to="/o-nas/"
              onClick={close}
              className={mainRow(path === '/o-nas' || path === '/o-nas/')}
              aria-label="Przejdź do strony O nas"
            >
              {CONTENT.about}
            </Link>
          </li>
          <li>
            <Link
              to="/portfolio/"
              onClick={close}
              className={mainRow(path.startsWith('/portfolio'))}
              aria-label="Przejdź do strony realizacje"
            >
              {CONTENT.portfolio}
            </Link>
          </li>
          <li>
            <button
              ref={offerButtonRef}
              type="button"
              onClick={() => showScreen('offer')}
              className={`${mainRow(false)} justify-between`}
              aria-controls={OFFER_SCREEN_ID}
            >
              {CONTENT.offer.label}
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </li>
          <li>
            <Link
              to="/baza-wiedzy/"
              onClick={close}
              className={mainRow(path.startsWith('/baza-wiedzy'))}
              aria-label={`Przejdź do ${CONTENT.knowledgeBase.label.toLowerCase()}`}
            >
              {CONTENT.knowledgeBase.label}
            </Link>
          </li>
          <li>
            <Link
              to="/contact/"
              onClick={close}
              className={mainRow(path === '/contact' || path === '/contact/')}
              aria-label={`Przejdź do sekcji ${CONTENT.contact.toLowerCase()}`}
            >
              {CONTENT.contact}
            </Link>
          </li>
        </ul>

        <div
          id={OFFER_SCREEN_ID}
          role="group"
          aria-labelledby={OFFER_TITLE_ID}
          hidden={screen !== 'offer'}
        >
          <div className="flex items-center gap-1 h-12 pr-14">
            <button
              type="button"
              onClick={() => showScreen('main')}
              className="w-12 h-12 -ml-3 flex items-center justify-center text-dark"
              aria-label="Wróć do menu"
            >
              <ChevronLeft size={28} aria-hidden="true" />
            </button>
            <p
              id={OFFER_TITLE_ID}
              ref={offerTitleRef}
              tabIndex={-1}
              className="text-2xl font-black text-dark"
            >
              {CONTENT.offer.label}
            </p>
          </div>

          {MOBILE_MENU_DATA.map((section) => (
            <div key={section.target} className="mt-4">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200">
                <span className="text-xs font-black text-accent-dark uppercase tracking-wider">
                  {section.category}
                </span>
                <Link
                  to={section.target}
                  onClick={close}
                  className="min-h-11 inline-flex items-center gap-1 text-xs font-bold text-secondary text-right"
                  aria-label={`${CONTENT.mobileMenu.seeAll}: ${section.category}`}
                >
                  {CONTENT.mobileMenu.seeAll}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
              <ul>
                {section.items.map((item) => (
                  <li key={item.target}>
                    <Link
                      to={item.target}
                      onClick={close}
                      className="flex flex-col justify-center min-h-12 py-1.5 border-b border-gray-100"
                    >
                      <span className="text-sm font-bold text-dark">{item.label}</span>
                      <span className="text-xxs font-medium text-gray-700">{item.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pt-2 pb-5 bg-dark text-white">
        <a
          href={`tel:${SITE_CONFIG.contact.phoneFull}`}
          className="flex items-center justify-between gap-3 min-h-11 mb-2 text-sm"
        >
          <span>
            <span className="text-gray-300">{CONTENT.mobileMenu.question}</span>{' '}
            <span className="font-black">{SITE_CONFIG.contact.phone}</span>
          </span>
          <Phone size={20} aria-hidden="true" />
        </a>
        <Button
          variant="primary"
          className="w-full justify-center py-3 text-base rounded-2xl"
          onClick={() => {
            openModal('consultation');
            close();
          }}
        >
          {CONTENT.mobileMenu.cta}
          <ArrowRight size={20} className="ml-2" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default MobileMenuB;
