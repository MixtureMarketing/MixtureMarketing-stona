import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModal } from '@/context/ModalContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScroll } from '@/hooks/useScroll';
import NavbarLogo from './NavbarLogo';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import Container from '../common/Container';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  const { toggleScroll } = useBodyScrollLock();
  const { scrollToId } = useSmoothScroll();
  const { scrolled } = useScroll(20);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Blokada scrolla sprzęgnięta ze STANEM menu, nie z handlerami (bugfix
  // 2026-07-18): zamknięcie przez X, przez CTA konsultacji (bez zmiany trasy)
  // i przez linki z własnym setIsOpen(false) zostawiało body overflow:hidden
  // — strona losowo przestawała się scrollować na mobile. Jeden efekt =
  // każda ścieżka zamknięcia odblokowuje.
  useEffect(() => {
    toggleScroll(isOpen);
    return () => toggleScroll(false);
  }, [isOpen, toggleScroll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo(0, 0);
    setIsOpen(false);
  };

  const handleAnchorLink = (anchorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: anchorId } });
    } else {
      scrollToId(anchorId);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (location.state && (location.state as { scrollTo?: string }).scrollTo) {
      const anchorId = (location.state as { scrollTo?: string }).scrollTo as string;
      setTimeout(() => {
        scrollToId(anchorId);
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location, scrollToId]);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  // Escape zamyka otwarte mega menu (audyt menu 2026-07-16 — wcześniej
  // jedyną drogą było kliknięcie poza panelem albo zmiana trasy).
  useEffect(() => {
    if (activeDropdown === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeDropdown]);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleDropdownMobile = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const isAnyDropdownOpen = activeDropdown !== null;

  // Zamknij menu/dropdown przy zmianie route'a. Odblokowanie scrolla robi
  // efekt [isOpen] wyżej — tu tylko stan (wcześniejsze `if (prev) unlock`
  // gubiło odblokowanie, gdy link zdążył ustawić isOpen=false przed nawigacją).
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveDropdown(null);
      setIsOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <header>
      <nav
        aria-label="Główna nawigacja"
        className={`fixed w-full z-[var(--z-nav)] transition-all duration-300 h-20 flex items-center ${isAnyDropdownOpen ? 'bg-white shadow-lg' : scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-white/80 backdrop-blur-md border-b border-transparent'}`}
      >
        <Container className="w-full">
          <div className="flex justify-between items-center h-full">
            <NavbarLogo onClick={handleLogoClick} />

            <DesktopMenu
              activeDropdown={activeDropdown}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              setActiveDropdown={setActiveDropdown}
              handleAnchorLink={handleAnchorLink}
              openModal={openModal}
              dropdownRef={dropdownRef}
            />

            <div className="lg:hidden flex items-center">
              <button
                onClick={toggleMenu}
                /* z-[var(--z-tooltip)] (110) bo Mobile menu ma z-[var(--z-header)] (60)
                   z fixed inset-0 — bez wyzszego stacking button (zamykajacy X)
                   byl chowany pod tlem menu. */
                className="relative z-[var(--z-tooltip)] text-dark focus:outline-none p-2 w-12 h-12 flex flex-col justify-center items-center gap-1.5 group"
                aria-label={isOpen ? 'Zamknij menu nawigacyjne' : 'Otwórz menu nawigacyjne'}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                <span
                  className={`w-6 h-0.5 bg-dark rounded-full transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-2 bg-secondary' : ''}`}
                ></span>
                <span
                  className={`w-6 h-0.5 bg-dark rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 -translate-x-2' : ''}`}
                ></span>
                <span
                  className={`w-6 h-0.5 bg-dark rounded-full transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-2 bg-secondary' : ''}`}
                ></span>
              </button>
            </div>
          </div>
        </Container>
      </nav>

      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        activeDropdown={activeDropdown}
        toggleDropdownMobile={toggleDropdownMobile}
        handleAnchorLink={handleAnchorLink}
        location={location}
        openModal={openModal}
      />
    </header>
  );
};

export default Navbar;
